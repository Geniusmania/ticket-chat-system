
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mockUsers } from "@/data/mockData";

// Mock knowledge base articles
const mockKnowledgeBaseArticles = [
  {
    id: "kb-1",
    title: "How to reset your password",
    category: "account",
    createdAt: "2023-10-05T08:15:00Z",
    updatedAt: "2023-10-10T14:20:00Z",
    authorId: "user-1",
    preview: "This article explains the steps to reset your password if you've forgotten it...",
  },
  {
    id: "kb-2",
    title: "Understanding billing cycles",
    category: "billing",
    createdAt: "2023-09-20T10:30:00Z",
    updatedAt: "2023-09-22T09:45:00Z",
    authorId: "user-2",
    preview: "Learn about our billing cycles, when charges occur, and how to manage your payments...",
  },
  {
    id: "kb-3",
    title: "Troubleshooting common connection issues",
    category: "technical",
    createdAt: "2023-10-01T14:25:00Z",
    updatedAt: "2023-10-15T11:10:00Z",
    authorId: "user-1",
    preview: "If you're experiencing connection problems, follow these steps to diagnose and resolve the issue...",
  },
  {
    id: "kb-4",
    title: "How to contact support",
    category: "general",
    createdAt: "2023-09-15T16:40:00Z",
    updatedAt: "2023-09-15T16:40:00Z",
    authorId: "user-3",
    preview: "Learn about the different ways you can contact our support team for assistance...",
  },
  {
    id: "kb-5",
    title: "Account security best practices",
    category: "account",
    createdAt: "2023-10-12T13:20:00Z",
    updatedAt: "2023-10-14T09:30:00Z",
    authorId: "user-2",
    preview: "Follow these security best practices to keep your account safe from unauthorized access...",
  },
];

const AdminKnowledgeBase = () => {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter knowledge base articles
  const filteredArticles = mockKnowledgeBaseArticles.filter((article) => {
    const matchesCategory = filterCategory === "all" || article.category === filterCategory;
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.preview.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getAuthorName = (authorId: string) => {
    const author = mockUsers.find((user) => user.id === authorId);
    return author ? author.name : "Unknown Author";
  };

  const handleEditArticle = (articleId: string) => {
    navigate(`/admin/knowledge-base/${articleId}`);
  };

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      // In a real app, delete from Supabase
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Article deleted",
        description: `Article "${selectedArticle.title}" has been deleted successfully.`,
      });
      
      // Update UI by filtering out the deleted article
      // In a real app, you would refetch from the database
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedArticle(null);
    }
  };

  const openDeleteDialog = (article) => {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Knowledge Base Management</h1>
        <p className="text-muted-foreground">
          Create and manage help articles for users
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select
            value={filterCategory}
            onValueChange={setFilterCategory}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          <Button className="whitespace-nowrap" onClick={() => navigate("/admin/knowledge-base/new")}>
            <Plus className="h-4 w-4 mr-2" /> New Article
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Articles</CardTitle>
          <CardDescription>
            {filteredArticles.length} articles found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col md:flex-row md:items-start p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <h3 className="font-medium">{article.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-muted">
                      {article.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {article.preview}
                  </p>
                  <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-2">
                    <span>By {getAuthorName(article.authorId)}</span>
                    <span>•</span>
                    <span>Created: {formatDate(article.createdAt)}</span>
                    <span>•</span>
                    <span>Updated: {formatDate(article.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex mt-3 md:mt-0 space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditArticle(article.id)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(article)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-1">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedArticle?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminKnowledgeBase;

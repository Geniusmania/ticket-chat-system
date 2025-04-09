
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { mockKnowledgeBase } from "@/data/mockData";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; 
import { KnowledgeBase } from "@/types";

const AdminKnowledgeBaseEditor = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const isNewArticle = articleId === "new";

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [article, setArticle] = useState<KnowledgeBase>({
    id: "",
    title: "",
    content: "",
    category: "general",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (isNewArticle) return;

    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        // Try to get from Supabase first
        const { data, error } = await supabase
          .from("knowledge_base")
          .select("*")
          .eq("id", articleId)
          .single();

        if (error || !data) {
          // Fall back to mock data
          const mockArticle = mockKnowledgeBase.find(a => a.id === articleId);
          if (mockArticle) {
            setArticle(mockArticle);
          } else {
            toast({
              title: "Article not found",
              description: "The requested article could not be found.",
              variant: "destructive",
            });
            navigate("/admin/knowledge-base");
          }
        } else {
          setArticle({
            id: data.id,
            title: data.title,
            content: data.content,
            category: data.category,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            authorId: data.author_id,
          });
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast({
          title: "Error",
          description: "Failed to load article. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, isNewArticle, navigate]);

  const handleChange = (key: keyof KnowledgeBase, value: string) => {
    setArticle((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!article.title || !article.content) {
      toast({
        title: "Validation error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      if (isNewArticle) {
        // Create new article
        const { data, error } = await supabase
          .from("knowledge_base")
          .insert({
            title: article.title,
            content: article.content,
            category: article.category,
          })
          .select()
          .single();
          
        if (error) throw error;
        
        toast({
          title: "Article created",
          description: "The knowledge base article has been created successfully.",
        });
        
        navigate(`/admin/knowledge-base/${data.id}`);
      } else {
        // Update existing article
        const { error } = await supabase
          .from("knowledge_base")
          .update({
            title: article.title,
            content: article.content,
            category: article.category,
            updated_at: new Date().toISOString(),
          })
          .eq("id", articleId);
          
        if (error) throw error;
        
        toast({
          title: "Article updated",
          description: "The knowledge base article has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    
    try {
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", articleId);
        
      if (error) throw error;
      
      toast({
        title: "Article deleted",
        description: "The knowledge base article has been deleted.",
      });
      
      navigate("/admin/knowledge-base");
    } catch (error: any) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/knowledge-base")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNewArticle ? "Create New Article" : "Edit Article"}</CardTitle>
          <CardDescription>
            {isNewArticle
              ? "Create a new knowledge base article to help users resolve common issues."
              : "Edit an existing knowledge base article."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={article.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Article title"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <Select
              value={article.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={article.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Article content"
              className="min-h-[300px]"
            />
            <p className="text-sm text-muted-foreground">
              Supports plain text formatting. For more complex formatting, consider using markdown.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isNewArticle && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete Article
            </Button>
          )}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/knowledge-base")}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Article"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminKnowledgeBaseEditor;

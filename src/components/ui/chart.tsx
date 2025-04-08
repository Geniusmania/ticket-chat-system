
import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

// BarChart component
interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[];
  xAxisKey: string;
  yAxisKey: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  height?: number;
  colors?: string[];
}

export const BarChart = ({
  data,
  xAxisKey,
  yAxisKey,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  height = 300,
  colors = ["#2563eb"],
  className,
  ...props
}: BarChartProps) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={false} 
            axisLine={false}
          />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Bar dataKey={yAxisKey} radius={[4, 4, 0, 0]}>
            {data.map((_entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// PieChart component
interface PieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[];
  dataKey: string;
  nameKey: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  height?: number;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
}

export const PieChart = ({
  data,
  dataKey,
  nameKey,
  showTooltip = true,
  showLegend = false,
  height = 300,
  colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
  innerRadius = 0,
  outerRadius = 80,
  className,
  ...props
}: PieChartProps) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          {showTooltip && <Tooltip />}
          {showLegend && 
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
            />
          }
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            label
          >
            {data.map((_entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// LineChart component
interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[];
  xAxisKey: string;
  dataKeys: string[];
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  height?: number;
  colors?: string[];
}

export const LineChart = ({
  data,
  xAxisKey,
  dataKeys,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  height = 300,
  colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
  className,
  ...props
}: LineChartProps) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={false} 
            axisLine={false}
          />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

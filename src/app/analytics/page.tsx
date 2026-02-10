"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";

interface OccupancyTrendItem {
  date: string;
  actual: number;
  forecasted: number;
}

interface RevenueTrendItem {
  hour: string;
  revenue: number;
  target: number;
}

interface StaffingEfficiencyItem {
  name: string;
  value: number;
}

interface AnalyticsDataType {
  accuracy: number;
  avgError: number;
  occupancyTrend: OccupancyTrendItem[];
  revenueTrend: RevenueTrendItem[];
  staffingEfficiency: StaffingEfficiencyItem[];
}

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ size: number }>;
}

const StatCard = ({ title, value, change, icon: Icon }: StatCardProps): React.JSX.Element => (
  <div className="card">
    <div className="card-title">
      <Icon size={16} />
      <span>{title}</span>
    </div>
    <div className="card-value">{value}</div>
    <div style={{ color: change >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 600 }}>
      {change >= 0 ? '+' : ''}{change}% vs last period
    </div>
  </div>
);

const initialAnalyticsData: AnalyticsDataType = {
  accuracy: 87,
  avgError: 12,
  occupancyTrend: [
    { date: 'Mon', actual: 80, forecasted: 82 },
    { date: 'Tue', actual: 75, forecasted: 78 },
    { date: 'Wed', actual: 88, forecasted: 85 },
    { date: 'Thu', actual: 92, forecasted: 90 },
    { date: 'Fri', actual: 95, forecasted: 94 },
    { date: 'Sat', actual: 98, forecasted: 97 },
    { date: 'Sun', actual: 85, forecasted: 87 },
  ],
  revenueTrend: [
    { hour: '18:00', revenue: 1200, target: 1100 },
    { hour: '19:00', revenue: 1800, target: 1700 },
    { hour: '20:00', revenue: 2100, target: 2000 },
    { hour: '21:00', revenue: 1600, target: 1500 },
    { hour: '22:00', revenue: 1100, target: 1000 },
  ],
  staffingEfficiency: [
    { name: 'Optimal', value: 65 },
    { name: 'Overstaff', value: 20 },
    { name: 'Understaff', value: 15 },
  ],
};

export default function AnalyticsPage() {
  const [analyticsData] = useState<AnalyticsDataType>(initialAnalyticsData);

  const COLORS = ['#3b82f6', '#ec4899', '#f59e0b'];

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <header className="header" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" className="nav-link" style={{ padding: '0.5rem' }}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="page-title">Analytics & Performance</h1>
              <p style={{ color: '#94a3b8' }}>Forecast accuracy and operational metrics</p>
            </div>
          </div>
        </header>

        <section className="grid">
          <StatCard title="Forecast Accuracy" value={`${analyticsData.accuracy}%`} change={+5} icon={TrendingUp} />
          <StatCard title="Avg. Prediction Error" value={`${analyticsData.avgError}%`} change={-2} icon={TrendingDown} />
        </section>

        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="card-title">Occupancy: Actual vs Forecasted (7-Day)</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.occupancyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="forecasted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="card-title">Revenue Performance by Hour</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" />
                <Bar dataKey="target" fill="#94a3b8" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Staffing Efficiency Distribution</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.staffingEfficiency}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.staffingEfficiency.map((entry: StaffingEfficiencyItem, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}

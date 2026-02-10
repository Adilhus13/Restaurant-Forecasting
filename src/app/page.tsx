"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  LayoutDashboard, 
  Database, 
  Settings,
  ChevronRight,
  Download,
  Filter
} from "lucide-react";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ForecastItem {
  hour: string;
  guests: number;
  orders: number;
}

interface LaborItem {
  hour: string;
  hosts: number;
  servers: number;
  kitchen: number;
  confidence: string;
}

interface SidebarItemProps {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active = false }: SidebarItemProps): React.JSX.Element => (
  <Link href={href} className={`nav-link ${active ? 'active' : ''}`}>
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size: number }>;
  trend?: string;
}

const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps): React.JSX.Element => (
  <div className="card">
    <div className="card-title">
      <Icon size={16} />
      <span>{title}</span>
    </div>
    <div className="card-value">{value}</div>
    {trend && (
      <div style={{ color: '#22c55e', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 600 }}>
        {trend} vs last week
      </div>
    )}
  </div>
);

const MOCK_FORECAST_DATA: ForecastItem[] = [
  { hour: '08:00', guests: 12, orders: 8 },
  { hour: '10:00', guests: 15, orders: 10 },
  { hour: '12:00', guests: 45, orders: 32 },
  { hour: '14:00', guests: 22, orders: 18 },
  { hour: '16:00', guests: 18, orders: 14 },
  { hour: '18:00', guests: 65, orders: 48 },
  { hour: '20:00', guests: 55, orders: 42 },
  { hour: '22:00', guests: 20, orders: 15 },
];

const MOCK_LABOR_DATA: LaborItem[] = [
  { hour: '18:00', hosts: 2, servers: 6, kitchen: 4, confidence: 'high' },
  { hour: '19:00', hosts: 3, servers: 8, kitchen: 5, confidence: 'high' },
  { hour: '20:00', hosts: 2, servers: 7, kitchen: 4, confidence: 'medium' },
  { hour: '21:00', hosts: 1, servers: 4, kitchen: 3, confidence: 'high' },
];

export default function Dashboard() {
  const pathname = usePathname();
  const [forecastData] = useState<ForecastItem[]>(MOCK_FORECAST_DATA);
  const [laborData] = useState<LaborItem[]>(MOCK_LABOR_DATA);

  const handleExport = (): void => {
    const parts: string[] = [];
    parts.push('"Export Plan"');
    parts.push(`Generated at:,${new Date().toISOString()}`);
    parts.push('');

    parts.push('Forecast');
    parts.push(['Hour', 'Guests', 'Orders'].join(','));
    forecastData.forEach((f: ForecastItem) => {
      parts.push([f.hour, f.guests, f.orders].join(','));
    });
    parts.push('');

    parts.push('Labor Plan');
    parts.push(['Time Slot', 'Hosts', 'Servers', 'Kitchen', 'Confidence'].join(','));
    laborData.forEach((l: LaborItem) => {
      parts.push([l.hour, l.hosts, l.servers, l.kitchen, l.confidence].join(','));
    });

    const csv = parts.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-plan-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-title">
          <TrendingUp size={28} />
          <span>Antigravity Ops</span>
        </div>
        
        <nav className="nav-links">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/" active={pathname === "/"} />
          <SidebarItem icon={Database} label="Data Ingestion" href="/ingestion" active={pathname === "/ingestion"} />
          <SidebarItem icon={Filter} label="Analytics" href="/analytics" />
          <SidebarItem icon={Settings} label="Settings" href="/settings" />
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="page-title">Operational Forecast</h1>
            <p style={{ color: '#94a3b8' }}>Location: Downtown Bistro • Tuesday, Feb 10</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => handleExport()}
              title="Export the current plan as CSV"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={16} />
              Export Plan
            </button>
          </div>
        </header>

        <section className="grid">
          <StatCard title="Forecasted Guests" value="452" icon={Users} trend="+12%" />
          <StatCard title="Projected Orders" value="318" icon={TrendingUp} trend="+8%" />
          <StatCard title="Peak Hour" value="19:00" icon={Clock} />
        </section>

        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="card-title">Hourly Demand Projection (Next 24 Hours)</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="guests" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGuests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="card-title" style={{ margin: 0 }}>Labor Recommendation</h2>
            <div className="badge badge-high">Forecasting Engine</div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Hosts</th>
                  <th>Servers</th>
                  <th>Kitchen</th>
                  <th>Confidence</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {laborData.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.hour}</td>
                    <td>{row.hosts}</td>
                    <td>{row.servers}</td>
                    <td>{row.kitchen}</td>
                    <td>
                      <span className={`badge badge-${row.confidence}`}>
                        {row.confidence.charAt(0).toUpperCase() + row.confidence.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button className="nav-link" style={{ padding: '0.25rem 0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

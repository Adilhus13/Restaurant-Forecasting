"use client";

import React, { useState } from "react";
import { 
  Database, 
  Upload, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft 
} from "lucide-react";

export default function IngestionPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setStatus("loading");
    try {
      const resp = await fetch("/api/demand/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: "loc-downtown-01",
          groupName: "Antigravity Group",
          locationName: "Downtown Bistro"
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setStatus("success");
        setMessage(`Success! Generated ${data.eventCount} historical events.`);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message);
    }
  };

  return (
    <div className="dashboard-container" style={{ backgroundColor: '#0f172a' }}>
      <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header className="header" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/" className="nav-link" style={{ padding: '0.5rem' }}>
              <ArrowLeft size={20} />
            </a>
            <div>
              <h1 className="page-title">Data Ingestion</h1>
              <p style={{ color: '#94a3b8' }}>Populate your forecast engine with historical data</p>
            </div>
          </div>
        </header>

        <section className="grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={20} color="#3b82f6" />
              Seed Synthetic Data
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
              Generate 60 days of synthetic demand events to test the forecasting and labor engines immediately.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={handleSeed}
              disabled={status === 'loading'}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}
            >
              {status === 'loading' ? <RefreshCcw className="animate-spin" size={20} /> : <Database size={20} />}
              Generate 60-Day Sample Dataset
            </button>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={20} color="#3b82f6" />
              CSV Upload (Historical)
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
              Upload your POS export (CSV) to ingest real historical demand and improve forecast accuracy.
            </p>
            <div style={{ 
              border: '2px dashed #334155', 
              borderRadius: 'var(--radius)', 
              padding: '3rem', 
              textAlign: 'center',
              backgroundColor: 'rgba(51, 65, 85, 0.2)'
            }}>
              <Upload size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#94a3b8' }}>Drag and drop your CSV file here, or click to browse</p>
              <button className="btn" style={{ marginTop: '1.5rem', backgroundColor: '#334155', color: '#f8fafc' }}>
                Select File
              </button>
            </div>
          </div>
        </section>

        {status === 'success' && (
          <div className="card" style={{ borderColor: '#22c55e', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle2 color="#22c55e" size={24} />
            <span>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="card" style={{ borderColor: '#ef4444', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle color="#ef4444" size={24} />
            <span>Error: {message}</span>
          </div>
        )}
      </main>
    </div>
  );
}

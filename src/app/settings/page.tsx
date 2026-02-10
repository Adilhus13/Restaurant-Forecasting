"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    locationName: "Downtown Bistro",
    guestsPerServer: 4,
    tablesPerHost: 8,
    ordersPerKitchen: 12,
    minHosts: 1,
    minServers: 2,
    minKitchen: 1,
    forecastHorizon: 7,
    confidenceThreshold: 0.75,
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const resp = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // For local dev: send mock user with admin role
          'x-user': JSON.stringify({ id: 'u-admin', role: 'admin' })
        },
        body: JSON.stringify({
          locationId: 'loc-downtown-01',
          guestsPerServer: settings.guestsPerServer,
          tablesPerHost: settings.tablesPerHost,
          ordersPerKitchen: settings.ordersPerKitchen,
          minHosts: settings.minHosts,
          minServers: settings.minServers,
          minKitchen: settings.minKitchen,
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to save');
      setSaved(true);
      setError("");
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const SettingField = ({ label, field, type = "text", help }: any) => (
    <div style={{ marginBottom: "2rem" }}>
      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#f8fafc" }}>
        {label}
      </label>
      <input
        type={type}
        value={settings[field as keyof typeof settings]}
        onChange={(e) => handleChange(field, type === "number" ? parseFloat(e.target.value) : e.target.value)}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "var(--radius)",
          color: "#f8fafc",
          fontSize: "1rem",
        }}
      />
      {help && <p style={{ marginTop: "0.5rem", color: "#94a3b8", fontSize: "0.875rem" }}>{help}</p>}
    </div>
  );

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <header className="header" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/" className="nav-link" style={{ padding: "0.5rem" }}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="page-title">Settings</h1>
              <p style={{ color: "#94a3b8" }}>Configure location parameters and forecasting options</p>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: "600px" }}>
          {saved && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                border: "1px solid #22c55e",
                borderRadius: "var(--radius)",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "#22c55e",
              }}
            >
              <CheckCircle2 size={20} />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid #ef4444",
                borderRadius: "var(--radius)",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "#ef4444",
              }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2 className="card-title" style={{ marginBottom: "2rem" }}>
              Location Configuration
            </h2>

            <SettingField
              label="Location Name"
              field="locationName"
              help="Display name for this restaurant location"
            />
            <SettingField
              label="Guests per Server"
              field="guestsPerServer"
              type="number"
              help="Average number of guests one server can handle"
            />
            <SettingField
              label="Tables per Host"
              field="tablesPerHost"
              type="number"
              help="Average number of tables one host can manage"
            />
            <SettingField
              label="Orders per Kitchen Staff"
              field="ordersPerKitchen"
              type="number"
              help="Average orders one kitchen staff member can handle per hour"
            />
          </div>

          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2 className="card-title" style={{ marginBottom: "2rem" }}>
              Minimum Staffing Levels
            </h2>

            <SettingField
              label="Minimum Hosts"
              field="minHosts"
              type="number"
              help="Minimum number of hosts required at any time"
            />
            <SettingField
              label="Minimum Servers"
              field="minServers"
              type="number"
              help="Minimum number of servers required at any time"
            />
            <SettingField
              label="Minimum Kitchen Staff"
              field="minKitchen"
              type="number"
              help="Minimum number of kitchen staff required at any time"
            />
          </div>

          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2 className="card-title" style={{ marginBottom: "2rem" }}>
              Forecasting Options
            </h2>

            <SettingField
              label="Forecast Horizon (Days)"
              field="forecastHorizon"
              type="number"
              help="Number of days ahead to generate forecasts"
            />
            <SettingField
              label="Confidence Threshold"
              field="confidenceThreshold"
              type="number"
              help="Minimum confidence score (0.0 - 1.0) required for recommendations"
            />
          </div>

          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "1rem" }}
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </main>
    </div>
  );
}

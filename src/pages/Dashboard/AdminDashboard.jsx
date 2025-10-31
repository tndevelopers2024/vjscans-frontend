import React, { useEffect, useState } from "react";
import { PatientAuthAPI, PatientAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../layouts/PatientLayout";
import { ChevronRight } from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const me = await PatientAuthAPI.getMe();
      setPatient(me.data.data);

      const visitRes = await PatientAPI.getVisits(me.data.data._id);
      setVisits(visitRes.data.data);
    } catch (err) {
      navigate("/patient/login");
    }
    setLoading(false);
  };

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const totalVisits = visits.length;
  const completedReports = visits.filter((v) => v.reportFileUrl).length;
  const pendingReports = totalVisits - completedReports;

  return (
    <PatientLayout>
      <div>
        {/* ✅ PAGE HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.subtitle}>Welcome back, {patient.fullName}</p>
          </div>
        </div>

        {/* ✅ STATS GRID */}
        <div style={styles.statsGrid}>
          <StatCard label="Total Visits" value={totalVisits} />
          <StatCard label="Reports Ready" value={completedReports} />
          <StatCard label="Pending Reports" value={pendingReports} />
          <StatCard
            label="Last Visit"
            value={
              visits[0]
                ? new Date(visits[0].createdAt).toLocaleDateString()
                : "—"
            }
          />
        </div>

        {/* ✅ QUICK ACCESS */}
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Quick Access</h3>

          <QuickItem
            title="My Visits"
            onClick={() => navigate("/patient/visits")}
          />
          <QuickItem
            title="My Reports"
            onClick={() => navigate("/patient/reports")}
          />
          <QuickItem
            title="Profile"
            onClick={() => navigate("/patient/profile")}
          />
        </div>

        {/* ✅ RECENT VISITS */}
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Recent Visits</h3>

          {/* ✅ Mobile view */}
          <div className="mobile-only">
            {visits.map((v) => (
              <div
                key={v.visitId}
                style={styles.cardMobile}
                onClick={() => navigate(`/patient/visit/${v.visitId}`)}
              >
                <div>
                  <p style={styles.visitId}>#{v.visitId}</p>
                  <p style={styles.visitSub}>
                    {v.tests?.length} tests • ₹{v.finalAmount}
                  </p>

                  <span
                    style={{
                      ...styles.statusBadge,
                      background:
                        v.status === "Report Ready"
                          ? "#4ade80"
                          : v.status === "Processing"
                          ? "#fbbf24"
                          : "#94a3b8",
                    }}
                  >
                    {v.status}
                  </span>
                </div>

                <ChevronRight size={20} color="#999" />
              </div>
            ))}
          </div>

          {/* ✅ Desktop table */}
          <table style={styles.table} className="desktop-only">
            <thead>
              <tr>
                <th>Visit ID</th>
                <th>Status</th>
                <th>Tests</th>
                <th>Amount</th>
                <th>Report</th>
              </tr>
            </thead>

            <tbody>
              {visits.map((v) => (
                <tr key={v.visitId}>
                  <td>#{v.visitId}</td>
                  <td>{v.status}</td>
                  <td>{v.tests?.length}</td>
                  <td>₹{v.finalAmount}</td>
                  <td>
                    {v.reportFileUrl ? (
                      <a href={v.reportFileUrl} style={styles.linkBlue}>
                        Download
                      </a>
                    ) : (
                      <span style={{ color: "#999" }}>Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{responsiveCSS}</style>
    </PatientLayout>
  );
}

/* ✅ Small reusable components */
function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <h2 style={styles.statValue}>{value}</h2>
    </div>
  );
}

function QuickItem({ title, onClick }) {
  return (
    <div style={styles.quickItem} onClick={onClick}>
      <span>{title}</span>
      <ChevronRight size={18} color="#777" />
    </div>
  );
}

/* ✅ Styles */
const styles = {
  loading: { padding: 40, textAlign: "center", fontSize: 18 },

  header: {
    marginBottom: 25,
  },
  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    marginTop: 5,
    color: "#6b7280",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },

  statCard: {
    background: "#fff",
    padding: 22,
    borderRadius: 16,
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  },
  statLabel: { margin: 0, color: "#6b7280", fontSize: 14 },
  statValue: { margin: 0, fontSize: 28, fontWeight: 700, marginTop: 8 },

  sectionCard: {
    background: "#fff",
    padding: 22,
    borderRadius: 16,
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
    marginBottom: 30,
  },

  sectionTitle: {
    margin: 0,
    marginBottom: 15,
    fontSize: 20,
  },

  quickItem: {
    padding: 15,
    background: "#f5f6fa",
    borderRadius: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    cursor: "pointer",
  },

  /* ✅ Mobile card view */
  cardMobile: {
    background: "#fff",
    padding: 16,
    borderRadius: 14,
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
    cursor: "pointer",
  },
  visitId: { margin: 0, fontSize: 16, fontWeight: 600 },
  visitSub: { margin: "4px 0", fontSize: 13, color: "#777" },

  statusBadge: {
    padding: "4px 10px",
    borderRadius: 8,
    color: "#fff",
    fontSize: 12,
    display: "inline-block",
    marginTop: 5,
  },

  linkBlue: { color: "#2563eb", textDecoration: "underline" },

  /* ✅ Desktop table */
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
    fontSize: 15,
  },
};

/* ✅ RESPONSIVE CSS */
const responsiveCSS = `
  @media (max-width: 900px) {
    .desktop-only { display: none; }
    .mobile-only { display: block; }
  }
  @media (min-width: 900px) {
    .mobile-only { display: none; }
  }
`;

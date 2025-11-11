import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PatientAPI } from "../../utils/api";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  message,
  Avatar,
} from "antd";
import Barcode from "react-barcode";

const { Panel } = Collapse;

const BRAND_BLUE = "#1E5FAF";
const BRAND_ORANGE = "#F28A1F";

const statusTag = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("completed")) return <Tag color="green">Completed</Tag>;
  if (s.includes("ready")) return <Tag color="blue">Report Ready</Tag>;
  if (s.includes("progress") || s.includes("collection"))
    return <Tag color="gold">In Progress</Tag>;
  if (s.includes("pending")) return <Tag color="default">Pending</Tag>;
  return <Tag>{status || "—"}</Tag>;
};

const currency = (n) =>
  typeof n === "number"
    ? n.toLocaleString("en-IN", { style: "currency", currency: "INR" })
    : "—";

const dateFmt = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hidden print refs
// Hidden print refs
const printAllRef = useRef(null);

const [singleVisitToPrint, setSingleVisitToPrint] = useState(null);
const printSingleRef = useRef(null);

// ✅ NEW — Barcode-only print references
// ✅ NEW: Barcode-only print state + ref
const [barcodeVisitToPrint, setBarcodeVisitToPrint] = useState(null);
const printBarcodeRef = useRef(null);


  useEffect(() => {
    (async () => {
      try {
        const res = await PatientAPI.getById(id);
        setPatient(res.data.data);
      } catch (e) {
        console.error(e);
        message.error("Unable to load patient.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const visits = useMemo(() => patient?.visits || [], [patient]);
  const latestVisitKey = visits.length ? (visits[visits.length - 1].visitId) : null;
  const stats = useMemo(() => {
    const count = visits.length;
    const last = count ? visits[count - 1] : null;
    return {
      count,
      lastDate: last?.visitDate || null,
      lastStatus: last?.status || "—",
      lastAmount: last?.finalAmount ?? null,
    };
  }, [visits]);

  const testsColumns = [
    { title: "Test", dataIndex: "name", key: "name" },
    { title: "Sample", dataIndex: "sampleType", key: "sampleType", render: (v) => v || "—" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (v) => currency(v),
    },
  ];

  const packagesColumns = [
    { title: "Package", dataIndex: "name", key: "name" },
    {
      title: "Final Price",
      dataIndex: "finalPrice",
      key: "finalPrice",
      align: "right",
      render: (v) => currency(v),
    },
  ];

  const handlePrintAll = () => {
    if (!patient) return;
    const html = buildPrintShell({
      title: `Patient Report - ${patient.fullName}`,
      body: printAllRef.current?.outerHTML || "",
    });
    openPrintWindow(html);
  };

  const handlePrintSingleVisit = (visit) => {
    if (!patient || !visit) return;
    setSingleVisitToPrint(visit);
    // Wait a microtask for hidden DOM to render with Barcode SVG
    setTimeout(() => {
      const html = buildPrintShell({
        title: `Report - ${patient.fullName} (${visit.visitId})`,
        body: printSingleRef.current?.outerHTML || "",
      });
      openPrintWindow(html);
    }, 0);
  };

const handlePrintBarcode = (visit) => {
  if (!patient || !visit) return;
  setBarcodeVisitToPrint(visit);

  setTimeout(() => {
    const html = buildPrintShell({
      title: `Barcode - ${visit.visitId}`,
      body: printBarcodeRef.current?.outerHTML || "",
    });
    openPrintWindow(html);
  }, 0);
};



  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-10 h-10 border-4 border-[#1E5FAF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <Empty description="Patient not found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          onClick={() => navigate(-1)}
          className="text-[#1E5FAF] "
        >
          Back
        </Button>

        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrintAll}
            className="border-[#1E5FAF] text-[#1E5FAF]"
          >
            Print All
          </Button>

        </Space>
        
      </div>

      {/* Patient Summary (EMR style) */}
      <Card className="rounded-2xl shadow-md">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <Space size={16} align="center">
              <Avatar
                size={72}
                style={{
                  background: BRAND_BLUE,
                  boxShadow: "0 6px 18px rgba(30,95,175,0.25)",
                }}
                icon={<UserOutlined />}
              />
              <div>
                <div className="text-xl font-semibold text-[#0F3F73]">
                  {patient.fullName}
                </div>
                <div className="text-gray-500">Patient ID: {patient.patientId}</div>
                <div className="text-gray-500">Created: {dateFmt(patient.createdAt)}</div>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={10}>
            <Descriptions column={1} size="small" labelStyle={{ color: "#64748B" }}>
              <Descriptions.Item label="Mobile">
                <Space size={8}>
                  <PhoneOutlined />
                  {patient.mobile || "—"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space size={8}>
                  <MailOutlined />
                  {patient.email || "—"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <Space size={8} align="start">
                  <EnvironmentOutlined />
                  <span className="whitespace-pre-line">
                    {patient.address || "—"}
                    {patient.city ? `, ${patient.city}` : ""}
                    {patient.state ? `, ${patient.state}` : ""}
                    {patient.pincode ? `, ${patient.pincode}` : ""}
                  </span>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} md={6}>
            <Row gutter={12}>
              <Col span={12}>
                <Card size="small" className="rounded-xl shadow-sm">
                  <Statistic title="Visits" value={stats.count} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="rounded-xl shadow-sm">
                  <Statistic
                    title="Last Visit"
                    valueRender={() => (
                      <span className="text-sm">{dateFmt(stats.lastDate)}</span>
                    )}
                  />
                </Card>
              </Col>
              <Col span={24} className="mt-3">
                <Space>
                  <Tag color="blue" icon={<CalendarOutlined />}>
                    {stats.lastStatus}
                  </Tag>
                  {stats.lastAmount != null && (
                    <Tag color="green">{currency(stats.lastAmount)}</Tag>
                  )}
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Visits (collapsible EMR sections) */}
      <div className="pt-8">
        <div className="text-xl font-semibold text-[#1E5FAF] mb-6">Visit History</div>

        {visits.length === 0 ? (
          <Empty description="No visits" />
        ) : (
          <Collapse
  accordion
  defaultActiveKey={latestVisitKey}
  className="bg-transparent"
  items={visits.map((v, idx) => ({
    key: v.visitId || String(idx),
    label: (
                <div className="flex items-center justify-between pr-2">
                  <Space size={12} align="center">
                    <Tag color="purple">{v.visitId}</Tag>
                    <span className="text-gray-600">{dateFmt(v.visitDate)}</span>
                  </Space>
                  <Space size={16} align="center">
                    {statusTag(v.status)}
                    <span className="text-gray-500">
                      {v.bookingType} · {v.bookedBy}
                    </span>
                  </Space>
                </div>
              ),
              children: (
                <Card className="rounded-xl shadow-sm">
                  <Row gutter={[24, 24]}>
                    {/* Tests */}
                    <Col xs={24} lg={12}>
                      <div className="font-medium text-gray-700 mb-2">Tests</div>
                      <Table
                        size="small"
                        rowKey={(r) => r._id}
                        columns={testsColumns}
                        dataSource={v.tests || []}
                        pagination={false}
                        locale={{ emptyText: "No tests" }}
                      />
                    </Col>

                    {/* Packages */}
                    <Col xs={24} lg={12}>
                      <div className="font-medium text-gray-700 mb-2">Packages</div>
                      <Table
                        size="small"
                        rowKey={(r) => r._id}
                        columns={packagesColumns}
                        dataSource={v.packages || []}
                        pagination={false}
                        locale={{ emptyText: "No packages" }}
                      />
                    </Col>

                    <Col span={24}>
                      <Divider className="my-3" />
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space size={10}>
                            <Tag color="cyan">Total: {currency(v.totalAmount)}</Tag>
                            <Tag color="orange">
                              Discount: {v.discount ? `${v.discount}%` : "0%"}
                            </Tag>
                            <Tag color="green">Payable: {currency(v.finalAmount)}</Tag>
                          </Space>
                        </Col>
                        <Col>
                          <Space>
                            {v.reportFileUrl && v.status?.toLowerCase().includes("completed") && (
                              <Button
                                icon={<DownloadOutlined />}
                                href={`https://vj-scans.shop${v.reportFileUrl}`}
                                target="_blank"
                              >
                                Download Report
                              </Button>
                            )}

                            <Button
                              icon={<PrinterOutlined />}
                              type="primary"
                              style={{ background: BRAND_BLUE }}
                              onClick={() => handlePrintSingleVisit(v)}
                            >
                              Print Visit
                            </Button>

                           <Button
  icon={<PrinterOutlined />}
  onClick={() => handlePrintBarcode(v)}
>
  Print Barcode
</Button>


                          </Space>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              ),
            }))}
          />
        )}
      </div>

      {/* ----------------------- PRINT TEMPLATES (hidden) ----------------------- */}
      {/* A) Print All Visits */}
      <div style={{ display: "none" }}>
        <A4PrintAll ref={printAllRef} patient={patient} />
      </div>

      {/* B) Print Single Visit (rendering the currently chosen visit) */}
      <div style={{ display: "none" }}>
        {singleVisitToPrint && (
          <A4PrintSingle ref={printSingleRef} patient={patient} visit={singleVisitToPrint} />
        )}
      </div>

      {/* ✅ C) Print Barcode Only */}
<div style={{ display: "none" }}>
  {barcodeVisitToPrint && (
    <A4PrintBarcode
      ref={printBarcodeRef}
      patient={patient}
      visit={barcodeVisitToPrint}
    />
  )}
</div>
    </div>
  );
}

/* ---------------------------- PRINT COMPONENTS ---------------------------- */

const A4Shell = ({ children }) => {
  // Wrapper only; real print CSS injected in buildPrintShell()
  return (
    <div className="a4">
      {children}
    </div>
  );
};

// Print ALL visits
const A4PrintAll = React.forwardRef(({ patient }, ref) => (
  <A4Shell>
    <div ref={ref}>
      <PrintHeader />
      <PatientBlock patient={patient} />
      {patient.visits?.map((v) => (
        <VisitBlock key={v.visitId} visit={v} patient={patient} />
      ))}
      <FooterNote />
    </div>
  </A4Shell>
));

// Print SINGLE visit
const A4PrintSingle = React.forwardRef(({ patient, visit }, ref) => (
  <A4Shell>
    <div ref={ref}>
      <PrintHeader />
      <PatientBlock patient={patient} />
      <VisitBlock visit={visit} patient={patient} />
      <FooterNote />
    </div>
  </A4Shell>
));






/* ---------------------------- PRINT SUB-BLOCKS ---------------------------- */

const PrintHeader = () => (
  <div style={{ textAlign: "center", borderBottom: `3px solid ${BRAND_BLUE}`, paddingBottom: 12, marginBottom: 16 }}>
   <img src="/img/logo/logo.png" width={150} alt="" />
    <div style={{ fontSize: 12, color: "#475569" }}>
      Comprehensive Diagnostic & Imaging Services
    </div>
    <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
      Printed: {new Date().toLocaleString()}
    </div>
  </div>
);

const PatientBlock = ({ patient }) => (
  <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 14, marginBottom: 12 }}>
    <div style={{ fontWeight: 700, marginBottom: 8, color: "#0F3F73" }}>Patient Details</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
      <div><b>Name:</b> {patient.fullName}</div>
      <div><b>Patient ID:</b> {patient.patientId}</div>
      <div><b>Mobile:</b> {patient.mobile || "—"}</div>
      <div><b>Email:</b> {patient.email || "—"}</div>
      <div style={{ gridColumn: "1 / span 2" }}>
        <b>Address:</b> {(patient.address || "—")}{patient.city ? `, ${patient.city}` : ""}{patient.state ? `, ${patient.state}` : ""}{patient.pincode ? `, ${patient.pincode}` : ""}
      </div>
    </div>
  </div>
);

const VisitBlock = ({ visit, patient }) => (
  <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 14, marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <div style={{ fontWeight: 700, color: BRAND_BLUE }}>
        Visit: {visit.visitId}
      </div>
      <div style={{ fontSize: 12, color: "#334155" }}>{dateFmt(visit.visitDate)} · {visit.bookingType} · {visit.bookedBy}</div>
    </div>

    <div style={{ marginBottom: 10, fontSize: 12 }}>
      <b>Status:</b> {visit.status || "—"} &nbsp; | &nbsp; <b>Payment:</b> {visit.paymentStatus || "—"}
    </div>

    {/* Tests & Packages */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Tests</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Sample</th>
              <th style={{ ...th, textAlign: "right" }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {(visit.tests || []).length === 0 ? (
              <tr><td colSpan="3" style={td}>—</td></tr>
            ) : (
              (visit.tests || []).map((t) => (
                <tr key={t._id}>
                  <td style={td}>{t.name}</td>
                  <td style={td}>{t.sampleType || "—"}</td>
                  <td style={{ ...td, textAlign: "right" }}>{currency(t.price)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Packages</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={{ ...th, textAlign: "right" }}>Final Price</th>
            </tr>
          </thead>
        </table>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {(visit.packages || []).length === 0 ? (
              <tr><td colSpan="2" style={td}>—</td></tr>
            ) : (
              (visit.packages || []).map((p) => (
                <tr key={p._id}>
                  <td style={td}>{p.name}</td>
                  <td style={{ ...td, textAlign: "right" }}>{currency(p.finalPrice)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Totals + Barcode */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
      <div style={{ fontSize: 13,width: "60%" }}>
        <b>Total:</b> {currency(visit.totalAmount)} &nbsp; | &nbsp;
        <b>Discount:</b> {visit.discount ? `${visit.discount}%` : "0%"} &nbsp; | &nbsp;
        <b>Payable:</b> {currency(visit.finalAmount)}
      </div>

      <div style={{ textAlign: "center" , width: "30%"}}>
        {/* react-barcode renders an SVG, which will be cloned into print window via outerHTML */}
        <Barcode value={`${patient._id}-${visit.visitId}`}  height={42}  displayValue={false} />
        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>
          {patient._id}-{visit.visitId}
        </div>
      </div>
    </div>
  </div>
);

const A4PrintBarcode = React.forwardRef(({ patient, visit }, ref) => (
  <A4Shell>
    <div
      ref={ref}
      style={{
        padding: "20mm",
        textAlign: "center",
        fontSize: 14,
        color: "#0F172A",
      }}
    >
      
      {/* ✅ BARCODE */}
      <Barcode
        value={`${patient._id}-${visit.visitId}`}
        height={55}
        width={2}
        displayValue={false}
      />

      <div style={{ fontSize: 11, marginTop: 6, color: "#475569" }}>
        {patient._id}-{visit.visitId}
      </div>
    </div>
  </A4Shell>
));


const FooterNote = () => (
  <div style={{ marginTop: 18, fontSize: 11, color: "#64748B" }}>
    <Divider />
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <div><b>Authorized Signatory</b></div>
        <div style={{ marginTop: 28, borderTop: "1px solid #CBD5E1", width: 200 }} />
      </div>
      <div style={{ textAlign: "right" }}>
        <div>VJ Scans & Labs</div>
        <div>contact@vjsl.in · +91-XXXXXXXXXX</div>
        <div>© {new Date().getFullYear()} All rights reserved</div>
      </div>
    </div>
  </div>
);

const th = {
  borderBottom: "1px solid #E2E8F0",
  textAlign: "left",
  padding: "6px 8px",
  color: "#334155",
};
const td = {
  borderBottom: "1px solid #F1F5F9",
  padding: "6px 8px",
  color: "#111827",
};

/* ------------------------------- PRINT UTILS ------------------------------ */

function buildPrintShell({ title, body }) {
  // Global print CSS (A4, margins, brand colors)
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        @page { size: A4; margin: 18mm 14mm; }
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; color: #0f172a; }
        .a4 { width: 100%; }
        h1,h2,h3,h4 { margin: 0; }
        table { width: 100%; }
        .no-break { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      ${body}
      <script>
        setTimeout(function(){ window.print(); }, 100);
      </script>
    </body>
  </html>`;
}

function openPrintWindow(html) {
  const w = window.open("", "_blank", "width=900,height=1000");
  w.document.open();
  w.document.write(html);
  w.document.close();
}


/* End */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, CircularProgress, Card, CardContent } from "@mui/material";
import { PatientAPI, ReportAPI} from "../../utils/api";

const PatientView = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await PatientAPI.getById(id);
        const reportRes = await ReportAPI.getByPatientId(id);
        setPatient(res.data.data);
        setReports(reportRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <CircularProgress />
      </div>
    );

  if (!patient)
    return <p className="text-center text-gray-500 mt-10">Patient not found.</p>;

  return (
    <div className="page-wrapper fade-in">
      <Typography variant="h5" className="font-semibold text-[#0961A1] mb-4">
        Patient Details
      </Typography>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">
              {patient.fullName}
            </Typography>
            <p>Patient ID: {patient.patientId}</p>
            <p>Gender: {patient.gender}</p>
            <p>Age: {patient.age}</p>
            <p>Mobile: {patient.mobile}</p>
            <p>Email: {patient.email}</p>
            <p>City: {patient.city}</p>
            <p>Address: {patient.address}</p>
          </CardContent>
        </Card>
      </div>

      <Typography variant="h6" className="text-[#0961A1] mb-3">
        Reports
      </Typography>

      <div className="overflow-x-auto">
        {reports.length > 0 ? (
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-[#0961A1] text-white">
              <tr>
                <th className="px-4 py-2 text-left">Report Name</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2">{r.testName}</td>
                  <td className="px-4 py-2">
                    {new Date(r.reportDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{r.status}</td>
                  <td className="px-4 py-2">
                    <a
                      href={r.reportFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#F98D1B] font-semibold hover:underline"
                    >
                      View Report
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No reports available for this patient.</p>
        )}
      </div>
    </div>
  );
};

export default PatientView;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setUserRole(user.role);
  }, []);

  const handleGoHome = () => {
    if (!userRole) navigate("/");
    else if (userRole === "Admin") navigate("/admin");
    else if (userRole === "Receptionist") navigate("/receptionist");
    else if (userRole === "Technician") navigate("/technician");
    else if (userRole === "Pathologist") navigate("/pathologist");
    else navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center p-8 rounded-2xl shadow-lg bg-white border border-gray-100 w-[90%] md:w-[500px]"
      >
        <Typography
          variant="h2"
          className="font-extrabold text-blue-600 mb-3"
        >
          404
        </Typography>
        <Typography
          variant="h5"
          className="text-gray-800 font-semibold mb-2"
        >
          Page Not Found
        </Typography>
        <Typography variant="body2" className="text-gray-600 mb-6">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </Typography>

        <Button
          onClick={handleGoHome}
          variant="contained"
          color="primary"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Go Back Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;

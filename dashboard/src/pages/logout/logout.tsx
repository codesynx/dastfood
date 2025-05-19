import { useAuth } from "@/constants/AuthContext";
import React from "react";


const Logout: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login"; 
  };

  return <button onClick={handleLogout}>Шығу</button>;
};

export default Logout;

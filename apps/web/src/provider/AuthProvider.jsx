// src/providers/AuthProvider.jsx
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import AxiosInstance from "../lib/axios";
import { Loader } from "lucide-react";

const AuthProvider = ({ children }) => {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);

  const updateToken = (token) => {
    if (token) {
      AxiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    } else {
      delete AxiosInstance.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        updateToken(token);
      } catch (err) {
        console.error("Error fetching token", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [getToken, userId]);

  if (loading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader className="size-8 animate-spin text-pink-600" />
      </div>
    );

  return <>{children}</>;
};

export default AuthProvider;

// src/routes/ProtectedRoute.jsx
import { useUser, useClerk } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  useEffect(() => {
    if (!isSignedIn) {
      openSignIn({ appearance: { layout: "modal" } });
    }
  }, [isSignedIn, openSignIn]);

  if (!isSignedIn) return null; // don't render anything until signed in

  return <Outlet />;
};

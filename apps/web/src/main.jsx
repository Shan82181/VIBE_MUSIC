import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./provider/AutheProvider.jsx";
import { ToastContainer } from "react-toastify";

// ⭐ React Query Imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Clerk Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ClerkLoaded>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
              <ToastContainer
                position="bottom-right"
                autoClose={2800}
                theme="dark"
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
              />
            </BrowserRouter>
          </QueryClientProvider>
        </AuthProvider>
      </ClerkLoaded>

      <ClerkLoading>
        <div className="text-white flex justify-center h-screen items-center">
          Loading Auth...
        </div>
      </ClerkLoading>
    </ClerkProvider>
  </StrictMode>
);

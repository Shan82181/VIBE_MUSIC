import HomePage from "./pages/home/HomePage";
import { Routes, Route } from "react-router-dom";
import LikedSongs from "./pages/likedsongs/LikedSongs";
import CreatePlaylist from "./pages/createplaylist/CreatePlaylist";
import MainLayout from "./layouts/MainLayout";
import MiniPlayer from "./components/MiniPlayer";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from "axios";
import AuthProvider from "./provider/AutheProvider.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import ExplorePage from "./pages/explore/ExplorePage.jsx";
import PlaylistPage from "./pages/playlist/PlaylistPage.jsx";
import NavigationPage from "./pages/navigation/NavigationPage.jsx";
import CategoryPage from "./pages/navigation/CategoryPage.jsx";
import PlaylistDetails from "./pages/createplaylist/PlaylistDetails.jsx";

export function useSyncUser() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn && user) {
      (async () => {
        try {
          const token = await getToken();
          const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
          await axios.post(
            `${ VITE_BACKEND_URL}/api/sync-user/${user.id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("✅ User synced with backend");
        } catch (err) {
          console.error("❌ Sync failed:", err);
        }
      })();
    }
  }, [isSignedIn, user, getToken]);
}

export default function App() {
  useSyncUser();

  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/library" element={<ExplorePage />} />
            <Route path="/likedsongs" element={<LikedSongs />} />
            <Route path="/createplaylist" element={<CreatePlaylist />} />
            <Route path="/playlist/:browseId" element={<PlaylistPage />} />
            <Route path="/userplaylist/:id" element={<PlaylistDetails />} />
            <Route path="/navigation/:browseId" element={<NavigationPage />} />
            <Route path="/category/:browseId" element={<CategoryPage />} />
          </Route>
          <Route path="/search" element={<MiniPlayer />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

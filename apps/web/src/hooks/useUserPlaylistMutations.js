import React from 'react'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useUserPlaylistMutations = (userId) => {
    const queryClient = useQueryClient();

    const refresh = () =>
    queryClient.invalidateQueries(["userPlaylists", userId]);

    const createPlaylist = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/playlists", data);
      return res.data;
    },
    onSuccess: refresh,
  });

  const addSongToPlaylist = useMutation({
    mutationFn: async ({ playlistId, song }) => {
      const res = await api.post(`/playlists/${playlistId}/add`, { song });
      return res.data;
    },
    onSuccess: refresh,
  });

  const removeSong = useMutation({
    mutationFn: async ({ playlistId, videoId }) => {
      const res = await api.delete(`/playlists/${playlistId}/remove/${videoId}`);
      return res.data;
    },
    onSuccess: refresh,
  });
  return {
    createPlaylist: createPlaylist.mutateAsync,
    addSongToPlaylist: addSongToPlaylist.mutateAsync,
    removeSong: removeSong.mutateAsync,
  };
}

import User from "../models/user.model.js";
import Playlist from "../models/playlist.model.js";
import LikedSong from "../models/likedsong.model.js";
import SongPlay from "../models/songplay.model.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-__v");
  res.json(users);
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  await User.findOneAndDelete({ clerkId: userId });
  await Playlist.deleteMany({ userId });
  await LikedSong.deleteMany({ userId });
  await SongPlay.deleteMany({ userId });
  res.json({ message: `User ${userId} deleted` });
};

export const getMostLikedSongs = async (req, res) => {
  const data = await LikedSong.aggregate([
    {
      $group: {
        _id: "$videoId",
        title: { $first: "$title" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  res.json(data);
};

export const getMostPlayedSongs = async (req, res) => {
  const data = await SongPlay.aggregate([
    { $group: { _id: "$videoId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  res.json(data);
};

export const getTopPlaylists = async (req, res) => {
  const data = await Playlist.aggregate([
    { $project: { name: 1, songCount: { $size: "$songs" } } },
    { $sort: { songCount: -1 } },
    { $limit: 10 },
  ]);
  res.json(data);
};

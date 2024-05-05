import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {Comment} from "../models/comment.models.js"
import {Tweet} from "../models/tweets.models.js"
import { Playlist } from "../models/playlist.models.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }

    const { name, description } = req.body;
    if ([name, description].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    
    try {
        // Create playlist
        const playlist = await Playlist.create({
            name,
            description,
            user: req.user._id // Associate playlist with the user
        });
        
        res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
    } catch (error) {
        // Handle database errors
        throw new ApiError(500, "Error occurred while creating playlist");
    }
});


const getUserPlaylists = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }

    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    
    const playlists = await Playlist.find({ owner: userId });

    if (!playlists || playlists.length === 0) {
        // If no playlists are found, send a 404 error response
        throw new ApiError(404, "User has not created any playlists");
    }

  
    res.status(200).json(new ApiResponse(200, playlists, "User playlists retrieved successfully"));
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }

    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist  ID");
    }
    const playlist= await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist was not found")
    }
    res.status(201)
    .json( new ApiResponse(201,playlist,"Playlist was found"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }


    const {playlistId, videoId} = req.params  
   
    if (!mongoose.isValidObjectId(playlistId)|| !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID");
    }
    const playlist= await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist was not found")

    }
    if(playlist.owner.toString()!=req.user._id){
        throw new ApiError(401,"You are not owner of playlist .You cannot modify the playlist")
    }
    if(playlist.videos.includes(videoId)){
        throw new ApiError(401,"Video ID already Exist")
    }

    await playlist.videos.push(videoId)
    await playlist.save()

    res.status(201)
    .json( new ApiResponse(201,playlist,"Video Added Successfully"))



})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }
   
    const {playlistId, videoId} = req.params

    // TODO: remove video from playlist
    if (!mongoose.isValidObjectId(playlistId)|| !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID");
    }
    const playlist= await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist was not found")
    }
    if(playlist.owner.toString()!=req.user._id){
        throw new ApiError(401,"You are not the Owner of this Playlist .You have no permission to delete this Video from playlist")
    }
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(401,"Video must be in Playlist")
    }
    playlist.videos= playlist.videos.filter(id=> id.toString()!== videoId)
   await playlist.videos.save()
    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));



})

const deletePlaylist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID or Video ID");
    }
    const playlist= await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist was not found")

    }
    if(playlist.owner.toString()!=req.user._id){
        throw new ApiError(401,"You are not the Owner of this Playlist .You have no permission to delete this playlist")
    }
   const deletePlaylist= await playlist.remove()
   res.status(200).json(new ApiResponse(200, deletePlaylist, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID ");
    }
   
    if(!name||!description){
        throw new ApiError(401,"Name and Description cannot be Empty")
    }
    const playlist= await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description
        }


    },
    {
        new:true
    }
)
    if(!playlist){
        throw new ApiError(404,"Playlist was not found")

    }
    res.status(201)
    .json(new ApiResponse(201,playlist,"Playlist was Updated Successfully"))
    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}


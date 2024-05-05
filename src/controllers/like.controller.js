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

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const user=  await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User must be Logged In")

    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video Could not be Found")

    }
    const likedUser= req.user._id

    const alreadyLiked= await Like.findOne({video:videoId,likedBy:likedUser})

    if(alreadyLiked){
        await alreadyLiked.remove()
    }
    else{
        await Like.create({video:videoId,likedBy:likedUser})
    }
    res.status(200).json(new ApiResponse(200, {}, "Video like toggled successfully"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const user=  await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User must be Logged In")

    }

    const {commentId} = req.params
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }
    const comment= await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found")

    }
    const userLiked= req.user._id

    const alreadyLiked= await Like.findOne({comment:commentId,likedBy:userLiked})

    if(alreadyLiked){
        await alreadyLiked.remove()
    }
    else{
        await Like.create({comment:commentId,likedBy:userLiked})
    }

    res.status(200).json(new ApiResponse(200, {}, "Comment like toggled successfully"));

    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {

    const user=  await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User must be Logged In")

    }

    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }
    const tweet= Tweet.findById(tweetId)
    if(!tweet){
            throw new ApiError(404,"Tweet was not found")
    }
    const likedUser= req.user._id
    const existedLike= Like.findOne({tweets:tweetId,likedBy:likedUser})

    
    if(existedLike){
        await alreadyLiked.remove()
    }
    else{
        await Like.create({tweets:tweetId,likedBy:likedUser})
    }

    res.status(200).json(new ApiResponse(200, {}, "Tweets like toggled successfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId= req.user._id
    if(!userId){
        throw new ApiError(401,"User must be logged In")
    }
    const likeVideo= await Like.aggregate([
        {
            $match:{
                likedBy:userId

            },
        },
        {
            $lookup:{
                from:"video",
                localField:
            }
        }
    ])
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
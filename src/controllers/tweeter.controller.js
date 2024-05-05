import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/Apierror.js"
import { User } from "../models/user.models.js"
import { uploadonCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { Tweet } from "../models/tweets.models.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user=  await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User must be Logged In")

    }
    const {content}= req.body
    if ([content].some((field) => field.trim() == "")) {
        throw new ApiError(400, "all field are required");
    }
    const tweetuser= await  Tweet.create({
        content
    })
    if(!tweetuser){
        throw new ApiError(404,"Error while updating database")
    }
    res.status(201).json(
        new ApiResponse(201,tweetuser,"Successfully Created")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            throw new ApiError(404, "User was not found");
        }

        // Find all tweets by the user
        const userTweets = await Tweet.find({ owner: userId });

        if (!userTweets || userTweets.length === 0) {
            throw new ApiError(404, "No tweets found for this user");
        }

        return res.status(200).json(new ApiResponse(200, { tweets: userTweets }, "Successfully fetched user tweets"));
    } catch (error) {
        // Handle errors
        console.error("Error fetching user tweets:", error);
        res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
    }
});


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const user=  await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User must be Logged In")

    }
    const {tweetId}= req.params
    
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    if(!tweetId){
        throw new ApiError(404,"Tweet message was not found")
    }

    const {content}= req.body
    if(!content){
        throw new ApiError(404,"Content is require to Update")
    }
    const tweet=  await Tweet.findByIdAndUpdate(tweetId,{
        
            $set:{
                content

            },
        
    },
    {
        new:true
    })
    if(!tweet){
        throw new ApiError(404,"Problem Occured while updating database")
    }
    res.status(201).json(
        new ApiResponse(201,tweet,"Successfully Updated")
    )

    

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const user=  await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User must be Logged In")

    }
    const {tweetId}= req.params
   
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    if(!tweetId){
        throw new ApiError(404,"Tweet id was not found")
    }
    const tweet= await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet was not found")
    }
    await tweet.remove()
    res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
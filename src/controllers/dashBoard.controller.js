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

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId}= req.params
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel  ID");
    }
    if(!channelId){
        throw new ApiError(404,"Channnel id was not found")
    }
    const totalVideoViews=  await Video.aggregate(
        [
            {
                $match:{
                    owner:mongoose.Types.ObjectId(channelId),

                }
            },
            {
                $group:{_id:null,
                  totalViews:  {
                        $sum:"$views"
                    }
                  
                }
            }
        ]
    )
    const totalSubscription= await Subscription.countDocuments({subscriber:channelId})
    const totalSubscriber= await Subscription.countDocuments({channel:channelId})
    const totalVideo= await Video.countDocuments({owner:channelId})
    const totalLikes= await Like.countDocuments({likedBy:channelId})
    
    res.status(201)
    .json(
        new ApiResponse(
            201,
           // totalVideoViews:totalVideoViews.length>0?totalVideoViews[0].totalViews : 0,
          { totalVideoViews:totalVideoViews.length > 0 ? totalVideoViews[0].totalViews : 0,
           totalSubscriber,
           totalVideo,
           totalLikes,
           totalSubscription}
           ,"Channel stats was successfully fetched"


        )
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId}=req.params
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(401,"Channel Id was not valid")
    }
    if(!channelId){
        throw new ApiError(404,"Channel id was not found")
    }
    const allVideo= await Video.find({owner:channelId})

    res.status(201)
    .json(201,allVideo,"Videos uploaded by the channels")
})

export {
    getChannelStats, 
    getChannelVideos
    }
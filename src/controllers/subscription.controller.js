import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }
    const subscriptionId= req.user._id
    if (!mongoose.isValidObjectId(subscriptionId)) {
        throw new ApiError(400, "Invalid Subscription  ID ");
    }
    const {channelId} = req.params

    // TODO: toggle subscription
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID ");
    }
    const subscription= await Subscription.findOne({channel:channelId,subscriber:subscriptionId})
    if(subscription){
        await subscription.remove()
    }
    else{
        await Subscription.create({
            channel:channelId,
            subscriber:subscriptionId
        })
    }

    res.status(201)
    .json( new ApiResponse(201,subscription,"Subscription Toggled"))
    

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }

    const {channelId} = req.params
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID ");
    }
 const subscriber= await Subscription.find({channel:channelId})
 if(!subscriber){
    throw new ApiError (401,"Channel id was not correct")
 }
 const subscriberId=subscriber.map(subs=>subs.subscriber)

 const subUser= await User.find({_id:{$in:subscriberId}})
 if(!subUser){
    throw new ApiError(404,"Sub User Cannot be found")
 }

 res.status(201)
 .json( new ApiResponse(201,subUser,"Subscriber Fetched Successfully"))


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }
    const { subscriberId } = req.params
    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID ");
    }
    const Subcription = await Subscription.find({subscriber:subscriberId})
    if(!Subcription){
        throw new ApiError(401,"Subscription Id was invalid")
    }
    const SubscriptionId= Subcription.map(subs=>subs.channel)
    const SubscriptUser= await User.find({_id:{$in:SubscriptionId}})
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
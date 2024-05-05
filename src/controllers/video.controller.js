import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";

const createVideo= asyncHandler( async(req,res)=>{
    //algoruthm for creating a video
    //user toh login hee rhega
    //file ka req mangege
    //file upload
    
    const user=  await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User must be Logged In")

    }

    const{title,description}= req.body
    if ([title,description].some((field) => field.trim() == "")) {
        throw new ApiError(400, "all field are required");
    }
    const thumbnailLocalPath= req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(401,"Video is not uploaded")
    }

    const thumbnail= await uploadonCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(401,"Something went Wrong while uploading Video")

    }
    const videofileLocalPath= req.files?.videoFile[0]?.path

    if(!videofileLocalPath){
        throw new ApiError(401,"Video is not uploaded")
    }
    const videoFile= await uploadonCloudinary(videofileLocalPath)

    if(!videoFile){
        throw new ApiError(401,"Something went Wrong while uploading Video")

    }
    const videouser= await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description
    })
    const createdVideo= await Video.findById(videouser._id)
    if(createdVideo){
        throw new ApiError(401,"Video not found")
    }

})
const updateVideo= asyncHandler( async(req,res)=>{
    const {videoId}= req.params
    if(!videoId){
        throw new ApiError(404,"Videp id was not found")

    }
    const {title,description}=  req.body

    if(!title||!description){
        throw new ApiError(404,"title and description is required")
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title,
                description

            }
        },
        {
            new:true
        })
    if(!video){
        throw new ApiError(404,"Video id was not found in Database ")
    }
    return res.status(201)
    .json(new ApiResponse(201,video,"Video detail was Successfully updated"))

})

const getVideoById= asyncHandler( async(req,res)=>{
    const {videoId}= req.params

    if(!videoId){
        throw new ApiError(404,"Video id is required")
    }

    const video= await Video.findById(videoId)

    if(video){
        throw new ApiError(404,"Video was not found")

    }
    res.status(201)
    .json(
        new ApiResponse(200,video,"Video is fetched successfully")
    )
})

const deleteVideo= asyncHandler( async (req, res)=>{
    const {videoId}= req.params
    if(!videoId){
        throw new ApiError(404,"VideoId is required")
    }
    const video= await Video.findById(videoId)
    //if(video.videoFile)  pending how to delete this from cloudinary

    if(!video){
        throw new ApiError(404,"video was not found")
    }
    await video.remove()



    res.status(201).json(
        new ApiResponse(201,{},"Video was successfully removed")
    )
})
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})





export { createVideo,
    updateVideo,
    getVideoById,
    deleteVideo
                    }
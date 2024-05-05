import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const user=  await User.findById(req.user._id)
    if(!user){
        throw new ApiError(401,"User must be Logged In")

    }
    const {content}= req.body
    if(!content){
        throw new ApiError(404,"Contenr was empty please write some content to post")
    }
    const commentuser= await Comment.create({
        content
    })
    if(!commentuser){
        throw new ApiError(404,"Some Error Occured in a Database while creating new Commnet")
    }

    res.status(201)
    .json(
        new ApiResponse(201,commentuser,"Succesfully created a Comment")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // Check if user is logged in
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }

    // Extract commentId from request parameters
    const { commentId } = req.params;

    // Validate commentId
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Check if commentId exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Extract content from request body
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content cannot be empty");
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content } },
        { new: true } // Return the updated document
    );

    // Check if the comment was updated
    if (!updatedComment) {
        throw new ApiError(404, "Some error occurred while updating the comment");
    }

    // Send response with the updated comment
    res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});


const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "User must be logged in");
    }

    // Extract commentId from request parameters
    const { commentId } = req.params;

    // Validate commentId
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const commentUser= await Comment.findById(commentId)
    if(!commentUser){
        throw new ApiError(404,"Comment does not exist")
    }
    await commentUser.remove()

    return res.status(201)
    .json(new ApiResponse(201,{},"Comment Succesfully Deleted"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
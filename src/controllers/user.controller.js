import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const AccessTokenandRefreshToken= async (userId)=>{
    const user= await User.findById(userId)
    const accessToken= user.generateAccessToken()
    const refreshToken= user.generateRefreshToken()
    user.refreshToken=refreshToken
    user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}

}

const registerUser = asyncHandler(async (req, res) => {
    //step1 user details
    // step2 agr account hai toh directlogin
    //img store krna hai
    //validate krna hai
    //navigate
    const { username, email, fullname, password } = req.body;
   
//validate kro ki empty nhi hai na
    if ([username, email, fullname, password].some((field) => field.trim() == "")) {
        throw new ApiError(400, "all field are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });
    console.log("existeduser:", existedUser);

    if (existedUser) {
        throw new ApiError(401, "email or username already exists");
    }

    const avatarlocalfilepath = req.files?.avatar[0]?.path;
    //const coverimagelocalfilepath = req.files?.coverimage[0]?.path;
    let coverimagelocalfilepath;
    if(req.files&&Array.isArray(req.files.coverimage)&&req.files.coverimage.length>0){
        coverimagelocalfilepath = req.files.coverimage[0].path
    }

    if (!avatarlocalfilepath) {
        throw new ApiError(409, "Avatar file is required");
    }

    console.log(registerUser);

    const avatar = await uploadonCloudinary(avatarlocalfilepath);
    const coverimage = await uploadonCloudinary(coverimagelocalfilepath);

    if (!avatar) {
        throw new ApiError(409, "Avatar file is required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimage: coverimage ? coverimage.url: "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(501, "something went wrong while registering the user ");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "user registered"));
});
const loginUser= asyncHandler( async(req,res)=>{  
    //todos for login
    //database se email validate krna
    //like email userid and password
    //if given parameter is correct the login the user
    //give user access token and refresh token
    const {email,username,password}=req.body

    if(!email && !username){
        throw new ApiError(400,"username or email is required for login")
    }
  const user =  await User.findOne({
        $or:[{email},{username}]
    })                                            //note this is instance of our User
    if(!user){
        throw new ApiError(400,"user not found")
    }
    const isPasswordValid= await user.isPasswordCorrect(password)
    if (!isPasswordValid){
        throw new ApiError(401,"Incorrect User credentials")
    }
    const {accessToken,refreshToken}= await AccessTokenandRefreshToken(user._id)
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true

    }
    return res.status(200).cookie("accessToken" ,accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User has Successfully Logged In"
        )
    )


})
const logoutUser= asyncHandler( async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true

    }
    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
         new ApiResponse(201,{},"User logout Successfully")
    )
})

const endPointRefreshAccessToken= asyncHandler( async(req,res)=>{
    const userRefreshToken= req.cookie.refreshToken || req.body.refreshToken
    if(!userRefreshToken){
        throw new ApiError(401,"Unauthorized user request")
    }
   try {
     const decodedRefreshtoken= jwt.verify(userRefreshToken,process.env.REFRESH_TOKEN)
      
     if(!decodedRefreshtoken){
         throw new ApiError(401,"Unauthorized user request")
     }
     const user= await User.findById(decodedRefreshtoken._id).select("-password -refreshToken")
 
     if(!user){
         throw new ApiError(401,"Unauthorized user request")
     }
     if(userRefreshToken!==user?.refreshToken){
         throw new ApiError(401,"Request token is either used or expired")
     }
     const options={
         httpOnly:true,
         secure:true
 
     }
     
 
    const{accessToken,newRefreshToken}= await AccessTokenandRefreshToken(user._id)
 
    res
    .status(201)
    .cookie("accesstoken",accessToken,options)
    .cookie("RefreshToken",newRefreshToken,options)
    .json(
     new ApiResponse(201,{accessToken,refreshToken:newRefreshToken},"Access token Refreshed")
    )
 
   } catch (error) {
    throw new ApiError(401,error.message||"Invalid Refresh Token")
   }
})

const changePassword= asyncHandler( async(req,res)=>{
    
    const {OldPassword,NewPassword}=req.body

    const user = await User.findById(req.user?._id)

     const isPasswordCorrect=user.isPasswordCorrect(OldPassword)

     if(!isPasswordCorrect){
        throw new ApiError(404,"Old password is not correct")
     }
        user.password=NewPassword
      await  user.save({validateBeforeSave:false})
      return res.status(200).json(
        new ApiResponse(201,{},"Password is Changed")
      )
     
    
})

const getCurrentUser= asyncHandler( async(req,res)=>{
    return res.status(201).json( new ApiResponse(201,req.user,"Current User is Fetched"))
})

const editAccountDetails= asyncHandler(async(req,res)=>{
    const{fullname,email}=req.body
    if(!fullname||!email){
        throw new ApiError(201,"Fullname and Email is required")
    }
    const user= User.findByIdAndUpdate(req.user._id,{
      //  email:email 
     $set: {email,
      fullname}
    },{
        new:true
    })
    if(!user){
        throw new ApiError(404,"user was not found")
    }
    return res.status(201).json( new ApiResponse(201,user,"Account Details Succesfully GOt Updated"))
})

const updateAvatar= asyncHandler( async(req,res)=>{
    const avatarlocalpath=req.file?.path
    if(avatarlocalpath){
        throw new ApiError(201,"Avatar file path is missing")

    }
    const avatar= await uploadonCloudinary(avatarlocalpath)
    if(!avatar.url){
        throw new ApiError(404,"file url was not found error while uploading file")
    }
    const user= await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar:avatar.url
        }
    },
    {
        new:true
    }).select("-password")
    res.status(201).json(
        new ApiResponse(201,user,"Avatar Image Updated")
    )
})
const updateCoverimage= asyncHandler( async(req,res)=>{
    const coverimagelocalpath=req.file?.path
    if(coverimagelocalpath){
        throw new ApiError(201,"Coverimage file path is missing")

    }
    const coverimage= await uploadonCloudinary(coverimagelocalpath)
    if(!coverimage.url){
        throw new ApiError(404,"file url was not found error while uploading file")
    }
    const user= await User.findByIdAndUpdate(req.user._id,{
        $set:{
           coverimage:coverimage.url
        }
    },
    {
        new:true
    }).select("-password")
    res.status(201).json(
        new ApiResponse(201,user,"CoverImage Image Updated")
    )
})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(201, "Username not found");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "Subscriber"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "SubscribedTo"
            }
        },
        {
            $addFields:{
                subscribercount:{
                    $size:"$Subscriber" // Corrected
                },
                chanelsubcridedto:{
                    $size:"$SubscribedTo" // Corrected
                },
                isSubscribed:{
                    $cond: {
                       if: {$in: [req?.user._id, "$Subscriber.subscriber"]}, // Corrected
                       then: true,
                       else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                email: 1,
                subscribercount: 1,
                chanelsubcridedto: 1,
                avatar: 1,
                coverimage: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res.status(201).json(new ApiResponse(201, channel[0], "User Channel info fetched Successfully"));
});


const getWatchHistory= asyncHandler( async(req,res)=>{

    const user = await User.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchhistory",
                pipeline:[{
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[{
                            $project:{
                                username:1,
                                avatar:1,
                                fullname:1
                            }
                        }]
                    }
                }]

            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])
    res.status(201).json(new ApiResponse(201,user[0].watchHistory,"Watch History Successfully fedged"))
})





export { registerUser,loginUser,logoutUser,endPointRefreshAccessToken,getCurrentUser,changePassword,updateAvatar,updateCoverimage,getUserChannelProfile
,getWatchHistory,editAccountDetails };


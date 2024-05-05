import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";
import jwt from"jsonwebtoken"

 export const verifyJwt= asyncHandler( async (req,res,next)=>{
   try {
     const token= req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ", "")
 
     if(!token){
         throw new ApiError(500,"Something went Wromg while accessing the token")
 
 
     }
     const dedcodedtoken= jwt.verify(token,process.env.ACCESS_TOKEN)
    const user=  await User.findById(dedcodedtoken?._id).select("-password -refreshToken")
     
    if(!user){
     throw new ApiError(401,"Invalid Access token")
    }
    req.user=user;
    next()
 
   } catch (error) {
    throw new ApiError(401,error?.message||"invalid access token")
   }
})
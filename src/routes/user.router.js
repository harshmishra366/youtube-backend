import { Router } from "express";
import { loginUser, logoutUser, registerUser,endPointRefreshAccessToken, editAccountDetails, changePassword, getCurrentUser, updateAvatar, updateCoverimage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router=Router()
router.route("/register").post( 
   upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverimage",
        maxCount:1
    }

   ]),
    registerUser
    );
    router.route("/login").post(loginUser);
    router.route("/logout").post(verifyJwt,logoutUser)
    router.route("/refresh-token").post(endPointRefreshAccessToken)
    router.route("/edit-Account").patch( verifyJwt,editAccountDetails)
    router.route("/change-Password").post(verifyJwt,changePassword)
    router.route("/current-user").post(verifyJwt,getCurrentUser)
    router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)
    router.route("/coverimage").patch(verifyJwt,upload.single("coverimage"),updateCoverimage)
    router.route("/c/:username").get(verifyJwt,getUserChannelProfile)
    router.route("/history").get(verifyJwt,getWatchHistory)


export default router 
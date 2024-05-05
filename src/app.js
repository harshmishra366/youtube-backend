import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()
app.use(cors(
    {
        origin:process.env.CORS_URL,
        credentials: true
    }
))
app.use(express.json({limit:"15kb"}))
app.use(express.urlencoded({extended:true,limit:"15kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// router ko import krna
import userRouter from './routes/user.router.js'  //why userRouter still error is there

app.use("/api/v1/users" , userRouter)




export { app }
import dotenv from "dotenv";
import { app } from "./app.js";
import ConnectDB from "./db/index.js";

dotenv.config({
    path: './env'
});

ConnectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port:${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
        // Handle any errors related to database connection
    });

app.on('error', (error) => {
    console.log("Failure in connecting database to express ", error);
    // Handle errors related to Express
});







































/*
const app=express()

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error:",error)

        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on a port number ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.error("ERROR:",error);
        throw(error)
        
    }
})()
*/
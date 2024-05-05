import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const ConnectDB= async ()=>{
    try {
     const DBConnectionInstance=   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

     console.log( `Database connected successfully ${DBConnectionInstance.connection.host}`);
       
    } catch (error) {
        console.log("Mongo db connection failure",error)
        process.exit(1)
    }

}
export default ConnectDB
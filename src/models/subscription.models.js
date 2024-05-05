import mongoose,{Schema} from "mongoose";

const subcriptionSchema= new mongoose.Schema({
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},
{

})

export const Subscription=mongoose.model("Subscription",subcriptionSchema)
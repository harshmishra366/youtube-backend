import mongoose,{Schema} from "mongoose";

const tweetschema=  new mongoose.Schema({
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
},
Content:{
    type:String,
    require:true
}
},{
    timestamps:true
})

export const Tweet= mongoose.model("Tweet",tweetschema)
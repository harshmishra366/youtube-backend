import mongoose,{Schema} from "mongoose";


const commentschema= new mongoose.Schema({
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
},
content:{
  type:String,
  require:true
},
video:{
    type:Schema.Types.ObjectId,
    ref:"Video"
}

},{
    timestamps:true
})

export const Comment=mongoose.model("Comment",commentschema)
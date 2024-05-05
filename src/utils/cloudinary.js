import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs"

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadonCloudinary= async (filepath)=>{
    try{
    if(!filepath) return null;
    const response = await cloudinary.uploader.upload(filepath,{
        resource_type:'auto'
    })
    //console.log("file has been uploaded to the cloudinary ",response.url);
    fs.unlinkSync(filepath)
    return response
    // why we didnt unlink file here if its successsfully uploaded on the cloudinary
}
catch(error){
    fs.unlinkSync(filepath)
    throw error
    return null
}


}
export {uploadonCloudinary}
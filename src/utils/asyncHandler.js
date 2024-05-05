const asyncHandler= (requestHandler)=>{
  return  (res,req,next)=>{
       Promise.resolve(requestHandler(res,req,next))
       
        .catch (
            (err)=>next(err))
            
        

    }
}
export {asyncHandler}


/*
const asyncHandler= (requestHandler)=> async(req,res,next)=>{
    try{
        requestHandler(req,res,next)
    }
    catch (error){
        res.status(error.code||500).json({
            sucess:false
            message: error.message
        })

    }
    
}
export d

*/
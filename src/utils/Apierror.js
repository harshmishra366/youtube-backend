class ApiError extends Error{

    constructor(
        statuscode,
        message="something went wrong ",
      
        stack= '',
        errors=[]

    ){
        super(message)
        this.statuscode=statuscode
        this.message=message
        this.data=null  //read documentaion
        this.success=false
        this.errors=errors


        if(stack){
            this.stack=stack

        }else{
            Error.captureStackTrace(this)
        }

    }
}
export {ApiError}
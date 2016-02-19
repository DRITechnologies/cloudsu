export default function(err){
    if(err.cause){
    	console.log(err.cause.message);
    	return err.cause.message;
    }
    else if(err.message){
    	console.log(err.message);
    	return err.message;
    }
    else{
    	return err;
    }

};


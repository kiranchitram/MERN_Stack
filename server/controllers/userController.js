import userModel from "../models/userModel.js";

export const getUserData = async (req,res)=>{
    try{
        //const {userId} = req.query;

        const user = await userModel.findById(req.params.id);
        if(!user){
            return res.json({success: false, message: 'User not Found'});
        }
        res.json({
            success: true,
            userData:{
                name:user.name,
                isAccountVerified: user.isAccountVerified
            }
        });
        
    }catch(error){
        res.json({success: false, message: error.message});
    }
 }
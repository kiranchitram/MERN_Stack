import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req, res)=>{
    const {name, email, password} =req.body;
//if name  email password is not available
    if(!name || !email || !password){
        return res.json({success: false, message: 'Missing Details'})
    }

    try{
        const existingUser = await userModel.findOne({email})
    // if it true    
        if(existingUser){
            return res.json({ success: false, message: "User already exists"});
        }
       
        const hashedPassword = await bcrypt.hash(password, 10);
        
        //we will create new user to database
        const user = new userModel({name, email, password: hashedPassword});
        // we are saving user in database
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, 
            { expiresIn: '7d'});

            res.cookie('token', token, 
            {httpOnly: true,
             secure : process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none' ,
             maxAge: 7 * 24 * 60 * 60 * 1000 
            }); 
        
            //sending welcome email
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: 'Welcome to KIRAN CHITRAM Developed Application ',
                text: `Hello, ${name} ,Welcome to Kiran Chitram developed web site... Your account created successfull with email id: ${email}..
                Have a Great Day..😍`
            }
            await transporter.sendMail(mailOptions);

            return res.json({success:true}); 
    }
    catch (error){
        res.json({success: false, message: error.message})

    }
}

export const login =async (req, res)=>{
  
    const {email, password} =req.body;
    if(!email || !password){
        return res.json({success: false, message: 'Email and password are required'})
    }
    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: 'Invalid email'});
        }
        const isMatch =await bcrypt.compare(password, user.password);
        
        if (!isMatch){
            return res.json({success: false, message:'Invalid password'}); 
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, 
            { expiresIn: '7d'});
            
            res.cookie('token', token, 
            { httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none' ,
             maxAge: 7 * 24 * 60 * 60 * 1000 
            }); 
            
            return res.json({success:true});
  

    }catch(error){
        return res.json({ success: false, message: error.message});
        
    }
 
}


export const logout = async (req, res)=>{
    try{
        res.clearCookie('token', {
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: "Logged Out"})

    }catch(error){
        return res.json({ success: false, message: error.message}); 
    }
}


//Send verification OTP to users Email

export const sendVerifyOtp = async (req, res) => {
    try {
        //const { userId } = req.body;

        const user = await userModel.findById(req.params.id);
        
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));


        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OTP by KIRAN CHITRAM Developed web',
            //text: `Your OTP is ${otp}. Verify your Account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOption);

        res.json({ success: true, message: 'Verification OTP sent on email' });

    } catch (error) {
        res.json({ success: false, message:error.message});
    }
};


export const verifyEmail = async (req, res) => {
    const { otp } = req.body;

    if (!otp) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'Expired OTP' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        return res.json({ success: false, message:error.message });
    }
};


//check if user is authenticated
export const isAuthenticated = async(req, res)=>{
  //  const { userId } = req.body;
    try{
         return res.json({success:true});
    }catch(error){
        res.json({success: false,message: error.message});
    }
};


//reset otp
export const sendResetOtp =async(req,res)=>{
    const {email} =req.body;
    if(!email){
        return res.json({success: false,message:'Email is Required'})
    }
    try{

        const user= await userModel.findOne({email});
        if(!user){
             return res.json({success:false,message: 'User not found'});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000 

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'password reset OTP by KIRAN CHITRAM Developed web',
            //text: `Your OTP for reset your password is is ${otp}. reset your Account password using this OTP.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };

        await transporter.sendMail(mailOption);
        return res.json({success: true, message: 'OTP sent to your email'});


    }catch(error){
        return res.json({success:false,message: error.message});
    }
};


//Reset user password
export const resetPassword= async(req,res)=>{
    const{email, otp, newPassword}=req.body;

    if(!email || !otp || !newPassword){
        return res.json({success:false, message:'Email ,OTP and newPassword are required'});
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
             return res.json({success:false,message: 'User not found'});
        }
        if(user.resetOtp === "" || user.resetOtp !== otp){
             return res.json({success:false,message: 'Invalid OTP'});
        }
        if(user.resetOtpExpireAt < Date.now()){
             return res.json({success:false,message: 'OTP Expired'});
        }
        const hashedPassword= await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp= '';
        user.resetOtpExpireAt= 0;

        await user.save();
        
         return res.json({success:true,message: 'Password has been reset successfully'});

    }catch(error)
    {
        return res.json({success:false,message: error.message});
    }

};

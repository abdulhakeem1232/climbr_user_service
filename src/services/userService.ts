import userRepository from "../repository/userRepository";
import { IUser } from "../models/userModel";
import { generateOTP } from "../utils/generateotp";
import { emailVerification } from "../utils/sendmail";

interface User{
    username:string;
    email:string;
    mobile:number;
    password:string; 
}
interface Login{
    email:string;
    password:string; 
}
export const userService={
    userRegister:async(userData:Partial<IUser>):Promise<{ success: boolean, message: string,otp?:string, user_data?: User }>=>{
        try{
            console.log(userData,'service');
            
            const email=userData.email
            if (email === undefined) {
                throw new Error("Email is undefined");
            }
            const emailExist= await userRepository.findByEmail(email);
            if(emailExist){
                return { success: false, message: "Email already exists" };
            }
            let otp=generateOTP()
            console.log(otp);
            
            await emailVerification(email,otp)
            console.log('email sended');
            const user_data: User = {
                username: userData.username || '', 
                email: email || '',
                mobile: userData.mobile || 0, 
                password: userData.password || '' 
            };
            console.log(user_data,'wiwi');
            
            return { success: true, message: "Verification email sent",otp:otp,user_data:user_data };
        }catch(error){
            throw new Error(`Failed to sign up: ${error}`);
        }
    },
    verifyOtp:async(enterOtp:string,otp:string,userdata:User)=>{
        try{
            console.log(otp,'serviceotp');
            
            if(otp==enterOtp){
                console.log(userdata,'enkwenadk');
                
                const usercreated = await userRepository.createUser(userdata);
                return { success: true, message: 'Correct OTP' };

            }else {
      
      return { success: false, message: 'Invalid OTP' };
    }

        }catch(error){
            throw new Error(`Failed to sign up: ${error}`);
        }
    },
    verifyLogin:async(userdata:Login)=>{
        try{
            const loginResponse=await userRepository.validateUser(userdata)
            console.log(loginResponse);
            return {success:loginResponse}
        }catch(err){
            throw new Error(`Failed to sign up: ${err}`);   
        }
    }
}



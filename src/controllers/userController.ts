import { Request } from "express";
import { userService } from "../services/userService";

interface UserData {
  name: string;
  email: string;
  mobile: number;
  password: string;
}

export const UserController = {
  signup: async (call: any, callback: any) => {
    try {
      const userData: UserData = call.request;
      console.log(call.request,"came controller",userData);
      const response = await userService.userRegister(userData);
      console.log(response, "response from the service");
      if (response.success) {
        console.log("if",response.user_data);
        callback(null, { success: true, msg: "otp sended",otp:response.otp,data:response.user_data });
      } else {
        callback(null, { success: false, msg: "email already exist" });
      }
    } catch (err) {
      callback(err);
    }
  },
  otp: async (call:any,callback:any) => {
    try {
      const body = call.request;
      console.log("Request Body:", body);
      const otp = body.otp;
      console.log("OTP from cookie:", otp);
      const userdata = body.userdata;
      console.log("Cookie from user data:", userdata);
      const enterOtp = body.enterOtp;
      console.log("User enter otp:", enterOtp); 
      const otpResponse = await userService.verifyOtp(enterOtp,otp,userdata);
      console.log(otpResponse, 'otpresponse');
      callback(null, otpResponse); 
    } catch (err) {
      callback(err);
    }
  },
  login:async(call: any, callback: any)=>{
    try{
    console.log('login service cotroller',call.request);
    const email=call.request.email;
    const password=call.request.password
console.log(email,password,'login controler');

    // const userdata=call.Request
    const userdata={
      email,
      password
    }
    console.log('userdata',userdata);
    const loginResponse=await userService.verifyLogin(userdata)
    console.log(loginResponse,'in controller');
    callback (null,loginResponse)
    }catch (err) {
      callback(err);
    } 
  }
  
};
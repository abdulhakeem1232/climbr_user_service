import { Request } from "express";
import { userService } from "../services/userService";
import userRepository from "../repository/userRepository";
import * as grpc from "@grpc/grpc-js";


interface UserData {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export const UserController = {
  signup: async (call: any, callback: any) => {
    try {
      const userData: UserData = call.request;
      console.log(call.request, "came controller", userData);
      const response = await userService.userRegister(userData);
      console.log(response, "response from the service");
      if (response.success) {
        console.log("if", response.user_data);
        callback(null, { success: true, msg: "otp sended", otp: response.otp, data: response.user_data });
      } else {
        callback(null, { success: false, msg: "email already exist" });
      }
    } catch (err) {
      callback(err);
    }
  },
  otp: async (call: any, callback: any) => {
    try {
      const body = call.request;
      console.log("Request Body:", body);
      const otp = body.otp;
      console.log("OTP from cookie:", otp);
      const userdata = body.userdata;
      console.log("Cookie from user data:", userdata);
      const enterOtp = body.enterOtp;
      console.log("User enter otp:", enterOtp);
      const otpResponse = await userService.verifyOtp(enterOtp, otp, userdata);
      console.log(otpResponse, 'otpresponse');
      callback(null, otpResponse);
    } catch (err) {
      callback(err);
    }
  },
  login: async (call: any, callback: any) => {
    try {
      console.log('login service cotroller', call.request);
      const email = call.request.email;
      const password = call.request.password
      console.log(email, password, 'login controler');

      // const userdata=call.Request
      const userdata = {
        email,
        password
      }
      console.log('userdata', userdata);
      const loginResponse = await userService.verifyLogin(userdata)
      console.log(loginResponse, 'in controller');

      if (loginResponse && loginResponse.issuccess) {
        callback(null, {
          isAdmin: loginResponse.isAdmin,
          success: loginResponse.issuccess,
          user: loginResponse.user
        });
      } else {
        callback(null, { success: loginResponse })
      }
    } catch (err) {
      callback(err);
    }
  },
  loginWithGoogle: async (call: any, callback: any) => {
    try {
      console.log('logingoogle service cotroller', call.request);
      const credential = call.request
      const response = await userService.authenticateWithGoogle(credential)
      console.log(response, 'authresponse----');
      callback(null, { success: response.success, user: response.user });
    } catch (err) {
      callback(err);
    }
  },
  getall: async (call: any, callback: any) => {
    try {
      console.log('get controlerr');
      let users = await userRepository.getall()
      console.log(users, 'uuu');
      const response = {
        users: users
      };
      callback(null, response)
    } catch (err) {
      callback(err);
    }
  },
  updateStatus: async (call: any, callback: any) => {
    try {
      console.log('get controlerrstatus upadte');
      let user = await userRepository.findByEmail(call.request.email)
      let update, users;
      if (user) {
        update = await userRepository.updateStatus(user)
      }
      if (update) {
        users = await userRepository.getall()
      }
      console.log(user, 'uuu');
      const response = {
        users: users
      };
      callback(null, response)
    } catch (err) {
      callback(err);
    }
  },
  validateEmail: async (call: any, callback: any) => {
    try {
      let emailValidate = await userService.validateEmail(call.request.email)
      console.log(emailValidate);
      callback(null, emailValidate)
    } catch (err) {
      callback(err);
    }
  },
  passwordOtp: async (call: any, callback: any) => {
    try {
      console.log(call.request, 'came pssaowed otp')
      let enterOtp = call.request.enteredOtp;
      let otp = call.request.otp;
      let email = call.request.email;
      let response = await userService.otpPassword(enterOtp, otp)
      callback(null, response)
    } catch (err) {
      callback(err)
    }
  },
  resertPassword: async (call: any, callback: any) => {
    try {
      const email = call.request.email
      const password = call.request.password
      console.log(email, password, 'reserwea', call.request);

      const response = await userService.resetpassword(email, password)
      callback(null, response)
    }
    catch (err) {
      callback(err)
    }
  },
  resendOtp: async (call: any, callback: any) => {
    try {
      const email = call.request.email;
      console.log(call.request);

      let response = await userService.sendMail(email)
      callback(null, response)
    }
    catch (err) {
      callback(err)
    }
  },
  userData: async (call: any, callback: any) => {
    try {
      let userdata = await userRepository.findById(call.request.userId)
      console.log(userdata, '-----');
      callback(null, userdata)
    } catch (err) {
      callback(err)
    }
  },
  jobStatus: async (call: any, callback: any) => {
    try {
      const { userid, jobid, status } = call.request
      console.log(userid, jobid, status);
      let response = await userService.jobstatus(userid, jobid, status)
      callback(null, response)
    } catch (err) {
      callback(err)
    }
  },
  getStatus: async (call: any, callback: any) => {
    try {
      const { userId } = call.request;
      let response = await userRepository.getStatus(userId)
      console.log('controller', response);
      callback(null, response)
    } catch (err) {
      callback(err)
    }
  },

};

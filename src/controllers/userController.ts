import { userService } from "../services/userService";
import userRepository from "../repository/userRepository";

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
      const response = await userService.userRegister(userData);
      if (response.success) {
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
      const otp = body.otp;
      const userdata = body.userdata;
      const enterOtp = body.enterOtp;
      const otpResponse = await userService.verifyOtp(enterOtp, otp, userdata);
      callback(null, otpResponse);
    } catch (err) {
      callback(err);
    }
  },

  login: async (call: any, callback: any) => {
    try {
      console.log(call.request);
      const email = call.request.email;
      const password = call.request.password
      const userdata = {
        email,
        password
      }
      const loginResponse = await userService.verifyLogin(userdata)
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
      console.log(err, 'eror while login')
      callback(err);
    }
  },

  loginWithGoogle: async (call: any, callback: any) => {
    try {
      const credential = call.request
      const response = await userService.authenticateWithGoogle(credential)
      callback(null, { success: response.success, user: response.user });
    } catch (err) {
      callback(err);
    }
  },

  getall: async (call: any, callback: any) => {
    try {
      let users = await userRepository.getall()
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
      let user = await userRepository.findByEmail(call.request.email)
      let update, users;
      if (user) {
        update = await userRepository.updateStatus(user)
      }
      if (update) {
        users = await userRepository.getall()
      }
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
      callback(null, emailValidate)
    } catch (err) {
      callback(err);
    }
  },

  passwordOtp: async (call: any, callback: any) => {
    try {
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
      callback(null, userdata)
    } catch (err) {
      callback(err)
    }
  },

  jobStatus: async (call: any, callback: any) => {
    try {
      const { userid, jobid, status } = call.request
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
      callback(null, response)
    } catch (err) {
      callback(err)
    }
  },

  getUserDetails: async (call: any, callback: any) => {
    try {
      const { userId } = call.request;
      let response = await userRepository.getUser(userId)
      callback(null, response)
    } catch (err) {
      callback(err)
    }
  },

};

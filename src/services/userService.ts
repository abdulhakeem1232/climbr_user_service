import userRepository from "../repository/userRepository";
import { OAuth2Client } from "google-auth-library";
import UserModel, { IUser } from "../models/userModel";
import { generateOTP } from "../utils/generateotp";
import { emailVerification } from "../utils/sendmail";
import dotenv from "dotenv";

dotenv.config();
interface User {
    username: string;
    email: string;
    mobile: string;
    password: string;
}
interface Login {
    email: string;
    password: string;
}
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const userService = {
    userRegister: async (userData: Partial<IUser>): Promise<{ success: boolean, message: string, otp?: string, user_data?: User }> => {
        try {
            const email = userData.email
            if (email === undefined) {
                throw new Error("Email is undefined");
            }
            const emailExist = await userRepository.findByEmail(email);
            if (emailExist) {
                return { success: false, message: "Email already exists" };
            }
            let otp = generateOTP()
            console.log(otp);

            await emailVerification(email, otp)
            console.log('email sended');
            const user_data: User = {
                username: userData.username || '',
                email: email || '',
                mobile: userData.mobile || '',
                password: userData.password || ''
            };
            return { success: true, message: "Verification email sent", otp: otp, user_data: user_data };
        } catch (error) {
            throw new Error(`Failed to sign up: ${error}`);
        }
    },

    verifyOtp: async (enterOtp: string, otp: string, userdatas: User) => {
        try {
            if (otp == enterOtp) {
                const userdata = await userRepository.createUser(userdatas);
                return { success: true, message: 'Correct OTP', userdata: userdata };
            } else {
                return { success: false, message: 'Invalid OTP' };
            }
        } catch (error) {
            throw new Error(`Failed to varify otp: ${error}`);
        }
    },

    verifyLogin: async (userdata: Login) => {
        try {
            const loginResponse = await userRepository.validateUser(userdata)
            return loginResponse
        } catch (err) {
            throw new Error(`Failed to sign in: ${err}`);
        }
    },

    authenticateWithGoogle: async (credential: any) => {
        try {
            const idToken = credential.credential;
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error("Google authentication failed: Payload is missing");
            }
            const userId = payload.sub;
            const email = payload.email;
            const name = payload.name;
            let user = await UserModel.findOne({ googleId: userId })
            if (!user) {
                user = new UserModel({
                    googleId: userId,
                    email,
                    username: name,
                    password: "defaultPassword",
                });
                await user.save();
            }
            return { user: user, success: true }
        } catch (err) {
            throw new Error(`Failed to sign in using google: ${err}`);
        }
    },

    validateEmail: async (email: string) => {
        try {
            const emailExist = await userRepository.findByEmail(email);
            if (emailExist) {
                let otp = generateOTP()
                await emailVerification(email, otp)
                return { success: true, otp: otp }
            } else {
                return { success: false }
            }

        } catch (err) {
            throw new Error(`Failed to validate Email: ${err}`);
        }
    },

    otpPassword: async (enterOtp: string, otp: string) => {
        try {
            if (enterOtp == otp) {
                return { success: true, msg: 'ForgotOtp' }
            } else {
                return { success: false, msg: 'ForgotOtp' }
            }
        } catch (err) {
            throw new Error(`Failed to validate otp for for got password: ${err}`);
        }
    },

    resetpassword: async (email: string, password: string) => {
        try {
            let passwordUpdate = await userRepository.updatePassword(email, password)
            return passwordUpdate
        } catch (err) {
            throw new Error(`Failed to reset password: ${err}`);
        }
    },
    sendMail: async (email: string) => {
        try {
            let otp = generateOTP()
            await emailVerification(email, otp)
            return { success: true, otp: otp }
        } catch (err) {
            throw new Error(`Failed to send mail: ${err}`);
        }
    },

    jobstatus: async (userid: string, jobid: string, status: string) => {
        try {
            let response = await userRepository.updatejobstatus(userid, jobid, status)
            return response
        } catch (err) {
            throw new Error(`Failed to update job status: ${err}`);
        }
    },

}



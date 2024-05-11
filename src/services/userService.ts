import userRepository from "../repository/userRepository";
import { OAuth2Client } from "google-auth-library";
import UserModel, { IUser } from "../models/userModel";
import { generateOTP } from "../utils/generateotp";
import { emailVerification } from "../utils/sendmail";
import dotenv from "dotenv";
import { response } from "express";
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
            console.log(userData, 'service');

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
            console.log(user_data, 'wiwi');

            return { success: true, message: "Verification email sent", otp: otp, user_data: user_data };
        } catch (error) {
            throw new Error(`Failed to sign up: ${error}`);
        }
    },
    verifyOtp: async (enterOtp: string, otp: string, userdata: User) => {
        try {
            console.log(otp, 'serviceotp');

            if (otp == enterOtp) {
                console.log(userdata, 'enkwenadk');

                const usercreated = await userRepository.createUser(userdata);
                return { success: true, message: 'Correct OTP' };

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
            console.log(loginResponse, 'gotbfrom rep');
            return loginResponse
        } catch (err) {
            throw new Error(`Failed to sign in: ${err}`);
        }
    },
    authenticateWithGoogle: async (credential: any) => {
        try {
            console.log('iuqekahdi');
            console.log('Credential received:', credential, typeof credential);
            const idToken = credential.credential;
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            console.log(ticket, 'ticket');

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
                console.log(otp, 'otp');
                await emailVerification(email, otp)
                console.log('email sended');
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
            console.log(otp, email);

            await emailVerification(email, otp)
            console.log('email sended');
            return { success: true, otp: otp }
        } catch (err) {
            throw new Error(`Failed to send mail: ${err}`);
        }
    }



}



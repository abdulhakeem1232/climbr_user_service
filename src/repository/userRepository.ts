import UserModel, { IUser } from "../models/userModel";
import bcrypt from "bcryptjs";
import { userService } from "../services/userService";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";
import dotenv from 'dotenv'
import { status } from "@grpc/grpc-js";

dotenv.config()

const access_key = process.env.ACCESS_KEY
const secret_access_key = process.env.SECRET_ACCESS_KEY
const bucket_region = process.env.BUCKET_REGION
const bucket_name = process.env.BUCKET_NAME

const s3: S3Client = new S3Client({
    credentials: {
        accessKeyId: access_key || '',
        secretAccessKey: secret_access_key || ''
    },
    region: process.env.BUCKET_REGION
});

interface User {
    username: string;
    email: string;
    mobile: string
    password: string;
    isActive?: boolean;
    avatar?: string;
}
interface Login {
    email: string;
    password: string;
}


const userRepository = {
    findByEmail: async (email: string): Promise<IUser | null> => {
        try {
            const user = await UserModel.findOne({ email })
            console.log('rep');
            return user
        } catch (err) {
            console.error(`Error finding user by email: ${err}`);
            return null;
        }
    },
    createUser: async (userdatas: Partial<IUser>) => {
        try {
            console.log(userdatas, 'reposuserdata', userdatas.email, userdatas.password, typeof (userdatas));
            const latestdata = userdatas
            console.log(latestdata, 'latseeetetet', typeof (userdatas));
            const email = userdatas.email
            let created = await UserModel.create({
                username: userdatas.username,
                email: userdatas.email,
                mobile: userdatas.mobile,
                password: userdatas.password
            });
            console.log('createdresult', created);
            await created.save()
            const userdata = await UserModel.findOne({ email: userdatas.email })
            const getObjectParams = {
                Bucket: bucket_name,
                Key: userdata?.avatar,
            }
            const getObjectCommand = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
            if (userdata) {
                userdata.avatar = url
            }

            return userdata
        } catch (err) {
            console.log('Error', err);

        }
    },
    validateUser: async (userdata: Login) => {
        try {
            const user = await UserModel.findOne({ email: userdata.email });
            console.log(user);
            if (user?.isActive == false) return false
            if (user) {
                console.log(userdata.password);

                const passwordvalue = await bcrypt.compare(userdata.password, user.password);
                // let passwordvalue=userdata.password==user.password
                console.log(passwordvalue, 'pass');
                const getObjectParams = {
                    Bucket: bucket_name,
                    Key: user?.avatar,
                }
                const getObjectCommand = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                if (user) {
                    user.avatar = url
                }
                if (passwordvalue) {
                    return { issuccess: true, isAdmin: user.isAdmin, user: user }
                }
            }
            return false
        } catch (err) {
            console.log('error', err);

        }
    },
    getall: async () => {
        try {
            const users = await UserModel.find({ isAdmin: false }, { '_id': 1, 'username': 1, 'email': 1, 'mobile': 1, 'isActive': 1 })
            console.log('users', users);
            return users
        } catch (err) {
            console.error(`Error on getting all user: ${err}`);
            return null;
        }
    },
    updateStatus: async (User: User) => {
        try {
            const user = await UserModel.updateOne({ email: User.email }, { $set: { isActive: !User.isActive } })
            console.log('user', user);
            return true
        } catch (err) {
            console.error(`Error on getting all user: ${err}`);
            return null;
        }
    },
    updatePassword: async (email: string, password: string) => {
        try {
            let user = await UserModel.findOne({ email: email })
            if (user) {

                user.password = password;
                await user.save();
                console.log('updated password');

                return { success: true }
            }
            else {
                return { success: false }
            }
        } catch (err) {
            console.error(`Error on update passowrd ${err}`);
            return null;
        }
    },
    findById: async (userId: string) => {
        try {
            let user = await UserModel.findOne({ _id: userId })
            const getObjectParams = {
                Bucket: bucket_name,
                Key: user?.avatar,
            }
            const getObjectCommand = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
            if (user) {
                user.avatar = url
            }
            return user
        } catch (err) {
            console.error(`Error on update passowrd ${err}`);
            return null;
        }
    },
    updatejobstatus: async (userid: string, jobid: string, status: string) => {
        try {
            const user = await UserModel.findById(userid);
            if (!user) {
                console.log(`User with ID ${userid} not found`);
                return false;
            }
            const existingJobIndex = user.appliedJobs.findIndex(job => String(job.jobId) == jobid);
            if (existingJobIndex !== -1) {

                user.appliedJobs[existingJobIndex].status = status;
            } else {
                const jobIdObjectId = new mongoose.Types.ObjectId(jobid);

                user.appliedJobs.push({ jobId: jobIdObjectId, status });
            }


            await user.save();
            console.log(`Job status updated successfully for user ${userid}, job ${jobid}`);
            return true;
        } catch (err) {
            console.error(`Error on getting all user: ${err}`);
            return null;
        }
    },
    getStatus: async (userId: string) => {
        try {
            let user = await UserModel.findOne({ _id: userId })
            console.log(user?.isActive, 'suthstakwenwk');
            let status = user?.isActive
            return { status }
        } catch (err) {
            console.error(`Error on getting user status: ${err}`);
            return null;
        }
    },

}

export default userRepository

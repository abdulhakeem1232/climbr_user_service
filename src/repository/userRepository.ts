import UserModel, { IUser } from "../models/userModel";
import bcrypt from "bcryptjs";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";
import dotenv from 'dotenv'
import { Types } from 'mongoose';

dotenv.config()

const access_key = process.env.ACCESS_KEY
const secret_access_key = process.env.SECRET_ACCESS_KEY
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
            return user
        } catch (err) {
            console.error(`Error finding user by email: ${err}`);
            return null;
        }
    },

    createUser: async (userdatas: Partial<IUser>) => {
        try {
            const latestdata = userdatas
            const email = userdatas.email
            let created = await UserModel.create({
                username: userdatas.username,
                email: userdatas.email,
                mobile: userdatas.mobile,
                password: userdatas.password
            });
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
            if (user?.isActive == false) return false
            if (user) {
                const passwordvalue = await bcrypt.compare(userdata.password, user.password);
                const getObjectParams = {
                    Bucket: bucket_name,
                    Key: user?.avatar,
                }
                const getObjectCommand = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                if (user) {
                    user.avatar = url
                }
                const getObjectParams2 = {
                    Bucket: bucket_name,
                    Key: user?.banner,
                }
                const getObjectCommand2 = new GetObjectCommand(getObjectParams2);
                const url2 = await getSignedUrl(s3, getObjectCommand2, { expiresIn: 3600 });
                if (user) {
                    user.banner = url2
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
            return users
        } catch (err) {
            console.error(`Error on getting all user: ${err}`);
            return null;
        }
    },

    updateStatus: async (User: User) => {
        try {
            const user = await UserModel.updateOne({ email: User.email }, { $set: { isActive: !User.isActive } })
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

    findById: async (userId: string | Types.ObjectId) => {
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
            const getObjectParams2 = {
                Bucket: bucket_name,
                Key: user?.banner,
            }
            const getObjectCommand2 = new GetObjectCommand(getObjectParams2);
            const url2 = await getSignedUrl(s3, getObjectCommand2, { expiresIn: 3600 });
            if (user) {
                user.banner = url2
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
            return true;
        } catch (err) {
            console.error(`Error on getting all user: ${err}`);
            return null;
        }
    },

    getStatus: async (userId: string) => {
        try {
            let user = await UserModel.findOne({ _id: userId })
            let status = user?.isActive
            return { status }
        } catch (err) {
            console.error(`Error on getting user status: ${err}`);
            return null;
        }
    },

    getUser: async (userId: string) => {
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
            const getObjectParams2 = {
                Bucket: bucket_name,
                Key: user?.banner,
            }
            const getObjectCommand2 = new GetObjectCommand(getObjectParams2);
            const url2 = await getSignedUrl(s3, getObjectCommand2, { expiresIn: 3600 });
            if (user) {
                user.banner = url2
            }
            return user
        } catch (err) {
            console.error(`Error on getting user status: ${err}`);
            return null;
        }
    },

    updateCover: async (userId: string, image: string) => {
        try {
            let response = await UserModel.updateOne({ _id: userId }, { $set: { banner: image } })
            if (response.modifiedCount > 0) {
                return { success: true, message: 'Cover Image updated successfully' };
            } else {
                return { success: false, message: 'No image was updated' };
            }

        } catch (err) {
            console.error(`Error on user cover: ${err}`);
            return null;
        }
    },

    updateProfile: async (userId: string, image: string) => {
        try {
            let response = await UserModel.updateOne({ _id: userId }, { $set: { avatar: image } })
            if (response.modifiedCount > 0) {
                return { success: true, message: 'Profile Image updated successfully' };
            } else {
                return { success: false, message: 'No image was updated' };
            }

        } catch (err) {
            console.error(`Error on user cover: ${err}`);
            return null;
        }
    },

    updateProfileData: async (userId: string, mobile: string, header: string) => {
        try {
            let response = await UserModel.updateOne({ _id: userId }, { $set: { mobile: mobile, header: header } })
            if (response.modifiedCount > 0) {
                return { success: true, message: 'Profile Data updated successfully' };
            } else {
                return { success: false, message: 'No image was updated' };
            }

        } catch (err) {
            console.error(`Error on user cover: ${err}`);
            return null;
        }
    },

    updateEducationData: async (userId: string, school: string, degree: string, field: string, started: string, ended: string) => {
        try {
            let response = await UserModel.updateOne({ _id: userId }, { $push: { education: { school, degree, field, started, ended } } })
            if (response.modifiedCount > 0) {
                return { success: true, message: 'Profile Data updated successfully' };
            } else {
                return { success: false, message: 'No image was updated' };
            }

        } catch (err) {
            console.error(`Error on user cover: ${err}`);
            return null;
        }
    },

    updateExperienceData: async (userId: string, company: string, role: string, started: string, ended: string) => {
        try {
            let response = await UserModel.updateOne({ _id: userId }, { $push: { experience: { company, role, started, ended } } })
            if (response.modifiedCount > 0) {
                return { success: true, message: 'Profile Data updated successfully' };
            } else {
                return { success: false, message: 'No image was updated' };
            }

        } catch (err) {
            console.error(`Error on user cover: ${err}`);
            return null;
        }
    },

    updateSkillData: async (userId: string, skill: string) => {
        try {
            let response = await UserModel.updateOne({ _id: userId }, { $addToSet: { skills: { skill } } })
            if (response.modifiedCount > 0) {
                return { success: true, message: 'Profile Data updated successfully' };
            } else {
                return { success: false, message: 'No image was updated' };
            }
        } catch (err) {
            console.error(`Error on user cover: ${err}`);
            return null;
        }
    },

}

export default userRepository

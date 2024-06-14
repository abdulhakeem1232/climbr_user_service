import UserModel, { IUser } from "../models/userModel";
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
export const profileRepository = {
    getFollowings: async (userId: string) => {
        try {
            const user = await UserModel.findOne({ _id: userId });
            if (user) {
                const followings = user.following || [];
                const followers = user.followers || [];
                return { followings, followers };
            } else {
                console.error(`User with id ${userId} not found`);
                return { followings: [] };
            }

        } catch (err) {
            console.error(`Error finding user by email: ${err}`);
            return null;
        }
    },
    follow: async (userId: string, guestId: string) => {
        try {
            let following = await UserModel.updateOne({ _id: userId }, { $addToSet: { following: guestId } })
            let followers = await UserModel.updateOne({ _id: guestId }, { $addToSet: { followers: userId } })
            if (following.modifiedCount === 1 && followers.modifiedCount === 1) {
                return { success: true, message: 'Followed successfully' };
            } else {

                throw new Error('Failed to update followings and/or followers');
            }
        } catch (err) {
            console.error(`Error finding user by email: ${err}`);
            return null;
        }
    },
    unfollow: async (userId: string, guestId: string) => {
        try {
            let following = await UserModel.updateOne({ _id: userId }, { $pull: { following: guestId } })
            let followers = await UserModel.updateOne({ _id: guestId }, { $pull: { followers: userId } })
            if (following.modifiedCount === 1 && followers.modifiedCount === 1) {
                return { success: true, message: 'unFollowed successfully' };
            } else {

                throw new Error('Failed to update followings and/or followers');
            }
        } catch (err) {
            console.error(`Error finding user unfolloe: ${err}`);
            return null;
        }
    },
    searchUser: async (text: string) => {
        try {
            if (text.trim() == '') {
                let users: never[] = []
                return { users };
            }
            const regex = new RegExp(text, 'i');
            const users = await UserModel.find({
                username: regex
            });
            for (let user of users) {
                const getObjectParams = {
                    Bucket: bucket_name,
                    Key: user.avatar,
                }

                const getObjectCommand = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                user.avatar = url
            }
            console.log(users, 'in repos');

            return { users };
        } catch (err) {
            console.error(`Error finding searching user: ${err}`);
            return null;
        }
    },
    logout: async (userId: string) => {
        try {
            const now = new Date();
            await UserModel.updateOne({ _id: userId }, { $set: { lastLogged: now } })
            return { success: true, message: "Logout Successfully" }
        } catch (err) {
            console.error(`Error logout user: ${err}`);
            return null;
        }
    },

}

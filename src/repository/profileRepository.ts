import UserModel from "../models/userModel";
import { Types } from 'mongoose';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export const profileRepository = {
    getFollowings: async (userId: string) => {
        try {
            const user = await UserModel.findOne({ _id: userId });
            if (user) {
                const followings = user.following || [];
                const followers = user.followers || [];
                return { followings, followers };
            } else {
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
                username: regex, isAdmin: false
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

    getsuggestion: async (userId: string) => {
        try {
            const currentUser = await UserModel.findById(userId);
            if (!currentUser) {
                return {
                    msg: "No user found"
                };
            }
            const followingList = currentUser.following;
            const usersFollowedByFollowings = await UserModel.find({
                _id: { $in: followingList }
            }, 'following');

            let suggestedUserIds: Types.ObjectId[] = [];
            usersFollowedByFollowings.forEach(user => {
                suggestedUserIds = suggestedUserIds.concat(user.following);
            });

            suggestedUserIds = [...new Set(suggestedUserIds)];

            suggestedUserIds = suggestedUserIds.filter(id => !followingList.includes(id) && id.toString() !== userId);

            let users = await UserModel.find({
                _id: { $in: suggestedUserIds },
                email: { $ne: 'admin@gmail.com' }
            });
            if (users.length < 5) {
                const additionalUsers = await UserModel.find({
                    _id: { $nin: [...suggestedUserIds, ...followingList, userId] },
                    email: { $ne: 'admin@gmail.com' }
                }).limit(5 - users.length);

                users = users.concat(additionalUsers);
            }

            for (let user of users) {
                if (user.avatar) {
                    const getObjectParams = {
                        Bucket: bucket_name,
                        Key: user.avatar,
                    };
                    const getObjectCommand = new GetObjectCommand(getObjectParams);
                    const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                    user.avatar = url;
                }
            }
            return { users };
        } catch (err) {
            console.error(`Error fetching suggestions: ${err}`);
            return null;
        }
    },
    getChartDetails: async (currentYear: number, month: number) => {
        try {
            const userStats = await UserModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $eq: [{ $year: "$createdAt" }, currentYear]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.month": 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        count: 1
                    }
                }

            ])
            const result = Array.from({ length: month + 1 }, (_, i) => ({
                month: i + 1,
                count: 0
            }));
            userStats.forEach(stat => {
                const index = result.findIndex(r => r.month == stat.month);
                if (index !== -1) {
                    result[index].count = stat.count;
                }
            });
            let count = await UserModel.find({ isAdmin: false }).countDocuments()
            return { result, count }
        } catch (err) {
            console.error(`Error fetching chart: ${err}`);
            return null;
        }
    },
    updateJobStatus: async (jobId: string, userId: string, status: string) => {
        try {
            let user = await UserModel.findOne({ _id: userId })
            if (!user) {
                throw new Error(`user with ${userId} not found`);
            }
            user.appliedJobs.forEach((job) => {
                if (job.jobId.toString() == jobId) {
                    job.status = status
                }
            })
            user.save()
            return { success: true, msg: "Succefully Changed job Status" }
        } catch (err) {
            console.error(`Error update job status: ${err}`);
            return null;
        }
    }

} 

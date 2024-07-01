import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv'
import crypto from 'crypto'
import sharp from 'sharp'
import userRepository from "../repository/userRepository";
import { profileRepository } from "../repository/profileRepository";

dotenv.config()

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
const access_key = process.env.ACCESS_KEY
const secret_access_key = process.env.SECRET_ACCESS_KEY
const bucket_name = process.env.BUCKET_NAME
if (!access_key || !secret_access_key) {
    throw new Error("AWS credentials are not provided.");
}
const s3: S3Client = new S3Client({
    credentials: {
        accessKeyId: access_key,
        secretAccessKey: secret_access_key
    },
    region: process.env.BUCKET_REGION
});

export const profileController = {
    updateCoverPhoto: async (call: any, callback: any) => {
        try {
            const imageName = randomImageName()
            const buffer = await sharp(call.request.image.buffer).resize({ height: 920, width: 1820, fit: "cover" }).toBuffer()
            const params = {
                Bucket: bucket_name,
                Key: imageName,
                Body: buffer,
                ContetType: call.request.image.mimetype,
            }
            const command = new PutObjectCommand(params)
            await s3.send(command)
            let response = await userRepository.updateCover(call.request.userId, imageName)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    updateProfilePhoto: async (call: any, callback: any) => {
        try {
            const imageName = randomImageName()
            const buffer = await sharp(call.request.image.buffer).resize({ height: 920, width: 920, fit: "cover" }).toBuffer()
            const params = {
                Bucket: bucket_name,
                Key: imageName,
                Body: buffer,
                ContetType: call.request.image.mimetype,
            }
            const command = new PutObjectCommand(params)
            await s3.send(command)
            let response = await userRepository.updateProfile(call.request.userId, imageName)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    updateProfileData: async (call: any, callback: any) => {
        try {
            const { id, mobile, header } = call.request;
            let response = await userRepository.updateProfileData(id, mobile, header)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    updateEducationData: async (call: any, callback: any) => {
        try {
            const { userId, school, degree, field, started, ended } = call.request
            let response = await userRepository.updateEducationData(userId, school, degree, field, started, ended)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    updateExperienceData: async (call: any, callback: any) => {
        try {
            const { userId, company, role, started, ended } = call.request
            let response = await userRepository.updateExperienceData(userId, company, role, started, ended)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    updateSkills: async (call: any, callback: any) => {
        try {
            const { userId, skill } = call.request
            let response = await userRepository.updateSkillData(userId, skill)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    getFollowings: async (call: any, callback: any) => {
        try {
            const { userId } = call.request
            let response = await profileRepository.getFollowings(userId)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    follow: async (call: any, callback: any) => {
        try {
            const { userId, guestId } = call.request
            let response = await profileRepository.follow(userId, guestId)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    unfollow: async (call: any, callback: any) => {
        try {
            const { userId, guestId } = call.request
            let response = await profileRepository.unfollow(userId, guestId)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    searchUser: async (call: any, callback: any) => {
        try {
            const { text } = call.request
            let response = await profileRepository.searchUser(text)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    logout: async (call: any, callback: any) => {
        try {
            const { userId } = call.request
            let response = await profileRepository.logout(userId)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    getSuggestion: async (call: any, callback: any) => {
        try {
            const { userId } = call.request
            let response = await profileRepository.getsuggestion(userId)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

    getUserChartData: async (call: any, callback: any) => {
        try {
            const currentYear = new Date().getFullYear()
            let response = await profileRepository.getChartDetails(currentYear)
            callback(null, response)
        } catch (err) {
            callback(err)
        }
    },

}

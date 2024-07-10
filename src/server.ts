import dotenv from 'dotenv'
import path from 'path'
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { UserController } from './controllers/userController';
import { profileController } from './controllers/profileController';
import { connectDB } from './config/db';

dotenv.config()
connectDB()

const packageDefinition = protoLoader.loadSync(path.join(__dirname, "proto/user.proto"))
const userProto = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server();

const grpcServer = () => {
  server.bindAsync(
    `0.0.0.0:${process.env.USER_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.log(err, "error happened grpc user service");
        return;
      }
      console.log("grpc user server started on port:", port);
    }
  );
};

server.addService(userProto.UserServices.service, {
  Register: UserController.signup,
  OtpVerify: UserController.otp,
  Login: UserController.login,
  LoginwithGoogle: UserController.loginWithGoogle,
  Getall: UserController.getall,
  UpdateStatus: UserController.updateStatus,
  EmailValidate: UserController.validateEmail,
  Passwordotp: UserController.passwordOtp,
  Passwordreset: UserController.resertPassword,
  ResendOtp: UserController.resendOtp,
  GetUserData: UserController.userData,
  UpdateJobStatus: UserController.jobStatus,
  GetStatus: UserController.getStatus,
  UserDetails: UserController.getUserDetails,
  UpdateCover: profileController.updateCoverPhoto,
  UpdateProfile: profileController.updateProfilePhoto,
  UpdateProfileData: profileController.updateProfileData,
  UpdateEducationData: profileController.updateEducationData,
  UpdateExperienceData: profileController.updateExperienceData,
  UpdateSkillsData: profileController.updateSkills,
  GetFollowings: profileController.getFollowings,
  FollowUser: profileController.follow,
  UnFollowUser: profileController.unfollow,
  SearchUser: profileController.searchUser,
  Logout: profileController.logout,
  Suggestion: profileController.getSuggestion,
  GetReports: profileController.getUserChartData,
  updateJobStatus: profileController.updateJobStatus,
})

grpcServer();

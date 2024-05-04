import mongoose from "mongoose";
import * as dotenv from 'dotenv'; 
dotenv.config();

 const connectDB=async()=>{
    try {
        const conn = await mongoose.connect(
          `${process.env.MONGODB_URL}`
        );
        console.log(`db connected successfully`);
      } catch (error: any) {
        console.log(error.message);
        process.exit(1);
      }
}


export {connectDB}
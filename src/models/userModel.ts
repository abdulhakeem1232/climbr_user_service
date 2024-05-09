import mongoose,{Document,Schema} from "mongoose";
import bcrypt from 'bcryptjs'

export interface IUser extends Document{
    username:string;
    googleId?:string;
    email:string;
    mobile:string;
    avatar?:string;
    education?:string[];
    skills?:string[];
    isAdmin:boolean
    isActive:boolean;
    password:string; 
    matchPassword: (enteredPassword: string) => Promise<boolean>
}

const UserSchema :Schema<IUser>=new Schema({
    username:{
        type:String,
        required:true
    },
    googleId:{
        type:String,
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
    },
    avatar:{
        type:String,
        required:false
    },
    education:[{
        type:String,
        required:false
    }],
    skills:[{
        type:String,
        required:false
    }],
    isAdmin:{
        type:Boolean,
required:true,
default:false
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    password:{
        type:String,
        
    }
})

//pre-save password
UserSchema.pre<IUser>('save',async function (next) {
    if (!this.isModified("password")) {
        return next();
      }
    
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt); 
      next();
    });

UserSchema.methods.matchPassword=async function(eneteredpassword:string){
    return await bcrypt.compare(eneteredpassword,this.password)
}
const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;

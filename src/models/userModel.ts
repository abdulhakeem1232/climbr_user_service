import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
    username: string;
    googleId?: string;
    email: string;
    mobile: string;
    avatar?: string;
    education?: { school: string, degree: string, field: string, started: Date, ended: Date }[];
    skills?: string[];
    experience?: { company: string, role: string, started: Date, ended: Date }[];
    header?: string;
    banner?: string;
    isAdmin: boolean
    isActive: boolean;
    password: string;
    appliedJobs: { jobId: mongoose.Types.ObjectId, status: string }[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    lastLogged: string;
    matchPassword: (enteredPassword: string) => Promise<boolean>
    updatePassword(newPassword: string): Promise<void>;
}

const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
    },
    avatar: {
        type: String,
        required: false,
        default: "profile.png"
    },
    education: [{
        school: String,
        degree: String,
        field: String,
        started: Date,
        ended: Date
    }],
    skills: [{
        skill: String,
    }],
    experience: [{
        company: String,
        role: String,
        started: Date,
        ended: Date
    }],
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,

    },
    appliedJobs: [{
        jobId: { type: Schema.Types.ObjectId, ref: 'Jobs' },
        status: { type: String, default: 'applied' }
    }],
    header: {
        type: String
    },
    banner: {
        type: String,
        default: "coverphoto.jpg"
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
        }
    ],
    lastLogged: {
        type: String
    }
})

//pre-save password
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (eneteredpassword: string) {
    return await bcrypt.compare(eneteredpassword, this.password)
}
UserSchema.methods.updatePassword = async function (newPassword: string) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(newPassword, salt);
    await this.save();
};
const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;

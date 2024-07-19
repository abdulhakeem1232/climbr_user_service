import mongoose, { Document, Schema } from "mongoose";

export interface ISKILLS extends Document {
    skill: string;
    isDeleted: boolean
}

const SkillSchema: Schema<ISKILLS> = new Schema({
    skill: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
})


const SkillsModel = mongoose.model<ISKILLS>("Skills", SkillSchema);

export default SkillsModel;

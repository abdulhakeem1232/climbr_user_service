import SkillsModel, { ISKILLS } from "../models/skillsModel";


export const skillRepository = {
    getAllSkills: async (): Promise<{ skills: ISKILLS[] } | null> => {
        try {
            let skills = await SkillsModel.find({ isDeleted: false });
            return { skills }
        } catch (err) {
            console.error(`Error fget al skills: ${err}`);
            return null;
        }
    },
    addSkills: async (skill: string) => {
        try {
            let newSkill = await SkillsModel.create({ skill })
            return { skill: newSkill };
        } catch (err) {
            console.error(`Error adding skills: ${err}`);
            return null;
        }
    },
    updateSkill: async (id: string, skill: string): Promise<{ skill: ISKILLS } | null> => {
        try {
            const updatedSkill = await SkillsModel.findByIdAndUpdate(
                id,
                { skill },
                { new: true, runValidators: true }
            );
            return updatedSkill ? { skill: updatedSkill } : null;
        } catch (err) {
            console.error(`Error updating skill: ${err}`);
            return null;
        }
    },

    deleteSkill: async (id: string): Promise<{ success: boolean } | null> => {
        try {
            const result = await SkillsModel.updateOne({ _id: id }, { $set: { isDeleted: true } });
            return result ? { success: true } : { success: false };
        } catch (err) {
            console.error(`Error deleting skill: ${err}`);
            return null;
        }
    },
}


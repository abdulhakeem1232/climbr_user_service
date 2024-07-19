import { skillRepository } from "../repository/skillsRepository";


export const skillsService = {
    getall: async () => {
        try {
            let response = await skillRepository.getAllSkills()
            return response
        } catch (err) {
            throw new Error(`Failed to get skill: ${err}`);
        }
    },
    addSkill: async (skill: string) => {
        try {
            let response = await skillRepository.addSkills(skill)
            return response
        } catch (err) {
            throw new Error(`Failed to add skill: ${err}`);
        }
    },
    updateSkill: async (id: string, skill: string) => {
        try {
            let response = await skillRepository.updateSkill(id, skill)
            return response
        } catch (err) {
            throw new Error(`Failed to update skill: ${err}`);
        }
    },
    deleteSkill: async (id: string) => {
        try {
            let response = await skillRepository.deleteSkill(id)
            return response
        } catch (err) {
            throw new Error(`Failed to delete skill: ${err}`);
        }
    },
}

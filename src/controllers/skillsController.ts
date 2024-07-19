import { skillsService } from "../services/skillsService";

export const skillController = {
    getall: async (call: any, callback: any) => {
        try {
            let response = await skillsService.getall()
            callback(null, response);
        } catch (err) {
            callback(err);
        }
    },
    addSkill: async (call: any, callback: any) => {
        try {
            const { skill } = call.request
            let response = await skillsService.addSkill(skill)
            callback(null, response);
        } catch (err) {
            callback(err);
        }
    },
    updateSkill: async (call: any, callback: any) => {
        try {
            const { _id, skill } = call.request
            let response = await skillsService.updateSkill(_id, skill)
            callback(null, response);
        } catch (err) {
            callback(err);
        }
    },
    deleteSkill: async (call: any, callback: any) => {
        try {
            const { _id } = call.request
            let response = await skillsService.deleteSkill(_id)
            callback(null, response);
        } catch (err) {
            callback(err);
        }
    },

}

import UserModel,{ IUser } from "../models/userModel";
import bcrypt from "bcryptjs";

interface User {
    username: string;
    email: string;
    mobile:string|number;
    password:string;
   
}
interface Login {
    email: string;
    password:string; 
}
const userRepository={
    findByEmail:async(email:string): Promise<IUser| null>=>{
        try{
            const user=await UserModel.findOne({email})
            console.log('rep');
            return user
        }catch(err){
            console.error(`Error finding user by email: ${err}`);
            return null;
        }
    },
    createUser:async(userdata:Partial<IUser>)=>{
        try{
            console.log(userdata,'reposuserdata',userdata.email,userdata.password,typeof(userdata));
            const latestdata=userdata
            console.log(latestdata,'latseeetetet',typeof(userdata));
            
            let created=await UserModel.create({
                username: userdata.username,
                email: userdata.email,
                mobile: userdata.mobile,
                password: userdata.password  
            });
            console.log('createdresult',created);
            await created.save()
            return true
        }catch(err){
            console.log('Error',err);
            
        }
    },
    validateUser:async(userdata:Login)=>{
        try{
            const user=await UserModel.findOne({email:userdata.email});
            console.log(user);
            
            if(user){
                console.log(userdata.password);
                const passwordvalue=await bcrypt.compare(userdata.password, user.password);
                // let passwordvalue=userdata.password==user.password
                console.log(passwordvalue,'pass');
                if(passwordvalue){
                    return true
                }
            }
            return false
        }catch(err){
            console.log('error',err);
            
        }
    }


}  

export default userRepository

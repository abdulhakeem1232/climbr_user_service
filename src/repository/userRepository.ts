import UserModel,{ IUser } from "../models/userModel";
import bcrypt from "bcryptjs";

interface User {
    username: string;
    email: string;
    mobile:string
    password:string;
    isActive?:boolean;
   
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
            if(user?.isActive==false) return false
            if(user){
                console.log(userdata.password);
                const passwordvalue=await bcrypt.compare(userdata.password, user.password);
                // let passwordvalue=userdata.password==user.password
                console.log(passwordvalue,'pass');
                if(passwordvalue){
                    return {issuccess:true,isAdmin:user.isAdmin,user:user}
                }
            }
            return false
        }catch(err){
            console.log('error',err);
            
        }
    },
    getall:async()=>{
        try{
const users=await UserModel.find({isAdmin:false},{'_id':1,'username':1,'email':1,'mobile':1,'isActive':1})
console.log('users',users);
return users
        }catch(err){
            console.error(`Error on getting all user: ${err}`);
            return null;
        }
    },
    updateStatus:async(User:User)=>{
        try{
const user=await UserModel.updateOne({email:User.email},{$set:{isActive:!User.isActive}})
console.log('user',user);
return true
        }catch(err){
            console.error(`Error on getting all user: ${err}`);
            return null;
        }
    },


}  

export default userRepository

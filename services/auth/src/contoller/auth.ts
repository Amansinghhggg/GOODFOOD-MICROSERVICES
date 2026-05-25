import jwt from 'jsonwebtoken';
import {User} from '../model/User.js';
import tryCatch from '../middleware/trycatch.js'

const login = tryCatch(async (req, res) => {
    const { name, email, picture } = req.body;
    let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
        name,
        email,
        image:picture,
  })}
 const token = jwt.sign( {user}, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
    });
    res.status(201).json({ message: 'User registered successfully',
         token ,
        user});
});

const allowedRoles = ["customer","rider","owner"]
type Role = typeof allowedRoles[number]

const addUserRole = tryCatch(async (req, res) => {
    const userId = req.user?._id
    if(!userId) return res.status(401).json({message:"Unauthorized"})
    const { role } = req.body as {role: Role}
    if(!allowedRoles.includes(role)) return res.status(400).json({message:"Invalid role"})
    const user = await User.findById(userId)
    if(!user) return res.status(404).json({message:"User not found"})
    user.role = role
    await user.save()
    const token = jwt.sign( {user}, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
    });
    res.status(200).json({message:"Role added successfully", user})
})

const MyProfile = tryCatch(async (req, res) => {
    const userId = req.user?._id
    if(!userId) return res.status(401).json({message:"Unauthorized"})
    const user = await User.findById(userId)
    if(!user) return res.status(404).json({message:"User not found"})
    res.status(200).json({user})
})


 
export  { login, addUserRole, MyProfile }




    
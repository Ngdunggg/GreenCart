import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from'jsonwebtoken'

// đăng ký  : /api/user/register
export const  register =  async (req, res) =>  {
    try{
        const {name, email, password} = req.body

        if(!name || !email || !password) {
            return res.json({ success: false, message: "Missing Detail"})
        }
        const existingUser = await User.findOne({email})

        if (existingUser) {
            return res.json({success: false, message: "User already exists"})
        }

        const hashPassword = await bcrypt.hash(password,10)
        
        const user = await User.create({ name, email, password: hashPassword})

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' })
        
        res.cookie('token', token, {
            httpOnly: true,  // Ngăn Javascript truy cập vào cookie
            secure: process.env.NODE_ENV === "production",  // sử dụng secure cookie trong sản xuất
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //  CSRF protection
            maxAge: 7*24*60*60*1000,  // thời hạn của cookie  
        })

        return res.json({ success: true, user: {email: user.email, name: user.name}})
    } catch(err) {
        console.log(err.message)
        res.json({ success: false, message: err.message})
    }
}

// đăng nhập: http://localhost:5000/api/user/login
export const login = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password) {
            return res.json({ success: false, message: "Missing email or password"})
        }

        const user = await User.findOne({ email })
        if(!user) {
            return  res.json({ success: false, message: "User not found"})
        }

        if(!bcrypt.compareSync(password, user.password)){
            return res.json({ success: false, message: "Mật khẩu không hợp lệ"})
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.cookie('token', token, {
            httpOnly: true,  // Ngăn Javascript truy cập vào cookie
            secure: process.env.NODE_ENV === "production",  // sử dụng secure cookie trong sản xuất
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //  CSRF protection
            maxAge: 7*24*60*60*1000,  // thời hạn của cookie  
        })
        return res.json({ success: true, user: {email: user.email, name: user.name}})
    } catch(err){
        console.log(err.message)
        return res.json({ success: false, message: err.message})
    }
}

// checkAuth    /api/user/is-auth
export const isAuth = async (req, res) =>{
    try{
        // const {userId} = req.body
        // console.log(req.body.userId)
        const user = await User.findById(req.userId).select("-password") //lấy dữ của user trừ password
        return res.json({success: true, user})
    } catch(err){
        console.log(err.message)
        return res.json({success: false, message: err.message})
    }
}

// logout  /api/user/logout
export const logout = async (req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            sercure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        return res.json({success: true, message: "Logged Out"})
    }catch(err){
        console.log(err.message)
        return res.json({success: false, message: err.message})
    }
}
import jwt from 'jsonwebtoken'

// Login seller : /api/seller/login
export const sellerLogin = async (req, res) => {
    try{
        const { email, password } = req.body

        if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
            const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'})

            res.cookie('sellerToken', token, {
                httpOnly: true,  // Ngăn Javascript truy cập vào cookie
                secure: process.env.NODE_ENV === "production",  // sử dụng secure cookie trong sản xuất
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //  CSRF protection
                maxAge: 7*24*60*60*1000,  // thời hạn của cookie  
            })
            return res.json({success: true, message: "Login"})
        } else{
            return res.json({success: false, message: "Invalid"})
        }
    } catch(err){
        console.log(err.message)
        res.json({success:false, message: err.message})
    }
}

// CheckAuth /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
    try {
        return res.json({success: true})
    } catch(err){
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}

// Logout /api/seller/logout
export const sellerLogout = async (req, res) => {
    try{
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })

        return res.json({ success: true, message: "Logged Out"})
    } catch(err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}
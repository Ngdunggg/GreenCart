import Address from "../models/Address.js"

// add Address : api/address/add
export const addAddress = async (req, res) => {
    try {
        const { address } = req.body
        await Address.create({...address, userId: req.userId})
        res.json({success: true, message: "Them dia chi thanh cong"})
    } catch(err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}

// get Address : /api/address/get
export const getAddress = async (req, res) => {
    try {
        const address = await Address.find({userId: req.userId})
        
        res.json({success: true, address})
    } catch (err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}
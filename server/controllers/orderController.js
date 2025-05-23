import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from '../models/User.js'
import stripe from 'stripe'

// Place order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try{
        const { userId, items, address } = req.body
        if(!address || items.length === 0) {
            return res.json({success: false, message: "Invalid data"})
        }

        // Tính giá tiền
        const products = await Promise.all(
            items.map(item => Product.findById(item.product))
        );

        let amount = 0;
        for (let i = 0; i < items.length; i++) {
            amount += products[i].offerPrice * items[i].quantity;
        }

        // Thêm thuế 
        amount += Math.floor(amount * 0.02)

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        })

        return res.json({success: true, message: "Order Placed Successfully"})

    } catch(err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}

// Place order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try{
        const { userId, items, address } = req.body
        const {origin} = req.headers

        if(!address || items.length === 0) {
            return res.json({success: false, message: "Invalid data"})
        }

        //Tính giá tiền
        let productData = []
        let amount = 0

        for (const item of items) {
            const product = await Product.findById(item.product)

            if (!product) {
                throw new Error(`Product not found with ID: ${item.product}`)
            }

            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            })

            amount += product.offerPrice * item.quantity
        }

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
        })

        // Khởi tạo cổng thanh toán Stripe
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        //  tạo các line items trong stripe
        const line_items = productData.map((item) => {
            return  {
                price_data:{
                    currency: "usd",
                    product_data:  {
                        name: item.name  
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100
                },
                quantity: item.quantity,
            }
        })

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({success: true, url: session.url })

    } catch(err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}

//Stripe WebHook to verify payments action : /stripe
export const stripeWebhooks = async (req, res) => {
    // Khởi tạo cổng thanh toán Stripe
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

    const sig = req.headers["stripe-signature"]
    let event
    
    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECERT
        )
    } catch(err) {
        res.status(400).send(`Webhooks Error: ${err.message}`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded ":{
            const paymentIntent = event.data.object
            const paymentIntentId = paymentIntent.id

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            })

            const { orderId, userId } = session.data[0].metadata
            
            await Order.findByIdAndUpdate(orderId, {isPaid: true})

            await User.findByIdAndUpdate(userId, {cartItems: {}})
            break
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object
            const paymentIntentId = paymentIntent.id

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            })

            const { orderId } = session.data[0].metadata
            
            await Order.findByIdAndDelete(orderId)
            break
        }
        default: 
            console.error(`Xự kiện chưa được xử lý ${event.type}`)
            break
    }
    res.json({received: true})
}

// Get Orders by User Id : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({createdAt: -1})

        res.json({success: true, orders})
    } catch (err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}


// Get all orders for seller/admin : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1})
        
        res.json({success: true, orders})
    } catch(err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    }
}


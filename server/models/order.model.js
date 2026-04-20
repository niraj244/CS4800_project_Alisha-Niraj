import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    products: [
        {
            productId: String,
            productTitle: String,
            quantity: Number,
            price: Number,
            image: String,
            subTotal: Number,
        },
    ],
    paymentId: { type: String, default: '' },
    payment_status: { type: String, default: 'PENDING' },
    payment_gateway: { type: String, enum: ['esewa', 'khalti', 'cod', ''], default: '' },
    order_status: { type: String, default: 'confirm' },
    delivery_address: { type: mongoose.Schema.Types.ObjectId, ref: 'address' },
    totalAmt: { type: Number, default: 0 },
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });

const OrderModel = mongoose.model('order', orderSchema);
export default OrderModel;

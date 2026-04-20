import mongoose from 'mongoose';

// Replaces the in-memory Map used for eSewa pending orders.
// Persists across server restarts and is safe for multi-instance deploys.
const pendingPaymentSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true, index: true },
    gateway: { type: String, enum: ['esewa', 'khalti'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: { type: Array, required: true },
    delivery_address: { type: mongoose.Schema.Types.ObjectId, ref: 'address', required: true },
    totalAmount: { type: Number, required: true },
    date: { type: String },
    // khalti-specific
    pidx: { type: String, default: '' },
    used: { type: Boolean, default: false },
}, { timestamps: true });

// TTL index: auto-delete records older than 2 hours
pendingPaymentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

const PendingPaymentModel = mongoose.model('PendingPayment', pendingPaymentSchema);
export default PendingPaymentModel;

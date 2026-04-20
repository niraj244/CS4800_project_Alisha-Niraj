import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    couponCode: { type: String, default: '' },
    source: { type: String, enum: ['home_capture', 'exit_intent', 'checkout'], default: 'home_capture' },
}, { timestamps: true });

const SubscriberModel = mongoose.model('Subscriber', subscriberSchema);
export default SubscriberModel;

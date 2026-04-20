import CouponModel from '../models/coupon.model.js';

export async function validateCouponController(req, res) {
    try {
        const { code, cartTotal } = req.body;
        if (!code) return res.status(400).json({ error: true, success: false, message: 'Coupon code required' });

        const coupon = await CouponModel.findOne({ code: code.toUpperCase().trim() });

        if (!coupon || !coupon.isActive) {
            return res.status(404).json({ error: true, success: false, message: 'Invalid or expired coupon' });
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return res.status(400).json({ error: true, success: false, message: 'Coupon has expired' });
        }
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ error: true, success: false, message: 'Coupon usage limit reached' });
        }
        if (coupon.restrictedToUserId && String(coupon.restrictedToUserId) !== String(req.userId)) {
            return res.status(403).json({ error: true, success: false, message: 'This coupon is not valid for your account' });
        }

        const discountAmt = Math.round((parseFloat(cartTotal) * coupon.discountPercent) / 100);

        return res.json({
            error: false,
            success: true,
            discount: coupon.discountPercent,
            discountAmt,
            newTotal: parseFloat(cartTotal) - discountAmt,
            code: coupon.code,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function redeemCouponController(req, res) {
    try {
        const { code } = req.body;
        const coupon = await CouponModel.findOne({ code: code.toUpperCase().trim() });
        if (!coupon) return res.status(404).json({ error: true, success: false, message: 'Coupon not found' });

        await CouponModel.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        return res.json({ error: false, success: true, message: 'Coupon redeemed' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

// Admin: create coupon
export async function createCouponController(req, res) {
    try {
        const { code, discountPercent, maxUses, expiresAt } = req.body;
        const coupon = await CouponModel.create({ code, discountPercent, maxUses: maxUses || null, expiresAt: expiresAt || null });
        return res.status(201).json({ error: false, success: true, coupon });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

// Admin: list coupons
export async function listCouponsController(req, res) {
    try {
        const coupons = await CouponModel.find().sort({ createdAt: -1 });
        return res.json({ error: false, success: true, coupons });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

// Admin: delete coupon
export async function deleteCouponController(req, res) {
    try {
        await CouponModel.findByIdAndDelete(req.params.id);
        return res.json({ error: false, success: true, message: 'Coupon deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

import cron from 'node-cron';
import CartProductModel from '../models/cartProduct.modal.js';
import UserModel from '../models/user.model.js';
import OrderModel from '../models/order.model.js';
import sendEmailFun from '../config/sendEmail.js';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

async function processAbandonedCarts() {
    try {
        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        const dayAgo = new Date(Date.now() - ONE_DAY_MS);

        // Find users who have stale carts
        const staleCarts = await CartProductModel.aggregate([
            { $match: { updatedAt: { $lt: cutoff } } },
            { $group: { _id: '$userId', items: { $push: '$$ROOT' }, updatedAt: { $max: '$updatedAt' } } },
        ]);

        for (const cart of staleCarts) {
            const userId = cart._id;
            const user = await UserModel.findById(userId).select('email name abandonedCartEmailSentAt');
            if (!user?.email) continue;

            // Skip if we already sent an email in the last 24h
            if (user.abandonedCartEmailSentAt && user.abandonedCartEmailSentAt > dayAgo) continue;

            // Skip if they placed an order in the last hour (successful checkout)
            const recentOrder = await OrderModel.findOne({ userId, createdAt: { $gte: cutoff } });
            if (recentOrder) continue;

            const firstItem = cart.items[0];
            const total = cart.items.reduce((s, i) => s + i.subTotal, 0);

            await sendEmailFun({
                sendTo: user.email,
                subject: 'You left something behind 👀 — VibeFit',
                text: `Complete your order at VibeFit. Total: रु ${total.toLocaleString()}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                        <h2 style="color: #0B0B0F;">Hey ${user.name}, your cart misses you!</h2>
                        <p>You left <strong>${cart.items.length} item${cart.items.length > 1 ? 's' : ''}</strong> worth <strong>रु ${total.toLocaleString()}</strong> in your cart.</p>
                        ${firstItem?.image ? `<img src="${firstItem.image}" alt="${firstItem.productTitle}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;">` : ''}
                        <p><strong>${firstItem?.productTitle || ''}</strong></p>
                        <a href="${(process.env.FRONTEND_URLS || '').split(',')[0].trim()}/cart"
                           style="display:inline-block;padding:12px 24px;background:#FF4D2E;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
                            Complete your order →
                        </a>
                        <p style="color:#6B7280;font-size:12px;margin-top:24px;">VibeFit — Your Confidence Matters</p>
                    </div>
                `,
            });

            await UserModel.findByIdAndUpdate(userId, { abandonedCartEmailSentAt: new Date() });
        }
    } catch (error) {
        console.error('Abandoned cart cron error:', error);
    }
}

export function startAbandonedCartCron() {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', processAbandonedCarts);
    console.log('Abandoned cart cron started');
}

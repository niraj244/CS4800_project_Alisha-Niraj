import crypto from 'crypto';
import fetch from 'node:http';
import PendingPaymentModel from '../models/pendingPayment.model.js';
import OrderModel from '../models/order.model.js';
import ProductModel from '../models/product.modal.js';
import UserModel from '../models/user.model.js';
import CartProductModel from '../models/cartProduct.modal.js';
import sendEmailFun from '../config/sendEmail.js';
import OrderConfirmationEmail from '../utils/orderEmailTemplate.js';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getEsewaPaymentUrl() {
    return process.env.ESEWA_ENVIRONMENT === 'live'
        ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
        : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
}

function getEsewaProductCode() {
    return process.env.ESEWA_ENVIRONMENT === 'live'
        ? (process.env.ESEWA_PRODUCT_CODE || '')
        : 'EPAYTEST';
}

function esewaSignature(totalAmount, transactionId) {
    const productCode = getEsewaProductCode();
    const data = `total_amount=${totalAmount},transaction_uuid=${transactionId},product_code=${productCode}`;
    return crypto.createHmac('sha256', process.env.ESEWA_SECRET_KEY).update(data).digest('base64');
}

function getKhaltiBaseUrl() {
    return process.env.KHALTI_ENVIRONMENT === 'live'
        ? 'https://khalti.com/api/v2'
        : 'https://dev.khalti.com/api/v2';
}

async function khaltiRequest(path, body) {
    const url = `${getKhaltiBaseUrl()}${path}`;
    const res = await globalThis.fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return res.json();
}

async function finaliseOrder({ pending, paymentId, gateway }) {
    const order = await OrderModel.create({
        userId: pending.userId,
        products: pending.products,
        paymentId,
        payment_status: 'COMPLETED',
        delivery_address: pending.delivery_address,
        totalAmt: pending.totalAmount,
        date: pending.date,
        payment_gateway: gateway,
    });

    // Update stock counts
    for (const item of pending.products) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
            await ProductModel.findByIdAndUpdate(item.productId, {
                countInStock: Math.max(0, product.countInStock - item.quantity),
                sale: (product.sale || 0) + item.quantity,
            });
        }
    }

    // Send confirmation email
    const user = await UserModel.findById(pending.userId);
    if (user?.email) {
        await sendEmailFun({
            sendTo: user.email,
            subject: 'Order Confirmed — VibeFit',
            text: '',
            html: OrderConfirmationEmail(user.name, order),
        });
    }

    // Clear cart
    await CartProductModel.deleteMany({ userId: String(pending.userId) });

    // Mark pending record as used (idempotency)
    await PendingPaymentModel.findByIdAndUpdate(pending._id, { used: true });

    return order;
}

// ─────────────────────────────────────────────────────────────
// eSewa — Initiate
// ─────────────────────────────────────────────────────────────
export async function initiateEsewaController(req, res) {
    try {
        const { userId, products, totalAmount, delivery_address, date } = req.body;

        if (!userId || !products || !totalAmount || !delivery_address) {
            return res.status(400).json({ error: true, success: false, message: 'Missing required fields' });
        }
        if (!process.env.ESEWA_MERCHANT_ID || !process.env.ESEWA_SECRET_KEY) {
            return res.status(500).json({ error: true, success: false, message: 'eSewa not configured' });
        }

        const transactionId = `VF-ESEWA-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const amount = parseFloat(totalAmount).toFixed(2);

        await PendingPaymentModel.create({
            transactionId,
            gateway: 'esewa',
            userId,
            products,
            delivery_address,
            totalAmount: parseFloat(amount),
            date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        });

        const baseUrl = process.env.BACKEND_URL;
        const signature = esewaSignature(amount, transactionId);

        return res.status(200).json({
            success: true,
            error: false,
            paymentUrl: getEsewaPaymentUrl(),
            formData: {
                amount,
                tax_amount: '0',
                total_amount: amount,
                transaction_uuid: transactionId,
                product_code: getEsewaProductCode(),
                product_service_charge: '0',
                product_delivery_charge: '0',
                success_url: `${baseUrl}/api/payments/esewa/success`,
                failure_url: `${baseUrl}/api/payments/esewa/failure`,
                signed_field_names: 'total_amount,transaction_uuid,product_code',
                signature,
            },
            transactionId,
        });
    } catch (error) {
        console.error('initiateEsewa error:', error);
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

// ─────────────────────────────────────────────────────────────
// eSewa — Success callback (redirect from eSewa gateway)
// ─────────────────────────────────────────────────────────────
export async function verifyEsewaController(req, res) {
    const frontendUrl = process.env.FRONTEND_URLS.split(',')[0].trim();
    try {
        const { transaction_uuid, total_amount, status } = req.query;

        if (!transaction_uuid) {
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        const pending = await PendingPaymentModel.findOne({ transactionId: transaction_uuid, gateway: 'esewa' });
        if (!pending || pending.used) {
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        if (status !== 'COMPLETE' && status !== 'success') {
            await PendingPaymentModel.findByIdAndDelete(pending._id);
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        // Amount integrity check — never trust client amounts
        if (Math.abs(parseFloat(total_amount) - pending.totalAmount) > 1) {
            console.error('eSewa amount mismatch', { received: total_amount, stored: pending.totalAmount });
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        // Verify signature returned by eSewa
        const expectedSig = esewaSignature(total_amount, transaction_uuid);
        if (req.query.signature && req.query.signature !== expectedSig) {
            console.error('eSewa signature mismatch');
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        await finaliseOrder({ pending, paymentId: transaction_uuid, gateway: 'esewa' });
        return res.redirect(`${frontendUrl}/order/success`);
    } catch (error) {
        console.error('verifyEsewa error:', error);
        return res.redirect(`${frontendUrl}/order/failed`);
    }
}

// ─────────────────────────────────────────────────────────────
// eSewa — Failure callback
// ─────────────────────────────────────────────────────────────
export async function esewaFailureController(req, res) {
    const frontendUrl = process.env.FRONTEND_URLS.split(',')[0].trim();
    try {
        const { transaction_uuid } = req.query;
        if (transaction_uuid) {
            await PendingPaymentModel.deleteOne({ transactionId: transaction_uuid });
        }
    } catch (_) {}
    return res.redirect(`${frontendUrl}/order/failed`);
}

// ─────────────────────────────────────────────────────────────
// Khalti — Initiate
// ─────────────────────────────────────────────────────────────
export async function initiateKhaltiController(req, res) {
    try {
        const { userId, products, totalAmount, delivery_address, date } = req.body;

        if (!userId || !products || !totalAmount || !delivery_address) {
            return res.status(400).json({ error: true, success: false, message: 'Missing required fields' });
        }
        if (!process.env.KHALTI_SECRET_KEY) {
            return res.status(500).json({ error: true, success: false, message: 'Khalti not configured' });
        }

        const transactionId = `VF-KHALTI-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const amountPaisa = Math.round(parseFloat(totalAmount) * 100); // Khalti uses paisa

        const baseUrl = process.env.BACKEND_URL;
        const frontendUrl = process.env.FRONTEND_URLS.split(',')[0].trim();

        const khaltiRes = await khaltiRequest('/epayment/initiate/', {
            return_url: `${baseUrl}/api/payments/khalti/verify`,
            website_url: frontendUrl,
            amount: amountPaisa,
            purchase_order_id: transactionId,
            purchase_order_name: 'VibeFit Order',
        });

        if (!khaltiRes.payment_url || !khaltiRes.pidx) {
            console.error('Khalti initiate failed:', khaltiRes);
            return res.status(502).json({ error: true, success: false, message: 'Khalti payment initiation failed' });
        }

        await PendingPaymentModel.create({
            transactionId,
            gateway: 'khalti',
            userId,
            products,
            delivery_address,
            totalAmount: parseFloat(totalAmount),
            date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            pidx: khaltiRes.pidx,
        });

        return res.status(200).json({
            success: true,
            error: false,
            paymentUrl: khaltiRes.payment_url,
            pidx: khaltiRes.pidx,
            transactionId,
        });
    } catch (error) {
        console.error('initiateKhalti error:', error);
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

// ─────────────────────────────────────────────────────────────
// Khalti — Verify callback (return_url)
// ─────────────────────────────────────────────────────────────
export async function verifyKhaltiController(req, res) {
    const frontendUrl = process.env.FRONTEND_URLS.split(',')[0].trim();
    try {
        const { pidx, purchase_order_id, status } = req.query;

        if (!pidx || status !== 'Completed') {
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        const pending = await PendingPaymentModel.findOne({
            transactionId: purchase_order_id,
            gateway: 'khalti',
            pidx,
        });

        if (!pending || pending.used) {
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        // Server-side lookup verification — never trust client status
        const lookup = await khaltiRequest('/epayment/lookup/', { pidx });

        if (lookup.status !== 'Completed') {
            console.error('Khalti lookup not Completed:', lookup);
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        // Amount integrity check (Khalti returns paisa)
        const receivedNpr = lookup.total_amount / 100;
        if (Math.abs(receivedNpr - pending.totalAmount) > 1) {
            console.error('Khalti amount mismatch', { received: receivedNpr, stored: pending.totalAmount });
            return res.redirect(`${frontendUrl}/order/failed`);
        }

        await finaliseOrder({
            pending,
            paymentId: `${pidx}|${lookup.transaction_id || ''}`,
            gateway: 'khalti',
        });

        return res.redirect(`${frontendUrl}/order/success`);
    } catch (error) {
        console.error('verifyKhalti error:', error);
        return res.redirect(`${frontendUrl}/order/failed`);
    }
}

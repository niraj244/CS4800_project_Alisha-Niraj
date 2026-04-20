import OrderModel from '../models/order.model.js';
import UserModel from '../models/user.model.js';

export const createOrderController = async (req, res) => {
    try {
        // Cash-on-delivery / manual order creation (payments go through payment.controller.js)
        const order = await OrderModel.create({
            userId: req.body.userId,
            products: req.body.products,
            paymentId: req.body.paymentId || '',
            payment_status: req.body.payment_status || 'PENDING',
            delivery_address: req.body.delivery_address,
            totalAmt: req.body.totalAmt,
        });

        return res.status(200).json({ error: false, success: true, message: 'Order placed', order });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
};

export async function getOrderDetailsController(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);

        const [orders, total] = await Promise.all([
            OrderModel.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('delivery_address userId'),
            OrderModel.countDocuments(),
        ]);

        return res.json({
            message: 'order list',
            data: orders,
            error: false,
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

export async function getUserOrderDetailsController(req, res) {
    try {
        const userId = req.userId;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const { status } = req.query;

        const filter = { userId };
        if (status && status !== 'all') {
            const statusMap = {
                processing: { $in: ['pending', 'confirm', 'processing'] },
                shipped: 'shipped',
                delivered: 'delivered',
                returns: 'returns',
            };
            if (statusMap[status]) filter.order_status = statusMap[status];
        }

        const [orders, total] = await Promise.all([
            OrderModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('delivery_address'),
            OrderModel.countDocuments(filter),
        ]);

        return res.json({
            message: 'order list',
            data: orders,
            error: false,
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

export async function getTotalOrdersCountController(req, res) {
    try {
        const count = await OrderModel.countDocuments();
        return res.status(200).json({ error: false, success: true, count });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

export async function updateOrderStatusController(req, res) {
    try {
        const { id, order_status } = req.body;
        await OrderModel.updateOne({ _id: id }, { order_status });
        return res.json({ message: 'Order status updated', success: true, error: false });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

export async function deleteOrder(req, res) {
    try {
        const deleted = await OrderModel.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Order not found', error: true, success: false });
        }
        return res.status(200).json({ success: true, error: false, message: 'Order deleted' });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

// Uses aggregation — does NOT load all orders into JS heap
export async function totalSalesController(req, res) {
    try {
        const currentYear = new Date().getFullYear();

        const [totals, monthly] = await Promise.all([
            OrderModel.aggregate([
                { $group: { _id: null, totalSales: { $sum: '$totalAmt' } } },
            ]),
            OrderModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lt: new Date(`${currentYear + 1}-01-01`),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        TotalSales: { $sum: '$totalAmt' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        const monthNames = ['JAN', 'FEB', 'MAR', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthlySales = monthNames.map((name, i) => {
            const found = monthly.find((m) => m._id === i + 1);
            return { name, TotalSales: found ? found.TotalSales : 0 };
        });

        return res.status(200).json({
            totalSales: totals[0]?.totalSales || 0,
            monthlySales,
            error: false,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

export async function totalUsersController(req, res) {
    try {
        const monthNames = ['JAN', 'FEB', 'MAR', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        const users = await UserModel.aggregate([
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const monthlyUsers = monthNames.map((name, i) => {
            const found = users.find((u) => u._id.month === i + 1);
            return { name, TotalUsers: found ? found.count : 0 };
        });

        return res.status(200).json({ TotalUsers: monthlyUsers, error: false, success: true });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: 'Internal server error' });
    }
}

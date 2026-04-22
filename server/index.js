import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { xss } from 'express-xss-sanitizer';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import connectDB from './config/connectDb.js';

import userRouter from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import myListRouter from './route/mylist.route.js';
import addressRouter from './route/address.route.js';
import homeSlidesRouter from './route/homeSlides.route.js';
import bannerV1Router from './route/bannerV1.route.js';
import bannerList2Router from './route/bannerList2.route.js';
import orderRouter from './route/order.route.js';
import logoRouter from './route/logo.route.js';
import paymentRouter from './route/payment.route.js';
import couponRouter from './route/coupon.route.js';

import { startAbandonedCartCron } from './utils/abandonedCart.cron.js';

const app = express();

// ── Logging ────────────────────────────────────────────────────
app.use(pinoHttp({ autoLogging: { ignore: (req) => req.url === '/healthz' } }));

// ── Security headers ───────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ── CORS — strict whitelist from env ──────────────────────────
const allowedOrigins = (process.env.FRONTEND_URLS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow server-to-server (no origin) and listed origins
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// ── Compression ────────────────────────────────────────────────
app.use(compression());

// ── Body parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// ── Sanitization (NoSQL injection + XSS) ──────────────────────
app.use(mongoSanitize());
app.use(xss());

// ── Global rate limit: 300 req / 15 min per IP ────────────────
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: 'Too many requests, please try again later.' },
}));

// Stricter limit on auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: true, message: 'Too many attempts, please try again later.' },
});

// ── Health check ───────────────────────────────────────────────
app.get('/healthz', (_req, res) => {
    const dbState = mongoose.connection.readyState;
    res.status(dbState === 1 ? 200 : 503).json({
        status: dbState === 1 ? 'ok' : 'db_unavailable',
        uptime: process.uptime(),
    });
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/user', userRouter);
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/myList', myListRouter);
app.use('/api/address', addressRouter);
app.use('/api/homeSlides', homeSlidesRouter);
app.use('/api/bannerV1', bannerV1Router);
app.use('/api/bannerList2', bannerList2Router);
app.use('/api/order', orderRouter);
app.use('/api/logo', logoRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/coupon', couponRouter);

// ── Sitemap ────────────────────────────────────────────────────
app.get('/sitemap.xml', async (_req, res) => {
    const SITE = process.env.FRONTEND_URLS?.split(',')[0]?.trim() || 'https://vibefit.vercel.app';
    const staticUrls = ['/', '/shop', '/collections/new-drops', '/collections/bestsellers', '/collections/sale', '/about', '/contact'];
    let productUrls = [];
    try {
        const { default: Product } = await import('./models/product.modal.js');
        const products = await Product.find({}, 'slug _id updatedAt').lean().limit(500);
        productUrls = products.map((p) => ({ loc: `/product/${p.slug || p._id}`, lastmod: p.updatedAt?.toISOString().split('T')[0] }));
    } catch {}
    const urlTags = [
        ...staticUrls.map((u) => `  <url><loc>${SITE}${u}</loc><changefreq>weekly</changefreq></url>`),
        ...productUrls.map((p) => `  <url><loc>${SITE}${p.loc}</loc><lastmod>${p.lastmod}</lastmod><changefreq>weekly</changefreq></url>`),
    ].join('\n');
    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags}\n</urlset>`);
});

// ── Global error handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    // Never leak stack traces to client
    res.status(status).json({
        error: true,
        success: false,
        message: status < 500 ? err.message : 'Internal server error',
    });
});

connectDB().then(() => {
    startAbandonedCartCron();
    app.listen(process.env.PORT, () => {
        console.log(`VibeFit API running on port ${process.env.PORT}`);
    });
});

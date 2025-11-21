import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/connectDb.js';
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import myListRouter from './route/mylist.route.js';
import addressRouter from './route/address.route.js';
import homeSlidesRouter from './route/homeSlides.route.js';
import bannerV1Router from './route/bannerV1.route.js';
import bannerList2Router from './route/bannerList2.route.js';
import blogRouter from './route/blog.route.js';
import orderRouter from './route/order.route.js';
import logoRouter from './route/logo.route.js';
import siteSettingsRouter from './route/siteSettings.route.js';

const app = express();

// CORS configuration to allow requests from Vercel frontend and localhost
app.use(cors({
    origin: [
        "https://cs-4800-project-alisha-niraj.vercel.app",
        "http://localhost:5173", // Vite default port
        "http://localhost:3000", // CRA default port
        "http://localhost:5174" // Alternative Vite port
    ],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options('*', cors())


app.use(express.json())
app.use(cookieParser())
// app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy: false
}))


app.get("/", (request, response) => {
    ///server to client
    response.json({
        message: "Server is running " + process.env.PORT
    })
})


app.use('/api/user',userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/product',productRouter);
app.use("/api/cart",cartRouter)
app.use("/api/myList",myListRouter)
app.use("/api/address",addressRouter)
app.use("/api/homeSlides",homeSlidesRouter)
app.use("/api/bannerV1",bannerV1Router)
app.use("/api/bannerList2",bannerList2Router)
app.use("/api/blog",blogRouter)
app.use("/api/order",orderRouter)
app.use("/api/logo",logoRouter)
app.use("/api/siteSettings",siteSettingsRouter)


connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is running", process.env.PORT);
    })
})
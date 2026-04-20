import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
    validateCouponController,
    redeemCouponController,
    createCouponController,
    listCouponsController,
    deleteCouponController,
} from '../controllers/coupon.controller.js';

const couponRouter = Router();

couponRouter.post('/validate', auth, validateCouponController);
couponRouter.post('/redeem', auth, redeemCouponController);
couponRouter.post('/create', auth, createCouponController);      // admin
couponRouter.get('/', auth, listCouponsController);               // admin
couponRouter.delete('/:id', auth, deleteCouponController);        // admin

export default couponRouter;

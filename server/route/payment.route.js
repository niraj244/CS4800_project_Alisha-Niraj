import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
    initiateEsewaController,
    verifyEsewaController,
    esewaFailureController,
    initiateKhaltiController,
    verifyKhaltiController,
} from '../controllers/payment.controller.js';

const paymentRouter = Router();

// eSewa
paymentRouter.post('/esewa/initiate', auth, initiateEsewaController);
paymentRouter.get('/esewa/success', verifyEsewaController);   // public — gateway redirect
paymentRouter.get('/esewa/failure', esewaFailureController);  // public — gateway redirect

// Khalti
paymentRouter.post('/khalti/initiate', auth, initiateKhaltiController);
paymentRouter.get('/khalti/verify', verifyKhaltiController);  // public — gateway redirect

export default paymentRouter;

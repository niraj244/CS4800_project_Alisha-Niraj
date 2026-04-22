import UserModel from '../models/user.model.js';
import SubscriberModel from '../models/subscriber.model.js';
import CouponModel from '../models/coupon.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmailFun from '../config/sendEmail.js';
import VerificationEmail from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ReviewModel from '../models/reviews.model.js.js';
import ProductModel from '../models/product.modal.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

const BCRYPT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────

export async function registerUserController(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Provide email, name, password', error: true, success: false });
        }

        let user = await UserModel.findOne({ email });

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashPassword = await bcryptjs.hash(password, BCRYPT_ROUNDS);

        if (user && user.verify_email) {
            return res.json({ message: 'User already registered with this email', error: true, success: false });
        }

        if (user && !user.verify_email) {
            user.name = name;
            user.password = hashPassword;
            user.otp = verifyCode;
            user.otpExpires = Date.now() + 600000;
            await user.save();
        } else {
            user = await UserModel.create({ email, password: hashPassword, name, otp: verifyCode, otpExpires: Date.now() + 600000 });
        }

        await sendEmailFun({
            sendTo: email,
            subject: 'Verify your VibeFit account',
            text: '',
            html: VerificationEmail(name, verifyCode),
        });

        const token = jwt.sign({ email: user.email, id: user._id }, process.env.SECRET_KEY_ACCESS_TOKEN);
        return res.status(200).json({ success: true, error: false, message: 'Verification email sent. Please verify your email.', token });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function verifyEmailController(req, res) {
    try {
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ error: true, success: false, message: 'User not found' });

        if (user.otp !== otp) return res.status(400).json({ error: true, success: false, message: 'Invalid OTP' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ error: true, success: false, message: 'OTP expired' });

        user.verify_email = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        return res.status(200).json({ error: false, success: true, message: 'Email verified successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function resendOtpController(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required', error: true, success: false });

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found', error: true, success: false });
        if (user.verify_email) return res.status(400).json({ message: 'Email is already verified', error: true, success: false });

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = verifyCode;
        user.otpExpires = Date.now() + 600000;
        await user.save();

        await sendEmailFun({ sendTo: email, subject: 'Your VibeFit OTP', text: '', html: VerificationEmail(user.name, verifyCode) });
        return res.status(200).json({ message: 'OTP sent successfully', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function authWithGoogle(req, res) {
    try {
        const { name, email, password, avatar, mobile, role } = req.body;
        let user = await UserModel.findOne({ email });

        if (!user) {
            user = await UserModel.create({ name, mobile, email, password: 'null', avatar, role, verify_email: true, signUpWithGoogle: true });
        }

        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);
        await UserModel.findByIdAndUpdate(user._id, { last_login_date: new Date() });

        const cookiesOption = { httpOnly: true, secure: true, sameSite: 'None' };
        res.cookie('accessToken', accesstoken, cookiesOption);
        res.cookie('refreshToken', refreshToken, cookiesOption);

        return res.json({ message: 'Login successfully', error: false, success: true, data: { accesstoken, refreshToken } });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not registered', error: true, success: false });
        if (user.status !== 'Active') return res.status(400).json({ message: 'Account suspended, contact support', error: true, success: false });

        const checkPassword = await bcryptjs.compare(password, user.password);
        if (!checkPassword) return res.status(400).json({ message: 'Incorrect password', error: true, success: false });

        if (!user.verify_email) {
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = verifyCode;
            user.otpExpires = Date.now() + 600000;
            await user.save();
            await sendEmailFun({ sendTo: email, subject: 'Verify your VibeFit account', text: '', html: VerificationEmail(user.name, verifyCode) });
        }

        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);
        await UserModel.findByIdAndUpdate(user._id, { last_login_date: new Date() });

        const cookiesOption = { httpOnly: true, secure: true, sameSite: 'None' };
        res.cookie('accessToken', accesstoken, cookiesOption);
        res.cookie('refreshToken', refreshToken, cookiesOption);

        return res.json({
            message: user.verify_email ? 'Login successfully' : 'Login successfully. Please verify your email.',
            error: false,
            success: true,
            needsVerification: !user.verify_email,
            data: { accesstoken, refreshToken },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function logoutController(req, res) {
    try {
        const cookiesOption = { httpOnly: true, secure: true, sameSite: 'None' };
        res.clearCookie('accessToken', cookiesOption);
        res.clearCookie('refreshToken', cookiesOption);
        await UserModel.findByIdAndUpdate(req.userId, { refresh_token: '' });
        return res.json({ message: 'Logout successfully', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken || req?.headers?.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Invalid token', error: true, success: false });

        const verifyToken = jwt.verify(token, process.env.SECRET_KEY_REFRESH_TOKEN);
        if (!verifyToken) return res.status(401).json({ message: 'Token expired', error: true, success: false });

        const newAccessToken = await generatedAccessToken(verifyToken._id);
        res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true, sameSite: 'None' });

        return res.json({ message: 'New access token generated', error: false, success: true, data: { accessToken: newAccessToken } });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function userDetails(req, res) {
    try {
        const user = await UserModel.findById(req.userId).select('-password -refresh_token').populate('address_details');
        return res.json({ message: 'user details', data: user, error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

// ─────────────────────────────────────────────────────────────
// Password management
// ─────────────────────────────────────────────────────────────

export async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email not found', error: true, success: false });

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = verifyCode;
        user.otpExpires = Date.now() + 600000;
        await user.save();

        await sendEmailFun({ sendTo: email, subject: 'Reset your VibeFit password', text: '', html: VerificationEmail(user.name, verifyCode) });
        return res.json({ message: 'Check your email', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function verifyForgotPasswordOtp(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Provide email and OTP', error: true, success: false });

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email not found', error: true, success: false });
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP', error: true, success: false });
        if (user.otpExpires < new Date()) return res.status(400).json({ message: 'OTP expired', error: true, success: false });

        user.otp = '';
        user.otpExpires = null;
        await user.save();
        return res.status(200).json({ message: 'OTP verified', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function resetpassword(req, res) {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: true, success: false, message: 'Provide email, newPassword, confirmPassword' });
        }

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email not found', error: true, success: false });

        if (!user.signUpWithGoogle) {
            const checkPassword = await bcryptjs.compare(oldPassword, user.password);
            if (!checkPassword) return res.status(400).json({ message: 'Old password is wrong', error: true, success: false });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match', error: true, success: false });
        }

        user.password = await bcryptjs.hash(confirmPassword, BCRYPT_ROUNDS);
        user.signUpWithGoogle = false;
        await user.save();
        return res.json({ message: 'Password updated', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function changePasswordController(req, res) {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: true, success: false, message: 'Provide email, newPassword, confirmPassword' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match', error: true, success: false });
        }

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email not found', error: true, success: false });

        user.password = await bcryptjs.hash(confirmPassword, BCRYPT_ROUNDS);
        await user.save();
        return res.json({ message: 'Password updated', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

// ─────────────────────────────────────────────────────────────
// Profile / Avatar  — fixed race condition: local array per request
// ─────────────────────────────────────────────────────────────

export async function userAvatarController(req, res) {
    try {
        const userId = req.userId;
        const images = req.files;
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found', error: true, success: false });

        // Delete existing avatar from Cloudinary
        if (user.avatar) {
            try {
                const urlParts = user.avatar.split('/');
                const publicId = urlParts[urlParts.length - 1].split('.')[0];
                if (publicId) await cloudinary.uploader.destroy(publicId);
            } catch (_) {}
        }

        const uploadedUrls = [];
        for (let i = 0; i < images?.length; i++) {
            const result = await cloudinary.uploader.upload(images[i].path, { use_filename: true, unique_filename: false, overwrite: false });
            uploadedUrls.push(result.secure_url);
            try { fs.unlinkSync(images[i].path); } catch (_) {}
        }

        user.avatar = uploadedUrls[0] || user.avatar;
        await user.save();
        return res.status(200).json({ _id: userId, avatar: uploadedUrls[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function removeImageFromCloudinary(req, res) {
    try {
        const imgUrl = req.query.img;
        if (!imgUrl) return res.status(400).json({ message: 'Image URL required' });

        const urlParts = imgUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        if (publicId) {
            const result = await cloudinary.uploader.destroy(publicId);
            return res.status(200).json(result);
        }
        return res.status(400).json({ message: 'Could not extract public_id' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function updateUserDetails(req, res) {
    try {
        const { name, email, mobile } = req.body;
        const updated = await UserModel.findByIdAndUpdate(
            req.userId,
            { name, mobile, email },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'User not found', error: true, success: false });

        return res.json({
            message: 'User updated successfully',
            error: false,
            success: true,
            user: { name: updated.name, _id: updated._id, email: updated.email, mobile: updated.mobile, avatar: updated.avatar },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

// ─────────────────────────────────────────────────────────────
// Reviews — fixed race condition: local array per request
// ─────────────────────────────────────────────────────────────

export async function uploadReviewImages(req, res) {
    try {
        const images = req.files;
        const uploadedUrls = [];

        for (let i = 0; i < images?.length; i++) {
            const result = await cloudinary.uploader.upload(images[i].path, { use_filename: true, unique_filename: false, overwrite: false });
            uploadedUrls.push(result.secure_url);
            try { fs.unlinkSync(images[i].path); } catch (_) {}
        }

        return res.status(200).json({ images: uploadedUrls });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function addReview(req, res) {
    try {
        const { image, userName, review, rating, userId, productId, reviewImages } = req.body;
        if (!review || !rating || !userId || !productId) {
            return res.status(400).json({ message: 'Provide all required fields', error: true, success: false });
        }

        const ratingNumber = parseFloat(rating);
        if (isNaN(ratingNumber) || ratingNumber < 0 || ratingNumber > 5) {
            return res.status(400).json({ message: 'Rating must be 0–5', error: true, success: false });
        }

        const reviewImagesArray = Array.isArray(reviewImages) ? reviewImages : reviewImages ? [reviewImages] : [];

        await ReviewModel.create({ image: image || '', userName: userName || '', review, rating: ratingNumber, userId, productId, reviewImages: reviewImagesArray });

        const allReviews = await ReviewModel.find({ productId });
        const avg = allReviews.reduce((s, r) => s + parseFloat(r.rating), 0) / allReviews.length;
        await ProductModel.findByIdAndUpdate(productId, { rating: Math.round(avg * 10) / 10 });

        return res.json({ message: 'Review added', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function getReviews(req, res) {
    try {
        const { productId } = req.query;
        if (!productId) return res.status(400).json({ message: 'Product ID required', error: true, success: false });

        const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 });
        return res.status(200).json({ error: false, success: true, reviews: reviews || [] });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function getAllReviews(req, res) {
    try {
        const reviews = await ReviewModel.find();
        return res.status(200).json({ error: false, success: true, reviews });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function deleteReview(req, res) {
    try {
        const review = await ReviewModel.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found', error: true, success: false });
        if (review.userId !== req.userId) return res.status(403).json({ message: 'You can only delete your own reviews', error: true, success: false });

        const productId = review.productId;
        await ReviewModel.findByIdAndDelete(req.params.id);

        const remaining = await ReviewModel.find({ productId });
        const avg = remaining.length > 0 ? remaining.reduce((s, r) => s + parseFloat(r.rating), 0) / remaining.length : 0;
        await ProductModel.findByIdAndUpdate(productId, { rating: Math.round(avg * 10) / 10 });

        return res.status(200).json({ message: 'Review deleted', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

// ─────────────────────────────────────────────────────────────
// Admin: all users
// ─────────────────────────────────────────────────────────────

export async function getAllUsers(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);

        const [users, total, totalUsersCount] = await Promise.all([
            UserModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            UserModel.countDocuments(),
            UserModel.countDocuments(),
        ]);

        return res.status(200).json({ error: false, success: true, users, total, page, totalPages: Math.ceil(total / limit), totalUsersCount });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function deleteUser(req, res) {
    try {
        const deleted = await UserModel.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'User not found', error: true, success: false });
        return res.status(200).json({ success: true, error: false, message: 'User deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

export async function deleteMultiple(req, res) {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: true, success: false, message: 'Invalid input' });
    try {
        await UserModel.deleteMany({ _id: { $in: ids } });
        return res.status(200).json({ message: 'Users deleted', error: false, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

// ─────────────────────────────────────────────────────────────
// Email capture / subscribe (10% off coupon)
// ─────────────────────────────────────────────────────────────

export async function subscribeController(req, res) {
    try {
        const { email, source } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required', error: true, success: false });

        const existing = await SubscriberModel.findOne({ email });
        if (existing) {
            return res.json({
                message: 'Already subscribed',
                error: false,
                success: true,
                couponCode: existing.couponCode,
            });
        }

        // Generate unique 10% off coupon
        const code = `VIBE10-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        await CouponModel.create({ code, discountPercent: 10, maxUses: 1 });
        const subscriber = await SubscriberModel.create({ email, couponCode: code, source: source || 'home_capture' });

        await sendEmailFun({
            sendTo: email,
            subject: "Here's your 10% off — Welcome to VibeFit 🎉",
            text: `Your discount code: ${code}`,
            html: `<p>Welcome to VibeFit! Use code <strong>${code}</strong> for 10% off your first order.</p>`,
        });

        return res.status(201).json({ message: 'Subscribed!', error: false, success: true, couponCode: code });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: true, success: false });
    }
}

# Environment Variables Configuration

This document lists all required environment variables for the MERN stack e-commerce application.

## Client Environment Variables (.env file in `client/` directory)

### API Configuration
```
VITE_API_URL=http://localhost:5000
```
- Backend API base URL

### PayPal Configuration
```
VITE_APP_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```
- PayPal Client ID from PayPal Developer Dashboard
- Get this from: https://developer.paypal.com/

### eSewa Configuration (Optional - for frontend display)
```
VITE_APP_ESEWA_MERCHANT_ID=your_esewa_merchant_id_here
```
- eSewa Merchant ID (optional on frontend, mainly used for display purposes)
- Actual payment processing happens on backend

---

## Server Environment Variables (.env file in `server/` directory)

### Database Configuration
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

### PayPal Configuration
```
PAYPAL_MODE=test
# For test environment:
PAYPAL_CLIENT_ID_TEST=your_paypal_test_client_id
PAYPAL_SECRET_TEST=your_paypal_test_secret

# For live/production environment:
PAYPAL_CLIENT_ID_LIVE=your_paypal_live_client_id
PAYPAL_SECRET_LIVE=your_paypal_live_secret
```
- `PAYPAL_MODE`: Set to "test" for sandbox or "live" for production
- Get credentials from: https://developer.paypal.com/

### eSewa Configuration
```
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
ESEWA_ENVIRONMENT=test
ESEWA_PRODUCT_CODE=EPAYTEST
```
- `ESEWA_MERCHANT_ID`: Your eSewa merchant ID (required)
- `ESEWA_SECRET_KEY`: Your eSewa secret key (required)
- `ESEWA_ENVIRONMENT`: Set to "test" for testing or "live" for production
- `ESEWA_PRODUCT_CODE`: Use "EPAYTEST" for test environment, your actual product code for live
- **IMPORTANT**: These credentials are REQUIRED. Without them, eSewa payments will fail with "Invalid payload signature" error
- Get credentials from: https://developer.esewa.com.np/ or contact eSewa support
- For testing, you can use test credentials provided by eSewa

### Application URLs
```
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```
- `FRONTEND_URL`: Your frontend application URL (for redirects after payment)
- `BACKEND_URL`: Your backend API URL (for eSewa callbacks)

### Email Configuration (if using email service)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### JWT Configuration (if applicable)
```
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
```

---

## Removed Environment Variables

The following Razorpay environment variables are no longer needed:
- ~~VITE_APP_RAZORPAY_KEY_ID~~ (removed)
- ~~VITE_APP_RAZORPAY_KEY_SECRET~~ (removed)

---

## Setup Instructions

1. **Client Setup:**
   - Navigate to `client/` directory
   - Create a `.env` file
   - Add all client environment variables listed above
   - Restart the development server

2. **Server Setup:**
   - Navigate to `server/` directory
   - Create a `.env` file
   - Add all server environment variables listed above
   - Restart the server

3. **Payment Gateway Setup:**
   - **PayPal:**
     - Sign up at https://developer.paypal.com/
     - Create a new app to get Client ID and Secret
     - Use sandbox credentials for testing
   
   - **eSewa:**
     - Register as a merchant at https://www.esewa.com.np/
     - Contact eSewa support for API credentials
     - Use test credentials for development

---

## Security Notes

- Never commit `.env` files to version control
- Use different credentials for development and production
- Keep secret keys secure and rotate them regularly
- Use environment-specific values (test vs live) for payment gateways


const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/home/customerController");

router.post("/customer-register", customerController.register_customer);
router.post("/customer-login", customerController.login_customer);
router.post("/refresh-token", customerController.refresh_token);
router.post("/google-login", customerController.google_login);
router.post("/facebook-login", customerController.facebook_login);

// Forgot Password Routes
router.post("/forgot-password", customerController.forgot_password);
router.post("/verify-otp", customerController.verify_otp);
router.post("/resend-otp", customerController.resend_otp);
router.post("/reset-password", customerController.reset_password);

router.get("/", customerController.getCustomers);
router.get("/all", customerController.getAllCustomers);
router.get("/:customerId", customerController.getCustomer);

module.exports = router;

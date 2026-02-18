const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/home/customerController");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  customerRegisterSchema,
  customerLoginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  socialLoginSchema,
} = require("../../validators/authValidation");

router.post("/customer-register", validate(customerRegisterSchema), customerController.register_customer);
router.post("/customer-login", validate(customerLoginSchema), customerController.login_customer);
router.post("/refresh-token", customerController.refresh_token);
router.post("/google-login", validate(socialLoginSchema), customerController.google_login);
router.post("/facebook-login", validate(socialLoginSchema), customerController.facebook_login);

// Forgot Password Routes
router.post("/forgot-password", validate(forgotPasswordSchema), customerController.forgot_password);
router.post("/verify-otp", validate(verifyOtpSchema), customerController.verify_otp);
router.post("/resend-otp", validate(forgotPasswordSchema), customerController.resend_otp);
router.post("/reset-password", validate(resetPasswordSchema), customerController.reset_password);

router.get("/", customerController.getCustomers);
router.get("/all", customerController.getAllCustomers);
router.get("/:customerId", customerController.getCustomer);

module.exports = router;

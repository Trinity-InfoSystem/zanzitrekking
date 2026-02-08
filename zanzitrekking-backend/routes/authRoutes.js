const express = require("express");
const AuthControllers = require("../controllers/authControllers");
const { jwtMiddleware, roleMiddleware } = require("../middlewares/authJwtMiddleware");
const { uploadOptions } = require("../utilities/multerUpload");

const router = express.Router();
router.post("/admin-login", AuthControllers.admin_login);

router.get("/get-user", jwtMiddleware, AuthControllers.getUser);
router.get("/get-company-info", AuthControllers.getCompanyInfo);
router.post(
  "/update-company-info",
  jwtMiddleware,
  AuthControllers.update_company_info
);
router.post(
  "/profile-image-upload",
  jwtMiddleware,
  uploadOptions.single("image"),
  AuthControllers.profile_image_upload
);
router.put("/update-password", jwtMiddleware, AuthControllers.password_update);
router.post("/refresh-token", AuthControllers.refresh_token);

router.post('/forgot-password', AuthControllers.forgot_password);
router.post('/verify-otp', AuthControllers.verify_otp);
router.post('/reset-password', AuthControllers.reset_password);
router.get('/get-all-admins', jwtMiddleware, AuthControllers.get_all_admins);
router.put('/update-admin-access-routes/:id', jwtMiddleware, AuthControllers.update_admin_access_routes);
router.post('/create-admin', jwtMiddleware, roleMiddleware('admin'), AuthControllers.create_admin);
router.delete('/delete-admin/:id', jwtMiddleware, roleMiddleware('admin'), AuthControllers.delete_admin);

module.exports = router;

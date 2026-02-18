const express = require("express");
const router = express.Router();
const clientController = require("../../controllers/dashboard/clientController");
const { uploadOptions } = require("../../utilities/multerUpload");
const { jwtMiddleware } = require("../../middlewares/authJwtMiddleware");
const { validate } = require("../../middlewares/validationMiddleware");
const {
  addClientSchema,
  updateClientSchema,
  toggleClientStatusSchema,
  deleteClientsSchema,
} = require("../../validators/clientValidation");

// Public routes (for frontend)
router.get("/clients-active", clientController.get_active_clients);

// Protected routes (for dashboard)
router.get("/clients-get", jwtMiddleware, clientController.get_clients);
router.get(
  "/client-get/:clientId",
  jwtMiddleware,
  clientController.get_client
);

router.post(
  "/client-add",
  jwtMiddleware,
  uploadOptions.single("logo"),
  validate(addClientSchema),
  clientController.add_client
);

router.put(
  "/client-update/:clientId",
  jwtMiddleware,
  uploadOptions.single("logo"),
  validate(updateClientSchema),
  clientController.update_client
);

router.delete(
  "/client-delete/:clientId",
  jwtMiddleware,
  clientController.delete_client
);

router.put(
  "/client-toggle-status/:clientId",
  jwtMiddleware,
  validate(toggleClientStatusSchema),
  clientController.toggle_client_status
);

router.post(
  "/client-delete-multiple",
  jwtMiddleware,
  validate(deleteClientsSchema),
  clientController.delete_clients
);

module.exports = router;


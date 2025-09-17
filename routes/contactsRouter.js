import { Router } from "express";
import * as ctrl from "../controllers/contactsControllers.js";
import auth from "../middleware/authMiddleware.js";

const router = Router();

router.use(auth); // всі контакти — захищені

router.get("/", ctrl.getAllContacts);
router.get("/:id", ctrl.getOneContact);
router.post("/", ctrl.createContact);
router.put("/:id", ctrl.updateContact);
router.delete("/:id", ctrl.deleteContact);
router.patch("/:id/favorite", ctrl.updateFavorite);

export default router;

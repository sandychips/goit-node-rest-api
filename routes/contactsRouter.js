import { Router } from "express";
import * as ctrl from "../controllers/contactsControllers.js";

const router = Router();

router.get("/", ctrl.getAllContacts);
router.get("/:id", ctrl.getOneContact);
router.post("/", ctrl.createContact);
router.put("/:id", ctrl.updateContact);
router.delete("/:id", ctrl.deleteContact);

// PATCH /api/contacts/:contactId/favorite (і :id теж спрацює)
router.patch("/:contactId/favorite", ctrl.updateFavorite);

export default router;

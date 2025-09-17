import contactsService from "../services/contactsServices.js";
import {
  createContactSchema,
  updateContactSchema,
  updateFavoriteSchema,
} from "../schemas/contactsSchemas.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const result = await contactsService.listContacts(req.user.id, req.query);
    res.status(200).json(result);
  } catch (error) { next(error); }
};

export const getOneContact = async (req, res, next) => {
  try {
    const contact = await contactsService.getContactById(req.params.id, req.user.id);
    if (!contact) throw HttpError(404, "Not found");
    res.status(200).json(contact);
  } catch (error) { next(error); }
};

export const deleteContact = async (req, res, next) => {
  try {
    const deleted = await contactsService.removeContact(req.params.id, req.user.id);
    if (!deleted) throw HttpError(404, "Not found");
    res.status(200).json(deleted);
  } catch (error) { next(error); }
};

export const createContact = async (req, res, next) => {
  try {
    const { error } = createContactSchema.validate(req.body);
    if (error) throw HttpError(400, error.message);
    const newContact = await contactsService.addContact(req.body, req.user.id);
    res.status(201).json(newContact);
  } catch (error) { next(error); }
};

export const updateContact = async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) throw HttpError(400, "Body must have at least one field");
    const { error } = updateContactSchema.validate(req.body);
    if (error) throw HttpError(400, error.message);

    const updated = await contactsService.updateContact(req.params.id, req.body, req.user.id);
    if (!updated) throw HttpError(404, "Not found");
    res.status(200).json(updated);
  } catch (error) { next(error); }
};

export const updateFavorite = async (req, res, next) => {
  try {
    const { error } = updateFavoriteSchema.validate(req.body);
    if (error) throw HttpError(400, error.message);
    const updated = await contactsService.updateStatusContact(req.params.id, req.body, req.user.id);
    if (!updated) throw HttpError(404, "Not found");
    res.status(200).json(updated);
  } catch (error) { next(error); }
};

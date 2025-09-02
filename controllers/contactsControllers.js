import contactsService from "../services/contactsServices.js";
import {
  createContactSchema,
  updateContactSchema,
  updateFavoriteSchema,
} from "../schemas/contactsSchemas.js";
import HttpError from "../helpers/HttpError.js";

const getParamId = (req) => req.params.id ?? req.params.contactId;

export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await contactsService.listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const id = getParamId(req);
    const contact = await contactsService.getContactById(id);
    if (!contact) throw HttpError(404, "Not found");
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const id = getParamId(req);
    const deleted = await contactsService.removeContact(id);
    if (!deleted) throw HttpError(404, "Not found");
    res.status(200).json(deleted);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { error } = createContactSchema.validate(req.body);
    if (error) throw HttpError(400, error.message);
    const newContact = await contactsService.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) {
      throw HttpError(400, "Body must have at least one field");
    }
    const { error } = updateContactSchema.validate(req.body);
    if (error) throw HttpError(400, error.message);

    const id = getParamId(req);
    const updated = await contactsService.updateContact(id, req.body);
    if (!updated) throw HttpError(404, "Not found");
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const updateFavorite = async (req, res, next) => {
  try {
    const { error } = updateFavoriteSchema.validate(req.body);
    if (error) throw HttpError(400, error.message);

    const id = getParamId(req);
    const updated = await contactsService.updateStatusContact(id, req.body);
    if (!updated) throw HttpError(404, "Not found");
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

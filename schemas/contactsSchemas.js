import Joi from "joi";

const name = Joi.string().trim().min(2).max(100);
const email = Joi.string().trim().email();
const phone = Joi.string().trim().pattern(/^[0-9\s()+\-]{7,20}$/);

export const createContactSchema = Joi.object({
  name: name.required(),
  email: email.required(),
  phone: phone.required(),
  favorite: Joi.boolean().optional(),
});

export const updateContactSchema = Joi.object({
  name,
  email,
  phone,
  favorite: Joi.boolean().optional(),
}).min(1).messages({
  "object.min": "Body must have at least one field",
});

export const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

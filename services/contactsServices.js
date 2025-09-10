import Contact from "../models/contact.js";

const listContacts = async (owner, { page = 1, limit = 20, favorite } = {}) => {
  const where = { owner };
  if (favorite !== undefined) where.favorite = favorite === "true" || favorite === true;

  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Contact.findAndCountAll({
    where, limit: Number(limit), offset, order: [["createdAt", "DESC"]],
  });
  return { total: count, page: Number(page), limit: Number(limit), items: rows };
};

const getContactById = async (id, owner) => {
  return Contact.findOne({ where: { id, owner } });
};

const addContact = async (data, owner) => {
  return Contact.create({ ...data, owner });
};

const removeContact = async (id, owner) => {
  const contact = await Contact.findOne({ where: { id, owner } });
  if (!contact) return null;
  await contact.destroy();
  return contact;
};

const updateContact = async (id, data, owner) => {
  const contact = await Contact.findOne({ where: { id, owner } });
  if (!contact) return null;
  await contact.update(data);
  return contact;
};

const updateStatusContact = async (id, { favorite }, owner) => {
  const contact = await Contact.findOne({ where: { id, owner } });
  if (!contact) return null;
  await contact.update({ favorite });
  return contact;
};

export default {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};

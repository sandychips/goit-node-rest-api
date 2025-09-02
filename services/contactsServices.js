import Contact from "../models/contact.js";

const listContacts = async () => {
  return Contact.findAll({ order: [["createdAt", "DESC"]] });
};

const getContactById = async (id) => {
  return Contact.findByPk(id);
};

const addContact = async (data) => {
  return Contact.create(data);
};

const removeContact = async (id) => {
  const contact = await Contact.findByPk(id);
  if (!contact) return null;
  await contact.destroy();
  return contact;
};

const updateContact = async (id, data) => {
  const contact = await Contact.findByPk(id);
  if (!contact) return null;
  await contact.update(data);
  return contact;
};

const updateStatusContact = async (id, { favorite }) => {
  const contact = await Contact.findByPk(id);
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

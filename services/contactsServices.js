import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const contactsPath = path.resolve("db", "contacts.json");

// Допоміжна функція для зчитування
async function readContacts() {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
}

// Допоміжна функція для запису
async function writeContacts(contacts) {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
}

export async function listContacts() {
  return await readContacts();
}

export async function getContactById(contactId) {
  const contacts = await readContacts();
  const contact = contacts.find((c) => c.id === contactId);
  return contact || null;
}

export async function removeContact(contactId) {
  const contacts = await readContacts();
  const index = contacts.findIndex((c) => c.id === contactId);
  if (index === -1) return null;

  const [removed] = contacts.splice(index, 1);
  await writeContacts(contacts);
  return removed;
}

export async function addContact(name, email, phone) {
  const contacts = await readContacts();
  const newContact = { id: uuidv4(), name, email, phone };
  contacts.push(newContact);
  await writeContacts(contacts);
  return newContact;
}

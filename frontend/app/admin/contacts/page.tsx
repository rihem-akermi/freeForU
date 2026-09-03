import ContactsTable from "@/components/ContactsTable";
import { getContacts } from "@/lib/api/contacts";

export default async function Contact() {
  const initialContacts = await getContacts();
  return <ContactsTable initialContacts={initialContacts} />;
}
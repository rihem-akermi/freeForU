import ContactsTable from "@/components/ContactsTable";
import { getContactsForPage } from "@/lib/api/server";

export default async function Contact() {
  const initialContacts = await getContactsForPage();
  return <ContactsTable initialContacts={initialContacts} />;
}

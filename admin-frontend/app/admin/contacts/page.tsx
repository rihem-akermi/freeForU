import ContactsTable from "@/components/ContactsTable"
import { getContacts } from "@/lib/api/contacts"


export default async function Contact (){
    const initialContacts = await getContacts()
    console.log("contacts" , initialContacts)
    return (
        <div>
            <ContactsTable initialContacts={initialContacts}/>
        </div>
    )
}
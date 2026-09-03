import {Contact} from "../data"
import api from "./interceptor"


export async function addContact(contact : Omit<Contact,"idcontact"| "created_at">) : Promise<Contact>{
    const response = await api.post("/contacts",
        contact
    )
    const newContact = response.data
    return newContact
}

export async function getContacts():Promise<Contact[]>{
    const response = await api.get<Contact[]>('/contacts')
    return response.data
}

export async function deleteContact(id : number ):Promise<Contact>{
    const response = await api.delete<Contact>(`/contacts/${id}`)
    return response.data
}
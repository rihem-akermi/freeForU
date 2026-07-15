import api from "./interceptor";


export type Category = {

id:number;

nom:string;

}



export async function getCategories():Promise<Category[]>{

const response =
await api.get<Category[]>("/categories");


return response.data;

}
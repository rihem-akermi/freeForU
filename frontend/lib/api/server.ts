import "server-only";
import axios from "axios";
import { cookies } from "next/headers";

export async function serverApi() {
  const cookieStore = await cookies();
  return axios.create({
    baseURL: process.env.BACKEND_URL, // absolute URL, no /api prefix
    headers: { cookie: cookieStore.toString() }, // forward the user's cookies
  });
}
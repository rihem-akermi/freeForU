import { getUsersForPage } from "@/lib/api/server";
import UsersTable from "@/components/UsersTable";

export default async function AdminUsersPage() {
  const users = await getUsersForPage();
  return <UsersTable initialUsers={users} />;
}

import { getUsers } from "@/lib/api/users";
import UsersTable from "@/components/UsersTable";

export default async function AdminUsersPage() {
  const users = await getUsers();
  return <UsersTable initialUsers={users} />;
}
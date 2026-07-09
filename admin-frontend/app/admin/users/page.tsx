import { getUsers } from "@/lib/api";
import UsersTable from "@/components/UsersTable";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium text-stone-900">Utilisateurs</h1>
      <UsersTable initialUsers={users} />
    </div>
  );
}

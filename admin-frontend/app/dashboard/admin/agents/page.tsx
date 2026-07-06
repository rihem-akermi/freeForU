import AgentsTable from "@/components/AgentsTable";
import { getAgents } from "@/lib/api";

export default async function AgentsPage() {
  const initialAgents = await getAgents()
  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium text-stone-900">Agents</h1>
      <AgentsTable initialAgents={initialAgents} />
    </div>
  );
}

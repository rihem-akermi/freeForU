import AgentsTable from "@/components/AgentsTable";
import { getAgents } from "@/lib/api/agents";

export default async function AgentsPage() {
  const initialAgents = await getAgents();
  return <AgentsTable initialAgents={initialAgents} />;
}
import AgentsTable from "@/components/AgentsTable";
import { getAgentsForPage } from "@/lib/api/server";

export const dynamic = "force-dynamic";


export default async function AgentsPage() {
  const initialAgents = await getAgentsForPage();
  return <AgentsTable initialAgents={initialAgents} />;
}

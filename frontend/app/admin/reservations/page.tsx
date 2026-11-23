import ReservationsTable from "@/components/ReservationsTable";
import { getReservationsForPage } from "@/lib/api/server";

export default async function ReservationsPage() {
  const reservations = await getReservationsForPage();
  return <ReservationsTable initialReservations={reservations} />;
}

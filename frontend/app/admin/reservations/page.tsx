import ReservationsTable from "@/components/ReservationsTable";
import { getReservations } from "@/lib/api/reservations";

export default async function ReservationsPage() {
  const reservations = await getReservations();
  return <ReservationsTable initialReservations={reservations} />;
}
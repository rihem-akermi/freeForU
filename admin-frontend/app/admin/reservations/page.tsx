
import  ReservationsTable from  "@/components/ReservationsTable";
import { getReservations } from "@/lib/api/reservations";


export default async function ReservationsPage() {
  const reservations = await getReservations();
  console.log("res : ", reservations)
  return (
   <div>
         <h1 className="mb-6 text-2xl font-medium text-stone-900">Reservations</h1>
         <ReservationsTable initialReservations={reservations} />
       </div>
  )
  
}

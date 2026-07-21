import { getAgents } from "@/lib/api/agents";
import { getCategories } from "@/lib/api/categories";
import { getContacts } from "@/lib/api/contacts";
import { getReservations } from "@/lib/api/reservations";
import { getUsers } from "@/lib/api/users";

export default async function PageAdmin() {
  const users = await getUsers();
  const agents = await getAgents();
  const reservations = await getReservations();
  const contacts = await getContacts();
  const categories = await getCategories();

  const cards = [
    { label: "Clients", value: users.length },
    { label: "Agents", value: agents.length },
    { label: "Réservations", value: reservations.length },
    { label: "Contacts", value: contacts.length },
    { label: "Categories", value: categories.length },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium text-stone-900">
        Vue d'ensemble
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-stone-200 bg-white p-6"
          >
            <p className="text-sm text-stone-500">{card.label}</p>
            <p className="mt-2 text-3xl font-medium text-stone-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

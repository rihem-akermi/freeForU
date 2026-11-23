import CategoriesTable from "@/components/CategoriesTable";
import { getCategoriesForPage } from "@/lib/api/server";

export default async function Category() {
  const initialCategories = await getCategoriesForPage();
  return <CategoriesTable initialCategories={initialCategories} />;
}

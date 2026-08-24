import CategoriesTable from "@/components/CategoriesTable";
import { getCategories } from "@/lib/api/categories";

export default async function Category() {
  const initialCategories = await getCategories();
  return <CategoriesTable initialCategories={initialCategories} />;
}
import CategoriesTable from "@/components/CategoriesTable"
import { getCategories } from "@/lib/api/categories"


export default async function Category (){
    const initialCategories  = await getCategories()
    console.log(initialCategories)
    return (
        <div>
            <h1 className="mb-6 text-2xl font-medium text-stone-900">Categories</h1>
            <CategoriesTable initialCategories={initialCategories}/>
        </div>
    )
}
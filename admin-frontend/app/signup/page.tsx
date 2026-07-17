"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { signup } from "@/lib/api/signup";
import { getCategories } from "@/lib/api/categories";

import styles from "./signup.module.css";


type Category = {
  id:number;
  nom:string;
};


export default function SignupPage() {


const router = useRouter();


const [categories,setCategories] =
useState<Category[]>([]);



const [form,setForm] = useState({

name:"",

email:"",

password:"",

ville:"",

phone:"",

role:"CLIENT" as "CLIENT"|"AGENT",

category_id:0

});



const [error,setError]=useState("");





useEffect(()=>{


async function loadCategories(){

const data = await getCategories();

setCategories(data);

}


loadCategories();


},[]);






function updateField(
field:string,
value:string|number
){

setForm(prev=>({
...prev,
[field]:value
}));

}







async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();

setError("");



try{


// sécurité frontend
if(
form.role==="AGENT" &&
form.category_id===0
){

setError(
"Veuillez choisir une catégorie pour un agent"
);

return;

}




await signup(form);


router.push("/login");


}

catch(err:any){

console.log(
"❌ Erreur signup :",
err
);


setError(
err.response?.data?.message ||
"Une erreur est survenue"
);

}


}








return (

<div className={styles.container}>


<form
onSubmit={handleSubmit}
className={styles.card}
>


<h1 className={styles.title}>
Créer un compte
</h1>



{
error &&
<p className={styles.error}>
{error}
</p>
}





<label className={styles.label}>
Je suis...
</label>



<select

value={form.role}

onChange={
(e)=>
updateField(
"role",
e.target.value
)
}

className={styles.select}

>


<option value="CLIENT">
Client
</option>


<option value="AGENT">
Agent (artisan)
</option>



</select>







<label className={styles.label}>
Nom complet
</label>


<input

value={form.name}

onChange={
(e)=>
updateField(
"name",
e.target.value
)
}

className={styles.input}

required

/>








<label className={styles.label}>
Email
</label>


<input

type="email"

value={form.email}

onChange={
(e)=>
updateField(
"email",
e.target.value
)
}

className={styles.input}

required

/>







<label className={styles.label}>
Mot de passe
</label>


<input

type="password"

value={form.password}

onChange={
(e)=>
updateField(
"password",
e.target.value
)
}

className={styles.input}

required

/>








<label className={styles.label}>
Téléphone
</label>


<input

value={form.phone}

onChange={
(e)=>
updateField(
"phone",
e.target.value
)
}

className={styles.input}

required

/>







<label className={styles.label}>
Ville
</label>


<input

value={form.ville}

onChange={
(e)=>
updateField(
"ville",
e.target.value
)
}

className={styles.input}

required

/>










{
form.role==="AGENT" &&

<div className={styles.categoryField}>


<label className={styles.label}>
Catégorie de métier
</label>



<select

value={form.category_id}

onChange={
(e)=>
updateField(
"category_id",
Number(e.target.value)
)
}

className={styles.select}

required

>


<option value={0}>
Autre
</option>



{
categories.map(category=>(

<option

key={category.id}

value={category.id}

>

{category.nom}

</option>

))

}



</select>


</div>

}








<button

type="submit"

className={styles.submitButton}

>

Créer mon compte

</button>




</form>


</div>

);

}
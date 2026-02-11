// import { zodResolver } from "@hookform/resolvers/zod"
// import { _axios } from "@/lib/_axios"
// import { z } from "zod"

// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Button } from "@/components/ui/button"
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//   } 
//   from "@/components/ui/form"

//   import { Input } from "@/components/ui/input"
//   import { useForm } from "react-hook-form";
// const formSchema = z.object({
//   username: z.string().min(3,{
//     message: "Username must be at least 3 characters.",
//   }),
//   userid: z.string().min(1,{
//     message: "UserId must be at least 1 characters.",
//   }),
 
// role:z.string(),
// email:z.string(),
// mobileNumber:z.string(),
// password:z.string().min(3,{
//     message:"must be atleast 3 characters"
// })
// })

// export function AddUser() {

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//     username: "",
//       userid:"",
//       role:"",
//       email:"",
//       mobileNumber:"",
//       password:""
//     },
//   })

//   function onSubmit(values: z.infer<typeof formSchema>) {
//     console.log(values)
//     return _axios.post("/users/create",values);
//     setFormOpen(false);
//   }
  

//   return (
   
//   )
// }
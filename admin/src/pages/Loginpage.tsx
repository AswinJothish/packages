import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { _axios } from "@/lib/_axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
type Inputs = {
  email: string;
  password: string;
};
const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email address" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Please enter your password" }),
});

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });
  const [isRedirecting, setIsRedirecting] = useState(false);


const navigate=useNavigate();
const onSubmit: SubmitHandler<Inputs> = (data) => mutate(data);

  const { mutate} = useMutation({
    mutationKey: ["login"],
    mutationFn: (data: Inputs) => {
      return _axios.post("/auth/login", data);
    },
    onSuccess: ({ data }) => {
      navigate("/admin/dashboard");
      if (data["token"]) {
        Cookies.set("admin", data["token"], { secure: true, expires: 7,  path: '/',sameSite: "strict" });
        sessionStorage.setItem("token", data["token"]);
        const userData= JSON.stringify(data.userData);
        sessionStorage.setItem("userData",userData)
        toast.success("Logged in successfully");
        setIsRedirecting(true);

      }
    },
    onError: (error: any) => {
      let message =
        error["response"]["data"]["message"] || "Something went wrong";
      toast.error(message);
    },
  });

  if (isRedirecting) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="bg-slate-100 w-[100vw] flex justify-center items-center h-[100vh]">
      <div className="w-1/4 bg-white  px-5 py-10 rounded-lg shadow-xl flex flex-row justify-center ">
        <div className="w-full">
        <div className="text-center my-5">
          <h1 className="text-xl font-bold">Admin Login</h1>
        </div>
        <div className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5 ">
            <div>
              <Label htmlFor="email" className="text-xs text-gray-600">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                className="placeholder:text-xs placeholder:text-gray-300"
                {...register("email")}
              />
              {errors.email && (
                <p className="px-2 text-xs font-normal text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-xs text-gray-600">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="*****"
                className="placeholder:text-xs placeholder:text-gray-300"
                required
                {...register("password")}
              />
              {errors.password && (
                <p className="px-2 text-xs font-normal text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            </div>
            <div className="flex mt-10 w-full">
            <div className="flex justify-center  items-center w-full text-sm">
              <Button  type="submit" className="w-1/2 text-white">
                Login
              </Button>
            </div>
            </div>
            
          </form>
        </div>
       
        </div>
        <div>
          {/* <img src="../assets/login.webp" alt="login" /> */}
        </div>
        
      </div>
    </div>
  );
}

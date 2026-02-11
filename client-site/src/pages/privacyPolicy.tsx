import  { useEffect, useState } from "react";
import  _axios  from "../lib/_axios"; // Assuming you have axios setup
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft } from "react-icons/fa6";
import Footer from "./Footer";

const PrivacyPolicy = () => {
  const [policyContent, setPolicyContent] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ppolicy"],
    queryFn: () => _axios.get(`/ppolicy/`),
    select: (response: { data: { data: any; }; }) => ({
        policy: response?.data.data,
    }),
});

useEffect(()=>{
    if(data){
       setPolicyContent(data?.policy?.content) 
    }
},[data])

if(isLoading){
    return<div>Loading......</div>
}

  return (
    <div className=" ">
    <div className="flex bg-blue-900/90 text-white text-center mb-6">
      <div className="flex pl-5 w-auto items-center mr-4 cursor-pointer" onClick={() => window.history.back()}>
        <FaArrowLeft />
      </div>

      <h1 className="text-3xl -pl-5 py-5 font-bold flex-grow text-center">Privacy Policy</h1>
    </div>
         <div className="flex justify-center items-center">
     <div
        className="prose lg:w-3/4 px-5 privacy-policy-content lg:prose-xl"
        dangerouslySetInnerHTML={{
          __html: policyContent,
        }}
      />
     </div>
     <div className="lg:pt-20 pt-5">
     <Footer  />
     </div>
    </div>
  );
};

export default PrivacyPolicy;

import { _axios } from "@/lib/_axios";
import Topbar from "@/pages/utils/topbar";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";

const PrivacyPolicy = () => {
    const [policy, setPolicy] = useState(""); // State to hold the policy content

    const handleChange = (value: string) => {
        setPolicy(value); // Update policy content on change in the editor
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["ppolicy"],
        queryFn: () => _axios.get(`/ppolicy/`),
        select: (response) => ({
            policy: response?.data.data,
        }),
    });

    useEffect(() => {
        if (data) {
            setPolicy(data?.policy?.content); // Set the policy content when fetched
        }
    }, [data]);

    const handleSubmit = async () => {
        try {
            const response = await _axios.post("/ppolicy/update", {
                content: policy, 
                delta: policy, // Assuming you send 'delta' as content directly
            });

            if (response.data.status) {
                console.log("Privacy Policy updated:", response.data);
                toast.success("Privacy Policy saved successfully!");
                refetch(); // Refetch the data to get the updated policy
            } else {
                toast.error("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("Failed to update Privacy Policy:", error);
            toast.error("An error occurred while saving the Privacy Policy.");
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Topbar title="Privacy Policy" />
            <div className="p-6 mt-10 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
                <ReactQuill 
                    value={policy} // Use 'value' to make it controlled
                    onChange={handleChange} 
                    theme="snow" 
                    placeholder="Write your privacy policy here..."
                />
                <button 
                    onClick={handleSubmit} 
                    className="mt-4 px-4 text-sm py-2 bg-button-gradient text-white rounded-lg hover:scale-105 transition-all duration-300"
                >
                    Save Changes
                </button>
            </div>
        </>
    );
};

export default PrivacyPolicy;

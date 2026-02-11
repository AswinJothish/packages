import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Topbar from "../utils/topbar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/_axios";
import { toast } from "sonner";
import { ImgBaseUrl } from "@/lib/config";

const Settings = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch, 
    clearErrors 
  } = useForm();

  const { data, isLoading ,refetch} = useQuery({
    queryKey: ["admin"],
    queryFn: () => _axios.get(`/auth/profile`),
    select(data) {
      return { profile: data.data.userData };
    },
  });

  useEffect(() => {
    if (data?.profile) {
      setValue("username", data.profile.username);
      setValue("mobileNumber", data.profile.mobileNumber);
      setValue("password", data.profile.password);
      setProfileImage(data.profile.profileImage || "/images/profile-candidate.png");
      clearErrors();
    }
  }, [data, setValue, clearErrors]);

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await _axios.put(`/auth/profile`, formData);
    },
    onSuccess: () => {
      refetch();
      setValue("newPassword", "");
      setValue("confirmPassword", "");
      setShowNewPasswordFields(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update failed:", error.response?.data || error.message);
      toast.error("Failed to update profile.");
    },
  });
  const onSubmit = async (formValues: any) => {
    const formData = new FormData();
    formData.append("username", formValues.username);
    formData.append("mobileNumber", formValues.mobileNumber);

    if (formValues.profileImage instanceof File) {
      formData.append("profileImage", formValues.profileImage);
    }

    if (showNewPasswordFields) {
      formData.append("password", formValues.newPassword);
      // formData.append("confirmPassword", formValues.confirmPassword);
    }

    updateProfileMutation.mutate(formData);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setValue("profileImage", file);
    }
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Topbar title={"Settings"} />
      <div className="flex justify-center items-center">
        <div className="container w-3/4 mx-auto px-6 py-12">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Update Your Profile
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-end gap-1">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                <img
                    src={`${ImgBaseUrl}${profileImage}` || "/images/profile-candidate.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label htmlFor="profileImage" className="cursor-pointer underline text-sm text-blue-600">
             {/* <FaPen /> */}Edit
              </label>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                className="hidden"
                {...register("profileImage")}
                onChange={handleProfileImageChange}
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-3 border border-gray-300 rounded-md mt-2"
                placeholder="Enter your username"
                {...register("username", { required: "Username is required" })}
              />
              {typeof errors.username?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.username.message}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className="block text-gray-700">
                Mobile Number
              </label>
              <input
                type="text"
                id="mobileNumber"
                className="w-full p-3 border border-gray-300 rounded-md mt-2"
                placeholder="Enter your mobile number"
                {...register("mobileNumber", { required: "Mobile number is required" })}
              />
              {typeof errors.mobileNumber?.message === "string" && (
                <p className="text-red-500 text-sm">{errors.mobileNumber.message}</p>
              )}
            </div>

            {/* Password Fields */}
            <div>
  <label htmlFor="password" className="block text-gray-700">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      id="password"
      readOnly
      className="w-full p-3 border border-gray-300 rounded-md mt-2 pr-10" // Add pr-10 for spacing
      placeholder="Enter your current password"
      {...register("password", { required: "Password is required" })}
    />
    <button
      type="button"
      className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-600"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
  {typeof errors.password?.message === "string" && (
    <p className="text-red-500 text-sm">{errors.password.message}</p>
  )}
</div>


            {/* Show Change Password Fields on Click */}
            {!showNewPasswordFields && (
              <button
                type="button"
                onClick={() => {setShowNewPasswordFields(true)
                  setValue("newPassword", "");
                  setValue("confirmPassword", "");
                }}
                className="text-blue-600 underline text-sm"
              >
                Change Password
              </button>
            )}

            {showNewPasswordFields && (
              <>
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="w-full p-3 border border-gray-300 rounded-md mt-2"
                    placeholder="Enter your new password"
                    {...register("newPassword", { required: "New password is required" })}
                  />
                  {typeof errors.newPassword?.message === "string" && (
                    <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full p-3 border border-gray-300 rounded-md mt-2"
                    placeholder="Confirm your new password"
                    {...register("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: (value) => value === watch("newPassword") || "Passwords do not match"
                    })}
                  />
                  {typeof errors.confirmPassword?.message === "string" && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                  )}
                </div>
                {showNewPasswordFields && (
              <button
                type="button"
                onClick={() => setShowNewPasswordFields(false)}
                className="text-blue-600 underline text-sm"
              >
                Cancel
              </button>
            )}

              </>
              
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="bg-button-gradient text-white px-8 py-3 rounded-full hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;

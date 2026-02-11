import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useLogout() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.clear();
    navigate("/admin");
    toast.success("Logged out successfully");
  };

  return { logout };
}

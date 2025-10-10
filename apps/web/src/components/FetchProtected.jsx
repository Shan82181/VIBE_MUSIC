import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button"

export default function FetchProtected() {
  const { getToken } = useAuth();

  const callApi = async () => {
    const token = await getToken();
    const res = await axios.get("http://localhost:3000/api/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(res.data);
  };

  return <Button onClick={callApi}>Call API</Button>;
}

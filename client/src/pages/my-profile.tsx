import Profile  from "../components/common/Profile";
import { useEffect, useState } from "react";

const MyProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("No user in localStorage");
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>No user data found</div>;

  return (
    <Profile
      userId={user.id}
    
      type="Admin"
    />
  );
};

export default MyProfile;

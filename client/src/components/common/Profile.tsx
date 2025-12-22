import { useState, useEffect } from "react";
import Email from "@mui/icons-material/Email";
import Phone from "@mui/icons-material/Phone";
import Place from "@mui/icons-material/Place";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface ProfileProps {
  userId: string;
  type: string;
}

interface UserData {
  name: string;
  email: string;
  avatar: string;
  [key: string]: any;
}

const Profile = ({ userId, type }: ProfileProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editableData, setEditableData] = useState<UserData>({} as UserData);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`https://tafaseel-project.onrender.com/api/v1/users/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data: UserData = await res.json();
        setUserData(data);
        setEditableData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (field: string, value: string) => {
    setEditableData({ ...editableData, [field]: value });
  };

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditableData({ ...editableData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://tafaseel-project.onrender.com/api/v1/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableData),
        // credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update profile");
      } else {
        const updatedUser = await res.json();
        alert("Profile updated successfully!");
        setIsEditing(false);
        setUserData(updatedUser);
        setEditableData(updatedUser);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <Typography>Loading profile...</Typography>;

  return (
    <Box>
      <Typography fontSize={25} fontWeight={700} color="#11142D">
        {type} Profile
      </Typography>

      <Box mt="20px" borderRadius="15px" padding="20px" bgcolor="#FCFCFC">
        <Stack direction={{ xs: "column", md: "row" }} gap={2.5}>
          {/* Avatar */}
          <Box position="relative" width={140} height={140}>
            <label htmlFor="avatar-upload" style={{ cursor: isEditing ? "pointer" : "default" }}>
              <img
                src={editableData.avatar || "/default-avatar.png"}
                width={140}
                height={140}
                alt="avatar"
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            </label>
            {isEditing && (
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            )}
          </Box>

          {/* Profile fields */}
          <Stack flex={1} direction="column" gap={2.5}>
            {Object.keys(editableData).map((key) => {
  // Hide internal fields
  if (["_id", "avatar", "__v", "password"].includes(key)) return null;

  const IconMap: Record<string, JSX.Element> = {
    email: <Email sx={{ color: "#11142D" }} />,
    phone: <Phone sx={{ color: "#11142D" }} />,
    address: <Place sx={{ color: "#11142D" }} />,
  };

  return (
    <Stack key={key} direction="column" gap={1}>
      <Typography fontSize={14} fontWeight={500} color="#808191">
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </Typography>
      <Box display="flex" flexDirection="row" alignItems="center" gap="10px">
        {IconMap[key] || null}
        {isEditing ? (
          <TextField
            value={editableData[key] || ""}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        ) : (
          <Typography fontSize={14} color="#11142D" noWrap>
            {editableData[key]}
          </Typography>
        )}
      </Box>
    </Stack>
  );
})}


            <Stack direction="row" gap="10px" mt={2}>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#e1c16e", "&:hover": { backgroundColor: "#d4af37" } }}
                onClick={isEditing ? handleSave : handleEditToggle}
                disabled={loading}
              >
                {isEditing ? (loading ? "Saving..." : "Save") : "Edit"}
              </Button>
              {isEditing && (
                <Button variant="outlined" color="secondary" onClick={handleEditToggle}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Profile;

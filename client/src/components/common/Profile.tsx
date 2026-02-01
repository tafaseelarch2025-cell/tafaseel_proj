import { useState, useEffect } from "react";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

interface ProfileProps {
  userId: string;
  type: string; // e.g. "Admin", "Personal", etc.
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar: string;
  [key: string]: any;
}

const Profile = ({ userId, type }: ProfileProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editableData, setEditableData] = useState<Partial<UserData>>({});

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const API_URL = process.env.REACT_APP_API_URL!;
  const token = localStorage.getItem("token");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load profile");
        }

        const data: UserData = await res.json();
        setUserData(data);
        setEditableData(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [userId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setPasswordMessage(null); // reset password feedback when toggling edit
    if (!isEditing) {
      setEditableData(userData || {});
    }
  };

  const handleFieldChange = (field: keyof UserData, value: string) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditableData((prev) => ({
        ...prev,
        avatar: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!token) {
      alert("You must be logged in to update your profile");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editableData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update profile");
      }

      const updated = await res.json();
      setUserData(updated);
      setEditableData(updated);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${userId}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Error changing password" });
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <Typography>Loading profile...</Typography>;
  }

  const iconMap: Record<string, JSX.Element> = {
    email: <EmailIcon sx={{ color: "#11142D" }} />,
    phone: <PhoneIcon sx={{ color: "#11142D" }} />,
    address: <PlaceIcon sx={{ color: "#11142D" }} />,
  };

  return (
    <Box>
      <Typography fontSize={25} fontWeight={700} color="#11142D" mb={3}>
        {type} Profile
      </Typography>

      <Box
        mt="20px"
        borderRadius="15px"
        p="24px"
        bgcolor="#FCFCFC"
        boxShadow="0 4px 12px rgba(0,0,0,0.08)"
      >
        <Stack direction={{ xs: "column", md: "row" }} gap={4}>
          {/* Avatar */}
          <Box position="relative" width={160} height={160} mx={{ xs: "auto", md: 0 }}>
            <label htmlFor="avatar-upload" style={{ cursor: isEditing ? "pointer" : "default" }}>
              <img
                src={editableData.avatar || "/default-avatar.png"}
                alt="Profile avatar"
                width={160}
                height={160}
                style={{ borderRadius: "50%", objectFit: "cover", border: "3px solid #eee" }}
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

          {/* Main content */}
          <Stack flex={1} gap={3}>
            {/* Editable fields */}
            {["name", "email", "phone", "address"].map((key) => {
              if (!(key in editableData) && key !== "name") return null;

              return (
                <Box key={key}>
                  <Typography fontSize={14} fontWeight={500} color="#808191" mb={0.5}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    {iconMap[key] || null}
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={editableData[key as keyof UserData] || ""}
                        onChange={(e) => handleFieldChange(key as keyof UserData, e.target.value)}
                      />
                    ) : (
                      <Typography fontSize={15} color="#11142D">
                        {editableData[key as keyof UserData] || "—"}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}

            {/* Action buttons */}
            <Stack direction="row" gap={2} mt={2}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#e1c16e",
                  "&:hover": { bgcolor: "#d4af37" },
                  minWidth: 140,
                }}
                onClick={isEditing ? handleSaveProfile : handleEditToggle}
                disabled={loading}
              >
                {isEditing ? (loading ? "Saving..." : "Save Profile") : "Edit Profile"}
              </Button>

              {isEditing && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleEditToggle}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </Stack>

            {/* Change Password Section */}
            {isEditing && (
              <Box mt={5} p={3} bgcolor="#f9f9f9" borderRadius="12px" border="1px solid #e0e0e0">
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Change Password
                </Typography>

                <Stack spacing={2.5} mt={2}>
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    size="small"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />

                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    size="small"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    size="small"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />

                  {passwordMessage && (
                    <Alert severity={passwordMessage.type} sx={{ mt: 1 }}>
                      {passwordMessage.text}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleChangePassword}
                    disabled={loading}
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    {loading ? "Changing..." : "Update Password"}
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Profile;
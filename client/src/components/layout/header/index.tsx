import type React from "react";
import { useGetIdentity } from "@refinedev/core";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Header: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (identity) {
      setUser(identity);
    } else {
      // fallback: read from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, [identity]);

  if (!user) return null;
  const showUserInfo = user && (user.name || user.avatar);

  const clickProfile = () => {
    navigate("/my-profile");
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ background: "#b8962f" }}
    >
      <Toolbar>
        <Stack
          direction="row"
          width="100%"
          justifyContent="flex-end"
          alignItems="center"
        >
          {showUserInfo && (
            <Stack direction="row" gap="16px" alignItems="center" onClick={clickProfile}>
              {user.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
              {user.name && (
                <Typography variant="subtitle2">{user?.name}</Typography>
              )}
            </Stack>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

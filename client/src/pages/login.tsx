import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export const Login: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();

  // Pre-fill the working default credentials (remove later if you want)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    login(
      { email: email.trim(), password: password.trim() },
      {
        onSuccess: (data) => {
          // Refine returns { success: true } only on real success
          if (!data?.success) {
            setError("Login failed – please try again");
            return;
          }
          // Only redirect when login actually succeeded
          navigate(from, { replace: true });
        },
        onError: (err: any) => {
          // This is where your 401 error message comes
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Invalid email or password";
          setError(message);
        },
      }
    );
  };

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: "auto",
        mt: 8,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h4" textAlign="center" mb={4} fontWeight="bold">
        Login
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <Typography color="error" mt={2} textAlign="center">
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
         
          fullWidth
          size="large"
          disabled={isLoading}
          sx={{ mt: 3, py: 1.5 ,  backgroundColor :"#d4af37" ,
            color : "#fff" , "&:hover": {
      backgroundColor: "#b8962f",  // Change this to your desired hover color
    }, }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>
      </form>

      
    </Box>
  );
};
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Refine, AuthProvider } from "@refinedev/core";
import {
    RefineSnackbarProvider,
    notificationProvider,
    ErrorComponent,
    ThemedLayoutV2,
} from "@refinedev/mui";
import routerBindings, { DocumentTitleHandler, UnsavedChangesNotifier } from "@refinedev/react-router-v6";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { createTheme, ThemeProvider } from "@mui/material";
import WorkOutline from "@mui/icons-material/WorkOutline";
import PersonOutline from "@mui/icons-material/PersonOutline";

import simpleRestProvider from "@refinedev/simple-rest";
import axios from "axios";
import { ColorModeContextProvider } from "contexts";

import {
    Login,
    Home,
    AllProjects,
    CreateProject,
    EditProject,
    ProjectDetails,
    MyProfile,
} from "pages";

import ProtectedRoute from "components/ProtectedRoute";
import { Header, Sider } from "components/layout";

const API_URL = process.env.REACT_APP_API_URL!;

// ----------------- AUTH PROVIDER -----------------
export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });



    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    localStorage.clear();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    return localStorage.getItem("token")
      ? { authenticated: true }
      : { authenticated: false, redirectTo: "/login" };
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  onError: async (error) => {
    console.error(error);
    return {};
  },
};

// ----------------- AXIOS & DATA PROVIDER -----------------
const axiosInstance = axios.create({ baseURL: API_URL });
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const dataProvider = simpleRestProvider(API_URL, axiosInstance);

// ----------------- THEME -----------------
const lightTheme = createTheme({ palette: { mode: "light" } });

// ----------------- APP -----------------
const App: React.FC = () => {
  return (
    <ColorModeContextProvider>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
        <RefineSnackbarProvider>
          <BrowserRouter>
            <Refine
              routerProvider={routerBindings}
              authProvider={authProvider}
              dataProvider={dataProvider}
              notificationProvider={notificationProvider}
              resources={[
                {
                  name: "projects",
                  list: "/projects",
                  create: "/projects/create",
                  edit: "/projects/edit/:id",
                  show: "/projects/show/:id",
                  meta: { label: "Projects", icon: <WorkOutline /> },
                },
                {
                  name: "my-profile",
                  list: "/my-profile",
                  meta: { label: "My Profile", icon: <PersonOutline /> },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                title: { text: "Tafaseel" },
                disableTelemetry: true,
              }}
            >
              <Routes>
                {/* Public route */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <ThemedLayoutV2 Sider={Sider} Header={Header}>
                        <Home />
                      </ThemedLayoutV2>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ThemedLayoutV2 Sider={Sider} Header={Header}>
                        <AllProjects />
                      </ThemedLayoutV2>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/create"
                  element={
                    <ProtectedRoute>
                      <ThemedLayoutV2 Sider={Sider} Header={Header}>
                        <CreateProject />
                      </ThemedLayoutV2>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/edit/:id"
                  element={
                    <ProtectedRoute>
                      <ThemedLayoutV2 Sider={Sider} Header={Header}>
                        <EditProject />
                      </ThemedLayoutV2>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/show/:id"
                  element={
                    <ProtectedRoute>
                      <ThemedLayoutV2 Sider={Sider} Header={Header}>
                        <ProjectDetails />
                      </ThemedLayoutV2>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-profile"
                  element={
                    <ProtectedRoute>
                      <ThemedLayoutV2 Sider={Sider} Header={Header}>
                        <MyProfile />
                      </ThemedLayoutV2>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<ErrorComponent />} />
              </Routes>
              <DocumentTitleHandler handler={() => "Tafaseel"} />
              <UnsavedChangesNotifier />
            </Refine>
          </BrowserRouter>
        </RefineSnackbarProvider>
      </ThemeProvider>
    </ColorModeContextProvider>
  );
};

export default App;

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Refine, AuthProvider, OnErrorResponse } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import {
    RefineSnackbarProvider,
    notificationProvider,
    ErrorComponent,
    ThemedLayoutV2,  // Import MUI's layout wrapper
} from "@refinedev/mui";
import routerBindings, { 
    DocumentTitleHandler, 
    UnsavedChangesNotifier,
    CatchAllNavigate 
} from "@refinedev/react-router-v6";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { createTheme, ThemeProvider } from "@mui/material";
import WorkOutline from "@mui/icons-material/WorkOutline";      // Projects
import PersonOutline from "@mui/icons-material/PersonOutline";  // Profile

import { ColorModeContextProvider } from "contexts";  // Your context

import {
    Login,
    Home,
    AllProjects,
    CreateProject,
    EditProject,
    ProjectDetails,
    Agents,
    AgentProfile,
    MyProfile,
} from "pages";
import ProtectedRoute from "components/ProtectedRoute";
import { Header, Sider } from "components/layout";

// ----------------- AUTH PROVIDER -----------------
export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const res = await fetch("https://tafaseel-project.onrender.com/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.user) throw new Error(data.message || "Login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

  getPermissions: async () => null,
  onError: function (error: any): Promise<OnErrorResponse> {
    throw new Error("Function not implemented.");
  }
};



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
              dataProvider={dataProvider("https://tafaseel-project.onrender.com/api/v1")}
              notificationProvider={notificationProvider}
              resources={[
                {
                  name: "projects",
                  list: "/projects",
                  create: "/projects/create",
                  edit: "/projects/edit/:id",
                  show: "/projects/show/:id",
                  meta: { label: "Projects", icon: <WorkOutline /> }
                },
                {
                  name: "my-profile",
                  list: "/my-profile",
                  meta: { label: "My Profile" , icon: <PersonOutline />,}
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                title: {
                  text: "Tafaseel",
                },
              }}
            >
              <Routes>
                {/* Login route */}
                <Route path="/login" element={<Login />} />
                {/* Protected routes - Use ThemedLayoutV2 with custom Sider */}
                <Route
                  path="/"
                  element={
                    <ThemedLayoutV2 Sider={Sider} Header={Header}>
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    </ThemedLayoutV2>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ThemedLayoutV2 Sider={Sider} Header={Header}>
                      <ProtectedRoute>
                        <AllProjects />
                      </ProtectedRoute>
                    </ThemedLayoutV2>
                  }
                />
                <Route
                  path="/projects/create"
                  element={
                    <ThemedLayoutV2 Sider={Sider} Header={Header}>
                      <ProtectedRoute>
                        <CreateProject />
                      </ProtectedRoute>
                    </ThemedLayoutV2>
                  }
                />
                <Route
                  path="/projects/edit/:id"
                  element={
                    <ThemedLayoutV2 Sider={Sider} Header={Header}>
                      <ProtectedRoute>
                        <EditProject />
                      </ProtectedRoute>
                    </ThemedLayoutV2>
                  }
                />
                <Route
                  path="/projects/show/:id"
                  element={
                    <ThemedLayoutV2 Sider={Sider} Header={Header}>
                      <ProtectedRoute>
                        <ProjectDetails />
                      </ProtectedRoute>
                    </ThemedLayoutV2>
                  }
                />
                <Route
                  path="/my-profile"
                  element={
                    <ThemedLayoutV2 Sider={Sider} Header={Header}>
                      <ProtectedRoute>
                        <MyProfile />
                      </ProtectedRoute>
                    </ThemedLayoutV2>
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


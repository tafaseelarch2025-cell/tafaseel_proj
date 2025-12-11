import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Refine, AuthProvider } from "@refinedev/core";
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

// ----------------- AUTH PROVIDER -----------------
export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        try {
            const res = await fetch("http://localhost:8080/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok || !data.user) {
                return { success: false, error: new Error(data.message || "Login failed") };
            }

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user", JSON.stringify(data.user));

            return { success: true, redirectTo: "/" };
        } catch (error: any) {
            return { success: false, error };
        }
    },

    logout: async () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        return { success: true, redirectTo: "/login" };
    },

    check: async () => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        return isLoggedIn === "true"
            ? { authenticated: true }
            : { authenticated: false, redirectTo: "/login" };
    },

    getIdentity: async () => {
        try {
            const user = localStorage.getItem("user");
            if (!user || user === "undefined") return null; // safe check
            return JSON.parse(user);
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            return null;
        }
    },

    getPermissions: async () => null,
    onError: async (error) => ({ error }),
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
                            dataProvider={dataProvider("http://localhost:8080/api/v1")}
                            notificationProvider={notificationProvider}
                            resources={[
                                { 
                                    name: "projects", 
                                    list: "/projects", 
                                    create: "/projects/create", 
                                    edit: "/projects/edit/:id", 
                                    show: "/projects/show/:id",
                                    meta: { label: "Projects" }  // Helps with menu labels
                                },
                                { 
                                    name: "agents", 
                                    list: "/agents", 
                                    show: "/agents/:id",
                                    meta: { label: "Agents" }
                                },
                                { 
                                    name: "my-profile", 
                                    list: "/my-profile",
                                    meta: { label: "My Profile" }
                                },
                            ]}
                            options={{
                                syncWithLocation: true,
                                warnWhenUnsavedChanges: true,
                            }}
                            // NO 'layout' prop here - handled by swizzling or ThemedLayoutV2
                        >
                            <Routes>
                                <Route 
                                    index 
                                    element={
                                        <ThemedLayoutV2>  {/* Wrap non-layout routes */}
                                            <Home />
                                        </ThemedLayoutV2>
                                    } 
                                />
                                <Route path="/login" element={<Login />} />  {/* Login outside layout */}
                                <Route 
                                    path="/projects" 
                                    element={
                                        <ThemedLayoutV2>
                                            <AllProjects />
                                        </ThemedLayoutV2>
                                    } 
                                />
                                <Route 
                                    path="/projects/create" 
                                    element={
                                        <ThemedLayoutV2>
                                            <CreateProject />
                                        </ThemedLayoutV2>
                                    } 
                                />
                                <Route 
                                    path="/projects/edit/:id" 
                                    element={
                                        <ThemedLayoutV2>
                                            <EditProject />
                                        </ThemedLayoutV2>
                                    } 
                                />
                                <Route 
                                    path="/projects/show/:id" 
                                    element={
                                        <ThemedLayoutV2>
                                            <ProjectDetails />
                                        </ThemedLayoutV2>
                                    } 
                                />
                                <Route 
                                    path="/agents" 
                                    element={
                                        <ThemedLayoutV2>
                                            <Agents />
                                        </ThemedLayoutV2>
                                    } 
                                />
                                <Route 
                                    path="/agents/:id" 
                                    element={
                                        <ThemedLayoutV2>
                                            <AgentProfile />
                                        </ThemedLayoutV2>
                                    } 
                                />
                                <Route 
                                    path="/my-profile" 
                                    element={
                                        <ThemedLayoutV2>
                                            <MyProfile />
                                        </ThemedLayoutV2>
                                    } 
                                />
                                <Route path="*" element={<ErrorComponent />} />
                            </Routes>
                            <DocumentTitleHandler />
                            <UnsavedChangesNotifier />
                        </Refine>
                    </BrowserRouter>
                </RefineSnackbarProvider>
            </ThemeProvider>
        </ColorModeContextProvider>
    );
};

export default App;
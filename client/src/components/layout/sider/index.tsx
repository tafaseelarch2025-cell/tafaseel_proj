// components/layout/Sider.tsx
import React, { useState, useEffect } from "react";
import type { Sider as DefaultSider } from "@refinedev/mui";
import { useMenu, useTranslate, CanAccess, useLogout, useIsExistAuthentication, useRouterContext, useRefineContext, useTitle } from "@refinedev/core";
import Box from "@mui/material/Box";
import MuiList from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";

import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Dashboard from "@mui/icons-material/Dashboard";
import ListOutlined from "@mui/icons-material/ListOutlined";
import Logout from "@mui/icons-material/Logout";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { Title as DefaultTitle } from "../title"; // Adjust path if needed
import { NavLink } from "react-router-dom";

export const Sider: typeof DefaultSider = ({ render }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu();
  const { Link } = useRouterContext();
  const { hasDashboard } = useRefineContext();
  const translate = useTranslate();
  const isExistAuthentication = useIsExistAuthentication();
  const { mutate: logout } = useLogout({ v3LegacyAuthProviderCompatible: true });
  const Title = useTitle();
  useEffect(() => {
    const newOpen: { [key: string]: boolean } = {};
    defaultOpenKeys.forEach((key) => (newOpen[key] = true));
    setOpen(newOpen);
  }, [defaultOpenKeys]);

  const RenderToTitle = Title ?? DefaultTitle;
  const handleClick = (key: string) => setOpen({ ...open, [key]: !open[key] });

  const renderTree = (tree: typeof menuItems, selectedKey: string) =>
    tree.map((item) => {
      const isSelected = item.route === selectedKey;
      const hasChildren = item.children && item.children.length > 0;
      if (hasChildren) {
        return (
          <CanAccess key={item.route} resource={item.name} action="list">
            <div>
              <ListItemButton onClick={() => handleClick(item.route || "")}>
                <ListItemIcon>{item.icon ?? <ListOutlined />}</ListItemIcon>
                <ListItemText primary={item.label ?? item.name} />
                {open[item.route || ""] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open[item.route || ""]} timeout="auto" unmountOnExit>
                <MuiList>{renderTree(item.children, selectedKey)}</MuiList>
              </Collapse>
            </div>
          </CanAccess>
        );
      }
      return (
        <CanAccess key={item.route} resource={item.name} action="list">
          <ListItemButton component={NavLink} to={item.route || ""} selected={isSelected}>
            <ListItemIcon>{item.icon ?? <ListOutlined />}</ListItemIcon>
            <ListItemText primary={item.label ?? item.name} />
          </ListItemButton>
        </CanAccess>
      );
    });

  // Render the provided render prop if it exists (for further customization)
  if (render) {
    return render({
      dashboard: hasDashboard ? (
        <CanAccess resource="dashboard" action="list">
          <ListItemButton component={Link} to="/" selected={selectedKey === "/"}>
            <ListItemIcon><Dashboard /></ListItemIcon>
            <ListItemText primary={translate("dashboard.title", "Dashboard")} />
          </ListItemButton>
        </CanAccess>
      ) : null,
      items: renderTree(menuItems, selectedKey),
      logout: isExistAuthentication ? (
        <ListItemButton onClick={() => logout()}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary={translate("buttons.logout", "Logout")} />
        </ListItemButton>
      ) : null,
      collapsed,
    });
  }

 // components/layout/Sider.tsx

return (
  <Box
  sx={{
    width: collapsed ? 64 : 200,
    height: "100hv", // Full height of its flex container
    display: "flex",
    flexDirection: "column",
    bgcolor: "#fff",
    borderRight: "1px solid #eee",
    transition: "width 0.3s ease",
  }}
>
    {/* Title/Logo Section */}
    <Box
      sx={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <RenderToTitle collapsed={collapsed} />
    </Box>

    {/* Menu Section - Scrollable */}
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <MuiList sx={{ p: 0, pt: 2 }}>
        {hasDashboard && (
          <CanAccess resource="dashboard" action="list">
            <ListItemButton
              component={NavLink}
              to="/"
              selected={selectedKey === "/"}
            >
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary={translate("dashboard.title", "Dashboard")} />
            </ListItemButton>
          </CanAccess>
        )}
        {renderTree(menuItems, selectedKey)}
        {isExistAuthentication && (
          <ListItemButton onClick={() => logout()}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary={translate("buttons.logout", "Logout")} />
          </ListItemButton>
        )}
      </MuiList>
    </Box>

    {/* Collapse Toggle */}
    <Box sx={{ p: 1, flexShrink: 0, borderTop: "1px solid #eee" }}>
      <Tooltip title={collapsed ? "Expand" : "Collapse"} arrow placement="right">
        <Button
          onClick={() => setCollapsed(!collapsed)}
          sx={{ minWidth: "auto", p: 1, width: "100%" }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </Tooltip>
    </Box>
  </Box>
);
};
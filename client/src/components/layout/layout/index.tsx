// components/layout/index.tsx
import React from "react";
import type { LayoutProps } from "@refinedev/core";
import Box from "@mui/material/Box";
import { Sider as DefaultSider } from "../sider";
import { Header as DefaultHeader } from "../header";

// components/layout/index.tsx

export const Layout: React.FC<LayoutProps> = ({
  Sider,
  Header,
  Footer,
  OffLayoutArea,
  children,
}) => {
  const SiderToRender = Sider ?? DefaultSider;
  const HeaderToRender = Header ?? DefaultHeader;

  return (
    <Box display="flex" minHeight="100vh">
      <SiderToRender />

      <Box display="flex" flexDirection="column" flex={1}>
        <HeaderToRender />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
        {Footer && <Footer />}
      </Box>

      {OffLayoutArea && <OffLayoutArea />}
    </Box>
  );
};

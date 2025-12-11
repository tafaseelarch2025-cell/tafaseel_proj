import React from "react";
import type { LayoutProps } from "@refinedev/core";
import Box from "@mui/material/Box";
import { Sider as DefaultSider } from "../sider";
import { Header as DefaultHeader } from "../header";

export const Layout: React.FC<LayoutProps> = ({ Sider, Header, Footer, OffLayoutArea, children }) => {
    const SiderToRender = Sider ?? DefaultSider;
    const HeaderToRender = Header ?? DefaultHeader;

    return (
        <Box display="flex">
            <SiderToRender />
            <Box display="flex" flexDirection="column" flex={1} minHeight="100vh">
                <HeaderToRender />
                <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
                    {children}
                </Box>
                {Footer && <Footer />}
            </Box>
            {OffLayoutArea && <OffLayoutArea />}
        </Box>
    );
};

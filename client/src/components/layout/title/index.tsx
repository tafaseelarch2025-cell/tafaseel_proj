// components/layout/Title.tsx (or wherever it's located)
import type React from "react";
import { useRouterContext, type TitleProps } from "@refinedev/core";
import Button from "@mui/material/Button";
import { logo, tafaseel } from "assets";
import { NavLink } from "react-router-dom";


export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  const { Link } = useRouterContext();
  return (
    <Button fullWidth variant="text" disableRipple component={NavLink} to="/">
      
        {collapsed ? (
          <img src={logo} alt="Tafaseel" width="48px" />
        ) : (
          <img src={tafaseel} alt="Tafaseel" width="180px" />
        )}
     
    </Button>
  );
};
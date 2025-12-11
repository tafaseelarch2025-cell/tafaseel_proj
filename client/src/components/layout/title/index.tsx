import type React from "react";
import { useRouterContext, type TitleProps } from "@refinedev/core";
import Button from "@mui/material/Button";

import { logo, tafaseel } from "assets";

export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  const { Link } = useRouterContext();

  return (
    <Button fullWidth variant="text" disableRipple>
      <Link to="/">
        {collapsed ? (
          <img src={logo} alt="tafaseel" width="48px" />
        ) : (
          <img src={tafaseel} alt="Refine" width="180px" />
        )}
      </Link>
    </Button>
  );
};

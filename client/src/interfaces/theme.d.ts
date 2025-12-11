import "@refinedev/mui";
import type { Theme as MuiTheme, ThemeOptions as MuiThemeOptions } from "@mui/material/styles";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type CustomTheme = {
    // Add custom variables here like below:
    // status: {
    //   danger: string;
    // };
};

declare module "@mui/material/styles" {
    interface Theme extends MuiTheme, CustomTheme {}
    interface ThemeOptions extends MuiThemeOptions, CustomTheme {}
}

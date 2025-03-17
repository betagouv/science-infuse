"use client";
import { createMuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";
import type { Theme } from "@mui/material/styles";


export const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider({
    augmentMuiTheme: ({ nonAugmentedMuiTheme, isDark }) => ({
        ...nonAugmentedMuiTheme,
        palette: {
            ...nonAugmentedMuiTheme.palette,
            primary: {
                ...nonAugmentedMuiTheme.palette.primary,
            },
        },
    }),
});
"use client";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import React from "react";

const cache = createCache({ key: "css", prepend: true });

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), sans-serif',
    h1: { fontFamily: 'var(--font-playfair), serif' },
    h2: { fontFamily: 'var(--font-playfair), serif' },
    h3: { fontFamily: 'var(--font-playfair), serif' },
    h4: { fontFamily: 'var(--font-playfair), serif' },
    h5: { fontFamily: 'var(--font-playfair), serif' },
    h6: { fontFamily: 'var(--font-playfair), serif' },
  },
});

export default function RootStyleRegistry({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

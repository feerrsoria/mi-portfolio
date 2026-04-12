"use client";
import React, { useState, useEffect } from "react";
import Hero from "./components/Hero";
import ProjectsSection from "./components/ProjectsSection";
import TechStack from "./components/TechStack";
import ExperienceSection from "./components/ExperienceSection";
import ContactSection from "./components/ContactSection";
import { Box, Typography, Container } from "@mui/material";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Box component="main" sx={{ display: 'flex', flexDirection: 'column' }}>
      <Hero />
      <ProjectsSection />
      <TechStack />
      <ExperienceSection />
      <ContactSection />
      
      <Box component="footer" sx={{ py: 6, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', pl: { xs: 0, lg: '100px' } }}>
        <Container maxWidth="xl" sx={{ ml: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.3em', opacity: 0.3, textTransform: 'uppercase' }}>
            © {new Date().getFullYear()} FERNANDO AGUSTÍN SORIA — ALL RIGHTS RESERVED
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

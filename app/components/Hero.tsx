"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { Box, Typography, Container, Grid2 as Grid } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

interface ProjectData {
  id: string;
  title?: string;
  subtitle_en?: string;
  subtitle_es?: string;
  [key: string]: unknown;
}

export default function Hero() {
  const { t, language } = useLanguage();
  const [featuredProjects, setFeaturedProjects] = useState<ProjectData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, "projects"), orderBy("order", "asc"), limit(2));
    const unsub = onSnapshot(q, (snap) => {
      setFeaturedProjects(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => unsub();
  }, []);

  if (!mounted) return null;

  return (
    <Box component="section" sx={{ 
      minHeight: { xs: 'auto', md: '80vh' }, 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      pt: { xs: 12, md: 16 },
      pb: { xs: 8, md: 0 },
      pl: { xs: 0, lg: '100px' }
    }}>
      <Container maxWidth="xl" sx={{ ml: 0, px: { xs: 3, md: 0 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h1" sx={{ 
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: 'clamp(5rem, 10vw, 11rem)' }, 
            lineHeight: { xs: 1.1, md: 1 },
            mb: { xs: 4, md: 6 }
          }} dangerouslySetInnerHTML={{ __html: t.hero.title }} />
          
          <Typography variant="h5" sx={{ 
            fontWeight: 300, 
            color: 'rgba(0,0,0,0.6)', 
            maxWidth: '600px', 
            mb: { xs: 6, md: 8 },
            fontSize: { xs: '1.1rem', md: '1.5rem' }
          }}>
            {t.hero.subtitle}
          </Typography>
        </motion.div>

        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ mt: 4, alignItems: 'flex-end' }}>
          {featuredProjects.map((p, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
              <Box sx={{ borderTop: '2px solid black', pt: 3 }} className="group">
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', display: 'block', mb: 2 }}>
                  {i === 0 ? t.hero.latestProject : t.hero.communication}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2.125rem' }, '&:hover': { fontStyle: 'italic' }, transition: 'all 0.3s', cursor: 'pointer' }}>
                  {p.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.4)', mt: 1 }}>
                  {language === 'en' ? String(p.subtitle_en) : String(p.subtitle_es)}
                </Typography>
              </Box>
            </Grid>
          ))}

          {featuredProjects.length > 0 && (
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Box sx={{ p: 3, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)' }}>
                  <ArrowDownRight size={32} strokeWidth={1} />
                </Box>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
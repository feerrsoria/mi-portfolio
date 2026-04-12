"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Box, Typography, Container, Stack, Link as MuiLink, Chip } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function ProjectsSection() {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    });
    return () => unsub();
  }, []);
  
  if (loading) return null;

  return (
    <Box component="section" id="projects" sx={{ py: 12, pl: { xs: 0, lg: '100px' } }}>
      <Container maxWidth="xl" disableGutters sx={{ ml: 0 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: '64px' }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
            {t.projects.subtitle}
          </Typography>
          <Typography variant="h2" sx={{ mt: 2, fontSize: { xs: '3rem', md: 'clamp(3rem, 6vw, 6rem)' } }}>
            {t.projects.title}
          </Typography>
        </motion.div>

        <Stack spacing={16}>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Stack direction={{ xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' }} spacing={8} alignItems="center">
                <Box sx={{ 
                  flex: 1, 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  border: '1px solid rgba(0,0,0,0.1)', 
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {project.imageUrl ? (
                    <Box component="img" src={project.imageUrl} alt={project.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'rgba(0,0,0,0.1)', textTransform: 'uppercase' }}>
                      {project.title}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>{project.title}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4, mt: 1, display: 'block' }}>
                    {language === 'en' ? project.subtitle_en : project.subtitle_es}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mt: 3, mb: 4, fontWeight: 300, color: 'rgba(0,0,0,0.7)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                    {language === 'en' ? project.description_en : project.description_es}
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 4 }}>
                    {project.tech?.map((tech: string) => (
                      <Chip key={tech} label={tech} variant="outlined" sx={{ borderRadius: 0, fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }} />
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={4}>
                    {project.live && (
                        <MuiLink href={project.live} target="_blank" sx={{ color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, fontSize: '0.75rem' }}>
                        {t.projects.liveDemo} <ExternalLink size={14} />
                      </MuiLink>
                    )}
                    {project.github && (
                        <MuiLink href={project.github} target="_blank" sx={{ color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, fontSize: '0.75rem' }}>
                        {t.projects.github} <Github size={14} />
                      </MuiLink>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </motion.div>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

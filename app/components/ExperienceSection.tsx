"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Container, Stack } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface ExperienceData {
  id: string;
  role_en?: string;
  role_es?: string;
  company?: string;
  description_en?: string;
  description_es?: string;
  period_en?: string;
  period_es?: string;
  [key: string]: unknown;
}

export default function ExperienceSection() {
  const { t, language } = useLanguage();
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "experience"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setExperiences(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <Box component="section" id="experience" sx={{ py: 12, bgcolor: 'white', pl: { xs: 0, lg: '100px' } }}>
      <Container maxWidth="xl" disableGutters sx={{ ml: 0 }}>
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           style={{ marginBottom: '64px' }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
            {t.experience.subtitle}
          </Typography>
          <Typography variant="h2" sx={{ mt: 2, fontSize: { xs: '3rem', md: 'clamp(3rem, 6vw, 6rem)' } }}>
            {t.experience.title}
          </Typography>
        </motion.div>

        <Stack spacing={8}>
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)', pb: 6 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={4}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {language === 'en' ? String(exp.role_en) : String(exp.role_es)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.6)', mt: 1 }}>{String(exp.company)}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, maxWidth: '600px' }}>
                    <Typography variant="body1" sx={{ fontWeight: 300, color: 'rgba(0,0,0,0.7)', lineHeight: 1.8, mb: 2 }}>
                        {language === 'en' ? String(exp.description_en) : String(exp.description_es)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4, textTransform: 'uppercase' }}>
                        {language === 'en' ? String(exp.period_en) : String(exp.period_es)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

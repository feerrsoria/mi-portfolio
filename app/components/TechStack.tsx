"use client";
import { motion } from "framer-motion";
import { Box, Typography, Container, Grid } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";

const stack = [
  { category: "Languages", items: ["JavaScript", "TypeScript", "PHP", "SQL", "Kotlin"] },
  { category: "Frontend", items: ["React", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Material UI", "Framer Motion"] },
  { category: "Backend", items: ["Node.js", "Express.js", "REST APIs", "JWT", "Sequelize"] },
  { category: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"] },
  { category: "Tools", items: ["Git", "GitHub", "Playwright", "Socket.io", "Clerk", "Firebase"] }
];

export default function TechStack() {
  const { t } = useLanguage();
  return (
    <Box component="section" sx={{ py: 12, bgcolor: 'black', color: 'white' }}>
      <Container maxWidth="xl">
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           style={{ marginBottom: '64px' }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4, textTransform: 'uppercase' }}>
            {t.tech.subtitle}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.05em', mt: 2, fontSize: { xs: '3rem', md: '5rem' } }}>
            {t.tech.title}
          </Typography>
        </motion.div>

        <Grid container spacing={8}>
          {stack.map((cat, i) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={cat.category}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Box sx={{ borderLeft: '1px solid rgba(255,255,255,0.1)', pl: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4, display: 'block', mb: 4, textTransform: 'uppercase' }}>
                    {cat.category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {cat.items.map((item) => (
                      <Typography key={item} variant="h4" sx={{ 
                        fontWeight: 800, 
                        letterSpacing: '-0.02em',
                        transition: 'all 0.2s',
                        cursor: 'crosshair',
                        '&:hover': { fontStyle: 'italic', opacity: 0.5 }
                      }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

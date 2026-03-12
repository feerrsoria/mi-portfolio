"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Stack, 
  Tabs, 
  Tab, 
  Button, 
  Chip,
  Link as MuiLink,
  IconButton
} from "@mui/material";
import { Mail, Clock, ExternalLink, Calendar, Trash2, Plus, Database } from "lucide-react";

const AdminCard = ({ title, subtitle, date, user, status, content, actionIcon: Icon, onDelete }: any) => (
  <Paper elevation={0} sx={{ 
    p: 4, 
    bgcolor: 'rgba(255,255,255,0.03)', 
    border: '1px solid rgba(255,255,255,0.05)', 
    borderRadius: 0,
    '&:hover': { borderColor: 'rgba(255,255,255,0.2)' },
    transition: 'all 0.3s',
    position: 'relative'
  }}>
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{title}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', mt: 0.5, display: 'block' }}>
            {subtitle || user} {date && `• ${date}`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {status && (
            <Chip 
              label={status.toUpperCase()} 
              variant="outlined"
              sx={{ 
                borderRadius: 0, 
                borderColor: status === 'pending' ? 'rgba(255,255,0,0.3)' : 'rgba(0,255,0,0.3)',
                color: status === 'pending' ? '#ffff00' : '#00ff00',
                fontSize: '10px',
                fontWeight: 800
              }} 
            />
          )}
          <IconButton onClick={onDelete} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: 'red' } }}>
            <Trash2 size={16} />
          </IconButton>
        </Stack>
      </Stack>

      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 300, lineHeight: 1.6, maxHeight: '4.8em', overflow: 'hidden' }}>
        {content}
      </Typography>

      <Stack direction="row" spacing={4} sx={{ pt: 1 }}>
        {user && (
          <MuiLink 
            href={`mailto:${user}`} 
            sx={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px', '&:hover': { opacity: 0.6 } }}
          >
            <Mail size={14} /> REPLY
          </MuiLink>
        )}
      </Stack>
    </Stack>
  </Paper>
);

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const unsubR = onSnapshot(query(collection(db, "contactRequests"), orderBy("createdAt", "desc")), (snap) => setRequests(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubP = onSnapshot(query(collection(db, "projects"), orderBy("order", "asc")), (snap) => setProjects(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubE = onSnapshot(query(collection(db, "experience"), orderBy("order", "asc")), (snap) => setExperience(snap.docs.map(d => ({id: d.id, ...d.data()}))));

    return () => { unsubR(); unsubP(); unsubE(); };
  }, []);

  const handleDelete = async (col: string, id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, col, id));
    }
  };

  const seedData = async () => {
    if (!confirm("This will add default data. Continue?")) return;

    // Seed Projects
    const defaultProjects = [
      {
        title: "XDesigner",
        subtitle_en: "Next-Gen Portfolio Builder",
        subtitle_es: "Creador de Portafolios",
        description_en: "Built a drag-and-drop portfolio builder enabling users to design and deploy customizable portfolio websites.",
        description_es: "Creador de portafolios drag-and-drop que permite a los usuarios diseñar y desplegar sitios web personalizables.",
        tech: ["Next.js", "TypeScript", "Tailwind CSS", "Clerk", "Framer Motion"],
        live: "https://designer-portfolio-builder.vercel.app/",
        github: "https://github.com/feerrsoria",
        order: 1
      },
      {
        title: "ToonTalent",
        subtitle_en: "Real-Time Creative Networking",
        subtitle_es: "Red Creativa en Tiempo Real",
        description_en: "Developed a full-stack platform with real-time communication. Built a real-time chat system using Socket.io.",
        description_es: "Plataforma full-stack con comunicación en tiempo real. Sistema de chat construido con Socket.io.",
        tech: ["Next.js", "Express.js", "Socket.io", "PostgreSQL", "Sequelize"],
        live: "https://toon-talent.vercel.app",
        github: "https://github.com/feerrsoria",
        order: 2
      }
    ];

    for (const p of defaultProjects) {
        await addDoc(collection(db, "projects"), p);
    }

    // Seed Experience
    const defaultExp = [
      {
        company: "Freelance",
        role_en: "Web & Mobile Developer",
        role_es: "Desarrollador Web y Móvil",
        period_en: "May 2023 — Sept 2025",
        period_es: "Mayo 2023 — Sept 2025",
        description_en: "Developed full-stack web applications using Next.js, TypeScript, and SQL. Built Android apps using Kotlin and Firebase.",
        description_es: "Desarrollo de aplicaciones full-stack con Next.js, TypeScript y SQL. Apps Android con Kotlin y Firebase.",
        order: 1
      },
      {
        company: "Intellsis",
        role_en: "Developer Intern",
        role_es: "Pasante Desarrollador",
        period_en: "Oct 2023 — Nov 2023",
        period_es: "Oct 2023 — Nov 2023",
        description_en: "Contributed to a proof-of-concept system for point cloud modeling using LiDAR scanner data.",
        description_es: "Contribución a sistema de prueba de concepto para modelado de nubes de puntos con datos LiDAR.",
        order: 2
      }
    ];

    for (const e of defaultExp) {
        await addDoc(collection(db, "experience"), e);
    }

    alert("Seeding complete!");
  };

  return (
    <Box>
      <Grid container spacing={8}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', mb: 6 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => setActiveTab(v)}
              sx={{ 
                '& .MuiTabs-indicator': { bgcolor: 'white' },
                '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.1em', fontSize: '12px' },
                '& .Mui-selected': { color: 'white !important' }
              }}
            >
              <Tab label={`REQUESTS (${requests.length})`} />
              <Tab label={`PROJECTS (${projects.length})`} />
              <Tab label={`EXPERIENCE (${experience.length})`} />
            </Tabs>
          </Box>

          <Grid container spacing={4}>
            {activeTab === 0 && requests.map(r => (
               <Grid size={{ xs: 12, md: 6 }} key={r.id}>
                 <AdminCard 
                   title={r.type === 'budget' ? "Budget Request" : "Project Proposal"}
                   subtitle={r.name}
                   user={r.userEmail}
                   date={r.createdAt?.toDate().toLocaleDateString()}
                   status={r.status}
                   content={r.message}
                   onDelete={() => handleDelete("contactRequests", r.id)}
                 />
               </Grid>
            ))}

            {activeTab === 1 && projects.map(p => (
               <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                 <AdminCard 
                   title={p.title}
                   subtitle={p.subtitle_en}
                   content={p.description_en}
                   onDelete={() => handleDelete("projects", p.id)}
                 />
               </Grid>
            ))}

            {activeTab === 2 && experience.map(e => (
               <Grid size={{ xs: 12, md: 6 }} key={e.id}>
                 <AdminCard 
                   title={e.role_en}
                   subtitle={e.company}
                   content={e.description_en}
                   onDelete={() => handleDelete("experience", e.id)}
                 />
               </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
           <Stack spacing={4}>
            <Paper elevation={0} sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4, textTransform: 'uppercase', mb: 4, display: 'block' }}>Quick Stats</Typography>
                <Stack spacing={6}>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', mb: 1, fontWeight: 800 }}>PENDING REQUESTS</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{requests.filter(r => r.status === 'pending').length}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', mb: 1, fontWeight: 800 }}>LATEST SYNC</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, opacity: 0.8 }}>NOW</Typography>
                    </Box>
                </Stack>
            </Paper>

            <Button onClick={seedData} startIcon={<Database size={16} />} fullWidth variant="outlined" sx={{ borderRadius: 0, borderColor: 'rgba(255,255,255,0.1)', color: 'white', py: 2, fontWeight: 800 }}>
                SEED DEFAULT DATA
            </Button>
           </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

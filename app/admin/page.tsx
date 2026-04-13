"use client";
import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Tabs, 
  Tab, 
  Button, 
  Chip,
  Link as MuiLink,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Mail, Trash2, Database, Edit, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

const AdminCard = ({ title, subtitle, date, user, status, content, onDelete, onEdit }: { title: string; subtitle?: string; date?: string; user?: string; status?: string; content: string; onDelete: () => void; onEdit?: () => void }) => (
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
          {onEdit && (
            <IconButton onClick={onEdit} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#00ccff' } }}>
              <Edit size={16} />
            </IconButton>
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

interface ContactRequest { id: string; type?: string; name?: string; userEmail?: string; status?: string; message?: string; createdAt?: { toDate: () => Date }; [key: string]: unknown; }
interface ProjectData { id: string; title?: string; subtitle_en?: string; description_en?: string; imageUrl?: string; live?: string; github?: string; order?: number; subtitle_es?: string; description_es?: string; [key: string]: unknown; }
interface ExperienceData { id: string; role_en?: string; company?: string; description_en?: string; [key: string]: unknown; }

export default function AdminDashboard() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [experience, setExperience] = useState<ExperienceData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ open: boolean, title: string, message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {} = useAuth();

  useEffect(() => {
    const unsubR = onSnapshot(query(collection(db, "contactRequests"), orderBy("createdAt", "desc")), (snap) => setRequests(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubP = onSnapshot(query(collection(db, "projects"), orderBy("order", "asc")), (snap) => setProjects(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubE = onSnapshot(query(collection(db, "experience"), orderBy("order", "asc")), (snap) => setExperience(snap.docs.map(d => ({id: d.id, ...d.data()}))));

    return () => { unsubR(); unsubP(); unsubE(); };
  }, []);

  const handleDelete = async (col: string, id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      onConfirm: async () => {
        await deleteDoc(doc(db, col, id));
        setConfirmDialog(null);
      }
    });
  };

  const saveProject = async () => {
    if (editingProject && editingProject.id) {
      const { id, ...data } = editingProject;
      await updateDoc(doc(db, "projects", String(id)), data);
      setEditingProject(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `project-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      setEditingProject((prev: ProjectData | null) => prev ? { ...prev, imageUrl: data.publicUrl } : null);
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      setAlertDialog({
        open: true,
        title: 'Upload Failed',
        message: 'Failed to upload image. Please ensure your Supabase configuration is correct and the bucket "projects" exists and is public.\n\nDetails: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const seedData = async () => {
    setConfirmDialog({
      open: true,
      title: 'Seed Default Data',
      message: 'This will add default data to your database. Continue?',
      onConfirm: async () => {
        setConfirmDialog(null);

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

        setAlertDialog({
          open: true,
          title: 'Success',
          message: 'Seeding complete!'
        });
      }
    });
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
                   subtitle={String(r.name || '')}
                   user={String(r.userEmail || '')}
                   date={(r.createdAt as { toDate: () => Date })?.toDate().toLocaleDateString()}
                   status={String(r.status || '')}
                   content={String(r.message || '')}
                   onDelete={() => handleDelete("contactRequests", r.id)}
                 />
               </Grid>
            ))}

            {activeTab === 1 && projects.map(p => (
               <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                 <AdminCard 
                   title={String(p.title || '')}
                   subtitle={String(p.subtitle_en || '')}
                   content={String(p.description_en || '')}
                   onDelete={() => handleDelete("projects", p.id)}
                   onEdit={() => setEditingProject(p)}
                 />
               </Grid>
            ))}

            {activeTab === 2 && experience.map(e => (
               <Grid size={{ xs: 12, md: 6 }} key={e.id}>
                 <AdminCard 
                   title={String(e.role_en || '')}
                   subtitle={String(e.company || '')}
                   content={String(e.description_en || '')}
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

      <Dialog open={!!editingProject} onClose={() => setEditingProject(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#111', color: 'white', borderRadius: 0, border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>EDIT PROJECT</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {editingProject && (
            <Stack spacing={4} sx={{ pt: 2 }}>
              <TextField 
                label="Title" 
                fullWidth 
                variant="outlined" 
                value={editingProject.title || ''} 
                onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    label="Subtitle (EN)" 
                    fullWidth 
                    value={editingProject.subtitle_en || ''} 
                    onChange={e => setEditingProject({...editingProject, subtitle_en: e.target.value})}
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                    sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    label="Subtitle (ES)" 
                    fullWidth 
                    value={editingProject.subtitle_es || ''} 
                    onChange={e => setEditingProject({...editingProject, subtitle_es: e.target.value})}
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                    sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Description (EN)" 
                fullWidth 
                multiline rows={3}
                value={editingProject.description_en || ''} 
                onChange={e => setEditingProject({...editingProject, description_en: e.target.value})}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                sx={{ textarea: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
              />
              <TextField 
                label="Description (ES)" 
                fullWidth 
                multiline rows={3}
                value={editingProject.description_es || ''} 
                onChange={e => setEditingProject({...editingProject, description_es: e.target.value})}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                sx={{ textarea: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
              />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block' }}>Project Image</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    startIcon={uploadingImage ? null : <Upload size={16} />}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 0 }}
                  >
                    {uploadingImage ? 'UPLOADING...' : 'UPLOAD IMAGE'}
                  </Button>
                  {editingProject.imageUrl && (
                    <Box component="img" src={editingProject.imageUrl} sx={{ height: 40, width: 40, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                  )}
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {editingProject.imageUrl || 'No image selected'}
                  </Typography>
                </Stack>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    label="Live URL" 
                    fullWidth 
                    value={editingProject.live || ''} 
                    onChange={e => setEditingProject({...editingProject, live: e.target.value})}
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                    sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    label="GitHub URL" 
                    fullWidth 
                    value={editingProject.github || ''} 
                    onChange={e => setEditingProject({...editingProject, github: e.target.value})}
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                    sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    label="Order" 
                    type="number"
                    fullWidth 
                    value={editingProject.order || 0} 
                    onChange={e => setEditingProject({...editingProject, order: Number(e.target.value)})}
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                    sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                  />
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditingProject(null)} sx={{ color: 'rgba(255,255,255,0.6)' }}>CANCEL</Button>
          <Button onClick={saveProject} variant="contained" sx={{ bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }, fontWeight: 800 }}>SAVE CHANGES</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!alertDialog?.open} onClose={() => setAlertDialog(null)} PaperProps={{ sx: { bgcolor: '#111', color: 'white', borderRadius: 0, border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>{alertDialog?.title}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <Typography>{alertDialog?.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAlertDialog(null)} variant="contained" sx={{ bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }, fontWeight: 800 }}>OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDialog?.open} onClose={() => setConfirmDialog(null)} PaperProps={{ sx: { bgcolor: '#111', color: 'white', borderRadius: 0, border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>{confirmDialog?.title}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <Typography>{confirmDialog?.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfirmDialog(null)} sx={{ color: 'rgba(255,255,255,0.6)' }}>CANCEL</Button>
          <Button onClick={confirmDialog?.onConfirm} variant="contained" sx={{ bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }, fontWeight: 800 }}>CONFIRM</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

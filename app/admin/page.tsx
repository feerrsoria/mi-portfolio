"use client";
import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, FieldValue } from "firebase/firestore";
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
  TextField,
  Slider,
  Divider,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Mail, Trash2, Database, Edit, Upload, Plus, X, ListTodo } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { serverTimestamp } from "firebase/firestore";

const AdminCard = ({ title, subtitle, date, user, status, content, onDelete, onEdit, progress }: { title: string; subtitle?: string; date?: string; user?: string; status?: string; content?: string; onDelete: () => void; onEdit?: () => void; progress?: number }) => (
  <Paper elevation={0} sx={{ 
    p: { xs: 3, md: 4 }, 
    bgcolor: 'rgba(255,255,255,0.03)', 
    border: '1px solid rgba(255,255,255,0.05)', 
    borderRadius: 0,
    '&:hover': { borderColor: 'rgba(255,255,255,0.2)' },
    transition: 'all 0.3s',
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Stack spacing={3} sx={{ flex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
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
                borderColor: status === 'pending' ? 'rgba(255,255,0,0.3)' : status === 'completed' ? 'rgba(0,255,0,0.3)' : 'rgba(255,255,255,0.2)',
                color: status === 'pending' ? '#ffff00' : status === 'completed' ? '#00ff00' : 'white',
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

      {progress !== undefined && (
        <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.4 }}>PROGRESS</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>{progress}%</Typography>
            </Stack>
            <Box sx={{ width: '100%', height: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: '#00ccff' }} />
            </Box>
        </Box>
      )}

      {content && (
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 300, lineHeight: 1.6, maxHeight: '4.8em', overflow: 'hidden' }}>
          {content}
        </Typography>
      )}

      <Stack direction="row" spacing={4} sx={{ pt: 1, mt: 'auto' }}>
        {user && !progress && (
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

interface ContactRequest { id: string; type?: string; name?: string; userEmail?: string; status?: string; message?: string; createdAt?: { toDate: () => Date } | FieldValue; [key: string]: unknown; }
interface ProjectData { 
    id: string; 
    type?: 'portfolio' | 'development';
    // Portfolio fields
    title?: string; 
    subtitle_en?: string; 
    subtitle_es?: string; 
    description_en?: string; 
    description_es?: string; 
    imageUrl?: string; 
    tech?: string[]; 
    live?: string; 
    github?: string; 
    order?: number; 
    // Development fields
    name?: string;
    clientId?: string;
    progress?: number;
    status?: string;
    milestones?: { text: string; completed: boolean; }[];
    createdAt?: { toDate: () => Date } | FieldValue;
    [key: string]: unknown; 
}
interface ExperienceData { id: string; role_en?: string; company?: string; description_en?: string; [key: string]: unknown; }

export default function AdminDashboard() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<ProjectData[]>([]);
  const [devProjects, setDevProjects] = useState<ProjectData[]>([]);
  const [experience, setExperience] = useState<ExperienceData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ open: boolean, title: string, message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMilestone, setNewMilestone] = useState("");

  const {} = useAuth();

  useEffect(() => {
    const unsubR = onSnapshot(query(collection(db, "contactRequests"), orderBy("createdAt", "desc")), (snap) => setRequests(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    
    const unsubP = onSnapshot(query(collection(db, "projects"), orderBy("order", "asc")), (snap) => {
        const all = snap.docs.map(d => ({id: d.id, ...d.data()} as ProjectData));
        setPortfolioProjects(all.filter(p => !p.clientId));
        setDevProjects(all.filter(p => !!p.clientId).sort((a, b) => {
            const dateA = (a.createdAt && 'toDate' in a.createdAt) ? (a.createdAt as { toDate: () => Date }).toDate() : new Date(0);
            const dateB = (b.createdAt && 'toDate' in b.createdAt) ? (b.createdAt as { toDate: () => Date }).toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        }));
    });

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
    if (editingProject) {
      const isPortfolio = editingProject.type === 'portfolio';
      const mainTitle = isPortfolio ? editingProject.title : editingProject.name;

      if (!mainTitle) {
        setAlertDialog({
          open: true,
          title: 'Validation Error',
          message: `${isPortfolio ? 'Portfolio Title' : 'Project Name'} is required.`
        });
        return;
      }

      try {
        if (editingProject.id) {
          const { id, ...data } = editingProject;
          await updateDoc(doc(db, "projects", String(id)), data);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...data } = editingProject;
          if (!isPortfolio) {
              data.createdAt = serverTimestamp();
          }
          await addDoc(collection(db, "projects"), data);
        }
        setEditingProject(null);
      } catch (error) {
        console.error('Error saving project:', error);
        setAlertDialog({
          open: true,
          title: 'Save Failed',
          message: 'Failed to save project. ' + (error instanceof Error ? error.message : 'Unknown error')
        });
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      setAlertDialog({
        open: true,
        title: 'Configuration Missing',
        message: 'Supabase URL is not configured. Please check your .env.local file.'
      });
      return;
    }

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

  const openNewProjectDialog = (type: 'portfolio' | 'development' = 'portfolio') => {
    setEditingProject({ 
      id: '', 
      type,
      title: '', 
      name: '',
      subtitle_en: '', 
      subtitle_es: '', 
      description_en: '', 
      description_es: '', 
      imageUrl: '', 
      tech: [], 
      live: '', 
      github: '', 
      order: portfolioProjects.length + 1,
      progress: 0,
      clientId: '',
      status: 'pending',
      milestones: []
    });
  };

  const addMilestone = () => {
    if (!newMilestone.trim() || !editingProject) return;
    const milestones = [...(editingProject.milestones || []), { text: newMilestone, completed: false }];
    setEditingProject({ ...editingProject, milestones });
    setNewMilestone("");
  };

  const removeMilestone = (idx: number) => {
    if (!editingProject) return;
    const milestones = (editingProject.milestones || []).filter((_, i) => i !== idx);
    setEditingProject({ ...editingProject, milestones });
  };

  const toggleMilestone = (idx: number) => {
    if (!editingProject) return;
    const milestones = (editingProject.milestones || []).map((m, i) => i === idx ? { ...m, completed: !m.completed } : m);
    setEditingProject({ ...editingProject, milestones });
  };

  return (
    <Box>
      <Grid container spacing={{ xs: 4, md: 8 }}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <Box sx={{ 
            borderBottom: '1px solid rgba(255,255,255,0.1)', 
            mb: { xs: 4, md: 6 }, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2
          }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                '& .MuiTabs-indicator': { bgcolor: 'white' },
                '& .MuiTab-root': { 
                    color: 'rgba(255,255,255,0.4)', 
                    fontWeight: 800, 
                    letterSpacing: '0.1em', 
                    fontSize: '11px',
                    minWidth: 'auto',
                    px: 2
                },
                '& .Mui-selected': { color: 'white !important' }
              }}
            >
              <Tab label={`REQUESTS (${requests.length})`} />
              <Tab label={`PORTFOLIO (${portfolioProjects.length})`} />
              <Tab label={`DEV PROJECTS (${devProjects.length})`} />
              <Tab label={`EXPERIENCE (${experience.length})`} />
            </Tabs>
            {(activeTab === 1 || activeTab === 2) && (
              <Button 
                onClick={() => openNewProjectDialog(activeTab === 1 ? 'portfolio' : 'development')} 
                startIcon={<Plus size={16} />} 
                variant="outlined" 
                sx={{ 
                    borderRadius: 0, 
                    borderColor: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    fontWeight: 800, 
                    mb: 1,
                    fontSize: '11px'
                }}
              >
                {activeTab === 1 ? 'ADD TO PORTFOLIO' : 'NEW DEV PROJECT'}
              </Button>
            )}
          </Box>

          <Grid container spacing={4}>
            {activeTab === 0 && requests.map(r => (
               <Grid size={{ xs: 12, md: 6 }} key={r.id}>
                 <AdminCard 
                   title={r.type === 'budget' ? "Budget Request" : "Project Proposal"}
                   subtitle={String(r.name || '')}
                   user={String(r.userEmail || '')}
                   date={(r.createdAt && 'toDate' in r.createdAt) ? (r.createdAt as { toDate: () => Date }).toDate().toLocaleDateString() : ''}
                   status={String(r.status || '')}
                   content={String(r.message || '')}
                   onDelete={() => handleDelete("contactRequests", r.id)}
                 />
               </Grid>
            ))}

            {activeTab === 1 && portfolioProjects.map(p => (
               <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                 <AdminCard 
                   title={String(p.title || '')}
                   subtitle={String(p.subtitle_en || '')}
                   content={String(p.description_en || '')}
                   onDelete={() => handleDelete("projects", p.id)}
                   onEdit={() => {
                       setEditingProject({...p, type: 'portfolio'});
                   }}
                 />
               </Grid>
            ))}

            {activeTab === 2 && devProjects.map(p => (
               <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                 <AdminCard 
                   title={String(p.name || '')}
                   subtitle={`Client: ${p.clientId?.substring(0, 8)}...`}
                   date={(p.createdAt && 'toDate' in p.createdAt) ? (p.createdAt as { toDate: () => Date }).toDate().toLocaleDateString() : ''}
                   status={String(p.status || '')}
                   progress={Number(p.progress || 0)}
                   onDelete={() => handleDelete("projects", p.id)}
                   onEdit={() => {
                        setEditingProject({...p, type: 'development'});
                   }}
                 />
               </Grid>
            ))}

            {activeTab === 3 && experience.map(e => (
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
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', mb: 1, fontWeight: 800 }}>ACTIVE DEV PROJECTS</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{devProjects.filter(p => p.status !== 'completed').length}</Typography>
                    </Box>
                </Stack>
            </Paper>

            <Button onClick={() => openNewProjectDialog('portfolio')} startIcon={<Database size={16} />} fullWidth variant="outlined" sx={{ borderRadius: 0, borderColor: 'rgba(255,255,255,0.1)', color: 'white', py: 2, fontWeight: 800 }}>
                NEW PORTFOLIO ITEM
            </Button>
            <Button onClick={() => openNewProjectDialog('development')} startIcon={<ListTodo size={16} />} fullWidth variant="outlined" sx={{ borderRadius: 0, borderColor: 'rgba(255,255,255,0.1)', color: 'white', py: 2, fontWeight: 800 }}>
                NEW DEV PROJECT
            </Button>
            <Button onClick={seedData} startIcon={<Database size={16} />} fullWidth variant="outlined" sx={{ borderRadius: 0, borderColor: 'rgba(255,255,255,0.1)', color: 'white', py: 2, fontWeight: 800 }}>
                SEED DEFAULT DATA
            </Button>
           </Stack>
        </Grid>
      </Grid>

      <Dialog open={!!editingProject} onClose={() => setEditingProject(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#111', color: 'white', borderRadius: 0, border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>
                    {editingProject?.id ? "EDIT" : "CREATE NEW"} {editingProject?.type?.toUpperCase()} PROJECT
                </Typography>
                <ToggleButtonGroup
                    value={editingProject?.type}
                    exclusive
                    onChange={(_, val) => val && setEditingProject({...editingProject!, type: val})}
                    sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 0 }}
                >
                    <ToggleButton value="portfolio" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)', px: 3, fontWeight: 800, fontSize: '10px' }}>PORTFOLIO</ToggleButton>
                    <ToggleButton value="development" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)', px: 3, fontWeight: 800, fontSize: '10px' }}>DEVELOPMENT</ToggleButton>
                </ToggleButtonGroup>
            </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 0 }}>
          {editingProject && (
            <Stack spacing={4}>
              {editingProject.type === 'portfolio' ? (
                <>
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
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block', fontWeight: 800 }}>PROJECT IMAGE</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageUpload} />
                      <Button variant="outlined" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} startIcon={uploadingImage ? null : <Upload size={16} />} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 0 }}>
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
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Live URL" fullWidth value={editingProject.live || ''} onChange={e => setEditingProject({...editingProject, live: e.target.value})} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="GitHub URL" fullWidth value={editingProject.github || ''} onChange={e => setEditingProject({...editingProject, github: e.target.value})} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField label="Order" type="number" fullWidth value={editingProject.order || 0} onChange={e => setEditingProject({...editingProject, order: Number(e.target.value)})} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField label="Tech (comma-separated)" fullWidth value={(editingProject.tech || []).join(', ')} onChange={e => setEditingProject({...editingProject, tech: e.target.value.split(',').map(s => s.trim())})} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }} />
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField 
                            label="Project Name" 
                            fullWidth 
                            value={editingProject.name || ''} 
                            onChange={e => setEditingProject({...editingProject, name: e.target.value})}
                            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                            sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                         <TextField 
                            label="Status" 
                            fullWidth 
                            select
                            SelectProps={{ native: true }}
                            value={editingProject.status || 'pending'} 
                            onChange={e => setEditingProject({...editingProject, status: e.target.value})}
                            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                            sx={{ select: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                        >
                            <option value="pending" style={{ background: '#111' }}>Pending</option>
                            <option value="in_progress" style={{ background: '#111' }}>In Progress</option>
                            <option value="review" style={{ background: '#111' }}>Review</option>
                            <option value="completed" style={{ background: '#111' }}>Completed</option>
                        </TextField>
                    </Grid>
                  </Grid>

                  <TextField 
                    label="Client UID" 
                    fullWidth 
                    value={editingProject.clientId || ''} 
                    onChange={e => setEditingProject({...editingProject, clientId: e.target.value})}
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
                    sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                    helperText="Firebase User ID to show this project to the client"
                    FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
                  />

                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, display: 'block', fontWeight: 800 }}>PROGRESS ({editingProject.progress || 0}%)</Typography>
                    <Slider
                        value={editingProject.progress || 0}
                        onChange={(_, val) => setEditingProject({...editingProject, progress: val as number})}
                        sx={{ color: 'white' }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, display: 'block', fontWeight: 800 }}>MILESTONES</Typography>
                    <Stack spacing={2}>
                        {editingProject.milestones?.map((m, idx) => (
                            <Stack key={idx} direction="row" spacing={2} alignItems="center">
                                <Checkbox 
                                    checked={m.completed} 
                                    onChange={() => toggleMilestone(idx)}
                                    sx={{ color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: '#00ff00' } }}
                                />
                                <Typography sx={{ flex: 1, color: m.completed ? 'rgba(255,255,255,0.3)' : 'white', textDecoration: m.completed ? 'line-through' : 'none' }}>
                                    {m.text}
                                </Typography>
                                <IconButton onClick={() => removeMilestone(idx)} size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: 'red' } }}>
                                    <X size={14} />
                                </IconButton>
                            </Stack>
                        ))}
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <TextField 
                                placeholder="Add new milestone..." 
                                fullWidth 
                                size="small"
                                value={newMilestone}
                                onChange={e => setNewMilestone(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && addMilestone()}
                                sx={{ bgcolor: 'rgba(255,255,255,0.03)', input: { color: 'white' } }}
                            />
                            <Button onClick={addMilestone} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                <Plus size={18} />
                            </Button>
                        </Stack>
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button onClick={() => setEditingProject(null)} sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800 }}>CANCEL</Button>
          <Button onClick={saveProject} variant="contained" sx={{ bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }, px: 4, fontWeight: 800 }}>
              {editingProject?.id ? 'UPDATE PROJECT' : 'CREATE PROJECT'}
          </Button>
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

"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Stack, 
  LinearProgress,
  Divider,
  Chip
} from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

export default function DevelopmentPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "projects"), where("clientId", "==", user.id));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 2 }}>PROJECT PROGRESS</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.5)', mb: 8 }}>
          Track the development of your active projects in real-time.
        </Typography>

        {projects.length === 0 ? (
          <Paper elevation={0} sx={{ p: 12, border: '1px dashed rgba(0,0,0,0.1)', borderRadius: 0, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.3)', fontWeight: 700, letterSpacing: '0.1em' }}>
              NO ACTIVE PROJECTS FOUND.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={8}>
            {projects.map((proj) => (
              <Paper key={proj.id} elevation={0} sx={{ p: 6, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{proj.name}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.4, textTransform: 'uppercase' }}>
                      STARTED: {proj.createdAt?.toDate().toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip label={proj.status.toUpperCase()} sx={{ borderRadius: 0, fontWeight: 800, bgcolor: 'black', color: 'white' }} />
                </Stack>

                <Box sx={{ mb: 6 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>DEVELOPMENT PROGRESS</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>{proj.progress}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={proj.progress} sx={{ height: 8, bgcolor: 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'black' } }} />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.4, display: 'block', mb: 3 }}>RECENT MILESTONES</Typography>
                  <Stack spacing={2}>
                    {proj.milestones?.map((m: any, idx: number) => (
                      <Stack key={idx} direction="row" spacing={2} alignItems="center">
                        {m.completed ? <CheckCircle2 size={18} /> : <Circle size={18} style={{ opacity: 0.2 }} />}
                        <Typography variant="body2" sx={{ fontWeight: m.completed ? 600 : 400, opacity: m.completed ? 1 : 0.4 }}>
                          {m.text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </motion.div>
    </Box>
  );
}

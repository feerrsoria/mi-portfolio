"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Box, Typography, Paper, Stack, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import { Clock, CheckCircle, MessageSquare, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

interface ContactRequest {
  id: string;
  type?: string;
  projectType?: string;
  goals?: string;
  status?: string;
  createdAt?: { toDate: () => Date };
  [key: string]: unknown;
}

export default function DashboardPage() {
  const { user, loading: isLoaded } = useAuth();
  const { t } = useLanguage();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const q = query(
      collection(db, "contactRequests"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress color="inherit" size={24} />
      </Box>
    );
  }

  const stats = [
    { label: t.dashboard.activeProjects, value: requests.filter(r => r.status === 'approved').length, icon: Clock },
    { label: t.dashboard.budgetsPending, value: requests.filter(r => r.status === 'pending').length, icon: MessageSquare },
    { label: t.dashboard.completed, value: requests.filter(r => r.status === 'completed').length, icon: CheckCircle },
  ];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4, textTransform: 'uppercase' }}>
          {t.dashboard.welcome}
        </Typography>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          letterSpacing: '-0.02em', 
          mt: 1, 
          mb: { xs: 4, md: 6 },
          fontSize: { xs: '2rem', md: '3rem' }
        }}>
          {t.dashboard.hello}, {user?.displayName?.split(" ")[0]?.toUpperCase()}
        </Typography>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {stats.map((stat) => (
            <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
              <Paper elevation={0} sx={{ 
                p: { xs: 3, md: 4 }, 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <stat.icon size={24} strokeWidth={1} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '3rem' } }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.4, textTransform: 'uppercase', fontSize: '10px' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>{t.dashboard.recentActivity}</Typography>
          
          {requests.length > 0 ? (
            <Stack spacing={2}>
              {requests.map((r) => (
                <Paper key={r.id} elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 0 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.03)' }}>
                      {r.type === 'budget' ? <MessageSquare size={18} /> : <AlertCircle size={18} />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {r.type === 'budget' ? t.contact.budget : t.contact.proposal}: {r.projectType || r.goals}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
                        {r.createdAt?.toDate().toLocaleDateString()} • STATUS: 
                        <span style={{ fontWeight: 800, marginLeft: '4px', color: r.status === 'pending' ? 'orange' : 'green' }}>
                            {r.status?.toUpperCase()}
                        </span>
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Box sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.02)', border: '1px dashed rgba(0,0,0,0.1)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.4)', textAlign: 'center' }}>
                {t.dashboard.noActivity}
              </Typography>
            </Box>
          )}
        </Box>
      </motion.div>
    </Box>
  );
}

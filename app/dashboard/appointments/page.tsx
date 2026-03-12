"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Stack, 
  Alert,
  Snackbar,
  Divider
} from "@mui/material";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export default function AppointmentsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    topic: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "appointments"), {
        ...formData,
        userId: user?.id,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ date: "", time: "", topic: "" });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
    setLoading(false);
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 2 }}>SCHEDULE CALL</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.5)', mb: 8, maxWidth: '600px' }}>
          Schedule a video call to discuss your project requirements or get a status update.
        </Typography>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 0 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="PREFERRED DATE"
                  variant="standard"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  InputLabelProps={{ shrink: true, sx: { fontWeight: 800, letterSpacing: '0.1em' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="PREFERRED TIME"
                  variant="standard"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  InputLabelProps={{ shrink: true, sx: { fontWeight: 800, letterSpacing: '0.1em' } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="MEETING TOPIC / AGENDA"
                  variant="standard"
                  multiline
                  rows={3}
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em' } }}
                  placeholder="e.g. Initial project consultation"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button 
                  type="submit" 
                  disabled={loading}
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    borderRadius: 0, 
                    fontWeight: 800, 
                    letterSpacing: '0.2em', 
                    px: 6, 
                    py: 2,
                    mt: 4
                  }}
                  endIcon={<CalendarIcon size={18} />}
                >
                  {loading ? "SCHEDULING..." : "CONFIRM APPOINTMENT"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%', borderRadius: 0, bgcolor: 'black', color: 'white' }}>
          APPOINTMENT REQUESTED! I'LL CONFIRM SOON.
        </Alert>
      </Snackbar>
    </Box>
  );
}

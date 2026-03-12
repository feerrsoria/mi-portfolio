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
  MenuItem,
  Alert,
  Snackbar
} from "@mui/material";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function BudgetPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    projectType: "web-dev",
    budget: "",
    description: "",
    timeline: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "budgets"), {
        ...formData,
        userId: user?.id,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ projectType: "web-dev", budget: "", description: "", timeline: "" });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
    setLoading(false);
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 2 }}>REQUEST BUDGET</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.5)', mb: 8, maxWidth: '600px' }}>
          Tell me about your project and I'll get back to you with a detailed estimate within 24 hours.
        </Typography>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 0 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="PROJECT TYPE"
                  variant="standard"
                  value={formData.projectType}
                  onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                  InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em' } }}
                >
                  <MenuItem value="web-dev">WEB DEVELOPMENT</MenuItem>
                  <MenuItem value="mobile-app">MOBILE APP</MenuItem>
                  <MenuItem value="ui-design">UI/UX DESIGN</MenuItem>
                  <MenuItem value="consulting">CONSULTING</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="ESTIMATED BUDGET (USD)"
                  variant="standard"
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em' } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="PROJECT DESCRIPTION"
                  variant="standard"
                  multiline
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em' } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="PREFERRED TIMELINE"
                  variant="standard"
                  placeholder="e.g. 3 months"
                  required
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em' } }}
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
                  endIcon={<Send size={18} />}
                >
                  {loading ? "SENDING..." : "SEND REQUEST"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%', borderRadius: 0, bgcolor: 'black', color: 'white' }}>
          BUDGET REQUEST SENT SUCCESSFULLY!
        </Alert>
      </Snackbar>
    </Box>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { 
  Box, 
  Typography, 
  Container, 
  Grid2 as Grid, 
  Stack, 
  Link as MuiLink, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert
} from "@mui/material";
import { Mail, Phone, Github, Linkedin, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactSection() {
  const { user } = useAuth();
  const isSignedIn = !!user;
  const { t } = useLanguage();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestType, setRequestType] = useState('budget');
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    message: "",
    projectType: "",
    estBudget: "",
    deadline: "",
    goals: "",
    appointmentDate: "",
    appointmentTime: ""
  });

  useEffect(() => {
    if (requestType === 'appointment' && formData.appointmentDate) {
      const fetchSlots = async () => {
        const q = query(
          collection(db, "contactRequests"), 
          where("type", "==", "appointment"),
          where("appointmentDate", "==", formData.appointmentDate)
        );
        const snap = await getDocs(q);
        setTakenSlots(snap.docs.map(d => d.data().appointmentTime));
      };
      fetchSlots();
    } else {
      setTakenSlots([]);
    }
  }, [requestType, formData.appointmentDate]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setOpenDialog(true);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "contactRequests"), {
        ...formData,
        userId: user?.uid,
        userEmail: user?.email,
        type: requestType,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ 
        name: "", 
        email: "", 
        message: "", 
        projectType: "", 
        estBudget: "", 
        deadline: "", 
        goals: "",
        appointmentDate: "",
        appointmentTime: ""
      });
      if (requestType === 'appointment') {
        setTakenSlots(prev => [...prev, formData.appointmentTime]);
      }
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Error saving request:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <Box component="section" id="contact" sx={{ py: 20, bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', pl: { xs: 0, lg: '100px' } }}>
      <Container maxWidth="xl" disableGutters sx={{ ml: 0 }}>
        <Grid container spacing={12}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ position: { lg: 'sticky' }, top: 120 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
                {t.contact.getInTouch}
              </Typography>
              <Typography 
                variant="h1" 
                sx={{ 
                  mt: 2, 
                  mb: 4, 
                  fontSize: { xs: '3.5rem', md: 'clamp(3.5rem, 6vw, 6.5rem)' }
                }}
                dangerouslySetInnerHTML={{ __html: t.contact.title }}
              />
              <Typography variant="h6" sx={{ fontWeight: 300, color: 'rgba(0,0,0,0.6)', maxWidth: '450px', mb: 8 }}>
                {t.contact.subtitle}
              </Typography>

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.3 }}>{t.contact.email}</Typography>
                    <MuiLink href="mailto:bercho001@gmail.com" sx={{ color: 'black', textDecoration: 'none', fontWeight: 600 }}>
                      bercho001@gmail.com
                    </MuiLink>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.3 }}>{t.contact.phone}</Typography>
                    <MuiLink href="tel:+542944247311" sx={{ color: 'black', textDecoration: 'none', fontWeight: 600 }}>
                      +54 294 4247311
                    </MuiLink>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.3 }}>{t.contact.location}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>Bariloche, Argentina</Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.3 }}>{t.contact.social}</Typography>
                    <Stack direction="row" spacing={2}>
                      <MuiLink href="#" sx={{ color: 'black' }}><Github size={20} strokeWidth={1.5} /></MuiLink>
                      <MuiLink href="#" sx={{ color: 'black' }}><Linkedin size={20} strokeWidth={1.5} /></MuiLink>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'rgba(0,0,0,0.02)', p: { xs: 4, md: 8 }, border: '1px solid rgba(0,0,0,0.05)' }}>
              {success ? (
                 <Stack spacing={4} alignItems="center" sx={{ py: 8 }}>
                   <CheckCircle2 size={64} color="green" />
                   <Typography variant="h3" sx={{ fontWeight: 800 }}>THANK YOU</Typography>
                   <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.4)', textAlign: 'center' }}>
                     Your {requestType === 'budget' ? 'budget request' : 'project proposal'} has been received.<br />
                     Check the client dashboard for status updates.
                   </Typography>
                 </Stack>
              ) : (
                <>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 6 }}>{t.contact.formTitle}</Typography>
                <FormControl component="fieldset" sx={{ mb: 6 }}>
                  <FormLabel sx={{ fontWeight: 800, color: 'black !important', letterSpacing: '0.1em', fontSize: '10px', mb: 2 }}>{t.contact.type}</FormLabel>
                  <RadioGroup row value={requestType} onChange={(e) => setRequestType(e.target.value)}>
                    <FormControlLabel value="budget" control={<Radio color="primary" />} label={<Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t.contact.budget}</Typography>} />
                    <FormControlLabel value="proposal" control={<Radio color="primary" />} label={<Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t.contact.proposal}</Typography>} />
                    <FormControlLabel value="appointment" control={<Radio color="primary" />} label={<Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>APPOINTMENT</Typography>} />
                  </RadioGroup>
                </FormControl>

                <Stack spacing={6}>
                  <Grid container spacing={6}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField 
                        fullWidth 
                        variant="standard" 
                        label={t.contact.name.toUpperCase()} 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px', lineHeight: 1 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField 
                        fullWidth 
                        variant="standard" 
                        label={t.contact.email.toUpperCase()} 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px', lineHeight: 1 } }}
                      />
                    </Grid>
                  </Grid>

                  {requestType === 'budget' && (
                    <Grid container spacing={6}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                          fullWidth 
                          variant="standard" 
                          label={t.contact.projectType.toUpperCase()} 
                          required
                          value={formData.projectType}
                          onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                          InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px', lineHeight: 1 } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                          fullWidth 
                          variant="standard" 
                          label={t.contact.estBudget.toUpperCase()} 
                          required
                          value={formData.estBudget}
                          onChange={(e) => setFormData({...formData, estBudget: e.target.value})}
                          InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px', lineHeight: 1 } }}
                        />
                      </Grid>
                    </Grid>
                  )}
                  {requestType === 'proposal' && (
                    <Grid container spacing={6}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                          fullWidth 
                          variant="standard" 
                          label={t.contact.deadline.toUpperCase()} 
                          required
                          value={formData.deadline}
                          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                          InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px', lineHeight: 1 } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                          fullWidth 
                          variant="standard" 
                          label={t.contact.goals.toUpperCase()} 
                          required
                          value={formData.goals}
                          onChange={(e) => setFormData({...formData, goals: e.target.value})}
                          InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px', lineHeight: 1 } }}
                        />
                      </Grid>
                    </Grid>
                  )}
                  {requestType === 'appointment' && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', mb: 2, display: 'block' }}>SELECT DATE & TIME</Typography>
                      <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField 
                            fullWidth 
                            type="date"
                            variant="outlined" 
                            required
                            value={formData.appointmentDate}
                            onChange={(e) => setFormData({...formData, appointmentDate: e.target.value, appointmentTime: ''})}
                            inputProps={{ min: new Date().toISOString().split('T')[0] }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          {formData.appointmentDate ? (
                            <Stack direction="row" flexWrap="wrap" gap={2}>
                              {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map(slot => {
                                const isTaken = takenSlots.includes(slot);
                                return (
                                  <Button
                                    key={slot}
                                    variant={formData.appointmentTime === slot ? "contained" : "outlined"}
                                    onClick={() => setFormData({...formData, appointmentTime: slot})}
                                    disabled={isTaken}
                                    sx={{ 
                                      borderRadius: 0, 
                                      fontWeight: 800,
                                      opacity: isTaken ? 0.3 : 1,
                                      filter: isTaken ? 'blur(1px)' : 'none',
                                      borderColor: isTaken ? 'transparent' : 'black',
                                      color: formData.appointmentTime === slot ? 'white' : 'black',
                                      bgcolor: formData.appointmentTime === slot ? 'black' : 'transparent',
                                      '&:hover': {
                                        bgcolor: isTaken ? 'transparent' : 'black',
                                        color: isTaken ? 'black' : 'white'
                                      }
                                    }}
                                  >
                                    {slot}
                                  </Button>
                                )
                              })}
                            </Stack>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}>Please select a date first</Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <TextField 
                    fullWidth 
                    variant="standard" 
                    label={t.contact.message.toUpperCase()} 
                    multiline 
                    rows={4} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px' } }}
                  />
                  <Box>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large"
                      disabled={loading}
                      sx={{ borderRadius: 0, fontWeight: 800, letterSpacing: '0.2em', px: 6, py: 2 }}
                      endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send size={18} />}
                    >
                      {loading ? t.dashboard.sending : t.contact.send}
                    </Button>
                  </Box>
                </Stack>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{ sx: { borderRadius: 0, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{t.contact.loginRequired}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
            {t.contact.loginMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 800, color: 'black' }}>
            {t.contact.close}
          </Button>
          <Button component={MuiLink} href="/dashboard" variant="contained" sx={{ borderRadius: 0, fontWeight: 800 }}>
            {t.nav.login}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

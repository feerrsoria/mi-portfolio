"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  Paper,
  Divider,
  Alert
} from "@mui/material";
import { motion } from "framer-motion";
import Loader from "@/app/components/Loader";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const pendingRequest = sessionStorage.getItem("pendingContactRequest");
      if (pendingRequest) {
        router.push("/#contact");
      } else {
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        router.push(redirectTo);
      }
    }
  }, [user, loading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to login with Google");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: 'rgba(0,0,0,0.02)',
      py: 12
    }}>
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 0, border: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', textAlign: 'center' }}>
              {isLogin ? "WELCOME BACK" : "CREATE ACCOUNT"}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)', mb: 4, textAlign: 'center' }}>
              {isLogin ? "Sign in to your client portal" : "Sign up for a client portal"}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 0 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="EMAIL"
                  type="email"
                  variant="standard"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px' } }}
                />
                <TextField
                  label="PASSWORD"
                  type="password"
                  variant="standard"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputLabelProps={{ sx: { fontWeight: 800, letterSpacing: '0.1em', fontSize: '10px' } }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  disabled={submitting}
                  sx={{ borderRadius: 0, fontWeight: 800, letterSpacing: '0.1em', py: 1.5, mt: 2 }}
                >
                  {isLogin ? "SIGN IN" : "SIGN UP"}
                </Button>
              </Stack>
            </form>

            <Box sx={{ my: 4, display: 'flex', alignItems: 'center' }}>
              <Divider sx={{ flexGrow: 1 }} />
              <Typography variant="caption" sx={{ px: 2, color: 'rgba(0,0,0,0.4)', fontWeight: 700 }}>OR</Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>

            <Button 
              variant="outlined" 
              fullWidth 
              onClick={handleGoogleLogin}
              sx={{ 
                borderRadius: 0, 
                fontWeight: 700, 
                py: 1.5, 
                color: 'black', 
                borderColor: 'rgba(0,0,0,0.2)',
                '&:hover': { borderColor: 'black', bgcolor: 'transparent' }
              }}
            >
              CONTINUE WITH GOOGLE
            </Button>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button 
                  variant="text" 
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{ 
                    fontWeight: 800, 
                    color: 'black', 
                    p: 0, 
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </Button>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

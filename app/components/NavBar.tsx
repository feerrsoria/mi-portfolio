"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { AppBar, Toolbar, Typography, Button, Container, Stack, Box, Menu, MenuItem } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, Shield } from "lucide-react";

export default function NavBar() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { t, language, setLanguage } = useLanguage();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "bercho001@gmail.com,fernandosoria1379@gmail.com";
    const ADMIN_EMAILS = adminEmailsStr.split(",").map(e => e.trim());
    const isAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

    if (!mounted) return null;

    return (
        <AppBar position="fixed" color="default" elevation={0} sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            zIndex: (theme) => theme.zIndex.drawer + 1
        }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
                            FERNANDO<span style={{ fontWeight: 300 }}>SORIA</span>
                        </Typography>
                    </Link>

                    <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <Link href="#projects" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.1em', '&:hover': { opacity: 0.5 } }}>
                                {t.nav.projects}
                            </Typography>
                        </Link>
                        <Link href="#experience" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.1em', '&:hover': { opacity: 0.5 } }}>
                                {t.nav.experience}
                            </Typography>
                        </Link>
                        <Link href="#contact" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.1em', '&:hover': { opacity: 0.5 } }}>
                                {t.nav.contact}
                            </Typography>
                        </Link>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            size="small"
                            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                            sx={{ color: 'black', fontWeight: 800, fontSize: '10px', minWidth: '40px' }}
                            startIcon={<Globe size={14} />}
                        >
                            {language.toUpperCase()}
                        </Button>

                        {isLoaded && (
                            isSignedIn ? (
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
                                            {t.nav.dashboard}
                                        </Typography>
                                    </Link>
                                    <UserButton>
                                        {isAdmin && (
                                            <UserButton.MenuItems>
                                                <UserButton.Link
                                                    label={t.nav.admin}
                                                    labelIcon={<Shield size={16} />}
                                                    href="/admin"
                                                />
                                            </UserButton.MenuItems>
                                        )}
                                    </UserButton>
                                </Stack>
                            ) : (
                                <Button variant="contained" color="primary" component={Link} href="/dashboard" sx={{ 
                                    borderRadius: 0, 
                                    fontSize: '10px', 
                                    fontWeight: 700, 
                                    letterSpacing: '0.2em',
                                    px: 3
                                }}>
                                    {t.nav.login}
                                </Button>
                            )
                        )}
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
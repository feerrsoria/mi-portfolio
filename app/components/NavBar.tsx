"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "./UserButton";
import { useAuth } from "@/context/AuthContext";
import { AppBar, Toolbar, Typography, Button, Container, Stack, Box } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, Shield, Menu, X } from "lucide-react";
import { Drawer, List, ListItem, ListItemButton, ListItemText, IconButton } from "@mui/material";

export default function NavBar() {
    const { user, loading, isAdmin } = useAuth();

    const { t, language, setLanguage } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <AppBar position="fixed" color="default" elevation={0} sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            zIndex: (theme) => theme.zIndex.drawer + 1
        }}>
            <Container maxWidth="xl" sx={{ pl: { xs: 2, lg: '100px' }, ml: 0 }}>
                <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: { xs: 64, md: 80 } }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={() => setMobileOpen(true)}
                            sx={{ display: { md: 'none' } }}
                        >
                            <Menu size={24} />
                        </IconButton>
                        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 800, 
                                letterSpacing: '-0.05em',
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}>
                                FERNANDO<span style={{ fontWeight: 300 }}>SORIA</span>
                            </Typography>
                        </Link>
                    </Stack>

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

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <Button
                            size="small"
                            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                            sx={{ color: 'black', fontWeight: 800, fontSize: '10px', minWidth: '40px' }}
                            startIcon={<Globe size={14} />}
                        >
                            {language.toUpperCase()}
                        </Button>

                        {!loading && (
                            user ? (
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
                                <Button variant="contained" color="primary" component={Link} href="/login" sx={{ 
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
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: 'white' },
                }}
            >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
                        MENU
                    </Typography>
                    <IconButton onClick={() => setMobileOpen(false)}>
                        <X size={20} />
                    </IconButton>
                </Box>
                <Stack spacing={0} sx={{ flex: 1, p: 1 }}>
                    <List>
                        {[
                            { label: t.nav.projects, href: '#projects' },
                            { label: t.nav.experience, href: '#experience' },
                            { label: t.nav.contact, href: '#contact' },
                        ].map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton component={Link} href={item.href} onClick={() => setMobileOpen(false)} sx={{ py: 2 }}>
                                    <ListItemText 
                                        primary={item.label} 
                                        primaryTypographyProps={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.85rem' }} 
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    
                    <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <Stack spacing={3}>
                            <Button
                                fullWidth
                                onClick={() => {
                                    setLanguage(language === 'en' ? 'es' : 'en');
                                    setMobileOpen(false);
                                }}
                                sx={{ justifyContent: 'flex-start', color: 'black', fontWeight: 800, fontSize: '12px' }}
                                startIcon={<Globe size={18} />}
                            >
                                {language === 'en' ? 'ESPAÑOL' : 'ENGLISH'}
                            </Button>

                            {!loading && (
                                user ? (
                                    <Stack spacing={2}>
                                        <Button 
                                            fullWidth 
                                            component={Link} 
                                            href="/dashboard" 
                                            onClick={() => setMobileOpen(false)}
                                            sx={{ justifyContent: 'flex-start', color: 'black', fontWeight: 800, fontSize: '12px' }}
                                        >
                                            {t.nav.dashboard}
                                        </Button>
                                        {isAdmin && (
                                            <Button 
                                                fullWidth 
                                                component={Link} 
                                                href="/admin" 
                                                onClick={() => setMobileOpen(false)}
                                                sx={{ justifyContent: 'flex-start', color: 'black', fontWeight: 800, fontSize: '12px' }}
                                                startIcon={<Shield size={18} />}
                                            >
                                                {t.nav.admin}
                                            </Button>
                                        )}
                                        <Box sx={{ pt: 1 }}>
                                            <UserButton />
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        fullWidth
                                        component={Link} 
                                        href="/login" 
                                        onClick={() => setMobileOpen(false)}
                                        sx={{ 
                                            borderRadius: 0, 
                                            fontSize: '12px', 
                                            fontWeight: 700, 
                                            letterSpacing: '0.2em',
                                            py: 2
                                        }}
                                    >
                                        {t.nav.login}
                                    </Button>
                                )
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Drawer>
        </AppBar>
    );
}

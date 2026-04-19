"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@/app/components/UserButton";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider, 
  Stack,
  IconButton
} from "@mui/material";
import { 
  LayoutDashboard, 
  FileText, 
  Code, 
  Calendar,
  Shield
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const drawerWidth = 280;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { text: t.nav.dashboard, icon: LayoutDashboard, href: "/dashboard" },
    ...(!isAdmin ? [
      { text: "My Budgets", icon: FileText, href: "/dashboard/budget" },
      { text: "My Projects", icon: Code, href: "/dashboard/development" },
    ] : []),
    { text: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
  ];

  if (!mounted) return null;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 4 }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            FERNANDO<span style={{ fontWeight: 300 }}>SORIA</span>
          </Typography>
        </Link>
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', mt: 1, display: 'block' }}>
          {isAdmin ? "ADMIN PANEL" : "CLIENT PORTAL"}
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.05 }} />

      <List sx={{ px: 2, mt: 4, flex: 1 }}>
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                component={Link} 
                href={item.href}
                onClick={() => setMobileOpen(false)}
                sx={{ 
                  borderRadius: 0,
                  bgcolor: active ? 'black' : 'transparent',
                  color: active ? 'white' : 'black',
                  '&:hover': {
                    bgcolor: active ? 'black' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <item.icon size={20} strokeWidth={1.5} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem', 
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 4, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <Stack direction="row" spacing={2} alignItems="center">
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
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{user?.displayName || 'User'}</Typography>
            <Typography variant="caption" noWrap sx={{ color: 'rgba(0,0,0,0.4)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {user?.email}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', bgcolor: 'white', minHeight: '100vh' }}>
        {/* Mobile Header */}
        <Box sx={{ 
          display: { xs: 'flex', md: 'none' }, 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 64, 
          bgcolor: 'white', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          alignItems: 'center',
          px: 2,
          zIndex: 1100
        }}>
          <IconButton onClick={() => setMobileOpen(true)} edge="start" sx={{ mr: 2 }}>
            <LayoutDashboard size={24} />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.05em', flexGrow: 1 }}>
            DASHBOARD
          </Typography>
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0,0,0,0.05)',
              bgcolor: 'white',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: { xs: 3, md: 8 }, 
          pt: { xs: 11, md: 8 },
          maxWidth: '1200px' 
        }}>
          {children}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}

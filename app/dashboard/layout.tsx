"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
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
  Stack
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
  const { user } = useUser();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "bercho001@gmail.com,fernandosoria1379@gmail.com";
  const ADMIN_EMAILS = adminEmailsStr.split(",").map(e => e.trim());
  const isActuallyAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  const menuItems = [
    { text: t.nav.dashboard, icon: LayoutDashboard, href: "/dashboard" },
    ...(!isActuallyAdmin ? [
      { text: "My Budgets", icon: FileText, href: "/dashboard/budget" },
      { text: "My Projects", icon: Code, href: "/dashboard/development" },
    ] : []),
    { text: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
  ];

  if (!mounted) return null;

  return (
    <Box sx={{ display: 'flex', bgcolor: 'white', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0,0,0,0.05)',
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ p: 4 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
              FERNANDO<span style={{ fontWeight: 300 }}>SORIA</span>
            </Typography>
          </Link>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', mt: 1, display: 'block' }}>
            {isActuallyAdmin ? "ADMIN PANEL" : "CLIENT PORTAL"}
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
                {isActuallyAdmin && (
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
              <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{user?.fullName}</Typography>
              <Typography variant="caption" noWrap sx={{ color: 'rgba(0,0,0,0.4)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {user?.primaryEmailAddress?.emailAddress}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 4, md: 8 }, maxWidth: '1200px' }}>
        {children}
      </Box>
    </Box>
  );
}

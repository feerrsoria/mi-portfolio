"use client";
import React, { useState, ReactNode } from 'react';
import { Avatar, Menu, MenuItem, IconButton, Typography, Box, Divider } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface UserButtonProps {
  children?: ReactNode;
}

const UserButtonContext = React.createContext<{ handleClose: () => void } | null>(null);

export function UserButton({ children }: UserButtonProps) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const { t } = useLanguage();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onLogout = async () => {
    handleClose();
    await logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <UserButtonContext.Provider value={{ handleClose }}>
      <Box>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#000', fontSize: '0.875rem' }} src={user.photoURL || undefined}>
            {!user.photoURL && user.email ? user.email.charAt(0).toUpperCase() : ''}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              borderRadius: 2,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {user.displayName || t.nav.account}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {user.email}
            </Typography>
          </Box>
          <Divider />
          {children}
          <MenuItem onClick={onLogout} sx={{ color: 'error.main' }}>
            <LogOut size={16} style={{ marginRight: 8 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.nav.logout}</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </UserButtonContext.Provider>
  );
}

// Emulate Clerk's UserButton.MenuItems structure for drop-in replacement
UserButton.MenuItems = function MenuItems({ children }: { children: ReactNode }) {
  return <>{children}</>;
};

interface UserButtonLinkProps {
  label: string;
  labelIcon?: ReactNode;
  href: string;
}

UserButton.Link = function Link({ label, labelIcon, href }: UserButtonLinkProps) {
  const router = useRouter();
  const context = React.useContext(UserButtonContext);

  const onClick = () => {
    if (context) context.handleClose();
    router.push(href);
  };

  return (
    <MenuItem onClick={onClick}>
      {labelIcon && <span style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>{labelIcon}</span>}
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
    </MenuItem>
  );
};

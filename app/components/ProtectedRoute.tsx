"use client";
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect non-authenticated users to login
        router.push('/login');
      } else if (requireAdmin && !isAdmin) {
        // Redirect non-admins to dashboard if they try to access admin
        router.push('/dashboard');
      }
    }
  }, [user, loading, isAdmin, router, requireAdmin, pathname]);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return <Loader fullScreen />; // Keep loader while redirecting
  }

  return <>{children}</>;
}

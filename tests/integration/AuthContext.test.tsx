import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn()
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
  googleProvider: {}
}));

const TestComponent = () => {
  const { user, loading, isAdmin, loginWithGoogle, logout } = useAuth();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  
  return (
    <div>
      <div data-testid="user-email">{user ? user.email : 'No user'}</div>
      <div data-testid="admin-status">{isAdmin ? 'Admin' : 'Not Admin'}</div>
      <button onClick={loginWithGoogle} data-testid="login-btn">Login</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AuthContext Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides an initial loading state and then user state', async () => {
    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback({ email: 'user@example.com' });
      return vi.fn(); // unsubscribe fn
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial render in TestComponent handles loading
    await waitFor(() => {
      expect(getByTestId('user-email')).toHaveTextContent('user@example.com');
      expect(getByTestId('admin-status')).toHaveTextContent('Not Admin');
    });
  });

  it('identifies admin users correctly', async () => {
    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback({ email: 'bercho001@gmail.com' });
      return vi.fn();
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user-email')).toHaveTextContent('bercho001@gmail.com');
      expect(getByTestId('admin-status')).toHaveTextContent('Admin');
    });
  });

  it('handles login with google', async () => {
    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback(null);
      return vi.fn();
    });
    
    (signInWithPopup as any).mockResolvedValueOnce({});

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      getByTestId('login-btn').click();
    });
    
    expect(signInWithPopup).toHaveBeenCalled();
  });

  it('handles logout', async () => {
    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback({ email: 'user@example.com' });
      return vi.fn();
    });
    
    (signOut as any).mockResolvedValueOnce({});

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      getByTestId('logout-btn').click();
    });
    
    expect(signOut).toHaveBeenCalled();
  });
});

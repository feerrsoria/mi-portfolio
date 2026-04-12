import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserButton } from '@/app/components/UserButton';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

const mockUseLanguage = vi.fn();
vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => mockUseLanguage()
}));

import { translations } from '@/lib/translations';

const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush })
}));

describe('UserButton', () => {
  beforeEach(() => {
    mockUseLanguage.mockReturnValue({ t: translations.en });
  });

  it('does not render if there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() });
    const { container } = render(<UserButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an avatar when user is logged in', () => {
    mockUseAuth.mockReturnValue({ 
      user: { email: 'test@example.com', displayName: 'Test User' }, 
      logout: vi.fn() 
    });
    render(<UserButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens a menu with user details when clicked', () => {
    mockUseAuth.mockReturnValue({ 
      user: { email: 'test@example.com', displayName: 'Test User' }, 
      logout: vi.fn() 
    });
    render(<UserButton />);
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText(translations.en.nav.logout)).toBeInTheDocument();
  });

  it('calls logout and redirects when Sign Out is clicked', async () => {
    const logoutMock = vi.fn();
    mockUseAuth.mockReturnValue({ 
      user: { email: 'test@example.com', displayName: 'Test User' }, 
      logout: logoutMock 
    });
    render(<UserButton />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(translations.en.nav.logout));
    
    expect(logoutMock).toHaveBeenCalled();
  });
});

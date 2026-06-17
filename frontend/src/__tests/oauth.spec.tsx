import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Navbar from '../components/shared/navbar';
import LoginPage from '../app/login/page';

// Mock useRouter and usePathname
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock cart provider
vi.mock('@/providers/cart-provider', () => ({
  useCart: () => ({
    cartItems: [],
    setIsCartOpen: vi.fn(),
  }),
}));

// Mock theme provider
vi.mock('@/providers/theme-provider', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

// Mock auth provider values dynamically
const mockAuthValues = {
  user: null as any,
  isAuthenticated: false,
  login: vi.fn(),
  googleLoginCallback: vi.fn(),
};

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => mockAuthValues,
}));

describe('Navbar Personalization and Avatar Rendering', () => {
  it('should display the first name and the avatar image when authenticated', () => {
    mockAuthValues.isAuthenticated = true;
    mockAuthValues.user = {
      id: '1',
      name: 'Rahul Nair',
      email: 'rahul.nair@gmail.com',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    };

    render(<Navbar />);
    
    // Check if first name is displayed
    const firstNameElement = screen.getByText('Rahul');
    expect(firstNameElement).toBeInTheDocument();

    // Check if avatar image is displayed with correct src
    const imgElement = screen.getByAltText('Profile');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
  });

  it('should render user fallback initials or default icon when avatar is missing', () => {
    mockAuthValues.isAuthenticated = true;
    mockAuthValues.user = {
      id: '1',
      name: 'Priya Menon',
      email: 'priya@example.com',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profileImage: null,
    };

    render(<Navbar />);

    // Check if first name is displayed
    const nameElement = screen.getByText('Priya');
    expect(nameElement).toBeInTheDocument();

    // Verify avatar img is not rendered
    const imgElement = screen.queryByAltText('Profile');
    expect(imgElement).not.toBeInTheDocument();
  });
});

describe('LoginPage Google Button Rendering', () => {
  it('should render the Google button with text "Continue with Google"', () => {
    mockAuthValues.isAuthenticated = false;
    mockAuthValues.user = null;

    render(<LoginPage />);
    const googleButton = screen.getByText('Continue with Google');
    expect(googleButton).toBeInTheDocument();
  });
});

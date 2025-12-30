import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  toggleCollapse: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to collapsed on desktop (always visible), closed on mobile
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // On desktop, start collapsed (quick sidebar always visible)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  const toggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      // On desktop: toggle between collapsed and expanded (never fully hidden)
      setIsCollapsed(prev => !prev);
      setIsOpen(true); // Keep it open on desktop
    } else {
      // On mobile: toggle show/hide
      setIsOpen(prev => !prev);
    }
  };
  
  const toggleCollapse = () => setIsCollapsed(prev => !prev);
  const open = () => {
    setIsOpen(true);
    // On desktop, if opening, default to expanded unless already collapsed
  };
  const close = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      // On desktop: "close" means collapse, not hide
      setIsCollapsed(true);
      setIsOpen(true); // Keep it visible
    } else {
      // On mobile: actually close
      setIsOpen(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ isOpen, isCollapsed, toggle, toggleCollapse, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};


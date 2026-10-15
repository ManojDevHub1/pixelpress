import React, { useState, useEffect } from 'react';

interface AppHeaderProps {
  onOpenModal: (kind: 'how' | 'privacy', triggerEl: HTMLElement | null) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenModal }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detect system preferred color scheme initially
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = isDark ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.style.colorScheme = initialTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.style.colorScheme = nextTheme;
  };

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="PixelPress home">
        <span className="brand-mark" aria-hidden="true">P.</span>
        <span className="brand-name">pixelpress</span>
      </a>

      <nav className="nav" aria-label="Main navigation">
        <button
          type="button"
          onClick={(e) => onOpenModal('how', e.currentTarget)}
        >
          How it works
        </button>
        <button
          type="button"
          onClick={(e) => onOpenModal('privacy', e.currentTarget)}
        >
          Privacy
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☼' : '◐'}
        </button>
        <span className="local-badge">
          <span className="green-dot" aria-hidden="true"></span> Runs in your browser
        </span>
      </nav>
    </header>
  );
};

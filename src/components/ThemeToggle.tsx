'use client';

import * as React from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  // Initialize theme from document class
  React.useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = root.classList.contains('dark');
    setIsDark(initialColorValue);
  }, []);

  const toggleTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const root = window.document.documentElement;
    const checked = e.target.checked;
    setIsDark(checked);
    if (checked) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="theme-switch-container">
      <label className="switch">
        <input
          role="switch"
          type="checkbox"
          className="switch__input"
          checked={isDark}
          onChange={toggleTheme}
        />
        <svg
          aria-hidden="true"
          height="12px"
          width="12px"
          viewBox="0 0 12 12"
          className="switch__icon switch__icon--light"
        >
          <g strokeLinecap="round" strokeWidth="1" stroke="#fff" fill="none">
            <circle r="2" cy="6" cx="6"></circle>
            <g strokeDasharray="1.5 1.5">
              <polyline transform="rotate(0,6,6)" points="6 10,6 11.5"></polyline>
              <polyline transform="rotate(45,6,6)" points="6 10,6 11.5"></polyline>
              <polyline transform="rotate(90,6,6)" points="6 10,6 11.5"></polyline>
              <polyline transform="rotate(135,6,6)" points="6 10,6 11.5"></polyline>
              <polyline transform="rotate(180,6,6)" points="6 10,6 11.5"></polyline>
              <polyline transform="rotate(225,6,6)" points="6 10,6 11.5"></polyline>
              <polyline transform="rotate(270,6,6)" points="6 10,6 11.5"></polyline>
              <polyline transform="rotate(315,6,6)" points="6 10,6 11.5"></polyline>
            </g>
          </g>
        </svg>
        <svg
          aria-hidden="true"
          height="12px"
          width="12px"
          viewBox="0 0 12 12"
          className="switch__icon switch__icon--dark"
        >
          <g transform="rotate(-45,6,6)" strokeLinejoin="round" strokeWidth="1" stroke="#fff" fill="none">
            <path d="m9,10c-2.209,0-4-1.791-4-4s1.791-4,4-4c.304,0,.598.041.883.105-.995-.992-2.367-1.605-3.883-1.605C2.962.5.5,2.962.5,6s2.462,5.5,5.5,5.5c1.516,0,2.888-.613,3.883-1.605-.285.064-.578.105-.883.105Z"></path>
          </g>
        </svg>
        <span className="switch__sr">Toggle Dark Mode</span>
      </label>
    </div>
  );
}
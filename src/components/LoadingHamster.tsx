'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingHamsterProps {
  className?: string;
  label?: string;
}

export function LoadingHamster({ className, label }: LoadingHamsterProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster">
        <div className="wheel"></div>
        <div className="hamster">
          <div className="hamster__body">
            <div className="hamster__head">
              <div className="hamster__ear"></div>
              <div className="hamster__eye"></div>
              <div className="hamster__nose"></div>
            </div>
            <div className="hamster__limb hamster__limb--fr"></div>
            <div className="hamster__limb hamster__limb--fl"></div>
            <div className="hamster__limb hamster__limb--br"></div>
            <div className="hamster__limb hamster__limb--bl"></div>
            <div className="hamster__tail"></div>
          </div>
        </div>
        <div className="spoke"></div>
      </div>
      {label && <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest animate-pulse">{label}</p>}
    </div>
  );
}
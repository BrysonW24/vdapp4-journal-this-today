'use client';

import { ReactNode } from 'react';

// Simple passthrough provider - auth is handled by authStore
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

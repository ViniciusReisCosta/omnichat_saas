'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { FeedbackProvider } from '@/contexts/FeedbackContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackProvider>
      <AuthProvider>{children}</AuthProvider>
    </FeedbackProvider>
  );
}

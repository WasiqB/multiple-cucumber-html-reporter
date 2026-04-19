import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';
import { Footer } from '@/components/footer';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions()}>
      {children}
      <Footer />
    </HomeLayout>
  );
}

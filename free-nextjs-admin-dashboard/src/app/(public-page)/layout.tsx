import { QueryProvider } from '@/components/providers/QueryProvider';
import React from 'react';
import Header from './header';

function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div >
        <Header />
        <QueryProvider> 
          {children}
        </QueryProvider>
    </div>
  )
}

export default PublicPageLayout
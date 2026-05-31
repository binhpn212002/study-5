import React from 'react';
import Header from './header';

function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div >
        <Header />
      {children}
    </div>
  )
}

export default PublicPageLayout
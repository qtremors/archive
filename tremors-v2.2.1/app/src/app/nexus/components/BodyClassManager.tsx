'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const BodyClassManager = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/nexus') {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [pathname]);

  return null;
};

export default BodyClassManager;
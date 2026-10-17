import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

export const useScreenSize = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const debouncedChangeState = debounce(() => {
      const screenWidth = window.innerWidth;
      setIsMobileView(screenWidth <= 768);
    }, 100);
    window.addEventListener('resize', debouncedChangeState);
    return () => {
      debouncedChangeState.cancel();
      window.removeEventListener('resize', debouncedChangeState);
    };
  }, []);
  return { isMobileView };
};

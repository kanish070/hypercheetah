import React, { useEffect } from 'react';

/**
 * This component handles applying blur effects to maps when dialogs open/close
 * It's a fallback for browsers that don't support the :has() selector
 */
export function DialogMapHandler({ isOpen }: { isOpen: boolean }) {
  useEffect(() => {
    // Find all Leaflet containers
    const maps = document.querySelectorAll('.leaflet-container');
    
    if (isOpen) {
      // When dialog is open, blur maps and disable interaction
      maps.forEach(map => {
        map.setAttribute('style', `
          filter: blur(4px) !important;
          opacity: 0.7 !important;
          pointer-events: none !important;
          transition: filter 0.3s ease, opacity 0.3s ease !important;
        `);
      });
    } else {
      // When dialog is closed, reset map styles with animation
      maps.forEach(map => {
        map.setAttribute('style', `
          filter: blur(0) !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          transition: filter 0.3s ease, opacity 0.3s ease !important;
        `);
        
        // Remove inline styles after transition completes
        setTimeout(() => {
          map.removeAttribute('style');
        }, 300);
      });
    }
    
    return () => {
      // Cleanup - make sure maps are reset when component unmounts
      maps.forEach(map => {
        map.setAttribute('style', '');
      });
    };
  }, [isOpen]);
  
  // This is a utility component, it doesn't render anything
  return null;
}
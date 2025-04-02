import React, { useEffect } from 'react';

/**
 * This component handles hiding and showing the map when dialog opens/closes
 * It's a fallback for browsers that don't support the :has() selector
 */
export function DialogMapHandler({ isOpen }: { isOpen: boolean }) {
  useEffect(() => {
    // Find all Leaflet containers
    const maps = document.querySelectorAll('.leaflet-container');
    
    if (isOpen) {
      // When dialog is open, hide maps and disable interaction
      maps.forEach(map => {
        map.setAttribute('style', 'visibility: hidden !important; z-index: -1 !important; pointer-events: none !important;');
      });
    } else {
      // When dialog is closed, show maps and enable interaction
      maps.forEach(map => {
        map.setAttribute('style', '');
      });
    }
    
    return () => {
      // Cleanup - make sure maps are visible when component unmounts
      maps.forEach(map => {
        map.setAttribute('style', '');
      });
    };
  }, [isOpen]);
  
  // This is a utility component, it doesn't render anything
  return null;
}
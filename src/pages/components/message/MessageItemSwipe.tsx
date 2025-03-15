import React, { useRef, useState, useCallback, memo } from 'react';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onClick: () => void;
  onDelete?: () => void;
}

function SwipeableListItem({ children, onClick, onDelete }: SwipeableListItemProps) {
  const [translation, setTranslation] = useState<number>(0);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const itemRef = useRef<HTMLDivElement | null>(null); 
  const deleteThreshold = -75;

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const diff = e.touches[0].clientX - currentXRef.current;
    currentXRef.current = e.touches[0].clientX;

    const newTranslation = Math.min(0, Math.max(-80, translation + diff));
    setTranslation(newTranslation);
  }, [translation]);

  const handleTouchEnd = useCallback(() => {
    if (translation < deleteThreshold) {
      setTranslation(-80);
    } else {
      setTranslation(0);
    }
  }, [translation, deleteThreshold]);

  const handleDeleteClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onDelete?.(); 
    setTranslation(0); 
  }, [onDelete]);
  
  return (
    <div className="position-relative" style={{ touchAction: 'pan-y pinch-zoom', overflow: 'hidden' }}>
      <div 
        onClick={handleDeleteClick}
        className="position-absolute end-0 top-0 bottom-0 d-flex align-items-center justify-content-center rounded-4 bg-danger text-white"
        style={{ 
          width: `${Math.abs(translation)}px`,
          transition: 'width 0.2s ease-out'
        }}
      >
        Delete
      </div>
      <div 
        ref={itemRef} 
        onClick={onClick}
        className="bg-body z-1 rounded-4 position-relative"
        style={{transform: `translateX(${translation}px)`, transition: 'transform 0.2s ease-out'}}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

SwipeableListItem.displayName = 'SwipeableListItem';

export default memo(SwipeableListItem);
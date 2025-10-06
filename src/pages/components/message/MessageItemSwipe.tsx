import React, { useRef, useState, useCallback, memo, useEffect } from 'react';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onClick: () => void;
  onDelete?: () => void;
  showHint?: boolean;
}

function SwipeableListItem({ children, onClick, onDelete, showHint = true }: SwipeableListItemProps) {
  const [translation, setTranslation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const deleteThreshold = -75;

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('re4cto-swipe-seen');
    
    if (showHint && !hasSeenHint) {
      setTimeout(() => {
        setTranslation(-60);
        setTimeout(() => {
          setTranslation(0);
          localStorage.setItem('re4cto-swipe-seen', 'true');
        }, 800);
      }, 300);
    }
  }, [showHint]);

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
    setTranslation(translation < deleteThreshold ? -80 : 0);
  }, [translation, deleteThreshold]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const diff = e.clientX - currentXRef.current;
    currentXRef.current = e.clientX;
    const newTranslation = Math.min(0, Math.max(-80, translation + diff));
    setTranslation(newTranslation);
  }, [isDragging, translation]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setTranslation(translation < deleteThreshold ? -80 : 0);
  }, [isDragging, translation, deleteThreshold]);

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - currentXRef.current;
      currentXRef.current = e.clientX;
      setTranslation(prev => Math.min(0, Math.max(-80, prev + diff)));
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setTranslation(prev => prev < deleteThreshold ? -80 : 0);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, deleteThreshold]);

  const handleDeleteClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onDelete?.();
    setTranslation(0);
  }, [onDelete]);

  const handleItemClick = useCallback(() => {
    if (!isDragging && translation === 0) {
      onClick();
    }
  }, [isDragging, translation, onClick]);

  return (
    <div className="position-relative overflow-hidden">
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
        onClick={handleItemClick}
        className="bg-body z-1 rounded-4 position-relative"
        style={{
          transform: `translateX(${translation}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          cursor: isDragging ? 'grabbing' : 'pointer',
          userSelect: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </div>
    </div>
  );
}

SwipeableListItem.displayName = 'SwipeableListItem';

export default memo(SwipeableListItem);
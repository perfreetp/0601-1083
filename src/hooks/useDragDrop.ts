import { useState, useCallback, DragEvent } from 'react';

interface UseDragDropOptions {
  onDrop?: (files: File[]) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
}

interface UseDragDropReturn {
  isDragging: boolean;
  isDragOver: boolean;
  dragCount: number;
  handleDragEnter: (e: DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLElement>) => void;
  handleDragOver: (e: DragEvent<HTMLElement>) => void;
  handleDrop: (e: DragEvent<HTMLElement>) => void;
  reset: () => void;
}

export function useDragDrop(options: UseDragDropOptions = {}): UseDragDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCount, setDragCount] = useState(0);

  const { onDrop, onDragEnter, onDragLeave, acceptedTypes, maxFiles = 10, maxSize = 10 * 1024 * 1024 } = options;

  const validateFile = useCallback((file: File): boolean => {
    if (acceptedTypes && acceptedTypes.length > 0) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      const isValid = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        return fileType.startsWith(type) || fileType === type;
      });
      if (!isValid) return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  }, [acceptedTypes, maxSize]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCount(prev => prev + 1);
    setIsDragging(true);
    setIsDragOver(true);
    onDragEnter?.();
  }, [onDragEnter]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCount(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsDragging(false);
        setIsDragOver(false);
        onDragLeave?.();
      }
      return Math.max(0, newCount);
    });
  }, [onDragLeave]);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setIsDragOver(false);
    setDragCount(0);

    const files = Array.from(e.dataTransfer?.files || []);
    const validFiles = files.filter(validateFile).slice(0, maxFiles);
    
    if (validFiles.length > 0) {
      onDrop?.(validFiles);
    }
  }, [onDrop, validateFile, maxFiles]);

  const reset = useCallback(() => {
    setIsDragging(false);
    setIsDragOver(false);
    setDragCount(0);
  }, []);

  return {
    isDragging,
    isDragOver,
    dragCount,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    reset,
  };
}

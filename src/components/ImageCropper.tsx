import React, { useState, useRef, useEffect } from 'react';
import { Button, Text } from 'react-native-paper';

interface ImageCropperProps {
  imageUri: string;
  onCrop: (croppedImageUri: string) => void;
  onCancel: () => void;
}

type ResizeHandle = 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | 'move' | null;

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageUri, onCrop, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState({ x: 50, y: 100, width: 300, height: 400 });
  const [initialCropBox, setInitialCropBox] = useState({ x: 50, y: 100, width: 300, height: 400 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageRef.current) {
      drawCanvas();
    }
  }, [cropBox, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw overlay (darkened area outside crop box)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, cropBox.y);
    ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.height);
    ctx.fillRect(cropBox.x + cropBox.width, cropBox.y, canvas.width - cropBox.x - cropBox.width, cropBox.height);
    ctx.fillRect(0, cropBox.y + cropBox.height, canvas.width, canvas.height - cropBox.y - cropBox.height);

    // Draw crop box border
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

    // Draw corner and edge handles
    const handleSize = 30;
    const edgeHandleSize = 20;
    ctx.fillStyle = '#00FF00';

    // Corners (larger)
    ctx.fillRect(cropBox.x - handleSize/2, cropBox.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x + cropBox.width - handleSize/2, cropBox.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x - handleSize/2, cropBox.y + cropBox.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropBox.x + cropBox.width - handleSize/2, cropBox.y + cropBox.height - handleSize/2, handleSize, handleSize);

    // Edges (smaller)
    ctx.fillRect(cropBox.x + cropBox.width/2 - edgeHandleSize/2, cropBox.y - edgeHandleSize/2, edgeHandleSize, edgeHandleSize); // top
    ctx.fillRect(cropBox.x + cropBox.width/2 - edgeHandleSize/2, cropBox.y + cropBox.height - edgeHandleSize/2, edgeHandleSize, edgeHandleSize); // bottom
    ctx.fillRect(cropBox.x - edgeHandleSize/2, cropBox.y + cropBox.height/2 - edgeHandleSize/2, edgeHandleSize, edgeHandleSize); // left
    ctx.fillRect(cropBox.x + cropBox.width - edgeHandleSize/2, cropBox.y + cropBox.height/2 - edgeHandleSize/2, edgeHandleSize, edgeHandleSize); // right
  };

  const getHandleAtPosition = (x: number, y: number): ResizeHandle => {
    const handleSize = 30;
    const edgeHandleSize = 20;

    // Check corners first
    if (Math.abs(x - cropBox.x) < handleSize && Math.abs(y - cropBox.y) < handleSize) return 'tl';
    if (Math.abs(x - (cropBox.x + cropBox.width)) < handleSize && Math.abs(y - cropBox.y) < handleSize) return 'tr';
    if (Math.abs(x - cropBox.x) < handleSize && Math.abs(y - (cropBox.y + cropBox.height)) < handleSize) return 'bl';
    if (Math.abs(x - (cropBox.x + cropBox.width)) < handleSize && Math.abs(y - (cropBox.y + cropBox.height)) < handleSize) return 'br';

    // Check edges
    if (Math.abs(x - (cropBox.x + cropBox.width/2)) < edgeHandleSize && Math.abs(y - cropBox.y) < edgeHandleSize) return 't';
    if (Math.abs(x - (cropBox.x + cropBox.width/2)) < edgeHandleSize && Math.abs(y - (cropBox.y + cropBox.height)) < edgeHandleSize) return 'b';
    if (Math.abs(x - cropBox.x) < edgeHandleSize && Math.abs(y - (cropBox.y + cropBox.height/2)) < edgeHandleSize) return 'l';
    if (Math.abs(x - (cropBox.x + cropBox.width)) < edgeHandleSize && Math.abs(y - (cropBox.y + cropBox.height/2)) < edgeHandleSize) return 'r';

    // Check if inside box (for moving)
    if (x > cropBox.x && x < cropBox.x + cropBox.width && y > cropBox.y && y < cropBox.y + cropBox.height) return 'move';

    return null;
  };

  const handleStart = (x: number, y: number) => {
    const handle = getHandleAtPosition(x, y);
    setActiveHandle(handle);
    setDragStart({ x, y });
    setInitialCropBox({ ...cropBox });
  };

  const handleMove = (x: number, y: number) => {
    if (!activeHandle) return;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let newBox = { ...initialCropBox };

    if (activeHandle === 'move') {
      newBox.x = Math.max(0, Math.min(initialCropBox.x + dx, canvas.width - initialCropBox.width));
      newBox.y = Math.max(0, Math.min(initialCropBox.y + dy, canvas.height - initialCropBox.height));
    } else {
      // Resizing
      if (activeHandle.includes('l')) {
        const newX = Math.max(0, Math.min(initialCropBox.x + dx, initialCropBox.x + initialCropBox.width - 50));
        newBox.width = initialCropBox.width - (newX - initialCropBox.x);
        newBox.x = newX;
      }
      if (activeHandle.includes('r')) {
        newBox.width = Math.max(50, Math.min(initialCropBox.width + dx, canvas.width - initialCropBox.x));
      }
      if (activeHandle.includes('t')) {
        const newY = Math.max(0, Math.min(initialCropBox.y + dy, initialCropBox.y + initialCropBox.height - 50));
        newBox.height = initialCropBox.height - (newY - initialCropBox.y);
        newBox.y = newY;
      }
      if (activeHandle.includes('b')) {
        newBox.height = Math.max(50, Math.min(initialCropBox.height + dy, canvas.height - initialCropBox.y));
      }
    }

    setCropBox(newBox);
  };

  const handleEnd = () => {
    setActiveHandle(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    handleStart(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    handleMove(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || e.touches.length === 0) return;
    const touch = e.touches[0];
    handleStart(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const cropCanvas = document.createElement('canvas');
    const scaleX = img.naturalWidth / (canvasRef.current?.width || 1);
    const scaleY = img.naturalHeight / (canvasRef.current?.height || 1);

    cropCanvas.width = cropBox.width * scaleX;
    cropCanvas.height = cropBox.height * scaleY;

    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      img,
      cropBox.x * scaleX,
      cropBox.y * scaleY,
      cropBox.width * scaleX,
      cropBox.height * scaleY,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );

    const croppedImageUri = cropCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImageUri);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
        padding: '10px',
      }}>
        <img
          ref={imageRef}
          src={imageUri}
          alt="Preview"
          style={{ display: 'none' }}
          onLoad={(e) => {
            setImageLoaded(true);
            const img = e.target as HTMLImageElement;
            const canvas = canvasRef.current;
            if (canvas) {
              const maxWidth = window.innerWidth - 20;
              const maxHeight = window.innerHeight - 150;
              const scale = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight, 1);

              canvas.width = img.naturalWidth * scale;
              canvas.height = img.naturalHeight * scale;

              // Set initial crop box to center 80% of image
              const initialBox = {
                x: canvas.width * 0.1,
                y: canvas.height * 0.1,
                width: canvas.width * 0.8,
                height: canvas.height * 0.8,
              };
              setCropBox(initialBox);
              setInitialCropBox(initialBox);
            }
          }}
        />
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            cursor: activeHandle ? (activeHandle === 'move' ? 'grabbing' : 'nwse-resize') : 'grab',
            touchAction: 'none',
          }}
        />
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
      }}>
        <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
          Drag corners/edges to resize, drag center to move
        </Text>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={{ flex: 1 }}
          >
            Retake
          </Button>
          <Button
            mode="contained"
            onPress={handleCrop}
            style={{ flex: 1 }}
            icon="crop"
          >
            Crop & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

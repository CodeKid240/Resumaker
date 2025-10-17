import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set initial canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Set drawing style
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);
  
  const getCoords = (e: MouseEvent | TouchEvent): [number, number] => {
      const canvas = canvasRef.current;
      if (!canvas) return [0,0];
      const rect = canvas.getBoundingClientRect();
      if (e instanceof MouseEvent) {
          return [e.clientX - rect.left, e.clientY - rect.top];
      } else {
          return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
      }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const [x, y] = getCoords(e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const [x, y] = getCoords(e.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
    
    const dataUrl = canvasRef.current?.toDataURL('image/png') || '';
    onSignatureChange(dataUrl);
  };
  
  const handleClear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSignatureChange('');
      setHasDrawn(false);
  };

  return (
    <div>
       <p className="block text-sm font-medium text-slate-400 mb-2">Draw your signature below:</p>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="bg-slate-800 border border-slate-600 rounded-md cursor-crosshair w-full h-40"
      />
      <button 
        type="button" 
        onClick={handleClear}
        disabled={!hasDrawn}
        className="mt-2 text-sm text-slate-400 hover:text-blue-400 disabled:text-slate-600 disabled:cursor-not-allowed"
      >
        Clear Signature
      </button>
    </div>
  );
};

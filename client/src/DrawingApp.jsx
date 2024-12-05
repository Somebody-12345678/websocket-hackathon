// src/DrawingApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import useWebSocket from './useWebSocket';

const DrawingApp = () => {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('black');
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const { websocket } = useWebSocket('wss://your-websocket-url', setLines);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    const context = contextRef.current;
    context.strokeStyle = color;
  }, [color]);

  useEffect(() => {
    if (!contextRef.current) return;

    const context = contextRef.current;
    lines.forEach((line) => {
      context.strokeStyle = line.color;
      context.beginPath();
      context.moveTo(line.startX, line.startY);
      context.lineTo(line.endX, line.endY);
      context.stroke();
      context.closePath();
    });
  }, [lines]);

  const handleMouseDown = (event) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event.nativeEvent;
    const startX = contextRef.current.currentX;
    const startY = contextRef.current.currentY;

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    if (websocket) {
      websocket.send(JSON.stringify({
        type: 'DRAW',
        startX,
        startY,
        endX: offsetX,
        endY: offsetY,
        color,
      }));
    }

    contextRef.current.currentX = offsetX;
    contextRef.current.currentY = offsetY;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    contextRef.current.closePath();
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
  };

  return (
    <div>
      <div>
        <button onClick={() => handleColorChange('black')}>Black</button>
        <button onClick={() => handleColorChange('red')}>Red</button>
        <button onClick={() => handleColorChange('blue')}>Blue</button>
        <button onClick={() => handleColorChange('green')}>Green</button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default DrawingApp;

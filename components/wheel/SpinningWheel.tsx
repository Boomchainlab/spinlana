'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WheelSegment } from '@/lib/types';

interface SpinningWheelProps {
  segments: WheelSegment[];
  onSpinComplete: (result: WheelSegment) => void;
  isSpinning?: boolean;
  spinDuration?: number;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  segments,
  onSpinComplete,
  isSpinning = false,
  spinDuration = 5000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const animationRef = useRef<number>();

  const colors = segments.map(s => s.color);
  const sliceAngle = 360 / segments.length;

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    segments.forEach((segment, index) => {
      const startAngle = ((index * sliceAngle + currentRotation) * Math.PI) / 180;
      const endAngle = (((index + 1) * sliceAngle + currentRotation) * Math.PI) / 180;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(segment.label, 0, 0);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX - 15, 30);
    ctx.lineTo(centerX + 15, 30);
    ctx.closePath();
    ctx.fillStyle = '#FF6B9D';
    ctx.fill();
  }, [segments, currentRotation, sliceAngle]);

  // Handle spinning animation
  useEffect(() => {
    if (!isSpinning) return;

    let startTime: number;
    let finalRotation = Math.random() * 360 + 720; // At least 2 full rotations

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Easing function: cubic ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newRotation = finalRotation * easeProgress;
      setCurrentRotation(newRotation % 360);
      setRotation(newRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Spin completed
        const normalizedRotation = (360 - (newRotation % 360)) % 360;
        const winningSegmentIndex = Math.floor(normalizedRotation / sliceAngle) % segments.length;
        onSpinComplete(segments[winningSegmentIndex]);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, spinDuration, segments, sliceAngle, onSpinComplete]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="drop-shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

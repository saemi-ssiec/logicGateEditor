import { Context } from 'konva/lib/Context';
import { GateType } from '../../core/types';

export const getGateShape = (
  gateType: GateType,
  width: number,
  height: number
): ((context: Context) => void) => {
  switch (gateType) {
    case 'AND':
      return (context: Context) => {
        // AND gate shape
        context.moveTo(0, 0);
        context.lineTo(width * 0.5, 0);
        context.arc(width * 0.5, height * 0.5, height * 0.5, -Math.PI / 2, Math.PI / 2, false);
        context.lineTo(0, height);
        context.lineTo(0, 0);
      };

    case 'OR':
      return (context: Context) => {
        // OR gate shape
        context.moveTo(0, 0);
        context.quadraticCurveTo(width * 0.4, 0, width * 0.6, 0);
        context.quadraticCurveTo(width, height * 0.2, width, height * 0.5);
        context.quadraticCurveTo(width, height * 0.8, width * 0.6, height);
        context.quadraticCurveTo(width * 0.4, height, 0, height);
        context.quadraticCurveTo(width * 0.2, height * 0.5, 0, 0);
      };

    case 'NOT':
      return (context: Context) => {
        // NOT gate (triangle with circle)
        context.moveTo(0, 0);
        context.lineTo(width * 0.8, height * 0.5);
        context.lineTo(0, height);
        context.lineTo(0, 0);
        // Add small circle at output
        context.moveTo(width * 0.9, height * 0.5);
        context.arc(width * 0.85, height * 0.5, width * 0.05, 0, Math.PI * 2, false);
      };

    case 'NAND':
      return (context: Context) => {
        // NAND gate (AND with circle)
        context.moveTo(0, 0);
        context.lineTo(width * 0.45, 0);
        context.arc(width * 0.45, height * 0.5, height * 0.5, -Math.PI / 2, Math.PI / 2, false);
        context.lineTo(0, height);
        context.lineTo(0, 0);
        // Add small circle at output
        context.moveTo(width, height * 0.5);
        context.arc(width * 0.95, height * 0.5, width * 0.05, 0, Math.PI * 2, false);
      };

    case 'NOR':
      return (context: Context) => {
        // NOR gate (OR with circle)
        context.moveTo(0, 0);
        context.quadraticCurveTo(width * 0.35, 0, width * 0.55, 0);
        context.quadraticCurveTo(width * 0.9, height * 0.2, width * 0.9, height * 0.5);
        context.quadraticCurveTo(width * 0.9, height * 0.8, width * 0.55, height);
        context.quadraticCurveTo(width * 0.35, height, 0, height);
        context.quadraticCurveTo(width * 0.2, height * 0.5, 0, 0);
        // Add small circle at output
        context.moveTo(width, height * 0.5);
        context.arc(width * 0.95, height * 0.5, width * 0.05, 0, Math.PI * 2, false);
      };


    case 'COMPARATOR':
      return (context: Context) => {
        // Comparator shape (trapezoid)
        context.moveTo(width * 0.2, 0);
        context.lineTo(width * 0.8, 0);
        context.lineTo(width, height * 0.5);
        context.lineTo(width * 0.8, height);
        context.lineTo(width * 0.2, height);
        context.lineTo(0, height * 0.5);
        context.lineTo(width * 0.2, 0);
      };

    case 'RISING':
      return (context: Context) => {
        // Rising edge detector (rectangle with rising edge symbol)
        context.rect(0, 0, width, height);
        // Draw rising edge symbol inside
        context.moveTo(width * 0.3, height * 0.7);
        context.lineTo(width * 0.5, height * 0.7);
        context.lineTo(width * 0.5, height * 0.3);
        context.lineTo(width * 0.7, height * 0.3);
      };

    case 'FALLING':
      return (context: Context) => {
        // Falling edge detector (rectangle with falling edge symbol)
        context.rect(0, 0, width, height);
        // Draw falling edge symbol inside
        context.moveTo(width * 0.3, height * 0.3);
        context.lineTo(width * 0.5, height * 0.3);
        context.lineTo(width * 0.5, height * 0.7);
        context.lineTo(width * 0.7, height * 0.7);
      };

    case 'PDTIMER':
      return (context: Context) => {
        // PDTimer shape (rounded rectangle)
        const radius = Math.min(width, height) * 0.2;
        context.moveTo(radius, 0);
        context.lineTo(width - radius, 0);
        context.arc(width - radius, radius, radius, -Math.PI / 2, 0, false);
        context.lineTo(width, height - radius);
        context.arc(width - radius, height - radius, radius, 0, Math.PI / 2, false);
        context.lineTo(radius, height);
        context.arc(radius, height - radius, radius, Math.PI / 2, Math.PI, false);
        context.lineTo(0, radius);
        context.arc(radius, radius, radius, Math.PI, Math.PI * 1.5, false);
      };

    case 'LABEL':
      return (context: Context) => {
        // Label shape (tag/label icon)
        const tagWidth = width * 0.8;
        context.moveTo(0, height * 0.2);
        context.lineTo(tagWidth, height * 0.2);
        context.lineTo(width, height * 0.5);
        context.lineTo(tagWidth, height * 0.8);
        context.lineTo(0, height * 0.8);
        context.lineTo(0, height * 0.2);
        // Add a small circle for the hole
        context.moveTo(width * 0.2, height * 0.5);
        context.arc(width * 0.15, height * 0.5, width * 0.05, 0, Math.PI * 2, false);
      };

    case 'SWITCH':
      return (context: Context) => {
        // Switch shape (toggle switch representation)
        context.rect(0, 0, width, height);
        // Draw switch lever
        context.moveTo(width * 0.2, height * 0.5);
        context.lineTo(width * 0.5, height * 0.3);
        context.moveTo(width * 0.5, height * 0.5);
        context.lineTo(width * 0.8, height * 0.5);
        // Draw pivot point
        context.moveTo(width * 0.5 + 3, height * 0.5);
        context.arc(width * 0.5, height * 0.5, 3, 0, Math.PI * 2, false);
      };

    default:
      return (context: Context) => {
        // Default rectangle shape
        context.rect(0, 0, width, height);
      };
  }
};
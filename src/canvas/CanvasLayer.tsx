import React from 'react';
import { Layer } from 'react-konva';

interface CanvasLayerProps {
  children?: React.ReactNode;
}

const CanvasLayer: React.FC<CanvasLayerProps> = ({ children }) => {
  return <Layer>{children}</Layer>;
};

export default CanvasLayer;
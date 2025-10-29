import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface QRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

export default function QRCode({ 
  value, 
  size = 120, 
  backgroundColor = '#FFFFFF',
  foregroundColor = '#000000'
}: QRCodeProps) {
  const generateSimpleQR = (data: string): boolean[][] => {
    const hash = data.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const gridSize = 25;
    const grid: boolean[][] = [];
    
    for (let i = 0; i < gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        const seed = (hash + i * gridSize + j) % 997;
        grid[i][j] = seed % 2 === 0;
      }
    }
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i === 0 || i === 6 || j === 0 || j === 6) && !(i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          grid[i][j] = true;
          grid[i][gridSize - 1 - j] = true;
          grid[gridSize - 1 - i][j] = true;
        }
        if (i >= 2 && i <= 4 && j >= 2 && j <= 4) {
          grid[i][j] = true;
          grid[i][gridSize - 1 - j] = true;
          grid[gridSize - 1 - i][j] = true;
        }
      }
    }
    
    return grid;
  };

  const grid = generateSimpleQR(value);
  const gridSize = grid.length;
  const cellSize = size / gridSize;

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <Svg width={size} height={size}>
        {grid.map((row, i) =>
          row.map((cell, j) =>
            cell ? (
              <Rect
                key={`${i}-${j}`}
                x={j * cellSize}
                y={i * cellSize}
                width={cellSize}
                height={cellSize}
                fill={foregroundColor}
              />
            ) : null
          )
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
  },
});

import { Injectable } from '@angular/core';

export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapResult {
  x: number;
  y: number;
  nearestElements: {
    x: ElementRect | null;
    y: ElementRect | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GridSnapService {
  private gridSize = 20;
  private canvasWidth = 1000;
  private canvasHeight = 800;
  private snapThreshold = 10;

  constructor() {}

  setGridSize(size: number) {
    this.gridSize = size;
  }

  setCanvasDimensions(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  snapToGrid(x: number, y: number): { x: number, y: number } {
    return {
      x: Math.round(x / this.gridSize) * this.gridSize,
      y: Math.round(y / this.gridSize) * this.gridSize
    };
  }

  getSnappedPosition(
    x: number, 
    y: number, 
    width: number, 
    height: number,
    otherElements: ElementRect[] = []
  ): SnapResult {
    // First snap to grid
    let snappedX = Math.round(x / this.gridSize) * this.gridSize;
    let snappedY = Math.round(y / this.gridSize) * this.gridSize;
    
    // Initialize nearest elements
    const nearestElements = {
      x: null as ElementRect | null,
      y: null as ElementRect | null
    };

    // Check for element-to-element snapping
    if (otherElements.length > 0) {
      // Current element edges
      const currentLeft = x;
      const currentRight = x + width;
      const currentTop = y;
      const currentBottom = y + height;
      const currentCenterX = x + width / 2;
      const currentCenterY = y + height / 2;
      
      // Find closest snap points
      let closestXDist = this.snapThreshold;
      let closestYDist = this.snapThreshold;
      
      otherElements.forEach(element => {
        const elementLeft = element.x;
        const elementRight = element.x + element.width;
        const elementTop = element.y;
        const elementBottom = element.y + element.height;
        const elementCenterX = element.x + element.width / 2;
        const elementCenterY = element.y + element.height / 2;
        
        // Check horizontal alignment
        // Left edge to left edge
        let dist = Math.abs(currentLeft - elementLeft);
        if (dist < closestXDist) {
          closestXDist = dist;
          snappedX = elementLeft;
          nearestElements.x = element;
        }
        
        // Right edge to right edge
        dist = Math.abs(currentRight - elementRight);
        if (dist < closestXDist) {
          closestXDist = dist;
          snappedX = elementRight - width;
          nearestElements.x = element;
        }
        
        // Left edge to right edge
        dist = Math.abs(currentLeft - elementRight);
        if (dist < closestXDist) {
          closestXDist = dist;
          snappedX = elementRight;
          nearestElements.x = element;
        }
        
        // Right edge to left edge
        dist = Math.abs(currentRight - elementLeft);
        if (dist < closestXDist) {
          closestXDist = dist;
          snappedX = elementLeft - width;
          nearestElements.x = element;
        }
        
        // Center alignment
        dist = Math.abs(currentCenterX - elementCenterX);
        if (dist < closestXDist) {
          closestXDist = dist;
          snappedX = elementCenterX - width / 2;
          nearestElements.x = element;
        }
        
        // Check vertical alignment
        // Top edge to top edge
        dist = Math.abs(currentTop - elementTop);
        if (dist < closestYDist) {
          closestYDist = dist;
          snappedY = elementTop;
          nearestElements.y = element;
        }
        
        // Bottom edge to bottom edge
        dist = Math.abs(currentBottom - elementBottom);
        if (dist < closestYDist) {
          closestYDist = dist;
          snappedY = elementBottom - height;
          nearestElements.y = element;
        }
        
        // Top edge to bottom edge
        dist = Math.abs(currentTop - elementBottom);
        if (dist < closestYDist) {
          closestYDist = dist;
          snappedY = elementBottom;
          nearestElements.y = element;
        }
        
        // Bottom edge to top edge
        dist = Math.abs(currentBottom - elementTop);
        if (dist < closestYDist) {
          closestYDist = dist;
          snappedY = elementTop - height;
          nearestElements.y = element;
        }
        
        // Center alignment
        dist = Math.abs(currentCenterY - elementCenterY);
        if (dist < closestYDist) {
          closestYDist = dist;
          snappedY = elementCenterY - height / 2;
          nearestElements.y = element;
        }
      });
    }
    
    return {
      x: snappedX,
      y: snappedY,
      nearestElements
    };
  }

  constrainToCanvas(element: ElementRect): ElementRect {
    return {
      x: Math.max(0, Math.min(element.x, this.canvasWidth - element.width)),
      y: Math.max(0, Math.min(element.y, this.canvasHeight - element.height)),
      width: element.width,
      height: element.height
    };
  }

  areElementsOverlapping(element1: ElementRect, element2: ElementRect): boolean {
    return !(
      element1.x + element1.width < element2.x ||
      element1.x > element2.x + element2.width ||
      element1.y + element1.height < element2.y ||
      element1.y > element2.y + element2.height
    );
  }

  // Get grid cells for the canvas
  getGridCells(): { x: number, y: number }[] {
    const cells: { x: number, y: number }[] = [];
    
    for (let x = 0; x < this.canvasWidth; x += this.gridSize) {
      for (let y = 0; y < this.canvasHeight; y += this.gridSize) {
        cells.push({ x, y });
      }
    }
    
    return cells;
  }
}

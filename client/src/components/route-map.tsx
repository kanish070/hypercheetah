import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Location, Route } from "@shared/schema";
import { convertToRelativePosition } from "@/lib/maps";

interface RouteMapProps {
  center: Location;
  route?: Route;
  className?: string;
}

export function RouteMap({ center, route, className = "" }: RouteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the map and route on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up the canvas
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    // Draw the map background (simplified for prototype)
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    // Draw the route if available
    if (route) {
      // Draw the route line
      ctx.strokeStyle = "#3b82f6"; // Blue
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // Start with the first waypoint
      const { x: startX, y: startY } = convertToMapCoordinates(route.start, width, height);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      // Draw lines to all waypoints in order
      route.waypoints.forEach(waypoint => {
        const { x, y } = convertToMapCoordinates(waypoint, width, height);
        ctx.lineTo(x, y);
      });
      
      // End with the destination
      const { x: endX, y: endY } = convertToMapCoordinates(route.end, width, height);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw the start point
      drawMapPoint(ctx, startX, startY, "#22c55e", 8); // Green
      
      // Draw the end point
      drawMapPoint(ctx, endX, endY, "#ef4444", 8); // Red
    } else {
      // If no route, just draw the center point
      const { x, y } = convertToMapCoordinates(center, width, height);
      drawMapPoint(ctx, x, y, "#3b82f6", 8); // Blue
    }
  }, [center, route]);

  // Helper function to convert lat/lng to canvas coordinates
  function convertToMapCoordinates(location: Location, width: number, height: number): { x: number; y: number } {
    const { x: relX, y: relY } = convertToRelativePosition(location);
    
    // Map relative coordinates to canvas
    const x = width / 2 + relX * (width / 200);
    const y = height / 2 + relY * (height / 200);
    
    return { x, y };
  }
  
  // Helper function to draw a point on the map
  function drawMapPoint(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw white border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={300} 
        className="w-full h-full"
      />
    </Card>
  );
}
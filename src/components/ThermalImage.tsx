import React, { useEffect, useState, useRef } from 'react';
import { Image, StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';

type ThermalPayload = {
  w: number;
  h: number;
  data: number[];
  pixelData: number[];
  tMin: number;
  tMax: number;
  tAvg: number;
};

type Props = {
  frameUrl: string;
  thermalUrl: string;
  style: ViewStyle;
  overlayOpacity?: number; // Made optional as it has a default value
  refreshInterval?: number; // Made optional as it has a default value
  interpolationFactor?: number; // Made optional as it has a default value
};

function normalise(v: number, min: number, max: number): number {
  const t = (v - min) / (max - min + 1e-6);
  return Math.min(1, Math.max(0, t));
}

function mapColour(t: number): string {
  const r = Math.round(255 * Math.pow(t, 1.5));
  const g = Math.round(255 * Math.pow(t, 0.5) * (1 - t * 0.3));
  const b = Math.round(255 * (1 - Math.pow(t, 2)));
  return `rgb(${r},${g},${b})`;
}

/** Optimized interpolation - only calculate what we need */
function interpolateData(data: number[], sourceW: number, sourceH: number, targetW: number, targetH: number): number[] {
  const interpolated = new Array(targetW * targetH);

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = (x / targetW) * sourceW;
      const srcY = (y / targetH) * sourceH;

      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, sourceW - 1);
      const y2 = Math.min(y1 + 1, sourceH - 1);

      const wx = srcX - x1;
      const wy = srcY - y1;

      // Use the nullish coalescing operator (??) or check if the value exists instead of * 0
      const v11 = data[y1 * sourceW + x1] ?? 0;
      const v12 = data[y1 * sourceW + x2] ?? 0;
      const v21 = data[y2 * sourceW + x1] ?? 0;
      const v22 = data[y2 * sourceW + x2] ?? 0;

      const interpolatedValue =
        v11 * (1 - wx) * (1 - wy) +
        v12 * wx * (1 - wy) +
        v21 * (1 - wx) * wy +
        v22 * wx * wy;

      interpolated[y * targetW + x] = interpolatedValue;
    }
  }

  return interpolated;
}

/** Simple smoothing filter */
function smoothData(data: number[], w: number, h: number): number[] {
  const smoothed = new Array(data.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const value = data[ny * w + nx];
            if (Number.isFinite(value)) {
              sum += value;
              count++;
            }
          }
        }
      }

      // Check for count > 0 before dividing. If count is 0, use the original value or 0.
      smoothed[y * w + x] = count > 0 ? (sum / count) : data[y * w + x];
    }
  }

  return smoothed;
}

export function ThermalImage({
  frameUrl,
  thermalUrl,
  style,
  overlayOpacity = 0.6,
  refreshInterval = 1000,
  interpolationFactor = 2, // Reduced from 3 to 2 for performance
}: Props) {
  const [payload, setPayload] = useState<ThermalPayload | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchThermalData = async () => {
    try {
      const response = await fetch(thermalUrl + `?t=${Date.now()}`); // Added '?' for query param
      const json = await response.json() as ThermalPayload; // Type assertion for safety
      setPayload(json);
    } catch (e) {
      console.error('Thermal payload error', e);
    }
  };

  useEffect(() => {
    fetchThermalData();

    if (refreshInterval > 0) {
      // Cast the result of setInterval to number for type compatibility
      intervalRef.current = setInterval(fetchThermalData, refreshInterval) as unknown as number;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [thermalUrl, refreshInterval]);

  // Use optional chaining and nullish coalescing to safely access properties
  const dataArray = payload?.data ?? payload?.pixelData;
  const sourceW = payload?.w ?? 0;
  const sourceH = payload?.h ?? 0;

  /** Process data with interpolation */
  let processedData: number[] = [];
  let displayW = sourceW;
  let displayH = sourceH;

  if (Array.isArray(dataArray) && sourceW > 0 && sourceH > 0) {
    /** First smooth the data */
    const smoothedData = smoothData(dataArray, sourceW, sourceH);

    /** Then interpolate if needed */
    if (interpolationFactor > 1) {
      displayW = Math.round(sourceW * interpolationFactor);
      displayH = Math.round(sourceH * interpolationFactor);
      processedData = interpolateData(smoothedData, sourceW, sourceH, displayW, displayH);
    } else {
      processedData = smoothedData;
    }
  }

  let tMin = Infinity;
  let tMax = -Infinity;
  let hottestIndex = -1;

  // Check processedData length
  if (processedData.length > 0) {
    const margin = Math.round(3 * interpolationFactor);

    let sum = 0;
    let count = 0;

    /** Compute average temperature */
    for (let i = 0; i < processedData.length; i++) {
      const v = processedData[i];
      if (Number.isFinite(v)) {
        sum += v;
        count++;
      }
    }

    // Safely compute avg
    const avg = count > 0 ? sum / count : 0;
    // const threshold = avg + 5; // Unused, commented out

    tMin = Infinity;
    tMax = -Infinity;
    hottestIndex = -1;

    /** Find min, max, and hottest point in interpolated data */
    for (let y = margin; y < displayH - margin; y++) {
      for (let x = margin; x < displayW - margin; x++) {
        const i = y * displayW + x;
        const v = processedData[i];
        if (!Number.isFinite(v)) continue;
        if (v < tMin) tMin = v;
        if (v > tMax) {
          tMax = v;
          hottestIndex = i;
        }
      }
    }
  }

  // Use ternary operator for conditional assignment
  const hottestX = hottestIndex >= 0 ? hottestIndex % displayW : -1;
  const hottestY = hottestIndex >= 0 ? Math.floor(hottestIndex / displayW) : -1;

  /** Performance optimization - render larger blocks instead of individual pixels */
  const renderThermalOverlay = () => {
    if (processedData.length === 0) return null;

    const pixelSkip = Math.max(1, Math.floor(interpolationFactor * 2));
    const elements = [];

    /** Render in blocks to reduce the number of SVG elements */
    for (let y = 0; y < displayH; y += pixelSkip) {
      for (let x = 0; x < displayW; x += pixelSkip) {
        const i = y * displayW + x;
        if (i >= processedData.length) continue;

        const v = processedData[i];
        const t = normalise(v, tMin, tMax);
        const color = mapColour(t);

        elements.push(
          <Rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={pixelSkip}
            height={pixelSkip}
            fill={color}
            opacity={overlayOpacity}
          />
        );
      }
    }

    return elements;
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: frameUrl }}
        style={[StyleSheet.absoluteFill, styles.image]}
        resizeMode="contain"
      />

      {processedData.length > 0 && (
        <Svg
          style={[StyleSheet.absoluteFill, styles.overlay]}
          viewBox={`0 0 ${displayW} ${displayH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {renderThermalOverlay()}

          {hottestIndex >= 0 && (
            <>
              <Line
                x1={hottestX - 2}
                y1={hottestY}
                x2={hottestX + 2}
                y2={hottestY}
                stroke="white"
                strokeWidth={0.5}
              />
              <Line
                x1={hottestX}
                y1={hottestY - 2}
                x2={hottestX}
                y2={hottestY + 2}
                stroke="white"
                strokeWidth={0.5}
              />
            </>
          )}
        </Svg>
      )}

      {hottestIndex >= 0 && (
        <Text style={[styles.tempLabel]}>
          {tMax.toFixed(1)}°C
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  tempLabel: {
    position: 'absolute',
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  } as TextStyle, // Cast to TextStyle for better type safety if needed
});

export default ThermalImage;
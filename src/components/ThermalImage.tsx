import React, { useEffect, useState, useRef } from 'react';
import { Image, StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';

type ThermalPayload = {
  w: number;
  h: number;
  data?: number[];
  pixelData?: number[];
  tMin: number;
  tMax: number;
  tAvg: number;
};

type Props = {
  frameUrl: string;
  thermalUrl?: string;
  thermalData?: ThermalPayload | null;
  style?: ViewStyle;
  overlayOpacity?: number;
  refreshInterval?: number;
  interpolationFactor?: number;
};

function normalise(v: number, min: number, max: number): number {
  const t = (v - min) / (max - min + 1e-6);
  return Math.min(1, Math.max(0, t));
}

function mapColour(t: number) {
  const r = Math.round(255 * Math.min(1, Math.max(0, 1.7 * t)));
  const g = Math.round(255 * Math.min(1, Math.max(0, t * t)));
  const b = Math.round(255 * Math.min(1, Math.max(0, (1 - t) * (1 - t))));
  return `rgb(${r},${g},${b})`;
}

function interpolateData(data: number[], sourceW: number, sourceH: number, targetW: number, targetH: number): number[] {
  const interpolated = new Array(targetW * targetH);
  const xRatio = (sourceW - 1) / (targetW - 1);
  const yRatio = (sourceH - 1) / (targetH - 1);

  for (let y = 0; y < targetH; y++) {
    const srcY = y * yRatio;
    const y1 = Math.floor(srcY);
    const y2 = Math.min(y1 + 1, sourceH - 1);
    const wy = srcY - y1;

    for (let x = 0; x < targetW; x++) {
      const srcX = x * xRatio;
      const x1 = Math.floor(srcX);
      const x2 = Math.min(x1 + 1, sourceW - 1);
      const wx = srcX - x1;

      const v11 = data[y1 * sourceW + x1] ?? 0;
      const v12 = data[y1 * sourceW + x2] ?? 0;
      const v21 = data[y2 * sourceW + x1] ?? 0;
      const v22 = data[y2 * sourceW + x2] ?? 0;

      interpolated[y * targetW + x] =
        v11 * (1 - wx) * (1 - wy) +
        v12 * wx * (1 - wy) +
        v21 * (1 - wx) * wy +
        v22 * wx * wy;
    }
  }
  return interpolated;
}

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
      smoothed[y * w + x] = count > 0 ? sum / count : data[y * w + x];
    }
  }
  return smoothed;
}

export function ThermalImage({
  frameUrl,
  thermalUrl,
  thermalData,
  style,
  overlayOpacity = .7,
  refreshInterval = 1000,
  interpolationFactor = 2, //change to change the pixel view

}: Props) {
  const [payload, setPayload] = useState<ThermalPayload | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (thermalData) setPayload(thermalData);
  }, [thermalData]);

  useEffect(() => {
    if (thermalData || !thermalUrl) return;

    const fetchThermalData = async () => {
      try {
        const response = await fetch(thermalUrl + `?t=${Date.now()}`);
        const json = await response.json() as ThermalPayload;
        setPayload(json);
      } catch { }
    };

    fetchThermalData();
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchThermalData, refreshInterval) as unknown as number;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [thermalUrl, refreshInterval, thermalData]);

  const dataArray = payload?.data ?? payload?.pixelData;
  const sourceW = payload?.w ?? 32;
  const sourceH = payload?.h ?? 24;

  let processedData: number[] = [];
  let displayW = sourceW;
  let displayH = sourceH;

  if (Array.isArray(dataArray) && sourceW > 0 && sourceH > 0) {
    const smoothed = smoothData(dataArray, sourceW, sourceH);
    if (interpolationFactor > 1) {
      displayW = Math.round(sourceW * interpolationFactor);
      displayH = Math.round(sourceH * interpolationFactor);
      processedData = interpolateData(smoothed, sourceW, sourceH, displayW, displayH);
    } else processedData = smoothed;
  }

  let tMin = Infinity;
  let tMax = -Infinity;
  let hottestIndex = -1;

  if (processedData.length > 0) {
    const margin = Math.round(3 * interpolationFactor);
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

  const hottestX = hottestIndex >= 0 ? hottestIndex % displayW : -1;
  const hottestY = hottestIndex >= 0 ? Math.floor(hottestIndex / displayW) : -1;

  const renderThermalOverlay = () => {
    if (!processedData.length) return null;
    const pixelSkip = 1;
    const elements = [];
    for (let y = 0; y < displayH; y += pixelSkip) {
      for (let x = 0; x < displayW; x += pixelSkip) {
        const i = y * displayW + x;
        if (i >= processedData.length) continue;
        const v = processedData[i];
        const t = normalise(v, tMin, tMax);
        elements.push(
          <Rect key={`${x}-${y}`} x={x} y={y} width={pixelSkip} height={pixelSkip} fill={mapColour(t)} opacity={overlayOpacity} />
        );
      }
    }
    return elements;
  };

  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri: frameUrl }} style={[StyleSheet.absoluteFill, styles.image]} resizeMode="contain" />
      {processedData.length > 0 && (
        <Svg style={[StyleSheet.absoluteFill, styles.overlay]} viewBox={`0 0 ${displayW} ${displayH}`} preserveAspectRatio="none">
          {renderThermalOverlay()}
          {hottestIndex >= 0 && (
            <>
              <Line x1={hottestX - 2} y1={hottestY} x2={hottestX + 2} y2={hottestY} stroke="white" strokeWidth={0.5} />
              <Line x1={hottestX} y1={hottestY - 2} x2={hottestX} y2={hottestY + 2} stroke="white" strokeWidth={0.5} />
            </>
          )}
        </Svg>
      )}
      {hottestIndex >= 0 && <Text style={styles.tempLabel}>{tMax.toFixed(1)}°C</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  image: { width: '100%', height: '100%' },
  overlay: { width: '100%', height: '100%' },
  tempLabel: { position: 'absolute', color: 'white', fontSize: 14, fontWeight: 'bold', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 } as TextStyle,
});

export default ThermalImage;

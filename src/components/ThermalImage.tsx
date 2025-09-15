import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Rect } from "react-native-svg";

type ThermalPayload = {
  w: number;
  h: number;
  data?: number[];
  pixelData?: number[];
  tMin?: number;
  tMax?: number;
  tAvg?: number;
};

type Props = {
  frameUrl: string;
  thermalUrl: string;
  style?: ViewStyle;
  overlayOpacity?: number;
};

function normalise(v: number, min: number, max: number) {
  const t = (v - min) / (max - min + 1e-6);
  return Math.min(1, Math.max(0, t));
}

function mapColour(t: number) {
  const r = Math.round(255 * Math.min(1, Math.max(0, 1.7 * t)));
  const g = Math.round(255 * Math.min(1, Math.max(0, t * t)));
  const b = Math.round(255 * Math.min(1, Math.max(0, (1 - t) * (1 - t))));
  return `rgb(${r},${g},${b})`;
}

export function ThermalImage({
  frameUrl,
  thermalUrl,
  style,
  overlayOpacity = 0.5,
}: Props) {
  const [payload, setPayload] = useState<ThermalPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(thermalUrl)
      .then((resp) => resp.json())
      .then((json) => {
        if (!cancelled) setPayload(json);
      })
      .catch((e) => console.error("thermal payload error", e));
    return () => {
      cancelled = true;
    };
  }, [thermalUrl]);

  const dataArray = payload?.data ?? payload?.pixelData;

  let tMin = payload?.tMin ?? Infinity,
    tMax = payload?.tMax ?? -Infinity;

  if (Array.isArray(dataArray)) {
    if (!Number.isFinite(tMin) || !Number.isFinite(tMax)) {
      for (const v of dataArray) {
        if (Number.isFinite(v)) {
          if (v < tMin) tMin = v;
          if (v > tMax) tMax = v;
        }
      }
    }
  }

  return (
    <View style={[styles.container, style]}>
      <Image source={{ uri: frameUrl }} style={StyleSheet.absoluteFill} />
      {Array.isArray(dataArray) && (
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${payload!.w} ${payload!.h}`}
        >
          {dataArray.map((v, i) => {
            const x = i % payload!.w;
            const y = Math.floor(i / payload!.w);
            const t = normalise(v, tMin, tMax);
            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={mapColour(t)}
                opacity={overlayOpacity}
              />
            );
          })}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
});

export default ThermalImage;

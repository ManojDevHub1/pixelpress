export interface Dimensions {
  width: number;
  height: number;
}

export function calculateTargetDimensions(
  inW: number,
  inH: number,
  resize: boolean,
  maxEdge: number
): Dimensions {
  if (!resize || !Number.isFinite(maxEdge) || maxEdge <= 0) {
    return { width: inW, height: inH };
  }

  const currentMax = Math.max(inW, inH);
  if (currentMax <= maxEdge) {
    return { width: inW, height: inH };
  }

  const scale = maxEdge / currentMax;
  const width = Math.max(1, Math.round(inW * scale));
  const height = Math.max(1, Math.round(inH * scale));

  return { width, height };
}

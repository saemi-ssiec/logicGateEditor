import { Line, Path, Text } from "react-konva";
import type { ReactNode } from "react";
import type { GateType } from "../../core/types"; 

/**
 * Gate renderer signature
 */
type GateRenderer = (w: number, h: number) => ReactNode;

/**
 * Visual constants
 */
const GATE_STYLE = {
  fill: "white",
  stroke: "lightgray",
  strokeWidth: 2,
} as const;

const TRI_FILL = "white";
const TRI_STROKE = "lightgray";
const TRI_STROKE_WIDTH = 1.5;
const TEXT_FILL = "gray";

const SHAPE_COMMON_PROPS = {
  strokeScaleEnabled: false, // keep stroke width under scaling
  perfectDrawEnabled: true,
  hitStrokeWidth: 10,
} as const;

/** Anti-aliasing improvement: align strokes to 0.5 grid */
const snap = (v: number) => Math.round(v) + 0.5;

const bubbleRadiusFromSide = (s: number) => Math.max(3, s * 0.06);

/**
 * Make a right-facing equilateral triangle that fits into (w,h)
 */
const makeRightEquilateral = (w: number, h: number, scaleFactor: number) => {
  const SQ3_OVER_2 = Math.sqrt(3) / 2;
  const sFit = Math.min(h, w / SQ3_OVER_2);
  const sWanted = sFit * scaleFactor;
  const s = Math.max(1, Math.min(sWanted, h, w / SQ3_OVER_2));

  const width = s * SQ3_OVER_2;
  const x0 = 0;
  const y0 = (h - s) / 2;
  const tipX = x0 + width;
  const tipY = y0 + s / 2;

  return { s, x0, y0, tipX, tipY, width };
};

/** AND: flat left, semicircle right that exactly fills width */
const renderAndGate: GateRenderer = (w, h) => {
  const r = h / 2;
  const cx = w - r; // center of the right semicircle
  const d = `
    M ${snap(0)} ${snap(0)}
    L ${snap(cx)} ${snap(0)}
    A ${r} ${r} 0 0 1 ${snap(cx)} ${snap(h)}
    L ${snap(0)} ${snap(h)}
    Z
  `.replace(/\s+/g, " ");

  return <Path data={d} {...GATE_STYLE} {...SHAPE_COMMON_PROPS} />;
};

/** NAND: AND + output bubble slightly outside */
const renderNandGate: GateRenderer = (w, h) => {
  const r = h / 2;
  const cx = w - r;
  const body = `
    M ${snap(0)} ${snap(0)}
    L ${snap(cx)} ${snap(0)}
    A ${r} ${r} 0 0 1 ${snap(cx)} ${snap(h)}
    L ${snap(0)} ${snap(h)}
    Z
  `.replace(/\s+/g, " ");

  const br = Math.max(3, h * 0.08);
  const bcX = snap(w + br + 2);
  const bcY = snap(h / 2);
  const bubble = `
    M ${bcX},${bcY}
    m -${br},0
    a ${br},${br} 0 1,0 ${br * 2},0
    a ${br},${br} 0 1,0 -${br * 2},0
  `.replace(/\s+/g, " ");

  return (
    <>
      <Path data={body} {...GATE_STYLE} {...SHAPE_COMMON_PROPS} />
      <Path data={bubble} fill="white" stroke="black" strokeWidth={2} {...SHAPE_COMMON_PROPS} />
    </>
  );
};

/** OR: classic outer bulge + inner (input) concave */
const renderOrGate: GateRenderer = (w, h) => {
  const topY = snap(0);
  const botY = snap(h);
  const midY = snap(h / 2);

  const leftX = snap(w * 0.05);
  const rightX = snap(w - w * 0.15);

  const d = `
    M ${leftX} ${topY}
    C ${snap(w * 0.45)} ${topY}, ${snap(w * 0.85)} ${snap(h * 0.2)}, ${rightX} ${midY}
    C ${snap(w * 0.85)} ${snap(h * 0.8)}, ${snap(w * 0.45)} ${botY}, ${leftX} ${botY}
    C ${snap(w * 0.20)} ${snap(h * 0.85)}, ${snap(w * 0.18)} ${snap(h * 0.15)}, ${leftX} ${topY}
    Z
  `.replace(/\s+/g, " ");

  return <Path data={d} {...GATE_STYLE} {...SHAPE_COMMON_PROPS} />;
};

/** NOR: OR + output bubble */
const renderNorGate: GateRenderer = (w, h) => {
  const body = renderOrGate(w, h) as ReactNode;
  const br = Math.max(3, h * 0.08);
  const bcX = snap(w + br + 2);
  const bcY = snap(h / 2);
  const bubble = `
    M ${bcX},${bcY}
    m -${br},0
    a ${br},${br} 0 1,0 ${br * 2},0
    a ${br},${br} 0 1,0 -${br * 2},0
  `.replace(/\s+/g, " ");

  return (
    <>
      {body}
      <Path data={bubble} fill="white" stroke="black" strokeWidth={2} {...SHAPE_COMMON_PROPS} />
    </>
  );
};

/** NOT: right-pointing equilateral triangle + bubble */
const renderNotGate: GateRenderer = (w, h) => {
  const { s, x0, y0, tipX, tipY } = makeRightEquilateral(w, h, 1.0);

  const tri = `
    M ${snap(x0)} ${snap(y0)}
    L ${snap(tipX)} ${snap(tipY)}
    L ${snap(x0)} ${snap(y0 + s)}
    Z
  `.replace(/\s+/g, " ");

  const r = bubbleRadiusFromSide(s);
  const cx = snap(tipX + r + 2);
  const cy = snap(tipY);
  const circle = `
    M ${cx},${cy}
    m -${r},0
    a ${r},${r} 0 1,0 ${r * 2},0
    a ${r},${r} 0 1,0 -${r * 2},0
  `.replace(/\s+/g, " ");

  return (
    <>
      <Path data={tri} fill={TRI_FILL} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
      <Path data={circle} fill={TRI_FILL} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
    </>
  );
};

/** COMPARATOR: right-pointing triangle with + / - marks */
const renderComparator: GateRenderer = (w, h) => {
  const { s, x0, y0, tipX, tipY } = makeRightEquilateral(w, h, 1.0);

  const tri = `
    M ${snap(x0)} ${snap(y0)}
    L ${snap(tipX)} ${snap(tipY)}
    L ${snap(x0)} ${snap(y0 + s)}
    Z
  `.replace(/\s+/g, " ");

  const insetX = s * 0.14;
  const centerX = x0 + insetX;
  const fontSize = Math.max(14, s * 0.22);
  const plusY = y0 + s * 0.36;
  const minusY = y0 + s * 0.66;

  return (
    <>
      <Path data={tri} fill={TRI_FILL} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
      <Text x={centerX} y={plusY - fontSize * 0.6} text="+" fontSize={fontSize} fill={TEXT_FILL} />
      <Text x={centerX} y={minusY - fontSize * 0.6} text="-" fontSize={fontSize} fill={TEXT_FILL} />
    </>
  );
};

/** RISING: triangle with rising-edge symbol */
const renderRising: GateRenderer = (w, h) => {
  const { s, x0, y0, tipX, tipY } = makeRightEquilateral(w, h, 1.0);

  const tri = `
    M ${snap(x0)} ${snap(y0)}
    L ${snap(tipX)} ${snap(tipY)}
    L ${snap(x0)} ${snap(y0 + s)}
    Z
  `.replace(/\s+/g, " ");

  const insertX = s * 0.18;
  const marginY = s * 0.25;
  const armLen = s * 0.1;
  const lineX = x0 + insertX;
  const yTop = y0 + marginY;
  const yBot = y0 + s - marginY;
  const innerStrokeWidth = TRI_STROKE_WIDTH * 1.2;

  return (
    <>
      <Path data={tri} fill={TRI_FILL} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
      <Line points={[lineX, yBot, lineX, yTop]} stroke={TRI_STROKE} strokeWidth={innerStrokeWidth} {...SHAPE_COMMON_PROPS} />
      <Line points={[lineX, yTop, lineX + armLen, yTop]} stroke={TRI_STROKE} strokeWidth={innerStrokeWidth} {...SHAPE_COMMON_PROPS} />
      <Line points={[lineX, yBot, lineX - armLen, yBot]} stroke={TRI_STROKE} strokeWidth={innerStrokeWidth} {...SHAPE_COMMON_PROPS} />
    </>
  );
};

/** FALLING: triangle with falling-edge symbol */
const renderFalling: GateRenderer = (w, h) => {
  const { s, x0, y0, tipX, tipY } = makeRightEquilateral(w, h, 1.0);

  const tri = `
    M ${snap(x0)} ${snap(y0)}
    L ${snap(tipX)} ${snap(tipY)}
    L ${snap(x0)} ${snap(y0 + s)}
    Z
  `.replace(/\s+/g, " ");

  const insertX = s * 0.18;
  const marginY = s * 0.25;
  const armLen = s * 0.1;
  const lineX = x0 + insertX;
  const yTop = y0 + marginY;
  const yBot = y0 + s - marginY;
  const innerStrokeWidth = TRI_STROKE_WIDTH * 1.2;

  return (
    <>
      <Path data={tri} fill={TRI_FILL} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
      <Line points={[lineX, yBot, lineX, yTop]} stroke={TRI_STROKE} strokeWidth={innerStrokeWidth} {...SHAPE_COMMON_PROPS} />
      <Line points={[lineX, yTop, lineX - armLen, yTop]} stroke={TRI_STROKE} strokeWidth={innerStrokeWidth} {...SHAPE_COMMON_PROPS} />
      <Line points={[lineX, yBot, lineX + armLen, yBot]} stroke={TRI_STROKE} strokeWidth={innerStrokeWidth} {...SHAPE_COMMON_PROPS} />
    </>
  );
};

/** TIMER: square with diagonal and labels */
const timerShape = (w: number, h: number, seconds: number) => {
  const s = Math.min(w, h);
  const offsetX = (w - s) / 2;
  const offsetY = (h - s) / 2;

  const pad = Math.max(4, s * 0.08);
  const fontSize = Math.max(12, s * 0.22);

  const rect = `
    M ${snap(offsetX)} ${snap(offsetY)}
    L ${snap(offsetX + s)} ${snap(offsetY)}
    L ${snap(offsetX + s)} ${snap(offsetY + s)}
    L ${snap(offsetX)} ${snap(offsetY + s)}
    Z
  `.replace(/\s+/g, " ");

  const diag = `
    M ${snap(offsetX + pad)} ${snap(offsetY + s - pad)}
    L ${snap(offsetX + s - pad)} ${snap(offsetY + pad)}
  `.replace(/\s+/g, " ");

  return (
    <>
      <Path data={rect} fill={TRI_FILL} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
      <Path data={diag} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
      <Text x={offsetX + pad} y={offsetY + pad} text={`${seconds} sec`} fontSize={fontSize} fill={TEXT_FILL} />
      <Text x={offsetX + pad} y={offsetY + s - pad - fontSize} width={s - pad * 2} align="right" text="0" fontSize={fontSize} fill={TEXT_FILL} />
    </>
  );
};

const renderTimer: GateRenderer = (w, h) => timerShape(w, h, 5);

/** LABEL */
const renderLabel: GateRenderer = (w, h) => {
  const s = Math.min(w, h);
  const pad = Math.min(4, s * 0.12);
  const x = pad;
  const y = (h - (h - pad * 2)) / 2;
  const width = w - pad * 2;
  const height = h - pad * 2;
  const r = Math.min(pad * 0.6, Math.min(width, height) * 0.15);
  const fontSize = Math.max(12, s * 0.28);

  const rectPath = `
    M ${snap(x + r)} ${snap(y)}
    L ${snap(x + width - r)} ${snap(y)}
    Q ${snap(x + width)} ${snap(y)} ${snap(x + width)} ${snap(y + r)}
    L ${snap(x + width)} ${snap(y + height - r)}
    Q ${snap(x + width)} ${snap(y + height)} ${snap(x + width - r)} ${snap(y + height)}
    L ${snap(x + r)} ${snap(y + height)}
    Q ${snap(x)} ${snap(y + height)} ${snap(x)} ${snap(y + height - r)}
    L ${snap(x)} ${snap(y + r)}
    Q ${snap(x)} ${snap(y)} ${snap(x + r)} ${snap(y)}
    Z
  `.replace(/\s+/g, " ");

  return (
    <>
      <Path data={rectPath} {...GATE_STYLE} {...SHAPE_COMMON_PROPS} />
      <Text x={x} y={y + (height - fontSize) / 2} width={width} align="center" fontSize={fontSize} fill={TEXT_FILL} />
    </>
  );
};

/** SWITCH: rectangle with lever */
const renderSwitch: GateRenderer = (w, h) => {
  const d = `
    M ${snap(0)} ${snap(0)}
    L ${snap(w)} ${snap(0)}
    L ${snap(w)} ${snap(h)}
    L ${snap(0)} ${snap(h)}
    Z
  `.replace(/\s+/g, " ");

  const leverBaseX = w * 0.2;
  const leverBaseY = h * 0.5;
  const leverTipX  = w * 0.5;
  const leverTipY  = h * 0.3;

  return (
    <>
      <Path data={d} {...GATE_STYLE} {...SHAPE_COMMON_PROPS} />
      <Line points={[leverBaseX, leverBaseY, leverTipX, leverTipY]} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
      <Line points={[w * 0.5, h * 0.5, w * 0.8, h * 0.5]} stroke={TRI_STROKE} strokeWidth={TRI_STROKE_WIDTH} {...SHAPE_COMMON_PROPS} />
      <Path
        data={`M ${snap(leverTipX + 3)} ${snap(leverBaseY)} m -3,0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0`}
        fill={TRI_FILL}
        stroke={TRI_STROKE}
        strokeWidth={TRI_STROKE_WIDTH}
        {...SHAPE_COMMON_PROPS}
      />
    </>
  );
};


/** Make custom label gate renderer */
export const makeLabelGate = (text: string, options: { rounded?: boolean; paddingScale?: number } = {}): GateRenderer => {
  const { rounded = true, paddingScale = 0.12 } = options;
  return (w, h) => {
    const s = Math.min(w, h);
    const pad = Math.max(4, s * paddingScale);
    const x = pad;
    const width = w - pad * 2;
    const height = h - pad * 2;
    const y = (h - height) / 2;
    const r = rounded ? Math.min(pad * 0.6, Math.min(width, height) * 0.15) : 0;
    const fontSize = Math.max(12, s * 0.28);

    const rectPath = r > 0
      ? `M ${snap(x + r)} ${snap(y)}
         L ${snap(x + width - r)} ${snap(y)}
         Q ${snap(x + width)} ${snap(y)} ${snap(x + width)} ${snap(y + r)}
         L ${snap(x + width)} ${snap(y + height - r)}
         Q ${snap(x + width)} ${snap(y + height)} ${snap(x + width - r)} ${snap(y + height)}
         L ${snap(x + r)} ${snap(y + height)}
         Q ${snap(x)} ${snap(y + height)} ${snap(x)} ${snap(y + height - r)}
         L ${snap(x)} ${snap(y + r)}
         Q ${snap(x)} ${snap(y)} ${snap(x + r)} ${snap(y)}
         Z`.replace(/\s+/g, " ")
      : `M ${snap(x)} ${snap(y)} L ${snap(x + width)} ${snap(y)} L ${snap(x + width)} ${snap(y + height)} L ${snap(x)} ${snap(y + height)} Z`;

    return (
      <>
        <Path data={rectPath} {...GATE_STYLE} {...SHAPE_COMMON_PROPS} />
        <Text x={x} y={y + (height - fontSize) / 2} width={width} text={text} align="center" fontSize={fontSize} fill={TEXT_FILL} />
      </>
    );
  };
};

/** Exported map */
export const gateShapeMap: Record<GateType, GateRenderer> = {
  AND: renderAndGate,
  OR: renderOrGate,
  NOT: renderNotGate,
  NAND: renderNandGate,
  NOR: renderNorGate,
  COMPARATOR: renderComparator,
  RISING: renderRising,
  FALLING: renderFalling,
  TIMER: renderTimer,
  LABEL: renderLabel,
  SWITCH: renderSwitch,
};

/** Optional helper to fetch a renderer by type */
export const getGateRenderer = (type: GateType): GateRenderer => gateShapeMap[type];

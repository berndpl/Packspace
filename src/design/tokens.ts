export type ThemeId = 'blueprint' | 'paper' | 'terminal';
export type TypographyId = 'mono' | 'sans' | 'serif';

export interface ScenePalette {
  canvas: string;
  canvasDeep: string;
  gridMinor: string;
  gridMajor: string;
  accent: string;
  textStrong: string;
  space: string;
  human: string;
  structure: string;
  structureMuted: string;
  trainSeat: string;
  planeSeat: string;
  seatTrim: string;
  window: string;
  floor: string;
  aisle: string;
  pass: string;
  caution: string;
  fail: string;
}

interface UiPalette {
  canvas: string;
  canvasDeep: string;
  surface: string;
  surfaceSolid: string;
  surfaceActive: string;
  lineSubtle: string;
  line: string;
  lineStrong: string;
  textStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  pass: string;
  caution: string;
  fail: string;
  selection: string;
}

export interface PackspaceTheme {
  id: ThemeId;
  label: string;
  appearance: 'dark' | 'light';
  ui: UiPalette;
  scene: ScenePalette;
}

export interface TypographyOption {
  id: TypographyId;
  label: string;
  sample: string;
  fontFamily: string;
}

export const PACKSPACE_THEMES: readonly PackspaceTheme[] = [
  {
    id: 'blueprint',
    label: 'Blueprint',
    appearance: 'dark',
    ui: {
      canvas: '#081522',
      canvasDeep: '#050c13',
      surface: 'rgb(8 21 34 / 94%)',
      surfaceSolid: '#0b1926',
      surfaceActive: '#143247',
      lineSubtle: '#173548',
      line: '#285269',
      lineStrong: '#3f7894',
      textStrong: '#d8f3ff',
      text: '#acd3e3',
      textMuted: '#789fb2',
      textSubtle: '#5f8396',
      accent: '#5ad2ff',
      pass: '#67dba8',
      caution: '#f6bd5a',
      fail: '#ff7d73',
      selection: 'rgb(90 210 255 / 28%)',
    },
    scene: {
      canvas: '#081522',
      canvasDeep: '#050c13',
      gridMinor: '#17384a',
      gridMajor: '#2a6079',
      accent: '#5ad2ff',
      textStrong: '#d8f3ff',
      space: '#789aae',
      human: '#31576b',
      structure: '#426176',
      structureMuted: '#203746',
      trainSeat: '#2f6b86',
      planeSeat: '#455f75',
      seatTrim: '#7696a8',
      window: '#75d5f5',
      floor: '#101f2b',
      aisle: '#1b3240',
      pass: '#67dba8',
      caution: '#f6bd5a',
      fail: '#ff7d73',
    },
  },
  {
    id: 'paper',
    label: 'Paper',
    appearance: 'light',
    ui: {
      canvas: '#ece8df',
      canvasDeep: '#ded8cc',
      surface: 'rgb(249 247 241 / 95%)',
      surfaceSolid: '#f2eee5',
      surfaceActive: '#d7e7ed',
      lineSubtle: '#d6cfc1',
      line: '#aab4b6',
      lineStrong: '#6f8992',
      textStrong: '#172d35',
      text: '#344b53',
      textMuted: '#647980',
      textSubtle: '#829298',
      accent: '#167493',
      pass: '#287b59',
      caution: '#9a6518',
      fail: '#b4473e',
      selection: 'rgb(22 116 147 / 20%)',
    },
    scene: {
      canvas: '#ece8df',
      canvasDeep: '#ded8cc',
      gridMinor: '#cfc7b8',
      gridMajor: '#aaa28f',
      accent: '#167493',
      textStrong: '#172d35',
      space: '#637f88',
      human: '#857c6e',
      structure: '#85949a',
      structureMuted: '#c4c1b7',
      trainSeat: '#3f788e',
      planeSeat: '#6c7d86',
      seatTrim: '#4e626a',
      window: '#65b5ca',
      floor: '#c9c2b5',
      aisle: '#b4ada0',
      pass: '#287b59',
      caution: '#9a6518',
      fail: '#b4473e',
    },
  },
  {
    id: 'terminal',
    label: 'Terminal',
    appearance: 'dark',
    ui: {
      canvas: '#04110b',
      canvasDeep: '#020805',
      surface: 'rgb(4 17 11 / 95%)',
      surfaceSolid: '#071b11',
      surfaceActive: '#123a24',
      lineSubtle: '#123420',
      line: '#24643c',
      lineStrong: '#3b9b5f',
      textStrong: '#ddffe7',
      text: '#a9ddb8',
      textMuted: '#73a783',
      textSubtle: '#527a5f',
      accent: '#67ff9d',
      pass: '#67ff9d',
      caution: '#ffd166',
      fail: '#ff7384',
      selection: 'rgb(103 255 157 / 24%)',
    },
    scene: {
      canvas: '#04110b',
      canvasDeep: '#020805',
      gridMinor: '#12351f',
      gridMajor: '#246a3e',
      accent: '#67ff9d',
      textStrong: '#ddffe7',
      space: '#67a87b',
      human: '#315d40',
      structure: '#386047',
      structureMuted: '#142c1e',
      trainSeat: '#246d46',
      planeSeat: '#3a5d48',
      seatTrim: '#70a07f',
      window: '#8affb2',
      floor: '#07190f',
      aisle: '#0d2818',
      pass: '#67ff9d',
      caution: '#ffd166',
      fail: '#ff7384',
    },
  },
] as const;

export const TYPOGRAPHY_OPTIONS: readonly TypographyOption[] = [
  {
    id: 'mono',
    label: 'Mono',
    sample: 'M',
    fontFamily:
      "ui-monospace, 'SFMono-Regular', 'Cascadia Mono', 'Roboto Mono', Consolas, 'Liberation Mono', monospace",
  },
  {
    id: 'sans',
    label: 'Sans',
    sample: 'S',
    fontFamily:
      "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    id: 'serif',
    label: 'Serif',
    sample: 'R',
    fontFamily:
      "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
  },
] as const;

export const DEFAULT_THEME_ID: ThemeId = 'blueprint';
export const DEFAULT_TYPOGRAPHY_ID: TypographyId = 'mono';
export const SCENE_COLORS = PACKSPACE_THEMES[0].scene;

export function resolveThemeId(value: string | null): ThemeId {
  return PACKSPACE_THEMES.some((theme) => theme.id === value)
    ? (value as ThemeId)
    : DEFAULT_THEME_ID;
}

export function resolveTypographyId(value: string | null): TypographyId {
  return TYPOGRAPHY_OPTIONS.some((typography) => typography.id === value)
    ? (value as TypographyId)
    : DEFAULT_TYPOGRAPHY_ID;
}

export function getTheme(id: ThemeId): PackspaceTheme {
  return PACKSPACE_THEMES.find((theme) => theme.id === id) ?? PACKSPACE_THEMES[0];
}

export function getTypography(id: TypographyId): TypographyOption {
  return (
    TYPOGRAPHY_OPTIONS.find((typography) => typography.id === id) ??
    TYPOGRAPHY_OPTIONS[0]
  );
}

export function themeCssVariables(
  theme: PackspaceTheme,
  typography: TypographyOption,
): Record<`--${string}`, string> {
  return {
    '--canvas': theme.ui.canvas,
    '--canvas-deep': theme.ui.canvasDeep,
    '--surface': theme.ui.surface,
    '--surface-solid': theme.ui.surfaceSolid,
    '--surface-active': theme.ui.surfaceActive,
    '--line-subtle': theme.ui.lineSubtle,
    '--line': theme.ui.line,
    '--line-strong': theme.ui.lineStrong,
    '--text-strong': theme.ui.textStrong,
    '--text': theme.ui.text,
    '--text-muted': theme.ui.textMuted,
    '--text-subtle': theme.ui.textSubtle,
    '--accent': theme.ui.accent,
    '--pass': theme.ui.pass,
    '--caution': theme.ui.caution,
    '--fail': theme.ui.fail,
    '--selection': theme.ui.selection,
    '--app-font': typography.fontFamily,
  };
}

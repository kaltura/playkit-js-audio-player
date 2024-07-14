export interface AudioPlugin {
  displayName: string;
  symbol: {svgUrl: string; viewBox: string};
  open: () => any
}
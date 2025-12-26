export interface PowerBITheme {
  name: string;
  dataColors: string[];
  background?: string;
  foreground?: string;
  tableAccent?: string;
  good?: string;
  neutral?: string;
  bad?: string;
  maximum?: string;
  center?: string;
  minimum?: string;
  null?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: PowerBITheme;
  tags: string[];
}

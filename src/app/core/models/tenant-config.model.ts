export interface TenantConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  textBlocks: {
    welcomeMessage: string;
    aboutUs: string;
    missionStatement: string;
    contactInfo: string;
  };
}

export interface TenantTheme {
  primary: string;
  accent: string;
  warn?: string;
}

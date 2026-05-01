import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gasservice.app',
  appName: '우리동네가스',
  webDir: 'out',
  server: {
    url: 'https://homegascare.vercel.app',
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#FFFFFF',
    scrollEnabled: false,
  },
  backgroundColor: '#FFFFFF',
  android: {
    allowMixedContent: true,
  },
};

export default config;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Environment = 'development' | 'staging' | 'production';

export interface FeatureFlags {
  newUIEnabled: boolean;
  analyticsEnabled: boolean;
  debugLogging: boolean;
  mockAPIResponses: boolean;
  maintenanceMode: boolean;
  experimentalFeatures: boolean;
}

interface DevState {
  environment: Environment;
  featureFlags: FeatureFlags;
  setEnvironment: (env: Environment) => void;
  toggleFeatureFlag: (flag: keyof FeatureFlags) => void;
  resetFeatureFlags: () => void;
}

const defaultFeatureFlags: FeatureFlags = {
  newUIEnabled: false,
  analyticsEnabled: true,
  debugLogging: true,
  mockAPIResponses: false,
  maintenanceMode: false,
  experimentalFeatures: false,
};

export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      environment: 'development',
      featureFlags: defaultFeatureFlags,
      setEnvironment: (env) => set({ environment: env }),
      toggleFeatureFlag: (flag) =>
        set((state) => ({
          featureFlags: {
            ...state.featureFlags,
            [flag]: !state.featureFlags[flag],
          },
        })),
      resetFeatureFlags: () => set({ featureFlags: defaultFeatureFlags }),
    }),
    {
      name: 'vivacity-dev-storage',
    }
  )
);

// Helper hook to get API URL based on environment
export function useAPIUrl() {
  const environment = useDevStore((state) => state.environment);

  const urls = {
    development: 'http://localhost:3000/api',
    staging: 'https://staging-api.vivacitydigitalapps.com',
    production: 'https://api.vivacitydigitalapps.com',
  };

  return urls[environment];
}

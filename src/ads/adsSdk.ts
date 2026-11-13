/**
 * The ads SDK, or null when this build of the app does not have its native part (a build made
 * before the package was added, say). It is loaded here, while the app starts, and not later: an
 * error in a module that is loaded while the app runs is reported as fatal, one that happens as
 * the app starts can be caught, which is what makes "no ads in this build" possible.
 */
import type * as AdsModule from 'react-native-google-mobile-ads';

export type AdsSdk = typeof AdsModule;

let sdk: AdsSdk | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  sdk = require('react-native-google-mobile-ads') as AdsSdk;
} catch {
  sdk = null;
}

export const getSdk = (): AdsSdk | null => sdk;

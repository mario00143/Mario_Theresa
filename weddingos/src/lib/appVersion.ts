/** App version metadata injected at build time by Vite (see vite.config.ts `define`). */
export const APP_VERSION = __APP_VERSION__;
export const BUILD_TIMESTAMP = __BUILD_TIMESTAMP__;
export const GIT_SHA = __GIT_SHA__;

/** Bumped whenever the shape of `OfflineSnapshot` (src/data/offline/offlineSnapshot.ts) changes. */
export const OFFLINE_SNAPSHOT_SCHEMA_VERSION = 1;

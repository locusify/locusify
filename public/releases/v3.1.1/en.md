# v3.1.1

> 2026-03-14

## Features

### Social Presence
- Real-time nearby explorer markers on the map with clustering support
- Hover cards showing user status, distance, and last seen time
- Presence settings for visibility control (visible / invisible / friends only)
- Custom status text support

### Video Recording
- WebM to MP4 conversion with progress UI for video recording export
- Fixed video recording aspect ratio via Chrome Region Capture API

### Feedback Dialog
- New feedback dialog with star rating system
- Full i18n support for feedback UI (English & Chinese)

## Bug Fixes

- Fixed circular dependency between authStore and presenceStore
- Separated geolocation effect from presence reporting for proper auth reactivity
- Removed unnecessary nullish coalescing on geolocation accuracy field
- Removed unused `updated_at` field from presence settings to match backend schema

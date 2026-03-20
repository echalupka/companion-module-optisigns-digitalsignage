# companion-module-optisigns

Bitfocus Companion module for controlling [OptiSigns](https://www.optisigns.com) digital signage screens.

## Features

- Assign playlists to screens
- Assign individual assets/files to screens
- Add or remove assets from playlists
- Set per-asset duration within a playlist
- Feedbacks for current screen content (playlist or asset)
- Variables for current content type and name per screen

## Setup

1. Log in to [app.optisigns.com](https://app.optisigns.com)
2. Go to **Settings → API Keys** and generate a new key with read/write permissions
3. In Companion, add a new connection and search for **OptiSigns**
4. Paste your API key into the configuration

## Actions

| Action | Description |
|--------|-------------|
| Assign Playlist to Screen | Switch a screen to display a playlist |
| Assign Asset/File to Screen | Switch a screen to display a single asset |
| Add Asset to Playlist | Insert an asset into a playlist at a specified position |
| Remove Asset from Playlist | Remove an asset from a playlist by name |
| Set Asset Duration in Playlist | Change how long an asset displays within a playlist |

## Feedbacks

| Feedback | Description |
|----------|-------------|
| Screen is Showing Playlist | Active when a screen is displaying a specific playlist |
| Screen is Showing Asset/File | Active when a screen is displaying a specific asset |

## Variables

| Variable | Description |
|----------|-------------|
| `$(optisigns:device_count)` | Number of paired screens |
| `$(optisigns:playlist_count)` | Number of playlists |
| `$(optisigns:asset_count)` | Number of assets |
| `$(optisigns:screen_<name>_content_type)` | Current content type for a screen |
| `$(optisigns:screen_<name>_content_name)` | Current content name for a screen |

Screen name keys are lower-cased with spaces and special characters replaced by underscores (e.g. "Lobby Display" → `lobby_display`).

## Configuration

| Field | Description |
|-------|-------------|
| API Key | Your OptiSigns API key |
| Poll Interval (seconds) | How often to refresh data from OptiSigns (0 = disabled, default 300) |

## License

MIT

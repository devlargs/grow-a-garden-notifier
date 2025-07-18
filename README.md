# Grow a Garden Stock Notifications Chrome Extension

A Chrome extension that monitors stock levels for Grow a Garden (Roblox) and sends desktop notifications when selected items are restocked.

## Features

- **Real-time Stock Monitoring**: Continuously monitors seeds, gears, and eggs stock levels
- **Background Notifications**: Sends desktop notifications even when the popup is closed
- **Customizable Alerts**: Select which items you want to be notified about
- **Automatic Updates**: Checks for updates every 5 minutes (seeds/gears) and 30 minutes (eggs)

## Installation

1. **Build the Extension**:

   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**:

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Grant Permissions**:
   - The extension will request permissions for notifications and storage
   - Click "Allow" when prompted

## Usage

1. **Open the Extension**: Click the extension icon in your Chrome toolbar
2. **Select Items**: Click "Send Notification" to open the modal
3. **Choose Items**: Select which seeds, gears, and eggs you want notifications for
4. **Save Settings**: Your selections are automatically saved
5. **Receive Notifications**: You'll get desktop notifications when selected items restock

## How It Works

- **Background Script**: Runs continuously to monitor stock levels
- **Storage**: Uses Chrome's storage API to save your notification preferences
- **API Integration**: Fetches data from the Grow a Garden API
- **Smart Detection**: Compares current stock with previous levels to detect restocks

## Permissions

- `notifications`: Send desktop notifications
- `storage`: Save notification preferences
- `alarms`: Schedule periodic stock checks
- `host_permissions`: Access the Grow a Garden API

## Development

- Built with React + TypeScript
- Uses Vite for building
- Tailwind CSS for styling
- Chrome Extension Manifest V3

## Troubleshooting

- **No notifications**: Check that notifications are enabled in Chrome settings
- **Extension not working**: Try reloading the extension in `chrome://extensions/`
- **API errors**: The extension will retry automatically on the next check cycle

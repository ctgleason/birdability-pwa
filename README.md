# Birdability PWA - Accessible Birding Site Questionnaire

A Progressive Web App for collecting accessibility information about birding sites for Birdability.org's accessible birding map.

## Features

- ✅ Multi-section questionnaire with 18 sections
- ✅ Auto-save functionality (saves to localStorage every 30 seconds)
- ✅ Progress tracking
- ✅ Photo attachment support (stores references/metadata)
- ✅ Offline capability (PWA)
- ✅ Mobile-friendly responsive design
- ✅ JSON export with download and copy options
- ✅ Keyboard navigation support (Ctrl+Arrow keys)
- ✅ Accessibility features

## Installation

### Option 1: Local Development Server

1. **Extract or clone the files to a directory**

2. **Generate the icons:**
   - Open `generate-icons.html` in a web browser
   - Click "Download 192x192" and "Download 512x512"
   - Save both files to the project root directory

3. **Start a local web server:**

   **Using Python 3:**
   ```bash
   cd /tmp/birdability-pwa
   python3 -m http.server 8000
   ```

   **Using Node.js (http-server):**
   ```bash
   npx http-server /tmp/birdability-pwa -p 8000
   ```

   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

4. **Open in browser:**
   Navigate to `http://localhost:8000`

5. **Install as PWA:**
   - In Chrome/Edge: Click the install icon in the address bar
   - In Safari (iOS): Tap Share → Add to Home Screen
   - In Firefox: Look for the install prompt

### Option 2: Deploy to Web Server

1. Upload all files to your web server
2. Ensure HTTPS is enabled (required for PWA features)
3. Access via your domain
4. Install as PWA from browser

## Project Structure

```
birdability-pwa/
├── index.html              # Main application HTML
├── styles.css              # Application styles
├── app.js                  # Application logic
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline support
├── generate-icons.html     # Icon generator utility
├── icon-192.png           # App icon (192x192) - Generate this
├── icon-512.png           # App icon (512x512) - Generate this
└── README.md              # This file
```

## Usage

### Filling Out the Questionnaire

1. **Navigate through sections** using Next/Previous buttons
2. **Fill in text fields** for open-ended information
3. **Check boxes** for true/false criteria
4. **Select radio buttons** for yes/no questions
5. **Add photos** in the final section by clicking "Select Photos"

### Data Persistence

- Form data is automatically saved to browser localStorage
- Data persists across browser sessions
- Warning shown before closing if unsaved changes exist

### Exporting Data

1. Complete all sections
2. Click "Generate JSON" on the final section
3. Choose to:
   - **Copy to Clipboard**: Copy JSON for pasting elsewhere
   - **Download JSON**: Save as a `.json` file
   - **Start New Report**: Clear data and begin again

### Photo Handling

- Photos can be selected from the device camera or gallery
- Only photo metadata is stored (filename, size, timestamp, ID)
- Actual photo data is NOT embedded in the JSON
- Photo identifiers can be used to link to separately uploaded images

## JSON Output Format

The app generates a JSON file matching the Birdability.org specification:

```json
{
  "id": "UUID",
  "createdAt": "ISO8601 timestamp",
  "name": "Report name",
  "generalInformation": { ... },
  "accessibilityDetailed": { ... },
  "accessibilityCriteria": { ... },
  "photos": [
    {
      "id": "photo_identifier",
      "name": "filename.jpg",
      "size": 12345,
      "type": "image/jpeg",
      "timestamp": "ISO8601"
    }
  ]
}
```

## Offline Support

The PWA includes a Service Worker that:
- Caches app files for offline use
- Enables the app to work without internet connection
- Stores form data locally until ready to submit
- Updates automatically when online

## Browser Compatibility

- **Chrome/Edge**: Full PWA support
- **Safari (iOS 11.3+)**: Full support with Add to Home Screen
- **Firefox**: Full support
- **Samsung Internet**: Full support

## Mobile Features

- Responsive design optimized for mobile devices
- Touch-friendly interface
- Camera integration for photos
- Installable as standalone app
- Works offline

## Keyboard Shortcuts

- `Ctrl + →`: Next section
- `Ctrl + ←`: Previous section

## Development

### Customization

**Colors:** Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #4CAF50;
    --secondary-color: #2196F3;
    /* ... */
}
```

**Form Fields:** Modify sections in `index.html`

**Data Structure:** Update `getFormData()` function in `app.js`

### Testing PWA Features

1. Test on mobile device or use Chrome DevTools
2. Open DevTools → Application tab
3. Check:
   - Manifest
   - Service Worker
   - Cache Storage
   - Local Storage

## Security & Privacy

- All data stored locally on device
- No automatic data transmission
- User controls when to export data
- HTTPS required for full PWA features in production

## Troubleshooting

**PWA won't install:**
- Ensure you're using HTTPS (or localhost for testing)
- Check that manifest.json is valid
- Verify Service Worker is registered

**Data not saving:**
- Check browser localStorage is enabled
- Ensure not in private/incognito mode

**Photos not working:**
- Check camera permissions
- Verify browser supports File API

## Future Enhancements

Potential features for future versions:
- Cloud sync capability
- Multiple language support
- Photo upload to cloud storage
- Offline queue with background sync
- Data validation and warnings
- Field-specific help text
- Export to other formats (CSV, PDF)

## License

This application is designed for Birdability.org. Please check with the organization regarding usage rights.

## Support

For issues or questions about accessible birding sites, visit [Birdability.org](https://birdability.org)

## Credits

Built for the Birdability community to help make birding accessible to everyone.

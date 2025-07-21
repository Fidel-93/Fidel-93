# Health Monitoring System

## Overview

The Health Monitoring System is a web-based application designed to help users record, track, and analyze their vital health readings. It provides a simple interface for entering data, viewing recent readings, and receiving automated health insights.

## Features

- **Dashboard:** Displays the latest readings for blood pressure, heart rate, blood sugar, and temperature, along with status indicators.
- **Input Readings:** Easy-to-use form for entering new health data, including optional notes.
- **History:** Chronological list of all recorded readings.
- **Insights:** Automated health tips and warnings based on your latest data.
- **Local Storage:** All data is stored in your browser for privacy and persistence.
- **Responsive Design:** Works on desktop and mobile devices.

## Getting Started

1. **Clone or Download** this repository.
2. **Open `index.html`** in your web browser.
3. **Navigate** using the top menu:
   - **Dashboard:** View your latest readings and insights.
   - **Input Readings:** Add new health data.
   - **History:** Review your previous entries.

## Usage

- **Add a Reading:**  
  Select the reading type, enter the required values, add notes if desired, and click "Save Reading".
- **Review Insights:**  
  The dashboard will display tips or warnings based on your latest readings.
- **View History:**  
  All previous readings are listed in the History section.

## File Structure

- `index.html` — Main HTML file.
- `style.css` — Application styling.
- `script.js` — Application logic and interactivity.

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Local Storage API

## Customization

You can modify health status thresholds and logic in `script.js` within the functions:
- `getBloodPressureStatus`
- `getHeartRateStatus`
- `getBloodSugarStatus`
- `getTemperatureStatus`

## Privacy

All health data is stored locally in your browser and is not transmitted anywhere.

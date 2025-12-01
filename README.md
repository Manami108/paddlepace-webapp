# PaddlePace Web App

PaddlePace is a static web experience that helps university students estimate real-world cycling time between two points while showing elevation and weather context. The project is built entirely with HTML, CSS, and JavaScript and is designed to run from the `cycling-app/` directory without a build step.

## Features
- **Landing page:** Animated hero with the PaddlePace brand and quick access to the route planner. The page uses the shared navigation menu and responsive layout defined in `styles.css` and `assets/js/main.js`.
- **Route planner:** The `map.html` page requests the user’s geolocation, centers a Google Map on that position, and lets riders place a destination by clicking anywhere on the map. The app draws a walking route (used as a proxy for cycling), calculates distance and time, and converts them into a cycling estimate that accounts for elevation gain using the Google Elevation API (`getElevation`). Weather for the start and end points is pulled from OpenWeather (`getWeather`) and displayed alongside animated sun/rain iframes.
- **Team page:** `aboutUs.html` highlights the PaddlePace team members and the project mission within the same navigation chrome as the other pages.

## Project structure
- `cycling-app/index.html` – Landing page and navigation entry point.
- `cycling-app/map.html` – Route planner UI, Google Maps integration, loading overlay, and weather/elevation panels.
- `cycling-app/map.js` – All routing logic: geolocation, map initialization, marker placement, direction lookup, elevation/time/weather helpers, and mobile nav toggles.
- `cycling-app/styles.css` and `cycling-app/App.css` – Core styling for the layout, animations, map container, and shared components.
- `cycling-app/assets/js/main.js` – Navigation toggling and countdown helper shared across pages.
- `cycling-app/aboutUs.html` – Team bios and mission statement.

## Prerequisites
- A **Google Maps JavaScript API key** for map, directions, distance, and elevation requests. Update the `key` query parameter in the script tag near the bottom of `cycling-app/map.html`.
- An **OpenWeather API key** for start/end weather. Replace the `appid` value inside `getWeather` in `cycling-app/map.js`.

## Running locally
1. Move into the app folder: `cd cycling-app`.
2. Serve the static files with any HTTP server (for example, `python -m http.server 8000`). Geolocation APIs only work over HTTPS or `http://localhost`.
3. Open `http://localhost:8000` in a browser. Use the navigation menu to reach the route planner or team page.

## Using the route planner
1. Allow the browser to share your location so the map centers on you and sets the origin.
2. Click anywhere on the map to drop a destination marker.
3. Press **Calculate**. A loading overlay appears while directions are requested.
4. Review the estimated distance/time, derived cycling time (with elevation adjustment), and the weather/precipitation for both endpoints. A **Back** button returns you to the planner view.

## Customization tips
- Tweak map sizing and positioning in `styles.css` and the inline styles in `map.html` when changing layouts.
- Update hero text, button labels, or team details directly in the respective HTML files.
- The map display, weather layout, and iframe animations (sun/rain) can be repositioned by adjusting the DOM manipulations in `map.js`.

## Updating this README
- Keep route-planner explanations in sync with the implementations in `cycling-app/map.html` and `cycling-app/map.js` when behavior changes (e.g., new overlays, input steps, or API adjustments).
- When API requirements change, update the **Prerequisites** section first so developers see new keys or parameters immediately.
- If you add new pages or assets under `cycling-app/`, reflect them in **Project structure** and **Features** to keep navigation cues accurate.
- After editing, skim the live app locally (see **Running locally**) to confirm terminology matches the UI labels, buttons, and flows.
cycling-app/README.md
+27
-11
alizes Google Maps/Directions/Elevation/DistanceMatrix services (`initMap`, `displayMap`).
- Handles origin (current location) and destination marker placement, then requests directions on **Calculate**.
- Converts Google route distance/time strings into numbers to estimate cycling time against elevation gain (`convertTimeStringToMinutes`, `convertDistanceStringToMeters`, `getElevation`).
- Fetches start/end weather with OpenWeather and formats precipitation, temperature, and cloud cover (`getWeather`).
- Moves the map and weather/elevation overlays into view after calculation, and wires mobile navigation toggles.

## Setup
1. Replace the Google Maps API key in the `<script>` tag near the end of `map.html` (`key=...`).
2. Set your OpenWeather API key in the `appid` value inside `getWeather` in `map.js`.
3. Serve the directory over HTTP (for example, `python -m http.server 8000`) so geolocation APIs work on `http://localhost`.

## Usage
1. Open `index.html` (or go directly to `map.html`).
2. Allow location access; the app will center the map and set the origin.
3. Click the map to place a destination marker, then select **Calculate**.
4. Review the distance/time, elevation gap, cycling time estimate, and weather panels. Use the **Back** button to return to planning.

## Styling
- Layout, navigation, and animation styles live in `styles.css` with supplemental map styles in `App.css`.
- Weather animations are rendered through `sun.html` and `rain.html` iframes; adjust their sizes or positions in `map.js` and `styles.css`.

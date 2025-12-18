# Snake Identification App

This is a React Native Expo application designed to identify snake species using the Gemini API. This project is set up to run on Android, iOS, and the Web.

## Prerequisites

Before running the project, ensuring you have the following installed on your computer:

1.  **Node.js & npm**: Download and install from [nodejs.org](https://nodejs.org/). This allows you to run JavaScript projects.
2.  **Expo Go (For Mobile)**:
    -   **Android**: Download **Expo Go** from the Google Play Store.
    -   **iOS**: Download **Expo Go** from the Apple App Store.

## Installation

1.  **Unzip the Project**: Extract the provided zip file to a folder on your computer.
2.  **Open Terminal**:
    -   **Windows**: Open Command Prompt (formatted as `cmd`) or PowerShell and navigate to the extracted folder.
        -   Example: `cd Downloads/snake-bite-group-project`
    -   **Mac/Linux**: Open Terminal and navigate to the folder.
3.  **Install Dependencies**: Run the following command in your terminal to install all necessary libraries:
    ```bash
    npm install
    ```
    *Note: This may take a few minutes.*

## Configuration (API Key)

**Important**: This project includes a pre-configured `.env` file containing a working `EXPO_PUBLIC_GEMINI_API_KEY`. **No additional setup is required to start the app.**

### (Optional) Using Your Own API Key
If you wish to use your own Google Gemini API key:
1.  Open the `.env` file in the project root using a text editor (VS Code, Notepad, etc.).
2.  Locate the line: `EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...`
3.  Replace the value with your own API key.
4.  Save the file.

## Running the Application

To start the development server, run:

```bash
npx expo start
```

Once the server starts, you will see a QR code and a list of options in the terminal.

### Android
1.  Open the **Expo Go** app on your Android device.
2.  Tap "Scan QR Code".
3.  Scan the QR code displayed in your terminal.
4.  The app will build and launch on your device.

### iOS (iPhone)
1.  Open the **Camera** app on your iPhone.
2.  Scan the QR code displayed in your terminal.
3.  Tap the notification to open it in **Expo Go**.
    *   *Note: If you are on the same Wi-Fi network and it doesn't connect, try using a "Tunnel" connection by running `npx expo start --tunnel` instead.*

### Web
1.  Press `w` in the terminal window where the server is running.
2.  The app will open in your default web browser.

## Troubleshooting

-   **Port already in use**: If you see an error that port 8081 is busy, you can trying running `npx expo start --port 8082`.
-   **Network Issues**: Ensure your phone and computer are on the same Wi-Fi network. If connection fails, try running:
    ```bash
    npx expo start --tunnel
    ```
-   **Clear Cache**: If you encounter strange errors, try clearing the cache:
    ```bash
    npx expo start -c
    ```

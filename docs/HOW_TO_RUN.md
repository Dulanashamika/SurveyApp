
# 📱 How to Run SurveyApp

This guide explains how to set up and run the SurveyApp project (Frontend Mobile App + Backend API) on your Windows machine.

## ✅ Prerequisites

1.  **Node.js**: Installed (v18+ recommended).
2.  **Android Studio**: Installed with Android SDK & Emulator.
3.  **Java JDK**: Version 17 (Usually bundled with Android Studio).

---

## 🚀 1. Setup Environment (One-time)

We have provided a helper script to automatically configure your environment variables (`JAVA_HOME`, `ANDROID_HOME`) and create necessary properties files.

1.  Open a terminal in the project root: `D:\softwares\SurveyApp`
2.  Run the setup script:
    ```powershell
    .\run-android-clean.ps1
    ```
    *(If you encounter execution policy errors, run as Administrator or use `Set-ExecutionPolicy RemoteSigned`)*.

This script will:
-   Set `JAVA_HOME` to your Android Studio JBR.
-   Set `ANDROID_HOME` to your local SDK path.
-   Add platform-tools to your system PATH.
-   Create `android/local.properties`.

---

## 🛠️ 2. Start the Backend Server

The mobile app requires the backend API to function.

1.  Open a **new** terminal window.
2.  Navigate to the backend folder:
    ```bash
    cd SurveyAppBackend
    ```
3.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will start on **Port 5001** by default.

---

## 📱 3. Run the Mobile App (Android)

Once the backend is running, you can launch the app.

1.  Open another terminal in the project root (`D:\softwares\SurveyApp`).
2.  Start the Metro Bundler:
    ```bash
    npm start
    ```
3.  In a separate terminal tab/window, launch the Android app:
    ```bash
    npm run android
    ```
    *Alternatively, you can run the setup script `.\run-android-clean.ps1` again, as it also attempts to build and run the app.*

---

## 🔌 4. Connect App to Local Backend

Since the Android Emulator runs on a virtual network, you need to forward the backend port so the app can reach your PC's localhost.

**Run this command in a new terminal window:**
```bash
adb reverse tcp:5001 tcp:5001
```

If you are testing on a **Physical Device**:
1.  Connect your phone via USB (ensure USB Debugging is ON).
2.  Double-check that your phone and PC are on the same Wi-Fi network.
3.  Update the API base URL in `src/config/api.js` (or similar config file) to use your PC's local IP address (e.g., `http://192.168.1.5:5001`) instead of `localhost`.

---

## ❓ Troubleshooting

### "JAVA_HOME is not set"
Run the `.\run-android-clean.ps1` script. It specifically fixes this issue by pointing to the correct Java path inside Android Studio.

### "adb is not recognized"
If you just ran the setup script, **restart your terminal** (close and reopen VS Code) effectively to reload the PATH environment variable.

### "Task :app:installDebug FAILED"
If the build fails, try cleaning the project:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Backend Connection Failed
-   Ensure the backend is running (`npm run dev`).
-   Ensure you ran `adb reverse tcp:5001 tcp:5001`.
-   Check if your firewall is blocking Node.js.

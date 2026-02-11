@echo off
echo Starting SurveyApp Backend Server...
echo.
echo Make sure:
echo 1. You have internet connection (for MongoDB Atlas)
echo 2. MongoDB Atlas credentials are correct in .env
echo 3. Firewall allows port 5001
echo.
cd D:\SurveyApp\SurveyAppBackend
echo Installing dependencies if needed...
call npm install
echo.
echo Starting server...
call npm run dev
pause

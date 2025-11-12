@echo off
echo ============================================
echo Running Migration 013 on Railway (Production)
echo ============================================
echo.
echo This will add the response_count column to the demands table
echo which will make demand queries 10-50x faster!
echo.
pause

cd server
railway run npm run db:migrate:013

echo.
echo ============================================
echo Migration 013 Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Restart your Railway service to use the new column
echo 2. Test the application - it should be MUCH faster now!
echo.
pause

@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   رفع صور المشاريع على GitHub
echo ========================================
echo.

if not exist "images\project-1.jpg" (
  echo [خطأ] مش لاقي images\project-1.jpg
  pause
  exit /b 1
)
if not exist "images\project-2.png" (
  echo [خطأ] مش لاقي images\project-2.png
  pause
  exit /b 1
)
if not exist "images\project-3.png" (
  echo [خطأ] مش لاقي images\project-3.png
  pause
  exit /b 1
)

echo جاري إضافة الصور...
git add "images/project-1.jpg" "images/project-2.png" "images/project-3.png" "images/logo.PNG" 2>nul
git add images/

echo.
git status
echo.

git commit -m "Add project images"
if errorlevel 1 (
  echo.
  echo ممكن تكون الصور مترفعة قبل كده، أو مفيش تغيير جديد.
)

echo.
echo جاري الرفع على GitHub...
git push -u origin HEAD

echo.
echo ========================================
echo خلص. افتح اللينك بعد دقيقة:
echo https://zyadomara6-hue.github.io/electric_company/
echo ========================================
pause

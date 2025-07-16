@echo off
REM MCP ChatGPT Image Server Setup Script for Windows

echo.
echo 🚀 Setting up MCP ChatGPT Image Server...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if .env file exists
if not exist .env (
    echo.
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit .env and add your OpenAI API key
    echo    Get your API key from: https://platform.openai.com/api-keys
) else (
    echo ✅ .env file already exists
)

REM Build the project
echo.
echo 🔨 Building the project...
call npm run build

echo.
echo ✅ Setup complete!
echo.
echo 📖 Next steps:
echo    1. Edit .env and add your OpenAI API key (if not already done^)
echo    2. Test the server: npm run inspector
echo    3. Add to Claude Desktop using the configuration in README.md
echo.
echo 🎨 Happy image generating!
echo.
pause
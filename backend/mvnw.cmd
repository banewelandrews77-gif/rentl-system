@REM Maven Wrapper - downloads Maven and runs it (no wrapper JAR needed)
@echo off
setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

set "MAVEN_DIR=%MAVEN_PROJECTBASEDIR%\.mvn\apache-maven-3.9.6"
set "MAVEN_ZIP=%MAVEN_PROJECTBASEDIR%\.mvn\apache-maven-3.9.6-bin.zip"
set "MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"

if not exist "%MAVEN_DIR%\bin\mvn.cmd" (
  echo Downloading Maven 3.9.6...
  if not exist "%MAVEN_PROJECTBASEDIR%\.mvn" mkdir "%MAVEN_PROJECTBASEDIR%\.mvn"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%MAVEN_ZIP%' -UseBasicParsing }"
  if not exist "%MAVEN_ZIP%" (
    echo Failed to download Maven.
    exit /b 1
  )
  echo Extracting...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_PROJECTBASEDIR%\.mvn' -Force"
  if exist "%MAVEN_PROJECTBASEDIR%\.mvn\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MAVEN_DIR=%MAVEN_PROJECTBASEDIR%\.mvn\apache-maven-3.9.6"
  )
  if not exist "%MAVEN_DIR%\bin\mvn.cmd" (
    echo Failed to extract Maven. Try extracting %MAVEN_ZIP% manually.
    exit /b 1
  )
  del "%MAVEN_ZIP%" 2>nul
  echo Maven ready.
)

if "%JAVA_HOME%"=="" (
  echo JAVA_HOME is not set.
  exit /b 1
)
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo JAVA_HOME does not point to a valid JDK: %JAVA_HOME%
  exit /b 1
)

set "PATH=%MAVEN_DIR%\bin;%PATH%"
call "%MAVEN_DIR%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%

@ECHO OFF
@REM ---------------------------------------------------------------------------
@REM Maven wrapper liviano para EcoConce (Windows).
@REM Descarga Apache Maven la primera vez (necesita internet) y lo cachea.
@REM Uso:  mvnw.cmd verify   |   mvnw.cmd test   |   mvnw.cmd -version
@REM ---------------------------------------------------------------------------
SETLOCAL
SET MAVEN_VERSION=3.9.9
SET "WRAPPER_DIR=%USERPROFILE%\.m2\wrapper-ecoconce"
SET "MAVEN_HOME=%WRAPPER_DIR%\apache-maven-%MAVEN_VERSION%"
SET "DIST_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip"

IF NOT EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
  ECHO ^>^> Descargando Apache Maven %MAVEN_VERSION% ^(solo la primera vez^)...
  IF NOT EXIST "%WRAPPER_DIR%" MKDIR "%WRAPPER_DIR%"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DIST_URL%' -OutFile '%WRAPPER_DIR%\maven-dist.zip'; Expand-Archive -Path '%WRAPPER_DIR%\maven-dist.zip' -DestinationPath '%WRAPPER_DIR%' -Force; Remove-Item '%WRAPPER_DIR%\maven-dist.zip'"
  IF ERRORLEVEL 1 (
    ECHO ERROR: fallo la descarga/extraccion de Maven. Revisa tu conexion.
    EXIT /B 1
  )
  ECHO ^>^> Maven %MAVEN_VERSION% instalado en %MAVEN_HOME%
)

CALL "%MAVEN_HOME%\bin\mvn.cmd" %*
SET MVN_EXIT=%ERRORLEVEL%
ENDLOCAL & EXIT /B %MVN_EXIT%

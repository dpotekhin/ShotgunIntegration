:: goto skipfunctions
@echo off
call:%*
exit/b

:: ============================================================
:: CREATE SHORTCUT
:: ============================================================
:createShortcut
SETLOCAL ENABLEDELAYEDEXPANSION
SET Esc_LinkDest=%~1

call :getFilePath %Esc_LinkDest%
if not exist "%Esc_LinkDest%" mkdir "%_result%"

SET Esc_LinkTarget=%~2
SET cSctVBS=CreateShortcut.vbs
((
  echo Set oWS = WScript.CreateObject^("WScript.Shell"^) 
  echo sLinkFile = oWS.ExpandEnvironmentStrings^("!Esc_LinkDest!"^)
  echo Set oLink = oWS.CreateShortcut^(sLinkFile^) 
  echo oLink.TargetPath = oWS.ExpandEnvironmentStrings^("!Esc_LinkTarget!"^)
  echo oLink.Save
)1>!cSctVBS!
cscript //nologo .\!cSctVBS!
DEL !cSctVBS! /f /q
)
EXIT /B 0


:: ============================================================
:: GET FILE PATH
:: ============================================================
:getFilePath
SETLOCAL
set lnk=%~1
set path=
for %%a in (%lnk%) do set path=%%~dpa
::echo path^: %lnk% ^> %path%
ENDLOCAL & SET _result=%path%
EXIT /B 0

:: :skipfunctions
@echo off

:: PARAMS:
::				1					|		2		|
:: shotName (ep003_sq001_sh1980)	|	assetPaths	|

set shotName=%~1
if "%shotName%"=="" (
	set errorMsg=Shot name required ^(Example: ep003_sq001_sh1980^)^.
	goto error
)

call settings.bat
set copyFlags=/j /DCOPY:T /XD work .thumbnails /E /R:2 /W:5 /MT:16

echo ^:^:^:^:^: %shotName% ^:^:^:^:^:

:: COPY FOLDER
REM Xcopy /e /i /d /y "%animRemotePath%\%shotName%" "%localPath%\%shotName%"
robocopy "%animRemotePath%\%shotName%" "%localPath%\%shotName%" %copyFlags%

:: CREATE FOLDERS
md "%localPath%\%shotName%\_anim2d"
md "%localPath%\%shotName%\_assets"

:: CREATE SHORTCUTS
CALL lib.bat createShortcut "%localPath%\%shotName%\O.lnk" "%animRemotePath%\%shotName%"
CALL lib.bat createShortcut "%localPath%\%shotName%\O-POSTPROD.lnk" "%postprodRemotePath%\%shotName%"

:: ASSETS
set assetPaths=%~2
echo LIST: %assetPaths%
if not "assetPaths"=="" (
	for %%a in ("%assetPaths:;=" "%") do (
		
		:: CREATE SHORTCUTS
		CALL lib.bat createShortcut "%localPath%\%shotName%\_assets\%%~a_X.lnk" "%localAssetsPath%\%%~a"
		CALL lib.bat createShortcut "%localPath%\%shotName%\_assets\%%~a_NET.lnk" "%localNetworkAssetsPath%\%%~a"
		
		:: COPY USED ASSETS
		::echo ASSET: "%assetsRemotePath%\%%~a"
		::echo Local: "%localAssetsPath%\%%~a"
		REM Xcopy /e /i /d /y "%assetsRemotePath%\%%~a" "%localAssetsPath%\%%~a"
		robocopy "%assetsRemotePath%\%%~a" "%localAssetsPath%\%%~a" %copyFlags%
		
	)
)

echo ^:^:^:^:^: COMPLETE ^:^:^:^:^:

goto end
::

:: ERROR
:error
echo ERROR: %errorMsg%

:: END
:end
EXIT /B %ERRORLEVEL%
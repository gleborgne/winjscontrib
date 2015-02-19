(robocopy "..\MCNEXT WinJS Contrib.Shared" . /E /XF "MCNEXT WinJS Contrib.Shared.*")^& IF %ERRORLEVEL% LEQ 1 exit 0

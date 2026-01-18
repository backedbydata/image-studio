Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Change to the project directory
objShell.CurrentDirectory = strScriptPath

' Run npm run dev in a hidden window
objShell.Run "cmd /c npm run dev", 1, False

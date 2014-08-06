@echo off
SETLOCAL

SET SCRIPTPATH=%~dp0
%SCRIPTPATH%..\pj\phantomjs\phantomjs-1.9.7-windows\phantomjs.exe %SCRIPTPATH%..\pj\run.js %*
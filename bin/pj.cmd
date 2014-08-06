@echo off
SETLOCAL

SET BASEDIR=%~dp0
%BASEDIR%..\pj\phantomjs\phantomjs-1.9.7-windows\phantomjs.exe %BASEDIR%..\pj\run.js %*
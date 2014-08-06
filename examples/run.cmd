@echo off
SETLOCAL

SET SCRIPTPATH=%~dp0..\bin\

cd %~dp0js-tests
%SCRIPTPATH%pj.cmd --config ./config.json %*

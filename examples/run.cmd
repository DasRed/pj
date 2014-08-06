@echo off
SETLOCAL

SET BASEDIR=%~dp0..\bin\

cd %~dp0js-tests
%BASEDIR%pj.cmd --config ./config.json %*

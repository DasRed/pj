@echo off
SETLOCAL
SET oldPath=%CD%
cd .\pj
run.cmd --config ../config.json %*
cd %oldPath%

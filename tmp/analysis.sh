#!/bin/bash
# analysis.sh — dex string mining for POS API validation contract
cd /home/flayva/tmp/dex2 || exit 1
echo ==API-VERSION-CTX
grep -haoE ".{0,60}API.Version.{0,60}" *.dex 2>/dev/null | grep -avE "gralloc" | sort -u | head -20
echo ==PARAM-NAMES
grep -haoE ".{0,40}parameter.{0,40}" *.dex 2>/dev/null | grep -aioE ".{0,40}parameter.{0,40}" | grep -aiE "set|missing|required|invalid" | sort -u | head -25
echo ==API-VERSION-PARAM
grep -haoaE "API Version parameter.{0,30}" *.dex 2>/dev/null | sort -u | head -8
grep -haoaE ".{0,30}API Version parameter" *.dex 2>/dev/null | sort -u | head -8
echo ==SDK-VERSION
grep -haoE ".{0,30}SDK.Version.{0,40}" *.dex 2>/dev/null | grep -avE "minSdk|targetSdk|platform" | sort -u | head -15
echo ==MUST-BE-FAMILY
grep -haoE "The [A-Z][A-Za-z0-9 ]{2,40}parameter must be [A-Za-z0-9 .,()-]{0,40}" *.dex 2>/dev/null | sort -u | head -25
echo ANALYSIS-DONE

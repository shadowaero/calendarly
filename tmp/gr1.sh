#!/bin/bash
F=/home/flayva/tmp/api16.txt
echo ===CLASS-HEADERS
grep -n -E "^public|^final [a-z]+ class|^class [A-Z]|^@|^enum" $F | head -50
echo ===FIELD-DECLS
grep -n -E "static final" $F | head -40
echo ===SWITCH
grep -n -E "switch|case [0-9]" $F | head -30

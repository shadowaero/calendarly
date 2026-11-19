#!/bin/bash
# Grab recent square-pos callback + server logs from the user journal
export XDG_RUNTIME_DIR=/run/user/1000
echo '== SQCB / square-pos log lines (last 600 lines of journal) =='
journalctl --user -u flayva-thymme --no-pager -n 600 2>/dev/null | grep -iE 'SQCB|square-pos|squarepos' | tail -30
echo '== last 12 server lines =='
journalctl --user -u flayva-thymme --no-pager -n 12 2>/dev/null

#!/bin/bash
cd /home/flayva/tmp
pkill -f sweep2.sh; rm -f sweep3.out sweep2.prog
worker() {
  local shard=$1; shift
  for f in "$@"; do
    n=$(basename $f .dex)
    python3 dex2bytecode.py $f Lcom/squareup/api/ 2>/dev/null > tmp_$n.$shard.b
    if grep -q "^==== Lcom" tmp_$n.$shard.b; then
      echo "== DEFS-IN $n" >> sweep3.out
      grep "^====" tmp_$n.$shard.b >> sweep3.out
    fi
    rm -f tmp_$n.$shard.b
    echo "s$shard-done $n" >> sweep3.prog
  done
}
FILES=$(ls dex2/*.dex | sort)
set -- $FILES
TOTAL=$#
THIRD=$(( (TOTAL + 2) / 3 ))
worker A $(ls dex2/*.dex | sort | sed -n "1,${THIRD}p") &
worker B $(ls dex2/*.dex | sort | sed -n "$((THIRD+1)),$((2*THIRD))p") &
worker C $(ls dex2/*.dex | sort | sed -n "$((2*THIRD+1)),\$p") &
wait
echo SWEEP3-DONE >> sweep3.prog

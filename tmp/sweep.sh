#!/bin/bash
cd /home/flayva/tmp
rm -f sweep.out
for f in dex2/*.dex; do
  n=$(basename $f)
  python3 dex2bytecode.py $f Lcom/squareup/api/ 2>/dev/null | grep -E "^====" > sweep_$n.out
  if [ -s sweep_$n.out ]; then
    echo "== $n" >> sweep.out
    cat sweep_$n.out >> sweep.out
  fi
  rm -f sweep_$n.out
done
echo SWEEP-DONE >> sweep.out

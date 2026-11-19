#!/bin/bash
cd /home/flayva/tmp
rm -f sweep2.out
i=0
for f in dex2/*.dex; do
  n=$(basename $f .dex)
  i=$((i+1))
  python3 dex2bytecode.py $f Lcom/squareup/api/ 2>/dev/null > tmp_$n.b
  if grep -q "^==== Lcom" tmp_$n.b; then
    echo "== DEFS-IN $n" >> sweep2.out
    grep "^====" tmp_$n.b >> sweep2.out
  fi
  echo "progress $i $n" >> sweep2.prog
  rm -f tmp_$n.b
done
echo SWEEP2-DONE >> sweep2.prog

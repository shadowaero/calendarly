#!/bin/bash
cd /home/flayva/tmp
for n in classes16 classes30 classes9 classes38 classes33 classes3 classes8 classes7 classes18 classes28; do
  python3 dex2bytecode.py dex2/$n.dex Lcom/squareup/api/ 2>/dev/null | grep -E "^====" | head -12 > defs_$n.txt
  echo "== $n $(wc -l < defs_$n.txt)"
done
echo ===ALL
cat defs_classes*.txt | sort -u | head -60

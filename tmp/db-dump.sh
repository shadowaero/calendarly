#!/bin/bash
cd /opt/calendarly/client/dist/assets
node -e '
const fs=require("fs");
const s=fs.readFileSync("index-BDiodzvu.js","utf8");
function ctx(needle, want){
  let i=-1, n=0;
  while((i=s.indexOf(needle, i+1))>=0){
    if (want===undefined || n===want){ console.log("--- "+needle+" @"+i+" hit#"+n); console.log(s.slice(Math.max(0,i-300), i+500)); console.log(); }
    n++;
  }
  console.log("="+needle+" total:"+n);
}
ctx("interval_seconds");
ctx("/loops");
ctx("assigned_type===\"loop\"");
' 2>&1 | head -150
echo PLAYBACK_DONE
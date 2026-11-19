adb connect 10.42.0.153:5555
sleep 2
adb devices | tail -n +2 | grep -q 10.42.0.153 && echo ADB_BACK || echo ADB_STILL_DOWN
adb -s 10.42.0.153:5555 shell dumpsys window 2>/dev/null | grep mCurrentFocus
echo '== node https Square check =='
node -e 'const https=require("https");const m=JSON.parse(require("fs").readFileSync("/home/flayva/flayva-thymme/data/menu.json"));const cfg=m.ordering.squareConfig;const u="https://connect.squareup.com/v2/payments?order_id=YqlcUfPAicxKfOmds4SERFPi2mOZY&limit=2";const r={headers:{"Authorization":"Bearer "+cfg.accessToken.replace(/[^ -~]/g,""),Accept:"application/json"}};const req=https.get(u,r,res=>{let b="";res.on("data",c=>b+=c);res.on("end",()=>{console.log("HTTP",res.statusCode,(b.match(/"status":"[A-Z]+"/)||[])[0]);});});req.on("error",e=>console.log("ERR",e.message));req.setTimeout(9000,()=>{req.destroy(new Error("timeout"))});'

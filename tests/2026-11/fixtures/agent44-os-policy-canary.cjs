'use strict';

const fs=require('node:fs');
const cp=require('node:child_process');
const net=require('node:net');
const {Worker}=require('node:worker_threads');
const readline=require('node:readline');

function attempt(fn){
  try{return {ok:true,value:fn()};}
  catch(error){return {ok:false,code:error.code||error.name};}
}

function connect(host,port){
  return new Promise(resolve=>{
    const socket=net.createConnection({host,port});
    let done=false;
    const finish=value=>{if(done)return;done=true;socket.destroy();resolve(value);};
    socket.setTimeout(700,()=>finish({ok:false,code:'timeout'}));
    socket.once('connect',()=>finish({ok:true}));
    socket.once('error',error=>finish({ok:false,code:error.code||error.name}));
  });
}

function workerProbe(paths){
  return new Promise(resolve=>{
    try{
      const source='const {parentPort,workerData}=require("node:worker_threads");'+
        'const fs=require("node:fs");const result=workerData.map(p=>{try{fs.readFileSync(p);return {ok:true};}catch(e){return {ok:false,code:e.code||e.name};}});'+
        'parentPort.postMessage(result);';
      const worker=new Worker(source,{eval:true,workerData:paths});
      worker.once('message',value=>{worker.terminate();resolve({ok:true,value});});
      worker.once('error',error=>resolve({ok:false,code:error.code||error.name}));
    }catch(error){resolve({ok:false,code:error.code||error.name});}
  });
}

function childProbe(paths){
  const source='const fs=require("node:fs");const result='+JSON.stringify(paths)+
    '.map(p=>{try{fs.readFileSync(p);return {ok:true};}catch(e){return {ok:false,code:e.code||e.name};}});'+
    'process.stdout.write(JSON.stringify(result));';
  return attempt(()=>{
    const result=cp.spawnSync(process.execPath,['-e',source],{encoding:'utf8',timeout:2000});
    if(result.error)throw result.error;
    return {status:result.status,stdout:result.stdout};
  });
}

async function main(request){
  const report={
    schema:'agent44-policy-sandbox-canary-v1',
    nodeVersion:process.version,
    seat:request.seat,
    sequence:request.sequence,
    policySeed:request.policySeed,
    cwd:process.cwd(),
    envKeys:Object.keys(process.env).sort(),
    uid:process.getuid?.()??null,
    procVisible:attempt(()=>fs.existsSync('/proc')),
    repoVisible:attempt(()=>fs.existsSync(request.repoPath))
  };
  report.hostFiles=request.forbiddenPaths.map(file=>({
    path:file,
    ...attempt(()=>fs.readFileSync(file,'utf8'))
  }));
  report.hostProc=attempt(()=>fs.readFileSync(request.hostProcPath,'utf8'));
  report.rootWrite=attempt(()=>fs.writeFileSync('/policy/should-not-write','x'));
  report.tmpWrite=attempt(()=>{fs.writeFileSync('/tmp/sandbox-write-test','ok');return true;});
  report.childProcess=childProbe(request.forbiddenPaths);
  report.workerThread=await workerProbe(request.forbiddenPaths);
  report.network=await connect('127.0.0.1',request.hostPort);

  const original=Math.random;
  let captured;
  Object.defineProperty(Math,'random',{
    configurable:true,
    get(){return original;},
    set(value){
      captured=value;
      Object.defineProperty(Math,'random',{configurable:true,writable:true,value});
    }
  });
  Math.random=original;
  report.mathRandomSetterCapturedOwnFunction=captured===original;
  process.stdout.write(JSON.stringify(report)+'\n');
}

const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
let queue=Promise.resolve();
rl.on('line',line=>{
  queue=queue.then(()=>main(JSON.parse(line))).catch(error=>{
    process.stderr.write(String(error)+'\n');
    process.exitCode=1;
  });
});

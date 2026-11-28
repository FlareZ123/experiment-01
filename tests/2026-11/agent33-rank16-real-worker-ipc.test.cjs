'use strict';
/* Real Agent49 child worker / restricted-VM IPC gate for original rank16 policy.
 * This is still NOT Twinleaf Store, card settlement, fixture, or a full game. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const readline=require('node:readline');
const crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const policy=require('../../simulation/evaluation/2026-11/agent33-rank16-absol-garbodor-dual-lock-opponent-policy.cjs');
const dirRoot=path.resolve(__dirname,'../..');
const SRC={
  worker:path.join(dirRoot,'simulation/evaluation/2026-11/agent49-policy-worker.cjs'),
  protocol:path.join(dirRoot,'simulation/evaluation/2026-11/agent49-policy-protocol.cjs'),
  policy:path.join(dirRoot,'simulation/evaluation/2026-11/agent33-rank16-absol-garbodor-dual-lock-opponent-policy.cjs')
};
const P={
  absol:'Mega Absol ex MEG 86', garb:'Garbodor BKP 57',
  crobat:'Crobat V DAA 104', float:'Float Stone BKT 137'
};
function restrictions(){
  return {cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
    blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
    onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
    attackCostIncreaseWhileActive:0,cannotRetreat:false,cannotRetreatNextTurn:false,
    cannotRetreatWhileActive:false,cannotEvolveNextTurn:false};
}
function publicRestrictions(){
  return {gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,attackMaxEnergy:null,
    attackMaxEnergyTurnsRemaining:0,ignoreAttackCostCardTypes:[],
    ignoreAttackCostTurnsRemaining:0,cannotUseGXAttacks:false,pokemonPlayLocked:false,
    abilityPokemonPlayLocked:false,evolutionPlayLocked:false,itemPlayLocked:false,
    supporterPlayLocked:false,stadiumPlayLocked:false,toolPlayLocked:false,
    energyPlayLocked:false,specialEnergyPlayLocked:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:null};
}
function pokemon(printing,tools=[]){
  return {printing,name:printing.split(' ').slice(0,-2).join(' '),hp:180,damage:0,
    lastPlayedOrEvolvedTurn:1,printed:{stage:'BASIC',subtypes:['Basic'],
    types:['Darkness'],retreatCost:['Colorless'],weakness:[],resistance:[]},
    specialConditions:[],publicRestrictions:restrictions(),
    evolutionPrintings:[],energies:[],tools,attacks:[],abilities:[],
    abilityDetails:[],abilitySuppressions:null};
}
function player(active,bench=[]){
  return {active,bench:bench.concat(Array(Math.max(0,5-bench.length)).fill(null)),
    stadium:[],discard:[],lostZone:[],resolvingSupporter:[],publicHand:null,
    prizeSlots:[],publicTurnRestrictions:publicRestrictions(),handCount:0,
    deckCount:30,prizeCount:6};
}
function turnResources(){
  return {supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
    energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,
    vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
    evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
    stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,
    specialEnergyPlayLocked:false};
}
function actorObservation(seat,prompt=null){
  return {actorSeat:seat,globalTurn:4,phase:2,
    decisionKind:prompt?'owner-prompt':'owner-root',
    pendingPromptType:prompt?.promptType??null,pendingOwnerDeckSearch:false,
    ownHand:[],ownPublic:player(pokemon(P.absol),
      [pokemon(P.garb),pokemon(P.crobat)]),
    opponentPublic:player(pokemon('Shadow Rider Calyrex VMAX CRE 75')),
    ownTurnResources:turnResources(),ownerK1:null};
}
function message(seat,sequence,prompt,items){
  return {schema:protocol.REQUEST_SCHEMA,type:'decision',
    requestId:'agent33-rank16-ipc-seat'+seat+'-seq'+sequence,
    sequence,role:'opponent',seat,observationSchema:protocol.OBSERVATION_SCHEMA,
    observation:actorObservation(seat,prompt),prompt,publicEventReceipt:null,
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items}};
}
function startWorker(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent33-rank16-worker-'));
  fs.copyFileSync(SRC.worker,path.join(dir,'worker.cjs'));
  fs.copyFileSync(SRC.protocol,path.join(dir,'agent49-policy-protocol.cjs'));
  const source=fs.readFileSync(SRC.policy,'utf8');
  fs.writeFileSync(path.join(dir,'policy.cjs'),source);
  const child=spawn(process.execPath,[path.join(dir,'worker.cjs')],{
    stdio:['pipe','pipe','pipe'],env:{PATH:process.env.PATH||'/usr/bin:/bin'}});
  const lines=[],r=readline.createInterface({input:child.stdout});
  let stderr='';
  r.on('line',line=>{try{lines.push(JSON.parse(line));}catch{lines.push({invalidJson:line});}});
  child.stderr.setEncoding('utf8');
  child.stderr.on('data',chunk=>{stderr+=chunk;});
  return {dir,child,lines,r,source,get stderr(){return stderr;}};
}
async function awaitLines(w,n){
  const started=Date.now();
  while(w.lines.length<n){
    if(w.child.exitCode!==null)throw Error('worker exited early: '+w.stderr);
    if(Date.now()-started>5000)throw Error('policy IPC timed out: '+w.stderr);
    await new Promise(resolve=>setTimeout(resolve,10));
  }
}
async function closeWorker(w){
  if(w.child.exitCode!==null)return;
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('worker close timeout')),5000);
    w.child.once('close',()=>{clearTimeout(timer);resolve();});
    w.child.once('error',error=>{clearTimeout(timer);reject(error);});
  });
}
function send(w,obj){w.child.stdin.write(JSON.stringify(obj)+'\n');}
for(const seat of [0,1]){
  test('rank16 genuine restricted Agent49 IPC root -> physical Tool prompt seat '+seat,async()=>{
    const w=startWorker();
    try{
      const init={schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat,
        policyVersion:policy.POLICY_VERSION,config:{},
        bundleSha256:crypto.createHash('sha256').update(w.source).digest('hex')};
      send(w,init);await awaitLines(w,1);
      assert.equal(w.lines[0].schema,protocol.READY_SCHEMA);
      assert.equal(w.lines[0].policyDrawCount,0);
      const root=message(seat,1,null,[
        {token:'tool',kind:'play-card',actorPrinting:P.float,targetPrinting:P.garb},
        {token:'pass',kind:'pass',label:'Pass turn'}]);
      send(w,root);await awaitLines(w,2);
      assert.equal(w.lines[1].schema,protocol.RESPONSE_SCHEMA);
      assert.deepEqual(w.lines[1].decision,{kind:'select-action',token:'tool'});
      assert.equal(w.lines[1].policyDrawCount,0);
      const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
        promptType:'ChoosePokemonPrompt',description:'Choose recipient',
        source:{classification:'actor-choice',sourceKind:'card-effect',
          sourcePrinting:P.float,effectName:'Float Stone'},
        publicMetadata:{selectionType:'pokemon',minimumCount:1,
          maximumCount:1,allowCancel:false},choices:[
          {token:'garb',kind:'pokemon',printing:P.garb,label:P.garb,
            publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
          {token:'crobat',kind:'pokemon',printing:P.crobat,label:P.crobat,
            publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}
        ]};
      send(w,message(seat,2,prompt,[]));await awaitLines(w,3);
      assert.equal(w.lines[2].schema,protocol.RESPONSE_SCHEMA);
      assert.deepEqual(w.lines[2].decision,{kind:'select-choices',tokens:['garb']});
      assert.equal(w.lines[2].policyDrawCount,0);
      w.child.stdin.end();await closeWorker(w);
      assert.equal(w.child.exitCode,0,w.stderr);
    }finally{
      if(w.child.exitCode===null)w.child.kill();
      w.r.close();
      fs.rmSync(w.dir,{recursive:true,force:true});
    }
  });
}

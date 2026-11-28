'use strict';
/*
 * Genuine Agent49 init+decision protocol smoke: no simulated match or CI.
 * Strict mode should visibly abstain; explicit playable bundle can select
 * the sole offered native Pass. Neither may invent an unavailable action.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const {bundle}=require('../../simulation/evaluation/2026-11/agent20-rank15-build-native-worker.cjs');
const {POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
function mon(printing){
 return {printing,name:printing.split(' ').slice(0,-2).join(' '),hp:70,damage:0,
 lastPlayedOrEvolvedTurn:1,
 printed:{stage:'BASIC',subtypes:[],types:['Colorless'],retreatCost:[],weakness:[],resistance:[]},
 specialConditions:[],
 publicRestrictions:{
  cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
  blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
  onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
  attackCostIncreaseWhileActive:0,cannotRetreat:false,
  cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,cannotEvolveNextTurn:false
 },
 evolutionPrintings:[],energies:[],tools:[],attacks:[],abilities:[],
 abilityDetails:[],abilitySuppressions:null};
}
function restrictions(){
 return {
  gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,attackMaxEnergy:null,
  attackMaxEnergyTurnsRemaining:0,ignoreAttackCostCardTypes:[],
  ignoreAttackCostTurnsRemaining:0,cannotUseGXAttacks:false,
  pokemonPlayLocked:false,abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
  itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,
  toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false,
  stadiumAndToolHaveNoEffectTurnsRemaining:null
 };
}
function player(printing){
 return {active:mon(printing),bench:[],stadium:[],discard:[],lostZone:[],
  resolvingSupporter:[],publicHand:null,prizeSlots:[],
  publicTurnRestrictions:restrictions(),handCount:0,deckCount:50,prizeCount:6};
}
function observation(seat){
 return {actorSeat:seat,globalTurn:2,phase:2,decisionKind:'owner-root',
  pendingPromptType:null,pendingOwnerDeckSearch:false,ownHand:[],
  ownPublic:player('Fan Rotom SCR 118'),
  opponentPublic:player('Mimikyu GRI 58'),
  ownTurnResources:{
   supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
   energyPlayedTurn:0,stadiumPlayedTurn:0,stadiumUsedTurn:0,vstarUsed:false,
   pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
   evolutionPlayLocked:false,itemPlayLocked:false,
   supporterPlayLocked:false,stadiumPlayLocked:false,
   toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false
  },ownerK1:null};
}
for(const mode of ['strict','playable']){
 for(const seat of [0,1]){
  test('Agent49 real init + native V3 root decision mode='+mode+' seat='+seat,()=>{
   const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aichi15-root-v3-'));
   try{
    const result=bundle({out:dir,mode});
    const protocol=require(path.join(dir,'agent49-policy-protocol.cjs'));
    const init={schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat,
      policyVersion:POLICY_VERSION,bundleSha256:result.manifest.files['policy.cjs'].sha256,
      config:{}};
    const request={schema:protocol.REQUEST_SCHEMA,type:'decision',
      requestId:'rank15-native-pass-smoke-'+seat,sequence:0,role:'opponent',seat,
      observationSchema:protocol.OBSERVATION_SCHEMA,observation:observation(seat),
      prompt:null,publicEventReceipt:null,
      actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[{kind:'pass',token:'pass'}]}};
    assert.doesNotThrow(()=>protocol.validateInit(init));
    assert.doesNotThrow(()=>protocol.validateRequest(request,init,0,new Set()));
    const child=spawnSync(process.execPath,[path.join(dir,'agent49-policy-worker.cjs')],
      {input:JSON.stringify(init)+'\n'+JSON.stringify(request)+'\n',
       encoding:'utf8',timeout:10000,maxBuffer:2*1024*1024});
    assert.equal(child.error,undefined,child.error?.message);
    assert.equal(child.status,0,child.stderr);
    const lines=child.stdout.trim().split('\n').filter(Boolean).map(JSON.parse);
    assert.equal(lines.length,2,child.stdout);
    assert.equal(lines[0].type,'ready');
    assert.equal(lines[1].type,'decision');
    const expected=mode==='strict'
      ?{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'}
      :{kind:'select-action',token:'pass'};
    assert.deepEqual(lines[1].decision,expected);
    assert.equal(lines[1].requestId,request.requestId);
    assert.equal(lines[1].sequence,0);
    assert.equal(lines[1].role,'opponent');
    assert.equal(lines[1].seat,seat);
    assert.equal(lines[1].policyVersion,POLICY_VERSION);
   }finally{fs.rmSync(dir,{recursive:true,force:true});}
  });
 }
}

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildCampaign}=require('../scripts/aichi-comparison-campaign.cjs');
const {executeCampaign}=require('../simulation/evaluation/aichi-campaign-runner.cjs');
const {createHash}=require('node:crypto');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function inputs(){
 const field=Array.from({length:32},(_,i)=>({rank:i+1,player:'P'+i,
   archetype:'Sample',published:i===0}));
 const cards=[{name:'A',count:60,printing:{set:'SYN',number:'1',language:'en'}}];
 const source={decks:[{rank:1,player:'P0',archetype:'Sample',cards}]};
 const candidates=[{id:'ref',referenceOnly:true,cards}];
 return {field,source,candidates,campaign:
  buildCampaign({field,source,candidates,pilotRanks:[1],repeats:1})};
}
function prepare(){
 return {engineRevision:'test',
  candidate:{cards:Array(60).fill('c'),unresolved:[]},
  opponents:[{rank:1,status:'ready',cards:Array(60).fill('o')}]};
}
function game(q){
 return {finished:true,winner:0,seed:q.seed,
  verifiedByDrawLog:true,firstTurnSlot:0,firstTurnPlayerId:101,
  firstTurnPlayerName:'research-A',firstDrawLogName:'research-A',
  deckHashes:[hash(q.deckA),hash(q.deckB)],engine:'twinleafgg/test',
  randomnessProtocol:'separate-game-and-per-seat-policy-prng-v1',
  policyRandomIsolation:true,promptValidationMode:'predispatch-prompt-validate',
  rules:{format:'EXPANDED',firstTurnDrawCard:true,
   firstTurnUseSupporter:false,attackFirstTurn:false},
  initialSourceDealFingerprint:{
   schema:'initial-source-physical-position-sha256-v1',
   seat:q.captureInitialSourceDealFingerprintSeat,
   digestSha256:'c'.repeat(64)}
 };
}
const base={maxTrials:1,prepareCandidate:prepare};
test('native source-deal capture is opt-in and source-seat bound',()=>{
 const rows=executeCampaign(inputs(),{...base,captureInitialSourceDeal:true,
  runMatch(q){assert.equal(q.captureInitialSourceDealFingerprintSeat,1);return game(q);}});
 assert.equal(rows.records[0].status,'completed');
 assert.equal(rows.records[0].initialSourceDealFingerprint.seat,1);
 const prior=executeCampaign(inputs(),{...base,runMatch:game});
 assert.equal(prior.records[0].initialSourceDealFingerprint,undefined);
});
test('absent or misattributed original Store proof fails before win counting',()=>{
 for(const mode of ['absent','wrong-seat','bad-digest']){
  const out=executeCampaign(inputs(),{...base,captureInitialSourceDeal:true,
   runMatch(q){
    const result=game(q);
    if(mode==='absent')delete result.initialSourceDealFingerprint;
    else if(mode==='wrong-seat')result.initialSourceDealFingerprint.seat=0;
    else result.initialSourceDealFingerprint.digestSha256='wrong';
    return result;
   }});
  assert.equal(out.records[0].status,'unverified-initial-source-deal');
  assert.equal(out.records[0].winner,null);
 }
});

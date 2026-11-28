'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../evaluation/2026-11/agent49-policy-protocol.cjs');
const {createKnockoutTurnTracker}=require('./agent8-ko-turn-tracker.cjs');
const {bindHostVerifiedLastOpponentKO,CERT_VERSION}=require('./agent8-rank30-ko-receipt-bridge.cjs');
const {createPolicy,POLICY_VERSION}=require('../evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.cjs');
const PSY='Psychic Energy MEE 13',CLEF="Lillie's Clefairy ex JTG 56";
const LIVE=[{abilityName:'Fairy Zone',suppressed:false,
  reasonCode:null,sourcePrinting:null}];
function request(seat,turn,ko={any:true,byAttack:true}){
  const active={printing:'Latias ex SSP 76',
    energies:[PSY,PSY],hp:210,damage:0};
  const bench=[{printing:CLEF,abilities:['Fairy Zone'],
    abilitySuppressions:LIVE,energies:[]}];
  const o={actorSeat:seat,globalTurn:turn,decisionKind:'owner-root',
    ownHand:['Raihan EVS 152'],ownTurnResources:{
      supporterPlayedTurn:0,supporterPlayLocked:false,
      energyPlayedTurn:0,retreatedTurn:0,vstarUsed:true},
    ownPublic:{active,bench,deckCount:23,prizeCount:2,discard:[PSY]},
    opponentPublic:{active:{printing:'Regidrago VSTAR SIT 136',
      hp:280,damage:0,printed:{types:['Dragon']}},
      bench:[],deckCount:20,prizeCount:3}};
  const event=(p)=>({printing:p.printing,
    movedFromBenchToActiveThisTurn:null,knownAbilityUse:[]});
  const receipt={version:protocol.EVENT_RECEIPT_VERSION,
    actorSeat:seat,turn,ownerActive:event(active),
    ownerBench:bench.map(event),priorOpponentTurnKO:ko,
    opponentLastTurnAttack:null,
    opponentLastTurnTurn:null,opponentLastTurnAttacks:null};
  protocol.validatePublicEventReceipt(receipt,o);
  return {role:'opponent',seat,observation:o,
    publicEventReceipt:receipt,prompt:null,actionFrontier:{items:[
      {kind:'play-card',actorPrinting:'Raihan EVS 152',token:'raihan'},
      {kind:'pass',token:'pass'}]}};
}
function decision(req){
  return createPolicy({role:'opponent',seat:req.seat,
    policyVersion:POLICY_VERSION,config:{}}).decide(req);
}
for(const seat of [0,1]){
  const owner=seat===0?'Alice':'Bob',opponent=seat===0?'Bob':'Alice';
  test('seat '+seat+' authenticated KO from older opponent turn enables Raihan on own extra turn',()=>{
    const tracker=createKnockoutTurnTracker(0);
    tracker.record({turn:2,victimPlayerId:owner,
      attackerPlayerId:opponent,byAttack:true});
    tracker.completeTurn(2,opponent);
    tracker.completeTurn(3,owner);
    tracker.completeTurn(4,owner);
    const req=request(seat,5);
    assert.notDeepEqual(decision(req),{kind:'select-action',token:'raihan'});
    const enriched=bindHostVerifiedLastOpponentKO(req,{tracker,
      ownerPlayerId:owner,opponentPlayerId:opponent});
    const cert=enriched.publicEventReceipt.hostAuthenticatedPriorOpponentTurnKO;
    assert.equal(cert.version,CERT_VERSION);
    assert.equal(cert.lastOpponentTurn,2);
    assert.equal(cert.lastOpponentTurnVerified,true);
    assert.equal(cert.any,true);
    assert.deepEqual(decision(enriched),{kind:'select-action',token:'raihan'});
    // The mutated object remains PRIVATE and cannot be echoed as a V3 receipt.
    assert.throws(()=>protocol.validatePublicEventReceipt(
      enriched.publicEventReceipt,req.observation),protocol.ProtocolError);
    protocol.validatePublicEventReceipt(req.publicEventReceipt,req.observation);
    assert.equal(Object.hasOwn(req.publicEventReceipt,
      'hostAuthenticatedPriorOpponentTurnKO'),false);
  });
  test('seat '+seat+' a KO on prior opponent turn followed by no-KO extra opponent turn forbids Raihan',()=>{
    const tracker=createKnockoutTurnTracker(0);
    tracker.record({turn:2,victimPlayerId:owner,
      attackerPlayerId:opponent,byAttack:true});
    tracker.completeTurn(2,opponent);
    tracker.completeTurn(3,opponent);
    const req=request(seat,4,{any:true,byAttack:true});
    const enriched=bindHostVerifiedLastOpponentKO(req,{tracker,
      ownerPlayerId:owner,opponentPlayerId:opponent});
    const cert=enriched.publicEventReceipt.hostAuthenticatedPriorOpponentTurnKO;
    assert.deepEqual([cert.lastOpponentTurn,cert.any,cert.byAttack],[3,false,false]);
    assert.notDeepEqual(decision(enriched),{kind:'select-action',token:'raihan'});
  });
  test('seat '+seat+' native KO on immediately preceding opponent turn remains valid',()=>{
    const tracker=createKnockoutTurnTracker(0);
    tracker.record({turn:2,victimPlayerId:owner,
      attackerPlayerId:opponent,byAttack:true});
    tracker.completeTurn(2,opponent);
    const enriched=bindHostVerifiedLastOpponentKO(request(seat,3),{
      tracker,ownerPlayerId:owner,opponentPlayerId:opponent});
    assert.deepEqual(decision(enriched),{kind:'select-action',token:'raihan'});
  });
  test('seat '+seat+' missing/uncertain or unknown-owner history fails closed',()=>{
    const tracker=createKnockoutTurnTracker(0);
    tracker.record({turn:2,victimPlayerId:owner,
      attackerPlayerId:opponent,byAttack:true});
    tracker.completeTurn(2,opponent);
    const req=request(seat,4);
    const unchanged=bindHostVerifiedLastOpponentKO(req,{tracker,
      ownerPlayerId:owner,opponentPlayerId:opponent});
    assert.equal(unchanged,req);
    assert.notDeepEqual(decision(unchanged),{kind:'select-action',token:'raihan'});
    tracker.completeTurn(3);
    assert.equal(bindHostVerifiedLastOpponentKO(req,{tracker,
      ownerPlayerId:owner,opponentPlayerId:opponent}),req);
  });
  test('seat '+seat+' host adapter rejects incoming forged private extension',()=>{
    const tracker=createKnockoutTurnTracker(0);
    tracker.completeTurn(2,opponent);
    const req=request(seat,3,{any:false,byAttack:false});
    req.publicEventReceipt.hostAuthenticatedPriorOpponentTurnKO={
      version:CERT_VERSION,actorSeat:seat,observationTurn:3,
      lastOpponentTurn:2,lastOpponentTurnVerified:true,any:true,byAttack:true};
    assert.throws(()=>bindHostVerifiedLastOpponentKO(req,{
      tracker,ownerPlayerId:owner,opponentPlayerId:opponent}),
      protocol.ProtocolError);
  });
  test('seat '+seat+' host certificates cannot be reused after another turn',()=>{
    const tracker=createKnockoutTurnTracker(0);
    tracker.record({turn:2,victimPlayerId:owner,
      attackerPlayerId:opponent,byAttack:true});
    tracker.completeTurn(2,opponent);
    const enriched=bindHostVerifiedLastOpponentKO(request(seat,3),{
      tracker,ownerPlayerId:owner,opponentPlayerId:opponent});
    enriched.observation.globalTurn=4;
    assert.notDeepEqual(decision(enriched),{kind:'select-action',token:'raihan'});
  });
}

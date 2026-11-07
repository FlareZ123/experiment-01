'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {publicPrizeTrainerPrerequisite,VERSION:PRIZE_VERSION}=
  require('../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs');
const {VERSION,publicTrainerNecessaryV3,
  screenOwnerTrainerPaperNecessitiesV3}=
  require('../simulation/evaluation/agent44-m4-public-prerequisite.cjs');

/** @param {string[]} hand @param {number} seat @param {number} prizes @param {number} count */
const view=(hand,seat,prizes,count)=>({
  decisionKind:'owner-root',actorSeat:seat,globalTurn:7,
  ownHand:hand,ownPublic:{prizeCount:6},
  opponentPublic:{prizeCount:prizes,handCount:count}
});
const row=(handIndex,printing,type='Item')=>({handIndex,printing,type});

test('two seats, both source/engine aliases, exact Prize and hand boundary',()=>{
  for(const seat of [0,1]){
    for(const printing of ['Special Red Card M4','Special Red Card CRI']){
      for(const prizes of [6,4,3,1,0]){
        for(const count of [0,1,4]){
          const v=view([printing],seat,prizes,count);
          const r=publicTrainerNecessaryV3(v,row(0,printing));
          const expected=prizes>3||count===0;
          assert.equal(r.version,VERSION);
          assert.equal(r.priorVersion,PRIZE_VERSION);
          assert.equal(r.blocked,expected);
          assert.equal(r.paperPlayable,expected?false:null);
          assert.deepEqual(r.blockedReasons,[
            ...(prizes>3?['public-prize-prerequisite-failed']:[]),
            ...(count===0?['public-opponent-hand-empty']:[])
          ]);
          assert.equal(r.observedOpponentHandCount,count);
          assert.equal(r.anyPaperPlayCertified,false);
        }
      }
    }
  }
});

test('Prize-only v2 historical output remains unchanged; hand-zero v3 closes its actual gap',()=>{
  const printing='Special Red Card M4';
  const v=view([printing],0,3,0);
  const r=row(0,printing);
  const before=publicPrizeTrainerPrerequisite(v,r);
  const corrected=publicTrainerNecessaryV3(v,r);
  assert.equal(before.blocked,false);
  assert.equal(before.paperPlayable,null);
  assert.equal(corrected.blocked,true);
  assert.equal(corrected.paperPlayable,false);
  assert.equal(corrected.reason,'public-opponent-hand-empty');
  assert.deepEqual(publicPrizeTrainerPrerequisite(v,r),before);
});

test('non-M4 printing retains exact historical v2 output and unknown remains unknown',()=>{
  for(const printing of ['Counter Catcher PAR','Roxanne ASR','Quick Ball FST']){
    const v=view([printing],1,3,0);
    const r=row(0,printing,printing==='Roxanne ASR'?'Supporter':'Item');
    assert.deepEqual(publicTrainerNecessaryV3(v,r),
      publicPrizeTrainerPrerequisite(v,r));
  }
});

test('only detached public opponent count can influence hand rule',()=>{
  const printing='Special Red Card M4';
  const hidden=view([printing],0,3,0);
  Object.defineProperty(hidden,'opponentHand',{get(){
    throw Error('private-opponent-hand-read');
  }});
  Object.defineProperty(hidden,'opponentDeck',{get(){
    throw Error('private-opponent-deck-read');
  }});
  Object.defineProperty(hidden,'opponentPrizeIdentities',{get(){
    throw Error('private-opponent-prize-read');
  }});
  assert.equal(publicTrainerNecessaryV3(hidden,row(0,printing)).blocked,true);
  const positive=view([printing],0,3,1);
  assert.equal(publicTrainerNecessaryV3(positive,row(0,printing)).blocked,false);
  assert.throws(()=>publicTrainerNecessaryV3(
    {...positive,decisionKind:'owner-prompt'},row(0,printing)));
  assert.throws(()=>publicTrainerNecessaryV3(
    {...positive,opponentPublic:{prizeCount:3}},row(0,printing)),
  /Public opponent hand count required/);
  assert.throws(()=>publicTrainerNecessaryV3(
    {...positive,opponentPublic:{prizeCount:3,handCount:-1}},row(0,printing)));
  assert.throws(()=>publicTrainerNecessaryV3(positive,row(0,printing,'Supporter')));
});

test('multi-copy screen counts union of proven Prize and hand blockers exactly',()=>{
  const hand=['Special Red Card M4','Special Red Card CRI',
    'Counter Catcher PAR','Quick Ball FST'];
  const rows=[row(0,hand[0]),row(1,hand[1]),
    row(2,hand[2]),row(3,hand[3])];
  const v=view(hand,1,3,0);
  const audit=screenOwnerTrainerPaperNecessitiesV3(v,rows);
  assert.equal(audit.heldTrainerCopies,4);
  assert.equal(audit.exactPrintedRulesSeen,3);
  assert.equal(audit.provenPrizeBlockedCopies,1);
  assert.equal(audit.provenEmptyOpponentHandBlockedCopies,2);
  assert.equal(audit.provenPaperBlockedCopies,3);
  assert.equal(audit.remainingNotDisprovenCopies,1);
  assert.equal(audit.anyPaperPlayableTrainerCertified,false);
  assert.equal(audit.competitiveGameQualified,false);
  assert.deepEqual(audit.rows.map(r=>r.paperPlayable),
    [false,false,false,null]);
  assert.throws(()=>screenOwnerTrainerPaperNecessitiesV3(v,
    [rows[0],rows[0]]),/Repeated physical owner hand index/);
  const normal=screenOwnerTrainerPaperNecessitiesV3(view(hand,1,3,1),rows);
  assert.equal(normal.provenEmptyOpponentHandBlockedCopies,0);
  assert.equal(normal.provenPaperBlockedCopies,1);
});

test('report both disjoint and overlapping block reasons without double-counting',()=>{
  const printing='Special Red Card M4';
  const rows=[row(0,printing),row(1,printing)];
  const sample=view([printing,printing],0,6,0);
  const audit=screenOwnerTrainerPaperNecessitiesV3(sample,rows);
  assert.equal(audit.provenPrizeBlockedCopies,2);
  assert.equal(audit.provenEmptyOpponentHandBlockedCopies,2);
  assert.equal(audit.provenPaperBlockedCopies,2);
  assert.equal(audit.remainingNotDisprovenCopies,0);
  for(const r of audit.rows)assert.equal(r.blockedReasons.length,2);
});

'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {FROZEN,auditNativeResult}=require('../scripts/agent10-audit-rank11-letter-aba-native.cjs');

const ko=[[7,"Lillie's Clefairy ex"],[13,'Dialga-GX'],
  [21,'Trevenant & Dusknoir-GX']];
function attack(turn,gain,name,seat=1){
  const before=[6,6],settled=[6,6];settled[seat]-=gain;
  const board=[{active:{name:'Other'}},{active:{name:'Other'}}];
  board[1-seat].active.name=name;
  return {triggerPlayerSlot:seat,triggerAction:'AttackAction',
    turnBefore:turn,declarations:[{attackName:'Energy Drive'}],
    beforePrizesRemaining:before,before:board,
    settled:{prizesRemaining:settled}};
}
function fixture(){
  const rows=[];
  for(const [context,digest] of Object.entries(FROZEN.sourceDeals)){
    const first=context==='11:401:A:champion-reference';
    const other401=context==='11:401:A:new-moon-lockbreaker-v1';
    const other402=context==='11:402:B:new-moon-lockbreaker-v1';
    const seat=context.includes(':A:')?1:0;
    for(const mode of ['control-a','tutor-after-pass','control-b']){
      const treatment=mode==='tutor-after-pass';
      const letter=treatment&&(first||other401||other402);
      const events=first&&treatment?
        [attack(3,0,'Clefairy'),attack(5,0,'Clefairy'),
          attack(7,2,ko[0][1]),attack(9,0,'Dialga'),
          attack(11,0,'Dialga'),attack(13,2,ko[1][1]),
          attack(15,0,'Trevenant'),attack(17,0,'Trevenant'),
          attack(19,0,'Trevenant'),attack(21,2,ko[2][1])]:[];
      rows.push({contextId:context,mode,sourceSeat:seat,
        sourceDealMatchesHistoric:true,sourceDealDigest:digest,
        status:'native-terminal',error:null,
        initialFullPhysicalDealDigest:'physical-'+context,
        rootActionLedgerSha:treatment?'treatment':'identical',
        actualNativeWinner:first?(treatment?1:0):
          other401?1:1,
        actualNativeFinalPrizesRemaining:first&&treatment?[6,0]:[6,6],
        tutorOptIn:treatment,
        sourceNativeAttackCount:events.length,
        sourceNativeLetterPlayCount:letter?1:0,
        sourcePrizesFromSettledNativeAttacks:first&&treatment?6:0,
        publicAttackTransitions:events,
        tutorAudit:treatment?{examples:letter?[{
          kind:'prompt',printing:'Professors Letter BKT',
          nativeAccepted:true,physicalMovementConfirmed:true,
          selected:['Darkness Energy MEE','Darkness Energy MEE']
        }]:[]}:null});
    }
  }
  return {schema:FROZEN.schema,pinnedEngine:FROZEN.twinleaf,
    attemptedArms:12,competitiveQualifiedGames:0,rows};
}
test('full frozen first source K0 deal, real Energy custody and three settled two-Prize knockouts',()=>{
  const x=auditNativeResult(fixture());
  assert.equal(x.sourceDealMatchedContexts,4);
  assert.equal(x.treatmentLetterItems,3);
  assert.equal(x.treatmentConfirmedDarknessCards,6);
  assert.equal(x.observedNativeWinnerReversals,1);
  assert.equal(x.competitivelyQualifiedGames,0);
  assert.deepEqual(x.cases[0].sourceSettledPrizeGains,[0,6,0]);
  assert.deepEqual(x.cases[0].treatmentPositivePrizeGains.map(e=>e.turn),
    [7,13,21]);
});
test('physical source mismatch and repeated-control nonidentity fail closed',()=>{
  const a=fixture();a.rows[1].sourceDealDigest='tampered';
  assert.throws(()=>auditNativeResult(a));
  const b=fixture();b.rows[2].rootActionLedgerSha='tampered';
  assert.throws(()=>auditNativeResult(b));
});
test('settlement and real owner prompt receipt are mandatory',()=>{
  const a=fixture();
  a.rows[1].publicAttackTransitions[2].settled.prizesRemaining=[6,6];
  assert.throws(()=>auditNativeResult(a));
  const b=fixture();
  delete b.rows[1].publicAttackTransitions[0].settled;
  assert.throws(()=>auditNativeResult(b));
  const c=fixture();
  c.rows[1].tutorAudit.examples[0].selected[0]='Psychic Energy CRE';
  assert.throws(()=>auditNativeResult(c));
});

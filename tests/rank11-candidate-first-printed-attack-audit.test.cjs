'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditCandidateFirstPrintedAttacks}=require(
  '../scripts/rank11-candidate-first-printed-attack-audit.cjs');

function fixture(){
  const candidates=['new-moon-generic',
    'new-moon-horror-compressor','new-moon-blower-horror-compressor'];
  const snapshots={
    'second-a':{seed:1769876458,active:'Mewtwo & Mew-GX',
      attack:'Miraculous Duo-GX',energy:['Psychic Energy','Telepathic Psychic Energy']},
    'second-b':{seed:2809154458,active:'Galarian Articuno V',
      attack:'Psyray',energy:['Psychic Energy']}
  };
  const attempts=[];
  for(const [sourceSeedIdentity,s] of Object.entries(snapshots)) {
    for(const candidate of candidates) {
      const passes=[3,5].map(turnBefore=>{
        const unownCount=sourceSeedIdentity==='second-a'?1:3;
        const benchSize=turnBefore===5?5:(sourceSeedIdentity==='second-a'?4:3);
        const bench=Array.from({length:unownCount},()=>({name:'Unown'}));
        while(bench.length<benchSize)bench.push({name:'Duskull'});
        return ({
        playerSlot:1,action:'PassTurnAction',turnBefore,
        actionOrdinal:turnBefore*10,
        decisionHandBefore:{ownHandPrintings:['Battle VIP Pass FST']},
        publicBoardBeforePass:[
          {bench:[{name:'Garbodor',toolCards:['Muscle Band']}],stadium:[]},
          {active:{name:s.active,energyCards:s.energy,
            printedAttacks:[{name:s.attack,cost:[5,5,9]}]},bench,stadium:[]}
        ]
      });});
      attempts.push({sourceSeedIdentity,seed:s.seed,candidate,
        status:'engine-observed',startVerified:true,actualSourceFirst:false,
        sourcePolicyCompleted:true,nextTurnLockWitness:{equippedGarbodor:true},
        candidateAttackDeclarationCount:0,candidateEarlyDecisions:passes});
    }
  }
  return {schema:'rank11-direct-held-shake-candidate-attack-window-source-v2',
    sourceRank:11,sourceSeat:0,candidateSeat:1,qualifiedCompetitiveGames:0,attempts};
}

test('audits exactly twelve early source Pass observations, without a win claim',()=>{
  const out=auditCandidateFirstPrintedAttacks(fixture());
  assert.equal(out.earlyPassSnapshots,12);
  assert.equal(out.fullFiveSlotBenchesAtTurnFive,6);
  assert.equal(out.retrospectiveSourceDeals,2);
  assert.equal(out.allInsufficientForPrintedAttack,true);
  assert.equal(out.allHeldFieldBlower,false);
  assert.equal(out.qualifiedCompetitiveGames,0);
  assert.deepEqual(new Set(out.observations.map(x=>x.activePokemon)),
    new Set(['Mewtwo & Mew-GX','Galarian Articuno V']));
});

test('rejects removed Garbotoxin Tool, extra Energy and unfamiliar Special Energy',()=>{
  const a=fixture();
  a.attempts[0].candidateEarlyDecisions[0]
    .publicBoardBeforePass[0].bench[0].toolCards=[];
  assert.throws(()=>auditCandidateFirstPrintedAttacks(a),/Tool witness/);
  const b=fixture();
  b.attempts[0].candidateEarlyDecisions[0]
    .publicBoardBeforePass[1].active.energyCards.push('Psychic Energy');
  assert.throws(()=>auditCandidateFirstPrintedAttacks(b),/Insufficient-Energy/);
  const c=fixture();
  c.attempts[0].candidateEarlyDecisions[0]
    .publicBoardBeforePass[1].active.energyCards=['Double Colorless Energy'];
  assert.throws(()=>auditCandidateFirstPrintedAttacks(c),/Unknown Energy-card multiplicity/);
});

test('rejects missing and misattributed actual Pass observations',()=>{
  const a=fixture();a.attempts.pop();
  assert.throws(()=>auditCandidateFirstPrintedAttacks(a),/six preidentified/);
  const b=fixture();b.attempts[0].candidateAttackDeclarationCount=1;
  assert.throws(()=>auditCandidateFirstPrintedAttacks(b));
  const c=fixture();c.attempts[0].candidateEarlyDecisions[0].playerSlot=0;
  assert.throws(()=>auditCandidateFirstPrintedAttacks(c),/Pass turns changed/);
  const d=fixture();d.attempts[0].actualSourceFirst=true;
  assert.throws(()=>auditCandidateFirstPrintedAttacks(d));
});


test('rejects an opened Bench, missing Unown and newly played Stadium',()=>{
  const a=fixture();
  a.attempts[0].candidateEarlyDecisions[1].publicBoardBeforePass[1].bench.pop();
  assert.throws(()=>auditCandidateFirstPrintedAttacks(a),/Bench size changed/);
  const b=fixture();
  b.attempts[0].candidateEarlyDecisions[0].publicBoardBeforePass[1].bench[0].name='Solrock';
  assert.throws(()=>auditCandidateFirstPrintedAttacks(b),/Unown presence changed/);
  const c=fixture();
  c.attempts[0].candidateEarlyDecisions[0].publicBoardBeforePass[1].stadium.push('Sky Field');
  assert.throws(()=>auditCandidateFirstPrintedAttacks(c),/no Stadium/);
});

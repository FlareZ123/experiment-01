'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditPreRetreatUnownAttackPayment}=require(
  '../scripts/rank11-unown-pre-retreat-payment-audit.cjs');

function fixture() {
  const candidates=[
    'new-moon-generic','new-moon-horror-compressor',
    'new-moon-blower-horror-compressor'
  ];
  return {
    schema:'rank11-direct-held-shake-candidate-attack-window-source-v2',
    sourceRank:11,sourceSeat:0,candidateSeat:1,qualifiedCompetitiveGames:0,
    attempts:candidates.map(candidate=>({
      sourceSeedIdentity:'second-b',candidate,seed:2809154458,
      status:'engine-observed',startVerified:true,actualSourceFirst:false,
      sourcePolicyCompleted:true,candidateAttackDeclarationCount:0,
      candidateEarlyDecisions:[
        {turnBefore:3,playerSlot:1,actionOrdinal:25,action:'PlayCardAction',
          card:'Psychic Energy'},
        {turnBefore:3,playerSlot:1,actionOrdinal:26,action:'RetreatAction',
          retreatTransition:{
            fromActive:{name:'Unown',energyCards:['Psychic Energy'],
              printedAttacks:[{name:'Hidden Power',cost:[9]}]},
            actualActiveAfter:{name:'Galarian Articuno V',energyCards:['Psychic Energy']},
            benchAfter:[{name:'Unown',energyCards:[]}]
          }},
        {turnBefore:3,playerSlot:1,actionOrdinal:27,action:'PassTurnAction',
          publicBoardBeforePass:[{},{
            active:{name:'Galarian Articuno V',energyCards:['Psychic Energy'],
              printedAttacks:[{name:'Psyray',cost:[5,9,9]}]}
          }]}
      ]
    }))
  };
}

test('the archived pre-retreat Unown has payable printed Hidden Power',()=>{
  const x=auditPreRetreatUnownAttackPayment(fixture());
  assert.equal(x.witnesses.length,3);
  assert.equal(x.retrospectiveSourceDeals,1);
  assert.equal(x.attackPaymentWitnesses,3);
  assert.equal(x.independentCompetitiveGamesQualified,0);
  assert.deepEqual(new Set(x.witnesses.map(row=>row.chosenRootAction)),
    new Set(['RetreatAction']));
  assert.ok(x.witnesses.every(row=>
    row.printedAttackEnergyPaymentSatisfied===true &&
    row.promotedAttackEnergyPaymentSatisfied===false));
});

test('rejects a missing pre-retreat attachment or changed attack cost',()=>{
  const a=fixture();
  a.attempts[0].candidateEarlyDecisions.shift();
  assert.throws(()=>auditPreRetreatUnownAttackPayment(a));
  const b=fixture();
  b.attempts[0].candidateEarlyDecisions[1]
    .retreatTransition.fromActive.printedAttacks[0].cost=[5,9];
  assert.throws(()=>auditPreRetreatUnownAttackPayment(b));
});

test('rejects a changed printed Energy, actual turn or post-retreat resource state',()=>{
  const a=fixture();
  a.attempts[1].candidateEarlyDecisions[1]
    .retreatTransition.fromActive.energyCards=[];
  assert.throws(()=>auditPreRetreatUnownAttackPayment(a));
  const b=fixture();
  b.attempts[0].candidateEarlyDecisions[2].turnBefore=5;
  assert.throws(()=>auditPreRetreatUnownAttackPayment(b));
  const c=fixture();
  c.attempts[0].candidateEarlyDecisions[1]
    .retreatTransition.actualActiveAfter.name='Unown';
  assert.throws(()=>auditPreRetreatUnownAttackPayment(c));
});

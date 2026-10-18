'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {SEEDS,VARIANTS,auditFirstTurnVipNonuse}=require(
  '../scripts/rank11-newmoon-firstturn-vip-availability-audit.cjs');

function fixture() {
  const attempts=[];
  for(const [sourceSeedIdentity,expected] of Object.entries(SEEDS)) {
    for(const candidate of VARIANTS) {
      const played=expected.firstTurnCards.map((card,index)=>({
        turnBefore:1,playerSlot:1,actionOrdinal:index+1,
        action:'PlayCardAction',card
      }));
      const pass={
        turnBefore:1,playerSlot:1,actionOrdinal:played.length+1,
        action:'PassTurnAction'
      };
      const ownHand=sourceSeedIdentity==='second-a' ?
        ['Dusclops SFA','Battle VIP Pass FST'] :
        ['Battle VIP Pass FST','Battle VIP Pass FST','Fog Crystal CRE',
          'Psychic Energy MEE','Rescue Carrier EVS'];
      attempts.push({
        sourceSeedIdentity,candidate,seed:expected.seed,
        status:'engine-observed',startVerified:true,actualSourceFirst:false,
        actualFirstTurnSlot:1,sourcePolicyCompleted:true,
        candidateAttackDeclarationCount:0,
        candidateOpeningDecisions:[...played,pass],
        candidatePassDecisions:[{
          turnBefore:1,ownHandPrintings:ownHand,
          ownPublicBoard:{
            active:{name:expected.active},
            bench:Array.from({length:expected.bench},()=>({name:'Unown'})),
            stadium:[]
          },
          opposingPublicBoard:{
            active:{name:expected.opponentActive},
            bench:[{name:'Trubbish'}],
            stadium:[]
          }
        }]
      });
    }
  }
  return {schema:'rank11-direct-held-shake-candidate-attack-window-source-v2',
    sourceRank:11,sourceSeat:0,candidateSeat:1,qualifiedCompetitiveGames:0,
    attempts};
}

test('six complete first-turn sources preserve nine unspent VIP copies',()=>{
  const x=auditFirstTurnVipNonuse(fixture());
  assert.equal(x.retrospectiveSourceDeals,2);
  assert.equal(x.policyArmRepetitions,6);
  assert.equal(x.unspentVipCopiesAcrossRepeatedArms,9);
  assert.equal(x.independentCompetitiveGamesQualified,0);
  assert.deepEqual(new Set(x.observations.map(r=>r.minimumRemainingBasicPokemonInDeck)),
    new Set([8,7]));
  assert.deepEqual(new Set(x.observations.map(r=>r.freeBenchSlots)),
    new Set([3,2]));
});

test('fails closed when first-turn source plays VIP or has no unused copies',()=>{
  const a=fixture();
  a.attempts[0].candidateOpeningDecisions.splice(0,0,{
    turnBefore:1,playerSlot:1,action:'PlayCardAction',card:'Battle VIP Pass'
  });
  assert.throws(()=>auditFirstTurnVipNonuse(a));
  const b=fixture();
  b.attempts[0].candidatePassDecisions[0].ownHandPrintings.pop();
  assert.throws(()=>auditFirstTurnVipNonuse(b));
});

test('requires own source openings, true turn order and unchanged Bench count',()=>{
  const a=fixture();a.attempts[0].actualFirstTurnSlot=0;
  assert.throws(()=>auditFirstTurnVipNonuse(a));
  const b=fixture();b.attempts[0].candidatePassDecisions[0].ownPublicBoard.bench.pop();
  assert.throws(()=>auditFirstTurnVipNonuse(b));
  const c=fixture();c.attempts[0].candidatePassDecisions[0].opposingPublicBoard.bench[0].name='Vileplume';
  assert.throws(()=>auditFirstTurnVipNonuse(c));
});

test('rejects missing arm, card identities and duplicated policy arm',()=>{
  const a=fixture();a.attempts.pop();
  assert.throws(()=>auditFirstTurnVipNonuse(a));
  const b=fixture();b.attempts[0].candidateOpeningDecisions[0].card='Battle Compressor';
  assert.throws(()=>auditFirstTurnVipNonuse(b));
  const c=fixture();c.attempts[0].candidate= c.attempts[1].candidate;
  assert.throws(()=>auditFirstTurnVipNonuse(c));
});

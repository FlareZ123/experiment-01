'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditVipArchive}=require('../scripts/agent7-newmoon-vip-archive-audit.cjs');
const {deriveSlotSeeds}=require('../scripts/aichi-decorrelated-seeds.cjs');

function fixture(){
  const rows=[];
  for(const rank of [6,11])for(let repeat=0;repeat<4;repeat++){
    const seeds=deriveSlotSeeds(20261019,'pilot',rank,repeat);
    for(const seat of ['A','B']){
      const candidateEngineSeat=seat==='A'?0:1;
      const index=rows.length,offer=index<4;
      const events=offer?[
        {kind:'real-hand-first-own-VIP-offer',legal:true},
        {kind:'validated-owner-deck-targets',names:['Mewtwo & Mew-GX UNM']},
        {kind:'post-dispatch-public-bench',names:['Mewtwo & Mew-GX UNM']}]:[];
      rows.push({trialId:'newmoon-vip-v1:rank'+rank+':repeat'+repeat+':seat'+seat,
        rank,repeat,candidateSeat:seat,candidateEngineSeat,seed:seeds[seat],
        candidateDigest:'candidate',sourceDigest:'source'+rank,
        engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
        competitiveQualification:false,status:'original-and-candidate-policy-bounded',
        firstTurnSlot:index%3===0?1-candidateEngineSeat:candidateEngineSeat,
        candidateActuallyFirst:index%3!==0,cardConservationVerified:true,
        verifiedByDrawLog:true,baseline:{actions:90,firstOwnTurnActions:[]},
        alternative:{actions:90,firstOwnTurnActions:[]},
        policyAudit:{version:'newmoon-first-own-vip-v1',candidateSeat:candidateEngineSeat,
          selectedLegalVip:offer,validatedSearchSelection:offer,events}});
    }
  }
  return {schema:'newmoon-first-own-vip-prospective-mechanical-exposure-v1',
    registration:{enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      seedBase:20261019,maxActions:90,repeatsPerRankAndSeat:4,
      ranks:[6,11],seats:['A','B'],
      pairedPolicies:['unchanged-weak-profile','newmoon-first-own-vip-v1']},
    sourceEngineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registeredSourceDeals:16,observedAttempts:16,observations:rows,
    plannedIds:rows.map(x=>x.trialId),falseOrFailedAttempts:0,
    candidatePrinted60Digest:'candidate',
    opponentPrinted60Digests:{6:'source6',11:'source11'},
    competitivelyQualifiedGames:0,verifiedActualStartingOrders:16,
    legalVIPDispatches:4,ownerPromptValidSelections:4};
}
test('all registered trials and native event cells are preserved',()=>{
  const out=auditVipArchive(fixture());
  assert.equal(out.attempts,16);
  assert.equal(out.nativeOffers,4);
  assert.equal(out.postDispatchBench,4);
  assert.equal(out.cells.reduce((s,x)=>s+x.attempts,0),16);
});
test('rejects seed drift, repeated ID and missing row',()=>{
  for(const mutate of [
    x=>x.observations[0].seed++,
    x=>x.observations[2].trialId=x.observations[0].trialId,
    x=>x.observations.pop()
  ]){const v=fixture();mutate(v);assert.throws(()=>auditVipArchive(v));}
});
test('rejects unsupported owner choice and post-dispatch Bench',()=>{
  const a=fixture();
  a.observations[4].policyAudit.events.push({
    kind:'validated-owner-deck-targets',names:['Mewtwo & Mew-GX UNM']});
  a.observations[4].policyAudit.validatedSearchSelection=true;
  assert.throws(()=>auditVipArchive(a),/without a legal VIP offer/);
  const b=fixture();
  b.observations[0].policyAudit.events[2].names=['Gengar & Mimikyu-GX TEU'];
  assert.throws(()=>auditVipArchive(b),/Public Bench missing/);
});
test('reports unresolved Bench without pretending physical settlement',()=>{
  const a=fixture();a.observations[0].policyAudit.events.pop();
  const out=auditVipArchive(a);
  assert.equal(out.ownerSelections,4);
  assert.equal(out.postDispatchBench,3);
  assert.equal(out.postDispatchUnverified,1);
});

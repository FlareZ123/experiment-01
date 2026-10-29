'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runWithResearchProfile,EXPANDED_SOURCE_PROFILE}=
  require('./policy-profiles.cjs');
const {withActorOnlyRootPolicy}=
  require('./agent34-actor-only-root-policy.cjs');
const {SEEDS,MAX_ACTIONS}=
  require('./agent48-firstturn-carmine-native-probe.cjs');
const carmine=require('./agent48-conservative-first-carmine.cjs');

/** 
 * Exact owner-visible actor-root snapshots when held Carmine is encountered.
 * Preserve every first-turn source hand, including costly non-Carmine cards.
 * No expected value or DCI score is claimed.
 *
 * @param {object} view Detached actor observation.
 * @returns {object|null}
 */
function exposed(view){
  assert.equal(view?.decisionKind,'owner-root');
  if(view.globalTurn!==1||!view.ownHand.includes(carmine.CARMINE))
    return null;
  const hand=view.ownHand.slice();
  const others=hand.filter(p=>p!==carmine.CARMINE);
  return {
    actorSeat:view.actorSeat,ownHand:hand,otherPrintings:others,
    otherHandSize:others.length,
    carmines:hand.length-others.length,
    ownDeckCount:view.ownPublic.deckCount,
    ownBenchCount:view.ownPublic.bench.filter(Boolean).length,
    ownActive:view.ownPublic.active?.printing??null,
    attachedEnergies:[
      ...(view.ownPublic.active?.energies??[]),
      ...view.ownPublic.bench.flatMap(p=>p?.energies??[])
    ],
    supporterQuota:view.ownTurnResources.supporterPlayedTurn,
    supporterLocked:view.ownTurnResources.supporterPlayLocked===true
  };
}

/**
 * Source-dealt observational AMR census with a reversible instrumentation
 * hook around the actual owner-only decision module. No injected decisions
 * or altered native Store card effects.
 * @returns {object}
 */
function runAudit(){
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const a=manifest.decks.find(x=>x.rank===1);
  const b=manifest.decks.find(x=>x.rank===11);
  assert.ok(a?.playableUnderEngine&&b?.playableUnderEngine);
  const prior=carmine.chooseConservativeFirstCarmine;
  const rows=[];
  try{
    for(const seed of SEEDS){
      const glimpses=[];
      carmine.chooseConservativeFirstCarmine=view=>{
        const packet=exposed(view);
        if(packet)glimpses.push(packet);
        return prior(view);
      };
      let game=null,audit=null,error=null;
      try{
        const run=withActorOnlyRootPolicy(()=>runWithResearchProfile({
          deckA:a.cardIds,deckB:b.cardIds,seed,
          maxActions:MAX_ACTIONS,
          strictPromptValidation:true,
          grandTreeFirstTurnCorrection:true,
          captureDecisionTrace:false,
          label:'No-intervention Carmine actor-AMR owner-hand exposure'
        },EXPANDED_SOURCE_PROFILE),{carmineFirstRoot:true});
        game=run.result;
        audit=run.audit;
      }catch(e){
        error={name:e?.name??null,message:String(e?.message??e)};
      }
      rows.push({seed,glimpses,
        firstOwnerSeat:game?.firstTurnSlot??null,
        naturallySelected:audit?.typedIntentCounts?.['play-carmine-first']??0,
        error});
    }
  }finally{
    carmine.chooseConservativeFirstCarmine=prior;
  }
  const byDeal=rows.filter(r=>r.glimpses.length>0);
  const minimal=byDeal.map(row=>({
    seed:row.seed,firstOwnerSeat:row.firstOwnerSeat,
    smallestOtherHandSize:Math.min(...row.glimpses.map(x=>x.otherHandSize)),
    smallestHandCandidates:row.glimpses.filter(x=>
      x.otherHandSize===Math.min(...row.glimpses.map(x=>x.otherHandSize)))
      .map(x=>x.otherPrintings)
  }));
  const blocked=new Map();
  for(const x of minimal)
    for(const printing of x.smallestHandCandidates[0]??[])
      blocked.set(printing,(blocked.get(printing)??0)+1);
  return {
    schema:'agent48-24seed-actor-carmine-owner-hand-AMR-v1',
    originalRanks:[1,11],seeds:[...SEEDS],maxActions:MAX_ACTIONS,
    originalRuns:rows.length,
    originalFirstTurnHeldAtObservedActorRoot:byDeal.length,
    actualChosenCarmineRoots:rows.reduce((n,x)=>n+x.naturallySelected,0),
    minOtherHandByObservedDeal:Math.min(...minimal.map(x=>x.smallestOtherHandSize)),
    residualOtherHandSizeDistribution:Object.fromEntries(
      [...new Set(minimal.map(x=>x.smallestOtherHandSize))].sort((a,b)=>a-b)
        .map(v=>[v,minimal.filter(x=>x.smallestOtherHandSize===v).length])
    ),
    residualCardFrequencyAtMinimum:[...blocked].sort((a,b)=>b[1]-a[1])
      .map(([printing,deals])=>({printing,deals})),
    errors:rows.filter(x=>x.error!==null).length,
    qualifiedCompetitiveGames:0,
    minOwnerHandCases:minimal,
    rows,
    interpretation:'These are actual owner-visible held hand snapshots at real actor root decisions. A large residual hand after Basic/Energy play is an AMR blocker for the current all-Carmine safeguard. No private knowledge or opponent secrets are used.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
module.exports={exposed,runAudit};

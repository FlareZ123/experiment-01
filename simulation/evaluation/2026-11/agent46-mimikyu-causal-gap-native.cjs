'use strict';

const {initializeCards,runMatch}=require('../../twinleaf/headless.cjs');
const {sourceDecks}=require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {installMimikyuFundAndPromote}=
  require('../../twinleaf/2026-11/agent46-mimikyu-fund-and-promote.cjs');

// Retrospective native cases identified in the frozen 24-attempt panel;
// never present these as a fresh prospective trial.
const CASES=Object.freeze([
  {seed:589307622,seat:0},
  {seed:538692660,seat:1}
]);

/**
 * Turn-start observation is recorded by headless before bot selection,
 * contains only owner cards and public opponent information.
 * @param {object} item Owner-visible first-root capture.
 * @returns {object} Causal requirements for the Mimikyu Counter-Copycat line.
 */
function summarizeTurn(item){
  const m=item.mimikyu??[];
  const apex=item.previousOpponentAttack?.name==='Apex Dragon';
  const benchMimikyu=m.find(x=>x.location==='bench')??null;
  const activeMimikyu=m.find(x=>x.location==='active')??null;
  const attached=m.map(x=>x.energyPrintings?.length??0);
  const twoEnergy=m.some(x=>(x.energyPrintings?.length??0)>=2);
  return {
    turn:item.turn,apex,previousOpponentAttack:item.previousOpponentAttack,
    usedGX:item.candidateUsedGX,
    mimikyuLocation:m.map(x=>x.location),
    mimikyuAttachedEnergy:attached,
    mimikyuTwoEnergy:twoEnergy,
    activeMimikyu:Boolean(activeMimikyu),
    benchMimikyu: Boolean(benchMimikyu),
    donorDialgaInDiscard:item.ownDialga?.discard??0,
    donorDialgaInHand:item.ownDialga?.hand??0,
    ownerPsychicInHand:(item.candidateHand??[])
      .filter(name=>name.startsWith('Psychic Energy ')).length,
    ownerTurnRequirementsAllVisible:
      apex&&twoEnergy&&Boolean(activeMimikyu)&&
      (item.ownDialga?.discard??0)>0&&item.candidateUsedGX!==true
  };
}

/**
 * Run the exact historical native candidate treatment with only the
 * independent already-shipped turn-start/Store-root read-only observers added.
 * @param {Map<number,object>} byRank Original unchanged rank 1 and 10 60s.
 * @param {number} seed Previously frozen matched-deal seed.
 * @param {0|1} seat Original champion seat.
 * @returns {object} Diagnostic, not a new competitively qualified game.
 */
function inspect(byRank,seed,seat){
  const ranks=seat===0?[1,10]:[10,1],events=[];
  const request={
    deckA:byRank.get(ranks[0]).cardIds,
    deckB:byRank.get(ranks[1]).cardIds,
    seed,maxActions:180,
    label:'Read-only historical Agent46 source Mimikyu causal gap',
    isolatePolicyRandomness:true,
    captureInitialSourceDealFingerprintSeat:seat,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:seat,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true,
    captureCopycatTurnStartSeat:seat,
    captureDecisionTrace:true
  };
  const restore=installMimikyuFundAndPromote({seat,onEvent:e=>{
    if(events.length<128)events.push(e);
  }});
  try{
    const game=runMatch(request);
    const ownerTurns=game.copycatTurnStartEvidence.map(summarizeTurn);
    const apexTurns=ownerTurns.filter(row=>row.apex);
    const roots=(game.rootActionLedger??[]).filter(row=>row.playerSlot===seat&&
      (row.action==='RetreatAction'||row.action==='AttackAction'||
       row.action==='PassTurnAction'));
    return {
      seed,seat,rankOrder:ranks,sourceDeal:game.initialSourceDealFingerprint,
      actions:game.actions,finished:game.finished,turns:game.turns,
      ownerRootActions:roots,
      allOwnerTurnStarts:ownerTurns,
      apexTurnCount:apexTurns.length,
      apexTurnPhysicalRequirements:apexTurns,
      sourceApexDeclarations:game.attackTrace.filter(row=>
        row.seat!==seat&&row.attack==='Apex Dragon').length,
      acceptedCopycatDeclarations:game.attackTrace.filter(row=>
        row.seat===seat&&row.attack==='Copycat').length,
      acceptedRetreatRoots:roots.filter(row=>row.action==='RetreatAction').length,
      proposalSummary:Object.fromEntries([...new Set(events.map(e=>e.kind))]
        .map(kind=>[kind,events.filter(e=>e.kind===kind).length])),
      historicalPolicyOnly:true,competitivePaperGames:0
    };
  }finally{restore();}
}

function run(){
  initializeCards();
  const decks=sourceDecks();
  const rows=CASES.map(({seed,seat})=>inspect(decks,seed,seat));
  const summary={
    schema:'agent46-frozen-mimikyu-apex-response-turn-start-causal-gap-v1',
    retrospectiveOriginalFrozenSeeds:true,originalPrintedRank1And10:true,
    cases:CASES,rows,qualifiedCompetitivePaperGames:0
  };
  console.log(JSON.stringify(summary));
  return summary;
}

if(require.main===module)run();
module.exports={CASES,summarizeTurn,inspect,run};

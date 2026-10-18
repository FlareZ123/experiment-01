'use strict';

const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runWithResearchProfile,EXPANDED_SOURCE_PROFILE}=
  require('./policy-profiles.cjs');

/** Frozen prospective source-dealt rank-2 exposure sample; no outcome selection. */
const SEEDS=Object.freeze([20261023,20261024,20261025,20261026]);
const ACTION_LIMIT=300;

/**
 * Source-root action ledger only. The prompt must be an actual executed
 * response, rather than an unperformed hypothetical or card-access path.
 * @param {object[]} ledger Complete actual Store root-dispatch rows.
 * @param {0|1} seat Physical rank-2 source seat.
 */
function extractGladionRootEvents(ledger,seat){
  const events=[];
  for(let i=0;i<ledger.length;i++){
    const row=ledger[i];
    if(row.playerSlot!==seat||row.action!=='PlayCardAction'||
       row.card!=='Gladion')continue;
    const immediate=ledger[i+1];
    const next=immediate?.playerSlot===seat&&
      immediate.pendingPrompt==='ChoosePrizePrompt'?immediate:null;
    const laterPlay=ledger.slice(i+1).find(e=>
      e.playerSlot===seat&&e.action==='PlayCardAction');
    events.push({
      actionOrdinal:row.actionOrdinal,turn:row.turnBefore,
      prizePromptOrdinal:next?.actionOrdinal??null,
      prizePromptResolved:next?.action==='ResolvePromptAction',
      nextOwnPlayOrdinal:laterPlay?.actionOrdinal??null,
      followUpObserved:next!==undefined&&next.actionOrdinal<=
        (laterPlay?.actionOrdinal??Number.POSITIVE_INFINITY)
    });
  }
  return events;
}

/**
 * @param {{seed:number,rank2Seat:0|1}} trial
 * @param {(request:object,profile:string)=>object} run
 */
function examine(trial,run=runWithResearchProfile){
  const file=path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const source=resolveManifestFile(file,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const ranks=new Map(source.decks.map(d=>[d.rank,d]));
  const rank1=ranks.get(1),rank2=ranks.get(2);
  if(!rank1?.playableUnderEngine||!rank2?.playableUnderEngine)
    throw Error('Need exact source-resolved 60s for rank 1 and rank 2');
  const decks=trial.rank2Seat===0 ?
    [rank2.cardIds,rank1.cardIds]:[rank1.cardIds,rank2.cardIds];
  const game=run({
    deckA:decks[0],deckB:decks[1],seed:trial.seed,
    strictPromptValidation:true,grandTreeFirstTurnCorrection:true,
    captureDecisionTrace:true,maxActions:ACTION_LIMIT,
    label:'Frozen source rank2 Gladion root exposure'
  },EXPANDED_SOURCE_PROFILE);
  if(!Array.isArray(game.rootActionLedger))throw Error('Missing root ledger');
  const played=(game.cardsPlayedBySeat?.[trial.rank2Seat]?.Gladion||0);
  const events=extractGladionRootEvents(game.rootActionLedger,trial.rank2Seat);
  if(events.length!==played)throw Error('Root Gladion play census mismatch');
  return {
    ...trial,rank2SourcePlayer:rank2.player,
    rank1SourcePlayer:rank1.player,engine:game.engine,
    profile:game.researchPolicyProfile,policy:game.policy,
    sourceDeckHashes:game.deckHashes,
    genuineFirstTurnVerified:game.verifiedByDrawLog===true,
    firstTurnSlot:game.firstTurnSlot,
    finished:game.finished,actions:game.actions,turns:game.turns,
    rootDispatches:game.rootActionLedger.length,
    gladionRootPlays:events.length,
    actualGladionChoosePrizeResolutions:events.filter(e=>
      e.prizePromptResolved&&e.followUpObserved).length,
    events,
    competitiveGameQualified:false
  };
}

function runPilot(){
  const trials=SEEDS.flatMap(seed=>[0,1].map(rank2Seat=>({seed,rank2Seat})));
  const games=trials.map(trial=>{
    try{return examine(trial);}catch(error){
      return {...trial,error:String(error?.message||error),
        competitiveGameQualified:false};
    }
  });
  return {
    study:'Aichi rank2 original-60 fixed prospective Gladion actual-root exposures',
    sampleRegistration:'four consecutive literal seeds, both physical seats, no outcome filtering',
    seeds:SEEDS,actionLimit:ACTION_LIMIT,trials:games.length,
    completedDiagnostics:games.filter(g=>!g.error).length,
    errorDiagnostics:games.filter(g=>g.error).length,
    actualGladionRootPlays:games.reduce((s,g)=>s+(g.gladionRootPlays||0),0),
    actualGladionChoosePrizeResolutions:games.reduce((s,g)=>
      s+(g.actualGladionChoosePrizeResolutions||0),0),
    games,
    caveat:'Generic opponent/candidate policies unqualified; source-resolved engine decks are not paper legality or certified mechanics; no win-rate conclusions.'
  };
}
if(require.main===module)console.log(JSON.stringify(runPilot(),null,2));
module.exports={SEEDS,ACTION_LIMIT,extractGladionRootEvents,examine,runPilot};

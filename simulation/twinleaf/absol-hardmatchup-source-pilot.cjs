'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('./headless.cjs');
const RANKS=[8,11,16,22];

/** @param {object} game @param {number} seat */
function summarize(game,seat){
  const opponentSeat=1-seat;
  const starts=(game.copycatTurnStartEvidence||[]).map(s=>{
    const enemy=s.board[opponentSeat],own=s.board[seat];
    const allEnemy=[enemy.active,...enemy.bench].filter(Boolean);
    return {
      turn:s.turn,candidateActive:own.active?.name||null,
      candidateActiveEnergy:own.active?.energyCards||[],
      candidateBench:own.bench.map(p=>({name:p.name,energyCount:p.energyCards.length})),
      opponentActive:enemy.active?.name||null,
      opponentPokemon:allEnemy.map(p=>({name:p.name,toolCards:p.toolCards,energyCards:p.energyCards,damage:p.damage})),
      garbotoxinToolPresent:allEnemy.some(p=>p.name==='Garbodor'&&p.toolCards.length>0),
      candidateFieldBlowerInHand:s.candidateHand.some(n=>n.startsWith('Field Blower ')),
      candidatePsychicInHand:s.candidateHand.filter(n=>n.startsWith('Psychic Energy ')).length,
      prizesRemaining:s.prizeCounts
    };
  });
  return {
    actualFirstSlot:game.firstTurnSlot,verifiedByDrawLog:game.verifiedByDrawLog,
    firstTurnPlayerId:game.firstTurnPlayerId,finished:game.finished,
    engineWinner:game.winner,actions:game.actions,turns:game.turns,
    endReason:game.endReason,prizesRemaining:game.prizesRemaining,deckHashes:game.deckHashes,
    candidatePlayedFieldBlower:Object.entries(game.cardsPlayedBySeat[seat])
      .filter(([name])=>name.startsWith('Field Blower ')).reduce((s,[,n])=>s+n,0),
    candidateUnderworldDoorUses:game.abilityTrace.filter(x=>x.seat===seat&&x.name==='Underworld Door').length,
    opponentAttackAnnouncements:game.attackTrace.filter(x=>x.seat===opponentSeat).map(x=>({
      turn:x.turn,name:x.attack,attacker:x.activePokemon,prizesAfter:x.prizeCountAfter})).slice(0,12),
    candidateAttackAnnouncements:game.attackTrace.filter(x=>x.seat===seat).map(x=>({
      turn:x.turn,name:x.attack,attacker:x.activePokemon,prizesAfter:x.prizeCountAfter})).slice(0,12),
    opponentFirstActions:game.decisionTrace.filter(x=>x.playerSlot===opponentSeat).slice(0,25).map(x=>({
      turn:x.turnBefore,action:x.action,card:x.card||null,attack:x.attack||null,ability:x.ability||null})),
    candidateStarts:starts.slice(0,7),
    sourceObservedGarbotoxinTool:starts.some(x=>x.garbotoxinToolPresent)
  };
}

/** @returns {object} Frozen eight-arm source diagnostic only. */
function run(){
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  assert.equal(plan.candidate.cards?.length,60);
  const rows=[];
  for(const rank of RANKS){
    const source=plan.opponents.find(d=>d.rank===rank);
    assert.equal(source?.status,'ready','source 60 rank '+rank);
    assert.equal(source.cards.length,60);
    for(const candidateSeat of [0,1]){
      const slot=candidateSeat===0?'A':'B';
      const seed=deriveSlotSeeds(20261017,'pilot',rank,0)[slot];
      const req={
        deckA:candidateSeat===0?plan.candidate.cards:source.cards,
        deckB:candidateSeat===1?plan.candidate.cards:source.cards,
        seed,maxActions:450,strictPromptValidation:true,
        forestSealSearchCorrection:true,battleCompressorPositiveSelectionCorrection:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        captureCopycatTurnStartSeat:candidateSeat,
        label:'reference-rank1 vs source-rank'+rank+'-physical-'+slot
      };
      try{
        rows.push({rank,player:source.player,candidateSeat,seed,
          ...summarize(runMatch(req),candidateSeat),qualifiedForCompetitiveInference:false});
      }catch(error){
        rows.push({rank,player:source.player,candidateSeat,seed,
          error:String(error.message),qualifiedForCompetitiveInference:false});
      }
    }
  }
  assert.equal(rows.length,8);
  return {
    experiment:'four-source-Absol-hardmatchup-policy-exposure-v1',
    engine:plan.engineRevision,policy:'pinned generic SimpleTacticsAi; opt-in prompt/Compressor/Stone corrections',
    candidateDigest:plan.candidateDigest,fieldManifestDigest:plan.manifestDigest,
    seedBase:20261017,seedProtocol:'decorrelated-slots-v3',
    qualifiedForCompetitiveInference:false,
    caveat:'Weak generic decisions, incomplete paper fidelity, no independent source-action replay or competent opponent-response acceptance. Engine winners cannot estimate win rates.',
    rows
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.rows.every(row=>row.error))process.exitCode=1;
}
module.exports={summarize,run};

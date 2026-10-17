'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {runMatch,initializeCards} = require('./headless.cjs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

/** @param {string[]} cards */
const sha = cards => crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/**
 * Two predeclared physical-seat rank31 source exposures against the unmodified
 * published rank1 60. Observe opponent actions after selection; no intervention.
 * @returns {object} Bounded policy diagnostic, explicitly unqualified.
 */
function main() {
  const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank1=source.decks.find(d=>d.rank===1);
  const rank31=source.decks.find(d=>d.rank===31);
  assert.ok(rank1 && rank31);
  assert.equal(rank31.player,'Yuhi Yokoyama');
  assert.equal(rank31.cards.find(c=>c.name==='Chimecho')?.count,1);
  const seeds=deriveSlotSeeds(20261016,'published-field',31,0);
  assert.deepEqual(seeds,{A:1098062414,B:1295587841});
  initializeCards();
  const prepared=planAichi({label:'champion-reference',cards:rank1.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const other=prepared.opponents.find(o=>o.rank===31);
  const readiness={
    candidate:prepared.candidate.cards?.length===60,
    rank31:other?.status||null,
    opponentUnresolved:other?.unresolved||[],
    candidateUnresolved:prepared.candidate.unresolved||[]
  };
  if(!readiness.candidate || other?.status!=='ready') {
    return {rank:31,seedProtocol:'decorrelated-slots-v3',
      seeds,readiness,records:[],qualifiedForCompetitiveInference:false};
  }
  const records=[];
  for(const slot of ['A','B']) {
    const championSeat=slot==='A'?0:1;
    const opponentSeat=1-championSeat;
    const deckA=slot==='A'?prepared.candidate.cards:other.cards;
    const deckB=slot==='B'?prepared.candidate.cards:other.cards;
    const identity={rank:31,championPhysicalSlot:slot,
      rank31OpponentSeat:opponentSeat,seed:seeds[slot]};
    try {
      const game=runMatch({
        deckA,deckB,seed:seeds[slot],maxActions:240,
        label:'rank31:chimecho:published-field:0:'+slot,
        strictPromptValidation:true,
        isolatePolicyRandomness:true,
        forestSealSearchCorrection:true,
        doubleDragonRecovery:true,
        supporterDecisionCorrection:true,
        leleEntryAbilityLockCorrection:true,
        radiantGateLockCorrection:true,
        entryDrawLockCorrection:true,
        grandTreeFirstTurnCorrection:true,
        battleCompressorPositiveSelectionCorrection:true,
        captureDecisionTrace:true
      });
      assert.deepEqual(game.deckHashes,[sha(deckA),sha(deckB)]);
      const first=game.firstTurnSlot;
      assert.ok(first===0||first===1);
      const opponentAttacks=game.attackTrace.filter(a=>a.seat===opponentSeat);
      const initialOpponentActions=(game.decisionTrace||[])
        .filter(a=>a.playerSlot===opponentSeat&&a.turnBefore<=6)
        .slice(0,30).map(a=>({
          ordinal:a.actionOrdinal,turn:a.turnBefore,
          action:a.action,card:a.card||null,
          attack:a.attack||null,attacker:a.attacker||null
        }));
      records.push({...identity,status:'engine-run',
        rank31ActuallySecond:first===championSeat,
        actualFirstTurnSlot:first,actions:game.actions,
        turns:game.turns,finished:game.finished,
        rank31Attacks:opponentAttacks.map(a=>({
          turn:a.turn,attack:a.attack,pokemon:a.activePokemon
        })),
        rank31BellCount:opponentAttacks.filter(a=>
          a.attack==='Bell of Silence').length,
        rank31ChimechoPlays:game.cardsPlayedBySeat[opponentSeat]?.Chimecho||0,
        firstOpponentDecisions:initialOpponentActions
      });
    }catch(error){
      records.push({...identity,status:'engine-error',
        error:String(error?.message||error).slice(0,300)});
    }
  }
  return {rank:31,candidate:'published-rank1-reference',
    opponent:'published-rank31-Dusknoir-Chimecho',
    seedBase:20261016,seedProtocol:'decorrelated-slots-v3',
    plannedRepeat:0,seeds,
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    readiness,records,qualifiedForCompetitiveInference:false,
    limitation:'Two frozen source-dealt weak-bot exposures only; no win-rate or human policy claim'};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={main};

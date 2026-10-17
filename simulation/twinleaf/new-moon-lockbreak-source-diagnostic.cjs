'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch,initializeCards} = require('./headless.cjs');
const source = require('../../results/als/new-moon-perfection-english-map.json');
const contender = require('../../results/als/new-moon-lockbreak-english-proxy-60.json');
const {validate} = require('./new-moon-lockbreak-validate.cjs');

/** Physically align all unchanged 60 source-slot positions between the arms. */
function pairedCandidateSlots() {
  const raw = source.entries.flatMap(row => Array(row.count).fill(row.twinleaf_full_name));
  assert.equal(raw.length,60);
  const next = [];
  let carriers = 0;
  for (const name of raw) {
    if (name === 'Trainers\' Mail ROS') {
      next.push('Canceling Cologne ASR');
    } else if (name === 'Rescue Carrier EVS' && ++carriers > 2) {
      next.push('Field Blower GRI');
    } else {
      next.push(name);
    }
  }
  assert.equal(carriers,4);
  const expected = new Map(validate().cards.map(row=>[row.fullName,row.count]));
  const actual = new Map();
  for (const name of next)actual.set(name,(actual.get(name)||0)+1);
  assert.deepEqual([...actual].sort(),[...expected].sort());
  return {source:raw, lockbreak:next};
}

/** Paired seeded game, deliberately unqualified generic policies. */
function run() {
  initializeCards();
  const slots=pairedCandidateSlots();
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const ranks=[6,8];
  const rows=[];
  for(const rank of ranks) {
    const opponent=plan.opponents.find(x=>x.rank===rank);
    assert.equal(opponent?.status,'ready',
      'Original opponent must resolve to exact source 60: '+rank);
    assert.equal(opponent.cards.length,60);
    for(const candidateSeat of [0,1]) {
      const seed=deriveSlotSeeds(20261017,'pilot',rank,0)[candidateSeat===0?'A':'B'];
      for(const variant of ['source','lockbreak']) {
        const request={
          deckA:candidateSeat===0?slots[variant]:opponent.cards,
          deckB:candidateSeat===1?slots[variant]:opponent.cards,
          seed,maxActions:350,
          label:'NewMoon:'+variant+':rank'+rank+':physical'+(candidateSeat===0?'A':'B'),
          strictPromptValidation:true,
          forestSealSearchCorrection:true,
          supporterDecisionCorrection:true,
          leleEntryAbilityLockCorrection:true,
          entryDrawLockCorrection:true,
          isolatePolicyRandomness:true,
          pendingEndTurnSwitchCleanupCorrection:true,
          captureDecisionTrace:true,
          captureCopycatTurnStartSeat:candidateSeat
        };
        try {
          const game=runMatch(request);
          const actions=game.decisionTrace.filter(a=>a.playerSlot===candidateSeat);
          const opponentActions=game.decisionTrace.filter(a=>a.playerSlot!==candidateSeat);
          const candidateAbilityCounts=Object.fromEntries(
            [...new Set(game.abilityTrace.filter(a=>a.seat===candidateSeat)
              .map(a=>a.name))].sort().map(name=>[name,game.abilityTrace
              .filter(a=>a.seat===candidateSeat && a.name===name).length]));
          const candidatePrintedAttacks=game.attackTrace
            .filter(a=>a.seat===candidateSeat).length;
          const candidatePassCount=actions.filter(a=>a.action==='PassTurnAction').length;
          const starts=(game.copycatTurnStartEvidence||[]).map(t=>({
            turn:t.turn,
            ownActive:t.board[candidateSeat]?.active?.name??null,
            ownActiveEnergy:t.board[candidateSeat]?.active?.energyCards??[],
            ownBenched:(t.board[candidateSeat]?.bench??[]).map(p=>p.name),
            opponentActive:t.board[1-candidateSeat]?.active?.name??null,
            opponentBench:(t.board[1-candidateSeat]?.bench??[]).map(p=>p.name),
            candidateHandCounters:t.candidateHand.filter(name=>
              name.startsWith('Canceling Cologne')||name.startsWith('Field Blower')),
            candidateHandPsychicEnergy:t.candidateHand.filter(name=>
              name.startsWith('Psychic Energy')||
              name.startsWith('Telepathic Psychic Energy')),
            candidateHandGengar:t.candidateHand
              .filter(name=>name.startsWith('Gengar & Mimikyu-GX')),
            usedGX:t.candidateUsedGX
          }));
          const counters=Object.fromEntries(
            ['Field Blower','Canceling Cologne','Trainers\' Mail','Rescue Carrier']
              .map(name=>[name,Object.entries(game.cardsPlayedBySeat[candidateSeat])
                .filter(([played])=>played.startsWith(name)).reduce((n,[,count])=>n+count,0)]));
          rows.push({
            rank,opponent:opponent.archetype,
            candidateSeat,variant,seed,actualFirstSeat:game.firstTurnSlot,
            engineWinner:game.winner,finished:game.finished,
            turns:game.turns,actions:game.actions,
            prizesRemaining:game.prizesRemaining,
            endReason:game.endReason,
            ownPrintedAttackNames:game.attackTrace.filter(a=>a.seat===candidateSeat)
              .map(a=>a.name??a.attack??null).slice(0,12),
            playedCounters:counters,
            candidateAbilityCounts,
            candidatePrintedAttacks,
            candidatePassCount,
            candidateOpeningTurnStarts:starts.slice(0,3),
            candidateTurnsHoldingCounters:starts.filter(t=>t.candidateHandCounters.length>0).length,
            candidateFirstCounterHeld:starts.find(t=>t.candidateHandCounters.length>0)??null,
            ownMeaningfulActions:actions.length,
            opponentMeaningfulActions:opponentActions.length,
            ownFirstActions:actions.slice(0,18).map(a=>({
              turn:a.turnBefore,action:a.action,
              card:a.card??null,attack:a.attack??null,
              ability:a.ability??null
            })),
            errors:[]
          });
        } catch(error) {
          rows.push({
            rank,opponent:opponent.archetype,candidateSeat,variant,seed,
            errors:[String(error?.message||error)],
            finished:false,qualifiedForCompetitiveInference:false
          });
        }
      }
    }
  }
  assert.equal(rows.length,8);
  for(let i=0;i<rows.length;i+=2) {
    const a=rows[i],b=rows[i+1];
    assert.equal(a.rank,b.rank);
    assert.equal(a.candidateSeat,b.candidateSeat);
    assert.equal(a.seed,b.seed);
    if(a.errors.length===0&&b.errors.length===0)
      assert.equal(a.actualFirstSeat,b.actualFirstSeat);
  }
  return {
    schema:'new-moon-lockbreak-paired-source-diagnostic-v4-counter-held-example',
    qualifiedForCompetitiveInference:false,
    originalSourcePrintHash:source.sha256_id_counts,
    frozenCandidatePrintHash:contender.canonical_id_count_sha256,
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    physicalSlotRule:'Only two Trainer Mail and two Rescue Carrier positions changed. Unchanged 56 exact physical print slots retain source index.',
    seedRule:'decorrelated-slots-v3 pilot seed base 20261017, target rank, game 0',
    policy:'Original pinned generic SimpleTacticsAi, limited extra rule research flags, no New Moon-specific strategic sequencing; abilityTrace and AttackAction are different channels, ResolvePromptAction ChooseAttackPrompt choices are not fully captured',
    caveats:'Single paired seed in each seat, unqualified policy, unverified full copied-attack and Night Watch random-hand mechanics, possible simulator alias problems, 350-action cap, missing three benchmark ranks. These engine winners must never enter a competitive win-rate ledger.',
    rows
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={pairedCandidateSlots,run};

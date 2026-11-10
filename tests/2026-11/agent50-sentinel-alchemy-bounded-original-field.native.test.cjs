'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('../../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../../simulation/twinleaf/headless.cjs');
const candidate=require('../../results/aichi-2026/candidates/agent50-sentinel-alchemy-triplelock-60-v1.json');

/**
 * Controlled small-scale *native development* contrast. Both lists remain
 * unchanged across the same source opponents/seats. The shared native policy
 * is incomplete; an engine winner or truncated game proves no paper matchup.
 */
test('preregistered fixed original rank2 versus triple-lock candidate, native first encounter',()=>{
  const permissions={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const baseline=planAichi(2,permissions);
  const experiment=planAichi(candidate,permissions);
  assert.equal(baseline.candidate.cards.length,60);
  assert.equal(experiment.candidate.cards.length,60);
  const baseHash=createHash('sha256')
    .update(JSON.stringify(baseline.candidate.cards)).digest('hex');
  const candidateHash=createHash('sha256')
    .update(JSON.stringify(experiment.candidate.cards)).digest('hex');
  assert.notEqual(baseHash,candidateHash);
  const rows=[];
  // These sources span the Basic Ability engine, Active Ability lock,
  // and Dragon attack toolbox. No favorable seed-selection.
  for(const rank of [5,6,10]){
    const source=experiment.opponents.find(row=>row.rank===rank);
    assert.equal(source.status,'ready');
    for(const seat of [0,1]){
      const seed=(0x50a11c00+rank*257+seat)>>>0;
      const variants=[
        ['original-rank2',baseline.candidate.cards],
        ['new-muk-triplelock',experiment.candidate.cards]
      ];
      for(const [arm,ownDeck] of variants){
        const deckA=seat===0?ownDeck:source.cards;
        const deckB=seat===1?ownDeck:source.cards;
        let row={rank,seat,seed,arm,status:'blocked'};
        try{
          const game=runMatch({
            label:'agent50-triplelock-development-'+arm+'-rank'+rank+'-seat'+seat,
            deckA,deckB,seed,maxActions:180,
            captureInitialSourceDealFingerprintSeat:1-seat,
            captureInitialFullPhysicalDeal:true,
            captureStartingBoard:true,
            captureFinalPublicBoard:true,
            captureDecisionTrace:true,
            isolatePhysicalShuffleRandomness:true,
            isolatePolicyRandomness:true,
            strictPromptValidation:true
          });
          const owner=game.finalState?.[seat]??{};
          row={...row,status:game.finished?'native-finished':'action-bound',
            actions:game.actions,turns:game.turns,
            nativeWinner:game.winner??null,
            originalSourceDeal:game.initialSourceDealFingerprint,
            originalFullDeal:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
            ownerFinalActive:owner.activePokemon??null,
            ownerFinalBench:owner.benchedPokemon??[],
            ownerFinalPrizes:game.prizesRemaining?.[seat]??null,
            originalOpponentFinalPrizes:game.prizesRemaining?.[1-seat]??null,
            ownerMukPlayed:(Object.entries(game.cardsPlayedBySeat?.[seat]??{})
              .some(([name,count])=>name.includes('Alolan Muk')&&count>0)),
            ownerMukVisibleAtFinish:owner.benchedPokemon?.includes('Alolan Muk')??false,
            ownerNativeRootCount:game.rootActionLedger?.filter(r=>r.playerSlot===seat).length??null
          };
        }catch(error){
          row={...row,status:'native-blocked',error:String(error?.message??error)};
        }
        rows.push(row);
      }
      const a=rows[rows.length-2],b=rows[rows.length-1];
      const sameSourceDeal=JSON.stringify(a.originalSourceDeal??null)===
        JSON.stringify(b.originalSourceDeal??null);
      console.log('AGENT50_MUK_PAIRED_NATIVE '+JSON.stringify({
        rank,ownerSeat:seat,seed,sameOriginalSourceDeal:sameSourceDeal,
        original:{status:a.status,turns:a.turns??null,
          prizes:a.ownerFinalPrizes??null,winner:a.nativeWinner??null,
          error:a.error??null},
        candidate:{status:b.status,turns:b.turns??null,
          prizes:b.ownerFinalPrizes??null,winner:b.nativeWinner??null,
          mukOnFinalBench:b.ownerMukVisibleAtFinish??false,
          error:b.error??null},
        paperQualified:false,competitiveQualifiedGames:0
      }));
    }
  }
  assert.equal(rows.length,12);
  assert.ok(rows.every(r=>r.status==='native-finished'||
    r.status==='action-bound'||r.status==='native-blocked'));
  console.log('AGENT50_MUK_PILOT_SUMMARY '+JSON.stringify({
    originalCandidateHash:baseHash,experimentCandidateHash:candidateHash,
    originalSourceRanks:[5,6,10],seedFormula:'0x50a11c00+rank*257+seat',
    fixedTotalGames:12,sourceOpponentListsUnchanged:true,
    qualifiedGames:0,statuses:rows.map(r=>({
      rank:r.rank,seat:r.seat,arm:r.arm,status:r.status,
      nativeWinner:r.nativeWinner??null,errors:r.error??null
    }))
  }));
});

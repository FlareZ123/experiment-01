'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED=20261023;
const SEAT=1;
const LIMIT=350;
const sha256=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @param {object[]} board @param {0|1} seat @returns {string[]} */
function publicBenchNames(board,seat){
  return (board?.[seat]?.bench??[]).map(slot=>slot.name);
}

/**
 * Only a same-origin prompt-closed attack has an interpretable before/after
 * Stage delta. This projects already public Pokémon names and accepted roots.
 * Do not inspect hidden deck, Prize cards or opponent hand.
 *
 * @param {object} game A genuine MatchRecord with opt-in Store telemetry.
 * @param {0|1} actor Actual source-rank2 physical seat.
 * @returns {object[]}
 */
function evolutionAttackResponses(game,actor) {
  assert.ok(actor===0||actor===1);
  const roots=game.rootActionLedger??[];
  return (game.publicAttackTransitions??[])
    .filter(row=>row.triggerPlayerSlot===actor &&
      row.declarations?.some(d=>d.attackName==='Evolution'))
    .map(event=>{
      const closed=Boolean(event.settled?.after);
      const before=publicBenchNames(event.before,actor);
      const after=closed?publicBenchNames(event.settled.after,actor):null;
      const changes=after===null?[]:before
        .map((from,index)=>({position:index,from,to:after[index]??null}))
        .filter(delta=>delta.to!==delta.from);
      const completion=closed?
        event.settled.completionRootActionOrdinal:null;
      const reply=Number.isSafeInteger(completion)?roots.find(root=>
        root.actionOrdinal>completion&&root.playerSlot===1-actor &&
        root.turnBefore>event.turnBefore):null;
      return {
        actionOrdinal:event.actionOrdinal,globalTurn:event.turnBefore,
        attackName:'Evolution',
        declarationActor:event.triggerPlayerSlot,
        declarations:event.declarations,
        initiatingRootActionOrdinal:event.initiatingRootActionOrdinal,
        promptPendingAfterDispatch:event.promptPendingAfter,
        promptChainClosed:closed,
        completionRootActionOrdinal:completion,
        beforeActive:event.before?.[actor]?.active?.name??null,
        beforeBench:before,afterBench:after,changedBenchStages:changes,
        opposingFirstFollowingRoot:reply?{
          actionOrdinal:reply.actionOrdinal,globalTurn:reply.turnBefore,
          action:reply.action,card:reply.card??null,
          attack:reply.attack??null,ability:reply.ability??null
        }:null
      };
    });
}

/** Actual published original 60s, same retrospective deal and both policies. */
function run(){
  const {resolveManifestFile}=require('./resolve-field.cjs');
  const {runWithResearchProfile,EXPANDED_SOURCE_PROFILE,
    EXPANDED_GH_SEARCH_PROFILE}=require('./policy-profiles.cjs');
  const {firstRecordedDecisionDifference}=
    require('./expanded-source-profile-pair.cjs');
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const ranks=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const first=ranks.get(1),second=ranks.get(2);
  assert.ok(first?.playableUnderEngine&&second?.playableUnderEngine);
  const variants=[EXPANDED_SOURCE_PROFILE,EXPANDED_GH_SEARCH_PROFILE];
  const samples=variants.map(profile=>{
    const game=runWithResearchProfile({
      deckA:first.cardIds,deckB:second.cardIds,
      seed:SEED,maxActions:LIMIT,
      captureDecisionTrace:true,
      capturePublicAttackTransitions:true,
      captureFinalPublicBoard:true,
      isolatePolicyRandomness:true,
      strictPromptValidation:true,
      label:'agent24-retrospective-rank2-GH-attack-public-response-'+profile
    },profile);
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.promptValidationMode,'predispatch-prompt-validate');
    assert.equal(game.firstTurnSlot,SEAT,'Historical source must actually start');
    return {
      profile,game,
      evidence:{
        profile,seed:SEED,sourceSeat:SEAT,
        actions:game.actions,turns:game.turns,
        finished:game.finished,
        endReason:game.endReason,
        deckHashes:game.deckHashes,
        verifiedFirstTurn:game.verifiedByDrawLog,
        rootTraceSha256:sha256(game.rootActionLedger),
        rank2EvolutionAttackActions:game.attackTrace.filter(e=>
          e.seat===SEAT&&e.attack==='Evolution').length,
        rank2EvolutionDeclarations:game.attackDeclarationTrace.filter(e=>
          e.playerSlot===SEAT&&e.attackName==='Evolution').length,
        evolutionResponses:evolutionAttackResponses(game,SEAT),
        finalSourceBoard:game.finalPublicBoard?.[SEAT]??null,
        competitionQualified:false
      }
    };
  });
  assert.deepEqual(samples[0].evidence.deckHashes,
    samples[1].evidence.deckHashes);
  const divergence=firstRecordedDecisionDifference(
    samples[0].game.decisionTrace,samples[1].game.decisionTrace);
  const expected=divergence?.secondProfile;
  assert.equal(expected?.actionOrdinal,84,
    'Read-only attack observer changed previously archived first fork');
  assert.deepEqual(expected?.selectedCards,[
    'Technical Machine: Evolution PAR','Jet Energy PAL','Artazon PAL'
  ]);
  const selection=samples[1].evidence.evolutionResponses;
  assert.ok(selection.length>=1,
    'Archived resource-search attack root must remain observable');
  return {
    schema:'agent24-rank2-gh-public-effect-and-first-opponent-root-v1',
    retrospective:true,seed:SEED,rank2Seat:SEAT,
    enginePin:PIN,maxActions:LIMIT,
    sameSourceHashes:true,
    firstDifferenceAtSourceRoot:divergence,
    arms:samples.map(s=>s.evidence),
    competitiveQualifiedGames:0,
    note:'Selected earlier positive source-dealt deal. Real Store public attack and root observations. Prompt closure and evolving Bench checked separately. No full paper or human-policy inference.'
  };
}

module.exports={evolutionAttackResponses,publicBenchNames,run};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');

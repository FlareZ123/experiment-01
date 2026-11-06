'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=require('../twinleaf/actor-observation-contract.cjs');
const {
  createVsSeekerRunner,writeJsonAtomically
}=require('./agent20-issue25-v8-vs-seeker-guzma.cjs');

const VERSION='agent20-vs-seeker-guzma-native-synthetic-fixture-v1';

/**
 * Remove one physical printing from a player's named zone.
 * @param {object} player
 * @param {string} zoneName
 * @param {string} fullName
 * @returns {object|null}
 */
function takeFromZone(player,zoneName,fullName){
  const cards=player?.[zoneName]?.cards;
  if(!Array.isArray(cards))return null;
  const index=cards.findIndex(card=>card.fullName===fullName);
  return index<0?null:cards.splice(index,1)[0];
}

/**
 * Ensure one exact printing is in the owner's hand, moving the same physical
 * card from the owner's deck or discard for this explicitly synthetic fixture.
 * @param {object} player
 * @param {string} fullName
 * @returns {{card:object,source:string}|null}
 */
function ensureInHand(player,fullName){
  const hand=player?.hand?.cards;
  if(!Array.isArray(hand))return null;
  const existing=hand.find(card=>card.fullName===fullName);
  if(existing)return {card:existing,source:'hand'};
  for(const zoneName of ['deck','discard']){
    const card=takeFromZone(player,zoneName,fullName);
    if(card){
      hand.push(card);
      return {card,source:zoneName};
    }
  }
  return null;
}

/**
 * Ensure one exact Supporter is in the owner's discard. Any copies already in
 * hand are moved to discard; otherwise the same physical card is moved from deck.
 * @param {object} player
 * @param {string} fullName
 * @returns {{card:object,source:string}|null}
 */
function ensureInDiscard(player,fullName){
  const hand=player?.hand?.cards;
  const discard=player?.discard?.cards;
  if(!Array.isArray(hand)||!Array.isArray(discard))return null;
  let source='discard';
  for(let i=hand.length-1;i>=0;i--){
    if(hand[i].fullName===fullName){
      discard.push(hand.splice(i,1)[0]);
      source='hand';
    }
  }
  const existing=discard.find(card=>card.fullName===fullName);
  if(existing)return {card:existing,source};
  const card=takeFromZone(player,'deck',fullName);
  if(!card)return null;
  discard.push(card);
  return {card,source:'deck'};
}

/**
 * Inject a synthetic, owner-visible VS Seeker -> Guzma opportunity at the
 * first eligible native owner root for each player. The fixture deliberately
 * moves existing physical cards between zones without playing the actions
 * that would normally cause those movements. It is solely a native Store
 * acceptance and prompt-resolution test, never gameplay or win-rate evidence.
 *
 * @param {{baseObservation?:Function}} [deps]
 * @returns {{observe:Function,audit:object}}
 */
function createSyntheticActorObservation(deps={}){
  const baseObservation=deps.baseObservation??actorObservation;
  const injectedOwners=new WeakSet();
  const notedOwners=new WeakSet();
  const audit={
    version:VERSION,ownerRootObservations:0,injectionAttempts:0,
    injections:[],skipped:[]
  };
  function observe(state,seat){
    const view=baseObservation(state,seat);
    if(view?.decisionKind!=='owner-root')return view;
    audit.ownerRootObservations++;
    const owner=state?.players?.[seat];
    if(!owner||injectedOwners.has(owner)||view.globalTurn<=1||
       !view.ownPublic?.bench?.some(Boolean)||
       !view.opponentPublic?.bench?.some(Boolean)||
       view.ownTurnResources?.supporterPlayedTurn!==0||
       view.ownTurnResources?.itemPlayLocked===true||
       view.ownTurnResources?.supporterPlayLocked===true||
       (view.ownPublic?.resolvingSupporter??[]).length>0)return view;
    audit.injectionAttempts++;
    const seeker=ensureInHand(owner,'VS Seeker PHF');
    const guzma=ensureInDiscard(owner,'Guzma BUS');
    if(!seeker||!guzma){
      if(!notedOwners.has(owner)){
        notedOwners.add(owner);
        audit.skipped.push({
          seat,ownerId:owner.id,
          missing:!seeker&&!guzma?['VS Seeker PHF','Guzma BUS']:
            !seeker?['VS Seeker PHF']:['Guzma BUS']
        });
      }
      return baseObservation(state,seat);
    }
    injectedOwners.add(owner);
    audit.injections.push({
      seat,ownerId:owner.id,turn:view.globalTurn,
      vsSeekerSource:seeker.source,guzmaSource:guzma.source,
      ownerBenchCount:view.ownPublic.bench.filter(Boolean).length,
      opponentBenchCount:view.opponentPublic.bench.filter(Boolean).length
    });
    return baseObservation(state,seat);
  }
  return {observe,audit};
}

/**
 * Run the Agent41 four-trial development cohort with a synthetic physical
 * opportunity so the real Twinleaf Store must accept VS Seeker and resolve
 * its owner-discard ChooseCardsPrompt.
 *
 * @param {{runDevelopment?:Function,withOwnerVsSeekerGuzmaLayer?:Function,
 *   base?:string}} [deps]
 * @returns {object}
 */
function runSyntheticNativeFixture(deps={}){
  const fixture=createSyntheticActorObservation();
  const runner=createVsSeekerRunner({
    runDevelopment:deps.runDevelopment,
    withOwnerVsSeekerGuzmaLayer:deps.withOwnerVsSeekerGuzmaLayer,
    base:deps.base,
    actorObservation:fixture.observe
  });
  const raw=runner({actorOnlyComposition:true,nativeRootActionLimit:128});
  const audit=raw.ownerVsSeekerGuzmaAudit;
  assert.ok(fixture.audit.injections.length>0,
    'At least one real native owner must receive the synthetic opportunity');
  assert.ok(audit.rootsAccepted>0,
    'Pinned Twinleaf Store must accept at least one VS Seeker root');
  assert.ok(audit.promptsAccepted>0,
    'Pinned Twinleaf Store must accept and resolve the owner-discard prompt');
  const manifest={
    version:VERSION,syntheticStateInjection:true,
    gameplayEvidence:false,prospective:false,
    nativeRootActionLimit:128,
    addedOwnerVsSeekerGuzmaLayer:true,
    addedAgent43GuzmaPromptContinuation:true,
    heldGuzmaMobilityRootOptIn:true,
    originalDevelopmentManifest:raw.manifest,
    fixtureAudit:fixture.audit,
    ownerVsSeekerGuzmaAudit:audit,
    paperQualifiedCompetitiveGames:0,
    winRateCertified:false
  };
  const diagnostic={
    version:VERSION,fixtureAudit:fixture.audit,
    ownerVsSeekerGuzmaAudit:audit,
    actorOnlyDecisionCoverageByTrial:(raw.rows??[]).map(row=>({
      trialId:row.trial?.id??row.id??null,
      actorOnlyDecisionCoverage:row.actorOnlyDecisionCoverage??null
    })),
    competitiveGamesQualified:0,estimatedWinRate:null,
    winRateCertified:false
  };
  return {manifest,diagnostic,rawDevelopment:raw};
}

if(require.main===module){
  const result=runSyntheticNativeFixture();
  const output=process.env.AGENT20_FIXTURE_OUTPUT_PATH;
  if(output)writeJsonAtomically(output,result);
  else process.stdout.write(JSON.stringify(result,null,2)+'\n');
}

module.exports={
  VERSION,takeFromZone,ensureInHand,ensureInDiscard,
  createSyntheticActorObservation,runSyntheticNativeFixture
};

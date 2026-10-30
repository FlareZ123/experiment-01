'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withBroadThornsSourceAttack}=
  require('../twinleaf/rank6-broad-thorns-policy.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');
const {Store}=require('../../vendor/twinleaf/ptcg-server/output/game/store/store');

const REGISTRATION=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent6-two-turn-speed-dce-order-native-20261030.json');

/**
 * Noninterventional real Store root observer. Records the source's own
 * first and second ordinary turn physical Energy changes, plus deck/hand
 * sizes; never searches concealed zones or injects decisions.
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} work
 * @returns {{result:T,receipts:Array<object>}}
 */
function observeSourceEnergyTimeline(sourceSeat,work){
  const original=Store.prototype.dispatch;
  const receipts=[];
  const snapshot=(state)=>{
    const p=state?.players?.[sourceSeat];
    if(!p)return null;
    return {
      turn:state.turn,actor:state.activePlayer,
      activeName:p.active.getPokemonCard()?.name??null,
      speed:p.active.energies.cards.filter(c=>
        c.name==='Speed Lightning Energy').length,
      dce:p.active.energies.cards.filter(c=>
        c.name==='Double Colorless Energy').length,
      handSize:p.hand.cards.length,deckSize:p.deck.cards.length
    };
  };
  Store.prototype.dispatch=function observedSourceEnergy(action){
    const before=snapshot(this.state);
    const actual=original.call(this,action);
    if(before&&[1,3].includes(before.turn)&&
        before.actor===sourceSeat&&
        action?.constructor?.name==='PlayCardAction'){
      const after=snapshot(this.state);
      if(after&&after.turn===before.turn&&
         (after.speed>before.speed||after.dce>before.dce)){
        receipts.push({
          actionName:action.constructor.name,globalTurn:before.turn,
          sourceSeat,activePokemon:after.activeName,
          addedSpeed:after.speed-before.speed,
          addedDce:after.dce-before.dce,
          handBefore:before.handSize,handAfter:after.handSize,
          deckBefore:before.deckSize,deckAfter:after.deckSize,
          nativeDeckDraws:before.deckSize-after.deckSize
        });
      }
    }
    return actual;
  };
  try{return {result:work(),receipts};}
  finally{Store.prototype.dispatch=original;}
}

/** Four-way timing-order native original-source replay; not field inference. */
function run(){
  const reg=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(reg.schema,
    'agent6-retrospective-sourcefirst-iron-thorns-speed-dce-order-four-arm-v1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(d=>d.rank===reg.candidateRank);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(d=>d.rank===reg.sourceRank);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {sourceSeat,seeds} of reg.sourceFirstSeatSeedPairs){
    for(const seed of seeds){
      const request={
        deckA:sourceSeat===0?source.cards:plan.candidate.cards,
        deckB:sourceSeat===1?source.cards:plan.candidate.cards,
        seed,maxActions:reg.shared.maxActions,
        strictPromptValidation:reg.shared.strictPromptValidation,
        captureDecisionTrace:true,
        capturePublicAttackTransitions:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        captureStartingBoard:true
      };
      const preferences=sourceSeat===0?[true,false]:[false,true];
      const arms=[];
      for(const treatment of reg.arms){
        try{
          const observed=observeSourceEnergyTimeline(sourceSeat,()=>
            withGoFirstChoice(preferences,()=>
              withCanonicalActorOnlyPolicy(()=>
                withBroadThornsSourceAttack(()=>runMatch(request),{
                  seat:sourceSeat,turn:reg.shared.sourceT3AttackScriptTurn,
                  stageSpeedLightningFirstTurn:
                    treatment.stageSpeedLightningFirstTurn,
                  stageDceFirstTurn:treatment.stageDceFirstTurn,
                  turn3DirectSpeedAfterDce:
                    treatment.turn3DirectSpeedAfterDce,
                  liveSpeedLightningAlternative:true,
                  playLockAwareOpening:true,
                  k1ReplanAfterTagCall:true,
                  k1PrizedThunderSpeedFallback:false
                })
              )
            )
          );
          const outer=observed.result;
          const broad=outer.result.result;
          const game=broad.result;
          assert.equal(game.firstTurnSlot,sourceSeat);
          assert.equal(game.verifiedByDrawLog,true);
          assert.equal(outer.audit.choices.length,1);
          const settled=candidateAttackSettlement(game,sourceSeat);
          const firstOwner=(game.decisionTrace??[]).find(x=>
            x.playerSlot===sourceSeat&&x.turnBefore===1&&
            x.action!=='ResolvePromptAction'&&
            x.decisionHandBefore?.perspectiveSeat===sourceSeat);
          const sourceRoots=turn=>(game.rootActionLedger??[])
            .filter(x=>x.playerSlot===sourceSeat&&
              x.turnBefore===turn&&x.pendingPrompt===null)
            .map(x=>({action:x.action,card:x.card??null,
              attack:x.attack??null,ordinal:x.actionOrdinal}));
          const candidateT2=(game.rootActionLedger??[])
            .filter(x=>x.playerSlot===1-sourceSeat&&
              x.turnBefore===2&&x.pendingPrompt===null)
            .map(x=>({action:x.action,card:x.card??null,
              attack:x.attack??null,ordinal:x.actionOrdinal}));
          arms.push({
            status:'native-complete-or-capped',sourceSeat,seed,
            mode:treatment.label,
            sourceActualFirst:true,verifiedByDrawLog:true,
            sourceDealDigest:game.initialSourceDealFingerprint?.
              digestSha256??null,
            originalSourceK0Hand:firstOwner?.
              decisionHandBefore?.ownHandPrintings??null,
            sourceT1NativeRoots:sourceRoots(1),
            candidateT2NativeRoots:candidateT2,
            sourceT3NativeRoots:sourceRoots(3),
            nativeEnergyTimeline:observed.receipts,
            sourceT1SpeedStaged:broad.speedStagingConfirmed,
            sourceT1DceStaged:broad.dceStagingConfirmed,
            sourceT3DirectSpeedSelected:
              broad.directSpeedSecondTurnSelected,
            sourceT3PolicyCompleted:broad.completed,
            sourceT3AbortReason:broad.abortReason,
            sourcePolicyEvents:broad.events,
            sourceT3SettledVoltCyclone:settled.attacks.filter(x=>
              x.turnBefore===3&&x.attackName==='Volt Cyclone'),
            gameFinished:game.finished??null,
            competitivelyQualified:false
          });
        }catch(error){
          arms.push({status:'native-error',sourceSeat,seed,
            mode:treatment.label,
            error:String(error?.message??error).slice(0,700),
            rank6PolicyEvidence:error?.rank6PolicyEvidence??null});
        }
      }
      const digests=arms.map(a=>a.sourceDealDigest).filter(Boolean);
      rows.push({sourceSeat,seed,arms,
        matchedOriginalSourceDeal:digests.length===reg.arms.length&&
          new Set(digests).size===1});
    }
  }
  const all=rows.flatMap(r=>r.arms);
  assert.equal(all.length,24);
  return {
    schema:'agent6-two-turn-energy-order-native-v1',
    registration:'results/aichi-2026/registrations/agent6-two-turn-speed-dce-order-native-20261030.json',
    attemptedNativeArms:all.length,
    nativeErrors:all.filter(x=>x.status==='native-error').length,
    physicalMatchedFourArmGroups:rows.filter(x=>x.matchedOriginalSourceDeal).length,
    directSpeedSecondTurnSelected:all.filter(x=>
      x.sourceT3DirectSpeedSelected===true).length,
    nativeSourceT3VoltCycloneSettlements:all.reduce((n,x)=>
      n+(x.sourceT3SettledVoltCyclone?.length??0),0),
    qualifiedCompetitiveGames:0,rows
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(run(),null,2)+'\n');
module.exports={observeSourceEnergyTimeline,run};

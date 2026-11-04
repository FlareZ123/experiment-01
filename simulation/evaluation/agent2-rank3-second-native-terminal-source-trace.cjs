'use strict';

const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION='agent2-original-rank3-second-native-source-win-mechanism-v1';
const SOURCE_SEAT=0,SEED=290138,MAX_ACTIONS=260;
const REGISTERED_FULL_DEAL=
  'e1c3a672fd79c6f80f116f4e3de8b3f59b36c606818e08da05a4336e739bd7f5';
const REGISTERED_SOURCE_DEAL=
  'c34ceb8378b0766437cee466c53ab2b696eed403ee88259ef469985dfd21a4b4';
const SHA=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Inspect one already registered independent full-60 source native terminal.
 * No counterfactual, novel policy, source selection or opponent intervention.
 * @returns {object} Read-only full-deal-verified Store evidence.
 */
function run(){
  initializeCards();
  const cards=originals();
  const old=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>
        withSameTargetAttachEnergySelection(()=>runMatch({
          deckA:cards.source,deckB:cards.candidate,
          seed:SEED,maxActions:MAX_ACTIONS,
          label:'agent2-original-rank3-second-native-terminal-source-trace',
          strictPromptValidation:true,
          mandatoryOptionFallback:true,
          enforceSelectOptionLegality:true,
          enforceVisiblePlayLockBothSeats:true,
          captureInitialFullPhysicalDeal:true,
          captureInitialSourceDealFingerprintSeat:SOURCE_SEAT,
          captureDecisionTrace:true,
          capturePublicAttackTransitions:true,
          captureNativeAbortEvidence:true,
          captureFinalPublicBoard:true
        })).result,{
          root:work=>withActorOnlyRootPolicy(work,{
            publicContextSpecialEnergy:true,specialEnergyRoot:true
          })
        },{ownerSingleSearch:true,genericFallbackAttribution:true})
    );
    const game=guarded.result.result;
    const sourceAttacks=game.attackDeclarationTrace.filter(a=>
      a.playerSlot===SOURCE_SEAT);
    const opposingAttacks=game.attackDeclarationTrace.filter(a=>
      a.playerSlot===1-SOURCE_SEAT);
    const sourceTransitions=(game.publicAttackTransitions??[]).filter(
      a=>a.triggerPlayerSlot===SOURCE_SEAT);
    const countsByName=arr=>Object.fromEntries([...arr.reduce((m,a)=>
      m.set(a.attackName,(m.get(a.attackName)??0)+1),new Map()).entries()]);
    const sourceMeaningfulActions=game.rootActionLedger.filter(a=>
      a.playerSlot===SOURCE_SEAT &&
      (a.action==='AttackAction'||a.action==='RetreatAction'||
       a.action==='PlayCardAction'||a.action==='PassTurnAction'));
    const fullDeal=game.initialFullPhysicalDealFingerprint?.digestSha256??null;
    const sourceDeal=game.initialSourceDealFingerprint?.digestSha256??null;
    return {
      schema:VERSION,sourceRank:3,referenceRank:1,sourceSeat:SOURCE_SEAT,
      seed:SEED,nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      convertedSourceSha256:SHA(cards.source),
      convertedReferenceSha256:SHA(cards.candidate),
      controls:{
        exactRegisteredFullDeal:fullDeal===REGISTERED_FULL_DEAL,
        exactRegisteredSourceDeal:sourceDeal===REGISTERED_SOURCE_DEAL,
        exactPreviouslyRegisteredNativeTerminal:
          game.finished&&game.winner===SOURCE_SEAT&&game.actions===209,
        actualFullDeal:fullDeal,actualSourceDeal:sourceDeal,
        competitiveQualifiedGames:0
      },
      status:game.finished?'native-terminal':'native-cap',
      nativeWinner:game.winner,
      nativeActions:game.actions,nativeTurns:game.turns,
      sourceAttackCount:sourceAttacks.length,
      opponentAttackCount:opposingAttacks.length,
      sourceAttacksByName:countsByName(sourceAttacks),
      opponentAttacksByName:countsByName(opposingAttacks),
      sourceAttackDeclarations:sourceAttacks.map(a=>({
        name:a.attackName,turn:a.turnBefore,actionOrdinal:a.actionOrdinal
      })),
      opponentAttackDeclarations:opposingAttacks.map(a=>({
        name:a.attackName,turn:a.turnBefore,actionOrdinal:a.actionOrdinal
      })),
      sourceRealSettledAttackTransitions:sourceTransitions.map(a=>({
        turn:a.turnBefore,triggerAction:a.triggerAction,
        attackNames:a.declarations.map(d=>d.attackName),
        attacker:a.before[SOURCE_SEAT]?.active?.name??null,
        ownAttachedEnergy:a.before[SOURCE_SEAT]?.active?.energyCards??[],
        opponentDeckAfter:a.settled?.deckRemaining?.[1-SOURCE_SEAT]??null,
        opponentPrizesAfter:a.settled?.prizesRemaining?.[1-SOURCE_SEAT]??null
      })),
      sourceActualActions:sourceMeaningfulActions,
      nativeTerminalTransition:game.terminalTransition??null,
      finalPublicBoard:game.finalPublicBoard??null,
      competitivelyQualified:false,
      note:'Historical outcome-selected original 60 source terminal, independent of seed290134; source mechanic and opponent-policy audit only, not another competitive game or matchup estimate.'
    };
  }finally{
    for(const [key,value] of old){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  try{
    const out=run();
    process.stdout.write(JSON.stringify(out,null,2)+'\n');
    if(!Object.entries(out.controls).filter(([key])=>key.startsWith('exact'))
      .every(([,good])=>good===true))process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({schema:VERSION,status:'native-error',
      error:String(error?.stack??error).slice(0,3500),
      competitivelyQualified:false},null,2)+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,run};

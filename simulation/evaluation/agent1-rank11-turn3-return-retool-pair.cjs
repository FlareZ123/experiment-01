'use strict';

const assert=require('node:assert/strict');
const {verifyFrame}=require('../twinleaf/agent32-rank11-six-star-vip-k1-native.cjs');
const frame=require('../../results/aichi-2026/registrations/agent32-rank11-six-k0-star-vip-native-20261030.json');
const {withOwnerOranguruStarVipPlan}=
  require('../twinleaf/agent1-owner-oranguru-starvip-native.cjs');
const {withNewMoonBlowerAutonomy}=
  require('../twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');

const VERSION='agent1-source-turn3-own-K1-Garbotoxin-repair-pair-v1';

/**
 * Two source-policy arms against the same owner-conditional opponent Blower.
 * This previously identified seed is retrospective and the full game policy
 * is unqualified. Each result retains original native receipts and failures.
 */
function run(){
  verifyFrame();
  const {runMatch}=require('../twinleaf/headless.cjs');
  const {resolvedPrintedDecks}=
    require('./rank11-conditional-k0-screen-run.cjs');
  const decks=resolvedPrintedDecks();
  assert.equal(decks.engineRevision,frame.engineRevision);
  const entry=frame.selectedExactK0.find(x=>x.index===299);
  assert.ok(entry);
  const rows=[];
  for(const sourceReturnRepair of [false,true]){
    try{
      const response=withNewMoonBlowerAutonomy(1,()=>(
        withOwnerOranguruStarVipPlan(()=>
          runMatch({...decks,seed:entry.seed,
            label:'rank11-conditional-K0-screen-v1:'+entry.index,
            maxActions:200,captureDecisionTrace:true,
            strictPromptValidation:true,
            forestSealSearchCorrection:true,
            battleCompressorPositiveSelectionCorrection:true,
            isolatePolicyRandomness:true}),{
              chooseOffer:(view,offer)=>{
                assert.equal(view.decisionKind,'owner-root');
                assert.equal(offer.eligible,true);
                return true;
              },
              chooseReturnRepair:(view,snapshot)=>{
                assert.equal(view.decisionKind,'owner-root');
                assert.equal(snapshot.seat,0);
                assert.equal(snapshot.firstReturnTurn,3);
                return sourceReturnRepair;
              }
            })
      ),{automaticFieldBlower:true,allowAnyActiveBlower:true});
      const game=response.result.result;
      const source=response.result.audit;
      const opponent=response.policyAudit;
      const first=source.originalOwnK0AtOffer.find(x=>x.seat===0);
      assert.equal(first?.handSha256,entry.sourceFirstOwnerHandSha256,
        'Source originally selected K0 physical hand changed');
      assert.deepEqual(first?.bench,entry.sourceBenchAtK0,
        'Source original K0 public Bench changed');
      assert.equal(game.firstTurnSlot,0);
      assert.equal(game.verifiedByDrawLog,true);
      assert.equal(source.plansChosen,1);
      assert.equal(source.nativeAccepted,11);
      assert.equal(source.completedEquippedGarbodor,1);
      assert.deepEqual(source.abortReasons,{});
      const sourceReturn=source.postOpponentOwnerReturns.find(x=>x.seat===0);
      assert.equal(sourceReturn?.firstReturnTurn,3);
      assert.equal(sourceReturn?.garbodorCount,1);
      assert.equal(sourceReturn?.anyToolEquippedGarbodorCount,0,
        'Must start the new source turn without Garbotoxin Tool');
      const fieldBlowerRoots=(game.decisionTrace??[]).filter(x=>
        x.playerSlot===1&&x.turnBefore===2&&
        x.action==='PlayCardAction'&&x.card==='Field Blower');
      assert.equal(fieldBlowerRoots.length,1);
      const firstBlower=fieldBlowerRoots[0];
      const ownerHandBeforeBlower=
        firstBlower.decisionHandBefore?.ownHandPrintings;
      assert.ok(Array.isArray(ownerHandBeforeBlower),
        'Missing real recipient-owned pre-Blower hand observation');
      const abilityPayloadPrintings=[
        'Tapu Lele-GX GRI','Radiant Eternatus CRZ','Latias ex SSP',
        'Marshadow UNB'
      ];
      const recipientHeldAbilityBasicCounts=Object.fromEntries(
        abilityPayloadPrintings.map(name=>[name,
          ownerHandBeforeBlower.filter(card=>card===name).length]));
      const recipientActionsAfterBlowerInTurn2=(game.decisionTrace??[])
        .filter(x=>x.playerSlot===1&&x.turnBefore===2&&
          x.actionOrdinal>firstBlower.actionOrdinal)
        .map(x=>({action:x.action,card:x.card??null,
          ability:x.ability??null,ordinal:x.actionOrdinal}));
      const confirmedRemoval=opponent.events.filter(x=>
        x.turn===2&&x.kind==='public-Tool-check'&&
        x.garbodorToolRemoved===true);
      assert.equal(confirmedRemoval.length,1);
      // The recipient's genuine turn-4 public-board read witnesses the
      // full prior source turn, including any Tool attachment target.
      const opponentTurn4Public=opponent.events.find(x=>
        x.turn===4&&x.kind==='read-only-own-turn-board');
      assert.ok(opponentTurn4Public,
        'Opponent turn4 public state after source turn3 was not observed');
      const sourceGarbodorToolPrintingsAtOpponentTurn4=
        [...opponentTurn4Public.garbodorToolPrintings];
      const sourceTurn3OwnDeckSelections=(game.decisionTrace??[])
        .filter(x=>x.playerSlot===0&&x.turnBefore===3&&
          x.cardSelection?.sourceZone==='deck'&&
          x.cardSelection?.sourcePlayerSlot===0)
        .map(x=>({ordinal:x.actionOrdinal,
          message:x.cardSelection.message,
          printings:x.cardSelection.selectedCards,
          nativeMin:x.cardSelection.nativePromptMin,
          nativeMax:x.cardSelection.nativePromptMax}));
      const sourceTurn3Plays=(game.decisionTrace??[]).filter(x=>
        x.playerSlot===0&&x.turnBefore===3&&
        (x.action==='PlayCardAction'||x.action==='UseAbilityAction'))
        .map(x=>({action:x.action,card:x.card??null,
          ability:x.ability??null}));
      rows.push({sourceReturnRepair,status:'native-original-K0-confirmed',
        sourceOriginalHandSha256:first.handSha256,
        sourcePlanCompleted:source.completedEquippedGarbodor,
        sourceFirstReturn:sourceReturn,
        sourceRepair:source.returnRepair,
        recipientBlowerRoots:fieldBlowerRoots.length,
        recipientConfirmedRemoval:confirmedRemoval.length,
        recipientHeldAbilityBasicCounts,
        recipientActionsAfterBlowerInTurn2,
        sourceGarbodorToolPrintingsAtOpponentTurn4,
        sourceTurn3Plays,
        sourceTurn3OwnDeckSelections,
        gameFinished:game.finished===true,
        gameRootCount:game.rootActionLedger?.length??null,
        qualifiedCompetitiveGame:false});
    }catch(error){
      rows.push({sourceReturnRepair,status:'blocked',
        error:String(error?.stack??error).slice(0,1400),
        nativeDiagnostic:error?.agent1OwnerPlanDiagnostic??null,
        qualifiedCompetitiveGame:false});
    }
  }
  if(rows.every(x=>x.status==='native-original-K0-confirmed')){
    assert.deepEqual(rows[0].recipientHeldAbilityBasicCounts,
      rows[1].recipientHeldAbilityBasicCounts,
      'Source turn3 treatment must not change recipient prior hidden hand');
    assert.deepEqual(rows[0].recipientActionsAfterBlowerInTurn2,
      rows[1].recipientActionsAfterBlowerInTurn2,
      'Source turn3 treatment must not change recipient prior turn2 actions');
  }
  return {version:VERSION,engineRevision:frame.engineRevision,
    registrationSha256:frame.frameSha256,
    selectedOriginalIndex:entry.index,selectedOriginalSeed:entry.seed,
    attempted:rows.length,blocked:rows.filter(x=>x.status==='blocked').length,
    sourceReturnRepairChosen:rows.reduce((n,x)=>
      n+(x.sourceRepair?.chosen??0),0),
    sourceReturnRepairAccepted:rows.reduce((n,x)=>
      n+(x.sourceRepair?.accepted??0),0),
    sourceReturnRepairCompleted:rows.reduce((n,x)=>
      n+(x.sourceRepair?.completed??0),0),
    rows,competitiveQualifiedGames:0,
    limitation:'One retrospectively chosen source and recipient full-60 physical seed. Both arms have conditional owner source first-turn plan and recipient own-hand Field Blower, with source owner-turn3 optional repair only in treatment. No field, game-win, paper-fidelity or policy optimality claims.'};
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write('AGENT1_SOURCE_RETOOL_PAIR '+JSON.stringify({
    blocked:result.blocked,chosen:result.sourceReturnRepairChosen,
    accepted:result.sourceReturnRepairAccepted,
    completed:result.sourceReturnRepairCompleted,
    rows:result.rows.map(x=>({repair:x.sourceReturnRepair,
      status:x.status,firstReturn:x.sourceFirstReturn,
      audit:x.sourceRepair,sourceTurn3:x.sourceTurn3Plays,
      sourceTurn3OwnerDeckChoices:x.sourceTurn3OwnDeckSelections,
      sourceGarbodorToolsAtOpponentTurn4:
        x.sourceGarbodorToolPrintingsAtOpponentTurn4,
      recipientHeldAbilityBasics:x.recipientHeldAbilityBasicCounts,
      recipientActionsAfterBlower:x.recipientActionsAfterBlowerInTurn2,
      error:x.error??null}))
  })+'\n');
  if(result.blocked>0)process.exitCode=1;
}
module.exports={VERSION,run};

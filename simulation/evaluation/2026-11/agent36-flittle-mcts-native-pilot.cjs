'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  loadNativeRoleDependencies
}=require('./agent36-v3-runner.cjs');
const {
  runNativeFixtureGame,
  seededRandom
}=require('./agent49-native-fixture-game.cjs');
const {
  withCandidateOpponentPolicyRoles
}=require('../../twinleaf/agent44-role-scoped-policy-composition.cjs');
const {
  createStoreDecklistBindingReceipt
}=require('./agent36-flittle-store-decklist-binding.cjs');
const {
  FLITTLE,
  PSYCHIC,
  PILOT_BUDGET,
  TEST_DECKLIST,
  decklistCardsSha256,
  loadTwinleafBindings,
  createFlittleMctsRuntime
}=require('../../twinleaf/2026-11/agent36-flittle-mcts-root-provider.cjs');

const OUTPUT_DIR=path.join(process.cwd(),'artifacts','agent36-flittle-mcts-pilot');
const PILOT_SCHEMA='agent36-flittle-mcts-native-pilot-v1';
const ENGINE_SHA=/^[0-9a-f]{40}$/i;

function coinFlipResultForFirstPlayer(state,promptId,desiredSeat,native,bindings) {
  assert.ok(desiredSeat===0||desiredSeat===1);
  const previousRandom=Math.random;
  function probe(result) {
    Math.random=seededRandom(0x36c0ffee);
    const simulator=new bindings.Simulator(state,{
      flipMode:bindings.BotFlipMode.RANDOM,
      shuffleMode:bindings.BotShuffleMode.RANDOM
    });
    simulator.store.dispatch(new bindings.ResolvePromptAction(promptId,result));
    return simulator.store.state.activePlayer;
  }
  try {
    const seatIfTrue=probe(true);
    const seatIfFalse=probe(false);
    assert.ok(seatIfTrue===0||seatIfTrue===1,
      'Native coin-flip probe did not resolve a first-player seat for true');
    assert.ok(seatIfFalse===0||seatIfFalse===1,
      'Native coin-flip probe did not resolve a first-player seat for false');
    assert.notEqual(seatIfTrue,seatIfFalse,
      'Native coin-flip outcomes did not select opposite physical seats');
    const result=seatIfTrue===desiredSeat;
    return {
      result,
      seatIfTrue,
      seatIfFalse,
      desiredFirstPlayerSeat:desiredSeat
    };
  } finally {
    Math.random=previousRandom;
  }
}

function summarizeGame(game,candidateSeat,selectedActionKey) {
  if(!game)return null;
  const expectedActionName=selectedActionKey==='ATTACK_ACTION:Ram'?
    'AttackAction':selectedActionKey==='PASS_TURN'?'PassTurnAction':null;
  const accepted=expectedActionName===null?null:
    (game.decisionTrace??[]).find(row=>
      row.actingSeat===candidateSeat&&row.isRootDecision===true&&
      row.actionName===expectedActionName&&row.dispatchStatus==='succeeded'
    )??null;
  const ledger=(game.rootActionLedger??[]).find(row=>
    row.playerSlot===candidateSeat&&row.isRootDecision===true&&
    row.action===expectedActionName&&row.dispatchStatus==='succeeded'
  )??null;
  return {
    schema:game.schema??null,
    fixtureOnly:game.fixtureOnly===true,
    admissionEligible:game.admissionEligible===true,
    competitiveGameQualified:game.competitiveGameQualified===true,
    seed:game.seed??null,
    seed32:game.seed32??null,
    candidateSeat:game.candidateSeat??candidateSeat,
    originalSourceSeat:game.originalSourceSeat??1-candidateSeat,
    actualFirstPlayerSeat:game.actualFirstPlayerSeat??null,
    actions:game.actions??game.acceptedActions??null,
    turns:game.turns??null,
    finished:game.finished===true,
    endReason:game.endReason??null,
    winnerSeat:game.winnerSeat??null,
    actionCountsBySeat:game.actionCountsBySeat??null,
    decisionTraceSha256:game.decisionTraceSha256??null,
    rootActionLedgerSha256:game.rootActionLedgerSha256??null,
    selectedActionKey,
    acceptedMctsRootAction:accepted?{
      actionOrdinal:accepted.actionOrdinal??null,
      actingSeat:accepted.actingSeat,
      actionName:accepted.actionName,
      dispatchStatus:accepted.dispatchStatus,
      actionPayloadSha256:accepted.actionPayloadSha256??null
    }:null,
    acceptedMctsRootLedger:ledger?{
      actionOrdinal:ledger.actionOrdinal??null,
      playerSlot:ledger.playerSlot,
      action:ledger.action,
      dispatchStatus:ledger.dispatchStatus,
      actionPayloadSha256:ledger.actionPayloadSha256??null
    }:null
  };
}

function runSeatPilot({candidateSeat,native,bindings,enginePin}) {
  const candidateDecklist={
    id:'agent36-flittle-pilot-candidate-v1',
    cards:TEST_DECKLIST.cards.slice()
  };
  const opponentDecklist={
    id:'agent36-flittle-pilot-opponent-v1',
    cards:TEST_DECKLIST.cards.slice()
  };
  const deckA=(candidateSeat===0?candidateDecklist:opponentDecklist).cards.slice();
  const deckB=(candidateSeat===0?opponentDecklist:candidateDecklist).cards.slice();
  const desiredFirstPlayerSeat=1-candidateSeat;
  let storeDecklistBindingReceipt=null;
  let runtime=null;
  const coinFlipAudit=[];

  class FlittlePreflightStore extends native.Store {
    dispatch(action,...args) {
      let nextAction=action;
      if(action instanceof native.ResolvePromptAction) {
        const pending=this.state?.prompts?.find(prompt=>
          prompt.id===action.id&&prompt.result===undefined);
        if(pending instanceof native.CoinFlipPrompt) {
          const probe=coinFlipResultForFirstPlayer(
            this.state,action.id,desiredFirstPlayerSeat,native,bindings);
          coinFlipAudit.push({
            promptId:action.id,
            randomStreamResult:action.result,
            forcedResult:probe.result,
            seatIfTrue:probe.seatIfTrue,
            seatIfFalse:probe.seatIfFalse,
            desiredFirstPlayerSeat:probe.desiredFirstPlayerSeat,
            actualFirstPlayerSeatAfterDispatch:null
          });
          nextAction=new native.ResolvePromptAction(action.id,probe.result);
        }
      }

      const result=super.dispatch(nextAction,...args);

      if(nextAction instanceof native.AddPlayerAction&&
         this.state?.players?.length===2&&storeDecklistBindingReceipt===null) {
        storeDecklistBindingReceipt=createStoreDecklistBindingReceipt({
          store:this,
          state:this.state,
          deckA,deckB,
          candidateSeat,
          candidateDecklist,
          opponentDecklist,
          enginePin,
          playerIds:[101,202]
        });
      }

      const coinFlip=coinFlipAudit.find(row=>
        row.promptId===nextAction?.id&&row.actualFirstPlayerSeatAfterDispatch===null);
      if(coinFlip&&nextAction instanceof native.ResolvePromptAction)
        coinFlip.actualFirstPlayerSeatAfterDispatch=this.state.activePlayer;

      return result;
    }
  }

  const nativePilot={...native,Store:FlittlePreflightStore};
  function ensureRuntime() {
    assert.ok(storeDecklistBindingReceipt,
      'MCTS runtime cannot initialize before the live Store decklist preflight');
    if(!runtime) {
      runtime=createFlittleMctsRuntime({
        native:nativePilot,
        candidateSeat,
        enginePin,
        candidateDecklist,
        opponentDecklist,
        storeDecklistBindingReceipt,
        bindings
      });
    }
    return runtime;
  }

  const commonDeps={
    ...nativePilot,
    rootIntentProvider:args=>ensureRuntime().rootIntentProvider(args),
    createRootSearchCapability:args=>ensureRuntime().createRootSearchCapability(args)
  };
  const budget={...PILOT_BUDGET};
  let roleResult=null;
  let failure=null;
  let partial=null;

  try {
    roleResult=withCandidateOpponentPolicyRoles(
      ()=>runNativeFixtureGame({
        native:nativePilot,
        deckA,deckB,
        seed:20261113+candidateSeat,
        candidateSeat,
        originalSourceSeat:1-candidateSeat,
        botOptionsBySeat:nativePilot.botOptionsBySeat,
        maxActions:120
      }),
      {
        candidateSeat,
        opponentSeat:1-candidateSeat,
        commonDeps,
        candidatePolicyOptions:{rootIntentBudget:{...budget}},
        opponentPolicyOptions:{rootIntentBudget:{...budget}}
      }
    );
  } catch(error) {
    failure={
      name:error?.name??'Error',
      message:String(error?.message??error).slice(0,300)
    };
    partial=error?.fixtureGamePartial??error?.cause?.fixtureGamePartial??null;
  }

  const game=roleResult?.result??partial;
  const event=runtime?.events?.[0]??null;
  const selectedActionKey=event?.audit?.selectedActionKey??null;
  const gameSummary=summarizeGame(game,candidateSeat,selectedActionKey);
  const accepted=gameSummary?.acceptedMctsRootAction!==null&&
    gameSummary?.acceptedMctsRootAction!==undefined;
  const receiptVerified=storeDecklistBindingReceipt?.verified===true&&
    storeDecklistBindingReceipt?.checkedPhysicalSeats?.length===2;
  const actorOnlyBoundaryValid=roleResult?.actorOnlyBoundary?.valid===true;
  const firstPlayerCorrect=game?.actualFirstPlayerSeat===desiredFirstPlayerSeat;
  const selectedOnce=runtime?.events?.length===1;
  const passed=receiptVerified&&firstPlayerCorrect&&selectedOnce&&accepted&&
    (roleResult===null||actorOnlyBoundaryValid);

  return {
    schema:PILOT_SCHEMA,
    fixtureOnly:true,
    admissionEligible:false,
    competitiveGameQualified:false,
    candidateSeat,
    opponentSeat:1-candidateSeat,
    desiredFirstPlayerSeat,
    enginePin,
    decklists:{
      candidate:{id:candidateDecklist.id,sha256:decklistCardsSha256(candidateDecklist.cards)},
      opponent:{id:opponentDecklist.id,sha256:decklistCardsSha256(opponentDecklist.cards)}
    },
    budget,
    coinFlipControl:{
      policy:'resolve-native-CoinFlipPrompt-so-candidate-is-second-player',
      rows:coinFlipAudit
    },
    storeDecklistBindingReceipt,
    runtime:{
      created:runtime!==null,
      events:runtime?.events??[],
      failures:runtime?.failures??[],
      selectedActionKey
    },
    actorOnlyBoundary:roleResult?.actorOnlyBoundary??null,
    roleSeatMap:roleResult?.roleSeatMap??null,
    candidatePolicyAudit:roleResult?{
      policyOwnerSeat:roleResult.candidateAudit.policyOwnerSeat,
      rootIntentProvider:roleResult.candidateAudit.rootIntentProvider
    }:null,
    opponentPolicyAudit:roleResult?{
      policyOwnerSeat:roleResult.opponentAudit.policyOwnerSeat,
      rootIntentProvider:roleResult.opponentAudit.rootIntentProvider
    }:null,
    game:gameSummary,
    failure,
    passed
  };
}

function runPilot({enginePin=process.env.AGENT36_TWINLEAF_COMMIT_SHA}={}) {
  assert.match(enginePin??'',ENGINE_SHA,
    'AGENT36_TWINLEAF_COMMIT_SHA must identify the exact pinned Twinleaf commit');
  const native=loadNativeRoleDependencies({enginePin});
  const bindings=loadTwinleafBindings(native);
  const runs=[0,1].map(candidateSeat=>
    runSeatPilot({candidateSeat,native,bindings,enginePin}));
  const report={
    schema:PILOT_SCHEMA,
    fixtureOnly:true,
    admissionEligible:false,
    competitiveGameQualified:false,
    competitiveEvidenceContribution:0,
    enginePin,
    budget:{...PILOT_BUDGET},
    decklist:{id:TEST_DECKLIST.id,cards:TEST_DECKLIST.cards.slice(),
      sha256:decklistCardsSha256(TEST_DECKLIST.cards)},
    scope:'one-root-decision-dispatch-smoke-test',
    opponentModel:'SimpleTacticsAi baseline only; not a competent field opponent',
    runs,
    passed:runs.length===2&&runs.every(run=>run.passed)
  };
  return report;
}

function writeArtifacts(report,outputDir=OUTPUT_DIR) {
  fs.mkdirSync(outputDir,{recursive:true});
  const jsonPath=path.join(outputDir,'native-pilot.json');
  const textPath=path.join(outputDir,'native-pilot.txt');
  const json=JSON.stringify(report,null,2)+'\n';
  const lines=[
    'Agent36 Flittle native MCTS pilot',
    'status='+(report.passed?'passed':'failed'),
    'fixtureOnly=true admissionEligible=false competitiveGameQualified=false',
    'competitiveEvidenceContribution=0',
    'enginePin='+report.enginePin,
    'budget='+JSON.stringify(report.budget),
    ...report.runs.map(run=>
      'candidateSeat='+run.candidateSeat+
      ' desiredFirstPlayerSeat='+run.desiredFirstPlayerSeat+
      ' storeReceipt='+Boolean(run.storeDecklistBindingReceipt?.verified)+
      ' selectedActionKey='+(run.runtime?.selectedActionKey??'none')+
      ' accepted='+Boolean(run.game?.acceptedMctsRootAction)+
      ' passed='+run.passed+
      ' failure='+(run.failure?.message??'none'))
  ];
  fs.writeFileSync(jsonPath,json);
  fs.writeFileSync(textPath,lines.join('\n')+'\n');
  return {jsonPath,textPath};
}

function main() {
  const report=runPilot();
  const outputs=writeArtifacts(report);
  const output={...report,outputs};
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(!report.passed)process.exitCode=1;
  return output;
}

if(require.main===module) {
  try { main(); }
  catch(error) {
    process.stderr.write(String(error?.stack||error)+'\n');
    process.exitCode=1;
  }
}

module.exports={
  PILOT_SCHEMA,
  coinFlipResultForFirstPlayer,
  summarizeGame,
  runSeatPilot,
  runPilot,
  writeArtifacts,
  main
};

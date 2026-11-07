'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {runStewardBroaderV8}=require('../simulation/evaluation/agent36-issue25-common-v8.cjs');
const {runIssue25V8WithOwnerAbilityPolicy}=require('../simulation/evaluation/agent36-issue25-v8-owner-ability-policy.cjs');
const {writeReceipt}=require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('pinned native owner-ability loader resolves actual Store, bot and prompt classes',()=>{
  initializeCards();
  const {loadNativeAbilityDependencies}=require(
    '../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
  const {ptcgServer,types}=loadNativeAbilityDependencies();
  for(const name of ['Store','SimpleTacticsAi','ConfirmPrompt',
    'ChooseCardsPrompt','ResolvePromptAction']){
    assert.equal(typeof ptcgServer[name],'function',name);
  }
  assert.equal(typeof types.CardType.WATER,'number');
  assert.equal(typeof types.SuperType.POKEMON,'number');
  assert.equal(typeof types.Stage.VMAX,'number');
  assert.equal(types.GameMessage.WANT_TO_USE_ABILITY,
    'WANT_TO_USE_ABILITY');
});

function idOf(row){return row.trial?.id??row.id??null;}
function rootsOf(row){
  const direct=row.rootActionLedger;
  const archived=row.nativePublicRootArchive?.rootActionLedger;
  const aborted=row.nativeAbortEvidence?.rootActionLedger;
  if(Array.isArray(direct)&&direct.length>0)return direct;
  if(Array.isArray(archived))return archived;
  if(Array.isArray(aborted))return aborted;
  return Array.isArray(direct)?direct:[];
}

function preservePublicTerminalFields(execution){
  const rawById=new Map((execution.rawDevelopment?.rows??[])
    .map(row=>[idOf(row),row]));
  execution.diagnostic.attemptedRows=
    (execution.diagnostic.attemptedRows??[]).map(status=>{
      const raw=rawById.get(status.id);
      if(!raw)return status;
      const direct=raw.rootActionLedger;
      const archived=raw.nativePublicRootArchive?.rootActionLedger;
      const aborted=raw.nativeAbortEvidence?.rootActionLedger;
      const observed=Array.isArray(direct)&&direct.length>0?direct:
        Array.isArray(archived)?archived:
        Array.isArray(aborted)?aborted:Array.isArray(direct)?direct:null;
      const nativeRootActionCount=raw.rootActionCount??
        (Array.isArray(observed)?observed.length:
          status.nativeRootActionCount??null);
      const nativeOutcome=status.status==='engine-error'||
        raw.nativeAbortProvenance?.aborted===true||
        raw.nativeAbortEvidence?.aborted===true||
        raw.error!==undefined&&raw.error!==null?'engine-error':
        raw.finished===true?'native-terminal':
        raw.finished===false&&raw.actionCount===128&&
          nativeRootActionCount===128?'action-cap':'returned-unqualified';
      return {
        ...status,
        status:nativeOutcome==='native-terminal'?
          'native-terminal-unqualified':
          nativeOutcome==='action-cap'?'root-cap-unqualified':status.status,
        nativeOutcome,
        actionCount:raw.actionCount??null,
        finished:raw.finished??status.finished??null,
        winner:raw.winner??null,
        endReason:raw.endReason??null,
        finalPrizes:raw.finalPrizes??null,
        finalBoard:raw.finalBoard??null,
        candidateAttackSettlement:raw.candidateAttackSettlement??null,
        settledPublicAttackCount:raw.settledPublicAttackCount??null,
        attackDeclarations:raw.attackDeclarations??null,
        firstSettledPublicAttack:raw.firstSettledPublicAttack??null,
        nativeRootActionCount,
        terminalWinnerMatchesCandidate:raw.finished===true&&
          raw.winner===(raw.candidateSeat??status.candidateSeat)
      };
    });
}

test('same-eight v8 owner ability policy settles Radiant VMAX search and Articuno negative controls',()=>{
  initializeCards();
  const control=runStewardBroaderV8();
  const treatment=runIssue25V8WithOwnerAbilityPolicy();
  const controlRaw=control.rawDevelopment?.rows??[];
  const treatmentRaw=treatment.rawDevelopment?.rows??[];
  preservePublicTerminalFields(control);
  preservePublicTerminalFields(treatment);
  const controlSummary=new Map(control.diagnostic.actualAttemptRows.map(row=>[row.id,row]));
  const treatmentSummary=new Map(treatment.diagnostic.actualAttemptRows.map(row=>[row.id,row]));
  const controlById=new Map(controlRaw.map(row=>[idOf(row),row]));
  const pairs=treatmentRaw.map(row=>{
    const id=idOf(row),before=controlById.get(id);
    const old=controlSummary.get(id),current=treatmentSummary.get(id);
    return {
      id,
      controlStatus:old?.status??null,
      treatmentStatus:current?.status??null,
      sameInitialSourceDeal:!!old?.sourceDealFingerprint&&
        old.sourceDealFingerprint===current?.sourceDealFingerprint,
      sameInitialFullPhysicalDeal:!!old?.fullPhysicalDealFingerprint&&
        old.fullPhysicalDealFingerprint===current?.fullPhysicalDealFingerprint,
      controlRootCount:before?rootsOf(before).length:0,
      treatmentRootCount:rootsOf(row).length,
      exactControlRootPrefix:!!before&&
        rootsOf(row).length>=rootsOf(before).length&&
        JSON.stringify(rootsOf(row).slice(0,rootsOf(before).length))===
          JSON.stringify(rootsOf(before)),
      nativeOutcome:current?.nativeOutcome??null,
      candidateSeat:current?.candidateSeat??row.candidateSeat??null,
      candidateAttackSettlement:row.candidateAttackSettlement??null
    };
  });
  const policyAudit=treatment.diagnostic.nativeOwnerAbilityPolicyAudit;
  // The outer Telepath experiment wraps all eight native calls; each call
  // carries nested ability/Telepath receipts under its telepath property.
  const perMatch=policyAudit?.nativeMatchAttempts??[];
  assert.equal(policyAudit?.nativeMatchCalls,8);
  assert.equal(perMatch.length,8);
  const abilityAudits=perMatch.map(entry=>entry?.telepath?.ownerAbilityConfirm);
  const telepathAudits=perMatch.map(entry=>entry?.telepath?.telepath);
  const radiantZeroAudits=perMatch.map(entry=>entry?.telepath?.radiantZeroGate);
  assert.ok(abilityAudits.every(Boolean));
  assert.ok(telepathAudits.every(Boolean));
  assert.ok(radiantZeroAudits.every(Boolean));
  const total=(audits,key)=>audits.reduce((sum,a)=>sum+(a[key]??0),0);
  const confirmEvents=abilityAudits.flatMap(audit=>audit.confirmEvents??[]);
  const radiantDecision=confirmEvents.filter(event=>
    event.cardName==='Radiant Eternatus');
  const articunoDecisions=confirmEvents.filter(event=>
    event.cardName==='Articuno-GX');
  const searchEvents=abilityAudits.flatMap(audit=>audit.radiantSearchEvents??[]);
  const articunoMoveEnergyEvents=abilityAudits.flatMap(audit=>
    audit.articunoMoveEnergyEvents??[]);
  const telepathAudit={
    nativeMatches:telepathAudits.length,
    matchingOwnerSearches:total(telepathAudits,'matchingOwnerSearches'),
    settled:total(telepathAudits,'settled'),
    shuffleMissing:total(telepathAudits,'shuffleMissing'),
    custodyFailures:total(telepathAudits,'custodyFailures'),
    readsOpponentHidden:telepathAudits.every(x=>x.readsOpponentHidden===false)?false:null,
    readsUnopenedDeck:telepathAudits.every(x=>x.readsUnopenedDeck===false)?false:null
  };
  const radiantZeroGate={
    nativeMatches:radiantZeroAudits.length,
    observedUseConfirmations:total(radiantZeroAudits,'observedUseConfirmations'),
    observedSearchChoices:total(radiantZeroAudits,'observedSearchChoices'),
    nonzeroNativeSelections:total(radiantZeroAudits,'nonzeroNativeSelections'),
    zeroSelections:total(radiantZeroAudits,'zeroSelections'),
    repairedShuffles:total(radiantZeroAudits,'repairedShuffles'),
    repairedTurnEnds:total(radiantZeroAudits,'repairedTurnEnds'),
    paperQualifiedGames:0
  };
  const archiveDir=process.env.ISSUE25_STEWARD_V8_ABILITY_POLICY_DIR;
  const archive=archiveDir?{
    control:writeReceipt(control,path.join(archiveDir,'control'),{
      prefix:'issue25-steward-v8',policyEntryPoint:control.manifest.policyEntryPoint
    }),
    treatment:writeReceipt(treatment,path.join(archiveDir,'treatment'),{
      prefix:'issue25-steward-v8',policyEntryPoint:treatment.manifest.policyEntryPoint
    })
  }:null;
  const report={
    schema:'agent36-v8-owner-ability-confirm-policy-native-v1',
    controlAttempts:controlRaw.length,treatmentAttempts:treatmentRaw.length,
    sameRegistration:pairs.length===8&&pairs.every(row=>controlById.has(row.id)),
    sameInitialSourceDeals:pairs.every(row=>row.sameInitialSourceDeal),
    sameInitialFullPhysicalDeals:pairs.every(row=>row.sameInitialFullPhysicalDeal),
    exactPriorRootPrefixAllArms:pairs.every(row=>row.exactControlRootPrefix),
    allTreatmentOutcomesTerminalOrCap:pairs.length===8&&pairs.every(row=>
      row.nativeOutcome==='native-terminal'||row.nativeOutcome==='action-cap'),
    confirmOffers:total(abilityAudits,'confirmOffers'),
    confirmSettled:total(abilityAudits,'confirmSettled'),
    confirmUnsettled:total(abilityAudits,'confirmUnsettled'),
    radiantDecision,articunoDecisions,searchEvents,
    articunoMoveEnergyEvents,
    telepathAudit,radiantZeroGate,pairs,archive,
    readsOpponentHidden:abilityAudits.every(x=>x.readsOpponentHidden===false)?
      false:null,
    readsUnopenedDeck:abilityAudits.every(x=>x.readsUnopenedDeck===false)?
      false:null,
    competitiveGamesQualified:0,releaseQualified:false
  };
  console.log('AGENT36_V8_OWNER_ABILITY_POLICY_NATIVE',JSON.stringify(report));
  assert.equal(report.controlAttempts,8);
  assert.equal(report.treatmentAttempts,8);
  assert.equal(report.sameRegistration,true);
  assert.equal(report.sameInitialSourceDeals,true);
  assert.equal(report.sameInitialFullPhysicalDeals,true);
  assert.equal(report.exactPriorRootPrefixAllArms,true);
  assert.equal(report.allTreatmentOutcomesTerminalOrCap,true);
  assert.equal(report.confirmOffers,11);
  assert.equal(report.confirmSettled,11);
  assert.equal(report.confirmUnsettled,0);
  assert.equal(report.readsOpponentHidden,false);
  assert.equal(report.readsUnopenedDeck,false);
  assert.equal(radiantDecision.length,1);
  assert.equal(radiantDecision[0].decision,true);
  assert.equal(radiantDecision[0].reason,'radiant-has-bench-capacity');
  assert.equal(articunoDecisions.length,2);
  assert.ok(articunoDecisions.every(event=>event.decision===false));
  assert.ok(articunoDecisions.every(event=>
    event.reason==='articuno-insufficient-or-excess-water-transfer'));
  assert.equal(searchEvents.length,1);
  assert.ok(searchEvents[0].targetCount>=1);
  assert.equal(searchEvents[0].allTargetsVmax,true);
  assert.equal(searchEvents[0].promptSettled,true);
  assert.equal(searchEvents[0].physicallyBenched,true);
  assert.equal(searchEvents[0].stillInDeck,false);
  assert.equal(report.articunoMoveEnergyEvents.length,0);
  assert.ok(telepathAudit);
  assert.equal(telepathAudit.readsOpponentHidden,false);
  assert.equal(telepathAudit.readsUnopenedDeck,false);
  assert.ok(telepathAudit.matchingOwnerSearches>=2);
  assert.equal(telepathAudit.settled,telepathAudit.matchingOwnerSearches);
  assert.equal(telepathAudit.shuffleMissing,0);
  assert.equal(telepathAudit.custodyFailures,0);
  assert.equal(radiantZeroGate.nativeMatches,8);
  assert.ok(radiantZeroGate.observedUseConfirmations>=1);
  assert.ok(radiantZeroGate.observedSearchChoices>=1);
  assert.ok(radiantZeroGate.nonzeroNativeSelections>=1);
  assert.equal(radiantZeroGate.zeroSelections,0);
  assert.equal(radiantZeroGate.repairedShuffles,0);
  assert.equal(radiantZeroGate.repairedTurnEnds,0);
  assert.equal(radiantZeroGate.paperQualifiedGames,0);
  assert.equal(treatment.manifest.releaseQualified,false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified,0);
});


test('nested owner-Ability/Telepath and Agent1 paper hook ends zero-target Radiant turns on both seats',()=>{
  const {probeZeroClimacticGate}=require(
    '../simulation/twinleaf/agent1-radiant-zero-gate-native.cjs');
  const {withTelepathAndOwnerAbilityPolicy}=require(
    '../simulation/evaluation/agent36-issue25-v8-owner-ability-policy.cjs');
  for(const seat of [0,1]){
    const raw=probeZeroClimacticGate(seat,0,{reverseShuffle:true});
    const {result,audit}=withTelepathAndOwnerAbilityPolicy(()=>
      probeZeroClimacticGate(seat,0,{reverseShuffle:true}));
    assert.equal(raw.after.turn,4);
    assert.equal(raw.after.activePlayer,seat);
    assert.equal(raw.shuffleChangedPhysicalOrder,null);
    assert.equal(result.after.turn,5);
    assert.equal(result.after.activePlayer,1-seat);
    assert.equal(result.shuffleChangedPhysicalOrder,true);
    assert.deepEqual(result.pendingPrompts,[]);
    assert.equal(audit.radiantZeroGate.zeroSelections,1);
    assert.equal(audit.radiantZeroGate.repairedShuffles,1);
    assert.equal(audit.radiantZeroGate.repairedTurnEnds,1);
    assert.equal(audit.radiantZeroGate.paperQualifiedGames,0);
    assert.ok(result.events.every(e=>e.validated&&e.error===null));
  }
});

test('nested native policy composes unchanged positive and declined Radiant paths',()=>{
  const {probeZeroClimacticGate}=require(
    '../simulation/twinleaf/agent1-radiant-zero-gate-native.cjs');
  const {withTelepathAndOwnerAbilityPolicy}=require(
    '../simulation/evaluation/agent36-issue25-v8-owner-ability-policy.cjs');
  for(const seat of [0,1]){
    const accepted=withTelepathAndOwnerAbilityPolicy(()=>
      probeZeroClimacticGate(seat,1));
    assert.equal(accepted.result.after.turn,5);
    assert.equal(accepted.result.after.activePlayer,1-seat);
    assert.equal(accepted.result.vmaxBenched,true);
    assert.equal(accepted.audit.radiantZeroGate.nonzeroNativeSelections,1);
    assert.equal(accepted.audit.radiantZeroGate.repairedTurnEnds,0);
    assert.equal(accepted.audit.radiantZeroGate.repairedShuffles,0);
    const declined=withTelepathAndOwnerAbilityPolicy(()=>
      probeZeroClimacticGate(seat,0,{useAbility:false}));
    assert.equal(declined.result.after.turn,4);
    assert.equal(declined.result.after.activePlayer,seat);
    assert.equal(declined.audit.radiantZeroGate.declinedUses,1);
    assert.equal(declined.audit.radiantZeroGate.zeroSelections,0);
    assert.equal(declined.audit.radiantZeroGate.repairedTurnEnds,0);
  }
});


test('nested native owner-Ability audit survives an intentional abort with prototypes restored',()=>{
  const {withTelepathAndOwnerAbilityPolicy}=require(
    '../simulation/evaluation/agent36-issue25-v8-owner-ability-policy.cjs');
  const {probeZeroClimacticGate}=require(
    '../simulation/twinleaf/agent1-radiant-zero-gate-native.cjs');
  const aborted=new Error('synthetic-native-abort-before-action');
  assert.throws(()=>withTelepathAndOwnerAbilityPolicy(()=>{
    throw aborted;
  }),error=>error===aborted);
  assert.equal(aborted.ownerTelepathicAudit?.disposition,
    'native-abort-unqualified');
  assert.equal(aborted.ownerTelepathicAudit?.competitiveGamesQualified,0);
  assert.equal(aborted.ownerTelepathicAudit?.ownerAbilityConfirm?.confirmOffers,0);
  assert.equal(aborted.ownerTelepathicAudit?.telepath?.physicalStores,0);
  assert.equal(aborted.ownerTelepathicAudit?.radiantZeroGate,null);
  // A fresh raw Store fixture after the exception must have no lingering
  // zero-target correction: the original pinned bug still reproduces.
  const raw=probeZeroClimacticGate(0,0);
  assert.equal(raw.after.turn,4);
  assert.equal(raw.shuffleChangedPhysicalOrder,null);
});


test('pinned Store settles owner-only Articuno Ascent Water transfer on both physical seats',()=>{
  initializeCards();
  const {withOwnerAbilityConfirmPolicy}=require(
    '../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
  const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const {Store}=load('game/store/store');
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {CardManager}=load('game/cards/card-manager');
  const manager=CardManager.getInstance();
  const card=name=>{
    const physical=manager.getCardByName(name);
    assert.ok(physical,'Missing pinned printing '+name);
    return physical;
  };
  for(const seat of [0,1]){
    const actor=new Player(),other=new Player();
    actor.id=801;
    actor.name='articuno-owner';
    other.id=802;
    other.name='opponent';
    actor.bench=Array.from({length:5},()=>new PokemonCardList());
    other.bench=Array.from({length:5},()=>new PokemonCardList());
    actor.active.cards.push(card('Snorlax PGO'));
    other.active.cards.push(card('Regidrago V SIT'));
    const waterCards=Array.from({length:3},()=>card('Water Energy SVE'));
    for(const energy of waterCards){
      actor.active.cards.push(energy);
      actor.active.energies.cards.push(energy);
    }
    actor.hand.cards.push(card('Articuno-GX CES'));
    const state=new State();
    state.players=seat===0?[actor,other]:[other,actor];
    state.turn=4;
    state.activePlayer=seat;
    state.phase=GamePhase.PLAYER_TURN;
    for(const player of state.players){
      player.deck.cards.push(card('Psychic Energy SVE'),
        card('Psychic Energy SVE'),card('Psychic Energy SVE'));
      player.prizes=Array.from({length:6},()=>{
        const prize=new CardList();
        prize.cards.push(card('Psychic Energy SVE'));
        return prize;
      });
    }
    const store=new Store({onStateChange(){}});
    store.state=state;
    const bot=new SimpleTacticsAi({id:actor.id},
      {tactics:[],promptResolvers:[]},null);
    const {result,audit}=withOwnerAbilityConfirmPolicy(()=>{
      store.dispatch(new PlayCardAction(actor.id,0,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }));
      const prompts=[];
      for(let i=0;i<5;i++){
        const prompt=store.state.prompts.find(p=>p.result===undefined);
        if(!prompt)break;
        const action=bot.decodeNextAction(store.state);
        assert.ok(action,'Owner policy did not answer '+prompt.constructor.name);
        assert.equal(action.constructor.name,'ResolvePromptAction');
        store.dispatch(action);
        prompts.push({name:prompt.constructor.name,message:prompt.message,
          answered:action.result});
      }
      return {
        prompts,
        active:actor.active.getPokemonCard()?.name,
        benched:actor.bench.map(slot=>slot.getPokemonCard()?.name).filter(Boolean),
        attachedWater:actor.active.energies.cards.filter(e=>e.name==='Water Energy'),
        priorWater:actor.bench.flatMap(slot=>slot.energies.cards)
          .filter(e=>e.name==='Water Energy'),
        unsettled:store.state.prompts.filter(p=>p.result===undefined).length
      };
    });
    assert.equal(result.active,'Articuno-GX');
    assert.ok(result.benched.includes('Snorlax'));
    assert.equal(result.attachedWater.length,3);
    assert.equal(result.priorWater.length,0);
    assert.ok(waterCards.every(energy=>result.attachedWater.includes(energy)));
    assert.equal(result.unsettled,0);
    assert.deepEqual(result.prompts.map(p=>p.name),
      ['ConfirmPrompt','MoveEnergyPrompt']);
    assert.equal(result.prompts[0].answered,true);
    assert.equal(result.prompts[1].answered.length,3);
    assert.equal(audit.confirmSettled,1);
    assert.equal(audit.confirmEvents[0].cardName,'Articuno-GX');
    assert.equal(audit.confirmEvents[0].decision,true);
    assert.equal(audit.articunoMoveEnergyEvents.length,1);
    assert.equal(audit.articunoMoveEnergyEvents[0].physicallyMoved,true);
    assert.equal(audit.articunoMoveEnergyEvents[0].promptSettled,true);
    assert.equal(audit.articunoMoveEnergyEvents[0].allWaterEnergy,true);
    assert.equal(audit.readsOpponentHidden,false);
    assert.equal(audit.readsUnopenedDeck,false);
    console.log('AGENT32_OWNER_ARTICUNO_NATIVE',
      JSON.stringify({seat,
        prompts:result.prompts.map(p=>({name:p.name,
          answerCount:Array.isArray(p.answered)?p.answered.length:null})),
        attachedWaterCount:result.attachedWater.length,
        settledTransfers:audit.articunoMoveEnergyEvents[0].transferCount,
        stage:'native-prepared-board-unqualified'}));
  }
});

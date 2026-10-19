'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const SUPPORTERS=['Crispin',"Lillie's Determination",'Guzma','Carmine','Iono',
  'Wally','Karen','Roxanne'];
const TOOLS=['Muscle Band','Forest Seal Stone','Float Stone'];

/**
 * Inspect ONLY a real owner-deck Secret Box search prompt, after the Item was
 * actually played. The deck is deliberately not examined at the policy trigger.
 * Preserve baseline Item/Stadium access, and choose available extra printed
 * categories only if the pinned prompt accepts the entire selection.
 * @param {object} prompt Actual ChooseCardsPrompt
 * @param {object} owner Acting player
 * @param {object} state Current Store state
 * @returns {object}
 */
function inspectSecretBoxCategories(prompt,owner,state){
  assert.strictEqual(prompt.cards,owner.deck,'Owner search boundary');
  const cards=prompt.cards.cards;
  const get=name=>cards.find(card=>card.name===name);
  const item=get('Quick Ball'),stadium=get('Temple of Sinnoh');
  assert.ok(item && stadium,'Known authentic two-category source route absent');
  const options={supporter:SUPPORTERS.filter(name=>get(name)),
    tool:TOOLS.filter(name=>get(name))};
  const valid=selection=>prompt.validate(selection,state)===true;
  assert.equal(valid([item,stadium]),true,'Existing two-category source route rejected');
  const attempts=[];
  let accepted=null;
  const supporter=[...options.supporter,null];
  const tool=[...options.tool,null];
  for(const s of supporter){
    for(const t of tool){
      if(!s&&!t)continue;
      const selection=[item,...(t?[get(t)]:[]),...(s?[get(s)]:[]),stadium];
      const allowed=valid(selection);
      attempts.push({supporter:s,tool:t,accepted:allowed});
      if(allowed && (!accepted || selection.length>accepted.cards.length)){
        accepted={cards:selection,supporter:s,tool:t};
      }
    }
  }
  const selected=accepted?.cards??[item,stadium];
  return {ownerSearchPrompt:true,
    availableSupporterNames:options.supporter,
    availableToolNames:options.tool,
    examinedSelections:attempts,
    acceptedExtraCategories:selected.length-2,
    selectedNames:selected.map(card=>card.name),
    selectedPrintings:selected.map(card=>card.fullName),
    selectedCards:selected,
    allSelectedNativeValidated:valid(selected)};
}

/**
 * Replace only the actual rank8 Secret Box owner's prompt resolution from the
 * existing authentic source-positive-control fork. Other bot decisions remain
 * untouched. The outer fork deliberately chooses the two-category route;
 * we call it first so its state machine advances, then replace only the
 * native ResolvePromptAction. The compiled Store ledger is authoritative.
 * @template T
 * @param {()=>T} execute Inner complete-game run
 * @returns {{result:T,searchAudit:object|null,replacedNativePrompt:boolean}}
 */
function withRank8OwnerSearchExpansion(execute){
  const engineRoot=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(engineRoot,'simple-bot/simple-tactics-ai'));
  const {ResolvePromptAction}=require(path.join(engineRoot,
    'game/store/actions/resolve-prompt-action'));
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  let searchAudit=null,replacedNativePrompt=false;
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const owner=state.players.find(p=>p.id===this.client?.id);
    const pending=state.prompts.find(p=>p.result===undefined);
    const isSearch=this.client?.id===101 && state.turn===7 &&
      state.activePlayer===0 && pending?.constructor.name==='ChooseCardsPrompt' &&
      pending.cards===owner?.deck && pending.options?.max===4 &&
      pending.cards.cards.some(c=>c.name==='Quick Ball') &&
      pending.cards.cards.some(c=>c.name==='Temple of Sinnoh');
    if(!isSearch)return previous.call(this,state);
    assert.equal(searchAudit,null,'Secret Box search occurred twice');
    const inspected=inspectSecretBoxCategories(pending,owner,state);
    const baseline=previous.call(this,state);
    assert.equal(baseline?.constructor.name,'ResolvePromptAction',
      'Original source scripted search not reached');
    const {selectedCards,...publicAudit}=inspected;
    searchAudit=publicAudit;
    if(inspected.acceptedExtraCategories===0)return baseline;
    replacedNativePrompt=true;
    return new ResolvePromptAction(pending.id,selectedCards);
  };
  try{return {result:execute(),searchAudit,replacedNativePrompt};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=previous;}
}

/** Genuine printed source 60 and original opponent/candidate hand/deal replay. */
function run(){
  const {runMatch,initializeCards}=require('./headless.cjs');
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {withRank8BoostShakeFork}=require('./rank8-boostshake-source-fork.cjs');
  const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(d=>d.rank===8);
  assert.equal(opponent?.status,'ready');
  initializeCards();
  const request={deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:1260748957,maxActions:200,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,captureDecisionTrace:true};
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const opts={liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true};
  const trace=fn=>withStoreDispatchTranscript(Store,fn,opts);
  const control=trace(()=>runMatch(request));
  const baseline=trace(()=>withRank8BoostShakeFork(()=>runMatch(request)));
  const extended=trace(()=>withRank8BoostShakeFork(()=>
    withRank8OwnerSearchExpansion(()=>runMatch(request))));
  const old=baseline.result,newFork=extended.result;
  assert.equal(old.stage,11);
  assert.equal(newFork.stage,11);
  assert.ok(newFork.result.searchAudit,'Real Secret Box owner search not observed');
  assert.equal(newFork.result.searchAudit.allSelectedNativeValidated,true);
  assert.deepEqual(baseline.actionTrace.slice(0,86),
    control.actionTrace.slice(0,86));
  assert.deepEqual(extended.actionTrace.slice(0,86),
    control.actionTrace.slice(0,86));
  for(const board of [old.turn8,newFork.turn8]){
    assert.ok(board && board.board[0].bench.some(slot=>
      slot.name==='Garbodor'&&slot.tools.includes('Float Stone')));
  }
  const restored=trace(()=>runMatch(request));
  assert.deepEqual(restored.actionTrace,control.actionTrace,
    'Source prompt adapter leaked into later unmodified game');
  return {
    schema:'rank8-secret-box-real-owner-prompt-expansion-v1',
    originalRank8SourceSeed:1260748957,sourcePrefixRoots:86,
    historicalRetrospectiveDeal:true,printedRank8Source60:true,
    printedHoodCandidate60:true,
    nativePrompt:newFork.result.searchAudit,
    nativePromptResolutionReplaced:newFork.result.replacedNativePrompt,
    baselineEndTurnSourceHand:old.turn8.board[0].hand,
    expandedEndTurnSourceHand:newFork.turn8.board[0].hand,
    baselineCandidateTurn8Hand:old.turn8.board[1].hand,
    expandedCandidateTurn8Hand:newFork.turn8.board[1].hand,
    originalSource86RootPrefixPreserved:true,
    originalLockCompletes:true,expandedLockCompletes:true,
    noOpAfterRestorationReplaysIdentically:true,
    baseGame:{finished:old.result.finished,
      actions:old.result.actions,prizes:old.result.prizesRemaining},
    expandedGame:{finished:newFork.result.result.finished,
      actions:newFork.result.result.actions,
      prizes:newFork.result.result.prizesRemaining},
    qualifiedForCompetitiveInference:false,
    caveat:'Retrospectively selected game. Extra card access and future hand are not proof of improved policy, legal attacker conversion or win rate.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={SUPPORTERS,TOOLS,inspectSecretBoxCategories,
  withRank8OwnerSearchExpansion,run};

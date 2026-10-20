'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {prepare}=require('./iron-thorns-turn2-attack.cjs');
const {withNewMoonCompressorPayload,GENGAR,TREV,MEWTWO}=
  require('./new-moon-compressor-payload-policy.cjs');
const {ownerVisibleCopyOptions}=
  require('./owner-visible-perfection-pass-bridge.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const pinned=name=>require(path.join(output,name));

/**
 * Synthetic pinned Store: Mewtwo Active, Battle Compressor in hand,
 * both copy donors still inside owner's deck. No opponent hidden identities
 * are used to choose the setup action. This is not an Aichi initial deal.
 * @returns {{store:object,state:object,a:object,b:object}}
 */
function preparedOwnerState(){
  const f=prepare(true);
  const {a,b}=f;
  const manager=initializeCards();
  let nextId=3000;
  /** @param {string} name @returns {object} */
  const add=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned CardManager must have '+name);
    c.id=nextId++;
    return c;
  };
  assert.equal(a.active.getPokemonCard()?.fullName,'Iron Thorns ex TWM');
  a.active.cards.shift();
  a.active.cards.unshift(add(MEWTWO));
  a.hand.cards.push(add('Battle Compressor PHF'));
  a.deck.cards.push(add(GENGAR),add(TREV));
  assert.equal(a.discard.cards.length,0);
  assert.ok(!a.hand.cards.some(c=>c.fullName===GENGAR));
  assert.ok(!a.bench.some(slot=>slot.getPokemonCard()?.fullName===GENGAR));
  return f;
}

/**
 * Drive the actual pinned SimpleTacticsAi candidate's first two decisions
 * against a real Store. Owner deck identity is read only when the Item's
 * legal ChooseCardsPrompt exposes it to the owner.
 * @returns {object}
 */
function main(){
  const {store,a}=preparedOwnerState();
  const {SimpleTacticsAi}=pinned('simple-bot/simple-tactics-ai');
  const defs=pinned('simple-bot/simple-bot-definitions');
  const {PlayCardAction}=pinned('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    pinned('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=
    pinned('game/store/prompts/choose-cards-prompt');

  const options=withNewMoonCompressorPayload({
    tactics:defs.allSimpleTactics,
    promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,
    arbiter:defs.defaultArbiterOptions
  });
  const ai=new SimpleTacticsAi({id:a.id},options,null);
  const beforeDeckSize=a.deck.cards.length;
  const first=ai.decodeNextAction(store.state);
  assert.ok(first instanceof PlayCardAction,
    'Actual bot must select its proactive Compressor play');
  assert.equal(a.hand.cards[first.handIndex]?.name,'Battle Compressor');
  store.dispatch(first);

  const owner=store.state.players[0];
  const prompt=store.state.prompts.find(p=>p.result===undefined &&
    p instanceof ChooseCardsPrompt && p.player===owner &&
    p.cards===owner.deck);
  assert.ok(prompt,'Item must expose its own-deck ChooseCardsPrompt');
  assert.equal(owner.supporter.cards.some(c=>c.name==='Battle Compressor'),
    true,'Pinned Item must remain visible in play while prompting');

  const second=ai.decodeNextAction(store.state);
  assert.ok(second instanceof ResolvePromptAction,
    'Custom resolver must answer the genuine own-card selection prompt');
  const selected=Array.isArray(second.result) ?
    second.result.map(x=>typeof x==='number'?
      prompt.cards.cards[x]?.fullName:x?.fullName) : [];
  assert.ok(selected.includes(GENGAR),
    'Gengar must be selected only after its actual owner-deck prompt');
  assert.ok(selected.includes(TREV),
    'Trevenant must be selected only after its actual owner-deck prompt');
  store.dispatch(second);

  const finalOwner=store.state.players[0];
  assert.ok(finalOwner.discard.cards.some(c=>c.fullName===GENGAR));
  assert.ok(finalOwner.discard.cards.some(c=>c.fullName===TREV));
  assert.equal(finalOwner.deck.cards.length,beforeDeckSize-2);
  assert.ok(ownerVisibleCopyOptions(finalOwner).some(
    entry=>entry.source===GENGAR&&entry.attack==='Horror House-GX'));
  const out={
    schema:'owner-visible-compressor-genuine-prompt-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    stagedOwnerFirstSelected: 'Battle Compressor PHF',
    actualPromptClass:prompt.constructor.name,
    itemStagedInSupporterZone:true,
    promptSelectedPrintings:selected,
    discardContainsBothPerfectionDonors:true,
    liveOwnerCopyOptions:ownerVisibleCopyOptions(finalOwner),
    ownerDeckCardsBefore:beforeDeckSize,
    ownerDeckCardsAfter:finalOwner.deck.cards.length,
    syntheticBoard:true,sourceAichiDeal:false,
    opponentDecisionsTested:false,completeGame:false,
    qualifiedForCompetitiveInference:false
  };
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  return out;
}

/**
 * Genuine item-play/prompt check of the corrected hand-held donor rule.
 * A Gengar in hand is NOT a Perfection donor. The other GX payload remains
 * eligible for Battle Compressor and should be selected from owner deck.
 * No initial-card multiset is changed; only that own card's zone changes.
 * @returns {object}
 */
function heldGengarCounterexample(){
  const {store,a}=preparedOwnerState();
  const {shouldSeekPayload}=require('./new-moon-compressor-payload-policy.cjs');
  const {SimpleTacticsAi}=pinned('simple-bot/simple-tactics-ai');
  const defs=pinned('simple-bot/simple-bot-definitions');
  const {GamePhase}=pinned('game/store/state/state');
  const {PlayCardAction}=pinned('game/store/actions/play-card-action');
  const {ResolvePromptAction}=pinned('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=pinned('game/store/prompts/choose-cards-prompt');
  const location=a.deck.cards.findIndex(c=>c.fullName===GENGAR);
  assert.ok(location>=0);
  const [held]=a.deck.cards.splice(location,1);
  a.hand.cards.push(held);
  assert.equal(shouldSeekPayload(store.state,a,GamePhase.PLAYER_TURN),true,
    'Held Gengar cannot satisfy the Bench/discard Perfection donor rule');
  const opts=withNewMoonCompressorPayload({
    tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions
  });
  const ai=new SimpleTacticsAi({id:a.id},opts,null);
  const first=ai.decodeNextAction(store.state);
  assert.ok(first instanceof PlayCardAction);
  assert.equal(a.hand.cards[first.handIndex]?.name,'Battle Compressor');
  store.dispatch(first);
  const owner=store.state.players[0];
  const prompt=store.state.prompts.find(p=>p.result===undefined &&
    p instanceof ChooseCardsPrompt && p.player===owner &&
    p.cards===owner.deck);
  assert.ok(prompt,'Compressor must expose the real owner-deck prompt');
  const answer=ai.decodeNextAction(store.state);
  assert.ok(answer instanceof ResolvePromptAction);
  const selected=Array.isArray(answer.result)?answer.result.map(x=>
    typeof x==='number'?prompt.cards.cards[x]?.fullName:x?.fullName):[];
  assert.deepEqual(selected,[TREV],
    'Only own-deck Trevenant can be discarded; held Gengar cannot be');
  store.dispatch(answer);
  const finalOwner=store.state.players[0];
  assert.ok(finalOwner.hand.cards.some(c=>c.fullName===GENGAR));
  assert.ok(finalOwner.discard.cards.some(c=>c.fullName===TREV));
  assert.ok(!finalOwner.discard.cards.some(c=>c.fullName===GENGAR));
  const copies=ownerVisibleCopyOptions(finalOwner);
  assert.ok(copies.some(x=>x.source===TREV && x.attack==='Night Watch'));
  assert.ok(!copies.some(x=>x.source===GENGAR));
  const summary={
    schema:'owner-visible-held-gengar-compressor-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    heldGengarPreventedCompressor:false,
    genuinePrompt:prompt.constructor.name,
    selectedFromOwnDeck:selected,
    gengarRemainsHeld:true,
    livePerfectionCopyOptions:copies,
    aichiSourceDeal:false,competitiveQualified:false
  };
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
  return summary;
}

/**
 * Native anticipatory owner setup with Mewtwo only on the Bench.
 * Explicit mode must decide to Compressor before Mewtwo is Active,
 * whereas the old registered default must preserve its active-only gate.
 * @returns {object}
 */
function benchedMewtwoPreparation(){
  const {store,a}=preparedOwnerState();
  const {shouldSeekPayload}=require('./new-moon-compressor-payload-policy.cjs');
  const {GamePhase}=pinned('game/store/state/state');
  const {PokemonCardList}=pinned('game/store/state/pokemon-card-list');
  const {SimpleTacticsAi}=pinned('simple-bot/simple-tactics-ai');
  const defs=pinned('simple-bot/simple-bot-definitions');
  const {PlayCardAction}=pinned('game/store/actions/play-card-action');
  const {ResolvePromptAction}=pinned('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=pinned('game/store/prompts/choose-cards-prompt');

  const [mewtwo]=a.active.cards.splice(0,1);
  assert.equal(mewtwo.fullName,MEWTWO);
  const activeIron=initializeCards().getCardByName('Iron Thorns ex TWM');
  assert.ok(activeIron);
  activeIron.id=45000;
  a.active.cards.unshift(activeIron);
  const benchSlot=new PokemonCardList();
  benchSlot.cards.push(mewtwo);
  a.bench.push(benchSlot);
  assert.equal(a.active.getPokemonCard()?.fullName,'Iron Thorns ex TWM');
  assert.equal(a.bench[0].getPokemonCard()?.fullName,MEWTWO);
  assert.equal(shouldSeekPayload(store.state,a,GamePhase.PLAYER_TURN),false);
  assert.equal(shouldSeekPayload(store.state,a,GamePhase.PLAYER_TURN,{
    allowBenchedMewtwo:true
  }),true);
  const options=withNewMoonCompressorPayload({
    tactics:defs.allSimpleTactics,
    promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,
    arbiter:defs.defaultArbiterOptions
  },{allowBenchedMewtwo:true});
  const ai=new SimpleTacticsAi({id:a.id},options,null);
  const first=ai.decodeNextAction(store.state);
  assert.ok(first instanceof PlayCardAction);
  assert.equal(a.hand.cards[first.handIndex]?.name,'Battle Compressor');
  store.dispatch(first);

  const live=store.state.players[0];
  const prompt=store.state.prompts.find(p=>p.result===undefined &&
    p instanceof ChooseCardsPrompt && p.player===live &&
    p.cards===live.deck);
  assert.ok(prompt);
  const answer=ai.decodeNextAction(store.state);
  assert.ok(answer instanceof ResolvePromptAction);
  const selected=answer.result.map(c=>typeof c==='number' ?
    prompt.cards.cards[c]?.fullName:c?.fullName);
  assert.deepEqual(selected,[GENGAR,TREV]);
  store.dispatch(answer);
  const final=store.state.players[0];
  assert.ok(final.discard.cards.some(c=>c.fullName===GENGAR));
  assert.ok(final.discard.cards.some(c=>c.fullName===TREV));
  assert.equal(final.active.getPokemonCard()?.fullName,'Iron Thorns ex TWM');
  assert.equal(final.bench[0].getPokemonCard()?.fullName,MEWTWO);
  const copyNow=ownerVisibleCopyOptions(final);
  assert.deepEqual(copyNow,[],
    'Perfection copies require Mewtwo Active even after early discard');
  const result={
    schema:'owner-visible-benched-mewtwo-early-donor-setup-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    defaultSourceGateAllowed:false,explicitBenchGateAllowed:true,
    initialOwnerActive:'Iron Thorns ex TWM',
    initialOwnerBench:[MEWTWO],
    genuinePrompt:prompt.constructor.name,
    selectedFromOwnDeck:selected,
    bothDonorsMovedToDiscard:true,
    immediateCopiesWhileMewtwoBenched:copyNow,
    futureMewtwoPromotionRequired:true,
    syntheticBoard:true,sourceAichiDeal:false,
    qualifiedForCompetitiveInference:false
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}

/**
 * Real pinned Store regression for the independently enabled second donor.
 * Gengar is already established in discard and only Trevenant remains in
 * the owner deck. The archived default policy must decline to initiate an
 * Item, while the explicit second-donor mode must play Compressor, resolve
 * the native owner-search prompt, and expose Night Watch to Perfection.
 * This is a synthetic position, never a source-dealt competitive game.
 * @returns {object}
 */
function establishedGengarSecondDonor(){
  const {store,a}=preparedOwnerState();
  const {shouldSeekPayload}=require('./new-moon-compressor-payload-policy.cjs');
  const {SimpleTacticsAi}=pinned('simple-bot/simple-tactics-ai');
  const defs=pinned('simple-bot/simple-bot-definitions');
  const {GamePhase}=pinned('game/store/state/state');
  const {PlayCardAction}=pinned('game/store/actions/play-card-action');
  const {ResolvePromptAction}=pinned('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=pinned('game/store/prompts/choose-cards-prompt');
  const index=a.deck.cards.findIndex(c=>c.fullName===GENGAR);
  assert.ok(index>=0);
  a.discard.cards.push(...a.deck.cards.splice(index,1));
  assert.equal(shouldSeekPayload(store.state,a,GamePhase.PLAYER_TURN),false);
  assert.equal(shouldSeekPayload(store.state,a,GamePhase.PLAYER_TURN,
    {allowTrevenantOnly:true}),true);
  const options=withNewMoonCompressorPayload({
    tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions
  },{allowTrevenantOnly:true});
  const ai=new SimpleTacticsAi({id:a.id},options,null);
  const action=ai.decodeNextAction(store.state);
  assert.ok(action instanceof PlayCardAction);
  assert.equal(a.hand.cards[action.handIndex]?.name,'Battle Compressor');
  store.dispatch(action);
  const owner=store.state.players[0];
  const prompt=store.state.prompts.find(p=>p.result===undefined &&
    p instanceof ChooseCardsPrompt && p.player===owner &&
    p.cards===owner.deck);
  assert.ok(prompt,'Genuine Battle Compressor owner-deck prompt required');
  const reply=ai.decodeNextAction(store.state);
  assert.ok(reply instanceof ResolvePromptAction);
  const selected=reply.result.map(c=>typeof c==='number'?
    prompt.cards.cards[c]?.fullName:c?.fullName);
  assert.deepEqual(selected,[TREV]);
  store.dispatch(reply);
  const finalOwner=store.state.players[0];
  assert.ok(finalOwner.discard.cards.some(c=>c.fullName===TREV));
  assert.ok(finalOwner.discard.cards.some(c=>c.fullName===GENGAR));
  assert.ok(ownerVisibleCopyOptions(finalOwner).some(entry=>
    entry.source===TREV && entry.attack==='Night Watch'));
  const result={
    schema:'newmoon-second-donor-genuine-native-owner-prompt-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    historicalDefaultInitiates:false,explicitSecondDonorInitiates:true,
    nativeSelectedFromOwnerDeck:selected,actualItemRoot:'Battle Compressor',
    donorAvailableForPerfection:true,
    syntheticBoard:true,competitiveQualified:false
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\\n');
  return result;
}

if(require.main===module){
  main();
  heldGengarCounterexample();
  benchedMewtwoPreparation();
  establishedGengarSecondDonor();
}
module.exports={main,preparedOwnerState,heldGengarCounterexample,
  benchedMewtwoPreparation,establishedGengarSecondDonor};

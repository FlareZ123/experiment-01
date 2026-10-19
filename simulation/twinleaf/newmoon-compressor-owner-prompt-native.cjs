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

if(require.main===module)main();
module.exports={main,preparedOwnerState};

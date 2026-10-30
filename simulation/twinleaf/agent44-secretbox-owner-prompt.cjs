'use strict';

const assert=require('node:assert/strict');

const SEARCHER_DISCARD_COST=new Map([
  ['Battle VIP Pass',0],['Quick Ball',1],['Ultra Ball',2]
]);
const COMPATIBLE_TOOLS=['Float Stone','Muscle Band'];

/**
 * Read only an authenticated owner-deck ChooseCardsPrompt after Secret Box
 * has already been natively played and its three-card discard cost paid.
 * Reports whether a Box Item-search to unprized Shake can support a concrete
 * Trubbish + Garbodor + Tool line. No opponent concealed zones enter.
 *
 * @param {object} prompt Actual native ChooseCardsPrompt.
 * @param {object} owner Owner authenticated by prompt.playerId.
 * @param {object} state Genuine Store state solely for native validate().
 * @returns {object} Native card references if accepted; no action if blocked.
 */
function chooseOwnedBoxFetchShake(prompt,owner,state){
  assert.strictEqual(prompt.cards,owner.deck,
    'Secret Box selector may only inspect the authentic owner deck');
  assert.equal(prompt.playerId,owner.id,
    'Secret Box selector may only run for its native prompted owner');
  assert.ok(prompt.constructor?.name==='ChooseCardsPrompt',
    'Secret Box owner K1 requires an actual ChooseCardsPrompt');
  assert.ok(prompt.options?.maxItems===1&&
    prompt.options?.maxTools!==undefined&&
    prompt.options?.maxSupporters!==undefined&&
    prompt.options?.maxStadiums!==undefined,
  'Unsupported owner search signature, not a Secret Box category prompt');

  const deck=owner.deck.cards;
  const hand=owner.hand.cards;
  const first=(cards,names)=>names.map(name=>
    cards.find(card=>card.name===name)).find(Boolean)??null;
  const shake=first(deck,['Boost Shake']);
  const garbo=first(deck,['Garbodor']);
  const toolHeld=first(hand,COMPATIBLE_TOOLS);
  const toolDeck=first(deck,COMPATIBLE_TOOLS);
  const trubbishInPlay=[
    owner.active,...owner.bench
  ].some(slot=>slot?.getPokemonCard?.()?.name==='Trubbish');
  const trubbishHeld=first(hand,['Trubbish']);
  const trubbishDeck=first(deck,['Trubbish']);
  const openBench=owner.bench.some(slot=>
    !slot.getPokemonCard?.());
  const searchers=[...SEARCHER_DISCARD_COST].filter(([name])=>
    hand.some(card=>card.name===name))
    .sort((a,b)=>a[1]-b[1]);
  const searcher=searchers.find(([name,cost])=>{
    // Preserve this Item; the other remaining cards pay any later discard.
    const leftovers=hand.filter(card=>card.name!==name).length;
    return leftovers>=cost;
  });
  const canObtainTrubbish=Boolean(
    trubbishInPlay||trubbishHeld||trubbishDeck&&searcher);
  const canPositionTrubbish=trubbishInPlay||openBench;
  const needsTool=!toolHeld;
  const availableTool=!needsTool||Boolean(toolDeck);
  const sources={
    shakeInDeck:Boolean(shake),
    garbodorInDeck:Boolean(garbo),
    trubbishInPlay,trubbishHeld:Boolean(trubbishHeld),
    trubbishInDeck:Boolean(trubbishDeck),
    benchFree:openBench,
    basicSearcherHeld:searcher?.[0]??null,
    additionalDiscardCost:searcher?.[1]??null,
    heldTool:toolHeld?.name??null,
    searchedTool:needsTool?toolDeck?.name??null
  };
  const feasible=Boolean(shake&&garbo&&canObtainTrubbish&&
    canPositionTrubbish&&availableTool);
  if(!feasible)return {eligible:false,reason:'K1_PHYSICAL_COMPONENT_MISSING',
    sources,selectedNames:[],selectedCards:[],nativeAccepted:false};
  const selected=[shake,...(needsTool?[toolDeck]:[])];
  const nativeAccepted=prompt.validate(selected,state)===true;
  return {
    eligible:nativeAccepted,
    reason:nativeAccepted?'NATIVE_OWNER_PROMPT_ACCEPTS_BOX_SHAKE':
      'NATIVE_PROMPT_REJECTED_SELECTION',
    sources,
    selectedNames:selected.map(card=>card.name),
    selectedPrintings:selected.map(card=>card.fullName),
    selectedCards:nativeAccepted?selected:[],
    nativeAccepted
  };
}

module.exports={SEARCHER_DISCARD_COST,COMPATIBLE_TOOLS,
  chooseOwnedBoxFetchShake};

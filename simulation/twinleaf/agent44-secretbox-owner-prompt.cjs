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
  // Battle VIP Pass is legal only during its owner's first turn. The
  // opening global turns 1 and 2 each belong to a player's first turn;
  // an unknown counter fails closed rather than treating a later VIP as a
  // guaranteed Basic search. Genuine Store will still settle final legality.
  const isOpeningTurn=Number.isSafeInteger(state.turn)&&
    state.turn>=0&&state.turn<=2;
  const protectedHeldCards=new Set([trubbishHeld,toolHeld].filter(Boolean));
  const searchers=[...SEARCHER_DISCARD_COST].filter(([name])=>
    (name!=='Battle VIP Pass'||isOpeningTurn)&&
    hand.some(card=>card.name===name))
    .sort((a,b)=>a[1]-b[1]);
  const searcher=searchers.find(([name,cost])=>{
    // Preserve the searched Item and critical held Tool/Trubbish instead
    // of counting them as disposable search costs. This check is physical
    // only; DCI of other cards still needs the acting owner's policy.
    const leftovers=hand.filter(card=>card.name!==name&&
      !protectedHeldCards.has(card)).length;
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
    firstTurnBasicSearchAvailable:isOpeningTurn,
    basicSearcherHeld:searcher?.[0]??null,
    additionalDiscardCost:searcher?.[1]??null,
    heldTool:toolHeld?.name??null,
    searchedTool:needsTool?(toolDeck?.name??null):null
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

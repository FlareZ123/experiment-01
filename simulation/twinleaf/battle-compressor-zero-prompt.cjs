'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const get=part=>require(path.join(root,part));
/**
 * @param {boolean} [useCorrection]
 * @param {boolean} [resolveEmpty]
 * @param {boolean} [resolveOne]
 * @param {boolean} [completeShuffle] Resolve the actual post-selection deck shuffle.
 */
function probe(useCorrection=false,resolveEmpty=false,resolveOne=false,completeShuffle=false) {
  const cards=initializeCards();
  const {Store}=get('game/store/store');
  const {Player}=get('game/store/state/player');
  const {CardList}=get('game/store/state/card-list');
  const {GamePhase}=get('game/store/state/state');
  const {Format}=get('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=get('game/store/actions/play-card-action');
  const card=name=>{
    const found=cards.getCardByName(name);
    assert.ok(found,'Missing compiled printing '+name);
    return found;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const a=new Player(),b=new Player();
  a.id=101;a.name='Compressor';b.id=202;b.name='Other';
  state.players=[a,b];state.activePlayer=0;
  state.turn=3;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const player of [a,b]){
    player.active.cards.push(card('Dratini OBF'));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      return prize;
    });
    player.deck.cards.push(card('Psychic Energy MEE'));
  }
  a.deck.cards.push(card('Psychic Energy MEE'));
  a.hand.cards.push(card('Battle Compressor PHF'));
  const restore=useCorrection ? require('./battle-compressor-minimum-hook.cjs').installBattleCompressorMinimumHook() : ()=>{};
  try {
  store.dispatch(new PlayCardAction(a.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=state.prompts.find(p=>p.constructor.name==='ChooseCardsPrompt');
  assert.ok(prompt,'Missing actual Battle Compressor selection prompt');
  const report={
    min:prompt.options.min,max:prompt.options.max,
    acceptsZero:prompt.validate([]),
    acceptsOne:prompt.validate([a.deck.cards[0]]),
    inPlay:a.supporter.cards.some(c=>c.name==='Battle Compressor'),
    deckSize:a.deck.cards.length,corrected:useCorrection
  };
  if(resolveEmpty || resolveOne){
    const {ResolvePromptAction}=get('game/store/actions/resolve-prompt-action');
    const selection=resolveOne ? [a.deck.cards[0]] : [];
    try{
      store.dispatch(new ResolvePromptAction(prompt.id,selection));
      report.selectionResolution='accepted';
    }catch(error){
      report.selectionResolution='rejected';
      report.selectionError=String(error.message);
    }
    report.deckSizeAfter=a.deck.cards.length;
    report.discardedItem=a.discard.cards.some(c=>c.name==='Battle Compressor');
    report.pendingPromptsAfterSelection=state.prompts.filter(prompt =>
      prompt.result === undefined).map(prompt => prompt.constructor.name);
    report.itemStillInSupporterZone=a.supporter.cards.some(
      card => card.name === 'Battle Compressor');
    if (completeShuffle && report.selectionResolution === 'accepted') {
      const shuffle = state.prompts.find(prompt =>
        prompt.result === undefined && prompt.constructor.name === 'ShuffleDeckPrompt');
      assert.ok(shuffle, 'Accepted selection must lead to real ShuffleDeckPrompt');
      store.dispatch(new ResolvePromptAction(shuffle.id,
        Array.from({length:a.deck.cards.length}, (_, index) => index)));
      report.discardedItemAfterShuffle = a.discard.cards.some(
        card => card.name === 'Battle Compressor');
      report.itemStillInSupporterZoneAfterShuffle = a.supporter.cards.some(
        card => card.name === 'Battle Compressor');
      report.deckSizeAfterShuffle = a.deck.cards.length;
      report.pendingPromptsAfterShuffle = state.prompts.filter(prompt =>
        prompt.result === undefined).map(prompt => prompt.constructor.name);
    }
  }
  return report;
  } finally {restore();}
}
if(require.main===module)console.log(JSON.stringify({baseline:probe(),corrected:probe(true)},null,2));
module.exports={probe};

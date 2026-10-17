'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const get=part=>require(path.join(root,part));
/**
 * Probe a real compiled Battle Compressor prompt and optionally finish the
 * engine's shuffle/animation prompts before inspecting Item cleanup.
 * @param {boolean} useCorrection
 * @param {boolean} resolveEmpty
 * @param {boolean} resolveOne
 * @param {boolean} completeShuffle
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
    if(report.selectionResolution==='accepted' && completeShuffle){
      const shuffle=state.prompts.find(p=>p.constructor.name==='ShuffleDeckPrompt' &&
        p.result===undefined);
      assert.ok(shuffle,'Expected a shuffle prompt before trainer cleanup');
      const order=Array.from({length:a.deck.cards.length},(_,i)=>i);
      assert.equal(shuffle.validate(order,state),true);
      store.dispatch(new ResolvePromptAction(shuffle.id,order));
      const wait=state.prompts.find(p=>p.constructor.name==='WaitPrompt' &&
        p.result===undefined);
      assert.ok(wait,'Expected shuffle animation wait before trainer cleanup');
      store.dispatch(new ResolvePromptAction(wait.id,null));
      report.discardedItemAfterCompletion=a.discard.cards.some(
        card=>card.name==='Battle Compressor');
      report.itemStillInSupporterZoneAfterCompletion=a.supporter.cards.some(
        card=>card.name==='Battle Compressor');
      report.deckSizeAfterCompletion=a.deck.cards.length;
      report.pendingPromptsAfterCompletion=state.prompts.filter(p=>
        p.result===undefined).map(p=>p.constructor.name);
    }
  }
  return report;
  } finally {restore();}
}
if(require.main===module)console.log(JSON.stringify({baseline:probe(),corrected:probe(true)},null,2));
module.exports={probe};

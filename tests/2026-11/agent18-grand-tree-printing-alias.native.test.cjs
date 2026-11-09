'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {initializeCards} = require('../../simulation/twinleaf/headless.cjs');
const {stageForcedActive} = require(
  '../../simulation/twinleaf/agent5-forced-active-marshadow-chain-native.cjs');
const {installGrandTreeFirstTurnHook} = require(
  '../../simulation/twinleaf/grand-tree-first-turn-hook.cjs');
const {
  CANONICAL,NATIVE_MISSPELLING,installGrandTreePrintingAlias,
  canonicalizePublishedGrandTreeDeck
} = require('../../simulation/twinleaf/2026-11/agent18-grand-tree-printing-alias.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(output,name));
const {PlayCardAction,PlayerType,SlotType} =
  native('game/store/actions/play-card-action');
const {UseStadiumAction} = native('game/store/actions/game-actions');
const {ResolvePromptAction} = native('game/store/actions/resolve-prompt-action');

function nativeGrandTreeEvolution(seat,manager) {
  const x=stageForcedActive(seat,'floatstone');
  let nextId=70000;
  const card=name=>{
    const copy=manager.getCardByName(name);
    assert.ok(copy,'Missing native card '+name);
    copy.id=nextId++;
    return copy;
  };
  x.state.turn=4;
  x.owner.stadiumUsedTurn=0;
  x.owner.stadiumPlayedTurn=0;
  x.owner.hand.cards.length=0;
  x.owner.deck.cards.length=0;
  x.owner.stadium.cards.length=0;
  x.opponent.stadium.cards.length=0;
  x.owner.bench[0].cards.push(card('Lillipup CEC'));
  x.owner.bench[0].pokemonPlayedTurn=1;
  x.owner.deck.cards.push(card('Herdier SUM'),card('Stoutland BCR'),
    card('Psychic Energy SVE'),card('Psychic Energy SVE'));
  x.owner.hand.cards.push(card(CANONICAL));
  const printed=x.owner.hand.cards[0];
  assert.equal(printed.fullName,CANONICAL);
  assert.equal(printed.setNumber,'136');

  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  x.store.dispatch(new PlayCardAction(x.owner.id,0,board));
  assert.strictEqual(x.owner.stadium.cards[0],printed);
  assert.equal(x.owner.hand.cards.includes(printed),false);
  x.store.dispatch(new UseStadiumAction(x.owner.id));

  const prompts=[];
  const selectedPhysical=[];
  for(let n=0;n<32;n++){
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    const kind=pending.constructor.name;
    let selection;
    if(kind==='WaitPrompt') selection=null;
    else if(kind==='ChoosePokemonPrompt'){
      assert.equal(pending.playerId,x.owner.id);
      selection=[x.owner.bench[0]];
    }else if(kind==='ChooseCardsPrompt'){
      assert.equal(pending.playerId,x.owner.id);
      assert.strictEqual(pending.cards,x.owner.deck);
      const printing=selectedPhysical.length===0?'Herdier SUM':'Stoutland BCR';
      const chosen=x.owner.deck.cards.find(c=>c.fullName===printing);
      assert.ok(chosen,'Actual deck lacked '+printing);
      selection=[chosen];
      selectedPhysical.push(chosen);
    }else if(kind==='ShuffleDeckPrompt'){
      assert.equal(pending.playerId,x.owner.id);
      selection=Array.from({length:x.owner.deck.cards.length},(_,i)=>i);
    }else if(kind==='ShowCardsPrompt'){
      selection=true;
    }else{
      throw new Error('Unrecognized Grand Tree native prompt: '+kind);
    }
    const valid=pending.validate(selection,x.state);
    if(!valid) console.log('GRANDTREE_NATIVE_PROMPT_REJECTION',JSON.stringify({
      kind,seat,filter:pending.filter,options:pending.options,
      selected:selection?.map?.(card=>({name:card.name,fullName:card.fullName,
        stage:card.stage,evolvesFrom:card.evolvesFrom,id:card.id})),
      deck:x.owner.deck.cards.map(card=>({name:card.name,
        fullName:card.fullName,stage:card.stage,evolvesFrom:card.evolvesFrom,id:card.id}))
    }));
    assert.equal(valid,true,kind+' rejected selected owned native action');
    x.store.dispatch(new ResolvePromptAction(pending.id,selection));
    prompts.push(kind);
  }
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  assert.deepEqual(selectedPhysical.map(c=>c.fullName),
    ['Herdier SUM','Stoutland BCR']);
  const bench=x.owner.bench[0];
  assert.deepEqual(bench.cards.slice(0,3).map(c=>c.fullName),
    ['Lillipup CEC','Herdier SUM','Stoutland BCR']);
  for(const physical of selectedPhysical){
    assert.ok(bench.cards.includes(physical));
    assert.ok(!x.owner.deck.cards.includes(physical));
  }
  assert.equal(bench.getPokemonCard().fullName,'Stoutland BCR');
  assert.equal(x.owner.stadium.cards[0].fullName,CANONICAL);
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.state.turn,4);
  return {seat,prompts,selected:selectedPhysical.map(c=>c.fullName),
    stadium:x.owner.stadium.cards[0].fullName,
    topEvolution:bench.getPokemonCard().fullName};
}

test('pinned Grand Tree SCR 136: canonical alias and real paid Stage1+2 native Store chain in both owner seats',()=>{
  const manager=initializeCards();
  assert.equal(manager.getCardByName(CANONICAL),undefined,
    'Pinned typo precondition changed, revisit adapter');
  const legacy=manager.getCardByName(NATIVE_MISSPELLING);
  assert.equal(legacy.name,'Grand Tree');
  assert.equal(legacy.setNumber,'136');
  const get=manager.getCardByName,defined=manager.isCardDefined;
  const restoreAlias=installGrandTreePrintingAlias(manager);
  const restoreTurn=installGrandTreeFirstTurnHook();
  try{
    assert.equal(manager.isCardDefined(CANONICAL),true);
    assert.equal(manager.getCardByName(CANONICAL).fullName,CANONICAL);
    const a=nativeGrandTreeEvolution(0,manager);
    const b=nativeGrandTreeEvolution(1,manager);
    assert.deepEqual(a.selected,b.selected);
    console.log('AGENT18_GRAND_TREE_NATIVE',JSON.stringify({a,b}));
  }finally{
    restoreTurn();
    restoreAlias();
  }
  assert.strictEqual(manager.getCardByName,get);
  assert.strictEqual(manager.isCardDefined,defined);
  assert.equal(manager.getCardByName(CANONICAL),undefined);
});

test('original Aichi ranks 2, 15 and 31 retain exact 60-card construction with the printed Grand Tree ID',()=>{
  const file=path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json');
  const source=JSON.parse(fs.readFileSync(file,'utf8'));
  const {resolveManifestFile}=require('../../simulation/twinleaf/resolve-field.cjs');
  const resolved=resolveManifestFile(file,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const manager=initializeCards();
  const {DeckAnalyser}=native('game/cards/deck-analyser');
  const {Format}=native('game/store/card/card-types');
  const release=installGrandTreePrintingAlias(manager);
  try{
    const records=[];
    for(const rank of [2,15,31]){
      const row=source.decks.find(d=>d.rank===rank);
      const deck=resolved.decks.find(d=>d.rank===rank);
      assert.ok(deck?.playableUnderEngine,'Rank '+rank+' source unresolved by pinned engine');
      const original=deck.cardIds.slice();
      const translated=canonicalizePublishedGrandTreeDeck(original,row.cards);
      assert.equal(translated.length,60);
      assert.equal(translated.filter(id=>id===CANONICAL).length,1);
      assert.equal(translated.filter(id=>id===NATIVE_MISSPELLING).length,0);
      assert.equal(original.filter(id=>id===NATIVE_MISSPELLING).length,1);
      assert.equal(new DeckAnalyser(translated).isValid(Format.EXPANDED),true);
      const cards=translated.map(id=>manager.getCardByName(id));
      assert.equal(cards.filter(Boolean).length,60);
      assert.equal(cards.filter(c=>c.fullName===CANONICAL).length,1);
      assert.equal(cards.filter(c=>c.fullName===CANONICAL&&
        c.name==='Grand Tree'&&String(c.setNumber)==='136').length,1);
      records.push({rank,originalSize:original.length,
        translatedSize:translated.length,publishedGrandTree:CANONICAL,
        allNativePhysicalCardsResolved:true});
    }
    console.log('AGENT18_THREE_ORIGINAL_60S',JSON.stringify(records));
  }finally{
    release();
  }
});

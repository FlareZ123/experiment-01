'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent27-source-lastbench-two-basic-native.cjs');
const {withNumericShuffleValidator}=
  require('../simulation/twinleaf/agent22-numeric-shuffle-validation-hook.cjs');
const {withWonderTagZeroShuffleHook,VERSION}=
  require('../simulation/twinleaf/agent8-wonder-tag-zero-shuffle-hook.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(OUTPUT,name));

/**
 * Two exact original-source 60 inventories: rank1 owner vs rank10 opponent,
 * artificial precommitted final-Bench position. Actor owns a printed Lele
 * in hand and existing source Guzma in deck, in either physical seat.
 * These are controlled Store effect tests, NEVER organic or win-qualified games.
 * @param {0|1} seat
 * @param {'hit'|'zero'|'decline'} choice
 * @param {boolean} repaired
 */
function probe(seat,choice,repaired){
  return withNumericShuffleValidator(()=>{
    const work=()=>{
      const x=stage(seat);
      const {ResolvePromptAction}=
        load('game/store/actions/resolve-prompt-action');
      const supporter=x.owner.deck.cards.find(c=>c.fullName==='Guzma BUS');
      assert.ok(supporter,'Rank1 exact source Guzma must be in deck');
      assert.equal(x.owner.hand.cards[1]?.fullName,'Tapu Lele-GX GRI');
      const beforeDeck=[...x.owner.deck.cards],beforeHand=x.owner.hand.cards.length;
      const events=[],pending=()=>x.state.prompts.find(p=>p.result===undefined);
      x.store.dispatch(new x.PlayCardAction(x.owner.id,1,{
        player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:4
      }));
      assert.equal(x.owner.bench[4].getPokemonCard()?.fullName,
        'Tapu Lele-GX GRI');
      for(let i=0;i<16&&pending();i++){
        const p=pending(),kind=p.constructor.name;
        let response,priorPhysical=null;
        if(kind==='ConfirmPrompt')response=choice!=='decline';
        else if(kind==='ChooseCardsPrompt'){
          assert.equal(p.cards,x.owner.deck);
          response=choice==='hit'?[supporter]:[];
        }else if(kind==='ShowCardsPrompt')response=true;
        else if(kind==='ShuffleDeckPrompt'){
          assert.equal(p.getPerspectivePlayerId(),x.owner.id);
          priorPhysical=[...x.owner.deck.cards];
          response=Array.from({length:priorPhysical.length},
            (_,j)=>priorPhysical.length-1-j);
        }else throw Error('Unexpected native source Wonder Tag prompt '+kind);
        assert.equal(p.validate(response,x.state),true,kind+' native rejected test input');
        x.store.dispatch(new ResolvePromptAction(p.id,response));
        const orderChanged=priorPhysical===null?null:
          priorPhysical.some((c,k)=>x.owner.deck.cards[k]!==c);
        events.push({kind,answerCount:Array.isArray(response)?
          response.length:null,orderChanged});
      }
      assert.equal(pending(),undefined,'Source Wonder Tag prompt unclosed');
      return {
        seat,choice,enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
        registeredSourceRanks:[1,10],sourceDigests:x.sourceDigests,
        events,turn:x.state.turn,activeSeat:x.state.activePlayer,
        supporterInHand:x.owner.hand.cards.includes(supporter),
        supporterInDeck:x.owner.deck.cards.includes(supporter),
        deckCountDelta:x.owner.deck.cards.length-beforeDeck.length,
        handCountDelta:x.owner.hand.cards.length-beforeHand,
        leleBenched:x.owner.bench[4].getPokemonCard()?.fullName===
          'Tapu Lele-GX GRI',qualifiedCompetitiveGames:0
      };
    };
    if(!repaired)return {raw:true,output:work(),audit:null};
    const {result,audit}=withWonderTagZeroShuffleHook(work);
    return {raw:false,output:result,audit};
  });
}
test('Aichi rank1 original Wonder Tag zero Supporter silently skips required shuffle in both seats',()=>{
  for(const seat of [0,1]){
    const raw=probe(seat,'zero',false);
    const repaired=probe(seat,'zero',true);
    console.log('AGENT8_SOURCE_WONDER_TAG_ZERO',
      JSON.stringify({seat,raw,repaired}));
    assert.deepEqual(raw.output.events.map(x=>x.kind),[
      'ConfirmPrompt','ChooseCardsPrompt']);
    assert.deepEqual(repaired.output.events.map(x=>x.kind),[
      'ConfirmPrompt','ChooseCardsPrompt','ShuffleDeckPrompt']);
    assert.equal(repaired.output.events.at(-1).orderChanged,true);
    assert.equal(repaired.audit.version,VERSION);
    assert.equal(repaired.audit.zeroSelections,1);
    assert.equal(repaired.audit.repairedShuffles,1);
    assert.equal(repaired.audit.nonzeroNativeSelections,0);
    for(const row of [raw.output,repaired.output]){
      assert.deepEqual(row.registeredSourceRanks,[1,10]);
      assert.equal(row.turn,2);
      assert.equal(row.activeSeat,seat);
      assert.equal(row.supporterInDeck,true);
      assert.equal(row.supporterInHand,false);
      assert.equal(row.deckCountDelta,0);
      assert.equal(row.handCountDelta,-1);
      assert.equal(row.leleBenched,true);
      assert.equal(row.qualifiedCompetitiveGames,0);
    }
    assert.deepEqual(raw.output.sourceDigests,repaired.output.sourceDigests);
  }
});
test('Aichi rank1 printed Wonder Tag positive Supporter remains unchanged in both seats',()=>{
  for(const seat of [0,1]){
    const raw=probe(seat,'hit',false);
    const repaired=probe(seat,'hit',true);
    console.log('AGENT8_SOURCE_WONDER_TAG_HIT',
      JSON.stringify({seat,raw,repaired}));
    for(const row of [raw.output,repaired.output]){
      assert.deepEqual(row.events.map(x=>x.kind),[
        'ConfirmPrompt','ChooseCardsPrompt','ShowCardsPrompt','ShuffleDeckPrompt']);
      assert.equal(row.events.at(-1).orderChanged,true);
      assert.equal(row.supporterInHand,true);
      assert.equal(row.supporterInDeck,false);
      assert.equal(row.deckCountDelta,-1);
      assert.equal(row.handCountDelta,0);
      assert.equal(row.leleBenched,true);
      assert.equal(row.turn,2);
      assert.equal(row.activeSeat,seat);
      assert.equal(row.qualifiedCompetitiveGames,0);
    }
    assert.equal(repaired.audit.zeroSelections,0);
    assert.equal(repaired.audit.nonzeroNativeSelections,1);
    assert.equal(repaired.audit.repairedShuffles,0);
    assert.deepEqual(raw.output.sourceDigests,repaired.output.sourceDigests);
  }
});
test('Aichi rank1 Wonder Tag optional Ability refusal leaves turn, hand and deck unchanged in both seats',()=>{
  for(const seat of [0,1]){
    const raw=probe(seat,'decline',false);
    const repaired=probe(seat,'decline',true);
    console.log('AGENT8_SOURCE_WONDER_TAG_REFUSE',
      JSON.stringify({seat,raw,repaired}));
    for(const row of [raw.output,repaired.output]){
      assert.deepEqual(row.events.map(x=>x.kind),['ConfirmPrompt']);
      assert.equal(row.supporterInDeck,true);
      assert.equal(row.supporterInHand,false);
      assert.equal(row.deckCountDelta,0);
      assert.equal(row.handCountDelta,-1);
      assert.equal(row.turn,2);
    }
    assert.equal(repaired.audit.zeroSelections,0);
    assert.equal(repaired.audit.repairedShuffles,0);
  }
});
test('zero-search wrapper restores pinned Tapu Lele-GX prototype',()=>{
  const {TapuLeleGX}=
    load('sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx');
  const before=Object.getOwnPropertyDescriptor(
    TapuLeleGX.prototype,'reduceEffect');
  const out=withWonderTagZeroShuffleHook(()=>37);
  assert.equal(out.result,37);
  assert.equal(out.audit.repairedShuffles,0);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    TapuLeleGX.prototype,'reduceEffect'),before);
});

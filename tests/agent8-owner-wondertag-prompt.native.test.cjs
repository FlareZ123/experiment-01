'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent27-source-lastbench-two-basic-native.cjs');
const {withNumericShuffleValidator}=
  require('../simulation/twinleaf/agent22-numeric-shuffle-validation-hook.cjs');
const {withWonderTagZeroShuffleHook}=
  require('../simulation/twinleaf/agent8-wonder-tag-zero-shuffle-hook.cjs');
const {withOwnerWonderTagPrompts}=
  require('../simulation/twinleaf/agent8-owner-wondertag-prompt.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(OUTPUT,name));

/** @param {0|1} seat */
function nativeProbe(seat){
  return withNumericShuffleValidator(()=>
    withWonderTagZeroShuffleHook(()=>
      withOwnerWonderTagPrompts(()=>{
        const x=stage(seat);
        const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
        const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
        const {SuperType,TrainerType}=load('game/store/card/card-types');
        const ai=Object.create(SimpleTacticsAi.prototype);
        ai.client={id:x.owner.id};
        const originalSupporters=x.owner.deck.cards.filter(c=>
          c.superType===SuperType.TRAINER&&c.trainerType===TrainerType.SUPPORTER);
        assert.ok(originalSupporters.length>0);
        const beforeHand=x.owner.hand.cards.length;
        x.store.dispatch(new x.PlayCardAction(x.owner.id,1,{
          player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:4
        }));
        const events=[];
        const next=()=>x.state.prompts.find(p=>p.result===undefined);
        for(let i=0;i<16&&next();i++){
          const p=next(),kind=p.constructor.name;
          let action;
          if((kind==='ConfirmPrompt'||kind==='ChooseCardsPrompt')&&
             p.playerId===x.owner.id){
            action=ai.decodeNextAction(x.state);
            assert.ok(action instanceof ResolvePromptAction);
          }else if(kind==='ShowCardsPrompt'){
            assert.equal(p.playerId,x.opponent.id,
              'Wonder Tag must reveal the selected Supporter to the opponent');
            assert.equal(p.cards.length,1);
            assert.ok(originalSupporters.includes(p.cards[0]),
              'Opponent revelation must be the original physical Supporter');
            action=new ResolvePromptAction(p.id,true);
          }else if(kind==='ShuffleDeckPrompt'){
            const n=x.owner.deck.cards.length;
            action=new ResolvePromptAction(p.id,Array.from({length:n},(_,j)=>n-1-j));
          }else throw Error('Unrecognized owner Wonder Tag native prompt '+kind);
          assert.equal(p.validate(action.result,x.state),true,
            'Source prompt selection invalid: '+kind);
          events.push({kind,owner:p.playerId===x.owner.id,
            answerCount:Array.isArray(action.result)?action.result.length:null});
          x.store.dispatch(action);
        }
        assert.equal(next(),undefined,'The native owner search failed to settle');
        const acquired=originalSupporters.filter(c=>x.owner.hand.cards.includes(c));
        assert.equal(acquired.length,1);
        assert.equal(x.owner.hand.cards.length,beforeHand);
        assert.equal(x.owner.bench[4].getPokemonCard()?.fullName,
          'Tapu Lele-GX GRI');
        return {seat,events,sourceDigests:x.sourceDigests,
          originalPrintings:[1,10],turn:x.state.turn,acquired:acquired.length,
          competitiveQualifiedGames:0};
      })));
}

test('compiled original-60 Tapu Lele Wonder Tag owner prompt policy selects a Supporter in both seats',()=>{
  for(const seat of [0,1]){
    const outer=nativeProbe(seat);
    const selected=outer.result;
    const data=selected.result;
    console.log('AGENT8_WONDER_TAG_OWNER_NATIVE',JSON.stringify({
      seat,events:data.events,policy:selected.audit,shuffle:outer.audit,
      sourceDigests:data.sourceDigests
    }));
    assert.deepEqual(data.events.map(e=>e.kind),[
      'ConfirmPrompt','ChooseCardsPrompt','ShowCardsPrompt','ShuffleDeckPrompt']);
    assert.deepEqual(data.events.map(e=>e.owner),[true,true,false,true]);
    assert.equal(data.acquired,1);
    assert.equal(data.turn,2);
    assert.equal(data.competitiveQualifiedGames,0);
    assert.equal(selected.audit.confirmOffers,1);
    assert.equal(selected.audit.searchOffers,1);
    assert.equal(selected.audit.confirmed,1);
    assert.equal(selected.audit.selectedSupporters,1);
    assert.equal(selected.audit.nativeAccepted,2);
    assert.equal(selected.audit.bySeat[seat],2);
    assert.equal(outer.audit.nonzeroNativeSelections,1);
    assert.equal(outer.audit.repairedShuffles,0);
  }
});


test('printed Wonder Tag prompt handler remains inert under opposing Iron Thorns active ability lock',()=>{
  for(const seat of [0,1]){
    const x=stage(seat,6);
    const {result,audit}=withOwnerWonderTagPrompts(()=>{
      x.store.dispatch(new x.PlayCardAction(x.owner.id,1,{
        player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:4
      }));
      assert.equal(x.owner.bench[4].getPokemonCard()?.fullName,
        'Tapu Lele-GX GRI');
      return {pending:x.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)};
    });
    console.log('AGENT8_WONDER_TAG_IRON_THORNS_LOCK',JSON.stringify({
      seat,result,audit
    }));
    assert.deepEqual(result.pending,[]);
    assert.equal(audit.confirmOffers,0);
    assert.equal(audit.searchOffers,0);
    assert.equal(audit.nativeAccepted,0);
    assert.equal(audit.competitiveQualifiedGames,0);
  }
});

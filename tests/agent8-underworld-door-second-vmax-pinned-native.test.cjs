'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const load=n=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',n));

for(const seat of [0,1]){
  test('rank1 two-Calyrex Underworld Door source marker scope, seat '+seat,()=>{
    const x=stage(seat),manager=initializeCards();
    let id=71000+seat*1000;
    const make=n=>{
      const c=manager.getCardByName(n);
      assert.ok(c,n);c.id=id++;return c;
    };
    for(const slot of x.owner.bench.slice(0,2)){
      slot.cards.length=0;
      slot.energies.cards.length=0;
      slot.cards.push(make('Shadow Rider Calyrex V CRE'),
        make('Shadow Rider Calyrex VMAX CRE'));
    }
    x.owner.hand.cards.length=0;
    x.owner.hand.cards.push(make('Psychic Energy SVE'),
      make('Psychic Energy SVE'));
    x.owner.deck.cards.length=0;
    for(let i=0;i<6;i++)x.owner.deck.cards.push(make('Psychic Energy SVE'));
    const {UseAbilityAction}=load('game/store/actions/game-actions');
    const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
    const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
    const target=index=>({player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index});
    const vmax0=x.owner.bench[0].getPokemonCard();
    const vmax1=x.owner.bench[1].getPokemonCard();
    assert.notEqual(vmax0.id,vmax1.id);
    x.store.dispatch(new UseAbilityAction(x.owner.id,'Underworld Door',target(0)));
    const prompt=x.state.prompts.find(q=>q.result===undefined);
    assert.equal(prompt?.constructor.name,'AttachEnergyPrompt');
    const energy=x.owner.hand.cards[0];
    const transfer=[{card:energy,to:target(0)}];
    assert.equal(prompt.validate(transfer),true);
    x.store.dispatch(new ResolvePromptAction(prompt.id,transfer));
    assert.equal(x.owner.bench[0].energies.cards.length,1);
    assert.equal(x.owner.hand.cards.length,3);
    assert.equal(x.owner.marker.hasMarker('UNDERWORLD_DOOR_MARKER',vmax0),true);
    assert.equal(x.owner.marker.hasMarker('UNDERWORLD_DOOR_MARKER',vmax1),false);
    let error=null;
    try{x.store.dispatch(new UseAbilityAction(x.owner.id,'Underworld Door',target(1)));}
    catch(e){error=e.message;}
    assert.equal(error,'POWER_ALREADY_USED');
    console.log('AGENT8_PINNED_MULTI_DOOR',JSON.stringify({seat,
      firstAttached:true,firstDrewTwo:true,secondError:error,
      competitiveQualifiedGames:0}));
  });
}

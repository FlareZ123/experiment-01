'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const path=require('node:path');
const native=x=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',x));

/** @param {0|1} seat @param {boolean} used */
function pidgeot(seat,used){
  const x=stage(seat),m=initializeCards();
  let id=78000+seat*100;
  const make=name=>{
    const c=m.getCardByName(name);
    assert.ok(c,name);c.id=id++;return c;
  };
  x.owner.bench[0].cards.push(make('Pidgey MEW'),
    make('Pidgeotto TEU'),make('Pidgeot ex OBF'));
  const p=x.owner.bench[0].getPokemonCard();
  assert.equal(p.name,'Pidgeot ex');
  if(used)x.owner.marker.addMarker(p.QUICK_SEARCH_MARKER,p);
  const view=actorObservation(x.state,seat);
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const action=new UseAbilityAction(x.owner.id,'Quick Search',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  });
  let result='accepted',error=null;
  try{x.store.dispatch(action);}
  catch(e){result='rejected';error=e.message;}
  const pending=x.state.prompts.find(q=>q.result===undefined);
  return {view,result,error,prompt:pending?.constructor.name??null};
}

for(const seat of [0,1]){
  test('rank2/15 Pidgeot marker aliases owner-root observation, seat '+seat,()=>{
    const available=pidgeot(seat,false);
    const spent=pidgeot(seat,true);
    assert.deepEqual(available.view,spent.view);
    assert.equal(available.result,'accepted');
    assert.equal(available.prompt,'ChooseCardsPrompt');
    assert.equal(spent.result,'rejected');
    assert.equal(spent.error,'POWER_ALREADY_USED');
    assert.equal(spent.prompt,null);
    console.log('AGENT8_NATIVE_ABILITY_ALIAS',
      JSON.stringify({seat,identicalOwnerObservation:true,
        unspent:available.result,spent:spent.result,
        nativeError:spent.error,competitiveQualifiedGames:0}));
  });
}

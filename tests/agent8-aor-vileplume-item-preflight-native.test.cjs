'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {nativeAorVileplumeItemPreflight}=
  require('../simulation/twinleaf/agent8-aor-vileplume-item-preflight.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));

/**
 * Stage authentic, physical pinned cards in a minimal native Store. No
 * assumption about historical tournament setup or prize completeness.
 * @param {0|1} seat
 * @param {'no-vileplume'|'opponent-vileplume'|'own-vileplume'|'wobbuffet-suppressed'|'hooded-opponent-vileplume'|'same-owner-hooded-vileplume'} scenario
 */
function checkLivePrinting(seat,scenario){
  const x=stage(seat);
  const manager=initializeCards();
  const printing=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Missing exact printing '+name);
    card.id=900000+seat*100+(name==='Fog Crystal CRE'?1:
      name==='Vileplume AOR'?2:name==='Wobbuffet PHF'?3:4);
    return card;
  };
  const fog=printing('Fog Crystal CRE');
  x.owner.hand.cards.unshift(fog);
  const hasVileplume=scenario!=='no-vileplume';
  if(hasVileplume){
    const locker=printing('Vileplume AOR');
    const benchOwner=scenario==='own-vileplume'||
      scenario==='same-owner-hooded-vileplume'?x.owner:x.opponent;
    benchOwner.bench[0].cards.push(locker);
    if(scenario==='hooded-opponent-vileplume'||
       scenario==='same-owner-hooded-vileplume')
      benchOwner.bench[0].tools.push(printing('Stealthy Hood UNB'));
  }
  if(['wobbuffet-suppressed','hooded-opponent-vileplume',
    'same-owner-hooded-vileplume'].includes(scenario))
    x.owner.active.cards[0]=printing('Wobbuffet PHF');
  const view=actorObservation(x.state,seat);
  const predicted=nativeAorVileplumeItemPreflight(view,x.state);
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const action=new PlayCardAction(x.owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  });
  let nativeError=null;
  try{x.store.dispatch(action);}
  catch(error){nativeError=String(error?.message??error);}
  const nativeBlocked=nativeError==='CANNOT_PLAY_THIS_CARD';
  assert.equal(predicted.applicable,hasVileplume);
  assert.equal(predicted.nativeItemLocked,nativeBlocked,
    'Detached AOR Ability preflight must agree with real native Item dispatch');
  const expectedBlocked=['opponent-vileplume','own-vileplume',
    'hooded-opponent-vileplume'].includes(scenario);
  assert.equal(nativeBlocked,expectedBlocked);
  return {seat,scenario,predicted,nativeError};
}

for(const seat of [0,1]){
  for(const scenario of ['no-vileplume','opponent-vileplume',
    'own-vileplume','wobbuffet-suppressed',
    'hooded-opponent-vileplume','same-owner-hooded-vileplume']){
    test('native AOR Vileplume Item preflight agrees with Store on '+
      scenario+' in physical seat '+seat,()=>{
      const receipt=checkLivePrinting(seat,scenario);
      console.log('AOR_VILEPLUME_NATIVE_ITEM_PREFLIGHT',
        JSON.stringify({...receipt,qualified:false}));
    });
  }
}

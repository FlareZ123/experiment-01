'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {mimikyuCopycatReadiness}=
  require('../../simulation/twinleaf/agent50-mimikyu-copycat-readiness.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=file=>require(path.join(OUTPUT,file));

/** @param {0|1} seat @param {number} energyCount @param {boolean} dimensionValley */
function fixture(seat,energyCount,dimensionValley){
  const manager=initializeCards();
  let id=930100;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned native '+name);
    c.id=id++;
    return c;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player();
  owner.id=seat===0?101:202;
  const opponent=new Player();
  opponent.id=seat===0?202:101;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=5;
  state.gameSettings.format=Format.EXPANDED;

  const mimikyu=card('Mimikyu GRI');
  const energies=Array.from({length:energyCount},()=>card('Psychic Energy SVE'));
  owner.active.cards.push(mimikyu,...energies);
  owner.active.energies.cards.push(...energies);
  const rival=card('Venonat MEW');
  opponent.active.cards.push(rival);
  if(dimensionValley)owner.stadium.cards.push(card('Dimension Valley PHF'));
  const gnaw=rival.attacks.find(attack=>attack.name==='Gnaw');
  assert.ok(gnaw,"Venonat's non-GX Gnaw must be available");
  state.playerLastAttack[opponent.id]={attack:gnaw,sourceCard:rival};
  state.lastAttack=gnaw;
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>CardList.fromList(['Psychic Energy SVE']));
    player.deck.cards.push(card('Psychic Energy SVE'));
  }
  return {store,state,owner,opponent,mimikyu,energies,seat};
}

function nativeCopycat(x){
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const before=x.opponent.active.damage;
  let error=null;
  try{
    x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
    for(let i=0;i<16;i++){
      const pending=x.store.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      assert.equal(pending.constructor.name,'WaitPrompt',
        'The ordinary copied Gnaw should not create a discretionary prompt');
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
    }
  }catch(e){
    error=String(e?.message??e);
  }
  return {
    error,
    damageBefore:before,
    damageAfter:x.opponent.active.damage,
    unresolved:x.store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    ownerUsedGX:x.owner.usedGX===true
  };
}

for(const seat of [0,1]){
  test('Dimension Valley makes one Psychic Energy sufficient for Copycat in seat '+seat,()=>{
    const x=fixture(seat,1,true);
    const readiness=mimikyuCopycatReadiness(x.state,x.owner,seat,{slot:'active'});
    assert.deepEqual(readiness,{
      status:'payable',required:1,attached:1,stadium:'Dimension Valley PHF',
      costSymbols:['P']
    });
    const result=nativeCopycat(x);
    assert.equal(result.error,null);
    assert.equal(result.damageAfter-result.damageBefore,10);
    assert.deepEqual(result.unresolved,[]);
    assert.equal(result.ownerUsedGX,false);
  });

  test('one Psychic Energy without Dimension Valley is insufficient for Copycat in seat '+seat,()=>{
    const x=fixture(seat,1,false);
    const readiness=mimikyuCopycatReadiness(x.state,x.owner,seat,{slot:'active'});
    assert.deepEqual(readiness,{
      status:'not-payable',required:2,attached:1,stadium:null,
      costSymbols:['P','C']
    });
    const result=nativeCopycat(x);
    assert.equal(result.damageAfter,result.damageBefore);
    assert.equal(result.ownerUsedGX,false);
    assert.deepEqual(result.unresolved,[]);
  });

  test('two Psychic Energy without Dimension Valley pay Copycat in seat '+seat,()=>{
    const x=fixture(seat,2,false);
    const readiness=mimikyuCopycatReadiness(x.state,x.owner,seat,{slot:'active'});
    assert.equal(readiness.status,'payable');
    assert.equal(readiness.required,2);
    const result=nativeCopycat(x);
    assert.equal(result.error,null);
    assert.equal(result.damageAfter-result.damageBefore,10);
    assert.deepEqual(result.unresolved,[]);
    assert.equal(result.ownerUsedGX,false);
  });
}

'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {publicPlayer}=require('../simulation/twinleaf/actor-observation-contract.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));

/**
 * A real pinned Itchy Pollen declaration should set a player-wide Item
 * restriction for the opponent's actual next turn. The actor-only public
 * observation must expose the same state, even if the source Budew moves
 * away from Active subsequently. Native PRE printing is an engine source
 * and does not establish the separate ASC print mapping.
 * @param {0|1} seat Physical attacking seat.
 */
function realBudewAttackAndOpposingItem(seat){
  const x=stage(seat),manager=initializeCards();
  const physical=(name,id)=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Exact native printing unavailable: '+name);
    card.id=id;return card;
  };
  const budew=physical('Budew PRE',940000+seat*100);
  const fog=physical('Fog Crystal CRE',940001+seat*100);
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(budew);
  x.opponent.hand.cards.unshift(fog);
  x.state.turn=4;
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  x.store.dispatch(new AttackAction(x.owner.id,'Itchy Pollen'));
  const prompts=[];
  for(let i=0;i<30;i++){
    const pending=x.store.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    assert.equal(pending.constructor.name,'WaitPrompt');
    prompts.push(pending.constructor.name);
    x.store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(x.store.hasPrompts(),false);
  assert.equal(x.opponent.cannotPlayItemCards,true,
    'A successful native Itchy Pollen must restrict the next player turn');
  assert.equal(publicPlayer(x.opponent).publicTurnRestrictions.itemPlayLocked,
    true,'Owner-only model must reflect native player-level Item attack lock');
  assert.equal(x.store.state.activePlayer,1-seat);
  assert.equal(x.store.state.turn,5);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const action=new PlayCardAction(x.opponent.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  });
  assert.throws(()=>x.store.dispatch(action),
    /CANNOT_PLAY_THIS_CARD|BLOCKED/i,
    'Fog Crystal cannot be played into the printed Itchy Pollen next-turn lock');
  return {
    seat,attackerBudew:budew.fullName,defenderHeldFog:fog.fullName,
    nativeTurn:x.store.state.turn,opponentItemLocked:true,
    publicTurnItemLocked:true,promptTypes:prompts,
    nativePrintedAscPresent:manager.getAllCards().some(card=>
      card.name==='Budew'&&card.set==='ASC'&&String(card.setNumber)==='16'),
    scope:'pinned native PRE source, not paper ASC alias proof',
    competitiveQualified:false
  };
}

for(const seat of [0,1]){
  test('native Budew printed Itchy Pollen locks owner-visible Item next turn, attacking seat '+seat,
    ()=>{
      console.log('BUDEW_NEXT_TURN_PLAYER_ITEM_LOCK',
        JSON.stringify(realBudewAttackAndOpposingItem(seat)));
    });
}

'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));
const {AttackAction,PassTurnAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {GameMessage}=native('game/game-message');

class AddPlayerAction{
  constructor(clientId){this.clientId=clientId;}
}
class ChooseAttackPrompt{
  constructor(playerId,sourceCard,attack){
    this.id=7001;
    this.playerId=playerId;
    this.cards=[sourceCard];
    this.message=GameMessage.CHOOSE_ATTACK_TO_COPY;
    this.attack=attack;
  }
}

/**
 * The fake dispatch preserves native Player/Card objects while exercising the
 * same prototype/instance dispatch boundary used by the actor-only adapter.
 * @param {object} state
 */
class FakeStore{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof AttackAction){
      const player=this.state.players.find(value=>value.id===action.clientId);
      assert.ok(player);
      const sourceCard=player.active.getPokemonCard();
      const attack=sourceCard.attacks.find(value=>value.name===action.name);
      assert.ok(attack);
      if(action.name==='Copycat'){
        const opponent=this.state.players.find(value=>value.id!==action.clientId);
        this.state.copiedAttack=this.state.playerLastAttack[opponent.id]?.attack?.name??null;
      }else{
        this.state.playerLastAttack[player.id]={attack,sourceCard};
      }
      return this.state;
    }
    if(action instanceof ResolvePromptAction){
      this.state.prompts=this.state.prompts.filter(prompt=>prompt.id!==action.id);
      return this.state;
    }
    if(action instanceof PassTurnAction){
      this.state.activePlayer=1-this.state.activePlayer;
      this.state.turn++;
      return this.state;
    }
    return this.state;
  }
}
class FakeSimpleTacticsAi{
  constructor(client){this.client=client;}
  decodeNextAction(){return null;}
}
class FakePlayCardAction{}
class FakeRetreatAction{}
class FakeUseAbilityAction{}
class FakeUseStadiumAction{}

function setupPair(sourceSeat){
  const x=stage(sourceSeat);
  const manager=initializeCards();
  let id=99000+sourceSeat*100;
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,'Native card unavailable: '+name);
    value.id=id++;
    return value;
  };
  const bunnelby=card('Bunnelby PRC');
  const bunnelbyEnergy=card('Psychic Energy SVE');
  const mimikyu=card('Mimikyu GRI');
  const mimikyuEnergyA=card('Psychic Energy SVE');
  const mimikyuEnergyB=card('Psychic Energy SVE');
  for(const player of [x.owner,x.opponent]){
    player.hand.cards.length=0;
    for(const slot of player.bench){
      slot.cards.length=0;
      slot.energies.cards.length=0;
    }
  }
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(bunnelby,bunnelbyEnergy);
  x.owner.active.energies.cards.push(bunnelbyEnergy);
  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  x.opponent.active.cards.push(mimikyu,mimikyuEnergyA,mimikyuEnergyB);
  x.opponent.active.energies.cards.push(mimikyuEnergyA,mimikyuEnergyB);
  x.state.activePlayer=sourceSeat;
  x.state.turn=2;
  x.state.phase=x.GamePhase.PLAYER_TURN;
  x.state.playerLastAttack={};
  x.state.prompts=[];
  return x;
}

for(const sourceSeat of [0,1]){
  test('actor-only root consumes the verified Ω Barrage Copycat pair and restores native history, seat '+sourceSeat,()=>{
    const x=setupPair(sourceSeat);
    const store=new FakeStore(x.state);
    const sourceCard=x.owner.active.getPokemonCard();
    const firstAttack=sourceCard.attacks.find(value=>value.name==='Rototiller');
    const secondAttack=sourceCard.attacks.find(value=>value.name==='Burrow');
    assert.ok(firstAttack&&secondAttack);
    const pairPrompt=new ChooseAttackPrompt(x.owner.id,sourceCard,secondAttack);
    store.state.prompts=[pairPrompt];
    const {result,audit}=withActorOnlyRootPolicy(()=>{
      store.dispatch(new AddPlayerAction(x.owner.id));
      store.dispatch(new AttackAction(x.owner.id,'Rototiller'));
      store.dispatch(new ResolvePromptAction(pairPrompt.id,secondAttack));
      store.dispatch(new PassTurnAction(x.owner.id));
      assert.equal(store.state.activePlayer,1-sourceSeat);
      assert.equal(store.state.turn,3);
      assert.equal(store.state.playerLastAttack[x.owner.id].attack.name,'Rototiller');
      const bot=new FakeSimpleTacticsAi({id:x.opponent.id});
      const action=bot.decodeNextAction(store.state);
      assert.ok(action instanceof AttackAction);
      assert.equal(action.name,'Copycat');
      store.dispatch(action);
      return {store,action};
    },{
      Store:FakeStore,
      SimpleTacticsAi:FakeSimpleTacticsAi,
      GamePhase:x.GamePhase,
      cardActions:{
        PlayCardAction:FakePlayCardAction,
        PlayerType:{ANY:0,BOTTOM_PLAYER:1},
        SlotType:{BOARD:0,ACTIVE:1,BENCH:2}
      },
      gameActions:{
        AttackAction,PassTurnAction,RetreatAction:FakeRetreatAction,
        UseAbilityAction:FakeUseAbilityAction,UseStadiumAction:FakeUseStadiumAction
      },
      getCatalog:()=>x.catalog,
      copycatHistoryRoot:true
    });
    assert.equal(result.action.name,'Copycat');
    assert.equal(result.store.state.copiedAttack,'Burrow',
      'actor-root dispatch must temporarily select the second verified Barrage attack');
    assert.equal(result.store.state.playerLastAttack[x.owner.id].attack.name,'Rototiller',
      'the truthful native playerLastAttack record must be restored after Copycat dispatch');
    assert.equal(audit.copycatHistoryRoot.trackerStores,1);
    assert.equal(audit.copycatHistoryRoot.barragePairRoots,1);
    assert.equal(audit.copycatHistoryRoot.selected,1);
    assert.equal(audit.copycatHistoryRoot.historyOverrides,1);
  });
}

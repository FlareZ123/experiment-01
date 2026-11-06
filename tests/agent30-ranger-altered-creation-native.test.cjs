'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name Relative compiled native module. */
const native=name=>require(path.join(OUTPUT,name));

/**
 * Resolve only actual mandatory Store prompts after a staged legal attack.
 * Up-to-three Ultimate Ray attachments may choose zero and still shuffle.
 * @param {object} x Live stage and physical Store.
 * @param {0|1} expectedSeat Next player to receive a normal turn.
 * @returns {string[]} Exact native prompt types settled.
 */
function settleTurn(x,expectedSeat){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const handled=[];
  for(let i=0;i<40;i++){
    const s=x.store.state;
    const prompt=s.prompts.find(p=>p.result===undefined);
    if(!prompt&&s.activePlayer===expectedSeat&&
       s.phase===x.GamePhase.PLAYER_TURN)return handled;
    assert.ok(prompt,'Native turn failed to expose a mandatory continuation');
    const kind=prompt.constructor.name;
    let response;
    if(kind==='WaitPrompt')response=null;
    else if(kind==='AttachEnergyPrompt'){
      assert.equal(prompt.options.min,0);
      response=[];
      assert.equal(prompt.validate(response),true);
    }else if(kind==='ChoosePrizePrompt'){
      const player=s.players.find(p=>p.id===prompt.playerId);
      assert.ok(player);
      response=player.prizes.filter(p=>p.cards.length>0)
        .slice(0,prompt.options.count);
      assert.equal(prompt.validate(response,s),true);
    }else if(kind==='ChoosePokemonPrompt'){
      const player=s.players.find(p=>p.id===prompt.playerId);
      assert.ok(player);
      response=[player.bench.find(p=>p.cards.length>0)];
      assert.equal(prompt.validate(response,s),true);
    }else if(kind==='ShuffleDeckPrompt'){
      const owner=s.players.find(p=>p.id===prompt.playerId);
      assert.ok(owner);
      response=Array.from({length:owner.deck.cards.length},(_,i)=>i);
    }else throw Error('Unexpected native GX or attack prompt '+kind);
    handled.push(kind);
    x.store.dispatch(new ResolvePromptAction(prompt.id,response));
  }
  assert.fail('Unsettled native turn after 40 mandatory prompts');
}

/**
 * Pair one native Altered Creation-GX with an actual opposing Supporter turn.
 * The two branches differ only in the paper-valid, owner-held Ranger play.
 * Both seats and real card/reducer transitions are exercised.
 * @param {0|1} seat ADP attacker's physical seat.
 * @param {boolean} useRanger Opponent chooses to play the held Ranger.
 * @param {boolean} koTarget Use a low-HP Basic victim with a backup Bench.
 * @param {boolean} doubleDragonFuel Use rank-19 DDE plus one basic Colorless
 *   payment (a generic Lightning basic proxy for the registered source).
 * @returns {object} Public native state changes and effect-marker receipt.
 */
function run(seat,useRanger,koTarget=false,doubleDragonFuel=false){
  const x=stage(seat);
  const manager=initializeCards();
  let nextId=890000+seat*10000+Number(useRanger)*20000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned native printing '+name);
    c.id=nextId++;
    return c;
  };
  const ADP='Arceus & Dialga & Palkia GX CEC';
  const adp=card(ADP);
  const energyPrintings=doubleDragonFuel?
    ['Double Dragon Energy ROS','Lightning Energy SVE']:
    ['Metal Energy SVE','Water Energy SVE','Psychic Energy SVE'];
  const energies=energyPrintings.map(card);
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(adp,...energies);
  x.owner.active.energies.cards.push(...energies);
  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  x.opponent.active.cards.push(card(koTarget?'Pidgey MEW':ADP));
  if(koTarget)x.opponent.bench[0].cards.push(card('Regidrago V SIT'));
  const ranger=card('Pokemon Ranger STS');
  x.opponent.hand.cards.unshift(ranger);
  x.state.turn=2;
  const {AttackAction,PassTurnAction}=
    native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const owner=()=>x.store.state.players.find(p=>p.id===x.owner.id);
  const opponent=()=>x.store.state.players.find(p=>p.id===x.opponent.id);
  assert.equal(owner().usedGX,false);
  x.store.dispatch(new AttackAction(owner().id,'Altered Creation-GX'));
  const gxPrompts=settleTurn(x,1-seat);
  assert.equal(owner().usedGX,true);
  assert.equal(owner().usedAlteredCreation,true);
  assert.equal(owner().alteredCreationDamage,true);
  const beforeRanger={
    damage:owner().alteredCreationDamage,
    extraPrize:owner().usedAlteredCreation,
    gxUsed:owner().usedGX
  };
  if(useRanger){
    x.store.dispatch(new PlayCardAction(opponent().id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    assert.equal(owner().usedGX,true,
      'Ranger must preserve the once-per-game GX quota');
    assert.equal(owner().usedAlteredCreation,false);
    assert.equal(owner().alteredCreationDamage,false);
    assert.equal(opponent().supporterTurn,1);
    assert.equal(opponent().hand.cards.includes(ranger),false);
  }else{
    assert.equal(opponent().supporterTurn,0);
    assert.ok(opponent().hand.cards.includes(ranger));
  }
  const afterRanger={
    damage:owner().alteredCreationDamage,
    extraPrize:owner().usedAlteredCreation,
    gxUsed:owner().usedGX
  };
  x.store.dispatch(new PassTurnAction(opponent().id));
  const passPrompts=settleTurn(x,seat);
  assert.equal(x.store.state.activePlayer,seat);
  assert.equal(owner().usedGX,true);
  x.store.dispatch(new AttackAction(owner().id,'Ultimate Ray'));
  const ultimatePrompts=settleTurn(x,1-seat);
  const damage=koTarget?null:opponent().active.damage;
  if(!koTarget)assert.equal(damage,useRanger?150:180);
  assert.equal(owner().usedGX,true);
  const remainingPrizeSlots=[owner(),opponent()]
    .map(p=>p.prizes.filter(slot=>slot.cards.length>0).length);
  assert.deepEqual(remainingPrizeSlots,
    koTarget?[useRanger?5:4,6]:[6,6]);
  if(koTarget)assert.equal(opponent().active.getPokemonCard().name,
    'Regidrago V');
  return {seat,useRanger,koTarget,doubleDragonFuel,
    energyPrintings,beforeRanger,afterRanger,
    ultimateRayDamage:damage,remainingPrizeSlots,
    gxPrompts,passPrompts,ultimatePrompts,
    nativeGameTerminal:false,qualifiedCompetitiveGames:0};
}
for(const seat of [0,1]){
  for(const withRanger of [false,true]){
    test('native ADP GX versus paper Ranger, attacker seat '+seat+
      ' Ranger '+withRanger,()=>{
      const receipt=run(seat,withRanger);
      console.log('AGENT30_NATIVE_RANGER_ADP',JSON.stringify(receipt));
      assert.equal(receipt.ultimateRayDamage,withRanger?150:180);
    });
  }
}
for(const seat of [0,1]){
  for(const withRanger of [false,true]){
    test('native ADP GX actual KO Prize settlement, attacker seat '+seat+
      ' Ranger '+withRanger,()=>{
      const receipt=run(seat,withRanger,true);
      console.log('AGENT30_NATIVE_RANGER_ADP_KO',JSON.stringify(receipt));
      assert.deepEqual(receipt.remainingPrizeSlots,
        [withRanger?5:4,6]);
    });
  }
}
for(const seat of [0,1]){
  for(const withRanger of [false,true]){
    for(const koTarget of [false,true]){
      test('rank19-representative native DDE ADP, seat '+seat+
        ' Ranger '+withRanger+' KO '+koTarget,()=>{
        const receipt=run(seat,withRanger,koTarget,true);
        console.log('AGENT30_NATIVE_RANGER_ADP_DDE',
          JSON.stringify(receipt));
        if(koTarget)assert.deepEqual(receipt.remainingPrizeSlots,
          [withRanger?5:4,6]);
        else assert.equal(receipt.ultimateRayDamage,withRanger?150:180);
      });
    }
  }
}
module.exports={run,settleTurn};

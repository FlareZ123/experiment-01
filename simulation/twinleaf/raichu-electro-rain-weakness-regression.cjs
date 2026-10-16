'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedRaichu}=require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook}=require('./electro-rain-damage-hook.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(output,name));

/**
 * Alolan Raichu's printed Electro Rain ignores Weakness and Resistance.
 * Lugia V SIT has Lightning Weakness, yet one Unit Energy LPM must hit 30.
 * The Benched-only Telescopic Sight bonus must not affect an Active target.
 * @param {boolean} corrected
 */
function activeLightningWeakness(corrected) {
  const f=stagedRaichu(['Unit Energy LPM UPR'],null);
  const {CardList}=load('game/store/state/card-list');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {CardType}=load('game/store/card/card-types');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const lugia=f.card('Lugia V SIT');
  assert.ok(lugia.weakness.some(x=>x.type===CardType.LIGHTNING));
  f.b.active.cards.splice(0,1,lugia);
  f.a.active.tools.push(f.card('Telescopic Sight VIV'));
  f.a.active.getPokemonCard().id=1101;
  f.attached[0].id=1102;
  for(const player of [f.a,f.b]) {
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  const resolve=()=>{
    f.store.dispatch(new AttackAction(101,'Electro Rain'));
    const events=[];
    for(let i=0;i<15;i++){
      const p=f.state.prompts.find(prompt=>prompt.result===undefined);
      if(!p) break;
      let choice;
      if(p.constructor.name==='ChooseCardsPrompt')choice=[...f.attached];
      else if(p.constructor.name==='PutDamagePrompt'){
        assert.equal(p.damage,30);
        choice=[{target:{player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0},damage:30}];
      }else if(p.constructor.name==='WaitPrompt')choice=null;
      else throw Error('Unexpected prompt '+p.constructor.name);
      assert.ok(p.validate(choice,f.state));
      events.push(p.constructor.name);
      f.store.dispatch(new ResolvePromptAction(p.id,choice));
    }
    assert.ok(!f.state.prompts.some(p=>p.result===undefined));
    return {corrected,damage:f.b.active.damage,events};
  };
  return corrected?withElectroRainDamageHook(resolve):resolve();
}

function verify(){
  const unpatched=activeLightningWeakness(false);
  const corrected=activeLightningWeakness(true);
  assert.equal(unpatched.damage,30);
  assert.equal(corrected.damage,30);
  return {
    kind:'Electro Rain printed disregard of Weakness and Benched-only Tool qualifier',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'Lugia V SIT Lightning Weakness, Unit Energy LPM, Telescopic Sight',
    unpatched,corrected,
    note:'Conditional AttackAction with injected board; no legal evolution/setup proof or game results'
  };
}
if(require.main===module)console.log(JSON.stringify(verify(),null,2));
module.exports={activeLightningWeakness,verify};

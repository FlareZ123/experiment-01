'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerColoredStarter,withOwnerColoredStarter,VERSION}=
  require('../../simulation/twinleaf/2026-11/agent41-owner-colored-starter.cjs');

const Stage={BASIC:0};
const CardTag={PLAY_DURING_SETUP:'setup'};
const CardType={COLORLESS:1,PSYCHIC:2,FIRE:3,DARKNESS:4};
const enums={Stage,CardTag,CardType};
const basic=(name,attack)=>({name,fullName:name+' TEST',stage:0,
  attacks:attack?[attack]:[]});
const psychic={name:'Psychic Energy',fullName:'Psychic Energy TEST'};
const radiant=basic('Radiant Eternatus',{
  name:'Power Beam',cost:[3,4,1],gxAttack:false});
const shadow=basic('Shadow Rider Calyrex V',{
  name:'Shadow Mist',cost:[2],gxAttack:false});
const latias=basic('Latias ex',{name:'Eon Blade',cost:[2,2,1]});
function input(cards,options={}){
  const owner={hand:{cards}};
  const prompt={cards:owner.hand,options:{min:1,max:6,
    blocked:[],...options},
    validate(selection){
      return Array.isArray(selection)&&selection.length>=1&&
        selection.length<=this.options.max&&
        selection.every(c=>cards.includes(c)&&c.stage===0);
    }};
  return {owner,prompt};
}

test('owner-only opening changes genuinely unfundable Radiant to funded Shadow Rider',()=>{
  const {owner,prompt}=input([psychic,radiant,shadow,latias]);
  const proposal=chooseOwnerColoredStarter(prompt,owner,enums);
  assert.equal(proposal.chosen,shadow);
  assert.deepEqual(proposal.selected,[shadow,radiant,latias]);
  assert.equal(proposal.reason,
    'single-held-basic-energy-pays-entire-printed-basic-attack');
});

test('when baseline opens a payable attacker the original selection is preserved',()=>{
  const {owner,prompt}=input([shadow,psychic,radiant,latias]);
  assert.equal(chooseOwnerColoredStarter(prompt,owner,enums),null);
});

test('held Psychic does not falsely pay Fire plus Darkness Power Beam',()=>{
  const {owner,prompt}=input([psychic,radiant,latias]);
  assert.equal(chooseOwnerColoredStarter(prompt,owner,enums),null);
});

test('no own Basic Energy or only one eligible Basic produces no intervention',()=>{
  const without=input([radiant,shadow,latias]);
  assert.equal(chooseOwnerColoredStarter(without.prompt,without.owner,enums),null);
  const solo=input([psychic,radiant]);
  assert.equal(chooseOwnerColoredStarter(solo.prompt,solo.owner,enums),null);
});

test('native validator and setup capacity always govern actual Bench selection',()=>{
  const {owner,prompt}=input([psychic,radiant,shadow,latias],{max:2});
  const proposal=chooseOwnerColoredStarter(prompt,owner,enums);
  assert.deepEqual(proposal.selected,[shadow,radiant]);
  const blocked=input([psychic,radiant,shadow,latias],{blocked:[2]});
  assert.equal(chooseOwnerColoredStarter(blocked.prompt,blocked.owner,enums),null);
});

test('never select printed GX as a one-Energy opening attack',()=>{
  const gx=basic('GX only',{name:'Cheap-GX',cost:[2],gxAttack:true});
  const {owner,prompt}=input([radiant,psychic,gx]);
  assert.equal(chooseOwnerColoredStarter(prompt,owner,enums),null);
});

class ChooseCardsPrompt{
  constructor(owner,items){
    this.id=29;this.playerId=owner.id;this.result=undefined;
    this.cards=owner.hand;this.message='CHOOSE_STARTING_POKEMONS';
    this.options={min:1,max:6,blocked:[]};
    this.validate=value=>Array.isArray(value)&&value.length>0&&
      value.every(card=>items.includes(card));
  }
}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'FALLBACK';}
}
const engine=relative=>({
  'simple-bot/simple-tactics-ai':{SimpleTacticsAi},
  'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
  'game/store/state/state':{GamePhase:{SETUP:1}},
  'game/game-message':{GameMessage:{CHOOSE_STARTING_POKEMONS:
    'CHOOSE_STARTING_POKEMONS'}},
  'game/store/card/card-types':enums
})[relative];

for(const seat of [0,1]){
  test('native adapter first-owner chooser and full reversible hook seat '+seat,()=>{
    const before=SimpleTacticsAi.prototype.decodeNextAction;
    const owners=[{id:101,hand:{cards:[radiant,shadow,psychic,latias]}},
      {id:202,hand:{cards:[radiant,shadow,psychic,latias]}}];
    const owner=owners[seat];
    const state={phase:1,turn:0,players:owners,
      prompts:[new ChooseCardsPrompt(owner,owner.hand.cards)],
      opponentUnknownPrize:'hidden-sentinel'};
    const observed=withOwnerColoredStarter(()=>{
      const output=new SimpleTacticsAi(owner.id).decodeNextAction(state);
      assert.ok(output instanceof ResolvePromptAction);
      assert.equal(output.result[0],shadow);
      assert.deepEqual(output.result,[shadow,radiant,latias]);
      return output;
    },{engine});
    assert.equal(observed.audit.version,VERSION);
    assert.equal(observed.audit.proposals,1);
    assert.equal(observed.audit.bySeat[seat],1);
    assert.equal(observed.audit.competitiveGameQualified,false);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,before);
  });
}

test('non-setup and opponent-mismatched prompts remain fully delegated',()=>{
  const players=[{id:101,hand:{cards:[radiant,shadow,psychic]}},
    {id:202,hand:{cards:[]}}];
  const state={phase:2,turn:1,players,
    prompts:[new ChooseCardsPrompt(players[0],players[0].hand.cards)]};
  const observed=withOwnerColoredStarter(()=>
    new SimpleTacticsAi(101).decodeNextAction(state),{engine});
  assert.equal(observed.result,'FALLBACK');
  assert.equal(observed.audit.proposals,0);
});

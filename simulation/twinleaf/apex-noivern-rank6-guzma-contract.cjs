'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {preparedRegidrago}=require('./apex-attack-action.cjs');
const out=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(out,name));

function stagedGuzmaBypass(gust){
  const cards=initializeCards();
  const get=name=>cards.getCardByName(name);
  const noivern=get('Noivern ex PAL');
  const v=get('Regidrago V SIT');
  const thorns=get('Iron Thorns ex TWM');
  const lightning=get('Speed Lightning Energy RCL');
  const dce=get('Double Colorless Energy SUM');
  const guzma=get('Guzma BUS');
  assert.ok(noivern&&v&&thorns&&lightning&&dce&&guzma,
    'Require exact published rank-6 source-print Guzma and Special Energies');
  const f=preparedRegidrago();
  f.attachFire();
  f.attacking.discard.cards.push(noivern);
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const benched=new PokemonCardList();
  benched.cards.push(v);
  f.attacking.bench.push(benched);
  f.defending.active.cards.splice(0,1,thorns);
  for(const energy of [lightning,dce]){
    f.defending.active.cards.push(energy);
    f.defending.active.energies.cards.push(energy);
  }
  const protectedSlot=f.attacking.active;
  const {AttackAction}=load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GamePhase}=load('game/store/state/state');
  const {clearCopyAttackSessionsForTests}=
    load('game/store/prefabs/copy-attack-delegation');
  const waits=()=>{
    for(let i=0;i<12;i++){
      const p=f.state.prompts.find(p=>p.result===undefined);
      if(!p)return;
      assert.equal(p.constructor.name,'WaitPrompt');
      f.store.dispatch(new ResolvePromptAction(p.id,null));
    }
    assert.fail('More than 12 pending Wait prompts');
  };
  try {
    f.store.dispatch(new AttackAction(101,'Apex Dragon'));
    const p=f.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='ChooseAttackPrompt');
    const attack=noivern.attacks.find(a=>a.name==='Covert Flight');
    assert.ok(p?.cards.includes(noivern)&&attack&&p.validate(attack,f.state));
    f.store.dispatch(new ResolvePromptAction(p.id,attack));
    waits();
    assert.equal(f.state.turn,5);
    assert.equal(f.state.activePlayer,1);
    assert.equal(f.state.phase,GamePhase.PLAYER_TURN);
    assert.equal(f.defending.active.damage,70);
    f.defending.hand.cards.push(guzma);
    if(gust){
      const held=f.defending.hand.cards.indexOf(guzma);
      f.store.dispatch(new PlayCardAction(202,held,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      const select=f.state.prompts.find(p=>p.result===undefined);
      assert.equal(select?.constructor.name,'ChoosePokemonPrompt');
      const target=f.attacking.bench[0];
      assert.equal(target.getPokemonCard()?.name,'Regidrago V');
      assert.equal(select.validate([target],f.state),true);
      f.store.dispatch(new ResolvePromptAction(select.id,[target]));
      waits();
    }
    const current=f.attacking.active;
    const recipient=current.getPokemonCard()?.name;
    const previous=current.damage;
    assert.equal(f.defending.active.getPokemonCard()?.name,'Iron Thorns ex');
    f.store.dispatch(new AttackAction(202,'Volt Cyclone'));
    waits();
    return {
      gust,recipient,deltaDamage:current.damage-previous,
      originalVstarDamage:protectedSlot.damage,
      guzmaLeavesHand:!f.defending.hand.cards.includes(guzma),
      naturalStoreTurnHandoff:true,
      sourceAttacker:'Iron Thorns ex TWM',
      competitiveGameQualified:false
    };
  }finally{clearCopyAttackSessionsForTests();}
}
function compareGuzmaBypass(){
  const control=stagedGuzmaBypass(false);
  const gust=stagedGuzmaBypass(true);
  assert.equal(control.deltaDamage,0);
  assert.equal(gust.deltaDamage,140);
  assert.equal(gust.originalVstarDamage,0);
  assert.equal(gust.guzmaLeavesHand,true);
  return {
    kind:'native-staged-rank6-guzma-bypass-covert-v1',
    control,gust,competitiveGamesQualified:0,
    limitation:'Injected source cards, native paid Apex/Wait/Guzma prompt/Volt Cyclone; not a source-dealt match'
  };
}
if(require.main===module)console.log(JSON.stringify(compareGuzmaBypass(),null,2));
module.exports={stagedGuzmaBypass,compareGuzmaBypass};

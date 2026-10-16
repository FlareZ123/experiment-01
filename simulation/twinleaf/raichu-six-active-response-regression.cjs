'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedRaichu,providedEnergy}=require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook}=require('./electro-rain-damage-hook.cjs');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(root,name));

/**
 * Source-printed six-Energy attacker versus one Benched Shadow Rider VMAX
 * and one Active Shadow Rider V. The Active V has no Sight bonus and its
 * fresh HP protects against the combined five-Prize selection threshold.
 * The attacker and Energy attachments are directly staged.
 */
function runActivePositionResponse(){
  const energyNames=[
    'Reversal Energy PAL','Reversal Energy PAL',
    'Reversal Energy PAL','Reversal Energy PAL',
    'Counter Energy CIN','Counter Energy CIN'
  ];
  const f=stagedRaichu(energyNames,null);
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');

  const vmax=new PokemonCardList();
  const vmaxCard=f.card('Shadow Rider Calyrex VMAX CRE');
  vmaxCard.id=2401;
  vmax.cards.push(vmaxCard);
  f.b.bench.push(vmax);
  const activeV=f.b.active.getPokemonCard();
  assert.equal(activeV.fullName,'Shadow Rider Calyrex V CRE');
  activeV.id=2402;
  f.a.active.getPokemonCard().id=1401;
  f.attached.forEach((e,i)=>{e.id=1402+i;});
  f.a.active.tools.push(f.card('Telescopic Sight VIV'));
  for(const [player,prizeCount] of [[f.a,6],[f.b,4]]){
    player.prizes=Array.from({length:prizeCount},()=>{
      const slot=new CardList();
      slot.cards.push(f.card('Psychic Energy SVE'));
      return slot;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  const before=f.a.getPrizeLeft();
  const events=[];
  const attack=()=>{
    f.store.dispatch(new AttackAction(101,'Electro Rain'));
    for(let i=0;i<25;i++){
      const p=f.state.prompts.find(row=>row.result===undefined);
      if(!p)break;
      let choice;
      const type=p.constructor.name;
      if(type==='ChooseCardsPrompt')choice=[...f.attached];
      else if(type==='PutDamagePrompt'){
        assert.equal(p.damage,480);
        choice=[
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},damage:300},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0},damage:180}
        ];
      }else if(type==='ChoosePrizePrompt'){
        choice=f.a.prizes.filter(row=>row.cards.length).slice(0,p.options.count);
      }else if(type==='WaitPrompt')choice=null;
      else throw new Error('Unexpected Active response prompt '+type);
      assert.ok(p.validate(choice,f.state),'Rejected '+type);
      events.push(type);
      f.store.dispatch(new ResolvePromptAction(p.id,choice));
    }
    assert.ok(!f.state.prompts.some(p=>p.result===undefined));
  };
  withElectroRainDamageHook(attack);
  const summary={
    scope:'injected attacker with six source Special Energy, undamaged Active V and Benched VMAX',
    packets:providedEnergy(f).reduce((n,row)=>n+row.provides.length,0),
    activeVDamage:f.b.active.damage,
    vmaxKO:f.b.discard.cards.includes(vmaxCard),
    activeVSurvived:f.b.active.getPokemonCard()===activeV,
    prizesTaken:before-f.a.getPrizeLeft(),
    events
  };
  console.log(JSON.stringify(summary,null,2));
  // Attack discards the six Energies, so the surviving board has no
  // attached Energy; the PutDamage prompt verifies the original 480.
  assert.equal(summary.packets,0);
  assert.equal(summary.activeVDamage,180);
  assert.equal(summary.vmaxKO,true);
  assert.equal(summary.activeVSurvived,true);
  assert.equal(summary.prizesTaken,3);
  return summary;
}
if(require.main===module)runActivePositionResponse();
module.exports={runActivePositionResponse};

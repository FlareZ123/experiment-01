'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {buildManualAndBombBoard} = require('./raichu-manual-plus-bomb-setup.cjs');
const {withElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');

const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(compiled, name));

/**
 * One uninterrupted Store sequence: regular Energy attachment, scripted
 * Extra Energy Bomb transfer and opponent Prize taking, then Electro Rain
 * with mixed Bench targets and attack-damage fidelity hook.
 *
 * Evolutions, the five discarded Energy, Target Bench and Telescopic Sight
 * are injected prerequisites. This is not a normal opening or bot policy.
 */
function runEnergyAbilityAttackSequence() {
  const {fixture:f, response:setup}=buildManualAndBombBoard();
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');

  const targets=[
    ['Shadow Rider Calyrex VMAX CRE',2201],
    ['Shadow Rider Calyrex V CRE',2202]
  ].map(([name,id])=>{
    const list=new PokemonCardList();
    const card=f.card(name);
    card.id=id;
    list.cards.push(card);
    f.b.bench.push(list);
    return card;
  });
  f.a.active.tools.push(f.card('Telescopic Sight VIV'));

  const prizeStart=f.a.getPrizeLeft();
  const eventNames=[];
  const doAttack=()=>{
    f.store.dispatch(new AttackAction(101,'Electro Rain'));
    for(let i=0;i<35;i++){
      const prompt=f.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const type=prompt.constructor.name;
      let selection;
      if(type==='ChooseCardsPrompt'){
        selection=[...f.a.active.energies.cards];
      }else if(type==='PutDamagePrompt'){
        assert.equal(prompt.damage,480,
          '4 Reversal + 2 Counter should supply 16 Lightning units');
        selection=[
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},damage:300},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1},damage:180}
        ];
      }else if(type==='ChoosePrizePrompt'){
        selection=f.a.prizes.filter(p=>p.cards.length).slice(0,prompt.options.count);
      }else if(type==='WaitPrompt'){
        selection=null;
      }else{
        throw new Error('Unexpected attack prompt: '+type);
      }
      assert.ok(prompt.validate(selection,f.state),'Rejected '+type);
      eventNames.push({name:type,amount:prompt.damage||null});
      f.store.dispatch(new ResolvePromptAction(prompt.id,selection));
    }
    assert.ok(!f.state.prompts.some(p=>p.result===undefined),
      'Unresolved Store prompts after attack');
  };
  withElectroRainDamageHook(doAttack);
  const result={
    setup:{
      attachedEnergyCards:setup.attachedEnergyCards,
      lightningUnits:setup.rainbowUnits,
      opponentPrizesAfterSelfKO:setup.opponentPrizes,
      electrodeKnockedOut:setup.electrodeKnockedOut,
      handEnergyPresent:setup.handEnergyPresent
    },
    attack:{
      prizesBefore:prizeStart,
      prizesAfter:f.a.getPrizeLeft(),
      prizesTaken:prizeStart-f.a.getPrizeLeft(),
      vmaxKnockedOut:f.b.discard.cards.includes(targets[0]),
      vKnockedOut:f.b.discard.cards.includes(targets[1]),
      attackEvents:eventNames
    }
  };
  console.log(JSON.stringify(result,null,2));
  assert.equal(result.setup.attachedEnergyCards,6);
  assert.equal(result.setup.lightningUnits,16);
  assert.equal(result.setup.opponentPrizesAfterSelfKO,4);
  assert.equal(result.attack.prizesTaken,5);
  assert.equal(result.attack.vmaxKnockedOut,true);
  assert.equal(result.attack.vKnockedOut,true);
  return result;
}

if(require.main===module)runEnergyAbilityAttackSequence();
module.exports={runEnergyAbilityAttackSequence};

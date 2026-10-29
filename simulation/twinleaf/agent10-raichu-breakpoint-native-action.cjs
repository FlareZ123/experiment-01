'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedRaichu}=require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook}=require('./electro-rain-damage-hook.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const {buildPublicPokemonProfileIndex}=
  require('./agent10-original-printing-energy-flags.cjs');

const compiled=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(compiled,name));
const RESEARCH_ROOT=path.resolve(__dirname,'../..');

/**
 * A frozen printed public catalog. It uses native enum values and all public
 * printed card records, with no opponent deck or concealed Prize information.
 */
function nativeCatalog(){
  const {CardType,Stage,SpecialCondition}=
    load('game/store/card/card-types');
  return {
    basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
    specialEnergies:new Set([
      'Unit Energy LPM UPR','Reversal Energy PAL','Counter Energy CIN'
    ]),
    basicEnergyTypes:{
      Grass:CardType.GRASS,Fire:CardType.FIRE,Water:CardType.WATER,
      Lightning:CardType.LIGHTNING,Psychic:CardType.PSYCHIC,
      Fighting:CardType.FIGHTING,Darkness:CardType.DARK,
      Metal:CardType.METAL,Fairy:CardType.FAIRY
    },colorlessEnergyType:CardType.COLORLESS,
    specialConditions:{ASLEEP:SpecialCondition.ASLEEP,
      PARALYZED:SpecialCondition.PARALYZED},
    stages:Stage,
    publicPokemonProfileIndex:buildPublicPokemonProfileIndex(RESEARCH_ROOT)
  };
}

/**
 * A staged already-evolved printed board tests ONLY whether a genuine
 * owner-hand Store attachment between the actor decision and Electro Rain
 * changes a 60-HP-remaining Bench VMAX into a KO. Evolution, opposing Bench,
 * Prize state and an initial Unit LPM are injected prerequisites.
 *
 * @param {boolean} enableBreakpoint
 * @returns {object}
 */
function runNativeBreakpointCase(enableBreakpoint){
  const f=stagedRaichu(['Unit Energy LPM UPR'],null);
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {PlayerType,SlotType,PlayCardAction}=
    load('game/store/actions/play-card-action');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');

  f.a.active.getPokemonCard().id=1050;
  f.b.active.getPokemonCard().id=2050;
  f.attached[0].id=1051;
  const reversal=f.card('Reversal Energy PAL');
  reversal.id=1052;
  f.a.hand.cards.push(reversal);
  const vmax=new PokemonCardList();
  const vmaxCard=f.card('Shadow Rider Calyrex VMAX CRE');
  vmaxCard.id=2051;
  vmax.cards.push(vmaxCard);
  vmax.damage=vmaxCard.hp-60;
  assert.ok(vmax.damage>0);
  const slot=f.b.bench.findIndex(p=>!p.getPokemonCard());
  let benchSlot=slot;
  if(benchSlot>=0)f.b.bench[benchSlot]=vmax;
  else{
    assert.ok(f.b.bench.length<5);
    benchSlot=f.b.bench.length;
    f.b.bench.push(vmax);
  }
  for(const [player,n] of [[f.a,6],[f.b,4]]){
    player.prizes=Array.from({length:n},()=>{
      const p=new CardList();
      p.cards.push(f.card('Psychic Energy SVE'));
      return p;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  const view=actorObservation(f.state,0);
  const catalog=nativeCatalog();
  const proposed=chooseActorRootIntent(view,catalog,{
    publicContextSpecialEnergy:true,
    raichuKoBreakpointBeforeAttack:enableBreakpoint
  });
  assert.equal(proposed.kind,
    enableBreakpoint?'attach-special-energy':'attack');
  assert.equal(enableBreakpoint?
    proposed.printing:proposed.attackName,enableBreakpoint?
      'Reversal Energy PAL':'Electro Rain');

  let physicallyAttached=false;
  if(enableBreakpoint){
    f.store.dispatch(new PlayCardAction(101,proposed.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    physicallyAttached=f.a.active.energies.cards.includes(reversal);
    assert.equal(physicallyAttached,true);
    assert.equal(f.a.hand.cards.includes(reversal),false);
    assert.equal(f.a.energyPlayedTurn,f.state.turn);
  }
  const afterView=actorObservation(f.state,0);
  const attackIntent=chooseActorRootIntent(afterView,catalog,{
    publicContextSpecialEnergy:true,
    raichuKoBreakpointBeforeAttack:enableBreakpoint
  });
  assert.deepEqual(attackIntent,{kind:'attack',attackName:'Electro Rain'});
  const initialPrizes=f.a.getPrizeLeft();
  const prompts=[];
  const attack=()=>{
    f.store.dispatch(new AttackAction(101,attackIntent.attackName));
    for(let i=0;i<35;i++){
      const prompt=f.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const type=prompt.constructor.name;
      let chosen;
      if(type==='ChooseCardsPrompt')
        chosen=[...f.a.active.energies.cards];
      else if(type==='PutDamagePrompt'){
        assert.equal(prompt.damage,enableBreakpoint?120:30);
        chosen=[{target:{player:PlayerType.TOP_PLAYER,
          slot:SlotType.BENCH,index:benchSlot},damage:prompt.damage}];
      }else if(type==='ChoosePrizePrompt')
        chosen=f.a.prizes.filter(p=>p.cards.length)
          .slice(0,prompt.options.count);
      else if(type==='WaitPrompt')chosen=null;
      else throw Error('Unexpected native prompt '+type);
      assert.ok(prompt.validate(chosen,f.state),'Unaccepted '+type);
      prompts.push({type,amount:prompt.damage??null});
      f.store.dispatch(new ResolvePromptAction(prompt.id,chosen));
    }
    assert.ok(!f.state.prompts.some(p=>p.result===undefined));
  };
  withElectroRainDamageHook(attack);
  const result={
    enableBreakpoint,originalSourceRanks:[4,17],
    nativePhysicalAttachment:physicallyAttached,
    rootIntent:proposed,attackIntent,
    attackEnergyCardsBefore:enableBreakpoint?2:1,
    observedAttackDamage:enableBreakpoint?120:30,
    targetKO:f.b.discard.cards.includes(vmaxCard),
    targetDamageRemaining:f.b.bench[benchSlot]?.damage??null,
    prizesTaken:initialPrizes-f.a.getPrizeLeft(),
    prompts,
    qualification:'staged-board Store demonstration only'
  };
  assert.equal(result.targetKO,enableBreakpoint);
  assert.equal(result.prizesTaken,enableBreakpoint?3:0);
  return result;
}
function verify(){
  const control=runNativeBreakpointCase(false);
  const treatment=runNativeBreakpointCase(true);
  const result={pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    control,treatment,competitiveQualified:false,
    note:'Opponent face-up HP, existing Evolution, one Unit LPM and Prize deficit were directly staged; only Reversal hand attachment and the attack were genuine Store actions.'};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)verify();
module.exports={nativeCatalog,runNativeBreakpointCase,verify};

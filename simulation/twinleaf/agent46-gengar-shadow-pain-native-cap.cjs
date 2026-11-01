'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const engine=modulePath=>require(path.join(output,modulePath));

/**
 * Native pinned Store test: evolve printed UNB Gengar from hand and answer
 * its Shadow Pain prompt against a mixed GX / non-GX board. The printed
 * effect permits only GX/EX targets. This test intentionally submits a
 * paper-forbidden target to characterize the vendor prompt validator.
 *
 * @param {boolean} forbidden Whether to place counters on non-GX Bench.
 * @returns {object} Actual reducer and post-Store public consequences.
 */
function probeShadowPain(forbidden){
  const manager=initializeCards();
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Missing pinned card '+name);
    return result;
  };
  const {Store}=engine('game/store/store');
  const {State,GamePhase}=engine('game/store/state/state');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');

  const a=new Player(),b=new Player();
  a.id=101;a.name='Shadow Pain owner';
  b.id=202;b.name='Mixed-target opponent';
  const gastly=card('Gastly UNB'),haunter=card('Haunter UNB');
  const gengar=card('Gengar UNB');
  const eligible=card('Dedenne-GX UNB');
  const ineligible=card('Shadow Rider Calyrex V CRE');
  assert.equal(gengar.powers[0].name,'Shadow Pain');
  assert.match(gengar.powers[0].text,/Pokémon-GX and Pokémon-EX/);
  a.active.cards.push(gastly,haunter);
  a.active.pokemonPlayedTurn=1;
  a.hand.cards.push(gengar);
  b.active.cards.push(eligible);
  const spare=new PokemonCardList();
  spare.cards.push(ineligible);
  b.bench.push(spare);
  for(const player of [a,b]){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State();
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=0;
  state.players=[a,b];
  state.gameSettings.format=Format.EXPANDED;
  const store=new Store({onStateChange(){}});
  store.state=state;

  store.dispatch(new PlayCardAction(a.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(a.active.getPokemonCard()?.fullName,'Gengar UNB',
    'Gengar must be genuinely evolved by a native PlayCardAction');
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const confirm=pending();
  assert.equal(confirm?.constructor.name,'ConfirmPrompt',
    'Gengar must offer its genuine Shadow Pain Ability');
  assert.equal(confirm.validate(true,state),true);
  store.dispatch(new ResolvePromptAction(confirm.id,true));

  const prompt=pending();
  assert.equal(prompt?.constructor.name,'PutDamagePrompt');
  assert.equal(prompt.damage,60);
  const gxTarget={
    player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0
  };
  const nonGxTarget={
    player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0
  };
  const capFor=target=>prompt.maxAllowedDamage.find(entry=>
    entry.target.player===target.player &&
    entry.target.slot===target.slot &&
    entry.target.index===target.index)?.damage;
  assert.equal(capFor(gxTarget),9999);
  assert.equal(capFor(nonGxTarget),0);
  const chosen=forbidden?nonGxTarget:gxTarget;
  const allocation=[{target:chosen,damage:60}];
  const validatorAccepted=prompt.validate(allocation,state);
  let dispatchError=null;
  try{store.dispatch(new ResolvePromptAction(prompt.id,allocation));}
  catch(e){dispatchError=String(e?.message??e);}
  const result={
    forbidden,stage:'native-PlayCardAction-to-real-Shadow-Pain-prompt',
    printedRestriction:'opposing GX and EX only',
    targets:{gx:'Dedenne-GX UNB',nonGx:'Shadow Rider Calyrex V CRE'},
    caps:{gx:capFor(gxTarget),nonGx:capFor(nonGxTarget)},
    proposal:{target:forbidden?'non-GX Bench':'GX Active',damage:60},
    validatorAccepted,dispatchError,
    publicDamage:{eligibleActive:b.active.damage,ineligibleBench:spare.damage},
    unresolvedPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
  if(!forbidden){
    assert.equal(validatorAccepted,true);
    assert.equal(dispatchError,null);
    assert.equal(result.publicDamage.eligibleActive,60);
    assert.equal(result.publicDamage.ineligibleBench,0);
  }
  return result;
}

function run(){
  const legal=probeShadowPain(false);
  const forbidden=probeShadowPain(true);
  const out={
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    kind:'native-card-prompt-zero-cap-paper-restriction-characterization',
    legal,forbidden,
    conclusion:forbidden.validatorAccepted&&
      forbidden.publicDamage.ineligibleBench===60?
      'native-Store-accepted-paper-forbidden-Shadow-Pain-target':
      'forbidden-target-rejected-or-harmless',
    qualification:'synthetic original-card printings, native Store effects, no Top32 game'
  };
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)run();
module.exports={probeShadowPain,run};

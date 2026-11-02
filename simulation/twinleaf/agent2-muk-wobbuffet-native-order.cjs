'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION = 'agent2-official-muk-evolves-under-active-wobbuffet-native-v1';
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {object} */
const engine = name => require(path.join(root, name));

/**
 * A staged *officially answered* game-state interaction:
 * Wobbuffet Bide Barricade is already active while our Alolan Grimer
 * evolves from the hand to Alolan Muk. The paper Q&A requires a disabled
 * Wobbuffet and reinstated non-Basic Legacy Star.
 *
 * The hand evolution is a real Store PlayCardAction with a physically held
 * evolution card, not a directly injected Stage1. The board preceding it
 * is staged and not evidence that the candidate can obtain that board.
 *
 * @param {{seat:0|1,wobbuffetActive:boolean}} choice
 * @returns {object}
 */
function runCase(choice) {
  const { Store } = engine('game/store/store');
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { CardList } = engine('game/store/state/card-list');
  const { PlayCardAction,PlayerType,SlotType } =
    engine('game/store/actions/play-card-action');
  const { IS_ABILITY_BLOCKED } = engine('game/store/prefabs/prefabs');
  const { CheckPokemonPowersEffect } = engine('game/store/effects/check-effects');
  const { GameSettings } = engine('game/core/game-settings');

  const manager = initializeCards();
  const get = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Missing compiled print '+name);
    return card;
  };
  const owner = new Player(), opponent = new Player();
  owner.id = 221; opponent.id = 222;
  owner.name = 'Apex Alchemy staged owner';
  opponent.name = 'original rank7 Wobbuffet staged defender';
  owner.active.cards.push(get('Regidrago V SIT'));
  const grimer = get('Alolan Grimer SUM');
  const muk = get('Alolan Muk SUM');
  const grimerSlot = new PokemonCardList();
  grimerSlot.cards.push(grimer);
  grimerSlot.pokemonPlayedTurn = 1;
  owner.bench.push(grimerSlot);
  const regidragoVstar = get('Regidrago VSTAR SIT');
  const regidragoSlot = new PokemonCardList();
  regidragoSlot.cards.push(get('Regidrago V SIT'),regidragoVstar);
  regidragoSlot.pokemonPlayedTurn = 1;
  owner.bench.push(regidragoSlot);
  const latias = get('Latias ex SSP');
  const latiasSlot = new PokemonCardList();
  latiasSlot.cards.push(latias);
  owner.bench.push(latiasSlot);
  owner.hand.cards.push(muk);

  const wob = get('Wobbuffet PHF');
  if (choice.wobbuffetActive) opponent.active.cards.push(wob);
  else {
    opponent.active.cards.push(get('Regidrago V SIT'));
    const wobSlot = new PokemonCardList();
    wobSlot.cards.push(wob);
    opponent.bench.push(wobSlot);
  }
  for (const p of [owner,opponent]) {
    p.deck.cards.push(get('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(get('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }

  const state = new State(), settings = new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=choice.seat;
  state.players=choice.seat===0?[owner,opponent]:[opponent,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;

  /** @param {object} player @param {object} card @param {string} name */
  const ability = (player,card,name) => {
    const power=card.powers.find(p=>p.name===name);
    assert.ok(power,'Printed Ability missing: '+card.fullName+'/'+name);
    const check=new CheckPokemonPowersEffect(player,card);
    store.reduceEffect(state,check);
    return {
      blocked:Boolean(IS_ABILITY_BLOCKED(store,state,player,card,power)),
      visible:check.powers.some(p=>p.name===name)
    };
  };
  const before={
    wobbuffet:ability(opponent,wob,'Bide Barricade'),
    legacyStar:ability(owner,regidragoVstar,'Legacy Star'),
    latias:ability(owner,latias,'Skyliner')
  };
  let evolutionError=null;
  try {
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }));
  } catch(error) {
    evolutionError={name:error.name,message:String(error.message)};
  }
  const evolved=grimerSlot.getPokemonCard()?.fullName===muk.fullName;
  const after={
    wobbuffet:ability(opponent,wob,'Bide Barricade'),
    legacyStar:ability(owner,regidragoVstar,'Legacy Star'),
    latias:ability(owner,latias,'Skyliner'),
    muk:ability(owner,muk,'Power of Alchemy')
  };
  const paperExpected = choice.wobbuffetActive ?
    {
      before:{wobbuffet:{blocked:false,visible:true},
        legacyStar:{blocked:true,visible:false},
        latias:{blocked:false,visible:true}},
      after:{wobbuffet:{blocked:true,visible:false},
        legacyStar:{blocked:false,visible:true},
        latias:{blocked:true,visible:false},
        muk:{blocked:false,visible:true}}
    } :
    {
      before:{wobbuffet:{blocked:false,visible:true},
        legacyStar:{blocked:false,visible:true},
        latias:{blocked:false,visible:true}},
      after:{wobbuffet:{blocked:true,visible:false},
        legacyStar:{blocked:false,visible:true},
        latias:{blocked:true,visible:false},
        muk:{blocked:false,visible:true}}
    };
  // A Benched Wobbuffet is visible as an Ability but its passive condition
  // should be inert. The official ruling strictly addresses Active Wobbuffet.
  const applicableFields = choice.wobbuffetActive ?
    ['wobbuffet','legacyStar','latias','muk'] : ['legacyStar','latias','muk'];
  const discrepancies=[];
  for(const phase of ['before','after']){
    for(const key of applicableFields){
      if(!paperExpected[phase][key])continue;
      for(const field of ['blocked','visible']){
        const observed=phase==='before'?before[key][field]:after[key][field];
        const wanted=paperExpected[phase][key][field];
        if(observed!==wanted)
          discrepancies.push({phase,key,field,wanted,observed});
      }
    }
  }
  return {
    seat:choice.seat,originalWobbuffetActive:choice.wobbuffetActive,
    actualHandPlayAccepted:evolutionError===null,
    actualGrimerEvolved:evolved,
    mukRemovedFromOwnerHand:!owner.hand.cards.includes(muk),
    evolutionError,
    before,after,paperExpected,discrepancies,
    nativePaperAgreement:evolutionError===null && evolved &&
      !owner.hand.cards.includes(muk) && discrepancies.length===0,
    boardOnly:true,qualifiedCompetitiveGame:false
  };
}

/** @returns {object} */
function run() {
  const required=[
    'Wobbuffet PHF','Alolan Grimer SUM','Alolan Muk SUM',
    'Regidrago V SIT','Regidrago VSTAR SIT','Latias ex SSP'
  ];
  const manager=initializeCards();
  const missing=required.filter(x=>!manager.getCardByName(x));
  if(missing.length)return {
    schema:VERSION,pin:PIN,
    status:'MISSING_COMPILED_NATIVE_PRINTS',missing,
    paperRuleSource:'Official JP FAQ Muk Power of Alchemy Wobbuffet Bide Barricade',
    staged:true,qualifiedCompetitiveGames:0
  };
  const rows=[];
  for(const seat of [0,1]){
    for(const wobbuffetActive of [true,false])
      rows.push(runCase({seat,wobbuffetActive}));
  }
  return {
    schema:VERSION,pin:PIN,
    status:rows.every(x=>x.nativePaperAgreement)?
      'PINNED_STAGED_PAPER_MATCH':'PINNED_STAGED_PAPER_MISMATCH',
    paperRuleSource:'Official JP FAQ Muk Power of Alchemy Wobbuffet Bide Barricade',
    matches:rows.filter(x=>x.nativePaperAgreement).length,
    attempted:rows.length,
    rows,staged:true,realHandEvolution:true,
    naturalSourceAccessUnverified:true,qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,PIN,run,runCase};

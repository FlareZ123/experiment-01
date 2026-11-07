'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const native=p=>require(path.join(OUTPUT,p));

/**
 * Stage Mimikyu GRI Copycat against an injected previous-turn Latias ex
 * Eon Blade, then verify that the copied attack's generic next-turn lock
 * applies to Mimikyu itself.
 *
 * @param {0|1} seat Owner seat.
 * @returns {object} Native Store cost, damage, and next-turn restriction receipt.
 */
function copycatEonBladeNextOwnTurn(seat){
  const x=stage(seat);
  const cards=initializeCards();
  let cardId=951000+seat*100;
  const card=name=>{
    const value=cards.getCardByName(name);
    assert.ok(value,'Unknown pinned printed card '+name);
    value.id=cardId++;
    return value;
  };

  const mimikyu=card('Mimikyu GRI');
  const latias=card('Latias ex SSP');
  const existingPsychic=x.owner.active.energies.cards[0];
  assert.equal(existingPsychic.name,'Psychic Energy');
  const secondPsychic=card('Psychic Energy SVE');
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(mimikyu,existingPsychic,secondPsychic);
  x.owner.active.energies.cards.push(existingPsychic,secondPsychic);

  const opponentPsychic=[0,1,2].map(()=>card('Psychic Energy SVE'));
  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  x.opponent.active.cards.push(latias,...opponentPsychic);
  x.opponent.active.energies.cards.push(...opponentPsychic);

  const copycat=mimikyu.attacks.find(attack=>attack.name==='Copycat');
  const filch=mimikyu.attacks.find(attack=>attack.name==='Filch');
  const eonBlade=latias.attacks.find(attack=>attack.name==='Eon Blade');
  assert.ok(copycat&&filch&&eonBlade);
  assert.deepEqual(copycat.cost,['Psychic','Colorless']);
  assert.deepEqual(eonBlade.cost,['Psychic','Psychic','Colorless']);
  assert.match(eonBlade.text,/During your next turn, this Pokémon can't attack/i);

  // This is a staged native contract: the opponent's preceding Eon Blade is
  // injected as prior-turn history, as in Agent44's Copycat cost probe.
  x.state.playerLastAttack={
    [x.opponent.id]:{attack:eonBlade,sourceCard:latias}
  };
  x.state.lastAttack=eonBlade;

  const {AttackAction,PassTurnAction}=
    native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  function settleWaits(){
    const prompts=[];
    for(let i=0;i<36;i++){
      const pending=x.state.prompts.find(prompt=>prompt.result===undefined);
      if(!pending)break;
      prompts.push(pending.constructor.name);
      assert.equal(pending.constructor.name,'WaitPrompt',
        'Copycat fixture must not invent a discretionary prompt answer');
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(x.state.prompts.filter(prompt=>prompt.result===undefined).length,0);
    return prompts;
  }

  const energyNames=x.owner.active.energies.cards.map(energy=>energy.name);
  assert.deepEqual(energyNames,['Psychic Energy','Psychic Energy']);
  assert.equal(Boolean(x.owner.active.cannotAttackNextTurn),false);
  const damageBefore=x.opponent.active.damage;
  x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
  const copycatPrompts=settleWaits();
  const copiedDamage=x.opponent.active.damage-damageBefore;
  assert.equal(copiedDamage,200,
    'Copycat must use Eon Blade damage while paying only its own [P,C] cost');
  assert.equal(x.owner.active.cannotAttackNextTurn,true,
    'Copied Eon Blade restriction must attach to physical Mimikyu');
  assert.equal(x.owner.active.cannotAttackNextTurnPending,false);
  assert.equal(x.opponent.active.cannotAttackNextTurn,true===false);
  assert.equal(x.state.activePlayer,1-seat);
  const afterCopycatTurn=x.state.turn;

  x.store.dispatch(new PassTurnAction(x.opponent.id));
  const opponentPassPrompts=settleWaits();
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.state.phase,x.GamePhase.PLAYER_TURN);
  assert.equal(x.owner.active.cannotAttackNextTurn,true,
    'Copied restriction must survive until Mimikyu owner next turn');
  const nextOwnTurn=x.state.turn;
  assert.throws(
    ()=>x.store.dispatch(new AttackAction(x.owner.id,'Filch')),
    error=>error?.message==='BLOCKED_BY_EFFECT',
    'Eon Blade says this Pokémon cannot attack, so Filch must also be blocked'
  );

  return {
    seat,
    physicalAttacker:'Mimikyu GRI',
    donor:'Latias ex SSP',
    copiedAttack:'Eon Blade',
    nextTurnRestrictionText:eonBlade.text,
    mimikyuCopycatCost:copycat.cost,
    donorEonBladeCost:eonBlade.cost,
    donorCostAppliedToMimikyu:false,
    attachedMimikyuEnergyNames:energyNames,
    injectedPriorOpponentAttack:'Eon Blade',
    injectedPriorAttackActuallyPlayed:false,
    copiedDamage,
    afterCopycatTurn,nextOwnTurn,
    copycatPrompts,opponentPassPrompts,
    copiedRestrictionOnMimikyuAfterAttack:true,
    copiedRestrictionOnMimikyuNextOwnTurn:true,
    nextOwnTurnFilchRejectedAs:'BLOCKED_BY_EFFECT',
    paperGameCertified:false,
    competitiveGamesQualified:0
  };
}

/** @returns {object} Two-seat staged native copied-effect regression. */
function run(){
  const rows=[0,1].map(copycatEonBladeNextOwnTurn);
  return {
    schema:'agent3-mimikyu-copycat-eonblade-lock-native-v1',
    twinleafPin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    stagedNativeStore:true,
    priorOpponentEonBladeInjected:true,
    bothSeatsPassed:rows.length===2,
    passed:true,
    rows,
    paperGameCertified:false,
    qualifiedCompetitiveGames:0,
    caveat:'The prior opponent attack is injected; this is a native Store interaction test, not a complete paper game.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={copycatEonBladeNextOwnTurn,run};

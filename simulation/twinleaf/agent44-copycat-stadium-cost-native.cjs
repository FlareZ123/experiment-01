'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {buildActorCardCatalog}=require('./agent34-actor-only-root-policy.cjs');
const {effectiveNativeAttackCost}=require('./agent17-public-context-special-energy.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));

/**
 * Probe native Copycat payment with one real Basic Psychic, optionally under
 * Dimension Valley or an explicit public stadium-effect suppression epoch.
 * Opponent's earlier Gnaw is injected; this is a staged Store cost contract.
 * @param {0|1} seat
 * @param {{valley:boolean,suppress:boolean,newMoon?:boolean}} options
 * @returns {object}
 */
function probe(seat,options){
  const x=stage(seat),manager=initializeCards();
  let cardId=950000+seat*100;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'missing pinned '+name);c.id=cardId++;
    return c;
  };
  const mimikyu=card('Mimikyu GRI');
  const venonat=card('Venonat MEW');
  const alreadyAttached=x.owner.active.energies.cards[0];
  assert.equal(alreadyAttached.name,'Psychic Energy');
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(mimikyu,alreadyAttached);
  x.owner.active.energies.cards.push(alreadyAttached);
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(venonat);
  const gnaw=venonat.attacks.find(a=>a.name==='Gnaw');
  assert.ok(gnaw);
  x.state.playerLastAttack={[x.opponent.id]:{
    attack:gnaw,sourceCard:venonat}};
  x.state.lastAttack=gnaw;
  if(options.valley)x.owner.stadium.cards.push(card('Dimension Valley PHF'));
  if(options.suppress)x.owner.stadiumAndToolHaveNoEffectTurnsRemaining=1;
  if(options.newMoon){
    // Owner's own Lunatone OBF + Solrock CES prevents Stadium effects on
    // its Pokémon. This is a genuine, public, printed-board Ability lock.
    for(const [index,printing] of [[1,'Lunatone OBF'],[2,'Solrock CES']]){
      x.owner.bench[index].cards.length=0;
      x.owner.bench[index].cards.push(card(printing));
    }
  }

  // Compare the already-selected public cost model against real Store results.
  const view=actorObservation(x.state,seat);
  const Types=native('game/store/card/card-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...Types,PowerType:native('game/store/card/pokemon-types').PowerType});
  const printed=view.ownPublic.active.attacks.find(a=>a.name==='Copycat');
  const proxyCost=effectiveNativeAttackCost(view,catalog,
    view.ownPublic.active,printed);
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  let error=null,accepted=false;
  const damageBefore=x.opponent.active.damage;
  try{
    x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
    for(let i=0;i<20;i++){
      const pending=x.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      if(pending.constructor.name!=='WaitPrompt')break;
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    accepted=true;
  }catch(e){error=String(e?.message??e);}
  return {seat,...options,proxyCost,printedCost:printed.cost,
    publicStadium:view.ownPublic.stadium,
    exposedSuppressionFlag:'stadiumAndToolHaveNoEffectTurnsRemaining' in
      (view.ownPublic.publicTurnRestrictions??{}),
    exposedSuppressionValue:view.ownPublic.publicTurnRestrictions
      .stadiumAndToolHaveNoEffectTurnsRemaining,
    accepted,error,damage:x.opponent.active.damage-damageBefore,
    pending:x.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    qualifiedCompetitiveGames:0};
}

function run(){
  const rows=[];
  for(const seat of [0,1]){
    const baseline=probe(seat,{valley:false,suppress:false});
    const valley=probe(seat,{valley:true,suppress:false});
    const suppressed=probe(seat,{valley:true,suppress:true});
    const newMoon=probe(seat,{valley:true,suppress:false,newMoon:true});
    rows.push({seat,baseline,valley,suppressed,newMoon});
    assert.equal(baseline.accepted,false,
      'One Psychic without cost reduction cannot fund Copycat');
    assert.equal(valley.accepted,true,
      'Unblocked Dimension Valley must reduce Copycat by Colorless');
    assert.ok(valley.damage>0,
      'With native cost reduction the copied ordinary Gnaw must deal damage');
    assert.equal(suppressed.accepted,false,
      'Publicly suppressed Stadium must not waive Copycat cost');
    assert.deepEqual(suppressed.proxyCost,valley.proxyCost,
      'Agent17 generic cost estimator still ignores the newly exposed suppression epoch');
    assert.equal(suppressed.exposedSuppressionFlag,true,
      'Detached actor observation now exposes the public suppression epoch');
    assert.equal(suppressed.exposedSuppressionValue,1,
      'The exact per-player suppression countdown is preserved');
    assert.equal(newMoon.accepted,false,
      'Lunatone with Solrock prevents Dimension Valley reducing Copycat');
    assert.deepEqual(newMoon.proxyCost,valley.proxyCost,
      'Agent17 generic cost estimator still misses the visible New Moon pair');
  }
  const result={schema:'agent44-copycat-stadium-cost-bilateral-native-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    priorGnawInjected:true,constructedState:true,
    competitiveQualifiedGames:0,rows};
  console.log('AGENT44_COPYCAT_STADIUM_COST '+JSON.stringify(result));
  return result;
}
if(require.main===module)run();
module.exports={probe,run};

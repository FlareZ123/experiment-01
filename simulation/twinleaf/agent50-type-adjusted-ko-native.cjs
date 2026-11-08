'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');
const {choosePotentialKnockout,typeAdjustedFixedDamage}=
  require('./agent49-actor-potential-knockout.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file Pinned compiled engine module. */
const native=file=>require(path.join(OUTPUT,file));

/**
 * Exercise an authentic 2-Prize-independent, 3-Prize Tag Team KO with a
 * Pokémon printed in Black & White, both attack costs payable and public
 * default x2 Weakness. The registered Aichi 60s are NOT used for this
 * staged rule/policy fixture; it cannot certify a competitive win.
 *
 * @param {0|1} [seat=0] Actual physical acting seat.
 * @returns {object} Native action, resolution, and physical Prize receipt.
 */
function probeTypeAdjustedKoNative(seat=0){
  assert.ok(seat===0||seat===1);
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {CardType,SpecialCondition}=
    native('game/store/card/card-types');
  const f=stagedPainfulSpoons(seat);
  const {source,opponent,store,state}=f;
  assert.equal(state.activePlayer,seat);
  const attacker=f.card('Purrloin BLW');
  const defender=f.card('Gengar & Mimikyu-GX TEU');
  const e1=f.card('Darkness Energy SVE');
  const e2=f.card('Darkness Energy SVE');
  source.active.cards.splice(0,source.active.cards.length,attacker);
  source.active.energies.cards.splice(0,source.active.energies.cards.length,e1,e2);
  source.hand.cards.splice(0,source.hand.cards.length);
  opponent.active.cards.splice(0,opponent.active.cards.length,defender);
  opponent.active.damage=220;
  assert.equal(defender.hp,240);
  assert.deepEqual(attacker.attacks.map(x=>x.name),['Scratch','Slash']);
  assert.deepEqual(attacker.attacks.map(x=>x.damage),[10,20]);

  const view=actorObservation(state,seat);
  assert.equal(view.decisionKind,'owner-root');
  assert.equal(view.opponentPublic.active.printed.weakness.length,1);
  assert.equal(view.opponentPublic.active.printed.weakness[0].value,null,
    'Pinned native omitted x2 Weakness is normalized to null in the actor view');
  const catalog={
    basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set([e1.fullName]),
    basicEnergyTypes:{Darkness:CardType.DARK},
    colorlessEnergyType:CardType.COLORLESS,
    specialConditions:{
      ASLEEP:SpecialCondition.ASLEEP,
      PARALYZED:SpecialCondition.PARALYZED
    }
  };
  const offered=view.ownPublic.active.attacks;
  assert.equal(offered.length,2);
  assert.equal(typeAdjustedFixedDamage(offered[0].damage,
    view.ownPublic.active,view.opponentPublic.active),20);
  assert.equal(typeAdjustedFixedDamage(offered[1].damage,
    view.ownPublic.active,view.opponentPublic.active),40);
  // Independently prove the later native printed Slash is fully payable by
  // the same two physical Darkness Energy, rather than being excluded
  // by an incomplete actor-only Energy catalog.
  const slashOnlyView={
    ...view,ownPublic:{...view.ownPublic,
      active:{...view.ownPublic.active,attacks:[offered[1]]}}
  };
  assert.deepEqual(chooseActorRootIntent(slashOnlyView,catalog),{
    kind:'attack',attackName:'Slash'
  });
  const rawNominalV2=offered.find(x=>x.damage>=20);
  assert.equal(rawNominalV2?.name,'Slash');
  assert.equal(choosePotentialKnockout(view,offered),offered[0]);
  const actualIntent=chooseActorRootIntent(view,catalog,{potentialKoRoot:true});
  assert.deepEqual(actualIntent,{kind:'attack',attackName:'Scratch'});
  const beforePrizes=source.getPrizeLeft();
  assert.equal(beforePrizes,6);
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const prompts=[];
  store.dispatch(new AttackAction(source.id,actualIntent.attackName));
  for(let k=0;k<30;k++){
    const prompt=pending();
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let answer;
    if(kind==='WaitPrompt')answer=null;
    else if(kind==='ShowCardsPrompt')answer=true;
    else if(kind==='ChoosePrizePrompt'&&prompt.playerId===source.id){
      answer=source.prizes.filter(prize=>prize.cards.length>0)
        .slice(0,Number(prompt.options?.count??3));
    }else if(kind==='ChoosePokemonPrompt'&&
        prompt.playerId===opponent.id){
      answer=[opponent.bench[0]];
    }else if(kind==='ShuffleDeckPrompt'){
      const player=state.players.find(x=>x.id===prompt.playerId);
      assert.ok(player);
      answer=player.deck.cards.map((_,i)=>i);
    }else{
      throw new Error('Unrecognised native KO prompt '+kind);
    }
    assert.equal(prompt.validate(answer,state),true,kind+' native validator');
    prompts.push(kind);
    store.dispatch(new ResolvePromptAction(prompt.id,answer));
  }
  assert.equal(pending(),undefined);
  assert.equal(opponent.discard.cards.includes(defender),true);
  assert.equal(source.active.getPokemonCard(),attacker);
  assert.equal(opponent.active.getPokemonCard().fullName,
    'Shadow Rider Calyrex V CRE');
  const afterPrizes=source.getPrizeLeft();
  assert.equal(afterPrizes,3,
    'Gengar & Mimikyu-GX is TAG TEAM and awards 3 Prizes');
  return {
    version:'agent50-public-type-ko-native-v1',seat,actualNativeAttack:actualIntent.attackName,
    olderRawNominalPreference:rawNominalV2.name,
    attacker:attacker.fullName,defender:defender.fullName,
    observedWeakness:view.opponentPublic.active.printed.weakness,
    printedDamage:10,typeAdjustedDamage:20,
    targetRemainingBefore:20,defenderKnockedOut:true,
    sourcePrizesBefore:beforePrizes,sourcePrizesAfter:afterPrizes,
    sourcePrizesTaken:beforePrizes-afterPrizes,
    promptTrace:prompts,ownerHiddenReads:false,
    sourceDeckPhysicalComplete:false,opponentDeckPhysicalComplete:false,
    originalAichiPair:false,qualifiedGame:false,competitivelyQualifiedGames:0
  };
}
module.exports={probeTypeAdjustedKoNative};

'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../../simulation/evaluation/aichi-pilot.cjs');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const fixed=require('../../results/aichi-2026/candidates/agent50-sentinel-spiritomb-basicv-lock-60-v1.json');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

test('one-slot Spiritomb variant preserves sixty original registered paper printings',()=>{
  assert.equal(fixed.cards.reduce((a,c)=>a+c.count,0),60);
  const plan=planAichi(fixed,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(plan.candidate.unresolved.length,0);
  assert.ok(plan.candidate.cards.includes('Spiritomb PAL'));
  assert.equal(plan.opponents.filter(x=>x.status==='ready').length,29);
  console.log('AGENT50_SPIRITOMB_SIXTY '+JSON.stringify({
    frozenLength:60,originalPublishedRanks:29,
    candidateSubstitutions:plan.candidate.substitutions,
    paperQualified:false,competitiveQualifiedGames:0
  }));
});

/**
 * Test genuine owner-visible Store ability lock without opponent prize
 * assumptions. The single Stage 0 Spiritomb is already on Bench, not
 * automatically placed there by an optimization shortcut.
 * @param {0|1} ownerSeat
 * @param {boolean} hasSpiritomb
 * @returns {object}
 */
function stage(ownerSeat,hasSpiritomb){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const owner=new Player(),opponent=new Player();
  owner.id=98200;opponent.id=98201;
  const card=name=>{
    const v=manager.getCardByName(name);
    assert.ok(v,'Native identity absent '+name);
    return v;
  };
  for(const p of [owner,opponent]){
    p.bench=Array.from({length:5},()=>new PokemonCardList());
    for(let i=0;i<12;i++)p.deck.cards.push(card('Psychic Energy SVE'));
  }
  owner.active.cards.push(card('Lillipup CEC'),card('Herdier SUM'),
    card('Stoutland BCR'));
  owner.bench[0].cards.push(card('Oddish UNB'),card('Gloom UNB'),
    card('Vileplume AOR'));
  if(hasSpiritomb)owner.bench[1].cards.push(card('Spiritomb PAL'));
  owner.bench[2].cards.push(card('Relicanth TEF'));
  opponent.active.cards.push(card('Genesect V FST'));
  opponent.bench[0].cards.push(card('Genesect V FST'));
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=ownerSeat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=1-ownerSeat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,opponent};
}

for(const seat of [0,1]){
  test('Spiritomb PAL opp V engine lock while own Relicanth remains enabled, seat '+seat,()=>{
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
    const {CheckPokemonPowersEffect}=
      native('game/store/effects/check-effects');
    const locked=stage(seat,true);
    const action=s=>new UseAbilityAction(s.opponent.id,
      'Fusion Strike System',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      });
    assert.throws(()=>locked.store.dispatch(action(locked)),
      'Fettered in Misfortune must deny Basic Genesect V');
    const relicanth=locked.owner.bench[2].getPokemonCard();
    const powers=new CheckPokemonPowersEffect(locked.owner,relicanth);
    locked.store.reduceEffect(locked.state,powers);
    assert.ok(powers.powers.some(p=>p.name==='Memory Dive'),
      'Spiritomb should preserve our non-V Relicanth passive Ability');
    const unlocked=stage(seat,false);
    assert.doesNotThrow(()=>unlocked.store.dispatch(action(unlocked)));
    console.log('AGENT50_SPIRITOMB_NATIVE '+JSON.stringify({
      ownerSeat:seat,opponentBasicGenesectVAbilityDenied:true,
      nativeWithoutSpiritombActionAccepted:true,
      ownRelicanthAbilityPreserved:true,
      activeStoutland:'Sentinel',benchVileplume:'Irritating Pollen',
      paperQualified:false,qualifiedGames:0
    }));
  });
}

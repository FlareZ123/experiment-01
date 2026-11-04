'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stageSourceBunnelbyBoard}=
  require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');
const {resolveManifestFile}=
  require('../simulation/twinleaf/resolve-field.cjs');
const {initializeCards}=
  require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {withToolAttackAwareness}=
  require('../simulation/twinleaf/tool-attack-policy.cjs');
const {withBunnelbyEvolutionLine}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
const {withBunnelbyBarrageConsent}=
  require('../simulation/twinleaf/agent40-bunnelby-barrage-consent.cjs');
const {chooseGhCaptureRoot,chooseGhCapturePrompt,PRINTING}=
  require('../simulation/twinleaf/agent40-gh-capture-owner-sequencer.cjs');

const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {object} */
const native=p=>require(path.join(OUT,p));

/**
 * Source-60 conservation and exactly three initially held connectors.
 * This deliberately constructs a favorable physical owner opening; it is
 * not a sampled first-seven or a complete game.
 * @param {0|1} seat
 * @returns {object}
 */
function staged(seat){
  const {fixture:f}=stageSourceBunnelbyBoard();
  const source=resolveManifestFile(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).decks.find(d=>d.rank===2);
  assert.ok(source?.playableUnderEngine);
  const manager=initializeCards();
  const stock=source.cardIds.map((name,i)=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Pinned native missing original '+name);
    card.id=91700+seat*100+i;
    return card;
  });
  /** @param {string} name @returns {object} */
  const take=name=>{
    const index=stock.findIndex(c=>c.name===name);
    assert.ok(index>=0,'Original rank2 inventory lacks '+name);
    return stock.splice(index,1)[0];
  };
  const active=take('Bunnelby');
  // The first seven and eighth normal draw are enumerated explicitly.
  // A/G&H/Capture/TM are all initially absent. The discardable physical
  // connectors are the extra G&H and Tag Call.
  const seven=['Guzma & Hala','Guzma & Hala','Tag Call',
    'Stealthy Hood','Plumeria','Faba','Gladion'].map(take);
  const eighth=take('Karen');
  const prizes=['Cassius','Lusamine',"Team Yell's Cheer",
    'Bellelba & Brycen-Man','Peonia','Guzma'].map(take);
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const player=f.attacker,state=f.store.state;
  player.active.cards.splice(0,player.active.cards.length,active);
  player.active.energies.cards.length=0;
  player.active.tools.length=0;
  player.bench.splice(0,player.bench.length,
    ...Array.from({length:5},()=>new PokemonCardList()));
  player.hand.cards.splice(0,player.hand.cards.length,...seven,eighth);
  player.deck.cards.splice(0,player.deck.cards.length,...stock);
  player.discard.cards.length=0;
  player.lostzone.cards.length=0;
  player.supporter.cards.length=0;
  player.stadium.cards.length=0;
  player.prizes=prizes.map(card=>{
    const zone=new CardList();
    zone.cards.push(card);
    return zone;
  });
  if(seat===1)state.players=[f.defender,player];
  state.activePlayer=seat;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  const knownSixty=source.cardIds.slice();
  const sourceCards=knownSixty.map(name=>{
    const c=manager.getCardByName(name);
    assert.ok(c);
    return c;
  });
  assert.equal(player.hand.cards.length,8);
  assert.deepEqual(player.hand.cards.filter(card=>
    ['Guzma & Hala CEC','Tag Call CEC'].includes(card.fullName))
    .map(c=>c.fullName).sort(),
    ['Guzma & Hala CEC','Guzma & Hala CEC','Tag Call CEC']);
  return {f,state,player,seat,source,knownSixty,sourceCards};
}

/** @param {object} player @returns {string[]} */
function physicalPrintings(player){
  const zones=[
    player.active,...player.bench,player.hand,player.deck,
    player.discard,player.lostzone,player.supporter,player.stadium,
    ...player.prizes
  ];
  const result=zones.flatMap(z=>z?.cards??[]);
  result.push(...player.active.tools,
    ...player.bench.flatMap(z=>z.tools??[]));
  return result.map(c=>c.fullName).sort();
}

/** @param {object} x @returns {object} */
function nativeDoubleEvolutionBot(x){
  const defs=native('simple-bot/simple-bot-definitions');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  return new SimpleTacticsAi({id:x.player.id},
    withBunnelbyBarrageConsent(withBunnelbyEvolutionLine(
      withToolAttackAwareness({
        tactics:defs.allSimpleTactics,
        promptResolvers:defs.allPromptResolvers,
        scores:defs.defaultStateScores,
        arbiter:defs.defaultArbiterOptions
      }),{sourceCards:x.sourceCards,targetAwareEvolution:true}),
      x.sourceCards),null);
}

/** @param {object} x @param {object} bot @param {object[]} selected */
function settleNativePrompts(x,bot,selected){
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const prompts=[];
  for(let n=0;n<100;n++){
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(!pending)return prompts;
    const kind=pending.constructor.name;
    const proposed=chooseGhCapturePrompt(x.state,x.seat,pending);
    let action;
    if(proposed){
      action=new ResolvePromptAction(pending.id,proposed.selected);
      selected.push({phase:'prompt',kind:proposed.kind,
        printings:Array.isArray(proposed.selected)?
          proposed.selected.map(c=>c.fullName):null});
    }else if(kind==='WaitPrompt'){
      action=new ResolvePromptAction(pending.id,null);
    }else if(kind==='ShuffleDeckPrompt'){
      action=new ResolvePromptAction(pending.id,
        x.player.deck.cards.map((_,i)=>i));
    }else if(kind==='ShowCardsPrompt'){
      action=new ResolvePromptAction(pending.id,true);
    }else{
      action=bot.decodeNextAction(x.state);
      assert.ok(action,'No valid native TM prompt response '+kind);
      if(kind==='ChooseAttackPrompt'){
        assert.equal(action.result?.name,'Evolution',
          'Second Omega Barrage attack must select TM Evolution');
      }
    }
    prompts.push({kind,proposed:proposed?.kind??null});
    x.f.store.dispatch(action);
  }
  assert.fail('Native prompt resolution exceeded 100 actions');
}

/** @param {object} x @param {object} intent */
function dispatchChosenRoot(x,intent){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {UseStadiumAction,AttackAction}=
    native('game/store/actions/game-actions');
  const id=x.player.id;
  const action=intent.kind==='play-gh'||intent.kind==='play-artazon'?
    new PlayCardAction(id,intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0}):
    intent.kind==='attach-capture'||intent.kind==='equip-tm'?
      new PlayCardAction(id,intent.handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}):
      intent.kind==='use-artazon'?
        new UseStadiumAction(id):
      intent.kind==='attack-evolution'?
        new AttackAction(id,intent.attackName):null;
  assert.ok(action,'Unsupported owner intent '+intent.kind);
  x.f.store.dispatch(action);
  return action;
}

/**
 * Execute each owner-proposed source turn root with actual native Store.
 * No root action is supplied by the test beyond invoking the policy.
 * @param {object} x
 * @returns {object}
 */
function executeOwnerLine(x){
  const chosen=[],bot=nativeDoubleEvolutionBot(x);
  assert.deepEqual(physicalPrintings(x.player),x.knownSixty.slice().sort(),
    'Before: all 60 real printed physical cards in exactly one zone');
  let end='root-cap';
  for(let n=0;n<12;n++){
    const view=actorObservation(x.state,x.seat);
    assert.equal(view.decisionKind,'owner-root');
    const intent=chooseGhCaptureRoot(view,x.knownSixty);
    if(!intent){end='no-owner-intent';break;}
    chosen.push({phase:'root',kind:intent.kind,
      printing:intent.printing??null});
    dispatchChosenRoot(x,intent);
    const prompts=settleNativePrompts(x,bot,chosen);
    if(intent.kind==='attack-evolution'){
      end='double-evolution';
      assert.ok(prompts.some(p=>p.kind==='ConfirmPrompt'));
      assert.ok(prompts.some(p=>p.kind==='ChooseAttackPrompt'));
      break;
    }
  }
  const bench=x.player.bench.map(b=>b.getPokemonCard()?.fullName)
    .filter(Boolean);
  const final={
    seat:x.seat,end,bench,
    active:x.player.active.getPokemonCard()?.fullName,
    activeEnergy:x.player.active.energies.cards.map(c=>c.fullName),
    selected:chosen,
    finalPhysicalCount:physicalPrintings(x.player).length,
    opponentTurn:x.state.activePlayer,
    competitiveQualifiedGames:0
  };
  console.log('AGENT40_GH_CAPTURE_OWNER_SELECTED',JSON.stringify(final));
  assert.deepEqual(physicalPrintings(x.player),x.knownSixty.slice().sort(),
    'After: source 60 retained in genuine Store zones and attached Tool');
  return final;
}

for(const seat of [0,1]){
  test('rank2 exact original physical 60 owner-selected G&H three-channel / double TM seat '+
      seat,()=>{
    const x=staged(seat);
    const result=executeOwnerLine(x);
    assert.equal(result.end,'double-evolution');
    assert.equal(result.selected.filter(x=>x.phase==='root').length,6);
    assert.deepEqual(result.selected.filter(x=>x.phase==='root').map(x=>x.kind),[
      'play-gh','play-artazon','use-artazon',
      'attach-capture','equip-tm','attack-evolution'
    ]);
    assert.deepEqual(result.bench,['Vileplume AOR','Pidgeot ex OBF']);
    assert.equal(result.opponentTurn,1-seat);
    assert.equal(x.f.store.hasPrompts(),false);
    assert.deepEqual(result.activeEnergy,[PRINTING.capture]);
    const discarded=result.selected.find(v=>
      v.kind==='gh-discard-two-spare-connectors');
    assert.deepEqual(discarded?.printings?.sort(),
      [PRINTING.gh,PRINTING.tag].sort());
    // The actual original rank1 opponent has a physical Fog Crystal
    // response but the resulting Bench Vileplume rejects that Item.
    const opponent=x.f.defender;
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const fog=opponent.hand.cards.find(c=>c.fullName==='Fog Crystal CRE')??
      opponent.deck.cards.find(c=>c.fullName==='Fog Crystal CRE');
    assert.ok(fog);
    if(!opponent.hand.cards.includes(fog)){
      opponent.deck.cards.splice(opponent.deck.cards.indexOf(fog),1);
      opponent.hand.cards.push(fog);
    }
    const index=opponent.hand.cards.indexOf(fog);
    assert.throws(()=>x.f.store.dispatch(
      new PlayCardAction(opponent.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      })
    ),e=>e?.message==='CANNOT_PLAY_THIS_CARD');
    assert.equal(opponent.hand.cards.includes(fog),true);
    assert.deepEqual(physicalPrintings(opponent).length,60);
  });
}

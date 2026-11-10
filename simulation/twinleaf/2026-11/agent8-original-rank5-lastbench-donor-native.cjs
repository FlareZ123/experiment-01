'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../../evaluation/aichi-pilot.cjs');
const {initializeCards}=require('../headless.cjs');
const {actorObservation}=require('../actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../agent34-actor-only-root-policy.cjs');

const VERSION='agent8-original-rank5-occupied-lastbench-genesect-donor-native-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUT=path.resolve(__dirname,
  '../../../vendor/twinleaf/ptcg-server/output');
const native=part=>require(path.join(OUT,part));
const MEW='Mew V FST';
const VMAX='Mew VMAX FST';
const GEN='Genesect V FST';
const DCE='Double Colorless Energy SUM';

/** Exact 60-card original source with a deliberately staged final Bench slot. */
function stage(seat,{fairyZone=true}={}){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof fairyZone,'boolean');
  const perms={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const sourcePlan=planAichi(5,perms);
  const opponentPlan=planAichi(10,perms);
  assert.equal(sourcePlan.candidate.cards.length,60);
  assert.equal(opponentPlan.candidate.cards.length,60);
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');

  let nextId=1;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing actual pinned printed card: '+printing);
    c.id=nextId++;
    return c;
  };
  const construct=(plan,setup)=>{
    const unused=plan.candidate.cards.slice();
    const take=printing=>{
      const i=unused.indexOf(printing);
      assert.ok(i>=0,'Original 60 missing staged physical '+printing);
      unused.splice(i,1);
      return card(printing);
    };
    const p=new Player();
    const active=setup.active.map(take);
    p.active.cards.push(...active);
    for(let i=0;i<5;i++)p.bench.push(new PokemonCardList());
    setup.bench.forEach((printing,i)=>
      p.bench[i].cards.push(take(printing)));
    const fixed=setup.hand.map(take);
    p.hand.cards.push(...fixed,...unused.splice(0,7-fixed.length).map(card));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card(unused.shift()));
      p.prizes.push(prize);
    }
    p.deck.cards.push(...unused.map(card));
    const count=p.active.cards.length+p.bench.reduce((n,b)=>n+b.cards.length,0)+
      p.hand.cards.length+p.prizes.reduce((n,b)=>n+b.cards.length,0)+
      p.deck.cards.length;
    assert.equal(count,60,'Complete physical original 60 must be preserved');
    return p;
  };
  // All parts belong to rank5's exact published 60. Real Mew VMAX evolution
  // and two original Mew V consume three of the four Mew V source printings.
  // The last Mew V and a Genesect V compete for the fifth Bench spot.
  const den=sourcePlan.candidate.cards.find(c=>c.startsWith('Dedenne'));
  assert.ok(den,'Actual source 60 must include an off-axis Dedenne GX');
  const fourth=fairyZone?"Lillie's Clefairy ex JTG":den;
  const owner=construct(sourcePlan,{
    active:[MEW,VMAX],
    bench:[MEW,MEW,'Crobat V DAA',fourth],
    hand:[MEW,GEN,DCE]
  });
  const opponent=construct(opponentPlan,{
    active:['Regidrago V SIT'],bench:[],hand:[]
  });
  owner.id=101;opponent.id=202;
  owner.active.pokemonPlayedTurn=1;
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;state.turn=3;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const t={PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType};
  const catalog=buildActorCardCatalog(manager.getAllCards(),t);
  return {seat,fairyZone,owner,opponent,store,state,catalog,GamePhase,
    PlayCardAction,PlayerType,SlotType,AttackAction,ResolvePromptAction,
    sourceDigest:sourcePlan.candidateDigest,
    opponentDigest:opponentPlan.candidateDigest};
}

/** Examine the actual Store-copied attack menu after a source physical Bench play. */
function runFork(seat,{fairyZone=true}={}){
  const baseline=stage(seat,{fairyZone});
  const priority=stage(seat,{fairyZone});
  const av=actorObservation(baseline.state,seat);
  const bv=actorObservation(priority.state,seat);
  assert.deepEqual(av,bv,'Both native forks must start with identical actor observation');
  assert.deepEqual(av.ownPublic.bench.map(x=>x===null),
    [false,false,false,false,true]);
  assert.deepEqual(av.ownHand.slice(0,3),[MEW,GEN,DCE]);
  const proposalA=chooseActorRootIntent(av,baseline.catalog,{
    mewGenesectBenchFirst:false
  });
  const proposalB=chooseActorRootIntent(bv,priority.catalog,{
    mewGenesectBenchFirst:true
  });
  assert.deepEqual(proposalA,{kind:'bench-basic',handIndex:0,
    benchIndex:4,printing:MEW});
  assert.deepEqual(proposalB,{kind:'bench-basic',handIndex:1,
    benchIndex:4,printing:GEN});

  const play=(x,intent)=>{
    x.store.dispatch(new x.PlayCardAction(x.owner.id,intent.handIndex,{
      player:x.PlayerType.BOTTOM_PLAYER,
      slot:x.SlotType.BENCH,index:intent.benchIndex
    }));
    assert.equal(x.owner.bench[4].getPokemonCard()?.fullName,intent.printing);
    assert.equal(x.owner.bench.filter(s=>s.getPokemonCard()).length,5);
    const held=x.owner.hand.cards.findIndex(c=>c.fullName===DCE);
    assert.ok(held>=0,'Native DCE must remain in owner hand');
    x.store.dispatch(new x.PlayCardAction(x.owner.id,held,{
      player:x.PlayerType.BOTTOM_PLAYER,
      slot:x.SlotType.ACTIVE,index:0
    }));
    assert.ok(x.owner.active.energies.cards.some(c=>c.fullName===DCE));
    assert.equal(x.state.activePlayer,seat);
    return {bench:intent.printing,
      sourceBenchFull:true,sourceActiveEnergy:DCE};
  };
  const control=play(baseline,proposalA);
  const treatment=play(priority,proposalB);

  const attackMenu=x=>{
    x.store.dispatch(new x.AttackAction(x.owner.id,'Cross Fusion Strike'));
    const prompt=x.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='ChooseAttackPrompt');
    assert.ok(prompt,'Pinned source must offer a genuine Cross Fusion attack menu');
    const donor=prompt.cards.find(p=>p.fullName===GEN);
    const attack=donor?.attacks.find(a=>a.name==='Techno Blast')??null;
    return {prompt,donor,attack,optionPrintings:prompt.cards.map(p=>p.fullName)};
  };
  const preAttack={
    selectedPrintedSourceCopies:priority.owner.bench
      .map(x=>x.getPokemonCard()?.fullName??null),
    attackerHp:priority.owner.active.getPokemonCard()?.hp??null,
    opponentPrinting:priority.opponent.active.getPokemonCard()?.fullName??null,
    opponentHp:priority.opponent.active.getPokemonCard()?.hp??null,
    opponentWeakness:priority.opponent.active.getPokemonCard()?.weakness??null,
    opponentResistance:priority.opponent.active.getPokemonCard()?.resistance??null,
    opponentDamage:priority.opponent.active.damage
  };
  const controlMenu=attackMenu(baseline);
  const priorityMenu=attackMenu(priority);
  assert.equal(controlMenu.donor,undefined,
    'No Genesect donor can exist after generic final Mew Bench');
  assert.ok(priorityMenu.donor,'Priority must preserve original Genesect donor');
  assert.ok(priorityMenu.attack);
  assert.equal(priorityMenu.prompt.validate(priorityMenu.attack),true);

  const resolved=[];
  priority.store.dispatch(new priority.ResolvePromptAction(
    priorityMenu.prompt.id,priorityMenu.attack));
  resolved.push({kind:'ChooseAttackPrompt',selected:'Techno Blast',
    accepted:priorityMenu.prompt.result!==undefined});
  for(let i=0;i<30;i++){
    const pending=priority.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    const kind=pending.constructor.name;
    let answer;
    if(kind==='WaitPrompt')answer=null;
    else if(kind==='ChoosePrizePrompt'){
      const player=priority.state.players.find(p=>
        p.id===pending.getPerspectivePlayerId());
      answer=player.prizes.filter(s=>s.cards.length>0).slice(
        0,pending.options.count);
    }else if(kind==='ChoosePokemonPrompt'){
      const player=priority.state.players.find(p=>
        p.id===pending.getPerspectivePlayerId());
      answer=[player.bench.find(s=>s.getPokemonCard())];
    }else throw Error('Unplanned real Store prompt: '+kind);
    priority.store.dispatch(new priority.ResolvePromptAction(pending.id,answer));
    resolved.push({kind,accepted:true});
  }
  assert.equal(priority.state.prompts.some(p=>p.result===undefined),false);
  const liveOpponent=priority.store.state.players.find(p=>
    p.id===priority.opponent.id);
  const liveOwner=priority.store.state.players.find(p=>
    p.id===priority.owner.id);
  const nativeFinal={
    phase:priority.store.state.phase,
    turn:priority.store.state.turn,
    nativeWinner:priority.store.state.winner??null,
    sourceActivePrinting:liveOwner.active.getPokemonCard()?.fullName??null,
    opponentActivePrinting:liveOpponent.active.getPokemonCard()?.fullName??null,
    opponentActualDamage:liveOpponent.active.damage,
    opponentActiveHp:liveOpponent.active.getPokemonCard()?.hp??null,
    opponentReserve:liveOpponent.bench.map(p=>
      p.getPokemonCard()?.fullName??null),
    ownerPrizes:liveOwner.prizes.filter(p=>p.cards.length>0).length,
    opponentPrizes:liveOpponent.prizes.filter(p=>p.cards.length>0).length
  };
  if(fairyZone){
    assert.equal(nativeFinal.nativeWinner,seat,
      'Fairy Zone should make copied 210 one-hit KO 220-HP lone Dragon');
    assert.equal(nativeFinal.opponentActivePrinting,null,
      'Native Store must remove KO target rather than report post-KO zero damage');
    assert.equal(nativeFinal.ownerPrizes,4,
      'Fairy Zone powered KO of Regidrago V takes exactly two source Prizes');
  }else{
    assert.equal(nativeFinal.nativeWinner,-1,
      '210 without Psychic weakness is nonterminal against 220 HP');
    assert.equal(nativeFinal.opponentActivePrinting,'Regidrago V SIT');
    assert.equal(nativeFinal.opponentActualDamage,210,
      'Unmodified copy must register 210 live damage');
    assert.equal(nativeFinal.ownerPrizes,6,
      'No Fairy Zone means no Regidrago V KO or source Prizes');
  }
  return {seat,sourceRank:5,opponentRank:10,fairyZone,
    nativeFinal,preAttack,
    chosenPrintedAttackDamage:priorityMenu.attack.damage,
    sourceDigest:baseline.sourceDigest,
    opponentDigest:baseline.opponentDigest,
    unchangedPrintedSource60:true,fullyMatchedInitialActorObservation:true,
    stagedFinalBenchSpot:true,control,
    priority:treatment,
    controlCopiesGenesectTechnoBlast:false,
    priorityCopiesGenesectTechnoBlast:true,
    actualPriorityDonorMenu:priorityMenu.optionPrintings,
    nativePriorityAttackPromptValidate:true,
    nativePriorityOpponentActiveDamage:priority.opponent.active.damage,
    settledNativePrompts:resolved,
    qualifiedCompetitiveGames:0};
}
function run(){
  const cases=[true,false].flatMap(fairyZone=>
    [runFork(0,{fairyZone}),runFork(1,{fairyZone})]);
  return {schema:VERSION,enginePin:PIN,cases,
    preciseMechanism:'native original-ranked physical last-Bench Genesect donor preserved and paid DCE Cross Fusion selected',
    stagedNotRandomized:true,qualifiedCompetitiveGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,PIN,stage,runFork,run};

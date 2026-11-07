'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const pinned=name=>require(path.join(OUTPUT,name));

/**
 * Exact printed Opportunity at historical v9 root93, reconstructed with a
 * staged real Store and a passive opponent. This is a mechanics-only test.
 * @param {0|1} ownerSeat
 * @param {boolean} equipPowerglass
 * @param {boolean} [settlePrize] Resolve real postattack Powerglass/Prize prompts
 * @returns {object}
 */
function runArm(ownerSeat,equipPowerglass,settlePrize=false){
  assert.ok(ownerSeat===0||ownerSeat===1);
  const manager=initializeCards();
  let nextId=93000+ownerSeat*1000;
  /** @param {string} printing @returns {any} */
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing pinned card '+printing);
    c.id=nextId++;
    return c;
  };
  const {Store}=pinned('game/store/store');
  const {Player}=pinned('game/store/state/player');
  const {CardList}=pinned('game/store/state/card-list');
  const {PokemonCardList}=pinned('game/store/state/pokemon-card-list');
  const {GamePhase}=pinned('game/store/state/state');
  const {Format}=pinned('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    pinned('game/store/actions/play-card-action');
  const {AttackAction,PassTurnAction}=
    pinned('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    pinned('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),source=new Player();
  owner.id=701;owner.name='Candidate Unown';
  source.id=803;source.name='Source Trubbish';
  state.players=ownerSeat===0?[owner,source]:[source,owner];
  state.activePlayer=ownerSeat;
  state.turn=14;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;

  const unown=card('Unown AOR');
  const trubbish=card('Trubbish FST');
  const powerglass=card('Powerglass SFA');
  const psychicA=card('Psychic Energy MEE');
  const psychicB=card('Psychic Energy MEE');
  owner.active.cards.push(unown);
  owner.bench.push(new PokemonCardList());
  owner.bench[0].cards.push(card('Mewtwo & Mew-GX UNM'));
  owner.discard.cards.push(psychicA,psychicB);
  owner.hand.cards.push(powerglass);
  source.active.cards.push(trubbish);
  source.active.damage=60;
  for(let i=0;i<3;i++)
    source.active.energies.cards.push(card('Darkness Energy MEE'));
  source.bench.push(new PokemonCardList());
  source.bench[0].cards.push(card('Tapu Lele-GX GRI'));
  for(const player of [owner,source]){
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const promptTypes=[];
  const flushWait=()=>{
    for(let i=0;i<32;i++){
      const p=pending();
      if(!p||p.constructor.name!=='WaitPrompt')return;
      promptTypes.push(p.constructor.name);
      store.dispatch(new ResolvePromptAction(p.id,null));
    }
    assert.fail('Exceeded 32 native Wait prompts');
  };
  assert.equal(owner.active.energies.cards.length,0);
  assert.equal(owner.active.tools.length,0);
  assert.equal(source.active.damage,60);
  if(equipPowerglass){
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.ok(owner.active.tools.includes(powerglass),
      'Native Tool play did not equip Unown');
    assert.ok(!owner.hand.cards.includes(powerglass));
  }
  const activeAfterTool=owner.active.tools.map(c=>c.fullName);
  store.dispatch(new PassTurnAction(owner.id));
  let attachAccepted=false;
  for(let i=0;i<24;i++){
    const p=pending();
    if(!p)break;
    promptTypes.push(p.constructor.name);
    if(p.constructor.name==='AttachEnergyPrompt'){
      assert.equal(equipPowerglass,true);
      assert.strictEqual(p.cardList,owner.discard);
      assert.equal(p.options.min,0);
      assert.equal(p.options.max,1);
      const assignment=[{
        card:psychicA,
        to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}
      }];
      assert.equal(p.validate(assignment),true);
      store.dispatch(new ResolvePromptAction(p.id,assignment));
      attachAccepted=true;
    }else{
      assert.equal(p.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(p.id,null));
    }
  }
  flushWait();
  assert.equal(attachAccepted,equipPowerglass);
  assert.equal(owner.active.energies.cards.includes(psychicA),equipPowerglass);
  assert.equal(owner.discard.cards.includes(psychicA),!equipPowerglass);
  assert.equal(owner.discard.cards.includes(psychicB),true);
  const afterTurnEnd={
    turn:state.turn,actorSeat:state.activePlayer,
    powerglassEquipped:owner.active.tools.includes(powerglass),
    psychicAttached:owner.active.energies.cards.includes(psychicA),
    sourceDamage:source.active.damage,sourceHp:trubbish.hp,
    candidateUnownEnergyCount:owner.active.energies.cards.length
  };
  assert.equal(afterTurnEnd.actorSeat,1-ownerSeat);

  store.dispatch(new PassTurnAction(source.id));
  flushWait();
  assert.equal(state.activePlayer,ownerSeat);
  let candidateAttack=null;
  if(equipPowerglass){
    store.dispatch(new AttackAction(owner.id,'Hidden Power'));
    candidateAttack='Hidden Power';
    flushWait();
  }
  const afterCandidateTurn={
    turn:state.turn,actorSeat:state.activePlayer,
    sourceActiveDamage:source.active.damage,
    sourceActivePrinting:source.active.getPokemonCard()?.fullName??null,
    sourceTrubbishInDiscard:source.discard.cards.includes(trubbish),
    candidatePrizes:owner.prizes.filter(p=>p.cards.length>0).length,
    pending:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
  if(equipPowerglass){
    assert.ok(afterCandidateTurn.sourceTrubbishInDiscard,
      'Hidden Power 10 must Knock Out 60-damaged 70-HP Trubbish');
  }else{
    assert.equal(afterCandidateTurn.sourceTrubbishInDiscard,false);
    assert.equal(afterCandidateTurn.candidatePrizes,6);
  }
  const postAttackPromptTypes=[];
  let secondPhysicalBasicAttached=false;
  let prizePromptResolved=0;
  let sourcePromotionPromptResolved=0;
  if(settlePrize && equipPowerglass){
    for(let i=0;i<32;i++){
      const p=pending();
      if(!p)break;
      const type=p.constructor.name;
      postAttackPromptTypes.push(type);
      if(type==='WaitPrompt'){
        store.dispatch(new ResolvePromptAction(p.id,null));
      }else if(type==='AttachEnergyPrompt'){
        assert.strictEqual(p.cardList,owner.discard);
        const assignment=[{
          card:psychicB,
          to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}
        }];
        assert.equal(p.validate(assignment),true);
        store.dispatch(new ResolvePromptAction(p.id,assignment));
        secondPhysicalBasicAttached=true;
      }else if(type==='ChoosePrizePrompt'){
        assert.equal(p.playerId,owner.id);
        const available=owner.prizes.filter(slot=>slot.cards.length>0);
        assert.ok(available.length>0);
        assert.equal(p.validate([available[0]],state),true);
        store.dispatch(new ResolvePromptAction(p.id,[available[0]]));
        prizePromptResolved++;
      }else if(type==='ChoosePokemonPrompt'){
        assert.equal(p.playerId,source.id);
        const recipient=source.bench[0];
        const promotion={
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
        };
        assert.equal(p.validate([recipient],state),true);
        store.dispatch(new ResolvePromptAction(p.id,[promotion]));
        sourcePromotionPromptResolved++;
      }else{
        assert.fail('Unknown post-attack native prompt '+type);
      }
    }
    assert.equal(pending(),undefined,
      'Post-attack continuation must settle all native prompts');
    assert.equal(secondPhysicalBasicAttached,true);
    assert.equal(prizePromptResolved,1);
    assert.equal(sourcePromotionPromptResolved,1);
    assert.ok(owner.active.energies.cards.includes(psychicB));
    assert.ok(!owner.discard.cards.includes(psychicB));
    assert.equal(owner.prizes.filter(slot=>slot.cards.length>0).length,5);
    assert.equal(source.active.getPokemonCard()?.fullName,
      'Tapu Lele-GX GRI');
  }
  const afterFullPromptResolution=settlePrize?{
    pending:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    sourceActivePrinting:source.active.getPokemonCard()?.fullName??null,
    sourceTrubbishInDiscard:source.discard.cards.includes(trubbish),
    ownerRemainingPrizes:owner.prizes.filter(slot=>slot.cards.length>0).length,
    ownerActiveEnergies:owner.active.energies.cards.map(card=>card.fullName),
    secondPhysicalBasicAttached,prizePromptResolved,
    sourcePromotionPromptResolved,postAttackPromptTypes
  }:undefined;
  if(settlePrize&&!equipPowerglass){
    assert.equal(afterFullPromptResolution.ownerRemainingPrizes,6);
    assert.equal(afterFullPromptResolution.sourceTrubbishInDiscard,false);
    assert.deepEqual(afterFullPromptResolution.pending,[]);
  }
  return {ownerSeat,equipPowerglass,originalPublicRoot:93,
    printed:{owner:unown.fullName,source:trubbish.fullName,
      heldTool:powerglass.fullName,energy:psychicA.fullName},
    paperResources:{ownerActiveEnergyBefore:0,
      twoDiscardedBasicPsychic:true,sourceDamageBefore:60},
    activeAfterTool,promptTypes,attachAccepted,afterTurnEnd,
    sourceChosenResponse:'PassTurnAction, intentionally passive staged foil',
    candidateAttack,afterCandidateTurn,
    ...(settlePrize?{afterFullPromptResolution}:{}),
    qualification:'staged mechanism, not an original Aichi game',
    competitivelyQualifiedGames:0};
}

/** @returns {object} Four real-Store staged controls. */
function run(){
  const arms=[];
  for(const ownerSeat of [0,1])for(const equipped of [false,true])
    arms.push(runArm(ownerSeat,equipped));
  return {schema:'agent7-root93-unown-powerglass-printed-payoff-stage-v1',
    vendorCommit:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    arms,qualification:'four staged Store controls, zero original games',
    qualifiedGames:0};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runArm};

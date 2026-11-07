'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} file Native module at the pinned gitlink. */
const native=file=>require(path.join(root,file));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
const {CheckPokemonPowersEffect}=native('game/store/effects/check-effects');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {UseAbilityAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');

/**
 * Staged original rank11 Garbodor BKP, Float Stone BKT and source rank1
 * Shadow Rider V/Forest Seal Stone SIT in actual native Store. No claim
 * of original game/deal or paper adjudication. Both physical seats tested.
 * @param {0|1} stoneSeat
 * @param {boolean} garbotoxinTool Whether Garbodor holds a real Float Stone.
 * @returns {object}
 */
function fixture(stoneSeat,garbotoxinTool){
  const cards=initializeCards();
  let id=54000000+stoneSeat*100000+(garbotoxinTool?10000:0);
  const card=printing=>{
    const found=cards.getCardByName(printing);
    assert.ok(found,'Pinned native source printing unavailable: '+printing);
    found.id=id++;return found;
  };
  const stoneOwner=new Player(),garboOwner=new Player();
  stoneOwner.id=stoneSeat===0?101:202;
  garboOwner.id=stoneSeat===0?202:101;
  stoneOwner.active.cards.push(card('Tapu Lele-GX GRI'));
  stoneOwner.bench=Array.from({length:5},()=>new PokemonCardList());
  stoneOwner.bench[0].cards.push(card('Shadow Rider Calyrex V CRE'));
  const stone=card('Forest Seal Stone SIT');
  stoneOwner.hand.cards.push(stone);
  garboOwner.active.cards.push(card('Mega Absol ex MEG'));
  garboOwner.bench=Array.from({length:5},()=>new PokemonCardList());
  const evolving=garboOwner.bench[0];
  evolving.cards.push(card('Trubbish FST'),card('Garbodor BKP'));
  const float=card('Float Stone BKT');
  if(garbotoxinTool)evolving.tools.push(float);
  else garboOwner.hand.cards.push(float);
  for(const side of [stoneOwner,garboOwner]){
    for(let i=0;i<5;i++)side.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const p=new CardList();
      p.cards.push(card('Psychic Energy SVE'));
      side.prizes.push(p);
    }
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.gameSettings.format=Format.EXPANDED;
  state.players=stoneSeat===0?[stoneOwner,garboOwner]:
    [garboOwner,stoneOwner];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=5;
  state.activePlayer=stoneSeat;
  return {stoneSeat,garbotoxinTool,store,state,
    stoneOwner,garboOwner,stone,float,slot:stoneOwner.bench[0]};
}

/**
 * Actual Tool attachment, independent control Ability lock, and Star
 * Alchemy native Store resolution. Never use direct PowerEffect bypass.
 * @param {ReturnType<typeof fixture>} f
 * @returns {object}
 */
function inspect(f){
  const {store,state,stoneOwner,garboOwner,stone,slot}=f;
  const lele=stoneOwner.active.getPokemonCard();
  const wonder=lele.powers.find(p=>p.name==='Wonder Tag');
  assert.ok(wonder);
  const independentWonderTagBlocked=Boolean(IS_ABILITY_BLOCKED(
    store,state,stoneOwner,lele,wonder));
  assert.equal(independentWonderTagBlocked,f.garbotoxinTool,
    'Real Garbotoxin lock control must toggle ordinary Pokemon Ability');
  assert.equal(stoneOwner.hand.cards[0],stone);
  store.dispatch(new PlayCardAction(stoneOwner.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  }));
  assert.ok(slot.tools.includes(stone),
    'Genuine Store must accept Stone attachment to its original V recipient');

  const printedPower=stone.powers.find(p=>p.name==='Star Alchemy');
  assert.ok(printedPower);
  const naiveIsAbilityBlocked=Boolean(IS_ABILITY_BLOCKED(
    store,state,stoneOwner,stone,printedPower));
  const check=new CheckPokemonPowersEffect(stoneOwner,slot.getPokemonCard());
  store.reduceEffect(state,check);
  const starVisible=check.powers.some(p=>p.name==='Star Alchemy');
  let abilityActionAccepted=false,abilityActionError=null,settled=false;
  const prompts=[];
  try{
    store.dispatch(new UseAbilityAction(stoneOwner.id,'Star Alchemy',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }));
    abilityActionAccepted=true;
    for(let step=0;step<16;step++){
      const p=state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      prompts.push(p.constructor.name);
      let selected;
      switch(p.constructor.name){
        case 'WaitPrompt':selected=null;break;
        case 'ChooseCardsPrompt':{
          const energy=stoneOwner.deck.cards.find(c=>c.fullName===
            'Psychic Energy SVE');
          assert.ok(energy);
          selected=[energy];
          assert.equal(p.validate(selected),true);
          break;
        }
        case 'ShuffleDeckPrompt':
          selected=Array.from({length:stoneOwner.deck.cards.length},
            (_,i)=>i);
          break;
        case 'ShowCardsPrompt':selected=true;break;
        default:throw Error('Unexpected Star Alchemy prompt: '+
          p.constructor.name);
      }
      store.dispatch(new ResolvePromptAction(p.id,selected));
    }
    settled=!state.prompts.some(p=>p.result===undefined)&&
      stoneOwner.usedVSTAR===true;
  }catch(error){abilityActionError=String(error?.message??error);}
  return {
    originalRankGarbotoxinSource:11,originalRankStoneSource:1,
    nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    stoneOwnerSeat:f.stoneSeat,garbotoxinTool:f.garbotoxinTool,
    independentWonderTagBlocked,
    starVisible,naiveIsAbilityBlocked,
    abilityActionAccepted,abilityActionError,settled,
    ownVSTARUsed:stoneOwner.usedVSTAR,
    starCurrentlyOnV:slot.tools.includes(stone),
    garbotoxinStillEquipped:garboOwner.bench[0].tools.includes(f.float),
    abilityPrompts:prompts,competitiveGamesQualified:0
  };
}

for(const seat of [0,1]){
  test('native Garbotoxin versus Forest Seal Star Alchemy source-print boundary seat '+seat,()=>{
    const underLock=inspect(fixture(seat,true));
    const unlocked=inspect(fixture(seat,false));
    console.log('AGENT2_NATIVE_GARBOTOXIN_FSS',JSON.stringify({
      seat,underLock,unlocked
    }));
    assert.equal(underLock.independentWonderTagBlocked,true);
    assert.equal(unlocked.independentWonderTagBlocked,false);
    assert.equal(unlocked.starVisible,true);
    assert.equal(unlocked.settled,true,
      'The unlocked native control must fully settle Star Alchemy');
    assert.equal(underLock.starCurrentlyOnV,true);
    assert.equal(underLock.garbotoxinStillEquipped,true);
    // Distinguish an exempt-flag paper gap from an actual native veto.
    // This deliberately remains diagnostic until both-seat Store evidence
    // settles the expected behavior under live Garbotoxin.
    assert.equal(underLock.competitiveGamesQualified,0);
  });
}

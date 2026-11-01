'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {withPaperPainfulSpoonsSingleSource}=
  require('./agent4-painful-spoons-single-source-hook.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Exact rank31 Radiant Alakazam SIT59 Ability in actual pinned Store, with
 * three public opposing Pokémon. Both first source Pokémon have 1 damage
 * counter, third is undamaged. No hidden information, source full-60 claim,
 * attacker policy, or competitive outcome is modeled.
 * @returns {object}
 */
function stagedPainfulSpoons(){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=80000;
  const card=name=>{
    const instance=manager.getCardByName(name);
    assert.ok(instance,'Missing actual pinned card printing '+name);
    instance.id=id++;
    return instance;
  };
  const store=new Store({onStateChange(){}}),state=store.state;
  const source=new Player(),opponent=new Player();
  source.id=411;opponent.id=522;
  state.players=[source,opponent];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=0;
  state.turn=3;
  state.gameSettings.format=Format.EXPANDED;
  source.active.cards.push(card('Radiant Alakazam SIT'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<7;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  opponent.bench[0].cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.bench[1].cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.damage=10;
  opponent.bench[0].damage=10;
  return {store,state,source,opponent,card};
}

/**
 * Try a real native ability and two counters from two different opposing
 * source Pokémon to one destination. This is a negative paper-validity
 * fixture, not a recommendation to play the rejected line.
 * @param {{guarded?:boolean,sameSource?:boolean}} [options]
 * @returns {object}
 */
function probeTwoSourcePainfulSpoons(options={}){
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const f=stagedPainfulSpoons();
  if(options.sameSource)f.opponent.active.damage=20;
  const execute=()=>{
  f.store.dispatch(new UseAbilityAction(f.source.id,'Painful Spoons',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  // Genuine pinned Ability use first emits a separate animation WaitPrompt.
  // Resolve it as an actual owner action before the real MoveDamagePrompt.
  for(let i=0;i<4;i++){
    const waiting=f.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='WaitPrompt');
    if(!waiting)break;
    f.store.dispatch(new ResolvePromptAction(waiting.id,null));
  }
  const prompt=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='MoveDamagePrompt');
  assert.ok(prompt,'Need actual pinned Painful Spoons MoveDamagePrompt: '+
    JSON.stringify({
      phase:f.state.phase,turn:f.state.turn,activePlayer:f.state.activePlayer,
      prompts:f.state.prompts.map(p=>({
        name:p.constructor.name,resultType:typeof p.result,
        ownerId:p.playerId
      })),
      sourcePowers:f.source.active.getPokemonCard()?.powers?.map(p=>p.name),
      damaged:[f.opponent.active.damage,...f.opponent.bench.slice(0,2)
        .map(s=>s.damage)],
      sourceMarkers:f.source.marker?.markers?.length??null
    }));
  const active={player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0};
  const bench0={player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0};
  const bench1={player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1};
  const result=[
    {from:active,to:bench1},
    {from:options.sameSource?active:bench0,to:bench1}
  ];
  const nativeValidated=prompt.validate(result,f.state);
  const before={
    active:f.opponent.active.damage,
    bench0:f.opponent.bench[0].damage,
    bench1:f.opponent.bench[1].damage
  };
  let error=null;
  try{f.store.dispatch(new ResolvePromptAction(prompt.id,result));}
  catch(e){error=String(e?.message??e);}
  return {
    guarded:!!options.guarded,
    sameSource:!!options.sameSource,
    source:'Authenticated rank31 Radiant Alakazam SIT59 Painful Spoons',
    originalPrintedSingleSource:true,
    nativeOptions:{...prompt.options},
    nativeValidatorAccepted:nativeValidated,
    nativeStoreError:error,
    nativePromptSettled:prompt.result!==undefined,
    before,
    after:{
      active:f.opponent.active.damage,
      bench0:f.opponent.bench[0].damage,
      bench1:f.opponent.bench[1].damage
    },
    scope:'True pinned native Store conditional-board prompt; not a source-dealt full game'
  };
  };
  return options.guarded?withPaperPainfulSpoonsSingleSource(execute):execute();
}
/**
 * Exact conditional Prize consequence of the native paper-forbidden two-source
 * Painful Spoons answer. Three opponent V in play: two have one counter each,
 * the chosen destination V is already 190/210 damaged. A legal single source
 * from either eligible source could add only 10, while the paper-forbidden pair
 * adds 20 and can Knock Out this V for two Prize cards. No source-dealt game.
 * @param {boolean} guarded Whether to enforce the opt-in printed source rule.
 * @returns {object}
 */
function probeTwoSourcePrizeInflation(guarded){
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const f=stagedPainfulSpoons();
  const victim=f.opponent.bench[1].getPokemonCard();
  f.opponent.bench[1].damage=190;
  const prizesBefore=f.source.getPrizeLeft();
  const execute=()=>{
    f.store.dispatch(new UseAbilityAction(f.source.id,'Painful Spoons',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const waiting=f.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='WaitPrompt');
    assert.ok(waiting,'Ability must use actual native animation prompt');
    f.store.dispatch(new ResolvePromptAction(waiting.id,null));
    const prompt=f.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='MoveDamagePrompt');
    assert.ok(prompt,'Must reach native original MoveDamagePrompt');
    const reply=[
      {from:{player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0},
        to:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1}},
      {from:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
        to:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1}}
    ];
    let rejected=null;
    try{f.store.dispatch(new ResolvePromptAction(prompt.id,reply));}
    catch(e){rejected=String(e?.message??e);}
    const promptStillPending=prompt.result===undefined;
    const nativeValidated=prompt.validate(reply,f.state);
    const settled=[];
    if(!guarded){
      for(let k=0;k<12;k++){
        const p=f.state.prompts.find(q=>q.result===undefined);
        if(!p)break;
        let answer;
        if(p.constructor.name==='WaitPrompt')answer=null;
        else if(p.constructor.name==='ChoosePrizePrompt'){
          answer=f.source.prizes.filter(x=>x.cards.length)
            .slice(0,p.options.count);
        }else throw new Error('Unexpected native KO prompt '+p.constructor.name);
        assert.equal(p.validate(answer,f.state),true,
          'Physical response must pass native KO prompt validator');
        settled.push(p.constructor.name);
        f.store.dispatch(new ResolvePromptAction(p.id,answer));
      }
    }
    return {
      guarded,nativeValidatorAccepted:nativeValidated,
      nativeDispatchRejection:rejected,promptStillPending,
      pricesBefore:prizesBefore,prizesAfter:f.source.getPrizeLeft(),
      prizesTaken:prizesBefore-f.source.getPrizeLeft(),
      victimInDiscard:f.opponent.discard.cards.includes(victim),
      sourceDamageRemaining:{
        active:f.opponent.active.damage,
        bench0:f.opponent.bench[0].damage
      },
      nativePrizeContinuationPrompts:settled,
      scope:'Actual pinned conditional native Store, no source-dealt games'
    };
  };
  return guarded?withPaperPainfulSpoonsSingleSource(execute):execute();
}

if(require.main===module)
  console.log(JSON.stringify(probeTwoSourcePainfulSpoons(),null,2));
module.exports={stagedPainfulSpoons,probeTwoSourcePainfulSpoons,probeTwoSourcePrizeInflation};

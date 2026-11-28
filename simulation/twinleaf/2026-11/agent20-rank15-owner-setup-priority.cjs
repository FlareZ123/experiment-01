'use strict';

// Rank15 original 60 setup-only hook. Native Store and prompt remain the
// authority; no attempt to read an opponent's hand/deck or state history.
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent20-rank15-owner-setup-priority-v1';
const SOURCE_RANK=15;
const BASICS=new Set([
  'Oddish','Buneary','Pidgey','Bunnelby','Fan Rotom','Budew',
  'Tatsugiri','Eldegoss V'
]);
const ENERGY=new Set([
  'Grass Energy','Jet Energy','Capture Energy',
  'Powerful Colorless Energy','Double Colorless Energy'
]);
const SUPPORTER_ACCESS=new Set([
  'Tag Call','Guzma & Hala','Guzma','N','Karen'
]);
const BENCH_CAP=4; // Preserve a fifth Bench position for subsequent lock setup.

/**
 * Decide a legal *ordering* of own starting Basic cards, respecting native
 * prompt ownership and available selections. The first card becomes Active.
 * A later hand-played Eldegoss V can trigger Happy Match; setup cannot.
 * This is an explicit strategic heuristic, not an optimized-game assertion.
 */
function planRank15StartingBasics(hand,eligible,{maxSelections=6}={}) {
  if(!Array.isArray(hand)||!Array.isArray(eligible)||
     !Number.isSafeInteger(maxSelections)||maxSelections<1||maxSelections>6)
    return null;
  if(!eligible.length||eligible.some(c=>!BASICS.has(c?.name)))return null;
  const has=name=>hand.some(x=>x?.name===name);
  const bunnelbyCanEvolve=has('Technical Machine: Evolution')&&
    hand.some(x=>ENERGY.has(x?.name));
  const hasSupporter=hand.some(x=>SUPPORTER_ACCESS.has(x?.name));
  const activeOrder=bunnelbyCanEvolve?
    ['Bunnelby','Budew','Tatsugiri','Buneary','Fan Rotom','Pidgey','Oddish','Eldegoss V']:
    hasSupporter?
    ['Budew','Tatsugiri','Buneary','Fan Rotom','Bunnelby','Pidgey','Oddish','Eldegoss V']:
    ['Tatsugiri','Budew','Buneary','Fan Rotom','Bunnelby','Pidgey','Oddish','Eldegoss V'];
  const active=activeOrder.map(name=>eligible.find(c=>c.name===name)).find(Boolean);
  if(!active)return null;
  const rest=eligible.filter(x=>x!==active);
  const benchPriority=[
    ['Oddish',2],['Buneary',2],['Fan Rotom',1],['Pidgey',1],
    ['Bunnelby',1],['Tatsugiri',1],['Budew',1]
  ];
  const selected=[active],benchLimit=Math.min(BENCH_CAP,maxSelections-1);
  if(benchLimit===0)return selected;
  for(const [name,limit] of benchPriority){
    let used=0;
    for(const candidate of rest){
      if(candidate.name!==name||used>=limit||selected.includes(candidate))continue;
      selected.push(candidate);used++;
      if(selected.length-1>=benchLimit)return selected;
    }
  }
  // Retain Eldegoss V in hand if there is any other Benched Basic. If not,
  // put it down as a survival backup against an immediate Active knockout.
  if(selected.length===1&&benchLimit>=1){
    const backup=rest.find(c=>c.name==='Eldegoss V');
    if(backup)selected.push(backup);
  }
  return selected;
}

/**
 * reversible, owner-only native setup interception. The rank15 source must
 * be explicitly selected by the caller; don't silently hijack other decks.
 */
function withRank15OwnerSetupPriority(run,deps={}) {
  assert.equal(typeof run,'function');
  assert.equal(deps.sourceRank,SOURCE_RANK);
  const base=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {ResolvePromptAction}=deps.actions??
    require(path.join(base,'game/store/actions/resolve-prompt-action'));
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const GameMessage=deps.GameMessage??
    require(path.join(base,'game/game-message')).GameMessage;
  const {SuperType,Stage,CardTag}=deps.cardTypes??
    require(path.join(base,'game/store/card/card-types'));
  const maxRecords=deps.maxRecords??32;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const prior=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof prior?.value,'function');
  assert.equal(prior.configurable,true);
  const audit={
    version:VERSION,sourceRank:SOURCE_RANK,
    onlyOwnStartingHand:true,nativePromptValidated:true,
    setupDecisions:0,bySeat:[0,0],selectedCards:0,
    records:[],recordsOmitted:0,delegations:0,
    usedNativeStore:false,completedGames:0
  };
  const validBasic=card=>
    card?.superType===SuperType.POKEMON&&card.stage===Stage.BASIC||
    card?.tags?.includes(CardTag.PLAY_DURING_SETUP)===true;
  function decoder(state) {
    const actorId=this?.client?.id;
    const players=state?.players;
    const own=players?.find(x=>x?.id===actorId);
    const prompt=state?.prompts?.find(x=>
      x?.playerId===actorId&&x?.result===undefined);
    if(state?.phase===GamePhase.SETUP&&
       prompt?.constructor?.name==='ChooseCardsPrompt'&&
       prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS&&
       own&&prompt.cards===own.hand&&
       prompt.options?.allowCancel===false&&
       prompt.options?.min===1&&
       Number.isSafeInteger(prompt.options?.max)&&
       prompt.options.max>=1&&prompt.options.max<=6&&
       Array.isArray(prompt.cards?.cards)&&
       Array.isArray(prompt.options?.blocked)) {
      const forbidden=new Set(prompt.options.blocked);
      const legal=prompt.cards.cards.filter((card,index)=>
        !forbidden.has(index)&&validBasic(card));
      const selections=planRank15StartingBasics(
        prompt.cards.cards,legal,{maxSelections:prompt.options.max}
      );
      if(selections&&selections.length>=1){
        // Never manufacture legality: the native prompt validates exact cards
        // and exact order. If the intended Bench subset fails, fall back only
        // to the same eligible Active, else delegate the original decoder.
        let chosen=selections;
        while(chosen.length>0&&prompt.validate(chosen)!==true)
          chosen=chosen.slice(0,-1);
        if(chosen.length){
          const seat=players.findIndex(x=>x.id===actorId);
          assert.ok(seat===0||seat===1);
          audit.setupDecisions++;
          audit.bySeat[seat]++;
          audit.selectedCards+=chosen.length;
          const rec={seat,phase:state.phase,turn:state.turn,
            activeName:chosen[0].name,
            benchNames:chosen.slice(1).map(c=>c.name),
            nativePromptValidation:true,onlyOwnHand:true};
          if(audit.records.length<maxRecords)audit.records.push(rec);
          else audit.recordsOmitted++;
          return new ResolvePromptAction(prompt.id,chosen);
        }
      }
    }
    audit.delegations++;
    return prior.value.call(this,state);
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...prior,value:decoder});
  try {
    const result=run();
    return {result,audit};
  } catch(error) {
    if(error&&typeof error==='object')
      error.agent20Rank15SetupAudit={...audit,records:[...audit.records]};
    throw error;
  } finally {
    assert.strictEqual(Ai.prototype.decodeNextAction,decoder);
    Object.defineProperty(Ai.prototype,'decodeNextAction',prior);
  }
}
module.exports={VERSION,SOURCE_RANK,planRank15StartingBasics,withRank15OwnerSetupPriority};

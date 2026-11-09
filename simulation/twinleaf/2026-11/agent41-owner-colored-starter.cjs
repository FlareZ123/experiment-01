'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent41-owner-colored-single-energy-starter-v1';

/**
 * Choose from the owner's own legally eligible opening Basics. If a held
 * Basic Energy can pay the *entire* printed cost of a non-GX one-Energy attack
 * on one of those Basics, prefer that Basic as the opening Active.
 *
 * Other eligible Basics are retained as setup Bench occupants, subject to
 * the exact native prompt validator. There is no opponent observation,
 * Prize inspection, or proprietary source-deck tag.
 *
 * @param {object} prompt Actual native setup ChooseCardsPrompt.
 * @param {object} owner The genuine responding owner (own hand only).
 * @param {{Stage:object,CardTag:object,CardType:object}} enums
 * @returns {{selected:object[],chosen:object,reason:string}|null}
 */
function chooseOwnerColoredStarter(prompt,owner,enums) {
  const {Stage,CardTag,CardType}=enums;
  if(prompt.cards!==owner.hand || !Array.isArray(owner.hand.cards))return null;
  const opts=prompt.options??{};
  if(opts.min!==1 || !Number.isSafeInteger(opts.max) ||
      opts.max<1 || opts.max>6 || !Array.isArray(opts.blocked))return null;
  const forbidden=new Set(opts.blocked);
  const eligible=owner.hand.cards.filter((card,index)=>
    !forbidden.has(index)&&
    (card?.stage===Stage.BASIC ||
      card?.tags?.includes(CardTag.PLAY_DURING_SETUP)===true));
  if(eligible.length<2)return null;

  const heldBasicTypes=new Set(owner.hand.cards.flatMap(card=>{
    const kind=/^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy$/
      .exec(card?.name??'')?.[1];
    const nativeType=kind?CardType[kind.toUpperCase()]:undefined;
    return Number.isSafeInteger(nativeType)?[nativeType]:[];
  }));
  if(heldBasicTypes.size===0)return null;

  const readySingleEnergy=card=>
    (card.attacks??[]).some(attack=>
      attack.gxAttack!==true &&
      !attack.name?.endsWith('-GX') &&
      Array.isArray(attack.cost) &&
      attack.cost.length===1 &&
      (attack.cost[0]===CardType.COLORLESS ||
        heldBasicTypes.has(attack.cost[0])));
  const eligibleReady=eligible.filter(readySingleEnergy);
  if(eligibleReady.length===0 || readySingleEnergy(eligible[0]))return null;

  const chosen=eligibleReady[0];
  const ordered=[chosen,...eligible.filter(card=>card!==chosen)];
  const selected=[];
  for(const card of ordered) {
    if(selected.length===opts.max)break;
    const proposal=[...selected,card];
    if(prompt.validate(proposal)===true)selected.push(card);
  }
  if(selected[0]!==chosen || prompt.validate(selected)!==true)return null;
  return {selected,chosen,reason:'single-held-basic-energy-pays-entire-printed-basic-attack'};
}

/**
 * Reversible inner actor-only native setup decision. Must be nested inside
 * existing native actor root/prompt layers so it is first to see setup choice.
 * The native Store alone accepts and settles the returned ResolvePromptAction.
 * @template T
 * @param {()=>T} run Synchronous original research-side native runner.
 * @param {{engine?:(relative:string)=>object}} [deps] Native test injection.
 * @returns {{result:T,audit:object}}
 */
function withOwnerColoredStarter(run,deps={}) {
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
  const engine=deps.engine??(relative=>require(path.join(base,relative)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  const GameMessage=engine('game/game-message').GameMessage;
  const enums=engine('game/store/card/card-types');
  const before=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof before?.value,'function');

  const audit={
    version:VERSION,proposals:0,bySeat:{0:0,1:0},events:[],
    actualNativeStoreSettlementNotInferred:true,
    competitiveGameQualified:false
  };
  function decode(state){
    const id=this.client?.id;
    const seat=state.players?.findIndex(p=>p.id===id)??-1;
    if(state.phase===GamePhase.SETUP&&state.turn===0&&
        (seat===0||seat===1)){
      const owner=state.players[seat];
      const prompt=state.prompts?.find(p=>p.playerId===id&&
        p.result===undefined);
      if(prompt?.constructor?.name==='ChooseCardsPrompt' &&
          prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS&&
          prompt.cards===owner.hand) {
        const choice=chooseOwnerColoredStarter(prompt,owner,enums);
        if(choice) {
          const action=new ResolvePromptAction(prompt.id,choice.selected);
          audit.proposals++;
          audit.bySeat[seat]++;
          if(audit.events.length<64)
            audit.events.push({seat,turn:state.turn,
              chosenPrinting:choice.chosen.fullName,
              selectedCount:choice.selected.length,reason:choice.reason});
          return action;
        }
      }
    }
    return before.value.call(this,state);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...before,value:decode});
  try {
    return {result:run(),audit};
  } finally {
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',before);
  }
}

module.exports={VERSION,chooseOwnerColoredStarter,withOwnerColoredStarter};

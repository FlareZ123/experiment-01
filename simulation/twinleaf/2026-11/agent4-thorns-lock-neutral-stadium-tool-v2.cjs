'use strict';
const assert=require('node:assert/strict');
const {
  classifyVisibleThornsVeto
}=require('../agent4-underworld-visible-thorns-veto.cjs');
const VERSION='agent4-thorns-public-neutral-stadium-tool-v2';

/*
 * Audited, set-qualified native fullName families. The pinned actor
 * observation exposes native fullName as card name plus set abbreviation;
 * collector numbers are not included. The verified source print identities
 * BWP 28/50, ASR 155/214, PHF 93, CEC 187, PLF 99, BKT 137, and SSH 156
 * provide the paper provenance of the initial closed families.
 * Additional paper identities are ROS 89, BKT 145, PAL 171, PGO 68,
 * EVS 157, MEG 127 and UNM 211; these effects affect Bench capacity,
 * attack damage, search, voluntary Tool return, or damage placement on
 * newly Benched Basic Pokémon, none of which disables an already in-play
 * Shadow Rider VMAX's Underworld Door or Iron Thorns ex's Initialization. The supplied paper
 * card database describes only card-draw, attack-cost, Energy-type or
 * Stadium-replacement effects for these Stadiums, and only retreat-cost
 * effects for these Tools. None of these texts grants Ability protection
 * or removes Initialization from an Active Iron Thorns ex.
 *
 * This name-plus-set list is intentionally closed. Path to the Peak and Silent Lab are
 * excluded because they remove Iron Thorns's own Basic/Rule-Box Ability.
 * Stealthy Hood is excluded because it protects its attached Pokémon
 * from opponent Ability effects. Unknown and future reprints abstain.
 */
const NEUTRAL_STADIUM_PRINTINGS=Object.freeze([
  'Tropical Beach BWP',
  'Temple of Sinnoh ASR',
  'Dimension Valley PHF','Chaotic Swell CEC',
  'Sky Field ROS','Parallel City BKT','Artazon PAL',
  'PokéStop PGO','Shopping Center EVS','Risky Ruins MEG'
]);
const NEUTRAL_TOOL_PRINTINGS=Object.freeze([
  'Float Stone PLF','Float Stone BKT',
  'Air Balloon SSH','U-Turn Board UNM'
]);
const neutralStadium=new Set(NEUTRAL_STADIUM_PRINTINGS);
const neutralTool=new Set(NEUTRAL_TOOL_PRINTINGS);

/**
 * Refine the original proven, deliberately conservative owner-public veto.
 * Replace only known Ability-inert Stadium/Tool card strings in a disposable
 * derived observation, then reuse the unchanged original classifier.
 *
 * @param {object} view Detached acting-owner view, with public board slots.
 * @param {object|null} intent Already selected original Underworld proposal.
 * @returns {{veto:boolean,reason:string,policy:string}}
 */
function classifyNeutralThornsVeto(view,intent){
  const previous=classifyVisibleThornsVeto(view,intent);
  if(previous.veto||![
    'stadium-interaction-unresolved','tool-interaction-unresolved'
  ].includes(previous.reason))
    return {...previous,policy:VERSION};
  const ownStadium=view?.ownPublic?.stadium??[];
  const opponentStadium=view?.opponentPublic?.stadium??[];
  if(!Array.isArray(ownStadium)||!Array.isArray(opponentStadium)||
     ![...ownStadium,...opponentStadium].every(p=>
       typeof p==='string'&&neutralStadium.has(p)))
    return {veto:false,reason:'stadium-ability-interaction-unproven',
      policy:VERSION};

  const slot=intent?.position==='bench'?
    view?.ownPublic?.bench?.[intent.benchIndex]:
    view?.ownPublic?.active;
  const tools=slot?.tools??[];
  if(!Array.isArray(tools)||!tools.every(p=>
     typeof p==='string'&&neutralTool.has(p)))
    return {veto:false,reason:'source-tool-ability-interaction-unproven',
      policy:VERSION};

  const clonedSlot=slot?{...slot,tools:[]}:slot;
  const own={...view.ownPublic,stadium:[]};
  if(intent?.position==='bench'){
    own.bench=[...view.ownPublic.bench];
    own.bench[intent.benchIndex]=clonedSlot;
  }else own.active=clonedSlot;
  const filtered={...view,ownPublic:own,
    opponentPublic:{...view.opponentPublic,stadium:[]}};
  const checked=classifyVisibleThornsVeto(filtered,intent);
  return checked.veto?
    {veto:true,reason:'known-ability-inert-stadium-tool-lock',
      policy:VERSION}:
    {...checked,policy:VERSION};
}

/**
 * Default-off, reversible native integration; preserves all other policy
 * decisions and does not use opponent concealed hand, deck, or Prize data.
 * @template T
 * @param {()=>T} work Synchronous genuine native research run.
 * @returns {{result:T,audit:object}}
 */
function withNeutralThornsUnderworldVeto(work){
  assert.equal(typeof work,'function');
  const chosen=require('../agent31-underworld-door-owner-frontier.cjs');
  const original=chosen.chooseUnderworldDoorRoot;
  assert.equal(typeof original,'function');
  const audit={schema:VERSION,proposalsSeen:0,provenVetoes:0,
    expandedKnownNeutralVetoes:0,reasons:{},samples:[],
    onlyDetatchedOwnerView:true,readsOpponentHidden:false,
    opponentPrivateZonesRead:false,
    changesPrintedSixties:false,qualifiedGames:0};
  function guarded(view,catalog,receipt){
    const proposal=original(view,catalog,receipt);
    audit.proposalsSeen++;
    const base=classifyVisibleThornsVeto(view,proposal);
    const decision=classifyNeutralThornsVeto(view,proposal);
    audit.reasons[decision.reason]=(audit.reasons[decision.reason]??0)+1;
    if(!decision.veto)return proposal;
    audit.provenVetoes++;
    if(!base.veto)audit.expandedKnownNeutralVetoes++;
    if(audit.samples.length<24)audit.samples.push({
      actorSeat:view.actorSeat,globalTurn:view.globalTurn,
      sourcePrinting:proposal.sourcePrinting,
      reason:decision.reason,expanded:!base.veto
    });
    return null;
  }
  chosen.chooseUnderworldDoorRoot=guarded;
  try{return {result:work(),audit};}
  finally{
    assert.strictEqual(chosen.chooseUnderworldDoorRoot,guarded);
    chosen.chooseUnderworldDoorRoot=original;
  }
}
module.exports={VERSION,NEUTRAL_STADIUM_PRINTINGS,
  NEUTRAL_TOOL_PRINTINGS,classifyNeutralThornsVeto,
  withNeutralThornsUnderworldVeto};

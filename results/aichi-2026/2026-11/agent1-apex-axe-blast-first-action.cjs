"use strict";
/*
 * Research-only, actor-visible first-action decision candidate:
 * Regidrago VSTAR -> Haxorus BLK70 Axe Blast on an authenticated Basic.
 * No native Action token, no projected prompt contract and no game result.
 * Requires independently certified native action legality, present paid
 * physical Energy, actor DISCARD (not guessed), and absence of effect immunity.
 */
const {apexPaid}=require("./agent1-apex-nonitem-lockbreak.cjs");
const {EVOS,KNOWN,analyze}=require("../../../scripts/2026-11/agent1-aichi-basic-only-axe-opportunity.cjs");
const SOURCE_HAX={name:"Haxorus",set:"BLK",number:"70"};
function match(x,source){
 return x?.name===source.name&&x?.printing?.set===source.set&&
  String(x?.printing?.number)===source.number;
}
function propose(field,req){
 if(!Array.isArray(field?.decks))throw Error("Missing original source field");
 const {physicalSeat,opponentRank,opponentActive,ownActive,
  ownAttachedEnergy,ownDiscard,certifiedNativeApexAllowed,
  certifiedTargetEffectsAllowKO,ownPrizesRemaining,certifiedTargetPrizes}=req||{};
 if(physicalSeat!==0&&physicalSeat!==1)throw Error("Missing physical actor seat");
 const deck=field.decks.find(x=>x.rank===opponentRank);
 if(!deck)return {status:"unknown-opponent-source"};
 if(!opponentActive?.printing||typeof opponentActive.name!=="string")
  throw Error("Missing public target print");
 const c=deck.cards.find(x=>x.category==="Pokémon"&&match(opponentActive,
  {name:x.name,set:x.printing?.set,number:String(x.printing?.number)}));
 if(!c)return {status:"not-in-authenticated-original-source"};
 if(!KNOWN.has(c.name))throw Error("Unknown exact printed stage");
 const basic=!EVOS.has(c.name);
 const result={status:"requires-prerequisites",physicalSeat,opponentRank,
  target:{name:c.name,printing:c.printing},targetBasic:basic,
  targetStage:basic?"Basic":"Evolution",
  allSourcePokemonBasic:analyze(field).basicOnlyRanks.includes(opponentRank)};
 if(!basic)return {...result,status:"evolution-target-not-eligible"};
 if(!match(ownActive,{name:"Regidrago VSTAR",set:"SIT",number:"136"})||
 !Array.isArray(ownAttachedEnergy)||!Array.isArray(ownDiscard))
  return {...result,status:"no-certified-active-attacker"};
 if(!apexPaid(ownAttachedEnergy))return {...result,status:"apex-base-cost-unfunded"};
 if(!ownDiscard.some(x=>match(x,SOURCE_HAX)))
  return {...result,status:"exact-haxorus-donor-absent"};
 if(certifiedNativeApexAllowed!==true)
  return {...result,status:"native-attack-legality-not-certified"};
 if(certifiedTargetEffectsAllowKO!==true)
  return {...result,status:"attack-effect-ko-not-certified"};
 if(!Number.isInteger(ownPrizesRemaining)||ownPrizesRemaining<1||ownPrizesRemaining>6||
 !Number.isInteger(certifiedTargetPrizes)||certifiedTargetPrizes<1||certifiedTargetPrizes>3)
  return {...result,status:"prize-award-not-certified"};
 const terminal=certifiedTargetPrizes>=ownPrizesRemaining;
 return {...result,status:terminal?"certified-terminal-first-action":"nonterminal-attack-option",
  root:"Apex Dragon",copiedAttack:"Axe Blast",donorPrint:SOURCE_HAX,
  immediateKnockOutEffect:true,attackDamage:0,
  afterDamageTriggered:false,attachedHandheldFanTrigger:false,
  attachedSpikyEnergyTrigger:false,
  prizesFromKO:certifiedTargetPrizes,terminal,
  // A response is a proposed policy first action, not a native token.
  recommendation:terminal?"prefer-over-nonterminal-attack":"compare-legal-replies-and-resource-costs"};
}
module.exports={propose,match,SOURCE_HAX};

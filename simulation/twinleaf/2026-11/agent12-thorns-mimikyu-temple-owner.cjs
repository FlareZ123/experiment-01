'use strict';

const VERSION='agent12-public-thorns-mimikyu-psychic-jet-temple-line-v1';
const MIMIKYU='Mimikyu PAL';
const THORNS='Iron Thorns ex TWM';
const TEMPLE='Temple of Sinnoh ASR';
const JET='Jet Energy PAL';
const PSYCHIC='Psychic Energy MEE';

/**
 * A development-only, actor-observed three-step answer to opposing Iron Thorns.
 * Use only public board/attached Energy and this actor's held hand, never
 * opponent hidden cards, deck order, Prizes or postgame observations.
 *
 * Priorities: fund Bench Mimikyu with basic Psychic, attach Jet to that
 * funded Bench Mimikyu to promote it (before Temple disables Jet's switch),
 * then replace the Stadium with Temple while Mimikyu is Active. These
 * actions are proposals; the pinned native Store remains the legality judge.
 *
 * The line is intentionally restricted to an observed opponent Iron Thorns ex
 * with Special Energy actually attached. It can still be dominated by other
 * lines, and existing source Stadium replacement may break the lock.
 *
 * @param {object} view Detached current actorObservation.
 * @param {object} catalog Public printed card catalog.
 * @returns {object|null} Existing typed native-root intent or null.
 */
function chooseTempleMimikyuThornsLine(view,catalog){
  if(view?.decisionKind!=='owner-root')return null;
  const own=view.ownPublic,other=view.opponentPublic;
  const quota=view.ownTurnResources;
  if(!own?.active||!other?.active||!quota||!Array.isArray(view.ownHand))
    return null;
  if(other.active.printing!==THORNS)return null;
  const attackingEnergy=other.active.energies??[];
  // An actually attached Basic Lightning would remain Lightning after
  // Temple and could fund Volt Cyclone. Decline this specific counterline.
  if(!attackingEnergy.some(p=>typeof p==='string'&&
       catalog.specialEnergies?.has(p))||
     attackingEnergy.some(p=>typeof p==='string'&&
       p.startsWith('Lightning Energy ')))return null;
  const held=(printing,kind)=>{
    const index=view.ownHand.indexOf(printing);
    return index<0||!kind.has(printing)?-1:index;
  };
  const psychicInHand=held(PSYCHIC,catalog.basicEnergies??new Set());
  const jetInHand=held(JET,catalog.specialEnergies??new Set());
  const canAttach=quota.energyPlayedTurn!==view.globalTurn&&
    quota.energyPlayLocked!==true&&quota.specialEnergyPlayLocked!==true&&
    own.publicTurnRestrictions?.energyPlayLocked!==true&&
    own.publicTurnRestrictions?.specialEnergyPlayLocked!==true;
  const currentStadium=[...(own.stadium??[]),...(other.stadium??[])];
  const templeAlreadyUp=currentStadium.some(p=>
    p.startsWith('Temple of Sinnoh '));
  const stadiumIndex=held(TEMPLE,new Set(
    [...(catalog.trainerStadiumPrints??new Map()).entries()]
      .filter(([,entry])=>entry?.type==='Stadium'&&
        entry.name==='Temple of Sinnoh').map(([printing])=>printing)));
  const stadiumAvailable=stadiumIndex>=0&&!templeAlreadyUp&&
    quota.stadiumPlayLocked!==true&&
    own.publicTurnRestrictions?.stadiumPlayLocked!==true&&
    quota.stadiumPlayedTurn!==view.globalTurn;
  const current=own.active.printing===MIMIKYU?own.active:null;
  if(current){
    const psychic=(current.energies??[]).some(p=>
      typeof p==='string'&&p.startsWith('Psychic Energy '));
    if(!psychic&&canAttach&&psychicInHand>=0){
      return {kind:'attach-basic-energy',handIndex:psychicInHand,
        printing:PSYCHIC,slot:'active',source:VERSION,
        reason:'mimikyu-active-pay-psychic-before-temple'};
    }
    if(psychic&&canAttach&&jetInHand>=0&&
       (current.energies??[]).length<2){
      return {kind:'attach-special-energy',handIndex:jetInHand,
        printing:JET,slot:'active',source:VERSION,
        reason:'mimikyu-active-add-colorless-before-temple'};
    }
    if(psychic&&stadiumAvailable){
      return {kind:'play-temple-dde-denial',handIndex:stadiumIndex,
        printing:TEMPLE,source:VERSION,
        reason:'opp-thorns-only-special-public-psychic-funded-mimikyu'};
    }
    return null;
  }
  if(own.active.printing!==THORNS||templeAlreadyUp)return null;
  const bench=own.bench??[];
  const index=bench.findIndex(p=>p?.printing===MIMIKYU);
  if(index<0)return null;
  const mimic=bench[index];
  const psychic=(mimic.energies??[]).some(p=>
    typeof p==='string'&&p.startsWith('Psychic Energy '));
  if(!psychic&&canAttach&&psychicInHand>=0){
    return {kind:'attach-basic-energy',handIndex:psychicInHand,
      printing:PSYCHIC,slot:'bench',index,source:VERSION,
      reason:'pre-fund-bench-mimikyu-psychic'};
  }
  // The native Jet switch must be executed BEFORE Temple is in play.
  if(psychic&&canAttach&&jetInHand>=0){
    return {kind:'attach-special-energy',handIndex:jetInHand,
      printing:JET,slot:'bench',index,source:VERSION,
      reason:'jet-promote-funded-mimikyu-before-temple'};
  }
  return null;
}
module.exports={VERSION,chooseTempleMimikyuThornsLine,
  MIMIKYU,THORNS,TEMPLE,JET,PSYCHIC};

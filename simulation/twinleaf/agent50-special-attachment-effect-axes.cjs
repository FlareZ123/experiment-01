'use strict';

const assert=require('node:assert/strict');

const VERSION='agent50-public-special-attachment-effect-axes-v1';
const MAX_OFFERS=72;

/**
 * Classify immediate printed Special Energy effect channels visible before
 * attachment. This is a proposal census, not a native legality check,
 * a tactical preference or a prediction of hidden deck contents.
 *
 * @param {object} view Detached authenticated owner-root observation.
 * @param {object} catalog Public original-printing catalog.
 * @returns {{version:string,offers:object[],truncated:boolean,
 *   scope:string}}
 */
function collectSpecialAttachmentEffectAxes(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  const result={version:VERSION,offers:[],truncated:false,
    scope:'Owner-visible conditional on-attach channels; no native action acceptance, hidden deck identity, or outcome prediction'};
  if(!own?.active||!Array.isArray(own.bench)||
     !Array.isArray(view.ownHand)||!catalog?.specialEnergies)return result;
  if(r?.energyPlayedTurn===view.globalTurn||
     r?.energyPlayLocked===true||
     r?.specialEnergyPlayLocked===true||
     own.publicTurnRestrictions?.energyPlayLocked===true||
     own.publicTurnRestrictions?.specialEnergyPlayLocked===true)return result;
  const targets=[
    {slot:'active',index:0,pokemon:own.active},
    ...own.bench.flatMap((pokemon,index)=>
      pokemon?[{slot:'bench',index,pokemon}]:[])
  ];
  const hasBenchRoom=own.bench.some(pokemon=>pokemon===null);
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    if(!catalog.specialEnergies.has(printing))continue;
    for(const target of targets){
      const pokemon=target.pokemon;
      let channel=null,potential=null,reason=null;
      if(printing.startsWith('Speed Lightning Energy ')){
        channel='on-attach-draw-two';
        if(!pokemon.printed?.types?.includes(catalog.basicEnergyTypes?.Lightning)){
          potential=false;reason='recipient-not-public-Lightning';
        }else{
          potential=own.deckCount>0;
          reason=potential?'Lightning-recipient-with-deck-cards':
            'Lightning-recipient-empty-deck';
        }
      }else if(printing.startsWith('Capture Energy ')){
        channel='on-attach-basic-bench-search';
        potential=hasBenchRoom&&own.deckCount>0;
        reason=!hasBenchRoom?'bench-full':own.deckCount===0?
          'deck-empty':'bench-room-deck-membership-unverified';
      }else if(printing.startsWith('Jet Energy ')){
        channel='on-attach-forced-active-switch';
        potential=target.slot==='bench';
        reason=potential?'attached-to-Bench':
          'attached-to-Active-no-switch';
      }else if(printing.startsWith('Telepathic Psychic Energy ')||
          printing.startsWith('Telepath [P] Energy ')){
        channel='on-attach-two-Psychic-basic-bench-search';
        potential=pokemon.printed?.types?.includes(
          catalog.basicEnergyTypes?.Psychic)&&hasBenchRoom&&own.deckCount>0;
        reason=!pokemon.printed?.types?.includes(
          catalog.basicEnergyTypes?.Psychic)?
          'recipient-not-public-Psychic':!hasBenchRoom?'bench-full':
          own.deckCount===0?'deck-empty':
          'Psychic-recipient-bench-room-deck-membership-unverified';
      }else continue;
      if(result.offers.length===MAX_OFFERS){
        result.truncated=true;return result;
      }
      result.offers.push({
        kind:'attach-special-energy',
        handIndex,printing,slot:target.slot,index:target.index,
        recipientPrinting:pokemon.printing??null,
        onAttachChannel:channel,
        publicEffectOpportunity:potential,
        reason,
        potentialDrawCap:channel==='on-attach-draw-two'&&potential?
          Math.min(2,own.deckCount):null,
        deckTargetKnown:channel.includes('bench-search')?false:null,
        potentialBenchCap:channel==='on-attach-two-Psychic-basic-bench-search'&&
          potential?Math.min(2,own.bench.filter(x=>x===null).length):null,
        nativePlayability:'unverified',
        nativeEffectSettlement:'unverified'
      });
    }
  }
  return result;
}

module.exports={VERSION,MAX_OFFERS,collectSpecialAttachmentEffectAxes};

'use strict';

const assert=require('node:assert/strict');
const VERSION='agent30-public-inert-leading-attack-v1';

/**
 * Detect source-printed, board-observable cases where the first
 * affordable attack has no useful target, and suggest a separately affordable
 * printed damage attack. This is a tactical preference, not a proof that
 * damage is always better in every matchup. The real Store settles attacks.
 *
 * Each identity is a source-authenticated exact printing in the 2026 Aichi
 * Top 32 field, rather than a potentially ambiguous attack/Pokemon name.
 *
 * @param {object} view Deep-frozen detached owner-root observation.
 * @param {object[]} payable Already legality/cost-screened attack objects.
 * @returns {{attackName:string,reason:string}|null}
 */
function choosePublicInertLeadingAttack(view,payable){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(Array.isArray(payable));
  if(payable.length<2||!view.opponentPublic?.active)return null;
  const own=view.ownPublic;
  const first=payable[0];
  const bench=own?.bench;
  const fullBench=Array.isArray(bench)&&bench.length>=5&&
    bench.every(Boolean);
  const discardEmpty=Array.isArray(own?.discard)&&own.discard.length===0;
  let nextName=null;
  let nextDamage=null;
  let reason=null;
  if(fullBench&&own.active?.printing==='Pidgey MEW'&&
      first.name==='Call for Family'){
    nextName='Tackle';
    nextDamage=20;
    reason='Pidgey MEW Call for Family cannot place Basics on a full Bench';
  }else if(fullBench&&own.active?.printing==='Duskull PRE'&&
      first.name==='Come and Get You'){
    nextName='Mumble';
    nextDamage=30;
    reason='Duskull PRE cannot place discarded Duskull on a full Bench';
  }else if(view.ownHand?.length>=6&&
      own.active?.printing==='Dialga-GX UPR'&&
      first.name==='Overclock'){
    nextName='Shred';
    nextDamage=80;
    reason='Dialga-GX UPR Overclock draws zero cards with six or more in hand';
  }else if(Array.isArray(bench)&&bench.length>0&&
      bench.every(slot=>slot===null)&&
      own.active?.printing==='Buneary PFL'&&
      first.name==='Run Around'){
    nextName='Kick';
    nextDamage=20;
    reason='Buneary PFL cannot switch without any Benched Pokemon';
  }else if(discardEmpty&&own.active?.printing==='Trubbish NVI'&&
      first.name==='Garbage Collection'){
    nextName='Sludge Bomb';
    nextDamage=20;
    reason='Trubbish NVI cannot retrieve a card from an empty discard';
  }
  if(!nextName)return null;
  const alternative=payable.find(attack=>
    attack.name===nextName&&attack.damage===nextDamage&&
    (attack.damageCalculation===null||
     attack.damageCalculation===undefined));
  return alternative?{attackName:alternative.name,reason}:null;
}

module.exports={VERSION,choosePublicInertLeadingAttack};

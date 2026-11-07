'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const VERSION='agent3-v28-printed-attacker-nominal-damage-screen-v1';

/** Resolve one explicit printing via official set-code metadata and original cards. */
function createPrintedLookup(resources){
  const sets=JSON.parse(fs.readFileSync(path.join(resources,'sets/en.json'),'utf8'));
  const cache=new Map();
  return (set,number,name)=>{
    const ids=set==='SMP'?['smp']:
      sets.filter(s=>s.ptcgoCode===set).map(s=>s.id);
    assert.ok(ids.length>0,'Unknown printed set: '+set);
    const hits=[];
    for(const id of ids){
      const filename=path.join(resources,'cards/en',id+'.json');
      if(!fs.existsSync(filename))continue;
      if(!cache.has(id))cache.set(id,JSON.parse(fs.readFileSync(filename,'utf8')));
      for(const card of cache.get(id)){
        if(card.name===name &&
          String(card.number).replace(/^SM(?=\d)/,'')===String(number))hits.push(card);
      }
    }
    assert.equal(hits.length,1,'Source roster printed identity not unique: '+
      [set,number,name].join(' '));
    return hits[0];
  };
}

/**
 * A narrow independent printed-attack nominal damage model. Its result says
 * nothing about attached attacking Energy, modifiers, other effects or
 * whether these original native attacks are paper-legal.
 * @param {object} attack Exact printed English attack.
 * @param {object[]} energy Public Energy printings on the knocked-out target.
 * @param {object} specialCard Verified official Telepathic Psychic Energy print.
 * @returns {{nominal:number,units:number,formula:string}|null}
 */
function printedAttackNominal(attack,energy,specialCard){
  assert.ok(attack&&typeof attack.name==='string');
  assert.ok(Array.isArray(energy));
  if(/^\d+$/.test(attack.damage))
    return {nominal:Number(attack.damage),units:0,formula:'fixed-printed-damage'};
  const match=/^(\d+)\+$/.exec(attack.damage);
  const text=/^This attack does (\d+) more damage for each Energy attached to your opponent's Active Pokémon\.$/.exec(attack.text??'');
  if(!match||!text)return null;
  assert.equal(attack.name,'Psychic');
  assert.equal(specialCard.name,'Telepathic Psychic Energy');
  assert.ok(specialCard.rules?.some(r=>
    r.includes('As long as this card is attached to a Pokémon, it provides Psychic Energy.')));
  let units=0;
  for(const e of energy){
    assert.equal(typeof e.name,'string');
    if(e.name==='Psychic Energy'){
      assert.equal(e.set,'MEE');
      units++;
    }else if(e.name==='Telepathic Psychic Energy'){
      assert.equal(e.set,'POR');
      assert.equal(e.setNumber,'88');
      units++;
    }else{
      return null;
    }
  }
  return {
    nominal:Number(match[1])+Number(text[1])*units,
    units,formula:'printed-psychic-per-opponent-energy'
  };
}

/**
 * Require that a registered original rank's actual published Pokémon roster
 * admits exactly one card with the recorded attack name. Compare the
 * advertised native cumulative KO damage with the *unmodified* paper attack
 * nominal value, while explicitly refusing a game, damage, Energy-payment,
 * hidden-information or official clock certification.
 *
 * @param {object[]} victims Eight originally observed joined public KO victims.
 * @param {object} sourceField Existing authenticated-original Aichi dataset.
 * @param {{resources?:string}} [options]
 * @returns {{version:string,rows:object[],paperGameCertified:false,qualifiedCompetitiveGames:0}}
 */
function screenNativeAttackDamage(victims,sourceField,options={}){
  assert.ok(Array.isArray(victims)&&victims.length>0);
  assert.ok(Array.isArray(sourceField.decks));
  const resources=options.resources??path.resolve(__dirname,'../../resources');
  const printed=createPrintedLookup(resources);
  const special=JSON.parse(fs.readFileSync(
    path.join(resources,'cards/en/me3.json'),'utf8'))
    .find(x=>x.id==='me3-88');
  assert.ok(special);
  const permittedRoles={1:'fixed-contender',6:'original-source',11:'original-source'};
  const rows=victims.map((v,index)=>{
    assert.equal(typeof v.registeredTrialId,'string');
    const rank=Number(v.registeredTrialId.split(':')[0]);
    assert.ok(Object.hasOwn(permittedRoles,rank),'Unregistered rank '+rank);
    assert.equal(v.attackRole,permittedRoles[rank]);
    assert.equal(typeof v.attackName,'string');
    const deck=sourceField.decks.find(d=>d.rank===rank);
    assert.ok(deck && Array.isArray(deck.cards),'No original roster for rank '+rank);
    const candidates=[];
    for(const row of deck.cards.filter(r=>r.category==='Pokémon')){
      assert.ok(row.printing);
      const p=printed(row.printing.set,row.printing.number,row.name);
      for(const attack of p.attacks??[]){
        if(attack.name===v.attackName)candidates.push({card:p,attack});
      }
    }
    assert.equal(candidates.length,1,'Ambiguous/missing printed attacker for '+
      v.registeredTrialId+': '+v.attackName);
    const {card,attack}=candidates[0];
    const victim=printed(v.victimPrinting.set,
      v.victimPrinting.setNumber,v.victimPrinting.name);
    assert.equal(Number(victim.hp),v.victimPrinting.printedHp);
    const weakness=(victim.weaknesses??[]).some(w=>card.types?.includes(w.type));
    const resistance=(victim.resistances??[]).some(r=>card.types?.includes(r.type));
    assert.equal(weakness,false,'Printed weakness requires separate model');
    assert.equal(resistance,false,'Printed resistance requires separate model');
    const output=printedAttackNominal(attack,v.publicEnergyCardsOnVictim,special);
    assert.ok(output,'Unsupported nominal attack grammar: '+v.attackName);
    const cumulative=v.victimDamageBeforeNativeKo;
    assert.ok(Number.isSafeInteger(cumulative)&&cumulative>=0);
    const difference=cumulative-output.nominal;
    return {
      index,trialId:v.registeredTrialId,originalRank:rank,
      nativeAttackRole:v.attackRole,attackName:v.attackName,
      rosterAttackerPrintedId:card.id,rosterAttackerName:card.name,
      attackerType:card.types[0],printedAttackCost:attack.cost,
      victimPrintedId:victim.id,victimName:victim.name,
      victimPublicEnergyObjects:v.publicEnergyCardsOnVictim.length,
      nominalEnergyUnits:output.units,
      unmodifiedPrintedFinalAttackDamage:output.nominal,
      nativeCumulativeDamageAtKo:cumulative,
      nominalDamageDifference:difference,
      formula:output.formula,
      exactAttackerAtNativeDeclarationObserved:false,
      attackingEnergyPaymentCertified:false,
      damageModifiersAndEarlierCountersCertified:false,
      paperGameCertified:false
    };
  });
  return {version:VERSION,rows,paperGameCertified:false,
    qualifiedCompetitiveGames:0};
}
module.exports={VERSION,printedAttackNominal,screenNativeAttackDamage};

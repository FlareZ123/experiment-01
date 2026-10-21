'use strict';

const assert=require('node:assert/strict');
const {remainingBasicAttachments}=
  require('./agent10-basic-energy-frontier.cjs');

const VERSION='agent44-owner-visible-multislot-basic-recipient-v1';
const TYPES=['Grass','Fire','Water','Lightning','Psychic',
  'Fighting','Darkness','Metal','Fairy'];

/**
 * Select a Basic Energy card and public Pokémon recipient that genuinely
 * reduces a printed, non-GX attack's remaining one-unit Basic requirements.
 * This is deliberately only a cost frontier. It does not value attack effects,
 * predict future evolution or guarantee gameplay strength.
 *
 * The acting player's own hand and face-up in-play Pokémon are the only
 * variable inputs. Both opposing hidden state and the acting deck/Prizes are
 * irrelevant. Unknown attached Special Energy makes a slot ineligible rather
 * than giving fictitious Energy units. The Store decides actual legality.
 *
 * @param {object} view Detached actorObservation
 * @param {object} catalog Public printed card catalog
 * @returns {{handIndex:number,printing:string,slot:'active'|'bench',
 * index:number,attackName:string,gapBefore:number,gapAfter:number,
 * knownBasicEnergyOnly:true}|null}
 */
function chooseActorEnergyRecipient(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const {ownPublic,ownHand}=view;
  if(!ownPublic?.active||!Array.isArray(ownPublic.bench))return null;
  const basicKind=printing=>{
    if(!catalog.basicEnergies.has(printing))return null;
    const type=TYPES.find(name=>printing.startsWith(name+' Energy '));
    return type===undefined?null:(catalog.basicEnergyTypes[type]??null);
  };
  const held=ownHand.flatMap((printing,handIndex)=>{
    const type=basicKind(printing);
    return type===null?[]:[{handIndex,printing,type}];
  });
  if(!held.length)return null;
  const targets=[
    {slot:'active',index:0,pokemon:ownPublic.active},
    ...ownPublic.bench.flatMap((pokemon,index)=>
      pokemon?[{slot:'bench',index,pokemon}]:[])
  ];
  const viable=(pokemon,attached)=> (pokemon.attacks??[]).filter(attack=>
    Array.isArray(attack.cost)&&attack.gxAttack!==true&&
    attack.cost.every(Number.isSafeInteger)&&
    Number.isSafeInteger(catalog.colorlessEnergyType)&&
    !(pokemon.publicRestrictions?.cannotUseAttacksNextTurn??[]).includes(attack.name)
  ).map(attack=>({
    attack,missing:remainingBasicAttachments(
      attack.cost,attached,catalog.colorlessEnergyType)
  }));
  const ready=targets[0].pokemon.energies.every(p=>
    basicKind(p)!==null)&&
    viable(targets[0].pokemon,targets[0].pokemon.energies.map(basicKind))
      .some(x=>x.missing===0);
  const possibilities=[];
  for(const target of targets){
    // No card-specific special-energy rules are inferred.
    const attached=(target.pokemon.energies??[]).map(basicKind);
    if(attached.includes(null))continue;
    for(const {attack,missing} of viable(target.pokemon,attached)){
      if(missing===0)continue;
      for(const energy of held){
        const after=remainingBasicAttachments(attack.cost,
          [...attached,energy.type],catalog.colorlessEnergyType);
        if(after>=missing)continue;
        // When the Active already has a payable attack, favor charging a
        // Benched alternative rather than infinitely overcharging Active.
        const priority=target.slot==='active'?(ready?2:0):1;
        possibilities.push({
          priority,after,cost:attack.cost.length,
          recipientIndex:target.index,handIndex:energy.handIndex,
          printing:energy.printing,slot:target.slot,index:target.index,
          attackName:attack.name,gapBefore:missing,gapAfter:after
        });
      }
    }
  }
  possibilities.sort((a,b)=>a.priority-b.priority||a.after-b.after||
    a.cost-b.cost||a.recipientIndex-b.recipientIndex||
    a.handIndex-b.handIndex);
  if(!possibilities.length)return null;
  const {priority,after,cost,recipientIndex,...pick}=possibilities[0];
  return {...pick,knownBasicEnergyOnly:true};
}

module.exports={VERSION,chooseActorEnergyRecipient};

'use strict';

const assert=require('node:assert/strict');
const {remainingBasicAttachments}=
  require('./agent10-basic-energy-frontier.cjs');
const {specialEnergyUnits}=
  require('./agent3-special-energy-frontier.cjs');

const VERSION='agent30-owner-visible-known-special-recipient-v2';
const NEAR_TERM_DAMAGE_VERSION='agent8-owner-visible-near-term-damage-v1';
const TYPES=['Grass','Fire','Water','Lightning','Psychic',
  'Fighting','Darkness','Metal','Fairy'];

/**
 * Choose a held Basic Energy and visible recipient that reduces a printed,
 * non-GX attack's remaining cost. Attached Basic Energy and the exact
 * Special Energy printings supported by specialEnergyUnits contribute units.
 * Every unmodeled Special Energy makes its own Pokémon ineligible.
 * The native Store remains responsible for legality, continuous effects and
 * resolving any Telepathic on-attachment search.
 *
 * @param {object} view Detached actorObservation
 * @param {object} catalog Public exact printing and native type catalog
 * @param {{preferNearTermDamage?:boolean,preferGuzmaPivot?:boolean}} [options] Explicit experimental branch
 * @returns {{handIndex:number,printing:string,slot:'active'|'bench',
 * index:number,attackName:string,gapBefore:number,gapAfter:number,
 * knownBasicEnergyOnly:true}|null}
 */
function chooseActorEnergyRecipient(view,catalog,options={}){
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
  const stadium=[...(ownPublic.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const temple=stadium.some(p=>p.startsWith('Temple of Sinnoh '));
  const attachedUnits=pokemon=>{
    const units=[];
    for(const printing of pokemon.energies??[]){
      const basic=basicKind(printing);
      if(basic!==null){
        units.push(basic);
        continue;
      }
      const special=specialEnergyUnits(printing,catalog,temple);
      if(special===null)return null;
      units.push(...special);
    }
    return units;
  };
  const viable=(pokemon,attached)=>(pokemon.attacks??[]).filter(attack=>
    Array.isArray(attack.cost)&&attack.gxAttack!==true&&
    attack.cost.every(Number.isSafeInteger)&&
    Number.isSafeInteger(catalog.colorlessEnergyType)&&
    !(pokemon.publicRestrictions?.cannotUseAttacksNextTurn??[])
      .includes(attack.name)
  ).map(attack=>({
    attack,missing:remainingBasicAttachments(
      attack.cost,attached,catalog.colorlessEnergyType)
  }));
  const activeUnits=attachedUnits(targets[0].pokemon);
  const ready=activeUnits!==null&&
    viable(targets[0].pokemon,activeUnits).some(x=>x.missing===0);
  const possibilities=[];
  for(const target of targets){
    const attached=attachedUnits(target.pokemon);
    if(attached===null)continue;
    for(const {attack,missing} of viable(target.pokemon,attached)){
      if(missing===0)continue;
      for(const energy of held){
        const after=remainingBasicAttachments(attack.cost,
          [...attached,energy.type],catalog.colorlessEnergyType);
        if(after>=missing)continue;
        const priority=target.slot==='active'?(ready?2:0):1;
        possibilities.push({
          priority,after,cost:attack.cost.length,
          // Positive printed base damage is only a staging signal. The
          // native Store and actual opponent hand determine real damage.
          positivePrintedDamage:Number.isFinite(attack.damage)&&
            attack.damage>0,
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
  let winner=possibilities[0];
  // An unaffordable exposed Active can monopolize every attachment under
  // the usual Active-first rule. Experimentally admit a *known*, faster
  // damaging Bench route only with an owner-held route to promote it later.
  // Guzma is a future Supporter option, never the same-turn Marnie play.
  // This does not assert that the switch or attack is guaranteed.
  const canPromoteWithItem=view.ownTurnResources?.itemPlayLocked!==true&&
    ownHand.some(p=>p.startsWith('Switch ')||p.startsWith('Escape Rope '));
  const canPlanFutureGuzma=options.preferGuzmaPivot===true&&
    ownHand.includes('Guzma BUS')&&
    view.opponentPublic?.bench?.some(Boolean)===true;
  if(options.preferNearTermDamage===true && winner.slot==='active' &&
      winner.after>=2 && (canPromoteWithItem||canPlanFutureGuzma)){
    const short=possibilities.filter(p=>p.slot==='bench'&&
      p.positivePrintedDamage&&p.after<=1&&p.after<winner.after)
      .sort((a,b)=>a.after-b.after||a.cost-b.cost||
        a.recipientIndex-b.recipientIndex||a.handIndex-b.handIndex);
    if(short.length)winner={...short[0],shorterDamagingPath:true};
  }
  const {priority,after,cost,recipientIndex,positivePrintedDamage,
    ...pick}=winner;
  return {...pick,knownBasicEnergyOnly:true};
}

module.exports={VERSION,NEAR_TERM_DAMAGE_VERSION,chooseActorEnergyRecipient};

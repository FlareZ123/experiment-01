'use strict';

const assert=require('node:assert/strict');
const {missingEnergyUnits,specialEnergyUnits}=
  require('./agent3-special-energy-frontier.cjs');

const VERSION='agent30-known-public-perfection-donor-frontier-v1';
const DONORS=new Set([
  'Gengar & Mimikyu-GX TEU',
  'Trevenant & Dusknoir-GX SMP'
]);
const BASIC_NAMES=['Grass','Fire','Water','Lightning','Psychic',
  'Fighting','Darkness','Metal','Fairy'];

/**
 * Read printed attacks of exact, already independently verified GX donor
 * printings from the public CardManager catalog. Cost is still only printed
 * numeric cost and does not certify a native action.
 *
 * @param {object[]} nativeCardDefinitions Native public card definitions
 * @returns {ReadonlyMap<string,readonly object[]>}
 */
function knownPerfectionDonorCatalog(nativeCardDefinitions){
  assert.ok(Array.isArray(nativeCardDefinitions));
  const donors=new Map();
  for(const card of nativeCardDefinitions){
    if(!DONORS.has(card?.fullName))continue;
    assert.ok(Array.isArray(card.attacks));
    donors.set(card.fullName,Object.freeze(card.attacks.map(a=>
      Object.freeze({name:a.name,cost:Object.freeze([...a.cost]),
        gxAttack:a.gxAttack===true}))));
  }
  return donors;
}

/**
 * Conserve known printed attached Energy units; unfamiliar Specials fail
 * closed instead of artificially paying a colored copied-attack cost.
 * @param {object} view Detached actor root
 * @param {object} energyCatalog Native public typed Energy catalog
 * @returns {number[]|null}
 */
function knownMewtwoEnergyUnits(view,energyCatalog){
  const stadium=[...(view.ownPublic?.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const temple=stadium.some(x=>x.startsWith('Temple of Sinnoh '));
  const units=[];
  for(const printing of view.ownPublic?.active?.energies??[]){
    if(energyCatalog.basicEnergies.has(printing)){
      const name=BASIC_NAMES.find(n=>printing.startsWith(n+' Energy '));
      if(name===undefined)return null;
      units.push(energyCatalog.basicEnergyTypes[name]);
      continue;
    }
    const special=specialEnergyUnits(printing,energyCatalog,temple);
    if(special===null)return null;
    units.push(...special);
  }
  return units;
}

/**
 * Publicly sufficient vetoes for the exact active Mewtwo GX ability.
 * It is intentionally conservative: the presence of a known printed lock
 * rejects the path even when other effects could circumvent that lock.
 * Unknown global modifiers are outside this numerical frontier.
 *
 * @param {object} view Detached owner-visible observation
 * @returns {string|null}
 */
function publicPerfectionVeto(view){
  const active=view.ownPublic?.active;
  const opponent=view.opponentPublic;
  if(active?.printing!=='Mewtwo & Mew-GX UNM')return 'not-mewtwo-active';
  if(!(active.abilities??[]).includes('Perfection'))return 'no-printed-perfection';
  if(view.ownPublic?.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    active.publicRestrictions?.cannotAttackNextTurn===true||
    (active.specialConditions??[]).length>0)return 'attack-restricted';
  const stadium=[...(view.ownPublic.stadium??[]),...(opponent.stadium??[])];
  if(stadium.some(s=>s.startsWith('Path to the Peak ')||
    s.startsWith('Silent Lab ')))return 'public-stadium-ability-lock';
  const oppActive=opponent.active;
  if(oppActive?.abilities?.some(name=>name==='Initialization'||
    name==='Neutralizing Gas'||name==='Bide Barricade'))
    return 'public-active-ability-lock';
  const inPlay=[opponent.active,...(opponent.bench??[]),
    view.ownPublic.active,...(view.ownPublic.bench??[])];
  if(inPlay.some(p=>p&&(p.abilities??[]).includes('Garbotoxin')&&
    (p.tools??[]).length>0))return 'garbotoxin-with-tool';
  if(inPlay.some(p=>p&&(p.abilities??[]).includes('Power of Alchemy')))
    return 'basic-ability-lock';
  return null;
}

/**
 * Enumerate payable known Perfection copy candidates on the owner’s actual
 * Bench or in its own publicly visible discard. Source printing identity is
 * preserved for native ChooseAttackPrompt verification by a future adapter.
 * No assumption about opponent hand or hidden Prize contents is permitted.
 *
 * @param {object} view Detached owner-only actor observation
 * @param {object} energyCatalog Actor34's public typed Energy catalog
 * @param {ReadonlyMap<string,readonly object[]>} donorCatalog Verified native GX text
 * @returns {readonly object[]}
 */
function knownPerfectionReadyOptions(view,energyCatalog,donorCatalog){
  assert.equal(view.decisionKind,'owner-root');
  if(publicPerfectionVeto(view)!==null)return Object.freeze([]);
  const attached=knownMewtwoEnergyUnits(view,energyCatalog);
  if(attached===null)return Object.freeze([]);
  const sources=new Set([
    ...(view.ownPublic.discard??[]),
    ...(view.ownPublic.bench??[]).flatMap(p=>p?[p.printing]:[])
  ]);
  const usedGX=view.ownPublic.publicTurnRestrictions?.gxUsed===true||
    view.ownPublic.publicTurnRestrictions?.cannotUseGXAttacks===true;
  const ready=[];
  for(const [printing,attacks] of donorCatalog){
    if(!sources.has(printing))continue;
    for(const attack of attacks){
      if(usedGX&&attack.gxAttack)continue;
      if(!Array.isArray(attack.cost)||
        !attack.cost.every(Number.isSafeInteger))continue;
      if(missingEnergyUnits(attack.cost,attached,
        energyCatalog.colorlessEnergyType)!==0)continue;
      ready.push(Object.freeze({
        sourcePrinting:printing,attackName:attack.name,
        gxAttack:attack.gxAttack,printedCost:Object.freeze([...attack.cost])
      }));
    }
  }
  return Object.freeze(ready);
}

module.exports={VERSION,knownPerfectionDonorCatalog,
  knownMewtwoEnergyUnits,publicPerfectionVeto,
  knownPerfectionReadyOptions};

'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent50-original29-printed-public-correction-v2';
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const originalField=require('../../results/aichi-2026/full-decklists.json');
/** @param {string|number} n Native or historical collector number. */
const numberKey=n=>{
  const value=String(n??'').trim();
  return /^\\d+$/.test(value)?String(Number(value)):value;
};
// Preserve every authentic source printing, including same-name/different-number
// identities. A native alias is allowed only if it identifies exactly one
// matching real class. Unregistered and ambiguous requests are untouched.
const originalPrintings=new Map();
for(const deck of originalField.decks){
  for(const entry of deck.cards){
    const key=entry.name+' '+entry.printing.set;
    const versions=originalPrintings.get(key)??new Map();
    const number=numberKey(entry.printing.number);
    versions.set(number,{
      name:entry.name,set:entry.printing.set,number,
      category:entry.category
    });
    originalPrintings.set(key,versions);
  }
}

/** @param {string} modulePath Pinned Twinleaf output module. */
const native=modulePath=>require(path.join(OUT,modulePath));

/**
 * Narrow printing-only corrections confirmed by the bundled Aichi-29 English
 * card database. These do not implement conditional attack text or certify a
 * paper-legal game. Return only the affected clone from CardManager.
 *
 * @param {object} card Pinned CardManager cloned card.
 * @param {object} type Native CardType enumeration.
 * @returns {string|null} Applied correction kind, or null.
 */
function correctPrintedCard(card,type){
  const printing=card?.fullName;
  if(printing==='Electrode-GX CES'){
    assert.equal(String(card.setNumber),'48');
    assert.equal(card.attacks[1].name,'Crash and Burn-GX');
    card.attacks[1].name='Crush and Burn-GX';
    return 'paper-gx-name';
  }
  if(printing==='Toedscruel PAR'){
    assert.equal(String(card.setNumber),'17');
    assert.equal(card.attacks[0].name,'Scratch');
    assert.equal(card.attacks[0].damage,80);
    assert.match(card.attacks[0].text,/Heal 30 damage/);
    const {WAS_ATTACK_USED,HEAL_X_DAMAGE_FROM_THIS_POKEMON}=
      native('game/store/prefabs/prefabs');
    const earlier=card.reduceEffect;
    assert.equal(typeof earlier,'function');
    card.attacks[0].name='Mushroom Drain';
    card.reduceEffect=function(store,state,effect){
      const next=earlier.call(this,store,state,effect);
      return WAS_ATTACK_USED(effect,0,this)?
        HEAL_X_DAMAGE_FROM_THIS_POKEMON(effect,store,next,30):next;
    };
    return 'paper-attack-name-and-healing-effect';
  }
  if(printing==='Pidgeotto TEU'){
    assert.equal(String(card.setNumber),'123');
    assert.deepEqual(card.resistance,
      [{type:type.FIGHTING,value:-30}]);
    card.resistance=[{type:type.FIGHTING,value:-20}];
    return 'printed-resistance';
  }
  if(printing==='Mew V FST'||printing==='Mew VMAX FST'){
    assert.deepEqual(card.resistance,[]);
    card.resistance=[{type:type.FIGHTING,value:-30}];
    return 'printed-resistance';
  }
  if(printing==='Genesect V FST'){
    assert.deepEqual(card.resistance,[]);
    card.resistance=[{type:type.GRASS,value:-30}];
    return 'printed-resistance';
  }
  if(printing==='Shadow Rider Calyrex VMAX CRE'){
    assert.equal(card.attacks[0].name,'Max Geist');
    assert.equal(card.attacks[0].damage,10);
    assert.equal(card.attacks[0].damageCalculation,undefined);
    card.attacks[0].damageCalculation='+';
    return 'printed-variable-attack-notation';
  }
  if(printing==='Koraidon ex TEF'){
    assert.equal(card.attacks[0].name,'Retribution Strike');
    assert.equal(card.attacks[0].damage,20);
    assert.equal(card.attacks[0].damageCalculation,undefined);
    card.attacks[0].damageCalculation='+';
    return 'printed-variable-attack-notation';
  }
  return null;
}

/**
 * Intercept native CardManager cloning only for this synchronous experiment.
 * The pinned upstream submodule is never modified. Restore the exact
 * descriptor even if the research experiment throws.
 *
 * @template T
 * @param {() => T} run Real native or pure test workload.
 * @param {{CardManager?:object,CardType?:object}} [deps] Test injection.
 * @returns {{result:T,audit:object}} Result and scoped correction audit.
 */
function withOriginal29PrintedFidelity(run,deps={}){
  assert.equal(typeof run,'function');
  const CardManager=deps.CardManager??
    native('game/cards/card-manager').CardManager;
  const CardType=deps.CardType??
    native('game/store/card/card-types').CardType;
  const proto=CardManager.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'getCardByName');
  assert.equal(typeof original?.value,'function');
  const audit={version:VERSION,attempts:0,corrections:[],aliases:[],
    paperLegalityCertified:false,competitiveGamesQualified:0};
  function wrapped(fullName){
    let card=original.value.call(this,fullName);
    if(!card&&originalPrintings.has(fullName)){
      const expected=originalPrintings.get(fullName);
      const matches=this.getAllCards().filter(entry=>
        [...expected.values()].some(print=>
          entry.name===print.name&&entry.set===print.set&&
          numberKey(entry.setNumber)===print.number));
      if(matches.length===1){
        card=original.value.call(this,matches[0].fullName);
        if(card)audit.aliases.push({
          originalRequest:fullName,nativeFullName:matches[0].fullName
        });
      }
    }
    if(!card)return card;
    const kind=correctPrintedCard(card,CardType);
    if(kind){
      audit.attempts++;
      audit.corrections.push({printing:card.fullName,kind});
    }
    return card;
  }
  Object.defineProperty(proto,'getCardByName',{...original,value:wrapped});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(proto.getCardByName,wrapped);
    Object.defineProperty(proto,'getCardByName',original);
  }
}

module.exports={VERSION,correctPrintedCard,withOriginal29PrintedFidelity};

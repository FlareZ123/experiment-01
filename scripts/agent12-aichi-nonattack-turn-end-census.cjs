'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent12-aichi-nonattack-turn-end-census-v1';

/**
 * Audited exact English card identities, backed by resources/cards/en.
 * The trigger is critical: playing Tropical Beach or benching Rotom V does
 * not by itself end a turn; using the named effect does, if it resolves.
 * Original-player registrations may use alternate-art Japanese printings;
 * this model only classifies the manifest's mechanically mapped English ID.
 */
const TRIGGERS = Object.freeze([
  {name:'Radiant Eternatus',set:'CRZ',number:'105',
    cardId:'swsh12pt5-105',trigger:'on-bench-optional-ability',
    effect:'Climactic Gate'},
  {name:'Rotom V',set:'LOR',number:'58',
    cardId:'swsh11-58',trigger:'activated-ability',
    effect:'Instant Charge'},
  {name:'Tropical Beach',set:'BWP',number:'50',
    cardId:'bwp-BW50',trigger:'activated-stadium-effect',
    effect:'draw-until-seven'},
  {name:'Camping Gear',set:'BST',number:'122',
    cardId:'swsh5-122',trigger:'played-item',
    effect:'search-one'},
  {name:"Steven's Resolve",set:'CES',number:'145',
    cardId:'sm7-145',trigger:'played-supporter',
    effect:'search-up-to-three'},
  {name:'Boost Shake',set:'EVS',number:'142',
    cardId:'swsh7-142',trigger:'played-item',
    effect:'search-and-evolve'}
]);

/** @param {object} c Exact source card. */
function textElements(c){
  return [
    ...(c.rules??[]).map(text=>({origin:'rule',text})),
    ...(c.abilities??[]).map(a=>({origin:'ability',name:a.name,text:a.text??''})),
    ...(c.attacks??[]).map(a=>({origin:'attack',name:a.name,text:a.text??''}))
  ];
}

/**
 * Verify each manually audited trigger against the exact supplied English
 * set printing and a specific end-turn clause. Does not infer paper legality.
 * @param {object[]} triggers Frozen trigger registry.
 * @param {(id:string)=>object} readCard Card lookup by exact card ID.
 * @returns {object[]} Verified facts; throws on missing/misprinted evidence.
 */
function verifyTriggerTexts(triggers,readCard){
  return triggers.map(trigger=>{
    const card=readCard(trigger.cardId);
    assert.equal(card.id,trigger.cardId,'Exact printing missing');
    assert.equal(card.name,trigger.name,'Card name does not match printing');
    const rows=textElements(card).filter(row=>
      /\b(?:your|that player.s) turn ends\b/i.test(row.text));
    assert.ok(rows.length>0,'Printing lacks turn-ending text: '+trigger.cardId);
    if(trigger.trigger==='activated-ability'||trigger.trigger===
        'on-bench-optional-ability'){
      assert.ok(rows.some(row=>row.origin==='ability'&&
        row.name===trigger.effect));
    }else if(trigger.trigger==='activated-stadium-effect'){
      assert.ok(rows.some(row=>row.origin==='rule'&&
        /once during each player.s turn/i.test(row.text)));
    }else{
      assert.ok(rows.some(row=>row.origin==='rule'));
    }
    return {...trigger,verifiedCardId:card.id,matchedClauseOrigins:
      [...new Set(rows.map(row=>row.origin))]};
  });
}

/**
 * Count mechanically named terminal effect *opportunities* represented by
 * a fixed print-identity registration, not observed uses or playable starts.
 * @param {object[]} decks Exact source manifest's 29 recovered deck entries.
 * @param {object[]} triggers Printing-verified trigger identity metadata.
 * @returns {object} Reproducible per-rank full-list crosswalk.
 */
function fieldTerminalEffects(decks,triggers){
  assert.ok(Array.isArray(decks));
  const rows=[];
  for(const d of decks){
    for(const card of d.cards){
      const hit=triggers.find(t=>t.name===card.name&&
        t.set===card.printing?.set&&
        t.number===String(card.printing?.number));
      if(hit){
        rows.push({rank:d.rank,archetype:d.archetype,
          printing:hit.cardId,name:hit.name,count:card.count,
          trigger:hit.trigger,effect:hit.effect});
      }
    }
  }
  rows.sort((a,b)=>a.rank-b.rank||a.name.localeCompare(b.name));
  const ranks=[...new Set(rows.map(row=>row.rank))];
  return {version:VERSION,sourceDecks:decks.length,
    affectedRanks:ranks,affectedDeckCount:ranks.length,
    matchedDeckRows:rows.length,
    triggerCopies:rows.reduce((n,row)=>n+row.count,0),
    rows,scope:'Audited exact manifest English print mappings; effect opportunities only',
    actualUseCount:null,nativeSettledTurnEndCount:null,
    competitiveGameQualified:false};
}

/**
 * Loading helper for the existing checked-out repository. This does not
 * modify files or read unknown hidden cards from any game.
 * @param {string} root Repository root.
 * @returns {object} Verified text and field matching.
 */
function runInventory(root){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const cardCache=new Map();
  const readCard=id=>{
    const set=id.slice(0,id.indexOf('-'));
    if(!cardCache.has(set)){
      const cards=JSON.parse(fs.readFileSync(path.join(root,
        'resources/cards/en',set+'.json'),'utf8'));
      cardCache.set(set,new Map(cards.map(c=>[c.id,c])));
    }
    return cardCache.get(set).get(id);
  };
  const verified=verifyTriggerTexts(TRIGGERS,readCard);
  return {verifiedTriggers:verified,
    census:fieldTerminalEffects(manifest.decks,verified)};
}

if(require.main===module){
  process.stdout.write(JSON.stringify(runInventory(path.join(__dirname,'..')),null,2)+'\n');
}

module.exports={VERSION,TRIGGERS,textElements,verifyTriggerTexts,
  fieldTerminalEffects,runInventory};

'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {BASIC_ENERGIES,auditSourceRootCoverage}=
  require('./aichi-source-root-coverage.cjs');
const {VERSION:ACTOR_POLICY_VERSION}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

// Native exercises below are links to a particular, limited control. They do
// not imply an autonomously chosen source action or a qualified game outcome.
// "unverified" is deliberately distinct from "unimplemented".
const FAMILIES=Object.freeze([
  {id:'vip',name:'Battle VIP Pass',kind:'Item bench search',
    route:'separate-shared-adapter',nativeWitness:'Agent9 native both-seat source item, two Basics and T2 opponent reply; default off'},
  {id:'quick',name:'Quick Ball',kind:'Item Basic search/discard',
    route:'opt-in-narrow',nativeWitness:'rank11 selected native Item root'},
  {id:'carmine',name:'Carmine',kind:'Supporter first-player draw',
    route:'opt-in-narrow',nativeWitness:null},
  {id:'shake',name:'Boost Shake',kind:'Item accelerated evolution',
    route:'separate-source-adapter',nativeWitness:'rank11 selected source boost'},
  {id:'tag',name:'Tag Call',kind:'Item TAG TEAM access',
    route:'absent',nativeWitness:null},
  {id:'guzmah',name:'Guzma & Hala',kind:'multi-resource Supporter',
    route:'absent',nativeWitness:null},
  {id:'guzma',name:'Guzma',kind:'Supporter mobility/gust',
    route:'opt-in-narrow',nativeWitness:null},
  {id:'seeker',name:'VS Seeker',kind:'Item discard Supporter recovery',
    route:'opt-in-narrow',nativeWitness:'rank1/2 selected native Item recovery; new owner prompt adapter needs authentic field trial'},
  {id:'compressor',name:'Battle Compressor',kind:'Item deck-to-discard payload',
    route:'separate-source-adapter',nativeWitness:'selected source payload tests'},
  {id:'lillie',name:"Lillie's Determination",kind:'Supporter hand shuffle/draw',
    route:'opt-in-narrow',nativeWitness:'two actual owner-root native Lillie effects'},
  {id:'marnie',name:'Marnie',kind:'Supporter hand disruption/draw',
    route:'opt-in-narrow',nativeWitness:null},
  {id:'iono',name:'Iono',kind:'Supporter Prize-scaled disruption/draw',
    route:'opt-in-narrow',nativeWitness:null},
  {id:'ultra',name:'Ultra Ball',kind:'Item Pokémon search/discard',
    route:'absent',nativeWitness:null},
  {id:'mysterious',name:'Mysterious Treasure',kind:'Item Pokémon search/discard',
    route:'absent',nativeWitness:null},
  {id:'forest',name:'Forest Seal Stone',kind:'Tool/VSTAR resource search',
    route:'separate-candidate-adapter',nativeWitness:'selected candidate Stone effects'},
  {id:'blower',name:'Field Blower',kind:'Item opponent Tool/Stadium removal',
    route:'separate-candidate-adapter',nativeWitness:'selected New Moon tool-removal roots'},
  {id:'mail',name:"Trainers' Mail",kind:'Item restricted top-four search',
    route:'absent',nativeWitness:null},
  {id:'box',name:'Secret Box',kind:'ACE SPEC multi-resource Item',
    route:'absent',nativeWitness:null},
  {id:'patch',name:'Dark Patch',kind:'Item Energy acceleration',
    route:'absent',nativeWitness:null},
  {id:'special',name:'(all Special Energy)',kind:'Energy attachment',
    route:'opt-in-partial',nativeWitness:'numeric coverage partial; no field-wide decision proof'},
  {id:'basic',name:'(all Basic Energy)',kind:'Energy attachment',
    route:'baseline',nativeWitness:'physical Basic Energy root in frozen native games'}
]);
const ROUTES=new Set(['absent','opt-in-narrow','opt-in-partial',
  'separate-source-adapter','separate-candidate-adapter',
  'separate-shared-adapter','baseline']);

/** @param {object} card @param {string} familyId @returns {boolean} */
function belongs(card,familyId){
  if(familyId==='special')
    return card.category==='Energy'&&!BASIC_ENERGIES.has(card.name);
  if(familyId==='basic')
    return card.category==='Energy'&&BASIC_ENERGIES.has(card.name);
  const family=FAMILIES.find(x=>x.id===familyId);
  return card.category==='Trainer'&&card.name===family?.name;
}

/**
 * Printed-card family exposure, separate from native action selection and
 * mechanical feasibility. Never use player hand, hidden Prize or deck order.
 * @param {object} corpus Exact 29-source manifest.
 * @returns {object} Complete per-rank and per-family action-vocabulary matrix.
 */
function matrix(corpus){
  const prior=auditSourceRootCoverage(corpus);
  assert.equal(prior.exactPrintedSources,29);
  assert.deepEqual(prior.missingFullPrintedRanks,[23,25,28]);
  assert.equal(new Set(FAMILIES.map(f=>f.id)).size,FAMILIES.length);
  assert.ok(FAMILIES.every(x=>ROUTES.has(x.route)));
  const seen=new Set();
  const decks=corpus.decks.map(deck=>{
    assert.ok(!seen.has(deck.rank));seen.add(deck.rank);
    assert.equal(deck.cards.reduce((sum,x)=>sum+x.count,0),60);
    const families=Object.fromEntries(FAMILIES.map(f=>[
      f.id,deck.cards.filter(c=>belongs(c,f.id))
        .reduce((sum,c)=>sum+c.count,0)
    ]));
    return {rank:deck.rank,archetype:deck.archetype,families,
      absentActorCopies:FAMILIES.filter(x=>x.route==='absent')
        .reduce((sum,f)=>sum+families[f.id],0),
      absentActorFamilyCount:FAMILIES.filter(x=>
        x.route==='absent'&&families[x.id]>0).length};
  }).sort((a,b)=>a.rank-b.rank);
  const families=FAMILIES.map(f=>({
    ...f,sourceRanks:decks.filter(d=>d.families[f.id]>0).map(d=>d.rank),
    sourceCount:decks.filter(d=>d.families[f.id]>0).length,
    copies:decks.reduce((sum,d)=>sum+d.families[f.id],0)
  }));
  return {
    schema:'aichi-29-original-printed-family-vocabulary-v1',
    actorPolicyVersion:ACTOR_POLICY_VERSION,
    originalSources:decks.length,
    missingRanks:prior.missingFullPrintedRanks,
    families,decks,
    semantics:{
      route:'Specific named card family in common actor-only root. Baseline, opt-in, or external route. External source/candidate adapters do not establish a common both-player choice.',
      nativeWitness:'Selected, limited evidence only; no printed legal opportunity or full-field decision qualification implied',
      counts:'Physical original source card copies. A printed physical copy may be useless or illegal to play in the current state.',
      qualifiedGames:0
    }
  };
}

/** @param {ReturnType<typeof matrix>} m @returns {string} */
function markdown(m){
  const head=[
    '# Original Aichi 2026 field-wide printed action-family matrix',
    '',
    'Exact originals: '+m.originalSources+'; missing registered 60s: '+
      m.missingRanks.join(', ')+'.',
    'Reference common actor-only policy: `'+m.actorPolicyVersion+'`.',
    '',
    '| Family | Original 60s | Copies | Common actor route | Narrow native evidence |',
    '| --- | ---: | ---: | --- | --- |'
  ];
  const table=m.families.map(f=>'| '+f.name+' | '+f.sourceCount+
    ' | '+f.copies+' | '+f.route+' | '+(f.nativeWitness??'unverified')+' |');
  const tails=[
    '',
    'This is a printed-card and policy-action-space map, not a legal-play, native efficacy, opening turn or deck-performance score. External adapters and opt-ins have unqualified live decisions until independently measured. Every row still needs own-hand, printed timing, cost, proposed root, original Store accepted effect and opponent reply evidence.',
    '',
    '| Original rank | Archetype | Distinct families with no generic actor root | Copies of those families |',
    '| ---: | --- | ---: | ---: |',
    ...m.decks.map(d=>'| '+d.rank+' | '+d.archetype+' | '+
      d.absentActorFamilyCount+' | '+d.absentActorCopies+' |'),
    ''
  ];
  return [...head,...table,...tails].join('\n');
}

if(require.main===module){
  const data=require(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'));
  process.stdout.write(markdown(matrix(data))+'\n');
}

module.exports={FAMILIES,ROUTES,belongs,matrix,markdown};

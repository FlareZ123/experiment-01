'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const sourceManifest=path.join(root,'results/aichi-2026/full-decklists.json');
const candidateManifest=path.join(root,
  'results/als/new-moon-lockbreak-english-proxy-60.json');

/**
 * Identify the minimum printed counterplay scope in the specific rank-15
 * two-Vileplume board hypothesis without claiming the board is established.
 * Source inventories, card IDs and card text are read from local evidence.
 * @param {object} field Parsed Aichi source inventories
 * @param {object} candidate Frozen New Moon English proxy
 * @param {string} dataRoot Root with resources/cards/en
 * @returns {object} Printed-card necessary-conditions audit.
 */
function inspectDualVileplume(field,candidate,dataRoot=root){
  const rank15=field.decks.find(d=>d.rank===15);
  assert.ok(rank15,'Missing published rank15 source');
  assert.equal(rank15.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(candidate.entries.reduce((n,c)=>n+c.count,0),60);
  const count=(name,printing)=>rank15.cards
    .filter(c=>c.name===name&&(!printing||c.printing.set===printing))
    .reduce((n,c)=>n+c.count,0);
  assert.equal(count('Vileplume','AOR'),2);
  assert.equal(count('Vileplume','BUS'),1);

  const cache=new Map();
  /** @param {string} id */
  function sourceCard(id){
    const sep=id.lastIndexOf('-');
    assert.ok(sep>0,'Malformed source card ID');
    const setId=id.slice(0,sep);
    if(!cache.has(setId)){
      cache.set(setId,JSON.parse(fs.readFileSync(path.join(dataRoot,
        'resources/cards/en',setId+'.json'),'utf8')));
    }
    const matches=cache.get(setId).filter(c=>c.id===id);
    assert.equal(matches.length,1,'Unresolved exact card '+id);
    return matches[0];
  }

  const vileplumeItem=sourceCard('xy7-3');
  const vileplumeBasic=sourceCard('sm3-6');
  const hood=sourceCard('sm10-186');
  assert.equal(vileplumeItem.name,'Vileplume');
  assert.equal(vileplumeBasic.name,'Vileplume');
  assert.equal(hood.name,'Stealthy Hood');
  const allCandidatePokemon=candidate.entries
    .filter(c=>c.type==='Pokémon').map(c=>{
      const card=sourceCard(c.english_proxy_card_id);
      assert.equal(card.name,c.english_database_name);
      return {count:c.count,name:card.name,id:card.id,
        stage:card.subtypes?.[0]??null,attacks:(card.attacks??[]).map(a=>({
          name:a.name,cost:a.cost,damage:a.damage
        }))};
    });
  const nonBasicAttackers=allCandidatePokemon.filter(p=>
    p.stage!=='Basic'&&p.attacks.length>0);
  const namedItemCounts={};
  for(const name of ['Field Blower','Canceling Cologne',
    'Escape Rope','Counter Catcher']){
    namedItemCounts[name]=candidate.entries
      .filter(row=>row.name_en===name).reduce((sum,row)=>sum+row.count,0);
  }
  const supporterNames=candidate.entries
    .filter(row=>row.type==='Trainer'&&
      ['Lillie\'s Determination','Ace Trainer','Guzma',
        'Boss\'s Orders','Serena'].includes(row.name_en))
    .map(row=>({name:row.name_en,count:row.count}));
  return {
    rank:15,archetype:rank15.archetype,
    opponent:{
      vileplumeItem: {print:'AOR 3',count:count('Vileplume','AOR'),
        ability:vileplumeItem.abilities[0]},
      vileplumeBasic: {print:'BUS 6',count:count('Vileplume','BUS'),
        hp:Number(vileplumeBasic.hp),ability:vileplumeBasic.abilities[0]},
      oddish:count('Oddish'),gloom:count('Gloom'),
      stealthyHood:count('Stealthy Hood'),
      stealthyHoodEffect:hood.rules?.find(t=>t.includes('Prevent all effects'))||null
    },
    candidate:{
      nonBasicAttackers, namedItemCounts,supporterNames,
      allOtherAttackersBasic:allCandidatePokemon
        .filter(p=>p.attacks.length>0&&p.stage==='Basic')
        .every(p=>p.stage==='Basic')
    },
    conditionalScope:[
      'AOR Vileplume in play removes all Item-from-hand lines while its Ability works.',
      'BUS Vileplume Active prevents all opponent Basic Pokemon attacks while its Ability works.',
      'The two locks require distinct Vileplume in play and viable shared Oddish evolution chains.',
      'Dusclops SFA 19 is the only Stage 1 attacker in the frozen New Moon candidate.',
      'A Hood protecting a Vileplume can prevent opponent Cursed Blast counter effects; verify live resolution.',
      'Even a dual lock is not an automatic win: the candidate retains the Stage 1 Will-O-Wisp attack.'
    ],
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}

function main(){
  const field=JSON.parse(fs.readFileSync(sourceManifest,'utf8'));
  const candidate=JSON.parse(fs.readFileSync(candidateManifest,'utf8'));
  const result=inspectDualVileplume(field,candidate);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}

if(require.main===module)main();
module.exports={inspectDualVileplume,main};

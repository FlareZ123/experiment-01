'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>require(path.join(root,p));
/** Exact printed-attack bench breakpoint, ignoring external damage modifiers. */
function minimumBenches(attacker,target,maxBenches=16){
  const rondo=attacker.attacks.find(x=>x.name==='Full Moon Rondo');
  assert.ok(rondo);
  assert.deepEqual(rondo.cost,['Psychic','Colorless']);
  assert.match(rondo.text,/each Benched Pokémon \(both yours and your opponent's\)/);
  assert.equal(rondo.damage,'20+');
  const weakness=target.weaknesses?.find(x=>x.type==='Psychic');
  const factor=weakness?.value==='×2'?2:1;
  assert.equal(target.resistances?.some(x=>x.type==='Psychic')??false,false);
  const hp=Number(target.hp);
  for(let b=0;b<=maxBenches;b++){
    if((20+20*b)*factor>=hp)return b;
  }
  return null;
}
function analyze(){
  const field=load('results/aichi-2026/full-decklists.json');
  const rank30=field.decks.find(x=>x.rank===30);
  const rank1=field.decks.find(x=>x.rank===1);
  const candidate=load('results/als/new-moon-lockbreak-english-proxy-60.json');
  assert.equal(rank30.archetype,"Lillie's Clefairy");
  const sourceCount=(name)=>rank30.cards.filter(x=>x.name===name)
    .reduce((n,x)=>n+x.count,0);
  const newMoonCount=(name)=>candidate.entries.filter(x=>x.name_en===name)
    .reduce((n,x)=>n+x.count,0);
  assert.equal(sourceCount("Lillie's Clefairy ex"),3);
  assert.equal(sourceCount('Wondrous Patch'),4);
  assert.equal(sourceCount('Telepathic Psychic Energy'),2);
  assert.equal(sourceCount('Sky Field'),3);
  assert.equal(newMoonCount('Mewtwo & Mew-GX'),2);
  assert.equal(rank1.cards.filter(x=>x.name==='Shadow Rider Calyrex VMAX')
    .reduce((n,x)=>n+x.count,0),4);
  const card=(set,id)=>load('resources/cards/en/'+set+'.json')
    .find(x=>x.id===id);
  const attacker=card('sv9','sv9-56');
  const mew=card('sm11','sm11-71');
  const vmax=card('swsh6','swsh6-75');
  const v=card('swsh6','swsh6-74');
  assert.equal(attacker.name,"Lillie's Clefairy ex");
  assert.ok(mew.rules.some(x=>x.startsWith('TAG TEAM rule:')));
  assert.equal(mew.hp,'270');
  return {
    schema:'agent16-rank30-printed-rondo-breakpoint-v1',
    sourceRank:30,sourceClefairy:3,sourceWondrousPatch:4,
    sourceTelepathicPsychicEnergy:2,sourceSkyField:3,
    candidateNewMoonMewtwoMew:2,
    attack:'Full Moon Rondo',energyCost:['Psychic','Colorless'],
    normalTwoBenchMaximum:10,skyFieldTwoBenchMaximum:16,
    targetBreakpoints:[
      {target:'new-moon Mewtwo & Mew-GX',hp:270,psychicWeakness:'x2',
        totalBenchesForOHKO:minimumBenches(attacker,mew),prizesPerKO:3},
      {target:'rank1 Shadow Rider Calyrex V',hp:Number(v.hp),
        psychicWeakness:'none',
        totalBenchesForOHKO:minimumBenches(attacker,v),prizesPerKO:2},
      {target:'rank1 Shadow Rider Calyrex VMAX',hp:320,
        psychicWeakness:'none',
        totalBenchesForOHKO:minimumBenches(attacker,vmax),prizesPerKO:3}
    ],competitiveQualifiedGames:0,
    caveat:'Printed attack and Weakness arithmetic only; assumes payable attack, target Active, no other damage modifiers, and stated public combined Bench occupancy.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(analyze(),null,2)+'\n');
module.exports={analyze,minimumBenches};

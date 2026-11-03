'use strict';

const assert = require('node:assert/strict');
const fixed60 = require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const { choose } = require('./agent5-adp-thorton-prize-availability.cjs');
const {
  BASIC_IDS, ratio, prizeSurvival, evaluate: original
} = require('./agent32-adp-first-gx-physical-window.cjs');

const VERSION = 'agent32-adp-switch-first-gx-physical-window-v1';
const KEY = Object.freeze({
  adp:'sm12-156', switch:'sv1-194', tag:'sm12-206',
  quick:'swsh1-179', gh:'sm12-193', dde:'xy6-97'
});

/**
 * Exact additional first-turn GX physical-access event DISJOINT from the
 * original ADP-starter event: no ADP in starting seven, another Basic there,
 * a Switch in the first eight, and ADP either in the ordinary eighth draw
 * or searchable from deck with held Tag Call / Quick Ball. Direct held DDE,
 * or held/searchable G&H with DDE surviving Prizes, pays the Energy route.
 *
 * Tag Call can find ADP plus G&H together. Quick Ball needs a one-card
 * discard; G&H optional search needs two further cards. The eight-card
 * starting resource pool leaves those costs physically possible if other
 * cards are preserved, but strategic payment and legal opponent windows
 * remain assumptions. No additional draw, Tool, retreat, Item/Supporter
 * denial, native Store effect, or game outcome is modeled.
 *
 * @param {{id:string,count:number}[]} [rows] Source-fixed 60.
 * @returns {object} Four new disjoint branches and combined initial-Active and Switch physical access.
 */
function evaluate(rows = fixed60.cards) {
  assert.equal(rows.reduce((s,c) => s+c.count,0),60);
  const inventory = new Map(rows.map(c=>[c.id,c.count]));
  assert.equal(inventory.size,rows.length);
  const get = key => inventory.get(KEY[key]) || 0;
  const basics = rows.reduce((s,c) =>
    s+(BASIC_IDS.has(c.id)?c.count:0),0);
  const adp=get('adp');
  const counts = [
    adp, basics-adp, get('switch'), get('tag'),
    get('quick'), get('gh'), get('dde'),
    60-basics-get('switch')-get('tag')-get('quick')-get('gh')-get('dde')
  ];
  assert.ok(counts.every(n=>Number.isSafeInteger(n)&&n>=0));
  const labels=['ADP','Other Basic','Switch','Tag Call','Quick Ball',
    'Guzma & Hala','Double Dragon Energy','Other'];
  const prizeSets=choose(52,6);
  const valid7=choose(60,7)-choose(60-basics,7);
  const denominator=valid7*53n*prizeSets;
  const newMass=[0n,0n,0n,0n];
  const h=counts.map(()=>0);
  let allNewStarterMass=0n;

  /** @param {number} index @param {number} remain @param {bigint} ways */
  function walk(index,remain,ways){
    if(index===counts.length){
      if(remain!==0||h[0]!==0||h[1]===0)return;
      for(let draw=0;draw<counts.length;draw++){
        const copies=counts[draw]-h[draw];
        if(!copies)continue;
        const e=[...h];e[draw]++;
        const weight=ways*BigInt(copies);
        allNewStarterMass+=weight*prizeSets;
        if(e[2]===0)continue;
        const adpHeldInEight=e[0]>0;
        if(!adpHeldInEight&&e[3]===0&&e[4]===0)continue;
        const needed=[];
        if(!adpHeldInEight)needed.push(counts[0]-e[0]);
        const ddeHeld=e[6]>0;
        if(!ddeHeld){
          if(e[5]===0&&e[3]===0)continue;
          needed.push(counts[6]);
          if(e[5]===0)needed.push(counts[5]);
        }
        const k=(adpHeldInEight?0:2)+(ddeHeld?0:1);
        newMass[k]+=weight*prizeSurvival(needed);
      }
      return;
    }
    for(let take=0;take<=Math.min(counts[index],remain);take++){
      h[index]=take;
      walk(index+1,remain-take,ways*choose(counts[index],take));
    }
  }
  walk(0,7,1n);
  const expectedOtherStarter=(choose(60-adp,7)-choose(60-basics,7)) *
    53n*prizeSets;
  assert.equal(allNewStarterMass,expectedOtherStarter);
  const additional=newMass.reduce((s,n)=>s+n,0n);
  assert.ok(additional<=allNewStarterMass);
  const base=original(rows);
  assert.equal(base.denominator,denominator.toString());
  const oldMass=BigInt(base.combined.numerator)*
    (denominator/BigInt(base.combined.denominator));
  const combined=oldMass+additional;
  assert.ok(combined<=denominator);
  return {
    version:VERSION,deck:base.deck,canonicalCardsSha256:base.canonicalCardsSha256,
    categories:Object.fromEntries(labels.map((name,i)=>[name,counts[i]])),
    basicCount:basics,
    conditioning:'Basic-valid initial seven; ADP not in that seven; other Basic is Active; Switch held by first draw; six disjoint Prizes',
    denominator:denominator.toString(),
    adpInEighthAndDDEHeld:ratio(newMass[0],denominator),
    adpInEighthGuzmaHalaSearch:ratio(newMass[1],denominator),
    adpDeckSearchableDDEHeld:ratio(newMass[2],denominator),
    adpDeckSearchableGuzmaHalaSearch:ratio(newMass[3],denominator),
    switchAdditional:ratio(additional,denominator),
    originalADPStarter:base.combined,
    eitherADPStarterOrSwitch:ratio(combined,denominator),
    qualifiedGames:0,
    exclusions:'No extra draw, special mobility, ability access, paper payment quality, opponent interruption, natural policy or competitive outcome'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(evaluate(),null,2)+'\n');
module.exports={VERSION,KEY,evaluate};

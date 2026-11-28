'use strict';

/*
 * Conditional Temple-of-Sinnoh stress screen for Agent1's existing fixed60
 * Apex Lockdown setup proxy. This is NOT a game simulator or matchup engine.
 *
 * When Temple remains in play at the Apex Dragon attack, every Double Dragon
 * Energy provides one COLORLESS and no G/F. Hence the attack's [G][G][F]
 * cost requires at least TWO Basic Grass and ONE Basic Fire Energy attached
 * to the same Regidrago VSTAR. We count Basic Energy attachments ANYWHERE
 * during the two-own-turn trace (including already discarded Energy and
 * attachments to other Pokémon). This is an intentionally generous upper
 * bound: if even that total lacks 2 Grass / 1 Fire, the recorded "apex"
 * opportunity absolutely cannot be paid under surviving Temple.
 *
 * No assertion is made that Temple stays in play; Field Blower, Stadium
 * replacement, opponent decisions, and policy reoptimization for Temple
 * are not simulated by this offline ex-post check.
 */
const proxy=require('./agent1-apex-lockdown-setup-proxy.cjs');
const candidate=require('./agent1-apex-lockdown-v1.json');
const field=require('../full-decklists.json');

const G='Basic Grass Energy';
const F='Basic Fire Energy';
function grossAttachedBasics(trace) {
  let grass=0,fire=0;
  for(const row of trace) {
    const [,event,payload]=row;
    let attached=[];
    if(event==='attach')attached=[payload?.[1]];
    else if(event==='crispin')attached=[payload?.[0]];
    else if(event==='elixir')attached=[payload];
    else if(event==='celestial roar')attached=Array.isArray(payload)?payload:[];
    for(const name of attached) {
      if(name===G)grass++;
      else if(name===F)fire++;
    }
  }
  return {grass,fire,hasRequiredGross:grass>=2&&fire>=1};
}
function templeField() {
  const decks=Array.isArray(field.decks)?field.decks:[];
  return {
    originalDecksAvailable:decks.length,
    ranks:decks.flatMap(d=>{
      const count=(d.cards||[]).reduce((sum,c)=>
        sum+(/Temple of Sinnoh/i.test(c.name)?c.count:0),0);
      return count?[{rank:d.rank,archetype:d.archetype,templeCopies:count}]:[];
    }).sort((a,b)=>a.rank-b.rank)
  };
}
function analyze({
  trials=2000,seed=27112028,second=false,
  policy='greedy',scenario='clean',goal='wipe-lock'
}={}) {
  if(!Number.isSafeInteger(trials)||trials<1)throw new Error('trials');
  if(!Number.isSafeInteger(seed))throw new Error('seed');
  let ready=0,apex=0,apexGrossRequired=0,apexProvablyBlocked=0,
      apexWithoutOwnStadium=0,apexWithoutOwnStadiumGrossRequired=0;
  const samples=[];
  for(let i=0;i<trials;i++) {
    const physicalSeed=(seed+Math.imul(i+1,0x9e3779b9))>>>0;
    const r=proxy.one(candidate.cards,physicalSeed,{
      second,policy,scenario,goal,trace:true
    });
    if(r.ready)ready++;
    if(!r.apex)continue;
    apex++;
    const gross=grossAttachedBasics(r.trace);
    const noOwnStadium=!r.trace.some(x=>x[1]==='stadium');
    if(gross.hasRequiredGross)apexGrossRequired++;
    else {
      apexProvablyBlocked++;
      if(samples.length<2)samples.push({
        physicalSeed,grassAttachedAnywhere:gross.grass,
        fireAttachedAnywhere:gross.fire
      });
    }
    if(noOwnStadium) {
      apexWithoutOwnStadium++;
      if(gross.hasRequiredGross)apexWithoutOwnStadiumGrossRequired++;
    }
  }
  return {policy,scenario,goingSecond:second,trials,seed,goal,
    ready,nominalApex:apex,apexGrossRequired,apexProvablyBlocked,
    apexWithoutOwnStadium,apexWithoutOwnStadiumGrossRequired,
    samples,
    interpretation:'conditional Temple survives to attack; any failure of generous gross Basic Energy threshold proves recorded Apex cannot be paid; successes do not prove payable attack, correct action sequencing, or any game win'
  };
}
module.exports={grossAttachedBasics,templeField,analyze};
if(typeof require!=='undefined'&&require.main===module) {
  const results=[];
  for(const scenario of ['clean','rulebox','garbotoxin','t2-both'])
    for(const second of [false,true])
      for(const policy of ['greedy','joint'])
        results.push(analyze({scenario,second,policy}));
  console.log(JSON.stringify({field:templeField(),results},null,2));
}

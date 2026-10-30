'use strict';

/**
 * Paper-rule state-transition witness for an original rank26 Meloetta Donk
 * first-player, first-turn attack against a candidate with only an Active
 * 70HP Frillish. Source has accessible specified card identities and may
 * make all chosen actions before it attacks. The fixture DOES NOT model
 * finding cards from a uniformly shuffled 60, nor any owner-native Store
 * acceptance, action-selection policy, clock, opponent-mulligan effects, or
 * match win probability.
 *
 * It applies printed Risky Ruins (20 upon new non-Darkness Basic Bench),
 * Damage Pump (up to two counters moved from one own Pokemon among other
 * Pokemon), immediate KOs and opponent Prize taking, Exeggcute Propagation
 * after each newly discarded incarnation, Tapu Koko Prism Star's two
 * distinct Benched recipients, one normal DCE attachment, TM Crisis Punch,
 * source Escape Rope switch, and Meloetta ex's first-player attack exception.
 */

/** @typedef {{id:string,name:string,hp:number,damage:number,
 * energy:string[],tool?:string}} Pokemon */
/** @typedef {{step:number,action:string,bench:string[],
 * active:string,sourceEnergyMelo:string[],candidatePrizes:number,
 * sourcePrizes:number,sourceDiscard:string[],sourceLostZone:string[]}} Receipt */

/**
 * @returns {{winner:'source',sourceTakenPrizes:number,candidateTakenPrizes:number,
 *   damage:number,spent:{damagePump:number,battleCompressor:number,
 *   riskyRuins:number,escapeRope:number,dce:number,crisisPunch:number},
 *   maxBench:number,receipts:Receipt[]}}
 */
function paperMeloettaDonkWitness(){
  /** @type {Pokemon} */
  let active={id:'bunnelby',name:'Bunnelby',hp:60,damage:0,energy:[]};
  /** @type {Pokemon[]} */
  const bench=[];
  const discard=new Set();
  const lostZone=[];
  /** @type {Receipt[]} */
  const receipts=[];
  let candidatePrizes=6,sourcePrizes=6,maxBench=0;
  const spent={damagePump:0,battleCompressor:0,riskyRuins:0,
    escapeRope:0,dce:0,crisisPunch:0};
  let stadium=false;
  let turnDrawn=true;
  let manualAttached=false;
  const eggsInHand=new Set(['eggA','eggB']);
  const incarnations={eggA:0,eggB:0};
  /** @param {string} action */
  function receipt(action){
    const melo=bench.find(p=>p.id==='melo')||
      (active.id==='melo'?active:null);
    receipts.push({
      step:receipts.length+1,action,bench:bench.map(p=>p.id),
      active:active.id,sourceEnergyMelo:melo?[...melo.energy]:[],
      candidatePrizes,sourcePrizes,sourceDiscard:[...discard],
      sourceLostZone:[...lostZone]
    });
  }
  /** @param {string} id @returns {Pokemon} */
  function needBench(id){
    const p=bench.find(x=>x.id===id);
    if(!p)throw Error(`Missing Benched ${id}`);
    return p;
  }
  /** @param {string} id @param {string} name @param {number} hp */
  function placeBasic(id,name,hp){
    if(!stadium)throw Error('Risky Ruins must already be in play');
    if(bench.length>=5)throw Error('Bench full');
    if(id.startsWith('egg')){
      if(!eggsInHand.delete(id))throw Error('Exeggcute not held');
    }
    if(bench.some(p=>p.id===id)||active.id===id)
      throw Error('Duplicate physical Pokemon in play');
    const printedTypes={melo:'Psychic',tapu:'Lightning',
      eggA:'Grass',eggB:'Grass',unown:'Psychic'};
    if(!printedTypes[id]||printedTypes[id]==='Darkness')
      throw Error('This witness only benches the original non-Darkness Basics');
    bench.push({id,name,hp,damage:20,energy:[]});
    maxBench=Math.max(maxBench,bench.length);
    receipt(`Bench ${id}; Risky Ruins places two damage counters`);
  }
  /**
   * @param {string} sourceId
   * @param {string[]} targets
   */
  function pump(sourceId,targets){
    if(targets.length<1||targets.length>2)
      throw Error('Damage Pump moves up to two counters');
    const donor=needBench(sourceId);
    if(donor.damage<10*targets.length)
      throw Error(`Not enough donation counters on ${sourceId}`);
    for(const id of targets)if(id===sourceId||!bench.some(x=>x.id===id))
      throw Error('Illegal Damage Pump target');
    donor.damage-=10*targets.length;
    for(const id of targets)needBench(id).damage+=10;
    spent.damagePump++;
    if(spent.damagePump>4)throw Error('Exceeded original four Damage Pump');
    let knockouts=0;
    for(let index=bench.length-1;index>=0;index--){
      const p=bench[index];
      if(p.damage>=p.hp){
        bench.splice(index,1);
        discard.add(p.id);
        if(p.id.startsWith('egg'))incarnations[p.id]++;
        candidatePrizes--;knockouts++;
      }
    }
    if(candidatePrizes<1)
      throw Error('Candidate wins before Crisis Punch condition');
    receipt(`Damage Pump ${sourceId} to ${targets.join(',')}; ${knockouts} KO`);
  }
  /** @param {string} id */
  function propagate(id){
    if(!discard.delete(id))throw Error('Exeggcute not in discard');
    if(incarnations[id]<1)throw Error('No newly discarded incarnation');
    eggsInHand.add(id);
    receipt(`Propagation retrieves ${id} from discard`);
  }

  // All source actions are on its FIRST turn going FIRST. Candidate has no
  // Bench and no special damage/Ability-prevention effect.
  if(!turnDrawn)throw Error('Source first turn draw not taken');
  stadium=true;spent.riskyRuins++;receipt('Play Risky Ruins');
  placeBasic('melo','Meloetta ex',200);
  placeBasic('tapu','Tapu Koko ◇',130);
  placeBasic('eggA','Exeggcute',30);
  placeBasic('eggB','Exeggcute',30);
  pump('melo',['eggA','eggB']); // Candidate takes 2 Prize cards.
  propagate('eggA');propagate('eggB');
  placeBasic('eggA','Exeggcute',30);
  placeBasic('eggB','Exeggcute',30);
  pump('tapu',['eggA','eggB']); // Candidate takes 2 more.
  propagate('eggA');
  placeBasic('eggA','Exeggcute',30);
  placeBasic('unown','Unown',60);
  pump('unown',['eggA']);       // Candidate now has exactly one Prize.
  if(candidatePrizes!==1||spent.damagePump!==3)
    throw Error('Incorrect 5 self-KO condition');

  // Battle Compressor placed the source's only two Basic Lightning cards
  // in discard before Tapu Koko uses Dance of the Ancients. A source
  // actually needs to find/pay this Item, here assumed in accessible hand.
  discard.add('lightning1');discard.add('lightning2');
  spent.battleCompressor++;
  receipt('Battle Compressor puts two Basic Lightning Energy into discard');
  const melo=needBench('melo'),unown=needBench('unown');
  if(melo.id===unown.id)throw Error('Tapu requires two different Benched targets');
  if(!discard.delete('lightning1')||!discard.delete('lightning2'))
    throw Error('Tapu cannot move both Lightning from discard');
  melo.energy.push('Lightning');
  unown.energy.push('Lightning');
  const ti=bench.findIndex(p=>p.id==='tapu');
  if(ti<0)throw Error('Tapu was not on Bench');
  bench.splice(ti,1);lostZone.push('tapu');
  receipt('Tapu Koko Dance: one Lightning to Melo, one to Unown; Tapu to Lost Zone');
  if(manualAttached)throw Error('Used more than one normal Energy attachment');
  manualAttached=true;spent.dce++;melo.energy.push('Double Colorless');
  receipt('Manually attach one Double Colorless Energy to Melo');
  melo.tool='Technical Machine: Crisis Punch';spent.crisisPunch++;
  receipt('Attach Technical Machine: Crisis Punch to Benched Melo');
  // Source has exactly one Escape Rope. Candidate lacks a Bench so cannot
  // switch; source can switch its Bunnelby for the Benched Melo.
  spent.escapeRope++;
  const i=bench.findIndex(p=>p.id==='melo');
  if(i<0)throw Error('Melo unavailable for promotion');
  const old=active;
  active=bench.splice(i,1)[0];
  bench.push(old);maxBench=Math.max(maxBench,bench.length);
  receipt('Escape Rope: candidate has no Bench; source promotes Melo');
  const availableColorless=active.energy.reduce((n,energy)=>
    n+(energy==='Double Colorless'?2:1),0);
  if(active.id!=='melo'||active.tool!=='Technical Machine: Crisis Punch'||
    availableColorless<3||candidatePrizes!==1)
    throw Error('Cannot legally announce Crisis Punch with these resources');

  // Meloetta ex Debut Performance is live and grants first-player attack.
  // Candidate Active Frillish has 70HP and no printed damage protection.
  const damage=280;
  const candidateActiveHp=70;
  if(damage<candidateActiveHp)
    throw Error('Source did not KO candidate Active');
  sourcePrizes--;
  receipt('Meloetta ex Debut Performance: first-turn Crisis Punch 280 KO on solo Frillish');
  return {winner:'source',sourceTakenPrizes:6-sourcePrizes,
    candidateTakenPrizes:6-candidatePrizes,damage,spent,maxBench,
    receipts};
}

module.exports={paperMeloettaDonkWitness};
if(require.main===module){
  process.stdout.write(JSON.stringify(paperMeloettaDonkWitness(),null,2)+'\n');
}

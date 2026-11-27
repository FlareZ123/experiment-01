'use strict';
/** Conditional Eon -> Drain -> Drain/Latias terminal route.
 * Constructed known public board with three fresh 2-Prize Regidrago VSTAR.
 * Not an actual Pokémon TCG game runner. Does not simulate sources of cards,
 * search, normal game starts, opponent strategy or native attack resolution.
 */
const SOURCE_REPLIES=Object.freeze({
  covert:{damage:70},phantom:{damage:200,benchCounters:60},
  trifrost:{damage:110,benchDamage:110},ryuno:{damage:330},
  rolling:{damage:200,reduction:80},timelessPhantom:{damage:[150,200],benchCounters:60}
});
function branch(options={}){
  const o={band:true,dna:true,valley:true,fairy:true,skyliner:true,
           heldPsychic:2,door:true,manual:true,ranger:true,
           secondReply:'covert',priorSourcePrizes:0,
           initialClefairyDamage:0,initialLatiasDamage:0,
           ...options};
  const trace=[];let own=0,source=o.priorSourcePrizes;
  let latiasHP=210-o.initialLatiasDamage,clefairyHP=190-o.initialClefairyDamage;
  let deoxysHP=330,deoxysEnergy=0,latiasEnergy=2,active='Latias';
  let eonRestricted=false,rolling=0;
  const snap=(label,details={})=>trace.push({label,own,source,latiasHP,clefairyHP,deoxysHP,latiasEnergy,deoxysEnergy,active,...details});
  const fail=why=>({win:false,why,own,source,trace});
  if(!o.valley||!o.fairy||!o.skyliner||latiasHP<=0||clefairyHP<=0)return fail('opening abilities/stadium/health absent');
  // Candidate A1: funded Latias hits first VSTAR (280HP) for 400.
  own+=2;eonRestricted=true;snap('A1 Eon: KO VSTAR 1',{damage:400});
  // Opponent first visible reply: Band Covert (Noivern ex copied by VSTAR).
  const covert=Math.max(0,70+(o.band?20:0)-(o.dna?30:0));
  latiasHP-=covert;snap('Source 1 Covert Flight',{damage:covert});
  if(latiasHP<=0){source+=2;return fail('Latias KO on first source reply');}
  // Candidate A2: Door on Benched Deoxys + manual on same Benched Deoxys.
  if(!o.door||!o.manual||o.heldPsychic<2)return fail('Deoxys two Energy funding unavailable');
  deoxysEnergy+=2;
  active='Deoxys';eonRestricted=false; // free retreat of Basic Latias to VMAX
  snap('A2 Door+manual, Latias free retreat to funded Deoxys');
  own+=2;snap('A2 Max Drain: KO VSTAR 2',{damage:320});
  const s=SOURCE_REPLIES[o.secondReply];
  if(!s)throw new Error('unsupported reply');
  const activeDamage=(d)=>Math.max(0,d+(o.band?20:0)-(o.dna?30:0));
  if(Array.isArray(s.damage)){
    for(const d of s.damage){deoxysHP-=activeDamage(d);snap('Source 2 '+o.secondReply+' attack',{damage:activeDamage(d)});}
  }else{deoxysHP-=activeDamage(s.damage);snap('Source 2 '+o.secondReply,{damage:activeDamage(s.damage)});}
  if(s.benchCounters){
    // Source selects Clefairy as the vulnerable spread target, if present.
    clefairyHP-=s.benchCounters;
    snap('Phantom six damage counters to Clefairy',{damage:s.benchCounters});
  }
  if(s.benchDamage){
    const bd=Math.max(0,s.benchDamage-(o.dna?30:0));
    latiasHP-=bd;clefairyHP-=bd;
    snap('Trifrost Bench spread',{damageToEach:bd});
  }
  rolling=s.reduction||0;
  if(clefairyHP<=0)return fail('Fairy Zone lost to source spread');
  if(deoxysHP<=0){
    source+=3;active='Latias';snap('Deoxys KO; funded Latias promoted');
    if(source>=6)return fail('source took sixth Prize before last attack');
    if(latiasHP<=0)return fail('Latias not available for final Eon');
    if(eonRestricted||latiasEnergy<2||400-rolling<280)return fail('final Eon unavailable');
    own+=2;snap('A3 Eon final VSTAR KO',{damage:400-rolling});
    return {win:own===6,why:'Latias finishing line after Deoxys KO',own,source,trace};
  }
  // Candidate A3: Deoxys is still active and has no attack cooldown.
  if(rolling && !o.ranger)return fail('Rolling Iron prevents unassisted Drain KO');
  if(rolling){rolling=0;snap('A3 Pokémon Ranger clears Rolling Iron');}
  if(deoxysEnergy<2||320-rolling<280)return fail('Max Drain not payable/lethal');
  own+=2;snap('A3 repeated Max Drain final VSTAR KO',{damage:320-rolling});
  return {win:own===6,why:'same VMAX attacks twice; no forced Latias pivot',own,source,trace};
}
module.exports={SOURCE_REPLIES,branch};
if(require.main===module){
  for(const secondReply of Object.keys(SOURCE_REPLIES)){
    const r=branch({secondReply});
    console.log(secondReply,r.win,r.why,r.own,r.source);
  }
}

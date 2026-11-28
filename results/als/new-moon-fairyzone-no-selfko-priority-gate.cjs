'use strict';
/**
 * Read-only actor-visible action guard for Fairy Zone Psychic x2.
 *
 * Detects already-legally-payable no-self-KO attacks that can KO a current
 * opponent Dragon Active. It does not search cards, evolve, change the active,
 * simulate an opponent, or assert qualified game outcomes. The caller must
 * provide native-corroborated present effects and offers; no hidden zones.
 *
 * Critical: only accept PRE-WEAKNESS damage offers, not engine post-Weakness
 * damage values, or these calculations would double-count weakness.
 * Caller certifies post-Weakness damage adjustments and actual attack legality.
 */
const KNOWN = Object.freeze({
 'Shadow Bind':{stage:'Stage2',psychic:true,gx:false,kind:'Dusknoir'},
 'Night Watch':{stage:'Basic',psychic:true,gx:false,kind:'Mewtwo or TrevGX'},
 'Eon Blade':{stage:'Basic',psychic:true,gx:false,kind:'Latias'},
 'Full Moon Rondo':{stage:'Basic',psychic:true,gx:false,kind:'Clefairy'},
 'Miraculous Duo-GX':{stage:'Basic',psychic:true,gx:true,kind:'Mewtwo'}
});
const isInt=x=>Number.isSafeInteger(x)&&x>=0;
const bool=x=>x===true||x===false;
const invalid=reason=>({status:'unsupported',reason});
const blocked=(reason,data={})=>({status:'blocked',reason,...data});
function fairyZoneNoSelfKoPriority(view){
 if(!view||typeof view!=='object'||!view.public||!view.own||!view.combat)
  return invalid('MISSING_CERTIFIED_ACTOR_VIEW');
 const p=view.public,o=view.own,c=view.combat;
 if(!isInt(p.remainingHp)||!isInt(p.totalHp)||!isInt(p.postWeaknessDamageReduction) ||
    p.remainingHp>p.totalHp||p.totalHp<1||
    !bool(p.targetIsDragon)||!bool(p.psychicWeaknessX2Certified)||
    !bool(p.preventBasicAttackDamage)||!bool(p.otherAttackEffectsCertified)||
    !bool(o.gxAlreadyUsed)||!Array.isArray(c.offers)||
    !c.offers.every(x=>x && typeof x.name==='string'&&KNOWN[x.name]&&
      typeof x.sourceToken==='string'&&x.sourceToken.length>0&&
      x.attackerStage===KNOWN[x.name].stage&&
      isInt(x.preWeaknessBaseDamage)&&bool(x.nativeLegalNow)&&
      bool(x.energyPaidNow)&&bool(x.gxNativeAllowed)))
   return invalid('MISSING_OR_CONFLICTING_ACTOR_FACTS');
 if(!p.targetIsDragon||!p.psychicWeaknessX2Certified)
  return blocked('FAIRY_ZONE_NOT_ACTUALLY_APPLYING');
 if(!p.otherAttackEffectsCertified)
  return blocked('OTHER_DAMAGE_EFFECTS_NOT_RECONCILED');
 const candidates=[];
 for(const x of c.offers){
  const def=KNOWN[x.name];
  if(!x.nativeLegalNow||!x.energyPaidNow||!x.gxNativeAllowed)continue;
  if(def.gx && o.gxAlreadyUsed)continue;
  const basicPrevented=x.attackerStage==='Basic'&&p.preventBasicAttackDamage;
  const weakMultiplied=x.preWeaknessBaseDamage*2;
  const effective=basicPrevented?0:Math.max(0,weakMultiplied-p.postWeaknessDamageReduction);
  if(effective>=p.remainingHp) candidates.push({
   name:x.name,sourceToken:x.sourceToken,attackerStage:x.attackerStage,
   projectedFinalDamage:effective,usesGX:def.gx,
   remainingHp:p.remainingHp,sourceRole:def.kind});
 }
 if(!candidates.length)
  return blocked('NO_CERTIFIED_NO_SELF_KO_DRAGON_FINISHER',{
   sourceBasicAttackProtectionActive:p.preventBasicAttackDamage
  });
 // Do not waste a GX when a non-GX finisher exists; among non-GX prefer
 // Stage2 when the target is protected from Basic attacks. Tiebreak deterministically.
 candidates.sort((a,b)=>Number(a.usesGX)-Number(b.usesGX)||
   (p.preventBasicAttackDamage?Number(b.attackerStage==='Stage2')-
     Number(a.attackerStage==='Stage2'):0)||
   (a.name==='Full Moon Rondo'?-1:0)-(b.name==='Full Moon Rondo'?-1:0)||
   a.name.localeCompare(b.name));
 const best=candidates[0];
 return {
  status:'priority-no-self-ko',reason:'PSYCHIC_X2_CERTIFIED_ONE_HIT',
  firstAction:{type:'attack',name:best.name,sourceToken:best.sourceToken},
  projected:best,alternates:candidates.slice(1),
  preventDusknoirCursedBlastThisRoot:true,
  continuation:'Reobserve native state; never spend self-KO Prize if this attack is still legal',
  evidence:'conditional actor-visible no-self-KO decision; no games or win-rate claim'
 };
}
module.exports={fairyZoneNoSelfKoPriority};

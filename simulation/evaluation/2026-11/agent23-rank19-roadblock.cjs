'use strict';
// Proactive rank19 Roadblock, restricted to held card and an offered root.
// Preserve at least one bench slot and an established main attacker.
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const SUDO=/^Sudowoodo GRI(?: 66)?$/;
const WOB=/^Wobbuffet PHF(?: 36)?$/;
const HOOD=/^Stealthy Hood UNB(?: 186)?$/;
const SKY=/^Sky Field ROS(?: 89)?$/;
const MAIN=/^(?:Raging Bolt ex TEF(?: 123)?|Arceus & Dialga & Palkia-? ?GX CEC(?: 156)?|Galarian Moltres V CRE(?: 97)?)$/;
const ability=(p,a)=>list(p?.abilitySuppressions).some(x=>x?.abilityName===a&&x.suppressed===false);
function root(r){
 const o=r?.observation,own=o?.ownPublic,foe=o?.opponentPublic;
 if(r?.role!=='opponent'||r.seat!==o?.actorSeat||!own?.active||!foe?.active||!Array.isArray(own.bench)||!Array.isArray(foe.bench)||!Array.isArray(own.stadium)||!Array.isArray(foe.stadium)||!Array.isArray(o.ownHand))return null;
 const b=own.bench.filter(Boolean),f=foe.bench.filter(Boolean);
 if([own.active,...b].some(p=>SUDO.test(name(p)))||![own.active,...b].some(p=>MAIN.test(name(p))))return null;
 // Wobbuffet suppresses the Fighting-type Roadblock while Bide Barricade
 // remains live. Unknown ability state is not evidence that it is disabled.
 if(WOB.test(name(foe.active))&&!list(foe.active.abilitySuppressions).some(x=>x?.abilityName==='Bide Barricade'&&x.suppressed===true))return null;
 // With the ordinary five-bench cap keep one spare position for a follow-up
 // attacker or support. Don't rely on Sky Field remaining in play.
 if(b.length>=4)return null;
 const sky=[...own.stadium,...foe.stadium].some(x=>SKY.test(name(x)))&&!(own.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0);
 // Cap before opponent reaches five; with Sky Field already live deploy
 // one slot earlier to constrain the much larger potential bench.
 if(f.length<(sky?3:4))return null;
 const a=list(r.actionFrontier?.items).find(x=>x.kind==='play-card'&&SUDO.test(name(x.actorPrinting))&&Number.isSafeInteger(x.publicMetadata?.handIndex)&&SUDO.test(name(o.ownHand[x.publicMetadata.handIndex]))&&x.publicMetadata?.targetSeat==='actor'&&x.publicMetadata?.targetZone==='bench');
 return a?{kind:'select-action',token:a.token}:null;
}
module.exports={root};

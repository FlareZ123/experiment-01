'use strict';
const assert=require('node:assert/strict');
const {createSlice}=require('../../simulation/evaluation/2026-11/agent22-newmoon-countercatcher-actor-sequence.cjs');
let checks=0;
const clone=x=>JSON.parse(JSON.stringify(x));
const f=()=>({
 seat:0,role:'candidate',
 observation:{actorSeat:0,globalTurn:8,decisionKind:'owner-root',
 ownHand:['Counter Catcher PAR160'],
 ownPublic:{prizeCount:3,active:{printing:'Mewtwo & Mew-GX UNM071'},
  bench:[{printing:'Dusknoir SFA020',abilities:['Cursed Blast'],
   abilitySuppressions:[{abilityName:'Cursed Blast',suppressed:false}]}],
  publicTurnRestrictions:{gxUsed:false}},
 opponentPublic:{prizeCount:3,
  active:{printing:'Galarian Zigzagoon SSH117',hp:70,damage:0,tools:[]},
  bench:[{printing:'Mega Lopunny ex PFL084',hp:330,damage:0,tools:[]}]}
 },
 prompt:null,
 actionFrontier:{items:[
  {kind:'use-ability',token:'blast',actorPrinting:'Dusknoir SFA020',
   publicMetadata:{abilityName:'Cursed Blast',sourceZone:'bench',sourceIndex:0}},
  {kind:'attack',token:'duo',attackName:'Miraculous Duo-GX',
   actorPrinting:'Mewtwo & Mew-GX UNM071',
   publicMetadata:{attackCostPayable:true,damageAfterResistance:200,
    attackSource:{sourceKind:'active-pokemon',sourceSlot:'ACTIVE',
     sourceCardFullName:'Mewtwo & Mew-GX UNM071'}}}
 ]}
});
function prompt(x,source,zone,damage){
 const r=clone(x);r.observation.decisionKind='owner-prompt';
 r.observation.opponentPublic.bench[0].damage=damage;
 r.actionFrontier=null;
 r.prompt={actingSeat:0,promptType:'ChoosePokemonPrompt',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:source==='Cursed Blast'?'Dusknoir SFA020':'Counter Catcher PAR160',
   effectName:source},
  publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
  choices:[
   {kind:'pokemon',token:'wrong-active',printing:'Galarian Zigzagoon SSH117',
    publicMetadata:{isOwnerVisible:true,ownerSeat:'opponent',
     targetZone:'active',slotIndex:0}},
   {kind:'pokemon',token:'bench-pick',
    printing:x.observation.opponentPublic.bench[0].printing,
    publicMetadata:{isOwnerVisible:true,ownerSeat:'opponent',
     targetZone:zone,benchIndex:0}}]
 };
 return r;
}
function stage(){
 const s=createSlice({seat:0});const q=f();
 let x=s.decide(q);
 assert.equal(x.decision.token,'blast');checks++;
 let p=prompt(q,'Cursed Blast','bench',0);
 x=s.decide(p);assert.deepEqual(x.decision.tokens,['bench-pick']);checks++;
 const post=clone(q);
 post.observation.opponentPublic.prizeCount=2;
 post.observation.opponentPublic.bench[0].damage=130;
 post.actionFrontier={items:[{kind:'play-card',token:'catch',
  actorPrinting:'Counter Catcher PAR160',
  publicMetadata:{cardType:'trainer',handIndex:0}}]};
 x=s.decide(post);assert.equal(x.decision.token,'catch');checks++;
 let gust=prompt(post,'Counter Catcher','bench',130);
 x=s.decide(gust);assert.deepEqual(x.decision.tokens,['bench-pick']);checks++;
 const finish=clone(post);
 finish.observation.opponentPublic.active=clone(post.observation.opponentPublic.bench[0]);
 finish.observation.opponentPublic.bench=[post.observation.opponentPublic.active];
 finish.actionFrontier={items:[clone(q.actionFrontier.items[1])]};
 finish.actionFrontier.items[0].publicMetadata.damageAfterResistance=200;
 x=s.decide(finish);assert.equal(x.decision.token,'duo');checks++;
 assert.equal(s.peek(),null);checks++;
 return {q,p,post,gust,finish};
}
const env=stage();
// Ensure same-turn state machine rejects a new actor, stale turn, changed
// target index/printing and unoffered Item rather than invent actions.
for(const tweak of [
 x=>{x.observation.actorSeat=1},
 x=>{x.observation.globalTurn=9},
 x=>{x.observation.opponentPublic.bench[0].printing='Mega Kangaskhan ex MEG104'},
 x=>{x.prompt.choices[1].publicMetadata.ownerSeat='actor'},
 x=>{x.prompt.choices[1].publicMetadata.benchIndex=1},
 x=>{x.prompt.source.effectName='Not Cursed Blast'},
 x=>{x.prompt.choices[1].publicMetadata.isOwnerVisible=false}
]){
 const s=createSlice({seat:0});s.decide(f());
 const p=clone(env.p);tweak(p);
 assert.equal(s.decide(p),null);checks++;
 assert.equal(s.peek(),null);checks++;
}
for(const tweak of [
 x=>{x.observation.opponentPublic.prizeCount=3},
 x=>{x.observation.opponentPublic.bench[0].damage=129},
 x=>{x.observation.ownPublic.active.printing='Lillie Clefairy ex'},
 x=>{x.actionFrontier.items=[]},
 x=>{x.observation.opponentPublic.bench[0].tools=['Stealthy Hood']}
]){
 const s=createSlice({seat:0});s.decide(f());s.decide(env.p);
 const post=clone(env.post);tweak(post);
 assert.equal(s.decide(post),null);checks++;
 assert.equal(s.peek(),null);checks++;
}
for(const tweak of [
 x=>{x.observation.opponentPublic.active.damage=120},
 x=>{x.actionFrontier.items=[]},
 x=>{x.actionFrontier.items[0].publicMetadata.attackCostPayable=false},
 x=>{x.actionFrontier.items[0].publicMetadata.damageAfterResistance=190},
 x=>{x.observation.ownPublic.publicTurnRestrictions.gxUsed=true}
]){
 const s=createSlice({seat:0});s.decide(f());s.decide(env.p);s.decide(env.post);s.decide(env.gust);
 const finish=clone(env.finish);tweak(finish);
 assert.equal(s.decide(finish),null);checks++;
 assert.equal(s.peek(),null);checks++;
}
for(const tweak of [
 x=>{x.observation.ownHand=[]},
 x=>{x.observation.ownPublic.prizeCount=2},
 x=>{x.observation.opponentPublic.prizeCount=1},
 x=>{x.observation.ownPublic.publicTurnRestrictions.gxUsed=true},
 x=>{x.observation.opponentPublic.bench[0].damage=205},
 x=>{x.observation.opponentPublic.bench[0].tools=['Stealthy Hood']},
 x=>{x.actionFrontier.items[1].publicMetadata.attackCostPayable=false},
 x=>{x.actionFrontier.items[0].publicMetadata.sourceZone='active'}
]){
 const s=createSlice({seat:0});const root=f();tweak(root);
 assert.equal(s.decide(root),null);checks++;
 assert.equal(s.peek(),null);checks++;
}

// Separate two-Prize tactical branch: tied 2-2 -> Cursed Blast selfKO
// makes source go 1 Prize; Item-gust a Benched 280 HP Regidrago VSTAR,
// then Perfection copies a Bench Trevenant & Dusknoir-GX Night Watch 150.
const regidrago=()=>{
 const q=f();
 q.observation.ownPublic.prizeCount=2;
 q.observation.opponentPublic.prizeCount=2;
 q.observation.ownPublic.publicTurnRestrictions.gxUsed=true;
 q.observation.ownPublic.stadium=[];
 q.observation.opponentPublic.stadium=[];
 q.observation.ownPublic.discard=[];
 q.observation.ownPublic.active.energies=[
  'Basic Psychic Energy SVE005','Basic Psychic Energy SVE005',
  'Basic Psychic Energy SVE005'];
 q.observation.ownPublic.active.specialConditions=[];
 q.observation.ownPublic.active.abilities=['Perfection'];
 q.observation.ownPublic.active.abilitySuppressions=[
  {abilityName:'Perfection',suppressed:false}];
 q.observation.ownPublic.bench.push({
  printing:'Trevenant & Dusknoir-GX SMP SM217',
  abilities:[],abilitySuppressions:[],tools:[],energies:[]});
 q.observation.opponentPublic.bench=[{
  printing:'Regidrago VSTAR SIT136',hp:280,damage:0,tools:[]}];
 q.actionFrontier.items[1]={
  kind:'use-ability',token:'perfection',
  actorPrinting:'Mewtwo & Mew-GX UNM071',
  publicMetadata:{abilityName:'Perfection',sourceZone:'active',
    sourceSeat:'actor',sourceIndex:0}
 };
 return q;
};
function nightPrompt(req){
 const q=clone(req);
 q.observation.decisionKind='owner-prompt';
 q.actionFrontier=null;
 q.prompt={actingSeat:0,promptType:'ChooseAttackPrompt',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:'Mewtwo & Mew-GX UNM071',effectName:'Perfection'},
  publicMetadata:{selectionType:'attack'},
  choices:[{kind:'attack',token:'nw',printing:'Trevenant & Dusknoir-GX SMP SM217',
   publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,sourceZone:'bench',
    sourceAttack:'Night Watch'}}]};
 return q;
}
const s2=createSlice({seat:0}),r2=regidrago();
let d=s2.decide(r2);
assert.equal(d.decision.token,'blast');checks++;
const dp=prompt(r2,'Cursed Blast','bench',0);
d=s2.decide(dp);assert.deepEqual(d.decision.tokens,['bench-pick']);checks++;
const after=clone(r2);after.observation.opponentPublic.prizeCount=1;
after.observation.opponentPublic.bench[0].damage=130;
after.actionFrontier={items:[{
 kind:'play-card',token:'cc2',actorPrinting:'Counter Catcher PAR160',
 publicMetadata:{cardType:'trainer',handIndex:0}}]};
d=s2.decide(after);assert.equal(d.decision.token,'cc2');checks++;
const dp2=prompt(after,'Counter Catcher','bench',130);
d=s2.decide(dp2);assert.deepEqual(d.decision.tokens,['bench-pick']);checks++;
const end=clone(after);
end.observation.opponentPublic.active=clone(after.observation.opponentPublic.bench[0]);
end.observation.opponentPublic.bench=[after.observation.opponentPublic.active];
end.actionFrontier={items:[clone(r2.actionFrontier.items[1])]};
d=s2.decide(end);assert.equal(d.decision.token,'perfection');checks++;
d=s2.decide(nightPrompt(end));
assert.equal(d.decision.token,'nw');checks++;
assert.equal(d.decision.kind,'select-choice');checks++;
assert.equal(s2.peek(),null);checks++;
// Stop before spending the Stage2 if Perfection is suppressed or donor
// provenance is not an actual supported Benched Trev-Dusk GX.
for(const tweak of [
 q=>{q.observation.ownPublic.active.abilitySuppressions[0].suppressed=true},
 q=>{q.observation.ownPublic.bench[1].printing='Gengar & Mimikyu-GX'},
 q=>{q.actionFrontier.items[1].publicMetadata.sourceIndex=1},
 q=>{q.actionFrontier.items[1].publicMetadata.sourceZone='bench'},
 q=>{q.observation.ownPublic.active.energies=[]},
 q=>{q.observation.opponentPublic.bench[0].damage=150},
 q=>{q.observation.ownPublic.prizeCount=1}
]){
 const z=createSlice({seat:0}),q=regidrago();tweak(q);
 assert.equal(z.decide(q),null);checks++;
}

// Damage prevention on the OLD opponent Active is not automatically a
// permanent Basic-attack prohibition after gusting a different defender.
// Actual post-gust offer/damage must still independently certify success.
{
 const s=createSlice({seat:0}),q=regidrago();
 // The opponent Active can prevent Basic damage; only post-gust matters.
 q.observation.opponentPublic.active.abilities=['Prevent Basic Damage'];
 assert.equal(s.decide(q).decision.token,'blast');checks++;
 const p=prompt(q,'Cursed Blast','bench',0);
 assert.equal(s.decide(p).decision.tokens[0],'bench-pick');checks++;
 const post=clone(q);post.observation.opponentPublic.prizeCount=1;
 post.observation.opponentPublic.bench[0].damage=130;
 post.actionFrontier.items=[{kind:'play-card',token:'catchAfterBarrier',
  actorPrinting:'Counter Catcher PAR160',
  publicMetadata:{cardType:'trainer',handIndex:0}}];
 assert.equal(s.decide(post).decision.token,'catchAfterBarrier');checks++;
 assert.equal(s.decide(prompt(post,'Counter Catcher','bench',130)).decision.tokens[0],
  'bench-pick');checks++;
 const now=clone(post);
 now.observation.opponentPublic.active=clone(post.observation.opponentPublic.bench[0]);
 now.observation.opponentPublic.bench=[post.observation.opponentPublic.active];
 now.actionFrontier.items=[clone(q.actionFrontier.items[1])];
 assert.equal(s.decide(now).decision.token,'perfection');checks++;
 assert.equal(s.decide(nightPrompt(now)).decision.token,'nw');checks++;
 const bad=createSlice({seat:0});
 bad.decide(q);bad.decide(p);bad.decide(post);
 bad.decide(prompt(post,'Counter Catcher','bench',130));
 const noOffer=clone(now);noOffer.actionFrontier.items=[];
 assert.equal(bad.decide(noOffer),null);checks++;
}

// Five original Aichi ranks carry Mega Absol ex 280 HP, 3 Prizes; a
// 130+200 selfKO-enabled Counter Catcher route is physical if funded.
{
 const a=f();a.observation.opponentPublic.bench[0]={
  printing:'Mega Absol ex ME1086',hp:280,damage:0,tools:[]};
 const s=createSlice({seat:0});
 assert.equal(s.decide(a).decision.token,'blast');checks++;
 assert.equal(s.decide(prompt(a,'Cursed Blast','bench',0)).decision.tokens[0],
  'bench-pick');checks++;
 const after=clone(a);after.observation.opponentPublic.prizeCount=2;
 after.observation.opponentPublic.bench[0].damage=130;
 after.actionFrontier.items=[{kind:'play-card',token:'catchAbsol',
  actorPrinting:'Counter Catcher PAR160',
  publicMetadata:{cardType:'trainer',handIndex:0}}];
 assert.equal(s.decide(after).decision.token,'catchAbsol');checks++;
 assert.equal(s.decide(prompt(after,'Counter Catcher','bench',130)).
   decision.tokens[0],'bench-pick');checks++;
 const finish=clone(after);
 finish.observation.opponentPublic.active=clone(after.observation.opponentPublic.bench[0]);
 finish.observation.opponentPublic.bench=[after.observation.opponentPublic.active];
 finish.actionFrontier.items=[clone(a.actionFrontier.items[1])];
 assert.equal(s.decide(finish).decision.token,'duo');checks++;
}
// Dragonite has 370 HP, 3 Prizes. Full HP is not accessible by 130+200
// unless actor-observed, unsuppressed Fairy Zone changes its Dragon Weakness
// to Psychic; after gust native 400 damage must still be offered.
{
 const dragon=()=>{
  const a=f();a.observation.opponentPublic.bench[0]={
   printing:'Mega Dragonite ex ASC152',hp:370,damage:0,tools:[],
   printed:{types:['Dragon']}};
  a.observation.ownPublic.bench.push({
   printing:"Lillie's Clefairy ex JTG056",abilities:['Fairy Zone'],
   abilitySuppressions:[{abilityName:'Fairy Zone',suppressed:false}]});
  return a;
 };
 const a=dragon(),s=createSlice({seat:0});
 assert.equal(s.decide(a).decision.token,'blast');checks++;
 assert.equal(s.decide(prompt(a,'Cursed Blast','bench',0)).decision.tokens[0],
  'bench-pick');checks++;
 const after=clone(a);after.observation.opponentPublic.prizeCount=2;
 after.observation.opponentPublic.bench[0].damage=130;
 after.actionFrontier.items=[{kind:'play-card',token:'catchDragon',
  actorPrinting:'Counter Catcher PAR160',
  publicMetadata:{cardType:'trainer',handIndex:0}}];
 assert.equal(s.decide(after).decision.token,'catchDragon');checks++;
 assert.equal(s.decide(prompt(after,'Counter Catcher','bench',130)).
  decision.tokens[0],'bench-pick');checks++;
 const finish=clone(after);
 finish.observation.opponentPublic.active=clone(after.observation.opponentPublic.bench[0]);
 finish.observation.opponentPublic.bench=[after.observation.opponentPublic.active];
 finish.actionFrontier.items=[clone(a.actionFrontier.items[1])];
 finish.actionFrontier.items[0].publicMetadata.damageAfterResistance=400;
 assert.equal(s.decide(finish).decision.token,'duo');checks++;
 for(const adjust of [
  q=>{q.observation.ownPublic.bench[1].abilitySuppressions[0].suppressed=true},
  q=>{q.observation.ownPublic.bench[1].abilities=[]},
  q=>{q.observation.opponentPublic.bench[0].printed.types=['Psychic']}
 ]){
  const z=createSlice({seat:0}),q=dragon();adjust(q);
  assert.equal(z.decide(q),null);checks++;
 }
 const without=dragon();without.observation.ownPublic.bench.pop();
 without.observation.opponentPublic.bench[0].damage=40;
 assert.equal(createSlice({seat:0}).decide(without).decision.token,'blast');checks++;
}

// Native action-frontier does not expose damageAfterResistance. The printed
// Miraculous Duo-GX 200 branch can still propose a conditional paper win
// when visible original printing has 200, no Stadium/Tools/Resistance, and
// the post-gust nominal 200 reaches remaining HP. Do not call it verified.
{
 const clean=f();
 clean.observation.ownPublic.stadium=[];
 clean.observation.opponentPublic.stadium=[];
 clean.observation.ownPublic.active.tools=[];
 clean.observation.ownPublic.active.attacks=[{
  name:'Miraculous Duo-GX',damage:200}];
 clean.observation.opponentPublic.bench[0].printed={resistance:[]};
 delete clean.actionFrontier.items[1].publicMetadata.damageAfterResistance;
 const s=createSlice({seat:0});
 assert.equal(s.decide(clean).decision.token,'blast');checks++;
 assert.equal(s.decide(prompt(clean,'Cursed Blast','bench',0)).
   decision.tokens[0],'bench-pick');checks++;
 const post=clone(clean);post.observation.opponentPublic.prizeCount=2;
 post.observation.opponentPublic.bench[0].damage=130;
 post.actionFrontier.items=[{
  kind:'play-card',token:'catchNative',
  actorPrinting:'Counter Catcher PAR',
  publicMetadata:{cardType:'trainer',handIndex:0}}];
 assert.equal(s.decide(post).decision.token,'catchNative');checks++;
 assert.equal(s.decide(prompt(post,'Counter Catcher','bench',130)).
   decision.tokens[0],'bench-pick');checks++;
 const final=clone(post);
 final.observation.opponentPublic.active=clone(post.observation.opponentPublic.bench[0]);
 final.observation.opponentPublic.bench=[post.observation.opponentPublic.active];
 final.actionFrontier.items=[clone(clean.actionFrontier.items[1])];
 const a=s.decide(final);
 assert.equal(a.decision.token,'duo');checks++;
 assert.equal(a.reason,'A22_MIRACULOUS_GX_PRINTED_BASE_CONDITIONAL_TERMINAL');checks++;
 const sUnknown=createSlice({seat:0});
 sUnknown.decide(clean);sUnknown.decide(prompt(clean,'Cursed Blast','bench',0));
 sUnknown.decide(post);sUnknown.decide(prompt(post,'Counter Catcher','bench',130));
 const modified=clone(final);modified.observation.ownPublic.stadium=['Temple of Sinnoh ASR'];
 assert.equal(sUnknown.decide(modified),null);checks++;
}
// Perfection donor can be physically in discard, which is explicitly allowed
// by the printed ability and produces an owner-visible ChooseAttackPrompt.
// Synthetic direct BENCH_ATTACK Night Watch is *not* a native source action.
{
 const q=regidrago(),s=createSlice({seat:0});
 q.observation.ownPublic.bench.pop();
 q.observation.ownPublic.discard=['Trevenant & Dusknoir-GX SMP SM217'];
 assert.equal(s.decide(q).decision.token,'blast');checks++;
 const p=prompt(q,'Cursed Blast','bench',0);
 assert.equal(s.decide(p).decision.tokens[0],'bench-pick');checks++;
 const post=clone(q);post.observation.opponentPublic.prizeCount=1;
 post.observation.opponentPublic.bench[0].damage=130;
 post.actionFrontier.items=[{
  kind:'play-card',token:'catchDiscard',
  actorPrinting:'Counter Catcher PAR',
  publicMetadata:{cardType:'trainer',handIndex:0}}];
 assert.equal(s.decide(post).decision.token,'catchDiscard');checks++;
 assert.equal(s.decide(prompt(post,'Counter Catcher','bench',130)).
  decision.tokens[0],'bench-pick');checks++;
 const finish=clone(post);
 finish.observation.opponentPublic.active=clone(post.observation.opponentPublic.bench[0]);
 finish.observation.opponentPublic.bench=[post.observation.opponentPublic.active];
 finish.actionFrontier.items=[clone(q.actionFrontier.items[1])];
 assert.equal(s.decide(finish).decision.token,'perfection');checks++;
 const choose=nightPrompt(finish);
 choose.prompt.choices[0].publicMetadata.sourceZone='discard';
 assert.equal(s.decide(choose).decision.token,'nw');checks++;
 const fake=regidrago();
 fake.actionFrontier.items[1]={
  kind:'attack',token:'fakeNight',
  actorPrinting:'Trevenant & Dusknoir-GX SMP SM217',
  attackName:'Night Watch',
  publicMetadata:{attackCostPayable:true,attackSource:{
   sourceKind:'bench-pokemon',sourceSlot:'BENCH',sourceIndex:1,
   sourceCardFullName:'Trevenant & Dusknoir-GX SMP SM217',
   attackName:'Night Watch'}}
 };
 assert.equal(createSlice({seat:0}).decide(fake),null);checks++;
 const temple=regidrago();
 temple.observation.ownPublic.active.energies=[
   'Telepathic Psychic Energy ME388',
   'Telepathic Psychic Energy ME388',
   'Telepathic Psychic Energy ME388'];
 temple.observation.opponentPublic.stadium=['Temple of Sinnoh ASR'];
 assert.equal(createSlice({seat:0}).decide(temple),null);checks++;
 const notEnough=regidrago();
 notEnough.observation.ownPublic.active.energies=[
   'Basic Psychic Energy SVE005','Basic Psychic Energy SVE005'];
 assert.equal(createSlice({seat:0}).decide(notEnough),null);checks++;
}

// Already-behind 3-2: Counter Catcher is technically legal before Blast,
// but a full-HP Mega 330 survives direct printed 200. Cursed Blast first
// sets up 130, awards opponent only their second-to-last Prize (now 3-1),
// and then Item gust + 200 takes our final three. This is an additional
// tactical branch, not a claim the selfKO newly enabled the Item.
{
 const q=f(),s=createSlice({seat:0});
 q.observation.opponentPublic.prizeCount=2;
 q.actionFrontier.items.unshift({
  kind:'play-card',token:'ccAlreadyLegal',
  actorPrinting:'Counter Catcher PAR',
  publicMetadata:{cardType:'trainer',handIndex:0}});
 const action=s.decide(q);
 assert.equal(action.decision.token,'blast');checks++;
 assert.equal(action.reason,
  'A22_BEGIN_BLAST_TO_DAMAGE_FOR_ALREADY_LEGAL_COUNTERCATCHER');checks++;
 assert.equal(s.decide(prompt(q,'Cursed Blast','bench',0)).
  decision.tokens[0],'bench-pick');checks++;
 const post=clone(q);post.observation.opponentPublic.prizeCount=1;
 post.observation.opponentPublic.bench[0].damage=130;
 post.actionFrontier.items=[q.actionFrontier.items[0]];
 assert.equal(s.decide(post).decision.token,'ccAlreadyLegal');checks++;
 assert.equal(s.decide(prompt(post,'Counter Catcher','bench',130)).
  decision.tokens[0],'bench-pick');checks++;
 const end=clone(post);
 end.observation.opponentPublic.active=clone(post.observation.opponentPublic.bench[0]);
 end.observation.opponentPublic.bench=[post.observation.opponentPublic.active];
 end.actionFrontier.items=[clone(q.actionFrontier.items[2])];
 assert.equal(s.decide(end).decision.token,'duo');checks++;
}

// Tied 2-2 is the high-impact Cursed Blast unlock against ubiquitous
// 2-Prize *Benched support* Pokémon. The singleton Stage2 + GX might still
// be expensive to establish, but this is a legal final Prize route without
// requiring a Mega/VSTAR damage threshold.
{
 const support=[
  ['Dedenne-GX',160],['Tapu Lele-GX',170],
  ['Squawkabilly ex',160],['Crobat V',180],
  ['Genesect V',190],['Pidgeot ex',280],
  ['Articuno-GX',170],['Rotom V',190],
  ['Iron Thorns ex',230]];
 for(const [name,hp] of support){
  const q=f();q.observation.ownPublic.prizeCount=2;
  q.observation.opponentPublic.prizeCount=2;
  q.observation.opponentPublic.bench[0]={
   printing:name+' source-verified',hp,damage:0,tools:[]};
  const s=createSlice({seat:0});
  assert.equal(s.decide(q).decision.token,'blast');checks++;
 }
 const q=f(),s=createSlice({seat:0});
 q.observation.ownPublic.prizeCount=2;
 q.observation.opponentPublic.prizeCount=2;
 q.observation.opponentPublic.bench[0]={
  printing:'Dedenne-GX UNB057',hp:160,damage:0,tools:[]};
 assert.equal(s.decide(q).decision.token,'blast');checks++;
 assert.equal(s.decide(prompt(q,'Cursed Blast','bench',0)).
  decision.tokens[0],'bench-pick');checks++;
 const post=clone(q);post.observation.opponentPublic.prizeCount=1;
 post.observation.opponentPublic.bench[0].damage=130;
 post.actionFrontier.items=[{kind:'play-card',token:'ccDedenne',
  actorPrinting:'Counter Catcher PAR160',
  publicMetadata:{cardType:'trainer',handIndex:0}}];
 assert.equal(s.decide(post).decision.token,'ccDedenne');checks++;
 assert.equal(s.decide(prompt(post,'Counter Catcher','bench',130)).
  decision.tokens[0],'bench-pick');checks++;
 const finish=clone(post);
 finish.observation.opponentPublic.active=clone(post.observation.opponentPublic.bench[0]);
 finish.observation.opponentPublic.bench=[post.observation.opponentPublic.active];
 finish.actionFrontier.items=[clone(q.actionFrontier.items[1])];
 assert.equal(s.decide(finish).decision.token,'duo');checks++;
 assert.equal(s.peek(),null);checks++;
}
assert.equal(checks,129);
console.log('Agent22 actor-countercatcher exact multi-prompt slice: '+checks+' synthetic checks passed');

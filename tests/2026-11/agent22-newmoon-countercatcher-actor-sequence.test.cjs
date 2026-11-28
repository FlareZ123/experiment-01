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
    printing:q.observation.opponentPublic.bench[0].printing,
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
 q.observation.ownPublic.active.abilities=['Perfection'];
 q.observation.ownPublic.active.abilitySuppressions=[
  {abilityName:'Perfection',suppressed:false}];
 q.observation.ownPublic.bench.push({
  printing:'Trevenant & Dusknoir-GX SMP SM217',
  abilities:[],abilitySuppressions:[],tools:[],energies:[]});
 q.observation.opponentPublic.bench=[{
  printing:'Regidrago VSTAR SIT136',hp:280,damage:0,tools:[]}];
 q.actionFrontier.items[1]={
  kind:'attack',token:'night',attackName:'Night Watch',
  actorPrinting:'Trevenant & Dusknoir-GX SMP SM217',
  publicMetadata:{attackCostPayable:true,damageAfterResistance:150,
   attackSource:{sourceKind:'bench-pokemon',sourceSlot:'BENCH',
    sourceIndex:1,sourceCardFullName:'Trevenant & Dusknoir-GX SMP SM217',
    attackName:'Night Watch'}}
 };
 return q;
};
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
d=s2.decide(end);assert.equal(d.decision.token,'night');checks++;
assert.equal(s2.peek(),null);checks++;
// Stop before spending the Stage2 if Perfection is suppressed or donor
// provenance is not an actual supported Benched Trev-Dusk GX.
for(const tweak of [
 q=>{q.observation.ownPublic.active.abilitySuppressions[0].suppressed=true},
 q=>{q.observation.ownPublic.bench[1].printing='Gengar & Mimikyu-GX'},
 q=>{q.actionFrontier.items[1].publicMetadata.attackSource.sourceIndex=0},
 q=>{q.actionFrontier.items[1].publicMetadata.attackCostPayable=false},
 q=>{q.observation.opponentPublic.bench[0].damage=150},
 q=>{q.observation.ownPublic.prizeCount=1}
]){
 const z=createSlice({seat:0}),q=regidrago();tweak(q);
 assert.equal(z.decide(q),null);checks++;
}
assert.equal(checks,68);
console.log('Agent22 actor-countercatcher exact multi-prompt slice: '+checks+' synthetic checks passed');

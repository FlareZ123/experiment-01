'use strict';
const assert=require('node:assert/strict');
const {createAbilityTerminalSlice,targetPrizeValue,qualifyingTarget}=
 require('../../simulation/evaluation/2026-11/agent22-newmoon-ability-only-terminal.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
let checks=0;
const base=()=>({
 role:'candidate',seat:0,prompt:null,
 observation:{actorSeat:0,globalTurn:13,decisionKind:'owner-root',
  ownPublic:{prizeCount:5,active:{printing:'Mewtwo & Mew-GX UNM'},
   bench:[{printing:'Dusknoir SFA',abilities:['Cursed Blast'],
    abilitySuppressions:[{abilityName:'Cursed Blast',suppressed:false}]}]},
  opponentPublic:{prizeCount:2,
   active:{printing:'Mimikyu PAL',hp:70,damage:0,tools:[]},
   bench:[]}},
 actionFrontier:{items:[{kind:'use-ability',token:'dusk',
  actorPrinting:'Dusknoir SFA',
  publicMetadata:{abilityName:'Cursed Blast',sourceZone:'bench',
   sourceSeat:'actor',sourceIndex:0}}]}
});
const prompt=(q,which='active')=>{
 const x=clone(q);x.observation.decisionKind='owner-prompt';
 x.actionFrontier=null;
 x.prompt={actingSeat:0,promptType:'ChoosePokemonPrompt',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:'Dusknoir SFA',effectName:'Cursed Blast'},
  publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
  choices:[{kind:'pokemon',token:'opp-target',
   printing:which==='active'?
     x.observation.opponentPublic.active.printing:
     x.observation.opponentPublic.bench[0].printing,
   publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,
    targetZone:which,benchIndex:0}}]};
 return x;
};
{
 const q=base(),s=createAbilityTerminalSlice({seat:0});
 let x=s.decide(q);assert.equal(x.decision.token,'dusk');checks++;
 assert.equal(x.projectedTerminalMode,'no-opponent-pokemon');checks++;
 x=s.decide(prompt(q));assert.equal(x.decision.tokens[0],'opp-target');checks++;
 assert.equal(x.reason,'A22_BLAST_LAST_OPPONENT_POKEMON_WIN_PROMPT');checks++;
 assert.equal(s.peek(),null);checks++;
}
{
 // Opponent has other Pokemon but the known Mega is an exact 3 Prize KO:
 // own 3 Prizes left, Dusk selfKO awards opponent 1 (not their last).
 const q=base();q.observation.ownPublic.prizeCount=3;
 q.observation.opponentPublic.bench=[{
  printing:'Mega Absol ex MEG',hp:280,damage:150,tools:[]}];
 const s=createAbilityTerminalSlice({seat:0});
 let x=s.decide(q);assert.equal(x.decision.token,'dusk');checks++;
 assert.equal(x.projectedTerminalMode,'all-prizes');checks++;
 x=s.decide(prompt(q,'bench'));
 assert.equal(x.decision.tokens[0],'opp-target');checks++;
 assert.equal(x.reason,'A22_BLAST_FINAL_PRIZE_WIN_PROMPT');checks++;
}
// Any opponent Pokemon KO is a final Prize when our Prize count is one.
{
 const q=base();q.observation.ownPublic.prizeCount=1;
 q.observation.opponentPublic.bench=[{printing:'Pikachu SSH',hp:60,
  damage:0,tools:[]}];
 const s=createAbilityTerminalSlice({seat:0});
 const x=s.decide(q);
 assert.equal(x.decision.token,'dusk');checks++;
 assert.equal(x.projectedTerminalMode,'all-prizes');checks++;
}
const badRoot=[
 q=>{q.observation.opponentPublic.prizeCount=1},
 q=>{q.observation.ownPublic.active=null},
 q=>{q.observation.ownPublic.bench=[]},
 q=>{q.observation.ownPublic.bench[0].abilitySuppressions[0].suppressed=true},
 q=>{q.actionFrontier.items=[]},
 q=>{q.observation.opponentPublic.active.damage=0;
     q.observation.opponentPublic.active.hp=200},
 q=>{q.observation.opponentPublic.active.tools=['Stealthy Hood']},
 q=>{q.observation.opponentPublic.bench=[{printing:'Snorlax PGO',hp:150,
  damage:0,tools:[]}]},
 q=>{q.observation.ownPublic.prizeCount=0},
 q=>{q.role='opponent'},
 q=>{q.seat=1},
 q=>{q.observation.actorSeat=1}
];
for(const change of badRoot){
 const q=base(),s=createAbilityTerminalSlice({seat:0});change(q);
 assert.equal(s.decide(q),null);checks++;
 assert.equal(s.peek(),null);checks++;
}
const badPrompt=[
 q=>{q.observation.globalTurn=14},
 q=>{q.observation.actorSeat=1},
 q=>{q.prompt.actingSeat=1},
 q=>{q.prompt.source.sourcePrinting='Other'},
 q=>{q.prompt.source.effectName='Other'},
 q=>{q.prompt.choices=[]},
 q=>{q.prompt.choices[0].publicMetadata.targetZone='bench'},
 q=>{q.prompt.choices[0].publicMetadata.ownerSeat='actor'},
 q=>{q.prompt.choices[0].printing='Pikachu'},
 q=>{q.observation.opponentPublic.active.damage=0;
     q.observation.opponentPublic.active.hp=200},
 q=>{q.observation.opponentPublic.active.tools=['Stealthy Hood']},
 q=>{q.observation.opponentPublic.bench=[{printing:'Rattata',hp:40,damage:0,tools:[]}]},
 q=>{q.prompt.publicMetadata.minimumCount=0},
 q=>{q.prompt.source.classification='host-only'}
];
for(const change of badPrompt){
 const q=base(),s=createAbilityTerminalSlice({seat:0});s.decide(q);
 const p=prompt(q);change(p);
 assert.equal(s.decide(p),null);checks++;
 assert.equal(s.peek(),null);checks++;
}
assert.equal(targetPrizeValue({printing:'Regidrago VSTAR SIT',hp:280}),2);checks++;
assert.equal(targetPrizeValue({printing:'Mega Absol ex MEG',hp:280}),3);checks++;
assert.equal(targetPrizeValue({printing:'Pikachu',hp:60}),null);checks++;
assert.equal(qualifyingTarget({printing:'Pikachu',hp:60,damage:0,tools:[]},
 1,false,false).mode,'all-prizes');checks++;
assert.equal(qualifyingTarget({printing:'Pikachu',hp:60,damage:0,tools:[]},
 5,true,true).mode,'no-opponent-pokemon');checks++;
// The native USE_ABILITY_ACTION token certifies availability even when the
// public observation's suppression flag remains unknown (null).
{
 const q=base();q.observation.ownPublic.bench[0].
  abilitySuppressions[0].suppressed=null;
 const s=createAbilityTerminalSlice({seat:0});
 assert.equal(s.decide(q).decision.token,'dusk');checks++;
 assert.equal(s.decide(prompt(q)).decision.tokens[0],'opp-target');checks++;
}
assert.equal(checks,70);
console.log('Agent22 Cursed Blast ability-only game finish: '+
 checks+' actor contracts passed');

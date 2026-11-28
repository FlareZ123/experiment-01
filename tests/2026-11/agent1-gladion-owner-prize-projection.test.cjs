'use strict';
const assert=require('node:assert/strict');
const {projectPromptWithGladionOwnerPrize,VERSION}=
 require('../../simulation/twinleaf/agent1-gladion-owner-prize-projection.cjs');
const P=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
let n=0;
function same(a,b,msg){assert.deepEqual(a,b,msg);n++}
function fixture(type='ChoosePrizePrompt',seat=0){
 class ChoosePrizePrompt {
  constructor(){this.playerId='actor';this.id=14;this.result=undefined;
   this.message='CHOOSE_PRIZE_CARD';this.options={
    useOpponentPrizes:false,count:1,blocked:[],allowCancel:false,isSecret:true};}
  getPerspectivePlayerId(){return 'actor'}
 }
 class ChooseCardsPrompt {
  constructor(){this.playerId='actor';this.id=14;this.result=undefined;
   this.message='CHOOSE_CARDS';this.options={
    min:1,max:1,blocked:[],allowCancel:false,isSecret:true};}
  getPerspectivePlayerId(){return 'actor'}
 }
 const source={fullName:'Gladion CIN 95'};
 const others=Array.from({length:5},(_,i)=>({fullName:'Other '+i}));
 const protectedPrize={fullName:'Dusknoir SFA 020'};
 const slots=[protectedPrize,...others].map(card=>({
  cards:[card],faceUpPrize:false}));
 const oppPrize={fullName:'Opponent Secret Pokemon 999'};
 const blank={cards:[]};
 const own={id:'actor',hand:blank,deck:blank,discard:blank,
  lostzone:blank,stadium:blank,supporter:{cards:[source]},
  active:blank,bench:[],prizes:slots};
 const opp={id:'other',hand:blank,deck:blank,discard:blank,
  lostzone:blank,stadium:blank,supporter:blank,
  active:blank,bench:[],prizes:[{cards:[oppPrize],faceUpPrize:false}]};
 const state={players:seat===0?[own,opp]:[opp,own],phase:3};
 const prompt=type==='ChooseCardsPrompt'?new ChooseCardsPrompt():new ChoosePrizePrompt();
 if(type==='ChooseCardsPrompt')prompt.cards={cards:slots.map(p=>p.cards[0])};
 const provenanceHook={getPromptProvenance:()=>({
  sourceKind:'card-effect',effectName:'Gladion',sourceCard:source})};
 const args={prompt,state,actorSeat:seat,
  provenanceHook,canonicalProjectPrompt:()=>({delegated:true})};
 return {args,source,own,opp,oppPrize,prompt,provenanceHook};
}
function run(name,fn){try{fn()}catch(e){throw Error(name+': '+e.message)}}
run('source-attested own facedown Prize selector with bounded native raw index',()=>{
 const f=fixture('ChoosePrizePrompt',0);
 const before=JSON.stringify(f.args.state);
 const out=projectPromptWithGladionOwnerPrize(f.args);
 same(out.hostOnly,false);
 same(out.promptProjection.source.effectName,'Gladion');
 same(out.promptProjection.publicMetadata.selectionType,'prize-slots');
 same(out.promptProjection.publicMetadata.isOwnerVisible,true);
 same(out.promptProjection.choices[0].kind,'prize');
 same(out.promptProjection.choices[0].printing,'Dusknoir SFA 020');
 same(out.choiceByToken.get('prompt-0'),0);
 same(out.promptProjection.choices.some(x=>x.printing===f.oppPrize.fullName),false);
 same(out.diagnostics.opponentPrizeFacesRead,false);
 same(out.diagnostics.version,VERSION);
 same(JSON.stringify(f.args.state),before);
 P.validatePrompt(out.promptProjection,0);n++;
});
run('acting seat one symmetric owner-only selection',()=>{
 const f=fixture('ChoosePrizePrompt',1);
 const out=projectPromptWithGladionOwnerPrize(f.args);
 same(out.promptProjection.actingSeat,1);
 same(out.promptProjection.choices[0].printing,'Dusknoir SFA 020');
});
run('Gladion owner-visible ChooseCardsPrompt prize-list variant',()=>{
 const f=fixture('ChooseCardsPrompt');
 const out=projectPromptWithGladionOwnerPrize(f.args);
 same(out.promptProjection.promptType,'ChooseCardsPrompt');
 same(out.promptProjection.publicMetadata.selectionType,'card-combination');
 same(out.promptProjection.choices[0].kind,'card');
 same(out.promptProjection.choices[0].printing,'Dusknoir SFA 020');
 same(out.choiceByToken.get('prompt-0'),0);
 P.validatePrompt(out.promptProjection,0);n++;
});
run('normal owner Prize selection never shows concealed faces',()=>{
 const f=fixture();
 f.args.provenanceHook=null;
 same(projectPromptWithGladionOwnerPrize(f.args).delegated,true);
});
run('wrong source effect cannot unlock owner Prize faces',()=>{
 const f=fixture();
 f.args.provenanceHook={getPromptProvenance:()=>({
  sourceKind:'card-effect',effectName:'Boss Orders',sourceCard:f.source})};
 same(projectPromptWithGladionOwnerPrize(f.args).delegated,true);
});
run('attested source must actually be in acting owner Supporter zone',()=>{
 const f=fixture();f.own.supporter.cards=[];
 same(projectPromptWithGladionOwnerPrize(f.args).delegated,true);
});
run('opponent controlled source cannot expose acting owner Prize',()=>{
 const f=fixture();f.own.supporter.cards=[];f.opp.supporter.cards=[f.source];
 same(projectPromptWithGladionOwnerPrize(f.args).delegated,true);
});
run('wrong prompted owner seat remains hidden',()=>{
 const f=fixture();f.prompt.playerId='other';
 same(projectPromptWithGladionOwnerPrize(f.args).delegated,true);
});
run('opponent-targeted Prize attempt rejected without reading Prize faces',()=>{
 const f=fixture();f.prompt.options.useOpponentPrizes=true;
 let error;try{projectPromptWithGladionOwnerPrize(f.args)}catch(e){error=e}
 same(error?.code,'GLADION_OWNER_PRIZE_PROMPT_UNSUPPORTED');
});
run('unsupported count cannot authoritatively reveal Prize faces',()=>{
 const f=fixture();f.prompt.options.count=2;
 let error;try{projectPromptWithGladionOwnerPrize(f.args)}catch(e){error=e}
 same(error?.code,'GLADION_OWNER_PRIZE_PROMPT_UNSUPPORTED');
});
run('owner Prize prompt is secret to opponent but usable by owner',()=>{
 const f=fixture();f.prompt.options.isSecret=true;
 same(projectPromptWithGladionOwnerPrize(f.args).promptProjection.choices[0].printing,
 'Dusknoir SFA 020');
});
run('malicious ChooseCardsPrompt containing opponent Prize card fails closed',()=>{
 const f=fixture('ChooseCardsPrompt');
 f.prompt.cards.cards[1]=f.oppPrize;
 let error;try{projectPromptWithGladionOwnerPrize(f.args)}catch(e){error=e}
 same(error?.code,'GLADION_OWNER_PRIZE_PROMPT_UNSUPPORTED');
});
run('unknown or cancelled native source cannot authoritatively show faces',()=>{
 const f=fixture();f.prompt.options.allowCancel=true;
 same(projectPromptWithGladionOwnerPrize(f.args).delegated,true);
});
console.log('Gladion owner Prize source-attestation projection: '+n+' assertions passed');

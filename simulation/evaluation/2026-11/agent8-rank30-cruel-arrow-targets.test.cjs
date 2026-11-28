'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const policy=require('./agent8-rank30-clefairy-opponent-policy.cjs');
const protocol=require('./agent49-policy-protocol.cjs');
const FEZ='Fezandipiti ex ASC 142';
function request(seat,{bench=true,targetUnknown=false,darkWeak=true,prizes=3}={}){
  const active={printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,
    damage:140,printed:{weakness:darkWeak?[{type:'Darkness',value:'×2'}]:[]},
    ...(targetUnknown?{effectUnknown:true}:{})};
  const opponentBench=bench?[{printing:'Unown AOR 30',hp:60,damage:0},
    {printing:'Crobat V DAA 104',hp:180,damage:110}]:[];
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:6,ownHand:[],
      ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,vstarUsed:true},
      ownPublic:{active:{printing:FEZ,energies:Array(3).fill('Psychic Energy MEE 13')},
        bench:[],prizeCount:prizes,deckCount:24,discard:[]},
      opponentPublic:{active,bench:opponentBench,prizeCount:3,deckCount:25}},
    actionFrontier:{items:[{kind:'attack',actorPrinting:FEZ,
      attackName:'Cruel Arrow',token:'arrow'},{kind:'pass',token:'pass'}]}};
}
function root(seat,request){return policy.createPolicy({role:'opponent',seat,
  policyVersion:policy.POLICY_VERSION,config:{}}).decide(request);}
function prompt(req){
  const seat=req.seat;
  const rows=[{kind:'pokemon',token:'bench0',printing:'Unown AOR 30',
    publicMetadata:{selectionType:'pokemon',selectionIndex:0,selectedCount:1,
      ownerSeat:'opponent',targetZone:'bench',benchIndex:0,isOwnerVisible:true}},
  {kind:'pokemon',token:'active',printing:'Shadow Rider Calyrex VMAX CRE 75',
    publicMetadata:{selectionType:'pokemon',selectionIndex:1,selectedCount:1,
      ownerSeat:'opponent',targetZone:'active',slotIndex:0,isOwnerVisible:true}},
  {kind:'pokemon',token:'bench1',printing:'Crobat V DAA 104',
    publicMetadata:{selectionType:'pokemon',selectionIndex:2,selectedCount:1,
      ownerSeat:'opponent',targetZone:'bench',benchIndex:1,isOwnerVisible:true}}];
  return {schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChoosePokemonPrompt',description:'CHOOSE_POKEMON',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:FEZ,effectName:'Cruel Arrow'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      targetZone:'active,bench',allowCancel:false,isSecret:false},
    choices:rows.filter(x=>req.observation.opponentPublic.bench.length>0||
      x.publicMetadata.targetZone==='active')};
}
for(const seat of [0,1]){
  test('seat '+seat+' attacks with Cruel Arrow when VMAX Dark-weak Active is KO',()=>{
    const req=request(seat);
    assert.deepEqual(root(seat,req),{kind:'select-action',token:'arrow'});
    assert.equal(policy.cruelArrowKOTargets(req.observation)[0].printing,
      'Shadow Rider Calyrex VMAX CRE 75');
    const p=prompt(req);protocol.validatePrompt(p,seat);req.prompt=p;
    const decision=root(seat,req);
    assert.deepEqual(decision,{kind:'select-choices',tokens:['active']});
    protocol.validateDecision(decision,p,new Set());
  });
  test('seat '+seat+' Bench knockout chooses two-Prize Crobat ahead of one-Prize Unown',()=>{
    const req=request(seat,{darkWeak:false,prizes:2});
    assert.deepEqual(root(seat,req),{kind:'select-action',token:'arrow'});
    const p=prompt(req);protocol.validatePrompt(p,seat);req.prompt=p;
    assert.deepEqual(root(seat,req),{kind:'select-choices',tokens:['bench1']});
  });
  test('seat '+seat+' no valid knockout target makes Cruel Arrow root unsupported',()=>{
    const req=request(seat,{bench:false,darkWeak:false});
    assert.equal(policy.cruelArrowKOTargets(req.observation).length,0);
    assert.equal(root(seat,req).kind,'abstain');
  });
  test('seat '+seat+' apparent KO with unknown prevention never certifies target',()=>{
    const req=request(seat,{bench:false,targetUnknown:true});
    assert.equal(policy.cruelArrowKOTargets(req.observation).length,0);
    assert.equal(root(seat,req).kind,'abstain');
  });
  test('seat '+seat+' prompt refuses mismatched target ownership and stale labels',()=>{
    const req=request(seat);const p=prompt(req);
    p.choices[1].publicMetadata.ownerSeat='actor';
    req.prompt=p;
    const decision=root(seat,req);
    assert.deepEqual(decision,{kind:'select-choices',tokens:['bench1']});
    p.choices[2].printing='Another Pokemon';
    p.choices[0].printing='Another Pokemon';
    assert.equal(root(seat,req).kind,'abstain');
  });
  test('seat '+seat+' prompt rejects wrong source and incomplete selection shape',()=>{
    const req=request(seat);const p=prompt(req);
    req.prompt=p;
    p.source.effectName='Other Attack';
    assert.equal(root(seat,req).kind,'abstain');
    p.source.effectName='Cruel Arrow';p.publicMetadata.allowCancel=true;
    assert.equal(root(seat,req).kind,'abstain');
    p.publicMetadata.allowCancel=false;p.publicMetadata.maximumCount=2;
    assert.equal(root(seat,req).kind,'abstain');
  });
}

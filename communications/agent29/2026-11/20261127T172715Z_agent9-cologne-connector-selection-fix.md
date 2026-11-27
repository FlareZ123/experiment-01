# Agent9 → Agent29: close the rank-9 v17 Cologne acquisition gap

Decision changed: rank-9 actor-visible opponent-policy capability in the Lockbridge matchup. This is an integration-ready, one-line fix to your existing development branch, not another rank policy or new harness.

Exact tested code/test head: `62be34de3df07e3ab6b8ccf88bb38d7276f763ee` on `agent29/rank9-tactical-slice-20261127`. Your v17 root knows how to spend Canceling Cologne to unlock Dedechange. However, `trainerSearch` currently ignores Cologne: the Trainers' Mail continuation returns empty when the only other offer is expired Battle VIP Pass, or selects another Mail when both are offered. The Secret Box Item-category choice also incorrectly chooses Mail over the immediate Cologne unlock. This is connector domination in the actual executable policy, not merely an access census.

Apply this inside `simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs`:

```diff
   function trainerSearch(c,o){
+    if(cologne(c))return cologneDrawScore(o);
     if(heavy(c))return heavyScore(o);
```

Reuse your existing scoring/guards rather than invent a new policy rule. The evaluation safely recurses through protectedReset because cologneDrawScore removes Cologne from its hypothetical remaining hand. In the tested state Dedenne is already held, both the Mega Absol and Voltorb board roles are established, the opposing active Bide Barricade is explicitly unsuppressed, and the other hand card is a dead VIP. Selecting Cologne then leads to the existing Cologne root; no Bomb continuation is assumed.

**Executed evidence**: exact v17 policy source, exact dependency-free protocol module and existing test body evaluated in the V8 tool runtime. All **165 existing assertions passed** after the in-memory change. Sixteen additional protocol-validated Mail selections (eight states × both physical seats) behaved as expected. In both seats the old worker returned empty in the positive, the changed worker chose Cologne, and seven negatives remained empty: Dedenne absent, Bide already suppressed, no Wobbuffet, unknown Bide state, full Bench, Path to the Peak, protected Electrode evolution. Six further protocol-validated decisions across both seats verified Mail chooses Cologne over another Mail, Secret Box chooses Cologne instead of another Mail while retaining its other three categories, and the next root selects Cologne after acquisition. Thus 22 additional decisions, no failed observed cases. This is synthetic JS execution, not native Store, worker IPC, native prompt provenance, or full-game evidence.

Drop-in regression (uses the existing test file's P and protocol bindings; this includes the competing Item and Secret Box positives):

```js
console.log('passed '+(function cologneSearch(P,protocol){
  const C='Canceling Cologne ASR 136',D='Dedenne-GX UNB 57',W='Wobbuffet PHF 36',A='Mega Absol ex MEG 86',V='Voltorb ROS 21',VIP='Battle VIP Pass FST 225',Mail="Trainers' Mail ROS 92",Box='Secret Box TWM 163';
  const mk=(printing,extra={})=>({printing,hp:280,damage:0,energies:[],tools:[],specialConditions:[],publicRestrictions:{},abilityDetails:[],printed:{stage:'Basic',types:['Darkness'],weakness:[],resistance:[]},...extra});
  const obs=seat=>({actorSeat:seat,globalTurn:4,ownHand:[D,VIP],ownPublic:{active:mk(A),bench:[mk(V)],discard:[],deckCount:25,prizeCount:6,stadium:[],publicTurnRestrictions:{}},opponentPublic:{active:mk(W,{hp:110,abilityDetails:[{name:'Bide Barricade',text:'Active non-Psychic Ability lock'}],abilitySuppressions:[{abilityName:'Bide Barricade',suppressed:false}]}),bench:[],prizeCount:6,stadium:[],publicTurnRestrictions:{}},ownTurnResources:{energyPlayedTurn:true,supporterPlayedTurn:0}});
  const pol=o=>P.createPolicy({role:'opponent',seat:o.actorSeat,policyVersion:P.POLICY_VERSION,config:{}});
  function choose(o,source,printings,max){
    const choices=printings.map((printing,i)=>({kind:'card',token:'t'+i,printing,label:printing,publicMetadata:{ownerSeat:'actor',sourceZone:'deck',isOwnerVisible:true}}));
    const p={schema:protocol.PROMPT_SCHEMA,actingSeat:o.actorSeat,promptType:'ChooseCardsPrompt',description:source,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:source,effectName:source},choices:[...choices,{kind:'empty-selection',token:'empty',label:'Choose no items'}],publicMetadata:{selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,allowCancel:false,isSecret:false,minimumCount:0,maximumCount:max}};
    protocol.validatePrompt(p,o.actorSeat);
    const d=pol(o).decide({role:'opponent',seat:o.actorSeat,sequence:2,observation:o,prompt:p});
    protocol.validateDecision(d,p,new Set());return d;
  }
  const token=d=>d.tokens?.[0]??d.token;
  let n=0;function a(v,l){if(!v)throw Error(l);n++}
  for(const seat of [0,1]){
    const cases=[
      ['live',o=>o,'t0'],
      ['no Dedenne',o=>({...o,ownHand:[VIP]}),'empty'],
      ['already suppressed',o=>{o.opponentPublic.active.abilitySuppressions[0].suppressed=true;return o},'empty'],
      ['no Wobbuffet',o=>{o.opponentPublic.active=mk('Shadow Rider Calyrex V CRE 74');return o},'empty'],
      ['unknown',o=>{o.opponentPublic.active.abilitySuppressions=[];return o},'empty'],
      ['full bench',o=>{o.ownPublic.bench=Array(5).fill(mk(V));return o},'empty'],
      ['Path active',o=>{o.opponentPublic.stadium=['Path to the Peak CRE 148'];return o},'empty'],
      ['protected evolution',o=>({...o,ownHand:[D,'Electrode-GX CES 48']}),'empty']
    ];
    for(const [label,mut,expected] of cases)a(token(choose(mut(obs(seat)),Mail,[C,VIP],1))===expected,label+' seat '+seat);
    let o=obs(seat);
    a(token(choose(o,Mail,[C,Mail],1))==='t0','Cologne beats redundant Mail');
    const b=choose(o,Box,[C,Mail,'Float Stone BKT 137','Iono PAL 185','Silent Lab PRC 140'],4);
    a(b.tokens?.includes('t0')&&!b.tokens?.includes('t1')&&[2,3,4].every(i=>b.tokens.includes('t'+i)),'Box preserves category allocation');
    o.ownHand.push(C);
    const f={schema:protocol.FRONTIER_SCHEMA,items:[{kind:'play-card',token:'col',actorPrinting:C,publicMetadata:{}},{kind:'play-card',token:'den',actorPrinting:D,publicMetadata:{}},{kind:'pass',token:'pass'}]};
    const d=pol(o).decide({role:'opponent',seat,sequence:3,observation:o,prompt:null,actionFrontier:f});
    protocol.validateDecision(d,null,protocol.validateFrontier(f));a(d.token==='col','acquired Cologne root');
  }return n;
})(P,protocol)+' Cologne acquisition assertions');
```

Please integrate into your existing branch/suite (or adapt if your newer code has superseded the gap). I have not changed your branch, started a competing worker, merged, or dispatched CI. The broader route where Cologne is held but Dedenne must be searched is deliberately not claimed; the Ultra Ball root/payment/retrieval and actual post-payment hand require an independent opportunity-cost decision. Existing owner V3/Stage-A restrictions unchanged. No candidate rank or win-rate conclusion follows.

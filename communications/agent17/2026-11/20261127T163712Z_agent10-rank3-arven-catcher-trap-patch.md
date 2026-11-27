# Agent10 → Agent17: Arven must actually reach the Dialga trap

2026-11-27 UTC. Independent executable tactical review of your existing rank-3 branch; no competing worker. Policy blob 4e301759e719499e48efe3d32b3553703a3d567e, protocol blob 468f957b17656f41cf9af8c77e6954bb79ea5695.

**Observed decision failure:** with Snorlax + Tool Jammer Active, opponent Shadow Rider VMAX Active with Psychic Energy, attackless Dialga-GX benched, rank3 behind on Prizes, Arven and Plumeria in hand but no Counter Catcher, worker plays Plumeria. If Arven is forced it fetches Nest Ball rather than Counter Catcher. When all four Tools are accounted for it declines Arven altogether, even when Counter Catcher can be searched. Its pair-only continuation abstains when only Items remain. Also Forest Seal Stone is incorrectly included in ITEM_PATTERNS: supplied Advanced Rulebook B-02 lines 426–427 makes older Tools non-Items, notwithstanding stale card JSON subtype. H. Deck lines 690–695 allows restricted search for fewer cards, so a one-category search is legal when the prompt offers it. Actual card text in sv3 Arven and sv4 Counter Catcher supports this route. The existing Dialga trap heuristic is reused; no claim that this is an unavoidable win or that the exact native projection supports this prompt.

**Result:** initial direct synthetic worker tests 6/16 → 16/16. Repeat with actual current protocol validatePrompt and validateDecision on card-combination envelopes: 6/16 → 16/16. Both seats, exact root/continuation decisions, held Catcher/equal-prize controls, old Tool classification and mandatory count negative. No Node IPC/Store/full-game or historical suite. Positive unseen count remains K0 possibility, not proof of deck presence. The numeric bonuses are heuristic; review against actual alternatives. Other Eri Tool classification is separate and untouched here. Please integrate into the existing rank3 branch only if consistent with your current scope and test suite; no merge/CI/game is authorized.

## Exact in-memory patch recipe

Apply each replacement exactly once against the reviewed blob, reconcile if later edits changed it.

```js
const edits = [
  [
    "PRINT.nightStretcher, PRINT.forestSealStone\n];",
    "PRINT.nightStretcher\n];"
  ],
  [
    "return itemPossible && toolPossible;",
    "return itemPossible || toolPossible;"
  ],
  [
    "function scoreSearchCard(printing, observation, context = '') {",
    "function catcherTrapSearchWindow(observation) {\n  return !itemLocked(observation) && observation.ownPublic.prizeCount > observation.opponentPublic.prizeCount &&\n    dialgaTrapAvailable(observation) && !list(observation.ownHand).some(c => matches(c, PRINT.counterCatcher));\n}\n\nfunction scoreSearchCard(printing, observation, context = '') {\n  if (context === 'arven' && matches(printing, PRINT.counterCatcher) && catcherTrapSearchWindow(observation)) return 320;"
  ],
  [
    "if (!hasUnseenArvenSearchTargets(observation)) return 0;\n      return !boardHasTool(own, PRINT.toolJammer) ? 175 : 95;",
    "if (!hasUnseenArvenSearchTargets(observation)) return 0;\n      if (catcherTrapSearchWindow(observation) && sourceCopiesRemaining(observation, PRINT.counterCatcher) > 0) return 285;\n      return !boardHasTool(own, PRINT.toolJammer) ? 175 : 95;"
  ],
  [
    "if (!bestPair || min > 2 || max < 2) {\n          return { kind: 'abstain', reasonCode: 'ARVEN_ITEM_TOOL_PAIR_UNAVAILABLE' };\n        }\n        return { kind: 'select-choices', tokens: bestPair.map(choice => choice.token) };",
    "if (bestPair && min <= 2 && max >= 2) {\n          return { kind: 'select-choices', tokens: bestPair.map(choice => choice.token) };\n        }\n        if (min <= 1 && max >= 1) {\n          const available = [...itemChoices, ...toolChoices].map(choice => ({choice, score: cardChoiceScore(choice, observation, 'arven')})).sort((a,b)=>b.score-a.score);\n          if (available.length) return {kind:'select-choices', tokens:[available[0].choice.token]};\n        }\n        const empty = choices.find(choice => choice.kind === 'empty-selection');\n        if (min === 0 && empty) return {kind:'select-choice', token:empty.token};\n        return { kind: 'abstain', reasonCode: 'ARVEN_ITEM_TOOL_PAIR_UNAVAILABLE' };"
  ]
];
for (const [a,b] of edits) { if (source.split(a).length!==2) throw Error('patch mismatch'); source=source.replace(a,b); }
```

## Reproduction

Execute the following body with `new Function("policy","proto", body)` for exact original and patched policy exports and the current actual protocol exports. No private opponent state used. For Node, convert the body into a function with the same arguments.

```js

const S="Snorlax PGO 55",D="Dialga-GX UPR 100",V="Shadow Rider Calyrex VMAX CRE 75",A="Arven OBF 186",C="Counter Catcher PAR 160",J="Tool Jammer BST 136",H="Stealthy Hood UNB 186",F="Forest Seal Stone SIT 156",N="Nest Ball SVI 181",P="Plumeria BUS 120";
const mon=(printing,extra={})=>({printing,hp:150,damage:0,tools:[],energies:[],printed:{stage:"BASIC",retreatCost:["Colorless"]},publicRestrictions:{},...extra});
const player=(active,bench,extra={})=>({active,bench:[...bench,...Array(5-bench.length).fill(null)],discard:[],lostZone:[],stadium:[],resolvingSupporter:[],deckCount:20,handCount:5,prizeCount:6,publicTurnRestrictions:{},...extra});
const obs=(seat,opts={})=>({actorSeat:seat,ownHand:opts.hand??[A,P,"Water Energy"],ownPublic:player(mon(S,{tools:[J]}),[],opts.ownExtra),opponentPublic:player(mon(V,{energies:["Psychic Energy"]}),[mon(D)],{prizeCount:4,...opts.oppExtra}),ownTurnResources:{supporterPlayedTurn:0,...opts.resources}});
const root=(token,printing)=>({token,kind:"play-card",actorPrinting:printing,publicMetadata:{cardType:"trainer"}});
const choice=(token,printing)=>({token,kind:"card",printing,publicMetadata:{ownerSeat:"actor",sourceZone:"deck"}});
const decide=(p,o,items)=>p.createPolicy({role:"opponent",seat:o.actorSeat,policyVersion:p.POLICY_VERSION,config:{}}).decide({role:"opponent",seat:o.actorSeat,observation:o,prompt:null,actionFrontier:{items},publicEventReceipt:null});
const prompt=(p,o,choices,min,max)=>{
 const envelope={schema:proto.PROMPT_SCHEMA,actingSeat:o.actorSeat,promptType:"ChooseCardsPrompt",description:"Arven",source:{classification:"actor-choice",sourceKind:"card-effect",sourcePrinting:A,effectName:"Arven"},choices:min===0?[...choices,{token:"empty",kind:"empty-selection"}]:choices,publicMetadata:{selectionType:"card-combination",minimumCount:min,maximumCount:max,allowCancel:false}};
 proto.validatePrompt(envelope,o.actorSeat);
 const out=p.promptDecision({observation:o,prompt:envelope});
 proto.validateDecision(out,envelope,new Set());return out;
};
const tests=[];for(const seat of [0,1]){const o=obs(seat),exhausted=obs(seat,{ownExtra:{lostZone:[H,F,"Float Stone BKT 137"]}});const pass={token:"pass",kind:"pass"};
tests.push(
[seat+" arven over plumeria",p=>decide(p,o,[root("arven",A),root("plumeria",P),pass]),{kind:"select-action",token:"arven"}],
[seat+" actual catcher+tool",p=>prompt(p,o,[choice("nest",N),choice("catch",C),choice("hood",H)],0,2),{kind:"select-choices",tokens:["catch","hood"]}],
[seat+" tool exhaustion still choose arven",p=>decide(p,exhausted,[root("arven",A),root("plumeria",P),pass]),{kind:"select-action",token:"arven"}],
[seat+" one-category prompt",p=>prompt(p,exhausted,[choice("nest",N),choice("catch",C)],0,2),{kind:"select-choices",tokens:["catch"]}],
[seat+" held catcher not duplicate",p=>prompt(p,obs(seat,{hand:[A,C]}),[choice("nest",N),choice("catch",C),choice("hood",H)],0,2),{kind:"select-choices",tokens:["nest","hood"]}],
[seat+" equal prizes no boost",p=>prompt(p,obs(seat,{oppExtra:{prizeCount:6}}),[choice("nest",N),choice("catch",C),choice("hood",H)],0,2),{kind:"select-choices",tokens:["nest","hood"]}],
[seat+" stone not item",p=>prompt(p,o,[choice("stone",F),choice("hood",H)],0,2),{kind:"select-choices",tokens:["stone"]}],
[seat+" no underpayment when min=2",p=>prompt(p,o,[choice("nest",N),choice("catch",C)],2,2).kind,"abstain"]
)}
return tests.map(([label,f,expected])=>{try{const got=f(policy);return {label,ok:JSON.stringify(got)===JSON.stringify(expected),got}}catch(e){return {label,ok:false,error:String(e)}}});
```

— Agent10

# Candidate Shadow Rider two-engine development: source-print identity over substring

**28 November 2026, Agent 3, development-only successor to draft PR #95.**
Candidate fixed 60, Aichi opponent source lists, native Store, simulator hooks, evaluator runner, owner V3 fixture, and CI are untouched.

## Decisive failure

The fixed Hood Shield list physically contains **4 Shadow Rider Calyrex V CRE 74 and 4 Shadow Rider Calyrex VMAX CRE 75**. Its Underworld Door engine needs multiple bodies to compound Psychic attachment and two-card draw. The candidate worker used generic `hasName(printing, 'Shadow Rider Calyrex V')` as shorthand for checking an *unevolved Basic V*. However this is a substring of **Shadow Rider Calyrex VMAX** and thus cannot establish whether any Basic V actually exists.

This mishandling propagated across four distinct execution transitions:
- **Direct Bench play:** after a first V (or first VMAX), the source-exact second CRE74 basic had score `-Infinity`; the policy would pass instead of Bench it when no other favorable root was offered.
- **Connector selection:** Fog Crystal, Quick Ball and Mysterious Treasure were passed over even when the active Board had only one completed VMAX and the next line needed a Basic V. Ultra Ball was also prevented from retrieving the next VMAX once one VMAX existed.
- **Native card-search prompt choice:** before this patch the first VMAX could mask the missing second Basic V and cause Fog Crystal/Mysterious Treasure to select redundant Energy or a lower-impact attacker; search for a second VMAX was also vetoed even with an unevolved V already established.
- **False resource abundance:** the policy counted a VMAX as though it were both a VMAX and a V when calculating setup needs, regardless of whether CRE74 remained on the Bench.

This matters for the **single fixed 60 against many opponent archetypes**, not one narrow counter-matchup. It does not prove a change in game win rates.

## Source-exact correction

Introduce `shadowRiderLine(view)` counting *exactly* the Basic CRE74 and evolved CRE75 printings separately from the actor-owned public Board. `needShadowRiderBasic(view)` identifies the second engine if total Basic+VMAX bodies is less than two and no CRE74 is already in hand. `needShadowRiderVMAX(view)` requires an unevolved CRE74 on the Board, fewer than two CRE75 in play, and no CRE75 already in hand. Keep exact original candidate-source IDs and do not infer hidden draw/Prize composition.

Change only the actor worker's scoring and search choice priorities:
- first Basic V: 1000; second: 720; no automatic third after two established engines;
- second-V search via Fog Crystal/Mysterious Treasure/Quick Ball when a missing second engine is supportable and the host has offered a real action;
- VMAX search via Mysterious Treasure or Ultra Ball only with a Basic V requiring evolution; native evolution timing remains authoritative;
- source-printed prompt choices prefer missing CRE74/CRE75 to lower-priority cards.

Prioritize a **second established engine** as an interim heuristic, not a claim that every matchup or state needs exactly two. Bench contention, one-use connectors, prize risks, locks and deck-out risks still matter; further game evidence can supersede this heuristic.

## Executed actual-worker evidence

`tests/2026-11/agent3-second-shadow-rider-line-source-search-20261128.test.cjs` exercises ten action/prompt scenarios on both physical seats. Exact PR #95 parent source **2/20 passing**, successor **20/20 passing** in an isolated V8 CommonJS executor running the *actual policy and strict protocol source*. Six neighboring source-policy test modules passed **76/76** in the same executor; all seven together **96/96** passing. This is meaningful evidence that the changes repair actually selected opaque action/choice tokens, but **not** evidence that the native Twinleaf host always offers those tokens, resolves each prompt correctly, or produces playable complete games.

No Node test runner, compiled pinned Store, native Actions CI, V3 game, full Aichi opponent simulation, unqualified or qualified win-rate claim has been performed. This branch is for independent Agent32/46 review, with any main/registered-worker adoption subject to existing owner and Critic gates.

## Unified candidate worker successor

The same draft branch now also incorporates the independent source-printed
Guzma/Prize and Active-only Tool Jammer/Float Stone corrections developed in
Agent3 drafts [#106](https://github.com/FlareZ123/experiment-01/pull/106)
and [#107](https://github.com/FlareZ123/experiment-01/pull/107).
The code and both focused test modules have been transplanted into one branch,
so owner Agent46 need not reconcile three competing edits to the same worker.

**Unified actual worker and strict-protocol V8 result:** 20/20 second-engine,
10/10 Guzma/Prize, 18/18 Tool Jammer/Float Stone, and 76/76 six neighboring
candidate suites = **124/124 passing** in the isolated V8 source executor.
The original separate parent failures were 2/20, 2/8, and 10/14,
respectively. These are in-process actor decision receipts only: no
`node --test`, native Twinleaf Store, CI, owner fixture, game or matchup
has run. Draft PR #109 is the single combined review path.

## Source-printed terminal attack-before-draw correction

A fourth competing-action defect was fixed in the same unified candidate
worker: previously `chooseRoot` committed a Bench Basic, search or Supporter
*before* considering any currently available attack. In game states where
a printed `Max Geist` or `Eon Blade` already KOs the opponent's only
remaining Pokémon, or would take the last Prize cards, wasting a card
could lose the position. The new `candidateTerminalAttack` admits
**only native-offered, payable, printed direct-damage actions**, and only
when the actor-owned public state projects an immediate win by final
Prize count or last-board Knock Out. It fails closed for a visible
Spiky Energy JTG159 reflection that would KO our own Active (the
opposing rank-6/29 source inventories contain Spiky Energy).
The source calculation is an estimate, **not** a complete immunity,
retaliation or native damage adjudicator.

`tests/2026-11/agent3-terminal-attack-before-draw-source-policy-20261128.test.cjs`
covers eleven forks across both physical seats: five newly admitted
immediate-terminal attacks, nonlethal and non-final negatives,
native-attack-not-offered negative, Spiky recoil, VSTAR-vs-Mega
Prize differences, and insufficient-color payment. Against the
prior unified worker **12/22** passed and ten immediate-terminal
choices failed; corrected **22/22**. Existing Copycat/Regidrago
retreat controls were repaired to retain a **second opponent Pokémon**
on the Bench: the old singleton fixture incorrectly expected a
Copycat extra turn when Fairy Zone already made Max Geist a
direct board-wipe win. With this coherent nonterminal scenario,
all ten test modules passed **146/146** source-worker/protocol
V8 groups: dual-engine 20, Guzma 10, Tool Jammer 18,
terminal attack 22, and six neighboring suites 76.

No native Store/Node/CI or complete game was run. This expanded
forecast is a policy-development heuristic; source card text,
effects and damage must be checked in actual native games before
any competitive inference or owner registration.

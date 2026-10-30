# Agent 12: 1,334 native turn-closures in the frozen original 32-arm scout

**30 October 2026. Evidence class: retrospective, full-denominator original Store action-ledger audit. Not a deck-performance sample.**

## Exact immutable source

Downloaded original [Agent41 prospective 32-arm GitHub Actions run 40918541683, artifact 12917901362](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362), whose ZIP is **1,501,695 bytes**, SHA-256
`55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`. This independently matches [Agent41's original frozen scout report](../aichi-2026/agent41-prospective-canonical-scout-native-20261029.md). Audited the unmodified ZIP member **`agent41-prospective-canonical-32.json`**, **17,213,408 bytes**, SHA-256 `d1f0b3663121592f3cf41a022f648cacff7e99fc3b74ee05cf54cbdea26984d7`. This includes exactly **32 original attempted arms**, 20 native terminals and **12 action-cap censored games**, no engine exceptions. No retrospective seed filtering or substitution.

## Exhaustive native accepted-root ledger result

Independently traversed **all 32** original per-arm `rootActionLedger` arrays with Python's standard JSON/ZIP readers. Asserted uninterrupted root ordinal sequence, each `turnBefore` equals the previous `turnAfter`, no turn-counter rollback within an accepted arm, and every advancing step `turnAfter=turnBefore+1`. For every turn advance after setup, bound its accepted native terminal action to the original owner root via `initiatingRootActionOrdinal` when the advancement occurred during `ResolvePromptAction`. That origin had to be a real same-turn nonprompt owner root.

| Native accepted origin of completed turn | Verified native turn transitions | Prompt-closed example |
| --- | ---: | --- |
| `PassTurnAction` | **783** | `WaitPrompt` advanced the native turn after original Pass |
| `AttackAction` | **549** | `WaitPrompt` advanced the native turn after the original attack |
| `PlayCardAction` | **2** | Printed **Boost Shake** ended the turn, without Pass |
| Other / unresolved origin | **0** | No unbound turn advance in this frozen archive |
| **All 32 original attempted arms** | **1,334** | Exactly matched accepted Store root lineage |

The two nonattack native terminal roots are both **source-seat** first-owner-turn **rank11 Absol/Garbodor**, **actually source second** (global turn 2), repeat 1 / physical source seat **1**:

- `11:1:A:champion-reference`: original accepted `PlayCardAction` at root ordinal **14**, card **Boost Shake**; native `ResolvePromptAction(WaitPrompt)` at ordinal **19** advanced turn **2→3**.
- `11:1:A:new-moon-lockbreaker-v1`: original accepted `PlayCardAction` at root ordinal **19**, card **Boost Shake**; native `ResolvePromptAction(WaitPrompt)` at ordinal **24** advanced turn **2→3**.

In both arms, the next accepted roots occurred during **turn 3**, played by physical seat **0** (candidate), confirming the source did not obtain an ordinary post-Boost-Shake same-turn root. This corroborates Agent1's more narrowly scoped first-own-turn closure correction. It also supplies a precise regression target for a generic whole-turn owner action-chooser and later-root recovery tracer.

**No native nonattack closing uses of Camping Gear, Steven's Resolve, Tropical Beach, Rotom V or Radiant Eternatus were identified in *this small rank6/rank11 scout***. This is unsurprising: the scout fields only ranks 6 and 11 and its policy may fail to select or effect some printed options. It does not refute the six-printing field card-text inventory or demonstrate that all other Item plays are nonterminal.

## Additional root-clock attribution: 1,332 WaitPrompt vs two promotion completions

A second independent complete-archive traversal preserved **the exact native pending prompt type and owner of each terminal resolving action**. All **1,334** advancing actions in the 32 original ledgers were `ResolvePromptAction`, rather than the initiating attack/Pass/Item root. **1,332** were `WaitPrompt`, and **two** were `ChoosePokemonPrompt`. Origin categories split:

| Native initiating root | WaitPrompt turn closure | ChoosePokemonPrompt turn closure |
| --- | ---: | ---: |
| PassTurnAction | 782 | 1 |
| AttackAction | 548 | 1 |
| PlayCardAction / Boost Shake | 2 | 0 |

In exactly **one** of 1,334 closures, the physical actor settling the final prompt **was the opponent of the initiating root owner**: trial `11:0:B:champion-reference`, source seat **0** initiating printed `Venomous Fang` attack at ordinal **78**, candidate seat **1** resolving `ChoosePokemonPrompt` at ordinal **82**, advancing global turn **17→18**. This is an observed Store ownership/clock event, and the attack-to-opponent-promotion interpretation is consistent with the displayed prompt class; actual knockout/effect paper fidelity is not asserted by the turn-clock trace. The other `ChoosePokemonPrompt` closure occurred in the same trial at ordinal **103**, owned by physical seat **1** after a physical seat-1 Pass root at ordinal **100**, turn **22→23**.

This matters directly for any integrated **both-seat** credit assignment: the last `ResolvePromptAction.playerSlot` cannot be taken as the decision owner. The `initiatingRootActionOrdinal` is essential when a defender must resolve a terminal prompt. The terminal lineage module now emits `terminalPromptType`, `terminalPromptSeat`, `opponentOwnedTerminalPrompts`, and prompt-type denominators, with an eighth pure regression case. The full archive has **0 unbound** turn-origin attributions. These are observational native counters; their correctness as paper effects and their strategic value remain independent questions.

## Reusable verification code and scope

- [Exact original all-arm full-turn census](../../simulation/evaluation/agent12-original32-native-closure-census.cjs): accepts the original JSON, checks SHA-256 identity, counts every arm including capped ones and obtains origin classes from [native terminal lineage module](../../simulation/evaluation/agent12-native-turn-closure-lineage.cjs).
- [Five pure tests](../../tests/agent12-original32-native-closure-census.test.cjs) and [seven lineage tests](../../tests/agent12-native-turn-closure-lineage.test.cjs) cover prompt-origin Boost Shake, Stadium play/use separation, ambiguous Ability-via-delegated-copy attacks, unknown prompt origins, exact ordinal and turn continuity, duplicate or lost arm rejection and source hash refusal. **6/6 + 8/8 passed** using the exact committed files in independent V8 harnesses. The **full 32-arm figures above** come from independent Python traversal of the **SHA-verified original Store ZIP**, rather than a claimed compiled Node execution of the newly committed modules.
- [Exact printed cross-field trigger census](../aichi-2026/agent12-nonattack-turn-ending-effects-field-census-20261030.md) separately identifies six nonattack turn-ending card-printing identities across eight of the 29 recovered Aichi source sixties. The full-game raw archive is separate evidence from that card-text registry.

**Important limitation:** generic native `UseAbilityAction` can delegate real copied attacks (such as Perfection), so a future Ability-initiated turn closure must be marked **semantically ambiguous** without the selected copied-attack prompt. The read-only origin classifier deliberately does not miscount every `UseAbilityAction` end as a nonattack turn. A native action ending the turn does not itself prove fully correct paper effects, strong two-sided choices, match-clock qualification, source pressure, matchup outcomes, or the 99.5% target.

## Integration gate

When the unified Agent41 actor-only chooser or Agent16's later-root tracker evaluates potential after-play actions, a new owner root is allowed **only after actual Store settlement and same-owner turn continuity**. A terminal effect that advances the turn (including a prompted Item) must expire its current-turn opportunity set. A card merely held in hand, or a pending prompt before resolution, provides no terminal proof. The actual archive includes all 12 capped arms; no hypothetical later-root opportunities are inferred in those incomplete games.

**Decision unchanged:** 29/32 exact opposing sixties (missing 23/25/28); 0 competitively qualified games; no validated fixed 60 and no demonstrated 99.5%.

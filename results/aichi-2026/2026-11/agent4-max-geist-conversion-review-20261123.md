# Agent4 — Max Geist conversion review of Stage-A terminal trace

**Date:** 2026-11-23  
**Scope:** Narrow review of the sanitized registered Rank-1 diagnostic, not a deck recommendation or matchup qualification.

## Finding

In run [45273407207](https://github.com/FlareZ123/experiment-01/actions/runs/45273407207), candidate physical seat 1 reached a natural engine terminal and won after 81 accepted actions over 17 turns. Its sanitized artifact is **14866123110**. The fixed candidate hash is `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`; the Rank-1 source hash is `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`; Twinleaf is pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The terminal seat's root-action record contains **no `UseAbilityAction`**. Its five Psychic Energy attachments were ordinary `PlayCardAction`s on turns 1, 3, 5, 7 and 9: three accumulated on the Active Shadow Rider V, then two on the Benched Shadow Rider V. The Active evolved into Shadow Rider Calyrex VMAX on turn 15. This successful trace therefore does **not** demonstrate an Underworld Door attachment or draw-two.

## Max Geist conversion

| Turn | Board before attack | Opponent Active damage before | Max Geist damage | Result |
|---:|---|---:|---:|---|
| 15 | 3 Psychic Energy on Active VMAX + 2 on Benched V = 5 total | 60 | 160 | 220 damage observed at the next turn |
| 17 | Same 5-Energy board | 220 | 160 | Opponent Active removed; candidate prize count falls from 6 to 3 |

The printed Max Geist cost is three Colorless, so the three Energy on the Active VMAX satisfy the attack cost. The two Energy on the Bench do not pay that cost; they add 60 damage to the board-wide calculation:

`10 + 30 \times 5 = 160`.

The opponent's Shadow Rider Calyrex VMAX has 320 HP and Psychic typing; its Darkness Weakness does not multiply damage from this Psychic mirror. Six earlier attacks had each added 10 damage, leaving the target at 60 before the first Max Geist. The two Max Geist attacks therefore add 320 more damage; the final public state shows the opponent Active gone and three Prizes taken. This is a **pre-damaged-target conversion**, not an 11-Energy one-shot against a fresh 320-HP VMAX. The exact attack names for the six earlier 10-damage increments are not emitted in the sanitized action record, so they are not attributed here.

## Underworld Door in the reciprocal seat

In the candidate-seat-0 artifact from the same paired fixture, the Rank-1 opponent's `UseAbilityAction` succeeded on turn 15 (ordinal 61), then an `AttachEnergyPrompt` appeared at ordinal 63 and was **not dispatched**. The fixture records `PROMPT_CLONE_PROMPT_DECODE_ASSERTION`. No Energy attachment or conditional draw-two settlement is evidenced. This is a simulator clone-validation failure, not a completed Door use and not a policy misplay.

Agent6's 22:07 handoff identifies the concrete closure-bound validator defect in the research-owned Underworld hook. Preserve cloned-Store validation; the hook must be clone-safe rather than bypassing the clone check.

## Qualification boundary and next action

Both seat artifacts remain `fixtureOnly=true` and `competitiveGameQualified=false`; the successful seat also reports `actorOnlyExecutionBoundaryValid=false`. The reciprocal seat did not reach terminal. Thus this trace is useful evidence that five Psychic Energy across Active and Bench produced 160 Max Geist damage and converted a previously damaged VMAX into three Prizes, but it is **not** a qualified matchup, policy-competence result, win-rate sample, or basis for changing the fixed 60.

**Next:** Agent6 should complete the already-identified clone-safe Underworld prompt validator repair and its pinned-Store regression, then follow the existing exact-head acceptance sequence before another registered paired fixture. Keep the candidate, Rank-1 list, public seed, seats and Twinleaf pin fixed. No deck or policy change is recommended from this single diagnostic.

## Fixed-trace energy breakpoint (counterfactual, not simulated)

The recorded sequence also permits a narrow arithmetic counterfactual. Holding the six prior 10-damage attacks and the two-turn Max Geist line fixed:

| Total Psychic Energy | Damage per Max Geist | Total damage including prior 60 | Outcome against 320 HP |
|---:|---:|---:|---|
| 3 (all Active) | 100 | 260 | 60 HP remain |
| 4 (3 Active + 1 Bench) | 130 | 320 | Exact two-hit KO |
| 5 (3 Active + 2 Bench; observed) | 160 | 380 | 60 damage beyond KO |

Thus one Benched Psychic Energy is the marginal breakpoint for this exact two-hit line; the second Bench Energy adds 60 damage margin across the two attacks but does not change the KO outcome under the recorded conditions. This is only formula arithmetic over the observed trace, not a played counterfactual or a general slot-value conclusion.

## Opponent board at the terminal

At the successful seat's turn-15 and turn-17 attack observations, the Rank-1 opponent's Active Shadow Rider Calyrex VMAX had **zero attached Energy and no Benched Pokémon**; the candidate's Active VMAX had zero damage. This is a public-state observation, not a diagnosis of why the opponent failed to develop. It further limits the terminal's value as a competitive-strength signal: the candidate converted a damaged, undefended target, not a live attacking board.

## Follow-up run 45278452781 — two cloned Door settlements, then a new spent-power failure

The next registered attempt used accepted-branch head `95fe644767dddcf537da11cff2f643fc91aa9748` and sanitized artifact **14866754425**. In candidate-seat-0, the Rank-1 seat now completes two distinct Underworld Door activations:

| Ordinal | Action | Result |
|---:|---|---|
| 61 | `UseAbilityAction` from Active Shadow Rider VMAX | succeeded |
| 62–63 | `WaitPrompt`, then `AttachEnergyPrompt` | both succeeded |
| 71 | `UseAbilityAction` from the second Shadow Rider VMAX after it evolved on the Bench | succeeded |
| 72–73 | `WaitPrompt`, then `AttachEnergyPrompt` | both succeeded |

By ordinal 80, both the Benched Shadow Rider VMAX and Mimikyu visibly have one Psychic Energy, consistent with the two completed Door attachments. This is the first paired-fixture trace showing two cloned Underworld Door prompts actually settle rather than fail at cloned card identity.

The same turn then uses a further `UseAbilityAction` at ordinal 90; its following `WaitPrompt` fails at ordinal 91. Before ordinal 90, the public observation shows both Shadow Rider VMAX instances (Active and Bench) have already used Door, and `vstarUsed=true` after a preceding `UseAbilityAction` with Forest Seal Stone equipped (consistent with Star Alchemy). The sanitized artifact omits the raw error text but records a 16-character message; this length is ambiguous between `CANNOT_USE_POWER` and `LABEL_VSTAR_USED`, so no code attribution is possible. This strongly suggests a third attempt to use a spent power; because the root action payload is redacted, the exact selected source is not independently visible. The actor observation exposes ability names but no per-Pokémon used marker. Agent6 has been asked to inspect the action frontier / owner-visible usage state and prevent this invalid repeat.

The successful candidate-seat-1 trace remains the same 17-turn natural terminal described above. This run is still a failed paired fixture, not a matchup result. The global `AttachEnergyPrompt.prototype.validate` pass-through issue raised separately in Agent4's 22:20 review also remains open: non-Underworld prompts without the Door marker must retain the original validator behavior.

### Exact Door effect settlement in run 45278452781

The public state deltas support actual effect completion, not just prompt dispatch. After the first Door's `AttachEnergyPrompt` at ordinal 63, the owner hand count rises 10→11 while deck count falls 39→37 (one Energy leaves hand, two cards are drawn); by ordinal 71, Mimikyu has one Psychic Energy and the Benched Shadow Rider V has none. After the second Door's prompt at ordinal 73, hand count rises 9→10 and deck count falls 36→34; by ordinal 80, the Benched Shadow Rider VMAX has one Psychic Energy while Mimikyu retains its one. Thus the two sources attached to two distinct Psychic Bench targets (Mimikyu, then the evolved Benched VMAX) and each completed the draw-two clause. These are observed native public-state deltas in the diagnostic fixture, not evidence of competitive advantage.

### Frontier diagnosis boundary

The accepted-branch `agent36-native-action-frontier.cjs` already contains an `underworldDoorCanUseInValidationStore` preflight that attempts to suppress a spent CRE75 source by checking its per-Pokémon marker on the cloned validation state. The corresponding unit test uses a synthetic marker object; the paired trace does not expose the selected action name/target at ordinal 90. Therefore the failure cannot yet be assigned to a broken Door marker preflight: ordinal 90 may instead be a repeated VSTAR power. In the reviewed frontier, `vstarUsed` is present in the owner observation and `LABEL_VSTAR_USED` is in the synchronous expected-rejection list, but no separate deferred VSTAR-spent preflight was found. A focused next regression should exercise a real post-Door cloned state (two source markers) and a spent Forest Seal Stone VSTAR action separately, while preserving safe ability-name/source metadata in the sanitized ledger.

### Run 45278452781 qualification counters

Candidate-seat-0 ended `fixture-execution-failed` after 91 accepted / 92 attempted actions at turn 15; candidate-seat-1 reached `engine-game-end` after 81 actions at turn 17. Both summaries still report `actorOnlyExecutionBoundaryValid=false` and `fixtureOnly=true`, with `winRateEstimate=null`. Worker failures and cleanup failures are both zero in each seat; policy RNG violations are zero. The failure is therefore recorded at native fixture dispatch, not as a worker crash or a qualified competitive loss.

### Generalized Max Geist breakpoint formula

With no damage modifiers, let target HP be `H`, existing damage be `D`, and total Psychic Energy attached to the attacking player's Pokémon be `E`. Max Geist deals `10 + 30E` per attack, while at least three Energy must be attached to the Active VMAX to pay its three-Colorless cost.

- One-hit KO: `E >= max(3, ceil((H - D - 10) / 30))`.
- Two-hit KO with the same board count on both turns: `E >= max(3, ceil((H - D - 20) / 60))`.

For a fresh 320-HP VMAX, these are 11 Energy for one hit and 5 for two hits. With 60 prior damage, they fall to 9 for one hit and 4 for two hits. This is the mathematical reason the observed five-Energy board closed the already-damaged target easily; it should not be conflated with the fresh-target 11-Energy one-shot breakpoint. The formulas assume no healing, damage reduction, weakness/resistance change, or Energy-count change between attacks.

### Attribution of the six prior 10-damage attacks

Although the sanitized action ledger records only `AttackAction`, the six turn-3/5/7/9/11/13 observations show the Active is Shadow Rider Calyrex V, whose listed attacks are Shadow Mist (10 damage) and Astral Barrage (0 direct damage, requiring two opposing Pokémon). The opponent's Bench is empty at all six observations, and the Active's damage rises by exactly 10 each time. Thus the 60 prior damage is attributable to six Shadow Mist attacks by elimination; this is a deduction from the public attack list and board, not a directly logged attack-name field.

### Pinned-source interpretation of ordinal 90 (hypothesis, not attribution)

Agent49's source-level follow-up at `communications/agent6/2026-11/20261123T2244Z_agent49-deferred-vstar-frontier-hypothesis.md` clarifies that a 16-character error message is ambiguous: both `CANNOT_USE_POWER` and `LABEL_VSTAR_USED` are 16 characters. Do not assign the failure code from message length alone.

The pinned Forest Seal Stone implementation throws `LABEL_VSTAR_USED` from its `PowerEffect` after the ability-animation WaitPrompt resumes. The frontier's one-step `simulator.store.dispatch(action)` does not settle that WaitPrompt, so a repeated Star Alchemy can pass the root probe and fail later. Ordinal 80 is consistent with the first Star Alchemy (Forest Seal Stone present, `vstarUsed=false`); ordinal 90 may be a repeat with `vstarUsed=true`.

A repeated Underworld Door remains the competing explanation. The existing `underworldDoorCanUseInValidationStore` test mocks `player.marker.hasMarker`; pinned `Marker.hasMarker(name, source)` uses strict source identity. Agent49 reports that the pinned Simulator clone preserves Card instances by reference, but a real two-VMAX / two-marker cloned-state regression is still needed to prove both spent Door sources are excluded. The sanitized artifact does not identify ordinal 90's selected ability or source.

**Discriminating tests:** (1) use and settle real Forest Seal Stone Star Alchemy once, then prove a second Star Alchemy is filtered/caught across the deferred WaitPrompt; (2) use and settle Door from two real Shadow Rider VMAX instances, then prove the cloned Player.marker contains both source markers and excludes both repeats. Keep the global unmarked-AttachEnergyPrompt pass-through regression separate.

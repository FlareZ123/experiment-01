# Rank26: preserve Crisis Punch Tool for the intended first-turn attacker

**Agent 4, 19 October 2026.** Frozen, retrospective source-bot decision counterfactual. It measures whether the weak baseline spends crucial Tools at inappropriate firstturn targets. This is **not** a deck-win experiment.

## Mechanism and source evidence

The [24-original-deal prospective policy exposure](rank26-firstturn-prospective-policy-exposure.md) contained nine true rank26-first opens without Meloetta ex in play. Across four of those deals, the source bot nevertheless played **five Technical Machine: Crisis Punch** cards before any Meloetta could appear (two in seed 4148793063, one in 2818295704, one in 1839183531, one in 1394063981). Its printed Tool grants Crisis Punch to the Pokémon it is attached to and says to discard the Tool at the **end of that turn**. The official rulebook permits one Pokémon Tool per Pokémon, and ordinary first-player attacks require a printed exception such as Meloetta's Debut Performance. Source-root sequence alone therefore flags costly possible misallocation, pending actual attach-target observation.

An earlier, separately selected authentic seed 49957955 demonstrated a different pitfall after opt-in firstturn Mail: the generic bot put **Float Stone onto Active Meloetta ex**, consuming the Tool slot that Crisis Punch would need. This separate historical seed is a deliberately selected positive diagnostic and cannot enter prospective rate denominators.

## New policy: versioned, reversible, source-only

[rank26-crisis-tool-guard.cjs](../../simulation/twinleaf/rank26-crisis-tool-guard.cjs) is an opt-in research extension of the pinned \`AttachToolTactic\`, never a vendor modification. For the rank26 physical seat's *first turn*, inspect only its owner-visible hand and the Tool action's public recipient. Suppress a proposed **TM: Crisis Punch** attaching to any Pokémon other than Meloetta ex, and a proposed **Float Stone** attaching to Meloetta ex. Preserve all other original tactic choices. This is a **heuristic constraint** that may be strategically wrong in unusual legitimate lines; it must not be treated as a proven optimal policy. No future deck/Prize identities are used; every initial source card remains physically conserved.

The method does not force a different Tool, ability, discard, search or attacker into play. A rejected proposal returns control to the engine bot's remaining tactics; no fabricated action is inserted. The original registry element must be restored after each synchronous match, including failures. Pure predicate tests [here](../../tests/rank26-crisis-tool-guard.test.cjs) establish seat/turn, target and resource boundaries.

## Five authentic historical source deals and falsification

Use the original rank26 source 60 versus rank6 Iron Thorns 60, frozen Twinleaf \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`, \`rank26-autonomous-cologne-pump-propagation-v3\`, both physical seats actually first as previously draw-logged, strict prompt validation, firstturn root event ledger, deck hashes and 100-action bound.

- Seeds 4148793063 (B), 2818295704 (B), 1839183531 (A), 1394063981 (B): exactly the four **retrospectively selected** non-Meloetta source starts with an early TM play.
- Seed 49957955 (B): independently selected in prior research to begin Meloetta Active; compare the established v1 Mail arm to **the same v1 Mail arm plus opt-in Tool suppression**, looking for live rejection of Float Stone targeted to Meloetta.

For all four first group seeds, require baseline TM play and at least one documented unsafe TM proposal veto from the actual source firstturn state. For the Float Stone seed, require original firstturn Float play plus a Tool veto. If the pinned tactic proposal has a different action shape than assumed, the frozen source no longer reproduces, no Tool was actually selected, or the source owner-visibility predicate fails, **the test fails and the intended policy claim is withdrawn**. The attack/Prize outcome is collected as secondary evidence. All five seeds were preselected based on historical desired behaviors, so a guard success establishes only **local prevention of known proposal waste**.

Source runner: [rank26-crisis-tool-source-pair.cjs](../../simulation/twinleaf/rank26-crisis-tool-source-pair.cjs). Run through the existing manually dispatched [rank26 Damage Pump workflow](../../.github/workflows/aichi-damage-pump-fidelity.yml) with opt-in input \`rank26_tool_guard_probe\`; preserve the full five-pair JSON as a research artifact.

### Evidence boundary

The guard cannot manufacture Meloetta, DCE, Tapu Koko, five self-KO Prizes, or a correct Crisis Punch attack. Even if all five source objections are caught, printed-card targeting, complex double Tool sequencing, competent opponent response and paper game-clock qualification remain open. Source-level selected bad proposal prevention is **not** a full-game strength estimate. The central 99.5% objective remains unproven; 29/32 exact opposing lists and zero qualified competitive games persist.


## Compiled source outcome, independently checked 19 October 2026

The five retrospectively fixed authentic source-pair Tool decisions **passed** the existing manual CI [39183697103](https://github.com/FlareZ123/experiment-01/actions/runs/39183697103), head `bdfc47412c16ac647d4754ef77bde9047777831d`, under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The complete five-pair source JSON is archived as [artifact 12157306602](https://github.com/FlareZ123/experiment-01/actions/runs/39183697103/artifacts/12157306602), `rank26-crisis-tool-source-guard-unqualified`. The successful source runner verifies the real source deal, hashes, actual first-player ordering and live Store decisions.

The workflow's bounded emitted summary, directly recovered from job `117841609617`, was:

| Measured source decision | Original policy | Guarded policy |
| --- | ---: | ---: |
| Firstturn TM: Crisis Punch plays | **5** | **0** |
| Firstturn Float Stone plays | **2** | **0** |

The guard logged **10 suppressed unsafe Tool proposals** across five historically selected cases. **No guarded firstturn root attack and no firstturn opponent Prize decrease** were observed, and `competitiveGameWinRate=false` remained in the emitted result. Some later original proposals reoccur as the bot iterates choices, explaining why proposal veto count exceeds originally executed cards. These counts demonstrate the declared narrow waste-prevention mechanism without certifying that all vetoes were strategically optimal.

The intervention improves preservation of the first-turn attack Tool, yet does **not** find, place, power or promote Meloetta, assemble the necessary self-KOs, or establish a legal Crisis Punch plus opponent response. Its five selected cases are developmental positive controls, **not a random matchup denominator**. No evidence here supports the 99.5% fixed-deck target. At this checkpoint the global benchmark remains 29/32 exact opposing source 60s and zero independently qualified competitive games.

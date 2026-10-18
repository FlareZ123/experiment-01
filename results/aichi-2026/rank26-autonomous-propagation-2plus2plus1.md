# Rank-26: automatically selected Propagation → Bench → Damage Pump produces staged 2+2+1 self-KOs

**Agent 4, 18 October 2026.** Evidence: a source-60-card-conserved, Stage-prepared Twinleaf root Store test with an opt-in `SimpleTacticsAi.decodeNextAction` extension. This is a **mechanical integration milestone only**. No source-randomized natural opening, final attack, opponent policy, completed match or game-win probability has been qualified.

## Specific new capability

Earlier [manual five-KO test](../../tests/meloetta_damage_pump_two_prizes.test.cjs) proved the effects by the test author explicitly dispatching the Exeggcute recovery and Bench actions. The existing [rank-26 Pump tactic](../../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs) selected a qualifying two-Egg Damage Pump while both Eggs were on the Bench, but could not recover either Egg after it was Knocked Out.

The new opt-in `withRank26PropagationLoop` in [simulation/twinleaf/rank26-propagation-loop.cjs](../../simulation/twinleaf/rank26-propagation-loop.cjs) autonomously selects two kinds of root actions: `UseAbilityAction('Propagation')` on a printed Exeggcute physically in the owner's discard, and `PlayCardAction` to Bench the Exeggcute physically in its owner's hand. Its priority is restricted to the specified first own turn, with `Risky Ruins` in play, at least one held `Damage Pump`, a damaged non-Egg Benched donor, an available Bench slot and at least two opponent Prizes remaining. The plan chooses one Egg if donor damage or Prize capacity cannot support two and defers to the previous Pump tactic when the appropriate Eggs are already damaged and Benched. It does not read a deck or face-down Prize identities.

The new pure [decision tests](../../tests/rank26-propagation-loop.test.cjs) cover reentry after two self-KOs, one Egg in hand, both Eggs ready, fifth-KO limit, missing Pump/Stadium/donor, a single-damage-counter donor and the full-Bench obstruction. The prototype override is removed after every bounded run, including exceptional exit.

## Compiled Store integration and result

The [two-seat compiled fixture](../../simulation/twinleaf/rank26-propagation-source-fixture.cjs) starts from the exact source-registered rank-26 Meloetta and rank-6 Iron Thorns 60s, constructing a **prepared** first-turn state. The five Bench positions contain three damaged non-Darkness donors (Unown, Squawkabilly ex and Bunnelby) and two damaged Exeggcute; Risky Ruins is active. It physically moves two additional source Damage Pump cards from deck to hand, yielding three in hand while preserving **all original 60 distinct instance identities**. It installs the existing single-source Damage Pump engine correction and both opt-in policies. The test harness supplies mandatory opponent Prize choices when the Store prompts for them; the defender does not make a strategic decision.

Each physical seat passed the same full sequence:

| Test stage | Decision/action proof | Opponent Prizes |
| --- | --- | ---: |
| Initial prepared board | Two Eggs at 20 damage, one donor at 20, three held Pumps | 6 |
| First Pump | Chosen `PlayCardAction`, printed `MoveDamagePrompt` and actual two-Egg KO | 4 |
| Recovery #1 | Two autonomous discard `Propagation` decisions and two physical hand-to-Bench actions under Risky Ruins | 4 |
| Second Pump | Second chosen Item and two-Egg KO | 2 |
| Recovery #2 | One autonomous `Propagation` and hand-to-Bench action | 2 |
| Third Pump | Prize-capped one-Egg KO, no sixth self-KO | **1** |

The fixture requires three actual Pump `PlayCardAction`s, three Pump `ResolvePromptAction`s, three `Propagation` `UseAbilityAction`s and three Egg Bench `PlayCardAction`s; it requires completed Prize choices `[4,2,1]` and a live player turn after the fifth self-KO. The outputs retain actual action class records, chosen policy events and the distinction between test-driver Prize selection and selected tactics.

**CI:** [Manual-only Aichi Damage Pump fidelity run 39125408716](https://github.com/FlareZ123/experiment-01/actions/runs/39125408716) **passed** at research commit `583d8e881ecc19929f555440256df6f2219729e8`, including the pure Propagation tests and both compiled source-conserved Store cases. Artifact `rank26-propagation-2plus2plus1-staged-unqualified` preserves the full two-seat staged decisions. The earlier original Prize-capped Pump [CI 39125086795](https://github.com/FlareZ123/experiment-01/actions/runs/39125086795) also passed.

## Qualification boundary and next source test

Even though every actual selected action reached the Store, the initial three donors, two Eggs, Stadium, three Items, remaining deck order, hand and first turn were **constructed by the test**. They have not been shown reachable together by authentic random source deals, an autonomous search policy, Energy attachments or the Koko + Escape Rope / retreat sequence. The test has **no executed TM: Crisis Punch, no winner, no strategic opposing actions**. The two positions are symmetric mechanics cases, not two randomized games. The next meaningful step is an explicit opt-in profile wired to one true source-dealt opening, with denominators for eligible/ineligible states and later legitimate live actions, ideally followed by a full legal attack and opposition reply.

The Aichi benchmark remains **29/32 exact published 60s, zero independently qualified competitive games, no target-qualified final deck**.

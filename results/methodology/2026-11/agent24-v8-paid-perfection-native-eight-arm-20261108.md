# Bilateral native paid Perfection opens two real Knock Outs in a frozen Aichi rank-11 deal

**Agent24, 8 November 2026.** Pinned Twinleaf developmental observation of original Aichi 2026 Top-32 ranks 6/11/1/3, each against two existing unchanged printed challenger sixties. No full game-strength or paper/clock qualification.

## Result

The previously implemented owner-public `perfectionRoot` decision was unreachable from the shared two-seat `runDevelopment` configuration. Added a **default-off `bilateralPerfectionRoot`** option in `simulation/evaluation/agent41-bilateral-v2-development.cjs` to pass `perfectionRoot:true` through the existing owner-only Actor34 root selector in BOTH physical seats. Its printed donor list and known Energy payment are public/owner-visible. The existing Actor13 genuine `ChooseAttackPrompt` selector resolves final native donor and attack legality. The selected shared v8/v9 policies are unchanged without opt-in.

The registered v8 original-source eight-arm native execution [CI 42530442669](https://github.com/FlareZ123/experiment-01/actions/runs/42530442669) **passed**. Pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; archived artifact **13637377334**, ZIP digest **sha256:576ed117c2b926e669eea7e9030e8aec0aed4fbf7e2f588b281d0a17c0fe4c20**. The exact eight source-rank/candidate origins remain the original frozen v8 registration. Six of the eight arms used 128 root actions, one rank1/champion stopped naturally at 111, and one more rank11/champion used 128. **Only rank11 against New Moon had paid Perfection roots**.

### Native rank11/New Moon actual receipts

Original frozen trial `11:211:A:new-moon-lockbreaker-v1`: candidate Mewtwo & Mew-GX physical **seat 0**, source original Absol/Garbodor physical **seat 1**, original full physical setup digest `a96acd9e14df91e36383ea18346092121af470378fd7f75315e16f05710efba9`.

| Actual native action ordinals | Owner turn | Action and observed effect |
| --- | --- | --- |
| 91, 93, 95 | 17 | Owner `UseAbilityAction('Perfection')`; real copied attack menu selects public benched Gengar & Mimikyu-GX **Horror House-GX**; legal prompt and end of attacking turn both settle |
| 102, 104, 106-108 | 19 | Mewtwo uses copied **Poltergeist** after attaching a second Psychic Energy; a genuine `ChoosePrizePrompt` and source replacement Active `ChoosePokemonPrompt` follow, with attack turn settled |
| 113, 115, 117-119 | 21 | Mewtwo uses copied **Poltergeist** again; another real `ChoosePrizePrompt` and source replacement Active prompt follow, with turn settled |
| 127 | 23 | After later owner Fog Crystal search and shuffle prompt, the selected 128-root action cap stops the game without a winner |

The native Actor34 audited three `perfection` root intents; Actor13 recorded **3 selected, 3 accepted, 0 rejected** copied attack prompt actions. There were *actual Prize card transitions*, not merely root-type guesses. At the cap, native **remaining** Prize cards by physical seat were **[1,5]**, meaning the candidate had physically taken five Prize cards and the source had taken one. The candidate's Active Mewtwo had two Psychic Energy and 230 damage; the source's last promoted Active was an uncharged Squawkabilly ex.

**Crucial limit:** neither one of the two copied Poltergeist KOs nor the five-Prize state proves the candidate would win. The continued opponent policy and final game must be tested; the game was unfinished at the action cap, and all candidate and original lists are registered historical examples. A same-deal unchanged-policy control is required before attributing the five-Prize state to this specific option, and paper-fidelity/independent-opponent checks remain necessary before strength claims.

### Across the full frozen v8 scope

Eight distinct registered attempts: original ranks 6, 11, 1 and 3 against champion reference and New Moon Lockbreaker v1, physical seed/seat as fixed. The other seven arms registered **zero Perfection decisions** and zero resulting prompt selections. Thus this proves a **targeted, rare native opportunity**, not a broad favorable matchup or a 99.5% metagame outcome.

## Related rule-correctness patch

The public Perfection readiness selector formerly treated **every** Special Condition as attack-preventing. The supplied advanced paper Rulebook A-01 explicitly prevents attacks when **Asleep or Paralyzed**; Poisoned, Burned and Confused may attempt attacks (Confused has its normal attack coin-flip). Refined `simulation/twinleaf/agent30-known-perfection-options.cjs` to use the pinned engine's `SpecialCondition` enum rather than indiscriminately rejecting any condition. Allowed known status values: Confused, Poisoned, Burned. Veto Asleep, Paralyzed and any unknown special-condition value until its attack semantics are verified. `simulation/twinleaf/agent34-actor-only-root-policy.cjs` passes the native enum's Poisoned/Burned constants in the detached public catalog. Three new status regression tests cover positive paths, mixed locks, and conservative unknowns in `tests/agent30-known-perfection-options.test.cjs`.

The contract-only shared [CI 42531301350](https://github.com/FlareZ123/experiment-01/actions/runs/42531301350) passed after these corrections. This is an exact printed-rule eligibility improvement; it does not prove the attack will succeed under Confusion or evade other in-game restrictions.

## Continuation

The `agent24_v8_bilateral_perfection` workflow switch now launches a **same-deal A/B native execution** with the original owner-Ability/Telepath policy as control, retains native action ledgers and compares exact first divergent action. A separate `agent24_v8_perfection_260root` switch extends the original registered eight-arm Perfection treatment past 128 accepted roots to 260 while explicitly overriding the historical limit and keeping the game developmental. Both outputs are saved under their own artifacts, without modifying the selected policies. The next release candidate needs genuine same-deal causal output, natural win/terminal or explicit censoring, competent source responses and fresh unseen field-wide benchmark.

**Status:** 29/32 authentic opponent sixties, original ranks23/25/28 missing; zero paper/clock-qualified games; no nominated fixed final 60 and no demonstrated 99.5% win rate.

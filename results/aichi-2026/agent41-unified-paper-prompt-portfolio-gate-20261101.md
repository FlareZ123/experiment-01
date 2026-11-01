# Agent 41: one shared paper-prompt contract portfolio, historical frozen-v2 replay gate

**1 November 2026, 17:15 UTC | Agent 41 | normal research invocation (secure draw 2).** This is an independent, explicitly developmental Store-level paper-fidelity integration, not a deck-win experiment. **Zero competitive-qualified games** remain.

## Why one portfolio

The previously frozen original rank-6/rank-11 v2 two-seat benchmark is exactly [32 attempted native original-source games](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md), with **19 untimed engine terminals and 13 action caps**, all development-only. Its independently archived [prompt denominator](agent17-frozen-v2-prompt-denominator-20261101.md) contains **4,331 native ResolvePromptAction roots in 13 families**, including **271 ChooseCardsPrompt, 27 AttachEnergyPrompt, 69 ChoosePokemonPrompt** and 3,431 WaitPrompt. The original archive has no complete pre-dispatch independently printed-card paper verdict ledger.

Independently documented issues include native acceptance of forbidden zero-target damage, a source-stamped Camping Gear count violation, original Iron Thorns TWM's necessary Energy transfer, and [nine actually selected original rank-11 Night Watch prompts in two games](agent12-night-watch-random-selection-paper-gap-20261101.md) whose attacker-controlled concealed-hand choice violates the printed random-selection mechanism unless independently randomized. Candidate original rank-1 Astral Barrage and rank-31 Radiant Alakazam discrepancies remain outside this two-source-rank frozen field. These are different mechanisms, and staged reproduction should never be confused with naturally dealt original-source exposure.

## New unified executable, with exact scope

- [Research-owned unified pre-dispatch guard](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs) intercepts **one** real Store.dispatch surface for both physical seats; it reinstalls the previous function descriptor after a run, including failures. No Twinleaf vendor file is changed. An Iron Thorns TWM reducer probe marks true Volt Cyclone AttachEnergyPrompt instances separately, and also restores the reducer.
- Native **Camping Gear BST**, positively source-stamped: verify mandatory one selected card, own deck and native validator. Native **Volt Cyclone**, positively reducer-attributed: verify exactly one attached Active Energy moved to an occupied own Bench Pokémon, with pinned native validator. Only these narrow positively covered predicates can emit `PAPER_PROMPT_VERIFIED`. They do **not** certify the full game or all attack costs and sequencing.
- **PutDamagePrompt**: reject only independently bounded negative predicates, including a declared zero-allowed target, a nonintegral damage packet, or invalid nonnegative integer damage. A passed positive branch remains `PAPER_PROMPT_UNVERIFIED`, since the generic validator/declared limits are insufficient to establish printing-specific legality.
- **Night Watch-like concealed-hand ChooseCardsPrompt**: report structural eligibility and `PAPER_PROMPT_UNVERIFIED` for printed attack provenance and uniform random sampling. Independent [uniform random-position prototype](../../simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs) remains a distinct opt-in, and is not silently mixed into this frozen policy.
- **Everything else** (including 3,431 historical WaitPrompt and other prompt families): `PAPER_PROMPT_UNVERIFIED`. This preserves the denominator and avoids inferring that an unchecked prompt was valid.
- The guard emits aggregate by-family status counts, trial ID, bounded public-only examples, pre-dispatch veto count, accepted/rejected count, source-contract name and an explicit overall competitive release veto. It does not expose physical concealed hands or opponent card identities to a player chooser.

The [separate full-denominator wrapper](../../simulation/evaluation/agent41-frozen-v2-paper-contract-portfolio.cjs) records trial IDs from each true `headless.runMatch` label and binds accepted Store prompt actions back to their per-game original root ledger. A mismatch fails the whole release classification. It carries all original 32 raw rows, errors and caps in the native result, rather than dropping failed games.

## Verified pure regressions

The five new [Store/preflight regression tests](../../tests/agent41-paper-prompt-contract-portfolio.test.cjs) ran as part of **109/109 passing pure tests** in [manual existing-workflow CI 41329960274](https://github.com/FlareZ123/experiment-01/actions/runs/41329960274). They cover:

1. Invalid original Camping Gear count rejected **before any Store mutation**, while valid one-card own-deck selection settles and Store descriptor restores.
2. PutDamage zero-cap and partial damage packet both vetoed before mutation; a nonnegative passing branch remains explicitly unverified.
3. Exact native reducer-marked Volt Cyclone rejects a nonexistent Bench recipient, accepts occupied own Bench, and restores the reducer.
4. Night Watch-like hidden-hand prompt stays unverified and never serializes concealed card names in the audit.
5. The frozen wrapper records trial-level prompt counts, restores its headless export and fails to claim full 32-arm parity on an intentionally partial fixture.

These are **synthetic/pure regressions**, not a compiled native original-source release test.


### 17:16 UTC independent-validator correction and second pure validation

After the first 109-test pass, a code review found that the earlier shared damage helper returned `NATIVE_PROMPT_VALIDATE_FALSE` **before** checking an independently proven zero-cap target. Treating that native error as sufficient proof of paper invalidity would be too strong, while ignoring it would mask a genuine zero-cap violation. The unified boundary now evaluates its own explicit zero-target, integer-damage and whole-packet negative predicates **without consulting an untrusted native validator first**. A sixth pure test demonstrates both required properties: a zero-cap assignment is rejected before mutation even when `prompt.validate()` is false, and a passing zero-damage reply stays `PAPER_PROMPT_UNVERIFIED` despite the native validator returning false.

The revised **110/110 pure regression tests passed** in [manual CI 41330614593](https://github.com/FlareZ123/experiment-01/actions/runs/41330614593). Its subsequent frozen-v2 source inspection again failed correctly, because other current research commits changed the canonical runner blob to `9c226dc5778508d3aaaa84a8c7500ac4465844e6`. This second job did not request, execute or retry the safety-blocked full native portfolio. The latest unified code is now pure-tested, while its historical native overlay remains uncompiled and competitively unqualified.

## Frozen source mismatch and attempted native release path

The same [CI 41329960274](https://github.com/FlareZ123/experiment-01/actions/runs/41329960274) **failed after all pure tests passed**, at the deliberate frozen-v2 inspection gate:

```text
Source changed without a frozen-profile re-audit:
simulation/evaluation/agent41-bilateral-v2-development.cjs
actual Git blob:   fdf32842b9216ba9137cb06a9822c101c78ad429
frozen Git blob:   7d6e515eecbaed1fa638191462b45f0daa2bf60e
```

The original successful v2 run was pinned to research head `86e0410847a953a73fdef7f76865493e75ac1c7f` and vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Consequently, simply running a changed main checkout as an unchanged v2 would be invalid.

An isolated path was added **inside the existing manually dispatched workflow**, rather than a new workflow: it temporarily checks out that exact original baseline commit in the runner and overlays only six explicitly named research-owned prompt-audit files from the triggering commit. The original frozen v2 profile/inventory and both fixed 60s remain untouched in GitHub. The new audit is independently versioned, and cannot inherit the historical profile's source-closure certificate.

**Execution qualification remains blocked.** The attempt to dispatch the new full 32-arm portfolio workflow was explicitly denied by the host safety check. It was **not rerouted or retried** and produced **no native replay or 32-arm independent paper-verdict counts**. The overlay workflow code has not been compiled or executed; do not claim its restoration/parity assertions have passed in native Twinleaf. The original archived full 32 remain the only full-denominator evidence so far.

## 17:22 UTC live-Store denominator correction

Agent39's [actual original-store four-arm artifact correction](../../communications/agent41/20261101T171300Z_agent39_aux_store_prompt_denominator_correction.md) exposed a major false denominator: his original rank6 screen counted **10** verified Volt prompt dispatches from **five unique live source prompt roots**; its 729 counted Store prompt attempts vastly exceeded the 174 genuine live-root actions. The additional attempts arose from cloned/auxiliary Store executions and repeated observation, not independent physical games.

The unified boundary now uses the **first real AddPlayerAction Store per registered original trial** to mark a unique live Store, following the independently established native [accepted Energy prompt witness](../../simulation/twinleaf/accepted-energy-prompt-public-witness.cjs). Its version is now `agent41-unified-paper-prompt-contract-portfolio-v2-live-store-only`. Every auxiliary ResolvePromptAction is explicitly counted as an auxiliary attempt, excluded from the live native denominator and from paper verification, and left untouched by the guard. Positive Iron Thorns reducer marking also requires the matching actual live Store; each registered trial gets a separate identity rather than reusing the first game's Store.

The full 32-arm wrapper now requires **32 unique real AddPlayerAction Store identities**, zero pre-live prompt attempts, and accepted trial prompt counts equal to the native root-action ledger. All these conditions are independent release gates. The Store guard additionally preserves redacted **per-trial** event provenance to support later ordinal joins. A complete guaranteed ordinal-to-private-selected-target mapping has **not** been implemented.

Two additional pure regressions assert that a genuine two-trial live Store is isolated from an auxiliary Store and that both Store/reducer descriptors restore on an exception. The resulting **112/112 pure tests passed** in [CI 41331086222](https://github.com/FlareZ123/experiment-01/actions/runs/41331086222). The next frozen-v2 inspection again rejected an updated current runner SHA (`a1d73be6bc07853a28cd2f350f2433e0e2399d5f`) against the same preserved historical expected SHA. No full native replay occurred.

**Caution:** the actual live-Store provenance assumption is grounded in pinned witness source and synthetic dual-Store tests, but the new 32-arm overlay remains **uncompiled and unverified in native games** because the host denied its dispatch. Native credential, hidden-information and official clock gates remain separate. An attempted standalone root-ordinal join file creation was explicitly blocked by host checks and was not retried. The existing per-trial receipts and counts therefore cannot be represented as an independently certified full prompt source/selection join.

## Source-derived baseline by independent paper-prompt status

| Historically observed native prompt family | Historical resolutions | Independent full printed-paper prompt verdict in frozen archive | Newly implemented relevant guard |
| --- | ---: | --- | --- |
| WaitPrompt | 3,431 | 0 independently verified | Unverified |
| ChooseCardsPrompt | 271 | 0 independently verified | Camping Gear only if positively source-stamped; Nine Night Watch original roots currently unverified |
| AttachEnergyPrompt | 27 | 0 complete-effect certified; [27/27 matching public Volt Cyclone transfer *shape*](agent17-frozen-v2-prompt-denominator-20261101.md) | Positive native Volt Cyclone marking and recipient/energy preflight |
| ChoosePokemonPrompt | 69 | 0 independently verified | Unverified |
| Other 9 families combined | 533 | 0 independently verified | General explicit unverified |
| **Total** | **4,331** | **0 complete paper-prompt certificates** | **No native portfolio run yet** |

The historical archived status is a **gap inventory**, so the displayed zeros cannot establish that replies were illegal or paper-valid. When an opt-in full Store replay becomes permitted, compare the entire profile using the same frozen original physical deals and preserve the 32/32 attempt denominator, accepted-paper verdicts by seat/family, physical effects and source-turn return, every veto, native error, cap and noninterference check. Then register a separate source-ranked field deck discrimination experiment.

## Current deck decision

No fixed 60 can be promoted from this work. **32/32 original Top 32 archetypes are identified, but only 29/32 exact original opposing 60s are authenticated**. The missing final ranks are 23, 25 and 28. All candidate comparisons remain developmental; **0 competitive-qualified games and no demonstrated 99.5% fixed-deck win rate**.

**Permanent new files:** `simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs`; `simulation/evaluation/agent41-frozen-v2-paper-contract-portfolio.cjs`; `tests/agent41-paper-prompt-contract-portfolio.test.cjs`. **Modified existing manual workflow:** `.github/workflows/agent41-rank6-grouped-denial-source-panel.yml`, with an explicit paper portfolio input disabled by default.

# Agent40: owner-visible Jet Energy Bench switch funding, development proposal

**30 October 2026 | Normal research mode (RNG 6) | Agent 40 | Original Aichi Top32 paper Expanded**

## Independent gap

The existing `agent17-public-context-special-energy.cjs::choosePublicContextSpecialEnergy` deliberately declines a Jet Energy attachment to a Benched Pokémon, because Jet's mandatory switch demands a separate Active-position decision. The existing `actor-energy-payability.cjs` already represents Jet's Colorless unit, and the canonical `agent34` actor dispatch already supports a typed `attach-special-energy` with `slot:'bench'`. This work adds a small missing action proposal and **reuses** the existing payability and action machinery rather than adding a second Energy model or a new simulator.

The exact [29-source original 60 manifest](full-decklists.json) contains **five Jet Energy PAL #190 copies across three authentic opponents**: rank **2 (two copies)**, rank **7 (one)**, and rank **15 (two)**. The [Special Energy census](agent41-paper-field-special-energy-numeric-coverage-20261030.md) gives the same total of five but its prose mentions only rank 2 and 15; the rank-7 original adds the remaining copy. A named card's presence proves neither a playable root nor a beneficial line.

## Executable contribution

- [`agent40-public-jet-bench-frontier.cjs`](../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs) proposes one real held Jet card to an actual Bench index if the Active has no known payable printed attack and the Bench target gains a publicly payable, positive-*printed*-damage, non-GX attack with that Colorless unit.
- The proposal screens visible Energy quotas, played-this-turn restrictions, public attack-lock and status flags, and Temple of Sinnoh's suppression of the forced switch. Version 2 also protects face-up Active-only passive Abilities such as Stoutland's Sentinel and Iron Thorns ex's Initialization from being sacrificed by an automatic mobility choice. It considers only the acting player's own hand and two public boards, using the existing `publicSpecialAttackPayable` cost model.
- [`agent34-actor-only-root-policy.cjs`](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) calls it **before the generic Basic Energy attachment** only with `jetBenchSwitchRoot:true` or `AGENT40_JET_BENCH_SWITCH_DEV=true`. **Default behavior is unchanged.** The existing typed `attach-special-energy` action constructor supplies the physical Bench target to the genuine native Store.
- The [ten pure regression tests](../../tests/agent40-public-jet-bench-frontier.test.cjs) cover a selected Bench position and hand index, paid Energy quota, lock, Temple, no positive printed damage, printed GX attack exclusion, preserving an already payable Active attack, hidden-zone perturbation and the default-off integration into the actual actor root with the existing symbolic Energy matcher.

The initial eight isolated pure tests **passed locally** in Node. The ninth shared-root integration test was subsequently **executed and passed** together with the other eight under the existing manual-only [Aichi benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml), [Actions run 41135017827](https://github.com/FlareZ123/experiment-01/actions/runs/41135017827), job `test-benchmark`, step `Check default-off owner Jet Bench switch proposal and shared symbolic Energy matcher`. This test was observed to run, not skipped; it still uses synthetic, detached actor data and does **not** settle Jet's native card effect. A tenth pure regression for Active-only passive-lock preservation was added after this CI run and still requires rerun. No on-push workflow was introduced.

## Executed pinned native Store mechanical witness

[Compiled manual Actions run 41135340734](https://github.com/FlareZ123/experiment-01/actions/runs/41135340734), checkout `991cbe9a2373dbf11b08f889dc8d902ef037e9c3`, genuinely compiled pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The `Verify native Jet Bench switch and printed attack under both physical seats` step **executed**, returned **success**, ran **2 tests**, **2 passed**, **0 failed**, **0 skipped**. Full workflow **failed later** on a separate `agent49-owner-treasure-native-prompt-bridge.test.cjs` `this.resolvePrompt is not a function` test-seam error. The later failure does not negate the separately executed Jet step and is not counted as a green overall workflow.

Actual native Store ledger lines `AGENT40_NATIVE_JET` were identical by expected mechanics in seat 0 and seat 1:

| Physical seat | Owner typed held card | Pinned native effect, physical zones | Following native attack | Post-attack turn |
| --- | --- | --- | --- | --- |
| **0** | Jet Energy PAL to Bench index 1 | Active **Dratini OBF** switches to Bench index 1, **Doduo MEW** with attached Jet becomes Active; no attachment prompts | **Reckless Charge** deals **30** to opposing Active and **10** self-damage; 3 accepted Wait prompts | Opponent receives their turn and an explicitly staged opponent Pass returns the turn to owner |
| **1** | Same physical setup/typed action | Same printed Pokémon positions and attached Jet; no attachment prompts | Same 30 damage, 10 self-damage, 3 accepted Wait prompts | Same explicit staged opponent Pass |

Both tests assert the baseline actor root is `pass`, while `jetBenchSwitchRoot:true` proposes the real Bench attachment; after its actual native effect the existing shared root returns the newly payable **Reckless Charge** attack and native Store settles it. Neither owner's held Energy nor opponent private hand is misread. [Executable two-seat native test](../../tests/agent40-native-jet-bench-switch.test.cjs).

**This proves a staged mechanical opportunity only.** The opponent Pass is explicitly scripted and not an independent competent response; the setup is manufactured from printed cards, not a sampled original Aichi 60. Zero natural source-dealt Jet opportunities or completed competitive games are attested.

## Registered natural original-source owner-root observation

The [frozen independent-seed plan](registrations/agent40-jet-natural-source-census-20261030.json) was committed before gameplay evaluation (`git-blob 7684f6c81861b777b6ce19ab016042c9d12329f1`): **12 genuine-source development attempts** covering all three known Jet sources (ranks 2, 7 and 15), both physical source seats, two independently drawn seeds each, with maximum 200 native actions. Opposing comparator is fixed authenticated source rank 1, and the original native bot remains unchanged. This is a **read-only opportunity census**, not a win test.

The [passive live-Store observer](../../simulation/twinleaf/agent40-live-jet-root-census.cjs) rejects speculative bot-clone decisions, records only the acting owner's detached hand and the two public boards, and never replaces the baseline bot action. The [registered driver](../../simulation/evaluation/agent40-jet-original-source-census.cjs) preserves all scheduled attempts, including aborted/capped games, and uses a locked atomic artifact writer. The [four pure tests](../../tests/agent40-live-jet-root-census.test.cjs) cover frozen original selection, both genuine-seat mock boundaries, passive behavior and restoration. **Manual CI 41136352852** `test-benchmark` succeeded including this observer step and the ten Jet decision tests; no compiled native matchup from this 12-arm plan has yet been run. A proposed optional manual workflow addition was blocked by tooling safety checks, so no new CI path for the full scout was installed; future agents with a supported compiled runtime can execute the frozen driver, preserving all original seeds.

A non-match mathematical baseline for the original 60s: an unconditional seven-card draw from the whole 60 contains at least one Jet with probability `1-C(60-k,7)/C(60,7)`, equal to **22.146893%** for `k=2` (rank 2 or 15) and **11.666667%** for `k=1` (rank 7). This is *before* Basic-starter-conditioned mulligans, Prize setup, later draws, Energy timing and Bench requirements; it is not a measured playable Jet-switch rate.

## Qualification and limits

**This is a candidate policy action family with staged native mechanics verified, not a competitive performance experiment.** The following remain unverified: naturally occurring Jet opportunities in an authentic physical original-source 60 deal; owner information and legal responses along an unforced full-game continuation; how often this chooser beats competing Basic Energy, Item, Supporter, hold or lock-preserving alternatives; independent opponent response and matchup outcomes; cross-printed paper equivalence.

The action policy uses a coarse printed-damage threshold and excludes GX and complex attack effects deliberately. It does not certify tactical value, rule-equivalence of every source printing, or opponent competence. In particular, a known payable Active attack is conservatively retained; an optimal strategy may differ. The existing common actor and fallback are still **not certified owner-information-safe for every branch**.

The current benchmark remains **29/32** authenticated original final-rank 60s (ranks **23,25,28** unresolved), **zero competitively qualified games**, no established single winning 60 and **no demonstrated 99.5% game win rate**.

## Required next integration witness

In the one canonical bilateral runner, opt in the same `AGENT40_JET_BENCH_SWITCH_DEV` root for **both physical players**. On a prior-registered exact source deal, count held Jet owner roots → structural candidates → proposed typed attach → Store accepted → forced switch resolved → later owner attack root → native attack settlement → source response. Archive both successful and censored/failed arms; compare against default-off and competing moves without inspecting concealed opposing cards. Until this witness exists, keep the Jet lane development-only.

**Commits:** [selector](https://github.com/FlareZ123/experiment-01/commit/172b4e567a86f094d9a8578306f392ba22fa1737), [pure tests](https://github.com/FlareZ123/experiment-01/commit/3cb6ec676b7afb39fa5efcc8209f6f99590afb3a), [shared opt-in](https://github.com/FlareZ123/experiment-01/commit/4c7ba034ae106814737c78110424497e192d1e5f), [integration test](https://github.com/FlareZ123/experiment-01/commit/67837dc879cf704ccc4f5ee3d55f4449f225a023).

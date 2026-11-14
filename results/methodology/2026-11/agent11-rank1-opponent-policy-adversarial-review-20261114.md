# Agent11 adversarial review: rank-1 Shadow Rider opponent policy

**14 November 2026 | Static source and test review | No game or matchup evidence**

Reviewed:
- `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` (51-case policy)
- `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`
- `results/methodology/2026-11/agent11-original-rank1-raihan-third-psychic-nightwatch-prize-20261109.md`
- The repository card pool, especially `resources/cards/en/sm2.json` (Tapu Lele-GX / Energy Drive) and `resources/cards/en/sv9.json` (Lillie's Clefairy ex / Fairy Zone).

## Findings requiring correction

### 1. False-positive Supporter detection: Lillie's Clefairy ex

`hasSupporterInHand()` matches `/Lillie/` against every own-hand printing. That also matches **Lillie's Clefairy ex JTG 56**, which is a Pokémon, not a Supporter.

This helper gates both:
- playing Tapu Lele-GX when no Supporter is held; and
- searching Tapu Lele-GX through Wonder Tag / card-search priorities.

A hand containing only Lillie's Clefairy ex can therefore be misclassified as already containing a Supporter, suppressing a legitimate Supporter-access line. The current Tapu Lele test at test line 1376 contains only Tapu Lele-GX, while the Mysterious Treasure test's Clefairy is a deck choice, not an own-hand card; neither catches the false positive.

**Required correction:** match actual Supporter identities (preferably exact card-type/printing data or an explicit Supporter allowlist), not the substring `Lillie`. Add regressions where Lillie's Clefairy ex is in hand with no Supporter, covering both Tapu Lele play and Tapu Lele search.

### 2. Energy Drive damage is computed from the wrong Pokémon and incorrectly applies weakness

The current `totalEnergyCount()` sums Energy attached to every Pokémon on both boards. `scoreAttack('Energy Drive')` multiplies that total by 20 and then applies `psychicWeaknessMultiplier()`.

The repository's own Tapu Lele-GX card entry in `resources/cards/en/sm2.json` states: “This attack does 20 damage times the amount of Energy attached to both Active Pokémon. This damage isn't affected by Weakness or Resistance.”

The policy therefore overstates Energy Drive whenever either player has Benched Energy and can also incorrectly double its damage against a Dragon Active under Fairy Zone. This is a ranking defect even though the native engine remains responsible for legality and resolution.

**Required correction:** count Energy on only the two Active Pokémon and do not apply weakness/resistance to Energy Drive. Add a regression with Benched Energy and a Dragon target/Fairy Zone, proving neither changes Energy Drive's damage estimate.

### 3. Acerola's high-priority trigger and target are not bound tightly enough to the Pale Moon threat

The high-priority Acerola branch checks `priorPaleMoon(request)`, checks that the current Active is Latias, but obtains `latias` through `damagedLatias(own)`, which searches the whole board. It does not require the current Active Latias itself to have damage counters. A damaged Benched Latias can therefore trigger the high-priority branch while the Active Latias is undamaged.

The later Acerola prompt scorer ranks every damaged Pokémon by damage, with a Latias bonus. If another Pokémon is sufficiently more damaged, it can select that other Pokémon and leave the Pale Moon-threatened Active Latias in play.

The current single-Latias test at line 297 does not cover either case.

**Required correction:** bind the emergency branch to a damaged Active Latias and, when the decision is specifically to escape the observed Pale Moon threat, prioritize that Active Latias in the Acerola prompt. Preserve a separate general-healing heuristic for other situations. Add both counterexample tests.

### 4. Raihan and Underworld Door incorrectly share an energy-target priority

`scorePokemonChoice()` treats `mode === 'underworld' || mode === 'raihan'` as the same targeting problem and always scores Latias below two Psychic above Trevenant below three Psychic. That is correct for the later post-GX Underworld Door branch: the native owner-response fork attaches the two recovered Psychic to Benched Latias, enabling its future Eon Blade line.

It is **not** correct for the earlier original turn-18 Raihan line. The native continuation `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs` requires the Active Trevenant & Dusknoir-GX precondition and dispatches both the Raihan-recovered Energy and the ordinary hand attachment to `SlotType.ACTIVE`. Those two Psychic fund Pale Moon-GX. If Latias is also on the Bench with fewer than two Psychic, the current shared scoring branch will choose Latias first and divert the Raihan attachment away from the documented Active attack.

The current Raihan target test at test line 931 asserts Latias for an Eon Blade setup, but there is no complementary test for the frozen Active-Trevenant/Pale-Moon source state.

**Required correction:** separate Raihan and Underworld Door target scoring. For the documented turn-18 source state, prefer the Active Trevenant when it is the current Pale Moon-GX attacker and needs the Psychic funding; retain Latias-first for the later Underworld Door branch where the source evidence supports it. Add both tests so the policies cannot regress into one another. This is a direct source-state fidelity issue, not a claim that either line wins a full game.

### 5. Latias's Eon Blade target count ignores Dimension Valley

The same shared target block always stops prioritizing Latias at two Psychic Energy. The repository card entry `resources/cards/en/sv8.json` gives Latias ex SSP 76 Eon Blade a printed cost of Psychic, Psychic, Colorless. Two Psychic pay it only while Dimension Valley is actually active for the Psychic Pokémon; without that Stadium (or while its effects are suppressed), the Colorless requirement remains and a third Energy is needed.

The current Underworld Door test at line 356 is named as a “two-Energy Eon Blade line”, but its fixture calls `player()` without `stadium: ['Dimension Valley PHF']`. The helper's default stadium is an empty array. It therefore tests a state in which two Psychic do **not** fund Eon Blade, and it does not exercise the second attachment after Latias reaches two.

**Required correction:** compute Latias's Eon Blade funding threshold from the observed, actually active Dimension Valley state. Treat unknown stadium-effect suppression conservatively; do not assume the one-Colorless reduction when the public restriction fields are absent. Add a sequence regression for (a) active, unsuppressed Dimension Valley: stop at two; (b) absent or suppressed Dimension Valley: continue to three; and (c) unknown suppression: fail closed or conservatively require three. Fix the existing test fixture or rename it so its claimed cost condition matches its actual board.

## Source-faithful parts worth preserving

The current policy's first-order choices are consistent with my native rank-1 source-response report:

- In the observed post-GX response state, rank 1 had Active Girafarig, Benched Latias, three Psychic in its own discard, Tulip, two Shadow Rider Calyrex VMAX, Acerola and Unfair Stamp in hand. The policy's Tulip score correctly outranks the general Acerola fallback in this state.
- The native source-owned Tulip branch recovered all three Psychic, evolved both eligible Shadow Rider V, and used both Underworld Door Abilities to attach one Psychic each to Latias while drawing four cards total. The policy's Underworld Door priority (Latias until two Psychic, then other attack targets) is directionally consistent with this branch.
- The two isolated tests (Tulip action at line 252 and Underworld Door target at line 356) do not yet prove the complete sequence. Add a sequential regression that re-evaluates the observation after the first attachment and verifies the second Door still targets Latias until its two-Energy line is funded.

Do not over-generalize the source branch: the report also contains a separate Get Lost line and a Latias-recharge line. They are alternatives from the same source-dealt state, not independent matchup wins.

## Heuristics needing stronger validation

### Promotion

The promotion score uses a fixed `remainingHp > 150` threshold plus prize liability. In the current test it selects Shadow Rider V (210 HP, two prizes) over Shadow Rider VMAX (320 HP, three prizes), which is a defensible conservative tie-breaker against a one-Prize 90-HP Active. However, the policy does not inspect the opponent's visible attacks or compute a 150-damage threat. The test title currently implies a threat-aware calculation that the implementation does not perform.

Either label this as a static durable/low-prize heuristic or make the threat comparison depend on the actual public opponent attack/board information. Add cases where the visible threat is below and above the threshold, where weakness changes the threat, and where no promotion candidate survives.

### Raihan's third-Psychic search

My source-dealt report establishes a specific conditional resource route: after the prior Raihan attachment and ordinary hand attachment, the **third Psychic searched by Raihan** is needed to fund Trevenant & Dusknoir-GX's printed three-Psychic Night Watch on the returned turn. The current code can select Psychic when the higher-priority setup targets are already satisfied, but the existing Raihan search test only asserts that a VMAX is preferred over Psychic. It does not freeze the report's state and prove the third-Psychic choice.

Add a source-state regression where the VMAX count is already satisfied, Tulip is already held, no higher-priority search target is justified, and Psychic is the resource that completes the three-Psychic Night Watch line. This is a policy test, not evidence that Night Watch wins the game.

### 6. Mimikyu Copycat of Night Watch remains an explicit uncovered response branch

The policy's `copycatTargetAvailable()` and Copycat attack chooser both exclude `Night Watch`. This is consistent with the current worker boundary: the protocol rejects direct or copied Night Watch physical-random prompts, which must remain host-only. Do **not** weaken that fail-closed worker rule or pass the random-card choice to the worker.

However, my source report identifies a conditional original-rank1 response hypothesis: use Sky Field and Mysterious Treasure to make room/find Mimikyu, evolve the two held Shadow Rider V, use Underworld Door to fund Copycat, then copy the opponent's non-GX Night Watch. This has not been executed natively and is not an established optimal line. The current rank1 policy deliberately does not discover or execute it, so the 51 pure tests do not establish complete response coverage for this branch.

**Required handling:** retain the worker rejection; record this as a host-owned integration/coverage gate. Only after trusted host-side copied-attack provenance and host-only physical prompt resolution are implemented should the opponent policy consider the Copycat line. Keep it explicitly untested until then.

## Evidence boundary

Agent6's 51/51 result is reported as a direct V8 harness run using the actual worker validators. I did not independently execute that harness or an Actions run in this review. The tests are useful contract exercises, not native games, independent opponent-competence certification, matchup results, or deck-strength evidence. The full-game and 32-rank policy gates remain separate.

**Recommendation:** fix findings 1–3 before integrating this policy into the shared contract-only lane; add the sequence and source-state regressions before treating its rank-1 response coverage as adequate. Do not dispatch a fixture or make a matchup claim from these changes.

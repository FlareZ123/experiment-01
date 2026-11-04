# Agent 33: frozen Issue #25 v6/v11 original-source root custody audit

**4 November 2026. Evidence class: native Store root-ledger reanalysis. Competitive games: 0.**

## Inputs and reproducibility

The control is joined, symmetric Issue25 v6, original immutable CI [41894027367](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367), artifact **13353289881**, extracted `issue25-mirrored-v6.json`, SHA-256 `7ce7d32391074d9802a92c56056641b89b71ac16cd1e52f38f0fb2d0933b7f59`.

The treatment is Agent16's opt-in canonical inner Battle VIP Pass v11, CI [41907884146](https://github.com/FlareZ123/experiment-01/actions/runs/41907884146), artifact **13360683037**, extracted `agent16-issue25-v11-canonical-vip-native.json`, SHA-256 `201153b45819c1e0a555d8e0bd1494f5641101a284ab32c0c47ed7ab4110e40f`. Both full ZIP SHA-256 checksums were independently recomputed from downloaded connector artifacts. Pinned Twinleaf gitlink is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

For each of eight original trial IDs, the audit resolves the **original-source physical seat** and filters the retained public native Store action ledger for that seat's non-`ResolvePromptAction` roots. It counts `PassTurnAction`, `PlayCardAction`, and `AttackAction` separately, then compares the ordered sequence of (global turn, kind, card, attack) between v6 and v11. Action ordinals are deliberately ignored for sequence alignment because additional native prompts shift later ordinals. The original rank11:102:A champion error row in v6 has no independently published source-seat field, so its seat 1 is **registration-derived**, cross-checked against v11's direct physical-seat field. This error is retained.

## Eight original-source attempts

| Registered source trial | Source seat | v6 source Pass / plays / attacks | v11 source Pass / plays / attacks | Native horizon |
|---|---:|---:|---:|---|
| 6:100:A:champion-reference | 1 | 5 / 0 / 0 | 5 / 0 / 0 | both cap48 |
| 6:100:A:new-moon-lockbreaker-v1 | 1 | 5 / 0 / 0 | 5 / 0 / 0 | both cap48 |
| 6:101:B:champion-reference | 0 | 5 / 0 / 0 | 5 / 0 / 0 | both cap48 |
| 6:101:B:new-moon-lockbreaker-v1 | 0 | 4 / 0 / 0 | 4 / 0 / 0 | both cap48 |
| 11:102:A:champion-reference | 1 (registration-derived in v6) | 2 / 0 / 0 | 2 / 0 / 0 | both engine error at root25 |
| 11:102:A:new-moon-lockbreaker-v1 | 1 | 5 / 1 / 0 | 5 / 1 / 0 | both cap48 |
| 11:103:B:champion-reference | 0 | 6 / 2 / 0 | 6 / 2 / 0 | both cap48 |
| 11:103:B:new-moon-lockbreaker-v1 | 0 | 4 / 1 / 0 | 3 / 1 / 0 | both cap48 |

**Frozen registered denominator: 8/8. Full pretreatment physical deal parity: 8/8.** The original-source side performed **zero attacks in both profiles**, and its rank-6 side performed **zero non-Pass roots** across all four arms in either profile. The rank-11 source side recorded four `PlayCardAction` roots in each profile, consisting of one Squawkabilly ex, two Darkness Energy, and one Crobat V, with no attacking roots.

Across both ranks, **v6 source: 36 Passes + four plays; v11 source: 35 Passes + four plays**. The sole missing v11 source Pass occurred after the retained source turn 6 in `11:103:B:new-moon-lockbreaker-v1`; the v11 candidate took additional native roots, so the 48-root cap censored the subsequent source turn 8. Every v11 source non-prompt action sequence equals a prefix of the corresponding v6 sequence. This is a statement about *observed Store actions* only; it does not establish that every underlying source game state is the same after the candidate's first-turn VIP intervention.

## Interpretation and requested next gate

Agent16's reported two accepted VIP/Bench actions were **candidate-side** improvements, and this independently verified source-root comparison finds no corresponding source-side resource or attacking conversion within these censored windows. It does not prove that rank6 was permitted to play any held Trainer, pay an Energy attachment, or attack; owner-visible hand and printed-cost competing-root evidence must be attached to the source decisions before calling any Pass strategically wrong. Iron Thorns' passive Ability-lock board exposure must be assessed separately, even when no source root other than Pass was selected.

For the next steward-selected executing closure, record **source** and candidate owner-root denominators separately: physical owner decision, paper-eligible affordable competing options, actual selection versus Pass, correct exact payment/target, settled board/attack/Prize/control payoff, and meaningful opponent reply. Keep root48 truncation and the root25 error as non-games, and retain natural mismatched candidate-deck source deals in the primary deck-choice estimand. Follow the [latest Critic source-conversion gate](../../communications/broadcast/2026-11/20261104T2217Z_critic_source_side_conversion_and_ci_yield_gate.md).

**No new deck was selected. No source-side paper opportunity frequency, competitive win rate, or 99.5% claim follows from these roots.**


## Mechanistic follow-up: Special Energy-only original sources

A separate **source-list and selected-policy static audit** identifies a structural explanation worth testing in the same full running closure. The authenticated `results/aichi-2026/full-decklists.json` contains **seven original source decks with zero Basic Energy cards**:

| Rank | Archetype | Basic Energy copies | Special Energy copies |
| ---: | --- | ---: | ---: |
| 4 | Raichu/Electrode | 0 | 12 |
| 5 | Mew/Genesect | 0 | 4 |
| 6 | Iron Thorns | 0 | 8 |
| 7 | Snorlax Stall | 0 | 4 |
| 17 | Raichu/Electrode | 0 | 12 |
| 24 | Iron Thorns | 0 | 8 |
| 29 | Iron Thorns | 0 | 8 |

**Method:** enumerate all `decks[].cards` entries whose `category==='Energy'`; count a printing as Basic only if its exact card name is one of Grass, Fire, Water, Lightning, Psychic, Fighting, Darkness, Metal or Fairy Energy; all other listed Energy names are Special. The seven zero-Basic ranks are among the 29 authenticated source card-name/count inventories. Rank 11 has eight Basic Darkness Energy and no Special Energy, providing a concrete source-composition contrast.

The current canonical actor's default `chooseActorRootIntent` in [Agent34 root policy](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) offers a normal hand attachment through `catalog.basicEnergies.has(...)` and builds its attack Energy accounting from attached Basic Energy names. Both its Special Energy attachment proposal (`chooseSpecialEnergyIntent`) and recognition of attached Special Energy units (`specialEnergyUnits`) are guarded by `options.specialEnergyRoot===true`. The public root policy sets `specialEnergyRootOptIn` from explicitly injected `deps.specialEnergyRoot` or the default-off `AGENT3_SPECIAL_ENERGY_ROOT_DEV` environment flag. The [selected v6 entry](../../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs) does not itself turn on this flag; the shared common-policy stack contains Field Blower, Stone recipient and Star Alchemy resource adapters, which also do not constitute a generic Special Energy attachment plan.

Therefore **under v6's unenabled generic Special Energy root, the actor cannot propose its normal hand attachment or correctly count attached Energy costs for any of the seven all-Special source lists by those generic code paths**. The actual native eight-arm rank-6 zero-play result is consistent with this mechanism; it does **not** prove the mechanism was the exclusive reason for every Pass. Alternative card-effect accelerators, printed attacks, hidden owner hand, item locks and actual feature environment must still be inspected before attributing a specific root's choice. In particular, Snorlax stall can pursue a nonattacking objective, so no blanket claim that all seven decks require an immediate attack follows.

**High-priority falsifier for the Issue25 steward:** print the actual `root.specialEnergyRootOptIn` and owner/source physical seat in one selected native receipt, then compare a genuine held Special Energy rank-6 source root under the existing reversible [Agent3 Special Energy frontier](../../simulation/twinleaf/agent3-special-energy-frontier.cjs), with paper-legal recipient, attack Energy interpretation, actual native Store payment, and opposing reply. Keep this initially default-off and do not silently promote the pure structural screen to a competitive policy.

# Rank-6 original-Store K1 DCE recovery: real Search + Speed attachment, no attack

**Agent 49 | 21 October 2026 | development-only native A/B, no competitive-qualified games.**

## Causal question

The published rank-6 Aichi Iron Thorns 60 contains one Double Colorless Energy, four Speed Lightning Energy, two Capture Energy and one Spiky Energy. A source-first historical policy reaches an authenticated own-deck Guzma & Hala search and aborts if the only DCE is absent. Does a K1-only substitute choice change the real Store actions without inspecting hidden Prize or deck contents before a search?

The opt-in `k1AlternativeEnergy` requires the genuine acting-owner deck `ChooseCardsPrompt`, verifies `prompt.cards===owner.deck`, declines substitution when DCE is searchable, and then chooses Speed, Capture or Spiky from that legally visible deck. It preserves native `prompt.validate` and existing generic fallback. The only new source action after a search is a native manual attachment; this is **not** marked as a completed `Volt Cyclone`. The option is **off by default**. Pure tests reject nonexistent energies, unrelated Energy and a still-searchable DCE.

## Frozen original-Store comparison

- Pinned checkout: `24a764b3775fd584a34630334d0685b94b9d4d83`; Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; Node 22, `npm ci`, pinned native compile.
- Existing manual `aichi-benchmark-stats.yml`, [CI 39618482555](https://github.com/FlareZ123/experiment-01/actions/runs/39618482555). All scheduled jobs completed successfully; rank-6 K1 job passed pure regressions and 8 authentic bounded Store game attempts. The independent ordinary benchmark job also passed.
- [Full archived two original panels and comparator](https://github.com/FlareZ123/experiment-01/actions/runs/39618482555/artifacts/12353143565), artifact ZIP SHA-256 independently downloaded and verified: `3a669df1fb5d7482383c46ed1b56025d8f341a1629dff3e22dcc3fc3fb4231e4`.
- Four source-first retrospective physical deals per arm: rank6/seed `407516727` versus unchanged champion 60 and New Moon 60, rank11/seed `482443328` versus the same two candidates. Aichi source occupies real seat 0 and starts first. For **each of the four ON/OFF pairs**, `sourceDealEpochs.deals[0].fullPhysicalDealDigestSha256` matched; no deck cards, seeds, seats, candidate inventory or other flags changed.
- Opt-in flag `AGENT49_RANK6_K1_ALT_ENERGY_DEV` is the only A/B variation. Common actor wrappers, paper Supporter guard, mandatory option fallback and source scripts were identically enabled. The comparator preserves failed and capped rows rather than filtering by outcomes.

## Native findings

| Frozen source-first fixture | OFF source turn 3 | ON source turn 3 | First changed root and observed endpoint |
| --- | --- | --- | --- |
| Rank6 vs champion | G&H search abort: planned DCE unavailable; Pass | K1 backup **Speed Lightning Energy** chosen; source played Thunder Mountain and attached Speed | Root 25: Pass vs native `PlayCardAction Thunder Mountain`; ON root 26 native `PlayCardAction Speed Lightning Energy`. OFF 54 vs ON 56 roots; both source zero attacks, unchanged native candidate engine terminal, final Prize counts `[6,4]` |
| Rank6 vs New Moon | Same G&H missing-target abort | Same K1 Speed recovery, Thunder and attached Speed | Same first divergence at root 25 and Speed root 26. Both **260-root censored** and source zero attacks, final Prize counts `[6,4]` |
| Rank11 vs champion | Source first Boost Shake/Garbodor setup completed | Exact same native actions | 89-root engine terminal in both arms; identical complete root-action histories |
| Rank11 vs New Moon | Source first Boost Shake/Garbodor setup completed | Exact same native actions | 225-root engine terminal in both arms; identical complete root-action histories |

All four paired real first-episode deals are identical and source first is verified from actual draw logs. The first two rank6 differences occur on physical source seat **0**, with valid Store-executed `PlayCardAction` roots and matching `sourceAudit.turn3.k1BackupEnergyName='Speed Lightning Energy'`. The rank11 rows are exact negative controls; no rank6 actor option was relevant.

The native root and final-board evidence supports successful **search and attachment**, not sustained charge, turn-5 attack readiness, source winning pressure, or better results. For rank6 champion the candidate engine terminal remains the same. The rank6 New Moon rows remain censored. The rank11 opponent policy also remains development-only.

## Evidence quality and next target

This is a policy-choice difference demonstrated under exact authentic source-first decks. Because both policies still delegate substantial decisions to the generic native bot and published source tactics are incomplete, **all 8 engine attempts remain unqualified for competitive inference**. There is no claimed win-rate difference and no evidence for 99.5%. The full Aichi field still has 29/32 exact source 60s, missing ranks 23, 25, 28.

The next falsifiable owner-only question is whether a rank6 source with its newly attached Speed, public Thunder Mountain, and a legitimate subsequent own-turn Special Energy attachment can reach and settle `Volt Cyclone`, while preserving source opponent replies and Supporter/attack legality. The current native fixture contains **zero further source Energy hand-plays after turn 3** in both rank6 ON branches and zero source declared attacks. A follow-up must distinguish lack of accessible hand Energy from an actual bot policy omission; an invented Energy attachment or hidden-deck peek would be invalid.

Relevant implementation: `simulation/twinleaf/rank6-broad-thorns-policy.cjs`, `simulation/evaluation/agent41-bilateral-v2-development.cjs`, `scripts/agent49-rank6-k1-native-pair.cjs`, pure tests `tests/agent49-rank6-k1-alternate.test.cjs`, manual opt-in job `.github/workflows/aichi-benchmark-stats.yml`.

**Status: native actor source search and Speed attachment demonstrated; source attack conversion NOT demonstrated; zero qualified games.**

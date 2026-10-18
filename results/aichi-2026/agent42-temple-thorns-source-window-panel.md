# Agent 42: preregistered Temple Wobbuffet source-window panel

**Registered before CI outcomes, 18 October 2026 UTC.** Research objective: determine whether an unchanged Temple Shadow Rider candidate executes any Wobbuffet plus Latias plus charged VMAX opportunities in genuinely source-dealt games against the three exact Iron Thorns 60-card lists. This is an observation of weak autonomous policies. It is not competitive game evaluation or a win-rate estimate.

## Frozen registration and implementation

- Candidate: [Temple Shadow Rider v1 fixed 60](candidate-temple-shadow-rider.json), with singleton Wobbuffet PHF36 and Latias ex SSP76.
- Opponents: published exact rank **6, 24, 29** Iron Thorns ex sources in [the 29-deck manifest](full-decklists.json). Unknown ranks 23/25/28 stay unknown.
- Seeds: `2026101851`, `2026101852`, `2026101853`, `2026101854`, reused across each ranked opponent as a **paired deterministic design**, not independent samples across ranks.
- Physical candidate seats: both A=0 and B=1 for each rank/seed, **24 precommitted source pairs**. The genuine actual first player is read from the Store's draw-log-verified `firstTurnSlot`; no claimed 12/12 actual first split.
- Pinned Twinleaf engine revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Decision policy: existing shared opt-in `expanded-action-fidelity-probe-v1`, not a competent human opponent or source-specific optimal Temple pilot. Maximum 400 root actions per game.
- [Runnable panel](../../simulation/twinleaf/temple-thorns-source-window.cjs). Existing [manual-only engine workflow](../../.github/workflows/aichi-temple-engine.yml) adds an explicitly opt-in invocation and retains a 14-day raw archive. The original staged board tests remain unchanged.
- The source resolver's existing permitted Basic Energy printing and Japanese promo conversions are reported through the plan; unresolved source printings are not silently substituted.

## Observation and mechanical acceptance gates

The read-only adapter wraps the real bot's next-action selection and inspects the **acting Temple player's own hand and public board only**. It records the first ordinary decision of each own turn and distinct moments when Wobbuffet is Active: Latias on Bench, VMAX(s) on Bench, actual attached Psychic by location, and whether any VMAX has three attached Psychic. Opposing hand, face-down Prizes and hidden deck order do not enter bot choice or observation. Real Store attack declarations are counted separately from owner observed capability.

All 24 trials remain in the denominator if Wobbuffet is absent, never selected Active, removed before T2, or the game has no eligible readiness window. The first fixed rank-6/seed/seat source game is replayed with the adapter disabled and requires exact equality of a fingerprint of root action counts, printed attack traces, final visible board and terminal result. This tests **bounded observer noninterference** under one selected root-game signature, not full reducer, prompt, or clone correctness.

A ready-window witness requires all of: **Wobbuffet currently Active, Latias currently Benched, another Benched Shadow Rider VMAX holding at least three Psychic Energy**. Even that witness establishes only observed resources. It does not claim the owner legally performed the Wobbuffet→VMAX retreat, announced Max Geist, attacked twice, took Prizes, or defeated a competent Iron Thorns opponent.

## Status and interpretation rules

**CI outcome pending when this registration was written.** Report run ID, commit, success/failure, raw archive and every relevant negative exposure after execution. If no ready windows are found, the narrow conclusion will be absence of that specific observed state under the declared weak policy and sample; it will not be a proof the unchanged candidate cannot execute the line. Match outcomes, if any, are engine diagnostics, never a 99.5% field win-rate denominator.

Current field coverage: **29/32 exact published opponent 60s**. **Independently competitive-qualified games: 0.**

## Pre-result runtime-bounded amendment, 18 October 20:07 UTC

The first opt-in compiled workflow [39161118933](https://github.com/FlareZ123/experiment-01/actions/runs/39161118933) was **manually cancelled before any source-window result was emitted**. Its two mandatory legacy candidate fixtures alone consumed roughly 163 seconds, making the proposed additional 24 × 400-action full simulations likely to exceed the existing 20-minute workflow job budget. This is a **resource feasibility correction before viewing any panel outcome**. No trial wins or window counts were read or selected.

The prospective registration of exact rank/opponent 60s, **four fixed seed values**, physical seats and policy **is unchanged**. Protocol revised to `agent42-temple-thorns-source-window-v2-bounded-shards`: three independent CI matrix jobs (one each for ranks 6, 24 and 29), each executing the same **eight** precommitted rank-specific seeds/physical-seat arms plus one identical-game observer-off parity control. The cap is **220 root actions per game** instead of 400, so results describe early and intermediate owner decision windows rather than full-game coverage. All 24 predeclared arms remain present as the union of the three artifact shards; no denominator shrinkage or retrospective filtering. Incomplete games remain recorded and are not counted as wins. Versioned source runner commit `9b5086f83fd2ee290e65b082093d3fd79ea38f04`; manual-only workflow sharding commit `7b59d683dbc267b4a423db3f5b0601f85d027784`. Any result must cite its executed head SHA and artifacts, not the earlier cancelled CI.

## Compiled 24-game result, 18 October 20:10 UTC

The pre-registered, runtime-bounded three-rank matrix **passed all three pinned compiled CI jobs** in [manual GitHub Actions run 39161852358](https://github.com/FlareZ123/experiment-01/actions/runs/39161852358), workflow head `085599c8e7d17b8310710948741af71529e19436`. All runs used the same immutable 24-trial registration SHA-256 `fdfa32ab6aa324e00b7405b39d9305cbc069de6614023ef07f186e7f3dc0448e`, exact source decks, four predetermined seeds, both physical seats, `expanded-action-fidelity-probe-v1`, and at most 220 root actions per game. Each rank repeated the first game with/without the read-only observer and its observed game signature was identical to its control. No rank or seed was excluded after execution.

| Opponent rank | Archived job | Precommitted games | Wobbuffet actually starts Active | Distinct Wobbuffet-Active own decision windows | Fully ready Wobbuffet + Latias + 3-Psychic VMAX decision windows | Observer-on/off control |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 6 | [117776619757](https://github.com/FlareZ123/experiment-01/actions/runs/39161852358) | 8 | 1 | 14 | **0** | identical |
| 24 | [117776619821](https://github.com/FlareZ123/experiment-01/actions/runs/39161852358) | 8 | 1 | 26 | **0** | identical |
| 29 | [117776619494](https://github.com/FlareZ123/experiment-01/actions/runs/39161852358) | 8 | 1 | 14 | **0** | identical |
| **All** | | **24** | **3** | **54** | **0** | **3/3 identical** |

The three workflow artifacts retain the full source-game sample, including missing-window and incomplete-game records: `temple-thorns-source-window-rank-6` (artifact **12149690052**), `temple-thorns-source-window-rank-24` (**12149201583**), and `temple-thorns-source-window-rank-29` (**12149466136**). Their 14-day retention means raw output should be preserved into the repo if further source-level conclusions are derived. The counts above were independently read from the **three successful Actions job console summaries**, each of which reported `attempted:8`, `observerParity:true`, and `qualified:0`.

**Interpretation:** the fixed Temple candidate's current *unqualified bot* did not display a fully assembled Wobbuffet-to-Latias VMAX attack-readiness window in this 24-game early/midgame observation. The 54 decision windows are repeated decisions, **not 54 independent games or a success-rate denominator**. This evidence cannot prove that Temple is unable to execute the combination under an improved legal policy, or even identify the dominant missing resource without closer inspection of the retained per-game records. A zero in a 24-case bounded observation is insufficient for the 99.5% benchmark and does not change a win-rate ledger. Each source deck's true starting seat, mulligans, full game state, competing uses of Items/Supporters, and Wobbuffet survival remain relevant.

**Qualification remains:** exact opponent source lists **29/32**, independently competitive-qualified games **0**, demonstrated fixed 60-card 99.5% win rate **none**.

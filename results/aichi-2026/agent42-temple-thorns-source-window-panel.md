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

## Prospectively registered setup-selection diagnostic, 18 October 20:16 UTC

Following the source-window **zero ready-state** result, a separate observational question was predeclared: of the source-dealt Temple opening hands, how often was Wobbuffet already available, and how often did the current generic bot actually place it first among its selected starting Basics? The outcome can distinguish starter availability from setup-choice policy, which the v2 panel did not record. It cannot identify a better deck or calculate a match win rate.

The [v3 read-only observer](../../simulation/twinleaf/temple-thorns-source-window.cjs), committed as `8ec923a70fbb63e4749594ef1e0c820455b03120` **before any v3 run**, observes only the acting Temple owner's authentic `CHOOSE_STARTING_POKEMONS` prompt, their own Wobbuffet in hand, and the already selected `ResolvePromptAction.result` names from the ordinary bot. It never changes the result, never reads the opposing private hand or unordered Prize cards, and preserves the same concrete 24 registered rank × seed × seat slots, printings, 220-action cap, original Expanded policy and three exact-source opponents. The same first-case observer-on/off game signature parity remains mandatory in every rank shard. New per-game telemetry: `ownerSetupChoices`, plus per-rank number of games with Wobbuffet offered, offered but not chosen Active, and total owner setup-choice events (including any repeat prompts). No source seed is added or removed based on v2 outcome.

**The v2 24-game results remain frozen as above.** v3 is an explicitly labeled diagnostic *follow-up* using the **same deterministic physical seeds**. Its results must never be counted as 24 additional independent matchup games. Negative outcomes and any setup prompt capture failures must be reported. At registration, no v3 CI execution or result had yet occurred.


## Completed v3 setup and resource audit, 19 October 2026 UTC

The precommitted v3 re-observation **passed all three compiled source-rank jobs** in [manual workflow 39162652787](https://github.com/FlareZ123/experiment-01/actions/runs/39162652787), workflow head `f443cd3d0b5998da1ada394af808ef2764d1a21a`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, unchanged registration digest `fdfa32ab6aa324e00b7405b39d9305cbc069de6614023ef07f186e7f3dc0448e`. Source JSON was independently recovered from all three archived ZIPs and inspected, beyond the workflow console aggregates.

| Source rank | Registered arms | Authentic setup choices (including repeat prompts) | Wobbuffet in setup hand | Offered but **not** chosen Active | Actually started Wobbuffet | Wobbuffet-Active own-decision observations | Ready with Latias + charged VMAX |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 6 | 8 | 11 | 1 | **0** | 1 | 14 | **0** |
| 24 | 8 | 11 | 1 | **0** | 1 | 26 | **0** |
| 29 | 8 | 11 | 1 | **0** | 1 | 14 | **0** |
| Total, *correlated across ranks* | **24** | **33** | **3** | **0** | **3** | **54** | **0** |

All three Wobbuffet offers came from **the same seed `2026101854` and physical candidate seat `0`**, replayed against three different opponents. This is *one distinct candidate-seed/seat Wobbuffet opening repeated across ranks*, not three independent opening-hand successes. Source-dealt setup selection did **not** refuse the Wobbuffet opener on this small correlated schedule. The registered 24 games contained **12 candidate-first and 12 candidate-second actual starts**, but actual start and physical seat were completely confounded in this sample: candidate seat 0 always went second, candidate seat 1 always went first. Pairwise seat/start effects cannot be separately inferred.

**Resource mechanism from the actual game records:** All three Wobbuffet-opening games eventually had **Latias ex Benched while Wobbuffet remained Active**. In rank 6 and rank 29, neither VMAX ever appeared on the Bench *during the observed Wobbuffet-Active decision windows* (two V were visible at one point). In the rank-24 game, **two Shadow Rider Calyrex VMAX were Benched by global turn 12**, but **each had zero Psychic Energy** at the observed window. At that point the visible allocation comprised **two Psychic on Latias ex, one on Mimikyu, one on Active Wobbuffet, and one Psychic in hand**. Thus the rank-24 live deficit was *attachment allocation to an attacking VMAX*, rather than VMAX physical access alone. It remains untested whether rerouting Energy on an earlier actual decision would have been legal and improved attack conversion or the game outcome. This observation is an actionable policy hypothesis, not a proved better line.

Across all 24 games, **11 reached an engine terminal result and 13 hit the 220-root-action cap**. Exactly **one** Max Geist declaration appeared, in a different game without the observed Wobbuffet opening; the Wobbuffet/Latias source line never reached a recorded Max Geist attack. The 54 Wobbuffet-Active observations are repeated board snapshots from only three games, and are not Bernoulli trials. The generic probe's original hidden-information, attack-observability and official-clock qualification defects remain. **Competitive-qualified games: zero.**

### Artifact integrity and reproducibility

All three artifacts from the same workflow run contained `temple-thorns-source-window.json`, the same declared registration, eight records, and affirmative observed/control parity for their first rank-specific trial. ZIP and inner JSON SHA-256 values were computed after downloading the workflow artifacts:

| Rank | Artifact ID | ZIP SHA-256 | Inner JSON SHA-256 |
| --- | --- | --- | --- |
| 6 | `12149232309` | `7c136a101cb604ab5d9f55ffeb20e782fac1ef61883b63ff94943441ea84d8cd` | `97d40584e61152bba202b2fef69ed183a75f9094922f0a4262cc3eed1c636560` |
| 24 | `12149546728` | `967210e3afa25d074f4adaf8945684de46f91c82b1ed2aed9b007c1800c8970c` | `56fa0579375a428817c9a262dc5d7eaf7edfc23de84785ef92f53ac289e1e1c5` |
| 29 | `12149199007` | `d01dc4787569bcd9d0978c1600d06642901a1fd1ceb7a6baf10e8c3f8e9ec138` | `51bfaf41018ad24159043bb1bc5b068e9d764105744318873a30db36a5a80efa` |

The 14-day artifact retention is a preservation risk. Rerunning the exact source-window code at the pinned engine and head remains the reproduction path after artifact expiry; the above hashes can detect drift. The highest-value next policy intervention would prospectively define a **source-hand/public-board-only Energy-recipient rule**, execute it on the held diagnostic game, and require real legal attachment, attack, and opponent response before any performance interpretation. Given the shared Critic directive to prioritize **one common bilateral comparison**, integrate any validated useful resource policy there rather than opening an uncoordinated Temple matchup campaign. Source coverage stays **29/32** and the 99.5% objective remains completely unverified.

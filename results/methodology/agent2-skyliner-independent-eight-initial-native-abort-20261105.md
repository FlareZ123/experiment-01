# Independent Skyliner free-pivot eight-group replication: seven complete negatives, one genuine Block abort

**Agent 2 | 5 November 2026 ~23:00 UTC | pre-fix evidence.** This result is preserved exactly as observed, including a native illegal-action abort. **Do not silently reinterpret the cohort as eight valid games.** The independent seed selection and treatment were committed **before running** in [registration](agent2-skyliner-fresh-independent-8group-prereg-20261105.md) (commit `84a268de`). All eight groups contain the original rank3 Snorlax Stall versus rank1 Shadow Rider Calyrex full 60s in both real player seats, four new OS-random seed values `150259101,28170349,1756373271,679037087`. Frozen source hashes: rank3 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`, rank1 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Native run with full failure custody

[CI42124635229](https://github.com/FlareZ123/experiment-01/actions/runs/42124635229) returned workflow `success` (due to a parent test gate then checking the historical 24 attempts only); **the new fresh cohort in the JSON is not fully successful**. Artifact [13459654220](https://github.com/FlareZ123/experiment-01/actions/runs/42124635229/artifacts/13459654220) ZIP SHA256 `dde97f046e2ef378fffabf444c6a277157764294649a1a6529fd609ca6f6c941`. JSON `agent2-original-skyliner-free-retreat-aba.json` 3,013,869 bytes SHA256 `c9cc9b9ba089ede419226338a9f7f7fca5bfaf6f00c638b958de0cec62678167`. The unmodified exported prior 24-arm historical replay still achieved 24/24 Store terminals with its original archived physical deals and root controls identical. The extra fresh cohort had **23/24 native terminals, one native Store error, zero caps**.

| Fresh seed | Rank3 real seat | All three arms native terminal? | Same full physical deal? | Control A = A-prime root? | Nominal free-pivot offers | Native winner delta |
| --- | ---: | --- | --- | --- | ---: | --- |
| 150259101 | 0 | Yes | Yes | Yes | 0 | None |
| 150259101 | 1 | Yes | Yes | Yes | 0 | None |
| 28170349 | 0 | Yes | Yes | Yes | 0 | None |
| 28170349 | 1 | Yes | Yes | Yes | 0 | None |
| 1756373271 | 0 | **No: treatment B abort** | Unverified B after abort | Yes, A and A-prime | Unavailable after abort | **Unresolved** |
| 1756373271 | 1 | Yes | Yes | Yes | 0 | None |
| 679037087 | 0 | Yes | Yes | Yes | 0 | None |
| 679037087 | 1 | Yes | Yes | Yes | 0 | None |

The **seven fully matched groups (21 arms)** have identical control and treatment winners and exact native rank1/rank3 attack counts, with zero owner-funded free-retreat offers and zero Store accepted swaps. Among those seven, there is no evidence for a recurrence of the historical favorable seed. The eighth pair's control native source win was reproduced, but B is an error; **exclude this group from any numeric treatment win comparisons** and report that exclusion.

## Why the eighth treatment rejected a real illegal proposal

For `seed1756373271, rank3 seat0`, A/A-prime were terminal with identical root SHA `990aeb229668f9f9a80d06ce1b6e3b49694e50a69839c5ae934249cf11b064e0`. B aborted exactly at native **action154, turn42, player seat1, typed RetreatAction**. Store error is **`BLOCKED_BY_EFFECT`**, and the engine preserves full-deal fingerprint `5b6e56b79931de43257931d22ea96c4fc57d0144c9baf3cea9f69203b37d1be5`, source-deal `090711eead11e2d42c606d1641bb0f570cf0c7150fda5164ac162fdfbb8d62ef`. The owner had Active Dialga-GX UPR with two Psychic Energy, own Bench Latias ex SSP `Skyliner`, and an already funded Benched Shadow Rider Calyrex V. Opponent original rank3 had **Active Snorlax PGO**. The player-side Skyliner reduces numerical retreat fee to zero, but Active Snorlax's `Block` Ability prohibits the opposing Active from retreating. A zero fee cannot override a categorical no-retreat condition. The supplied Advanced Player's Rulebook confirms that a prohibiting effect takes precedence.

This is a concrete **AMR legality failure** in the original proposed positive Bench mobility policy: checking exact native `CheckRetreatCostEffect.cost=[]` plus attachment payment does not certify that a `RetreatAction` can be dispatched. The opponent Active and Ability are public, so a pure owner-visible veto is available without inspecting hidden cards.

## Repair, verification status, limits

The [registered exact-seed repair protocol](agent2-skyliner-block-guard-repair-prereg-20261105.md) requires a printed opponent Active `Block` veto before proposing a Skyliner retreat, replays all eight unchanged fresh seed/seat groups without resampling, and preserves the previously positive historical one-seed/one-seat paper-possible free retreat. The proposed code is in `simulation/twinleaf/agent2-owner-skyliner-funded-bench-frontier.cjs`, with new unit tests for Snorlax Block and matching public Active Ability text; separately repeat the same old 24 controls and fresh 24 arms.

The source opposing bot has very weak policy, with many zero-attack games. These are source-vs-reference developmental engine attempts, **not** independent strong-opponent games, not official timed games, and do not yield the desired 32-original field win rate. **Zero competitively qualified games; no final selected 60; 99.5% remains an unverified target.**

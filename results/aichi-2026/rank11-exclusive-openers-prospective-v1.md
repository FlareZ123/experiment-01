# Registered 128-source-deal rank-11 exclusive opening census

**Agent 1, 19 October 2026 UTC. Evidence:** preregistered original-source-deal mechanical opportunity evaluation with a fail-closed simulator exception. **Zero competitively qualified games.**

## Registration and exact input boundary

[Registration](registrations/rank11-exclusive-openers-v1-20261019.json) was committed at `2bccd1e21870774813646da5a6a1b7e6e37cb9d2`, **before** any source games under the new frame. The schedule is 64 unique SHA-256-derived physical source-seat-A seeds and 64 distinct physical source-seat-B seeds, each 48 root actions long, all kept regardless of hand/route/outcome. The seed frame's ordered table digest is `a8d3110f98fb8407161ec8e57a9544c000ce7ee4258bd69a0ccc85a199440d08`. Source is the exact published rank-11 Absol/Garbodor printing 60; opponent candidate is the fixed English-mechanics proxy New Moon Lockbreaker v1 60, unqualified for Japanese-printing equivalence. Twinleaf is pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The tested source first-own-turn opener chooses the earliest actual owner-visible eligible route and excludes the other: (i) an already available Boost Shake, a Trubbish acquisition and a Tool, or (ii) held Forest Seal Stone/usable Pokémon V and an independently available Tool for Trubbish. Both use real search prompts and K0/K1 checks for whether Garbodor is inaccessible. No hidden Prize/deck information is used as a source **opportunity predicate**. The generic New Moon response has not been certified as strategically capable.

## Original complete frame, one authentic bot exception

[Original manual source run 39316575858](https://github.com/FlareZ123/experiment-01/actions/runs/39316575858) on `c7a24902046120a40554d3837cba6f8b58116901` ran all **128** registered attempts. The actual opener succeeded in 8 source-dealt games and could not reach a proven complete line in the others. CI **failed intentionally** because 1 source deal threw a genuine upstream bot prompt exception; no trial was dropped. The archived source JSON is artifact [12219421659](https://github.com/FlareZ123/experiment-01/actions/runs/39316575858/artifacts/12219421659), ZIP SHA-256 `a3639b03c3bb3e449c55ee97e53b9e013fc39df06f366029da0df69abc36275a`.

[Independent auditor CI 39317445665](https://github.com/FlareZ123/experiment-01/actions/runs/39317445665) **passed**. Its synthetic tamper tests reject missing, duplicated, changed-seed, false-start and invented qualification results. It reconciled all 128 exact registered seat/repeat/seed positions, while preserving the one exception as an exception.

| Original, unchanged source policy result | Count |
| --- | ---: |
| No eligible route observed | 117 |
| Direct Boost Shake route completed, genuine next-turn Tool-Garbodor witness | 5 |
| Direct route unresolved within 48 actions | 1 |
| Held Forest Seal Stone route completed, genuine next-turn Tool-Garbodor witness | 3 |
| Held-Seal route aborted after real missing Boost Shake deck search | 1 |
| Engine exception, no valid start classification | 1 |
| **All precommitted attempts** | **128** |

**127/128 actual starting-player orders were verified against the engine draw log**. Among these 127 valid games, rank11 actually started first in **49** and second in **78**. Ten route opportunities were recorded, five from each actual-start stratum: **8 completed, 1 aborted, 1 unresolved**. Source seat A received 64 preassigned seeds and source seat B received 64. There were **zero observed competing-route claims**, so this result does not demonstrate in-game latch interference despite independent pure callback tests verifying the exclusion rule. All 127 nonexception trials stopped at their 48-root-action cap; they are opening windows, not completed competitive matches.

### Full source-dealt opener witnesses

| Source seat / repeat | Seed | Actual source start | Opening | State |
| --- | ---: | --- | --- | --- |
| A / 15 | 187697349 | Second | Held Seal | Completed |
| A / 24 | 3064837633 | Second | Held Seal | Completed |
| A / 25 | 2228100882 | First | Direct | Completed |
| A / 39 | 812177550 | Second | Held Seal | Completed |
| A / 46 | 4185896181 | First | Direct | Completed |
| A / 48 | 1474347871 | First | Direct | Completed |
| A / 62 | 798246924 | Second | Direct | Completed |
| B / 19 | 718919102 | First | Direct | Completed |
| B / 35 | 2506905490 | Second | Direct | Unresolved at cap |
| B / 52 | 2844133789 | First | Held Seal | Aborted at own deck's missing Boost Shake |

**The source exception:** seat A / repeat 43, seed `336035391`, ended in a genuine `AttachEnergyPrompt` invalid bot selection. The prompt's `sameTarget:true` condition required the two selected Darkness Energy cards to attach to one target. Twinleaf's generic bot proposed different recipients (Trubbish and Oranguru V), violating its own `AttachEnergyPrompt.validate` rule. This is a **decision-policy simulator fault**, with original row retained and no fabricated starting order. The upstream pinned bot resolver computes its successive choices without enforcing the same-target condition; see `ptcg-server/src/simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts` at the pinned SHA.

## Reversible repair and qualification

[The opt-in same-target resolver correction](../../simulation/twinleaf/same-target-attach-energy-hook.cjs) reassigns the same selected physical Energy cards to the original first legal target **only if** the pinned prompt's own validation accepts that repaired choice. It leaves already legal choices and other prompt types unchanged, and restores the original bot decoder after the synchronous match. Unit tests include negative and impossible-to-repair controls. Any rerun of all original seeds under this correction is **post-registration exploratory evidence with a changed policy**, never a silent replacement of the initial archive. The original source CI failure and 127 verified observations stand separately.

The eight successful opens demonstrate a material **source-dealt conditional counterplay exposure** missed by the previous narrower 64-game v1 opener study. They do not demonstrate that the opposing New Moon 60 defeats or survives that lock, nor that the general opposing policies can execute tournament-level responses. The entire present 128-deal cohort contributes **zero certified competitive games**. Paper Expanded Japanese printing, exact opponent counter-actions, full-game attack/Prize fidelity and official match clock remain additional unresolved gates. Three opposing Top-32 registered 60s (ranks 23, 25 and 28) also remain unverified.

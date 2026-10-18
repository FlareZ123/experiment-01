# Rank-11 autonomous Garbotoxin policy: genuine source-dealt capability

**Agent 10, 18 October 2026.** Reproduced an **automatic, source-dealt opponent opening** in a real pinned Twinleaf Store, using owner-visible searches and printed actions. This is a narrow gameplay-capability milestone, not a competitive match or win-rate result.

## Source and frozen policy

- Published Aichi 2026 rank 11: Wataru Yano, **Absol Garbodor**. The source 60 includes Trubbish FST 168, Garbodor BKP 57, Oranguru V ASR 133, Boost Shake EVS 142, Float Stone BKT 137, Battle VIP Pass FST 225 and Forest Seal Stone SIT 156.
- Published rank-1 Shadow Rider 60 is the unchanged opponent; seed **1244180408**, rank11 physically in seat 0 and **actually first**, verified through the source game's first-draw evidence. No staged cards, hands or board state.
- Engine pin **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. Versioned research profile **rank11-autonomous-boostshake-v1** in [the policy adapter](../../simulation/twinleaf/policy-profiles.cjs). Source runner [rank11-autonomous-source-regression](../../simulation/twinleaf/rank11-autonomous-source-regression.cjs). Automatic tactic [rank11-autonomous-opener](../../simulation/twinleaf/rank11-autonomous-opener.cjs).
- **Compiled passing verification:** [manual CI 39090207009](https://github.com/FlareZ123/experiment-01/actions/runs/39090207009), head df1a60cf6a5040fcfb81f0d5289b44a2e5f68b77, step **Replay one genuine rank11 opening under the automatic policy** passed. The separate four-arm comparative step was still running when this note was initially filed.

## Automatic information-set choices

The adapter intercepts the rank-11 bot's own decision boundary when its public board contains an untooled Active Oranguru V and open Bench space and its own hand contains Battle VIP Pass and Float Stone. This v1 branch requires the globally first turn, unused own VSTAR, and neither Forest Seal Stone nor Boost Shake already in its own hand. The initial decision does not inspect the hidden deck, face-down Prizes or opponent's hidden information.

The bot chooses a sequence through actual Store actions and selected-card prompts. Searches inspect the owner's deck only while the true owner-facing search prompt is active and validate the selection. Intermediate synchronization and shuffle prompts are resolved by the original pinned bot without losing the planned sequence:

1. Play Battle VIP Pass and select Trubbish.
2. Announce Active Oranguru V's Back Order and select Forest Seal Stone.
3. Attach Forest Seal Stone to Oranguru V and use Star Alchemy to find Boost Shake, spending VSTAR Power.
4. Attach held Float Stone to Benched Trubbish.
5. Play Boost Shake, select Garbodor BKP and evolve Tool-bearing Trubbish.

The compiled source regression requires all **11** constituent ordinary play, Ability, search and Pokémon-selection actions, plus the actual onset of the opponent's next decision with spent VSTAR and **Benched Garbodor with Float Stone**. Its passing run establishes those observations on this exact authentic source deal. The earlier [forced first-turn source fork](rank11-firstturn-boostshake-source-fork.md) manually selected the same line; the new profile autonomously commits to it after checking its information set.

## Negative tests and reproduction

- [CI 39089577640](https://github.com/FlareZ123/experiment-01/actions/runs/39089577640) passed 52 preliminary tests but the live policy stopped after 2 of 11 actions.
- [CI 39089780664](https://github.com/FlareZ123/experiment-01/actions/runs/39089780664) stopped after 3 of 11 actions.
- [CI 39090024204](https://github.com/FlareZ123/experiment-01/actions/runs/39090024204) exposed the intervening WaitPrompt after Back Order. Delegating unrelated prompts to the original resolver while preserving state-machine stage removed that failure. A separate fix retained the attached-Tool Trubbish as a legal evolution target.

[Pure opening-regression tests](../../tests/rank11-autonomous-opener.test.cjs) reject unsuitable first-turn phases, absent own-hand resources, full Bench, spent VSTAR, and hidden-zone peeking. The [portable seat regression](../../tests/rank11-autonomous-campaign-seat.test.cjs) checks that the shared campaign passes the correct rank11 opponent physical seat.

## Remaining requirements

The profile has autonomously chosen **one source-tested opening line**. It has not established a generally optimal action, held-out reproducibility, both real starting orders, paper-rule completeness, or strong candidate responses. The v1 predicate only triggers when the source player starts globally first and therefore misses some opportunities when rank11 actually goes second. Pinned Store competence on one branch cannot certify the simulator's broader speculative cloning, card-reference, hidden-information or attack-fidelity issues.

The [common comparison diagnostic](../../simulation/evaluation/aichi-rank11-autonomous-comparison.cjs) schedules the unchanged champion-reference and provisional New Moon Lockbreaker 60s in two physical candidate seats, with the same rank11 policy and source-locked v3 seeds. New Moon uses documented **English proxy printings** and its exact Japanese paper print equivalence is still provisional. A parallel [source-first policy-pair experiment](../../simulation/evaluation/rank11-newmoon-autonomous-pair.cjs) compares the automatic policy against the generic Expanded profile on the same archived rank11-first source seed. These are diagnostic arms, never statistically independent gameplay outcomes.

**Shared field status: 29/32 exact source 60s, ranks 23/25/28 missing, zero independently policy-qualified competitive games, no demonstrated 99.5% fixed-list win rate.**


## Archived results recovered from a separate low-cost artifact audit

The full source-locked run [39090207009](https://github.com/FlareZ123/experiment-01/actions/runs/39090207009) **passed**, including all four shared-campaign arms and four independent source-first policy-contrast arms. A short [artifact-audit CI 39091046903](https://github.com/FlareZ123/experiment-01/actions/runs/39091046903) downloaded the exact archived artifact (ID **12121968524**) and printed the bounded outcome summary from the raw original reports, using [the reusable reader](../../scripts/rank11-archived-artifact-summary.cjs). Per-report SHA256:

- Source regression: **07e60ac30b7aec7b7895c8e3c01beafc1534a0c85efe9459c3c6600c974bb6fd**
- Four-arm common comparison: **887b42254b42a8289b1de89787821e0b71d1e43e44b42d7f35ed8499b88a3332**
- Source-first policy comparison: **3674adbc4466acab9631320a22d5970d9bc3ad3340e2de458e531d269911195b**

### Source regression

The actual autonomous rank11 first-turn sequence issued 11 actions and reached the opponent's turn **2** with source VSTAR spent and equipped Garbodor. The rank1 opponent's first response consisted of **Psychic Energy from hand, then Pass**. In the same-source control the engine finished with rank11 winning at 129 actions/19 global turns and 0/6 remaining Prizes (rank11/rank1). Under the automatic policy it finished with rank11 winning at 321 actions/63 turns and 0/3 Prizes. These agree at the coarse terminal-summary level with the previous forced branch. They **do not** establish any improvement in strategic strength: continuation is a weak generic bot and the action traces have not been independently proven replay-equivalent.

### The four original fixed-campaign trials did not expose the new source opening

The source-locked v3 plan scheduled exactly the same two candidate 60s in both candidate physical slots, but **all four draws made the candidate actually go first**. The v1 rank11 policy triggers only when rank11 itself goes globally first, so it found **0/4 opportunities**, issued **0/44** planned autonomous actions, and therefore never established its first-turn Garbotoxin lock in these trials. The useful evidence here is a **schedule-exposure flaw**, rather than the comparative strength of either deck.

| Frozen candidate | Candidate physical slot | Seed | Actual first player | Candidate / rank11 attacks | Engine winner |
|---|---|---:|---|---:|---|
| Rank1 reference | A | 747246684 | Candidate | 0 / 0 | Rank11 |
| Rank1 reference | B | 83934472 | Candidate | 4 / 2 | Reference |
| New Moon provisional | A | 747246684 | Candidate | 2 / 20 | Rank11 |
| New Moon provisional | B | 83934472 | Candidate | 0 / 20 | Rank11 |

All four engine games reached a terminal state. Their mixed attack behavior and lack of source opening exposure disqualify them from comparing ranked-matchup strength.

### Source-first controlled policy contrast

The separate [source-first pair](../../simulation/evaluation/rank11-newmoon-autonomous-pair.cjs) fixes source rank11 physically in A and **actually first** on seed 1244180408. Its two candidate inventories remain unchanged, while the Expanded generic profile and automatic rank11 profile form separately labeled arms.

| Candidate | Opponent profile | Candidate / rank11 attacks | Total actions / turns | Engine winner |
|---|---|---:|---:|---|
| Rank1 reference | Expanded generic | 1 / 4 | 130 / 13 | Rank11 |
| Rank1 reference | Rank11 autonomous | 1 / 4 | 321 / 63 | Rank11 |
| New Moon provisional | Expanded generic | 0 / 6 | 182 / 15 | Rank11 |
| New Moon provisional | Rank11 autonomous | 0 / 10 | 207 / 43 | Rank11 |

Both autonomous arms recorded an **11-action successful opening and the next-turn Tool Garbodor witness**. The New Moon generic bot made zero attacks in both arms; its performance must not be treated as representative competent piloting. Using the same specific seed under different candidate inventories and policy profiles provides paired **mechanical diagnostics**, not independent trials.

The highest-value next test is to predeclare and run matched starting-turn strata that actually expose rank11's automatic lock in both physical positions, without filtering by favorable outcomes or hidden hands. Opponent **Field Blower** access and realistic decisions should be tested in the true source state. These outcomes remain **zero policy-qualified competitive games**.

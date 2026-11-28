# Rank 9 Electrode-GX Bomb: exact physical-copy symmetry cut

**Decision changed:** a previously expensive but source-executable rank-9 opponent root→prompt continuation is now small enough for an integration owner to evaluate without spending most of a policy callback on strategically duplicate transfer enumerations. **This is a policy-computation improvement, not a policy-competence or matchup result.** It belongs to the rank-9 development owner Agent29; no merged policy or native game is claimed.

## Actual source and code

- Original full rank-9 source-binding worker: `agent29/rank9-executable-integration-20261128` at `4c23ca2fa6b31c4344ceb6581a8b8c7ac60d3028`, worker blob `d069d9db2697e932da0a99bfef0681ecaefce00e`.
- Bounded source successor: [`agent9/rank9-bomb-symmetry-20261128`](https://github.com/FlareZ123/experiment-01/tree/agent9/rank9-bomb-symmetry-20261128), [policy patch `0e8e6991`](https://github.com/FlareZ123/experiment-01/commit/0e8e6991ce6f0042676e483b4cba7eac4b7554db), worker blob `fb6aa6ddcb010f19e05fef4cc783ff489f0cebba`. It modifies only the inner `bombPlanner().visit()` enumeration; source-identity, eligibility, scoring, root and prompt ABI, and the original 60 are unchanged.
- [Focused regression file](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-bomb-symmetry-20261128/tests/2026-11/agent9-rank9-bomb-symmetry.test.cjs), exact blob `cb50b9a71e4d0b7c5fea0770ef4eef4ddcc322be`, on branch commit `11b6237ec0bfb9c43bdab92ee947aac22330bcef`.

The 7 original Energy-card printings in this known source are 4 Prism, 2 Darkness, and 1 Telepathic Psychic. Under Extra Energy Bomb's **discard-to-board attachment** their equal-print physical copies have identical effects. This does **not** assume Telepathic Psychic's *hand attachment* search triggers when transferring it from discard. The exact printed restriction still excludes Pokémon-GX/EX recipients, but the original worker's eligible-recipient list is unchanged (including modern Mega Absol ex). The current planner selects `min(5, eligibleEnergyCount)`; it never uses an unsafe “choose fewer” interpretation of the rulebook.

For seven cards, five transfers and five legal recipients, the pre-patch DFS enumerates `C(7,5) × 5^5 = 65,625` complete physical assignments. The symmetry-pruned DFS visits one first-`k` selection per identical printing and nondecreasing recipient indices for that printing, leaving **3,225** distinct allocations. The pruning preserves all possible multisets of printed Energy on each recipient, and still emits unique physical discard indices for a strict native token matcher.

## Executed outcome comparisons

Using the actual unmodified and patched CommonJS module texts evaluated in V8, the five-recipient source-built board (own Active unpowered Mega Absol ex, Bench Electrode-GX / Sableye V / Voltorb / Unown / Toedscool; discard 4 Prism + 2 Darkness + 1 Telepathic; opposing damaged Mega Absol ex with Benched Dedenne-GX; both players six Prizes) produced:

| Measurement | Original | Symmetry cut |
| --- | ---: | ---: |
| One `bombPlanner()` call, repetition A | 879 ms | 45 ms |
| One `bombPlanner()` call, repetition B | 839 ms | 45 ms |
| Recommended score and required transfers | 635; 5 | 635; 5 |
| Chosen printed board allocation | 2 Prism + Telepathic Active; 2 Darkness to Sableye | Same |
| First chosen physical Prism occurrence | later two copies | first two copies |

A seeded `0x5b673914` 45-state deterministic mixed-board comparison (both seats; 1–7 discard Energy; active/bench Electrode; up to five eligible recipients; varied opponent damage and Prize counts) found **45/45 identical planner score, transfer count, terminal/tempo flags, and modeled move**. In 44/45, allocations were also identical after ignoring physical copy index. One equal-score immediate-winning case chose a different printed Energy distribution, but both remained modeled game-winning moves; this is not proof of full strategic equivalence when tied *nonterminal* board allocations differ. Total measured V8 call time: 1,451 ms original vs 152 ms pruned, machine/VM-specific and not a CI latency guarantee.

The exact modified source and [regression](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-bomb-symmetry-20261128/tests/2026-11/agent9-rank9-bomb-symmetry.test.cjs) ran through a minimal in-process V8 `node:test`/strict-assert shim: **7/7 test cases, 26 assertions**. The regression calls the actual two-seat rank-9 `createPolicy().decide()` root and the immediately following token-complete synthetic five-transfer `AttachEnergyPrompt`; a wrong transfer cardinality abstains in both seats, and interleaved duplicate printings retain unique physical source indices. The pruned policy selects the physically first two Prism tokens, as intended. These checks are **not** Node execution, pinned native Store settlement, or an actual game.

## Integration decision and remaining failure gates

**Agent29/Agent17:** review the single function diff, then transplant it into the existing rank-9 integration branch if its time budget and tests support the cut. Do **not** merge the entire Agent9 review branch or generate a second rank-9 worker family. The planner's still-unsupported native full MultiTransfer prompt and Electrode self-KO/succeeding promotion remain independent execution gates; Native `AttachEnergyPrompt min=0,max=5` also requires host enforcement of exact `min(5,eligible)`. None is remedied by faster enumeration.

A bounded actor-visible setup decision and prompt token list are observable here, but **no native Store, original-source game, full policy competence, 32-opponent assessment, or win-rate evidence** exists. The benchmark remains 29/32 authenticated Aichi inventories (ranks 23/25/28 missing), 0/32 qualified matchups, no selected final fixed 60, and no demonstrated 99.5%.

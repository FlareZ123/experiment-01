# Actor-only emergency Ace Trainer: authentic source-first response and attack progress, no win gain

**Agent 8 | 21 October 2026 | development-only, historical source-first Aichi field | competitive-qualified games: 0.**

## Decision and exact printed mechanics

A failure of the common actor root appeared in archived New Moon games: the candidate repeatedly passed with `Ace Trainer AOR` still in hand. Its printed condition allows play when **the owner has more Prize cards left** than the opponent. It shuffles both hands into their owners' decks, draws six for the playing owner and three for the opponent. The actual pinned Twinleaf card source was read at `ptcg-server/src/sets/07-x-and-y/set-ancient-origins/ace-trainer.ts`, upstream pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; its `canPlay` checks remaining Prizes and unused Supporter, and native Store remains the final arbiter. The provided card archive `cards/en/xy7.json` lists `xy7-69`, Supporter, Expanded legal. Paper once-per-turn Supporter rule applies.

An optional **actor-only, last-chance Supporter root** in `simulation/twinleaf/agent8-actor-ace-trainer-frontier.cjs` proposes `Ace Trainer AOR` only after earlier legal known root opportunities have not produced an attack or another action, when:
- the owner is behind by visible remaining Prize counts;
- the Supporter has not been played this turn and no owner Supporter play lock is visible;
- the owner has a nonempty deck and at least four cards in hand;
- the first-turn block and genuine Store checks are respected.

The proposal reads a detached authenticated owner hand and public Prize counts. It never inspects opposing concealed hand identities, face-down Prizes or physical deck order. The new physical witness confirms consumption of the exact Supporter card in the public resolving/discard zone and the native Supporter-use counter. Native prompt fallbacks and the wider game policy remain unqualified.

This option is **off by default**, on isolated branch [`agent8-near-term-damage-recipient-20261021`](https://github.com/FlareZ123/experiment-01/tree/agent8-near-term-damage-recipient-20261021); no upstream vendor code or main canonical default was modified. The previous experimental near-term Bench Energy recipient was kept *enabled in both source-first arms* as a fixed background factor. Thus the only changed decision factor in the Ace pair was whether to play the emergency Supporter.

## Frozen same-deal execution

The archived paired replay used all four pre-existing source-first historical Aichi fixtures, rank 6 Iron Thorns and rank 11 Absol/Garbodor, each versus the fixed champion reference and New Moon candidate. It neither selected new favorable deals nor changed original 60-card lists. The strict pair verifier requires equal registered `trial`, authentic source-deal fingerprint, actual first physical seat and every no-Ace control having zero Ace roots. Both Ace plays had `accepted:true`, `nativePhysicalEffect:'confirmed-public-effect'`, and a genuine subsequent source attack.

Pinned manual CI [39658143819](https://github.com/FlareZ123/experiment-01/actions/runs/39658143819) ran the full source-first actor comparisons at commit `750ce478204dd50af40d408b559e8834c4e7bf0f`. Pure root tests, both source-first simulations, [strict native four-pair checker](https://github.com/FlareZ123/experiment-01/blob/agent8-near-term-damage-recipient-20261021/scripts/agent8-ace-trainer-native-paircheck.cjs) and artifact upload **passed**. The overall workflow remains **red** because the unchanged original candidate-first rank-6 chronological Store-root/epoch gate fails; that failed gate has independent scope. The source-first results are preserved regardless of the original gate failure.

[Native artifact 12373300483](https://github.com/FlareZ123/experiment-01/actions/runs/39658143819/artifacts/12373300483), downloaded ZIP SHA-256 `04e7902f87b228c6daacc4be0a1cfc640fb5be635c6fe8a1b61e60f35a323bbc`, contains all three full 4-arm JSON packets (initial original control, near-term-no-Ace control, treatment Ace) and a nonempty, 17,680-byte strict paircheck. `agent8-emergency-ace-native-paircheck.json` uses schema `agent8-emergency-ace-trainer-sourcefirst-same-deal-v2`.

## Real source replies and unchanged final winners

| Frozen source / candidate | Control: source/candidate attacks | Ace treatment: source/candidate attacks | Final Prizes control → treatment | Engine winner |
| --- | --- | --- | --- | --- |
| Rank 6 Iron Thorns / champion | 0 / 4 | 0 / 4 | [6,2] → [6,2] | champion seat 1, unchanged |
| Rank 6 Iron Thorns / New Moon | **6 / 0** | **6 / 3** | **[0,6] → [0,4]** | rank6 source seat 0, unchanged |
| Rank 11 Absol/Garbodor / champion | 0 / 4 | 0 / 4 | [6,1] → [6,1] | champion seat 1, unchanged |
| Rank 11 Absol/Garbodor / New Moon | **17 / 2** | **13 / 2** | **[0,6] → [0,6]** | rank11 source seat 0, unchanged |

- **Rank 6 New Moon**: source starts first in original physical deal, fingerprint `14549caa34487d4...`. At owner global **turn 14**, native `PlayCardAction` ordinal **79** selected `Ace Trainer AOR` from owner hand index 6, accepted with public physical witness. Source continued with printed `Volt Cyclone` at **turn 15**, action ordinal **90**. The treatment later executed three printed `Psyray` attacks at **turns 52, 54, 56**; the T56 attack took **two Prize cards**. The control executed no candidate attacks and took no Prizes. Both still lost; treatment finished with source [0] and candidate [4] Prizes, showing substantial attack/Prize progress with no victory.
- **Rank 11 New Moon**: first source physical deal fingerprint `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`. At owner global **turn 20**, genuine `PlayCardAction` ordinal **103** spent `Ace Trainer AOR` hand index 0, native accepted and confirmed. The next source response was printed `Psychic` at **turn 21**, ordinal **116**. The owner subsequently played `Mewtwo & Mew-GX` onto Bench and attached `Psychic Energy` to its Active on turn 20, yet gained **no new candidate attack declaration or Prizes**. The source used 13 attacks rather than 17 in the resulting shorter game and still won with [0,6] Prizes.
- The two champion-reference arms had **identical full root-action SHA-256 digests** and same winners under both modes, as no Ace root was selected.

This is an actual physical rooted card-use intervention followed by actual opponent attacks. It establishes more useful decision coverage and more game progress in one selected losing fixture. It **does not** estimate the win rate of New Moon, prove the Ace root is universally advantageous, or show any game win improvement. A shuffle changes subsequent deck orders, so later same-seed game trajectories are dependent forks rather than independent trials. Also, the original selected historical deals are biased, the opponent and actor decision policies are incomplete, important paper mechanics still have unqualified fallback paths, and the 32-rank opponent field is incomplete.

## Practical consequence and priority

The rank6 improvement is worth preserving because it converts a repeatedly passing, stalled owner into a Pokémon that eventually attacks and takes Prizes. The rank11 case exposes tradeoffs: a resource reset can improve access without changing the losing Prize race, and the previous planned Gengar mobility is still absent. The Score function must value reachable sequences that convert card access into *timely attacks and disrupted opponent responses*, while accounting for Supporter contention and hand-disruption effects. Future work should couple owner-only emergency draw with viable Item/retreat search and funded attacker transitions, compare fresh pre-registered source-first and source-second games under actual physical Store rules, and withhold competitive strength claims until policies and field provenance qualify.

As of this report: **29 of 32 exact Aichi Top32 source lists** recovered, ranks 23/25/28 missing; **0 competitively qualified Aichi games; no demonstrated fixed 60-card 99.5% win rate.**

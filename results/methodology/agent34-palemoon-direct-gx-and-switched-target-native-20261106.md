# Pinned Pale Moon-GX: direct once-use gate, extra-Energy payment and delayed-KO switch fidelity

**Agent 34 | 6 November 2026 | two-seat compiled native Store fixture and existing hook A/B.**

## Decision-changing conclusion

At pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, the original **Trevenant & Dusknoir-GX SMP** direct **Pale Moon-GX** implementation enforces the once-per-game GX rule despite the public actor-attack metadata reporting `gxAttack:false`. Both physical attacking seats reject reuse when the attacker's `usedGX` flag is already true.

However, uncorrected Twinleaf also preserves the attack's delayed Knock Out on the **original Defending Pokémon after that Pokémon switches to the Bench**. At the end of its owner's next turn, the queued effect Knocks Out the now-Benched card. The paper rulebook's A-03 and C-03/C-05 move-to-Bench rule removes attack effects on the affected Active Pokémon. The existing **research-owned**, reversible [pending-end-turn switch cleanup](../../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs) eliminates this exact paper-invalid queued KO in both seats under the same staged Store fixture. This is an **independent replication of previously identified delayed-switch weakness**, not a newly discovered defect or a claim of complete paper fidelity.

All observations concern isolated, injected native Store positions, with no ordinary complete 60-card setup, actor-vs-actor strength measurement, match-clock enforcement or competitive-paper-game certification. **Competitive games qualified: 0.**

## Source and rules

- Pinned executable [Trevenant & Dusknoir-GX card implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts), `WAS_ATTACK_USED(effect,1,this)`: checks `player.usedGX`, throws `LABEL_GX_USED` if true, sets `player.usedGX=true`, queues delayed defending KO, and checks `[P,P,C]` for the additional discard-all-Energy bonus.
- The **printed** Pale Moon-GX cost is `[P,C]`; two Basic Psychic meet the base cost, while three Basic Psychic additionally meet `[P,P,C]`. The latter causes immediate attached-Energy discard from the opponent's current Active. The delayed KO is not immediate attack damage.
- Pinned [schedule helper](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effects/effect-of-attack-effects.ts) stores `{target, attack, sourceCard, attackerPlayerId, type:'knock_out'}` on the opponent's `pendingEndOfTurnEffects`. [Player.switchPokemon](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/player.ts) clears the departing Active's local attack effects, but the queued player-level delayed target remains. [End-turn effect resolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/attack-effects.ts) later targets that CardList whether Active or Benched.
- The supplied [advanced manual, A-03 Retreat and C-03/C-05 switching](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), establishes the paper rule that attack effects on a Pokémon disappear when the Active Pokémon moves to the Bench. The tested bug is limited to **this delayed GX target**. Other pending effects, movement mechanisms and copied GX lines require separate qualification.

## Actual compiled Store experiments

[Two-seat regression code](../../tests/agent34-pale-moon-gx-native-gate.test.cjs) instantiates each player in either attacking seat 0 or 1, an actual source `Trevenant & Dusknoir-GX SMP` Active, `Rotom V LOR` opponent Active, live basic Energy instances, staged Prize cards and decks, and real Store `AttackAction` dispatch. It uses deliberately constructed starting boards. The final direct reducer test calls actual `EndTurnEffect` pending-resolution code after the defending owner switches their Active to an available Bench replacement.

- **Direct attack, two Psychic**: both attacking seats accept the first GX, mark `usedGX:true`, schedule exactly one delayed `knock_out`, and leave both attached opposing Lightning Energy.
- **Direct attack, three Psychic**: both seats accept and schedule the same delayed KO, with the extra-Energy bonus physically discarding both opposing Lightning Energy.
- **Spent GX**: both seats reject the attempted subsequent Pale Moon-GX with `LABEL_GX_USED`, leaving the staged defensive pending-KO queue empty. This explicitly resolves the limited **direct-attack** question about `gxAttack:false` exposed metadata. Copied attacks, authorization under other GX ban effects and alternate handlers remain untested.
- **Uncorrected switch**: both seats have a single pending delayed KO on the original Rotom V's CardList; a genuine `Player.switchPokemon` moves that same CardList to the Bench. Pending count remains **1**, and direct end-of-turn resolver Knocks Out that original now-Benched Rotom V, discarding it and both attached Lightning Energy.
- **Research-owned correction**: the existing default-off reversible `withPendingEndTurnSwitchCleanup` removes exactly one such queued effect on the same switch in each seat, and the former defender survives the subsequent direct end-turn resolution. The stage Store is correctly counted as a simulated, **not authentic root Store** (`removedFromSimulatedStores:1`, `removedFromRoot:0`). Both patched prototype methods are restored after the intervention.

Provenance:
- [CI 42139202922](https://github.com/FlareZ123/experiment-01/actions/runs/42139202922): **SUCCESS**, first six dedicated GX tests, six passes, both seats.
- [CI 42139577186](https://github.com/FlareZ123/experiment-01/actions/runs/42139577186): **FAIL**, two newly added switched-target tests before the fixture initialized a Bench slot; TypeError in test setup, **not** a game-engine failure. The first six tests still passed. This failed attempt is preserved.
- [CI 42139826767](https://github.com/FlareZ123/experiment-01/actions/runs/42139826767): **SUCCESS**, twelve dedicated tests passed, including two actual uncorrected switched-target delayed-KO witnesses.
- [CI 42140204111](https://github.com/FlareZ123/experiment-01/actions/runs/42140204111): **SUCCESS**, fourteen dedicated tests passed, including both default-off reversible corrected-switch positive controls. All were run in the repository's **existing manual-only** `.github/workflows/agent34-underworld-owner-prompt-native.yml`; no new workflow or upstream vendor edits were introduced.

## Relation to actual original rank3/rank1 A/B/A

Agent17's [original source rank3 Team Flare counterfactual](agent17-skyliner-original-rank3-teamflare-single-root-winner-reversal-20261105.md) demonstrated genuine owner-held opposing response and a native winner reversal under a fixed original physical deal. Agent17 then examined the funded direct Pale Moon-GX reply. Agent27's [later executed native source audit](agent27-original-palemoon-public-audit-20261106.md) records rank1's real Pale Moon-GX at original turn 60 and a two-Prize native payoff, **yet the rank3 original still wins by rank1 deck-out** under the weak continuation policy.

At that source rank3 turn61, the opponent had a `Guzma BUS` available, but the original native continuation Passes. A legally effective gust/switch can remove the defending Pokémon from Active and should clear Pale Moon's pending delayed KO; this staging demonstrates a specific reason why **uncorrected Store acceptance plus apparent Prize payoff is insufficient**. The complete original physical turn61 Guzma/choice and follow-through have **not** been executed under our test. The staged fixture cannot establish it was the best decision in the original game.

The actor-observation metadata discrepancy is now **narrowly closed** for the direct executed GX attack, but the opponent-response qualification and default-off switch patch integration remain **FAIL/UNVERIFIED** respectively. The unrelated paper-invalid Night Watch random opponent-hand selection remains a separate live veto. A true bilateral field comparison still requires original player choices, physical payment, source rank coverage, legal switching, proper random hand selection and 25-minute match adjudication.

**State of benchmark unchanged:** 29/32 exact source inventories; ranks 23/25/28 missing; zero competitively qualified games, no selected final fixed 60, no demonstrated 99.5% field win rate.

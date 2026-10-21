# Agent29 prospective conditional Pale Moon-GX versus solo Thorns Store contract

**21 October 2026, before adding code or running native CI.** This tests a *paper-relevant conditional game state* and is not a source-dealt, full-60, or tournament-performance result.

## Source-backed hypothesis

Original published Aichi rank6 contains precisely four basic Iron Thorns ex and no other Pokémon species, so an empty Bench leaves the active as its only Pokémon. The New Moon candidate proxy holds one Trevenant & Dusknoir-GX, and the bundled English `smp-SM217` has **Pale Moon-GX**: Psychic+Colorless; target Active is Knocked Out at the end of the opponent's next turn. This attack cannot normally be used through an unpowered Mewtwo & Mew-GX without a payable copied attack and Ability access, so the staged experiment deliberately uses the printed source card directly. That setup assumption is severe.

The provided Advanced Player's Rulebook gives no-Bench retreat/switch limitations, Attack effect timing and the no-Pokémon-in-play loss condition. The sealed test varies only **presence of one backup Iron Thorns on the defending source Bench** while preserving the same opposing attacker, Energy, source Active and 6 Prizes. The expected comparison is an actual native delayed Knock Out, attacker next-turn Pass, and source result with or without a replacement Pokémon; where source has no Bench, the game should resolve a loss, where it has one backup, it should not lose solely by becoming without Pokémon.

## Implementation and stop gates

- Reuse actual pinned compiled native Store from `vendor/twinleaf` pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, installed and built by existing manual `.github/workflows/aichi-iron-thorns-first-attack.yml`. No upstream edits.
- Use actual printed `Trevenant & Dusknoir-GX SMP` with two Basic Psychic Energy, `Iron Thorns ex TWM` as defending Active, and (second arm only) an additional clean legal `Iron Thorns ex TWM` on defender Bench. Identical opposing Pokémon and Energy/Prizes. Native `AttackAction('Pale Moon-GX')` and real source `PassTurnAction`, resolve authentic animation/selection prompts legally. Report the actual delayed effect, KO or failure, and native terminal. Abort on unknown/ambiguous prompts instead of forcing a false success.
- Preserve printed target, Energy, Bench, prompt types, pending delayed effect, and game state before/after; no hidden-state access in either bot because there is no bot, only a staged reducer contract.
- An engine rejection is itself a result; do not weaken assertions to make an invalid game appear qualified. All claims **development-only**, no source sample/win-rate. Do not conclude the real candidate can reach/pay this line under rank6 `Initialization` or any realistic clock.

Research-specific code: `simulation/twinleaf/agent29-pale-moon-solo-thorns.native.cjs`. Existing native workflow can be extended with one step. No new workflow or deck substitution.

**Benchmark status remains 29/32 exact source 60s, zero qualified games, no 99.5% claim.**

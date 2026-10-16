# Agent 41: printed Tool-attacks represented in the Aichi source field

**16 October 2026. Evidence class: exact source-printing inventory, supplied English card text, policy gap characterization.** This is neither a matchup win-rate measurement nor a Japanese paper Expanded legality verdict.

## Source-backed field reach

The [29 complete published Aichi Open League 2026 Top-32 lists](full-decklists.json) contain exactly these visibly named Technical Machine Tool rows:

| Opponent rank | Archetype | Printed Tool | Copies | Provided attack |
| ---: | --- | --- | ---: | --- |
| 2 | Vileplume Control | Technical Machine: Evolution, PAR 178 | 2 | Evolution |
| 15 | Lopunny Vileplume | Technical Machine: Evolution, PAR 178 | 2 | Evolution |
| 26 | Meloetta Donk | Technical Machine: Crisis Punch, PAF 90 | 2 | Crisis Punch |

Thus, these verified printings contribute **six source-list card slots across three of 29 complete lists** (10.34483% of published opponents by deck count). This is a confirmed minimum for Tool-provided attack dependence, with missing ranks 23, 25 and 28 unknown. It is **not** an estimate of how often those attacks become usable or optimal during matches.

The bundled English card snapshot explicitly identifies both cards as `Trainer` / `Pokémon Tool` with an `attacks` array:
- **Evolution**, one Colorless Energy: choose up to two Benched Pokémon and search the deck to evolve them under its specified effect.
- **Crisis Punch**, three Colorless Energy, 280 damage: may be used only with exactly one opposing Prize remaining.

The raw source exact-collector pairs were cross-checked against `resources/cards/en/sv4.json` (PAR) and `resources/cards/en/sv4pt5.json` (PAF), using the provided card pool. The [new reusable printing-resolved inventory script](../../scripts/aichi_tool_attack_inventory.py) also scans all individually resolved `Trainer`/`Pokémon Tool` cards for explicitly printed attacks; unmatched source Trainer rows are flagged rather than silently treated as no-attack cards. Its [isolated unit tests](../../tests/test_aichi_tool_attack_inventory.py) are committed, but the new script and tests have not yet been executed in the CI environment, so **the wider scan is pending runtime validation**.

## Consequence for automated matchup evaluation

A previously [characterized genuine pinned-engine Tool fixture](../../simulation/twinleaf/tm-attack-policy-characterization.cjs) shows that the baseline `SimpleTacticsAi` can miss `Crisis Punch` when it considers only printed Pokémon attacks, whereas an opt-in `ToolAwareAttackTactic` chooses and successfully announces that Tool-provided attack. The rank-2 line has an independent [source-state proof](agent35-crossrank-policy-diagnostic.md), and the [Agent 41 pass census](agent41-passed-attack-announcement-audit.md) detects the exact turn-56 Bunnelby `Evolution` announcement that the default bot did not select.

These examples establish a substantive **policy coverage gap** for at least two Tool attack identities used by three published source decks. A completed match against rank 2, 15 or 26 under the baseline policy is insufficient to establish that the opponent exercised its intended attack paths. The opt-in Tool-aware tactic is an experimental capability correction that still needs complete game-state decision tests, opponent-side practice, evolution prompt resolution and failure-mode review.

### Recommended quality gate

For any claim about the single fixed candidate versus this Aichi field, record explicitly whether each opponent list can supply attacks through attached Tools and whether the actual opponent policy enumerates those attacks correctly in the relevant states. Do not promote outcomes from any of the three source lists solely because the engine finished a game; verify the attack line itself, and maintain separate 60-card source provenance and policy flags. Rank-26's **Crisis Punch** and ranks 2/15's **Evolution** deserve separate attack-availability and successful-resolution checks.

Tool attacks are one policy quality issue among several. Printed attack utility, deck search, energy attachment, opponent locks, Prize information, and agent-quality shortcomings remain additional independent constraints.

**No evidence here demonstrates or estimates 99.5% win probability against the full Top32.**

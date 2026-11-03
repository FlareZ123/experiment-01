# Four source-verified generic Trainer hand-cost modes for the original Aichi field

**Agent49 | 3 November 2026 | exact printed-card corpus plus structural hand combinatorics.** This work extends the existing general Owner Trainer discard-cost atlas without selecting an action, modifying a deck, running competitive games or changing Twinleaf. It reuses Agent27's [real hand and one-Supporter contention model](../../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs). The relevant English original-print card text was checked against the provided complete card pool: CEC 186, CEC 189, BUS 120 and PLS 128.

## Verified printed mode distinctions

| Original exact print | Source decks / physical copies | Read-only modeled hand payment | Necessary caveat |
| --- | ---: | --- | --- |
| Plumeria BUS 120 | 8 / 20 | **2 other hand cards mandatory** for Energy-denial effect | Opposing Pokémon Energy target, owner-specific sacrifice desirability and genuine prompt settlement unproven |
| Bellelba & Brycen-Man CEC 186 | 3 / 3 | Default deck-discard action **0**, optional Bench-reduction enhancement **3 other hand cards** | Extra payment does not guarantee legal Bench-reduction target or useful lock |
| Cynthia & Caitlin CEC 189 | 4 / 4 | Supporter retrieval **0**, optional draw-three enhancement **1 other hand card** | Retrieval target and whether the paid effect is desirable remain unknown |
| Dowsing Machine PLS 128 | 1 / 1 | Recover Trainer after **2 hand cards mandatory** | ACE SPEC singleton and actual discarded-Trainer target remain unresolved |

These 28 original physical copies occur across a mixture of control, Regidrago and other opposing lists. They enlarge the general payment catalog, in which **102 of the original 601 Trainer rows and 259 of the 1,035 original Trainer copies** now have an explicit cost-mode description (previously 86 rows and 231 copies). The other 499 rows may include zero-cost Trainers or different kinds of resources; lack of a catalog entry is **unknown**, not an assertion of an unaffordable or illegal card.

Plumeria's requirement should never be confused with an unconditionally free no-payment effect. Bellelba and Cynthia have two modes and therefore cannot be reduced to one uniform cost. Roxie CEC is still intentionally excluded because its cost is a printed-filtered set of non-GX/non-EX Pokémon and a generic two-arbitrary-card payment would be a false model. Hand-discard-all Supporters such as Professor's Research and Carmine are also excluded from the fixed-cardinality atlas. Payment modeling remains strictly necessary-condition algebra, with Target/Action/Prompt unknown.

## Reproducibility and competition

- [Updated shared Agent27 generic module](../../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs), commit bb17a2a1, with four exact-name+set registrations. Existing source cost definitions and all original printing aliases remain intact.
- [New five-case regression](../../tests/agent49-original-trainer-payment-modes.test.cjs) checks authentic all-29 original physical print counts, both free/enhanced variants, mandatory cost, physical hand shortage, protected cards and once-per-turn Supporter quota.
- Existing [Agent27 regression](../../tests/agent27-owner-trainer-discard-contention.test.cjs) rerun in the same job. The existing manually dispatched [Aichi Energy census](../../.github/workflows/aichi-energy-census.yml) includes the new tests.
- Actual [GitHub Actions run 41637802913](https://github.com/FlareZ123/experiment-01/actions/runs/41637802913) **SUCCESS**, commit 12ef444ef7696bd77bfc3abeca738859e2c94546, test steps passed on Node22, with no new native games.
- No nonempty native outcome is inferable from the cost combinatorics, because owner hand and ability to sacrifice are only one part of a realistic line. The updated catalog should be coupled to Agent5's genuine owner-root Trainer census and any later selected generic two-seat planner.

## Next step toward the target

Use the exact original-field card inventory to demand **both** owner-run paper-payable Trainer candidates and genuine native selected physical resolution. Compare alternatives under shared Supporter quota and competing connector discards in the same owner's hand; follow through to board payoff and a competent opponent reply. Preserve zero-qualified-games and no-99.5%-proof status until complete full-field evidence. Original ranks 23, 25 and 28 still lack authenticated complete source lists.

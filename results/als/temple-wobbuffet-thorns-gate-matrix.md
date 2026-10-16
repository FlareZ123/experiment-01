# Temple Shadow Rider: Wobbuffet / Iron Thorns dual-lock Gate trap

**Agent 42, 16 October 2026.** Evidence level: source printing and paper-card-rule deduction corroborated by a **staged pinned Twinleaf Store effect probe**. This is not a full legal play sequence, source-game decision, or matchup win rate.

## Source-grounded matchup

The published [Aichi 2026 ranks 6, 24 and 29](../aichi-2026/full-decklists.json) each contain four **Iron Thorns ex TWM 77** and no other Pokémon. On their accepted opening, Iron Thorns must start Active. **Initialization** suppresses Abilities on Pokémon with Rule Boxes in play, except Future Pokémon. [The exact printing census](../aichi-2026/lock-threats.md) verifies this and the opposing rank identities.

The Temple candidate has one **Wobbuffet PHF 36** and one **Radiant Eternatus CRZ 105**. Wobbuffet's Active-only **Bide Barricade** disables Abilities of non-Psychic Pokémon across in-play, hand and discard zones. Opposing Iron Thorns ex is Lightning, and Radiant Eternatus is Dragon. Wobbuffet is itself Psychic and is not suppressed by Iron Thorns's Rule-Box-specific Initialization.

The resulting tactical constraint:

- **Wobbuffet Active:** opposing Iron Thorns loses Initialization, but Radiant Eternatus loses Climactic Gate to **its own** Wobbuffet.
- **Wobbuffet Benched:** its own Bide Barricade stops applying, but opposing Iron Thorns regains Initialization and suppresses Radiant's Rule-Box Ability.
- **Wobbuffet Benched + Canceling Cologne applied to opposing Active Iron Thorns:** both restrictions are absent in the staged mid-turn state and Radiant Gate may trigger.
- **Wobbuffet Active + Canceling Cologne:** opponent's Initialization stays suppressed, while own Wobbuffet still suppresses Radiant.

This is a two-sided lock conflict. **Moving Wobbuffet alone cannot turn on Radiant Gate while opposing Iron Thorns remains Active with Initialization**, even though Wobbuffet can successfully turn off that opposing Ability. The interaction must be evaluated separately from Wobbuffet's value in restoring *Psychic* Abilities on other Pokémon.

## Real Store four-case evidence

The [reproducible four-case Store probe](../../simulation/twinleaf/radiant-wobbuffet-thorns-matrix.cjs) uses pinned actual printings, a neutral mid-turn with two VMAX in deck, Wobbuffet Active versus Benched, opponent's Active Iron Thorns, optional Canceling Cologne and actual `PlayPokemonEffect` for Radiant. It separately checks active Initialization and whether the entering Radiant generates a Gate confirmation prompt.

| Wobbuffet position | Cologne on Thorns? | Initialization visible | Gate prompt with research timing hook |
| --- | --- | --- | --- |
| **Active** | No | No | **No** |
| **Active** | Yes | No | **No** |
| **Benched** | No | Yes | **No** |
| **Benched** | Yes | No | **Yes** |

The original corrected-hook matrix assertions passed in [manual pinned-engine run 38852887779](https://github.com/FlareZ123/experiment-01/actions/runs/38852887779), including the requirement that Radiant enter the Bench in all four configurations. The snapshot uses actual Store reducers and does not claim that the player could reach every board, find Cologne, or complete its own attack plan.

### Important simulator-fidelity discrepancy

The **unmodified pinned upstream** incorrectly emitted a Gate confirmation when Wobbuffet was Benched, opponent Iron Thorns was Active, and Cologne was absent. It visibly recognized Initialization as active, but assessed the entering Dragon Radiant's Bench-triggered Ability too early in the hand zone. The [existing reversible research-side Gate timing hook](../../simulation/twinleaf/radiant-gate-lock-hook.cjs) fixes this staged gate assessment. This hook is distinct from Wobbuffet Active's self-lock, which the unmodified upstream already applied correctly. Baseline unpatched engine completions should never credit that erroneous Gate line as paper-legal setup evidence.

## Strategic relevance and exclusions

Wobbuffet can remove opponent Iron Thorns's Ability lock and thereby enable abilities on the player's Psychic Shadow Rider Calyrex VMAX, which are exempt from Wobbuffet's lock. That **does not** imply it enables the Dragon Radiant Eternatus entry ability. Temple's Natural V→VMAX route and Wobbuffet's anti-ability line may therefore serve different configurations and timing requirements. See [exact natural + Gate opportunity overlap](../aichi-2026/agent42-joint-vmax-access.md).

No inference here establishes the probability of drawing Wobbuffet, Cologne or required Bench/switch pieces together; opponent Item lock, early Knock Outs, future-rule exceptions, Supporter contention and the number of VMAX actually usable remain outside the staged fixture. The single-deck 99.5% field target remains unverified.

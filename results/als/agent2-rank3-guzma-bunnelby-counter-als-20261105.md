# Rank-3 Snorlax Stall: owner-held Guzma as a Bunnelby recovery line

**5 November 2026. Printed-card tactical hypothesis, source-owned native counterfactual queued. Competitive-qualified games: zero.**

## Printed-card feasibility

The authenticated original rank-3 Snorlax Stall inventory contains one **Guzma BUS**, one **Bunnelby PRC 121**, three **Capture Energy RCL**, three **VS Seeker**, and three **Snorlax PGO 55**. The supplied card database establishes:

- Snorlax PGO's Active-only **Block** Ability and printed four-Colorless Retreat Cost.
- Bunnelby PRC's one-Colorless **Burrow** attack, which discards the top opposing deck card, and **Ω Barrage** trait permitting a second attack during its player's turn.
- Capture Energy provides one Colorless Energy while attached.
- Guzma BUS, a Supporter, switches an opposing Benched Pokémon into the Active Spot and then switches its user's Active Pokémon with a Benched Pokémon, contingent on performing the first switch.

These facts support a **conditional** response: with Snorlax Active holding only one ordinary Colorless-providing Energy, a Bench Bunnelby already carrying Capture Energy, owner hand Guzma, no Supporter used this turn, no applicable Supporter lock and both Benches occupied, Guzma offers a way to promote the funded Bunnelby without paying Snorlax's four-Energy retreat. The player may then use Burrow, possibly twice via Ω Barrage if no additional restriction applies. Guzma consumes the turn's Supporter choice. The opposing switched-in Pokémon and its retreat or switching options matter. This line is conditional on an actual accepted card and both targets; exact live-game feasibility still requires a real native/paper state check.

## Historical experimental motivation

The original rank-3-vs-rank-1 seed 290134 native game originally ended in a rank-3 Bunnelby deck-out win. A genuine rank-1 Guzma plus later VMAX selection reversed the native winner to rank 1, as documented in [the four-arm report](../methodology/agent2-original-rank1-guzma-vmax-native-reversal-20261105.md).

During that altered game, read-only owner-hand observations found rank 3's native bot **passing with Snorlax Active, Bunnelby on the Bench holding Energy, Guzma BUS in its own hand**, and count-zero Supporter quota on its own turns 16 through 28. The raw audit flagged no Supporter lock. This is an owner-visible *alternative*, not proof that the rescue would win or that specific opponents can be stranded. Source-own Guzma at turn16 could change both board positions and rank1's subsequent VMAX timeline.

The registered native reciprocal attempt is [Actions run 41967654243](https://github.com/FlareZ123/experiment-01/actions/runs/41967654243). The source intervention uses genuine native PlayCardAction, native prompt validation and the same original physical deal. The [general side-independent owner-only mobility frontier](../../simulation/twinleaf/agent2-owner-guzma-mobility-frontier.cjs) detects the nominal simple-colorless resource shape without inspecting opposing concealed cards, and has [four passing isolated pure test groups](../../tests/agent2-owner-guzma-mobility-frontier.test.cjs). It is an opportunity model only and is not a selected shared policy.

## Necessary follow-through

Validate exact accepted source Guzma, both native switch choices, Bunnelby promoted and subsequent actual Burrow or Rototiller, native opposing reply, and game outcome or cap. Preserve the unchanged-control and VMAX-only comparisons and the owner physical-deal fingerprint. Evaluate whether choosing a low-Energy, high-retreat-cost opponent is actually useful after alternative switching effects and rank1's next Supporter. Neither raw bot Pass nor a graph-searchable Guzma justifies claiming any matchup win.

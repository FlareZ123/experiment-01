# Source-independent owner VS Seeker to Guzma recovery opportunity

Agent 2, 5 November 2026. **Developmental pure planner only, zero qualified games**.

The original Aichi Top32 29 named 60-card inventories include 23 decks containing **both Guzma BUS and VS Seeker PHF**. The [original field census](agent2-aichi29-guzma-vs-seeker-owner-policy-coverage-20261105.md) records 48 total Guzma and 59 VS Seeker copies. Original rank1 and rank3 each contain one Guzma plus three VS Seeker.

New small pure module [ownerVsSeekerGuzmaOpportunity](../../simulation/twinleaf/agent2-vs-seeker-guzma-recovery-frontier.cjs) reads a **detached own-root actorObservation**, and reports one structurally plausible two-step recovery when all of the following are true: the acting owner's hand contains VS Seeker PHF, own public discard has Guzma BUS, no directly held Guzma, count-zero Supporter quota, no known Item or Supporter lock, and both players have a Bench. The result contains the owner's actual Item hand index, requested discard Supporter printing, and public target indices. It does not inspect opposing hidden zones or any live Store state.

**Isolated JavaScript verification of the checked-in module, blob SHA-256 Git identifier `35162e42bb70f7ba38545a083a7e8a0b0cbc0b79`: 8/8 procedural assertions passed** for both actor seats, count1/count2 Supporter vetoes, Item lock, missing discard target, missing held Item, and opponent concealed-content noninterference. A complete standalone Node test source commit was blocked by the repository tool safety gate. No compiled native CI claims follow.

The action still requires an actual payable VS Seeker action, exact own-discard ChooseCards prompt selection, real retrieval into own hand, a later Guzma Supporter root, both native Pokémon switching prompts, any attached-Energy legality and a consequential attack/control payoff. The role of whether rank1 holds VS Seeker after rank3's genuine turn16 Bunnelby rescue remains **unobserved**, even though the printed original inventory contains three.

This frontier can be plugged into an owner-information-safe bilateral shared policy as a *resource option*, conditional on strategic alternatives and real Store validation. It is a reproducible next-step boundary for [Issue25](https://github.com/FlareZ123/experiment-01/issues/25), **not a scored game**.

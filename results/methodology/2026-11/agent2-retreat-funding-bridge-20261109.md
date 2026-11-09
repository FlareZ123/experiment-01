# Owner-visible Basic attachment -> paid retreat -> funded Bench attack

**Agent 2 | 9 November 2026 | developmental policy, default OFF.** This adds an executable missing resource-to-attack continuation to the common actor. It remains an unqualified hypothesis until actual pinned-native payment, attack settlement and opponent response are observed.

## Concrete failure and implemented correction

The existing shared Basic Energy recipient scorer prioritizes reductions in *printed attack deficits*. Existing paid-retreat frontiers generally demand an **already funded Active Retreat Cost**. Together these branches can strand a ready Benched attacker when the Active lacks just one Basic Energy to retreat. Attaching one held Basic to the Active can solve a mobility deficit even when it makes none of the Active's attacks payable.

New [planner](../../../simulation/twinleaf/2026-11/agent2-retreat-funding-bridge.cjs) chooses the following sequence from *fresh detached owner-only observations* on successive roots:

1. If a Benched Pokémon has a printed, currently funded, fixed positive attack of at least 80 damage, the Active has **exactly one printed Colorless Retreat Cost and no Energy**, and a held Basic can pay that fee without immediately funding an Active attack, propose **attach Basic to Active**.
2. After the genuine Store actually accepts the attachment and the actor sees a Basic attached to the Active, propose **paid Retreat to that Bench index**. The existing native actor action constructors translate the two intents into `PlayCardAction` and `RetreatAction`.
3. The existing common actor should then reconsider the newly Active printed attack on the next root. The new bridge itself does **not** force a future attack or invent its legality.

Stage 1 and stage 2 share no hidden cross-turn state; actual board, original physical cards and turn quotas determine the next decision. The bridge is inserted before the generic Basic Energy attachment, after existing stronger priority actions. The default actor is preserved when `retreatFundingBridge` is omitted or false.

## Safety and actual costs

The planner refuses a currently payable Active attack, including zero-damage/control or GX attacks; an attachment that itself unlocks an Active attack; an Active Tool or modified/multiunit printed retreat fee; an opponent visible retreat-blocking Active; Asleep/Paralyzed or explicit retreat restriction; a used retreat quota; a Bench attack without recognized Basic-only payment; and a retreat that would lose an Active-position-dependent Ability. It respects the once-turn Energy attachment and known public Energy locks. It uses printed damage and a deterministic Bench target order. It reads no concealed opposing cards and does not infer the owner's unknown deck or Prize faces.

**Limitations:** actual effective Retreat Cost may differ from printed cost due to continuous effects not covered by these safety screens. Fixed printed damage 80+ is a resource-payoff criterion, not a knockout or optimal-play guarantee. Resource opportunity cost and opponent counterplay still require full native continuations. The genuine Store may reject either action. Such a rejection must be recorded as a failure, never reinterpreted as a legal paper line.

## Implementation, regression and release path

- [Canonical actor hook](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs): `deps.retreatFundingBridge===true` opts in; audit version includes planner version, with separate selected attachment/retreat counters. Existing native action constructor cases are reused.
- [Eight isolated pure contracts](../../../tests/2026-11/agent2-retreat-funding-bridge.test.cjs): **8/8 passed** using the local Node test runner on 9 November 2026. Covers exact two-action progression, payable control attack protection, public opponent/Active locks, own attachment/retreat quotas, status, Tool and cost safeguards, Bench target selection, unknown Energy and Active-attack competition. These are no Store settlement evidence.
- [Five canonical actor integration contracts](../../../tests/2026-11/agent2-retreat-funding-actor-integration.test.cjs): committed for the shared manual CI gate; locally unexecuted because the runtime does not have the full repository dependency tree.
- [Two-seat pinned Store fixture](../../../tests/2026-11/agent2-retreat-funding-two-action.native.test.cjs): a constructed late-turn real-card state uses Dedenne-GX UNB as the stranded one-retreat Active, Dialga-GX UPR with physically attached Metal/Psychic/Psychic on Bench, and a held Psychic Basic. It tests original Energy transfer, one-Energy paid Retreat, physical Energy discard, exact Bench promotion, and Dialga-GX Shred attack. The fixture uses a *synthetic board*, not a natural Aichi source deal. **Native CI has not been executed or certified at this checkpoint.**
- [Existing manual-only shared workflow](../../../.github/workflows/agent36-bilateral-competence-v9.yml): adds pure contract tests to the contract-only lane, and native fixture/syntax checks to the existing compiled lane. No new workflow and no per-commit CI trigger.

The next decision-changing test is a prospectively registered **one matched original-deal treatment** where this new planner actually triggers, followed by a real Store-paid Retreat, recorded attack and source response. Compare the identical physical opening and both fixed unchanged 60s under a common actor/profile. Keep caps, native aborts, invalid payments, and non-triggered arms in the released denominator. Do not launch another broad panel for a hypothetical line with no encountered positive state.

**Competitive benchmark unchanged:** 29/32 exact original Aichi Top 32 sixties admitted, ranks 23/25/28 missing; zero competitively qualified paper games; no final selected sixty or demonstrated 99.5% win rate.

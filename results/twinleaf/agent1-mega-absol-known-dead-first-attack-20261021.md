# Mega Absol first-payable selection: a public-zero-effect counterexample

**Agent 1, 21 October 2026 UTC.** Evidence: verified pinned print, pure source-order reasoning, seven newly committed regression tests. No complete-game intervention or matchup claim.

## Precise printed state and diagnosis

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements [Mega Absol ex](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/11-mega-evolution/set-mega-evolution/mega-absol-ex.ts), `fullName='Mega Absol ex M1L'`, with:

1. **Terminal Period**, `[Darkness, Colorless]`, damage `0`. Its effect KOs the opponent Active only when it has **exactly six damage counters**, namely 60 damage. The code checks `opponent.active.damage === 60`.
2. **Claw of Darkness**, `[Darkness, Darkness, Colorless]`, damage `200`, followed by a publicly announced hand-reveal/discard effect when the opponent holds at least one card.

The canonical actor root's [printed-cost matcher](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) scans attacks in their printed order and immediately returns the first payable attack. A game state with three Basic Darkness Energy on Active Mega Absol ex, a live opposing Active with **zero public damage counters**, and no attack lock satisfies both printed costs. The current actor root chooses **Terminal Period**, whose exactly-six-counter condition is publicly false. It therefore has no KO effect, while Claw of Darkness is a legal named payable alternative under the printed costs. Actual attached-Energy restrictions, continuous locks and other Store effects must still be checked by the native engine.

This counterexample applies to the exact Mega Absol printing registered in **five** of the 29 published Top-32 60s, ranks **8, 9, 11, 16, 22**, totaling **ten copies**. The separately verified Girafarig LOT 94 source-order defect appears in **four other ranks**, 1/2/3/7, each with one copy. Thus *nine distinct published decklists* contain at least one printing with a demonstrable first-payable conditional-effect risk. That is an **inventory-level footprint**, not the frequency with which such states occur in matches.

## Bounded owner-visible remedy

[Pure selector](../../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs) consumes a detached owner-view and **already cost-payable** attacks. It prefers Claw of Darkness precisely if:

- exact active printing is `Mega Absol ex M1L`;
- first payable move is the printed zero-damage Terminal Period;
- opponent Active has a known nonnegative number of damage counters **other than 60**;
- the printed 200-damage Claw of Darkness is also payable.

If the defender actually has exactly 60 damage, default first attack is preserved. Missing damage information, unavailable second attack and a different printing cause abstention. The same module reuses the separate public-discard-empty Girafarig exception. Opponent hand identities, unknown deck identities, hidden Prize composition and opponent policy are never read. No assertion is made that Claw is always the globally optimal line, because immunity, prize economics, severe lock effects, KO-triggered abilities and future game states can change the outcome.

The [seven new test cases](../../tests/agent1-actor-dead-first-attack-frontier.test.cjs) include original-root first-payable behavior for a detached three-Darkness state, exact-six counterpreservation, no payable alternative, unknown public information, printing specificity and opponent hand-independence. They were added to the manually dispatched canonical test workflow. **This selector remains stand-alone and was not inserted into the shared root**; its proposed choices are not native Store-accepted attacks yet.

## Qualification and next action

The canonical source rank11 and rank8/9/16/22 opponent policies must eventually face strong actor-only two-attack choice before their simulated results count as credible benchmark outcomes. Extend the single optional canonical root policy to collect all actual cost-payable attacks and evaluate known-effect conditions **after** checking costs, before selecting the attack. Preserve original behavior behind an explicit feature flag, run the new regression, record actual owner-visible damage and native Store declarations, then test on a fresh source-dealt cohort with both seats, six-Prize progress, and existing timeline and quota guards.

The new paired [read-only natural-evolution Pass census](../../simulation/evaluation/agent1-missed-evolution-pass-census.cjs) addresses a distinct earlier blocker. Do not conflate counterexample tests with game strength.

**Benchmark remains at 29/32 verified field lists, zero competitively qualified games and no demonstrated 99.5% fixed deck.**

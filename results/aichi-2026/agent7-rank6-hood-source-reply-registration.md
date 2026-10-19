# Agent 7: precommitted replay of rank-6 Item/Supporter Hood-removal response

**19 October 2026, before any rank-6 source-response replay outcomes.**

This is a **retrospective-frame, newly frozen policy counterfactual** using the previously published 16 source deals from [rank6 Hood trial](agent7-hood-rank6-prospective-source-outcome.md), whose outcomes are already known. It is **not a new independent prospective matchup sample** and should not be used for an updated win rate. It probes whether the genuine original rank-6 Iron Thorns 60 can physically answer a real Hood attached by the candidate through natural draw and a source-owner decision.

## Frame, arms and action policy

Use exactly the **16 original rank6 `deriveSlotSeeds(20261019,'pilot',6,repeats 1..8)` physical deals**, with 8 original source seat0 and 8 original source seat1. Preserve Hood Shield v1 unchanged. Both arms receive exactly the same candidate owner/public-board Hood and protected Door policy. In the control arm the original source uses baseline SimpleTacticsAi. In the treatment arm, its sole new opt-in policy takes the first legal **owner-hand `Megaton Blower` Item**, otherwise the owner-hand **`Faba` Supporter**, when its actual owner turn, no pending prompt, and an opposing visibly Benched Hood on Shadow Rider V/VMAX coexists with its own visibly Active Iron Thorns ex. Otherwise delegate to unmodified default bot. A source `PlayCardAction` is only selected after its original `isValidAction` check. Resolution prompts remain generic pinned rules/resolvers: no hidden deck look, no forced chosen target, no artificial Tool, no removal injected.

The source selector is deliberately simple and potentially suboptimal. Playing an ACE SPEC for a single Hood may be dominated, and Faba consumes the turn's only Supporter. It is meant to verify legal counterplay, not approximate optimal play. The source has one Megaton Blower and one Faba in its exact registered 60, so no per-deal guarantee that a target and held answer coincide. These are original source physical shuffles, no rigged hand or fixed seed chosen for a favorable response.

## Required evidence and stop rules

Keep every one of the 16 source frames in each arm, every rejected source opportunity, identical-deck hashes and recorded genuine first-player draw logs; 140 root actions each. Record exact source-owner publicly eligible target(s), own held remover(s), whether its proposed Item/Supporter was actually played, which Tool left the opposing Bench after real Store root/prompt resolution, whether removed Tool landed in Lost Zone/discard where available, and subsequent candidate Door/attack opportunities.

Use the original-pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` with the same explicit printing equivalence, hook permissions and isolation. Verify original control's published first-player, 7 physical Hood attachment trial count and 4 protected Door effect trial count before interpreting replay treatment outcomes. Keep any divergences and exceptions; do not replace failing source deals.

**Acceptance is an actual replay from a physically present opponent Tool into a real source-removal card effect with the same original private/public information boundary.** Zero opportunities is a useful negative exercise, with no assertion about what a competitive human opponent could find. No all-32 evidence, no game-win qualification, no use to estimate the 99.5% target.

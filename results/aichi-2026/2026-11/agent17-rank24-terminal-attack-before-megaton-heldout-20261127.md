# Rank 24 held-out: terminal Volt Cyclone must outrank Megaton Blower

Agent17 · 27 November 2026. **Decision affected:** current rank24 Iron Thorns development-policy correctness. Static exact-branch code review; not a native game or matchup result.

## Current defect

Reviewed current branch `agent18/rank24-iron-thorns-policy-20261127`, worker blob fetched as `65c7cc06af1a4657cdf27844ae0b8948311ad5c6`.

In `fundingScore()`:

- a legal Volt Cyclone into an Active with remaining HP <=140 scores **290**;
- Megaton Blower scores **300** whenever the opponent has at least one public Special Energy or Tool.

`fundingDecision()` chooses the highest score after the mill/N terminal checks.

Therefore, if Volt Cyclone is an actually offered legal attack that would take the actor's final Prizes, but the opponent also has any removable Tool/Special Energy, the policy can choose **Megaton Blower instead of winning the game**.

This is not an exotic interaction. The current Shadow Rider candidate family commonly exposes Stealthy Hood / Forest Seal Stone / Special Energy states, and Megaton Blower is the source's singleton ACE SPEC.

## Minimal held-out

Public actor state:
- Active Iron Thorns ex;
- actual root frontier offers Volt Cyclone, so attack payment/legality is already established;
- opponent Active has <=140 remaining HP;
- opponent Active is worth enough Prizes to reduce actor's remaining Prize count to zero (for a 2-Prize target, actor has <=2 remaining; for any other target use actual public prize liability);
- no attack-prevention / Prize-reduction effect makes the KO nonterminal;
- opponent has at least one public removable Tool or Special Energy, so Megaton Blower is also offered/scored.

Expected root: **Volt Cyclone**, not Megaton Blower.

The same principle should also apply to any other directly supported deterministic final-Prize attack introduced later.

## Repair shape

Do not merely raise Volt Cyclone from 290 to 301. Add a terminal layer above ordinary funding/resource scores:

1. inspect actually offered attack actions;
2. for Volt Cyclone, use public target remaining HP and public prize liability;
3. require deterministic direct KO under the currently modeled damage/effects;
4. require resulting Prize gain reaches zero actor Prizes;
5. choose that attack before Megaton / Enhanced Hammer / Plumeria / setup scoring.

If the current state contract cannot prove prize liability for the Active, fail closed rather than guessing from its name.

## Negatives

- KO is nonterminal because actor has too many Prizes remaining → existing resource comparison may proceed.
- Legacy Energy or another public Prize-reduction effect applies → do not call it terminal.
- damage prevention/effect immunity or attack not actually offered/payable → no terminal override.
- opponent has no Pokémon to yield the required public Prize count information → fail closed.
- terminal mill/pass state remains higher priority when already established by the existing safe mill logic; do not reorder a guaranteed deck-out into an unnecessary attack without comparing the two certified terminal outcomes.

## Evidence boundary

This finding does not establish that Megaton's ordinary score is globally wrong. It establishes only that **resource-denial scoring must not outrank a certified immediate game win**.

No branch file, candidate list, native runner, fixture or admission status was changed by this review.

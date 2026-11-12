# Canceling Cologne: Item-multiplicity rule audit for the 4410 paper gate

**Agent 41 — 12 November 2026.** Rulebook/code audit; not a claim about an unobserved 4410 play.

## Finding

The repository's advanced manual transcription, `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, B-01 (Items), lines 388–397, says players may play **any number of Item cards during their turn**. It separately prohibits using an Item if its resolution would not change the game state.

Canceling Cologne is an Item. Therefore a second Cologne in the same turn is not illegal merely because it is second. It may be illegal if it is a no-op against the same unchanged Active Pokémon; it may be legal if the game state/target changed and the second use changes state. A per-seat/per-turn count cannot decide.

## Exact false assumption

1. `simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs` claims to enforce an "official Japanese ruling" that a player cannot play a second Canceling Cologne during the same turn. Its Store/card hooks enforce that absolute limit. The repository manual contradicts the claim. If retained, this is a **voluntary conservative policy quota**, not a rules correction.

2. `simulation/evaluation/agent48-cologne-native-ledger-audit.cjs` groups accepted Cologne `PlayCardAction` roots by game epoch, seat, and turn. Count>1 becomes `duplicateAcceptedBySeatTurn` and `acceptedOncePerSeatTurn=false`. It does not inspect physical card identity, target identity, or per-use state change; it cannot distinguish a duplicate log, a second physical copy with a new legal target/effect, or a no-op.

3. `simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs` makes its review gate require `acceptedOncePerSeatTurn===true` even when `hookOptInEnabled===false`. The hook flag is recorded but does not affect `auditClear`. A structurally valid ledger with two distinct same-turn Cologne plays is therefore blocked from independent paper review when the hook is disabled.

4. `simulation/evaluation/agent41-bilateral-v2-development.cjs` defaults `paperCologneQuota=false` and enables the hook only with `AGENT48_PAPER_COLOGNE_DEV==='true'`. The 4410 workflow does not set that variable; the frozen 4410 profile has no Cologne-quota option. Thus 4410 does not opt into the policy quota, yet the producer gate still treats the quota as paper law.

## Correct separation

- **Native ledger integrity:** consecutive ordinals, real seat/turn, and authenticated sudden-death epochs. This can gate whether the ledger is reviewable.
- **Optional policy quota:** if the explicitly named conservative one-per-turn hook was enabled, report its conformance as policy evidence only. It is not paper legality.
- **Paper Item legality:** for every Cologne use, verify physical card movement, the opponent's then-Active target, and whether resolution changes game state. Multi-use turns need per-use target/effect evidence. A no-op second use fails B-01 step 1; count alone cannot establish that.

Recommended gate: a structurally valid ledger remains **eligible for independent paper review** when `multipleAcceptedBySeatTurn` is non-empty; surface those rows as `requiresTargetAndEffectReview`. Report optional policy-quota conformance separately. Never set `paperLegalityCertified=true` from this count audit. Rename/document `duplicateAcceptedBySeatTurn` as multiple uses, not duplicate roots. Replace tests that block all same-turn multiple Item roots with tests for distinct physical cards/state-changing targets, no-op effects, and genuinely duplicated physical-card/root identities.

## Scope

This is a rules-model inconsistency, not evidence that a particular 4410 action was legal or illegal. The actual 4410 receipt packet has not been independently reviewed here. No frozen options, source registration, candidate 60, or gameplay are changed.

Relevant official card record: [Canceling Cologne](https://www.pokemon-card.com/card-search/details.php/card/41294).

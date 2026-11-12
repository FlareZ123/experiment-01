# Canceling Cologne: correction — official Q&A confirms once-per-turn restriction

**Agent 41 — 12 November 2026.** This corrects and withdraws the preceding interpretation in this file's earlier revision.

## Correct ruling

The repository's advanced manual transcription, `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, B-01 (Items), lines 388–397, gives the general rule that any number of Item cards may be played during a turn. However, the official Japanese card-specific Q&A for Canceling Cologne explicitly asks whether it can be used again during the same turn and answers **no**. That specific ruling controls the generic Item rule for this card.

Official sources:
- [Canceling Cologne — S9a 063/067](https://www.pokemon-card.com/card-search/details.php/card/41294). Its printed effect lasts through the turn and explicitly includes Pokémon newly placed in the Active Spot; the page also identifies it as a `グッズ` (Item).
- [Official Q&A search for Canceling Cologne](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E3%82%B3%E3%83%AD%E3%83%B3&regulation_faq_main_item1=all). One question asks whether a second Canceling Cologne can be used during the turn in which the first was used; the official answer is no. The same page confirms that the first Cologne's effect also removes the Ability of a newly promoted Active Pokémon for the remainder of the turn.

## Code assessment

The original conclusion that the one-per-turn restriction was a false paper rule was **wrong**. I applied the generic B-01 Item rule without checking the card-specific official Q&A. The current implementation is consistent with the specific ruling:

1. `simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs` enforces one Cologne use per player per turn. Its description as an official Japanese ruling is supported by the official Q&A. It is a rules-correcting hook, not merely a strategic quota.
2. `simulation/evaluation/agent48-cologne-native-ledger-audit.cjs` counts accepted Cologne roots by game epoch, player slot, and turn. More than one accepted use in one player's turn is a paper-rule violation; authenticated sudden-death epoch segmentation prevents turn-number reuse from creating a false duplicate.
3. `simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs` correctly blocks independent paper review when `acceptedOncePerSeatTurn` is false, even if `hookOptInEnabled` is false. The postgame audit must catch an illegal second use if the simulator hook was not enabled.

The frozen 4410 profile does not opt into `paperCologneQuota`, and the workflow does not set `AGENT48_PAPER_COLOGNE_DEV`. That does not invalidate the review gate: if the unpatched engine accepts a second Cologne in one player's turn, the audit should fail closed. If no second use occurs, the audit can pass.

## Retraction and instructions

- **Retract** my earlier message that multiple same-turn Cologne plays should be allowed or that the review gate was wrong.
- Do not remove or weaken the one-per-turn hook, `acceptedOncePerSeatTurn` audit, or producer review gate on the basis of my prior message.
- The earlier recommendation to rename the same-turn count as harmless multi-use was also wrong.
- No actual 4410 receipt packet was reviewed here; this confirms the rule and validates the gate, not any particular trial's actions.

The generic manual rule remains correct for Items generally; Canceling Cologne has a specific official card ruling that restricts a second use in the same turn.

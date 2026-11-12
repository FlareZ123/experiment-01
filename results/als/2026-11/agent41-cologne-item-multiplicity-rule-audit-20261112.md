# Canceling Cologne: correction — official Q&A confirms once-per-turn restriction

**Agent 41 — 12 November 2026.** This corrects and withdraws the earlier interpretation in this file's first revision.

## Correct ruling

The repository's advanced manual transcription, `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, B-01 (Items), lines 388–397, gives the general rule that any number of Item cards may be played during a turn. However, the official Japanese card-specific Q&A for Canceling Cologne explicitly asks whether it can be used again during the same turn and answers **no**. That specific ruling controls the generic Item rule for this card.

Official sources:
- [Canceling Cologne — S9a 063/067](https://www.pokemon-card.com/card-search/details.php/card/41294). Its printed effect lasts through the turn and explicitly includes Pokémon newly placed in the Active Spot; the page identifies it as an Item.
- [Official Q&A search for Canceling Cologne](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E3%82%B3%E3%83%AD%E3%83%B3&regulation_sidebar_form=all). One question asks whether a second Canceling Cologne can be used during the turn in which the first was used; the official answer is no. The same page confirms that the first Cologne's effect also removes the Ability of a newly promoted Active Pokémon for the remainder of the turn.

## Pinned Twinleaf comparison

The committed submodule is `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

At that exact revision, `ptcg-server/src/sets/09-sword-and-shield/set-astral-radiance/canceling-cologne.ts`:
- identifies Canceling Cologne as an Item;
- returns `true` from `CancelingCologne.canPlay()`, so upstream does **not** enforce the card-specific second-use restriction;
- applies an ability-lock marker to the opponent player, while the lock handler checks the player's current Active Pokémon and clears the lock at the appropriate turn boundary. This matches the official text/Q&A that a newly promoted Active Pokémon is also affected.

Therefore the research-side `simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs` is necessary for paper-faithful simulation of the official once-per-turn ruling. When the hook is off, the postgame same-player/same-turn/epoch audit must catch an accepted second use and fail closed.

## Code assessment and current gate

The original conclusion that the one-per-turn restriction was a false paper rule was **wrong**. I applied the generic B-01 Item rule without checking the card-specific official Q&A.

The current implementation is consistent with the specific ruling:
1. The once-per-turn Store/card hook enforces the official restriction when enabled.
2. `simulation/evaluation/agent48-cologne-native-ledger-audit.cjs` counts accepted Cologne roots by game epoch, player slot, and turn. More than one accepted use in one player's turn is a paper-rule violation; epoch segmentation prevents turn-number reuse from creating a false duplicate.
3. The producer review gate must require `acceptedOncePerSeatTurn===true` even when `hookOptInEnabled===false`. If the unpatched engine accepted a second use, the paper review must block.

Agent44 independently checked the official Q&A and restored the gate in commits `a495ff23fb047786eecac88c9d9ce0783881fc0d` and `f520c2ef8ae4e7ef6e217c96c7ad0e337327e9fe`. The gate-v2 change that treated same-turn multiple uses as reviewable was superseded. Current main retains the card-specific rule gate. A clear audit remains pending independent paper review; no code self-certifies paper legality.

The frozen 4410 profile does not opt into `paperCologneQuota`, and the workflow does not set `AGENT48_PAPER_COLOGNE_DEV`. This does not invalidate the gate: if the unpatched engine accepts a second Cologne, the postgame audit must reject paper review. If no second use occurs, this particular rule check can pass.

## Retraction and scope

- **Retract** my earlier message that multiple same-turn Cologne plays should be allowed or that the review gate was wrong.
- Do not remove or weaken the one-per-turn hook, `acceptedOncePerSeatTurn` audit, or producer review gate on the basis of my earlier message.
- The generic manual rule remains correct for Items generally; Canceling Cologne has a specific official card ruling that restricts a second use in the same turn.
- No actual 4410 receipt packet was reviewed here; this confirms the rule, pinned-engine gap, and gate semantics, not any particular trial's actions.

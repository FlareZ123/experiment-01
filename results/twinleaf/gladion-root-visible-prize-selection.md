# Gladion's genuinely revealed Prize choice: root-scoped alternative

**Agent 40, 18 October 2026.** A bounded prompt-decision policy correction for paper Expanded. This is a **constructed pinned-Store mechanics and decision test**, not an authentic dealt tournament game or competitive win-rate measurement.

## Concrete deficit and source basis

The pinned Twinleaf `ChoosePrizePromptResolver` takes the first `count` occupied Prizes regardless of card identities. The pinned `Gladion CIN` reducer, after staging Gladion, exposes eligible face-down Prize cards and requests a `ChoosePrizePrompt` with count one. The owner is therefore legally able to distinguish the revealed card printings at that specific pending root prompt.

Rank-2 source Vileplume contains one `Gladion CIN` and one `Grand Tree SCR`. A constructed test with Grand Tree in the fourth Prize slot can compare the generic first-slot choice against a mechanically legal explicit-target choice. Prioritizing Grand Tree is **an experimental tactical hypothesis**, not an established best play for that game state.

## Pre-registered falsification and implementation boundary

Test `tests/gladion-visible-prize-root.test.cjs` must perform an actual pinned-Store `PlayCardAction` of Gladion, show all occupied Prize slots revealed and a real pending `ChoosePrizePrompt`, compare the generic first-slot output to a desired fourth-slot response, validate the alternative with the prompt, dispatch it, and verify that Grand Tree reaches hand while Gladion goes back among hidden Prizes. The root deck-membership epoch must recognize the full review and preserve K1 after the previously visible supporter is reprized. Fail the test on any missing step or invalid selection.

The alternative [resolver](../../simulation/twinleaf/gladion-visible-prize-resolver.cjs) is strictly opt-in through `runMatch({gladionVisiblePrizeTargetSeat,gladionVisiblePrizeTargetPrint})`. It requires the live root `state===store.state`, genuine pending prompt identity, source `Gladion CIN` in staged Supporter cards, actual all-revealed Prize slots, one own-Prize target of the exact specified printing, an unblocked target position, and successful `prompt.validate`. Every other prompt falls back to the pinned generic resolver. Hypothetical speculative AI states are explicitly excluded from target-specific choices, since allowing retrospective physical Prizes to influence whether to play Gladion would create a hidden-information leak.

Pure negative controls: hidden Prize(s), no Gladion, foreign player, unavailable target, blocked slot, count !=1, opponent-Prize mode, invalid prompt. The card/slot arrays must remain untouched by the policy.

## Evidence and scope

The repository's existing manually dispatched `aichi-tm-attack-policy.yml` workflow includes the bounded test. Expected engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source head and actual CI result will be appended after verification. No simulated games enter a competitive denominator.

Unresolved: an **authentic source-dealt** rank-2 state where Gladion is in hand, the relevant card is Prized in a later slot, and the choice changes a subsequent legal evolution or meaningful opponent reply. The generic resolver's prior card choice being strategically inferior is not proven by this fixture. The full source-60, both starting positions, decision trajectory, and opponent competence remain unqualified.

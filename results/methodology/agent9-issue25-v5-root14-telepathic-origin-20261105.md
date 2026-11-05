# Agent 9: independently resolved the v5 root14 prompt origin

**5 November 2026 | Scope: one actual aborted native source game | Evidence: downloaded native archive, pinned source, printed card database.** This is a developmental diagnosis. No competitive games are qualified, no deck is selected, and the stated 99.5% field target is unproven.

## Reproduction and immutable custody

The frozen, selected-v4 versus controlled-v5 native archive was downloaded from [GitHub Actions run 42059191496, artifact 13432225055](https://github.com/FlareZ123/experiment-01/actions/runs/42059191496/artifacts/13432225055). Its v5 JSON is **147,651 bytes** with independently recomputed SHA256 `22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17`. The source compiled at `84c683ae93b1fc07e2c68826c3d59cd6d506742e`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All eight registered attempts exist in the archive; the original report [Agent36 v5](agent36-issue25-steward-v5-prize-promotion-20261105.md) remains the source of its preexisting same-deal controlled comparison.

The **one still-aborted** v5 arm is `11:102:A:new-moon-lockbreaker-v1`. The native abort says `bot-decoder`, `ChooseCardsPrompt`, root ordinal 14. The full public accepted root ledger contains 14 actions (ordinals 0–13) and is internally consistent with SHA256 `ca42ff1b739ca817ce6bc6553bd41bc04549554ea7e66b1e430a463b51169aa9`. Its source original-rank11 seat is **1**; its candidate seat is **0**. The direct abort row lacks `originalSourceSeat` and `candidateSeat`; actual registration, `actualFirstPlayer=0`, bot prompt ownership and v5 within-contender paired fingerprints support the attribution. Do not silently rewrite those absent direct fields.

## Actual action/prompt causality

The root sequence is specific and continuous:

| Public native ordinal | Owner | Printed/public action | Native continuation |
| ---: | --- | --- | --- |
| 7 | Candidate seat0 | Play **Fog Crystal** | Owner deck `ChooseCardsPrompt` at 8; opponent reveal at 9; shuffle at 10; Wait at 11 |
| 12 | Candidate seat0 | Play **Duskull** | Accepted Basic onto Bench |
| 13 | Candidate seat0 | Play **Telepathic Psychic Energy** | Its subsequent owner-deck search remains pending at root14 |
| 14 attempted | Candidate seat0 | Bot failed to decode `ChooseCardsPrompt` | No accepted root14 action in ledger |

The **actual** outstanding prompt, as directly observed by the compiling run's owner prompt auditor, is seat0 at global turn1/phase2: `CHOOSE_CARD_TO_PUT_ONTO_BENCH`, `cards===owner.deck`, `allowCancel=true`, `min=0`, `max=2`, `blockedCount=0`. This is materially more informative than labeling the failure only a generic `ChooseCardsPrompt`.

The supplied complete-card database prints `me3-88 Telepathic Psychic Energy`: as long as attached, provides Psychic Energy; **when attached from hand to a Psychic Pokémon**, its owner searches their deck for up to two Basic Psychic Pokémon to put onto Bench, then shuffles. In this repository's pinned English-proxy CardManager the actual native printing is **`Telepath [P] Energy M3`**, as previously verified in [Agent30's compiled native printing audit](../twinleaf/agent30-telepath-m3-pinned-native-fourarm-20261021.md). The root13 public name is an English label of the same effect. The current evidence establishes that a *candidate-owned* search of this printed-effect family is the next decoder blocker. The exact root13 attachment recipient still needs an explicit independent physical witness.

## Reuse and experimental treatment

A preexisting reversible research-owned handler, [`agent8-owner-telepathic-bench-search.cjs`](../../simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs), already implements a narrow both-seat continuation for an **actually Store-accepted from-hand Telepath attachment** and its **matching new owner-deck prompt**. It uses actual filtered Basic Psychic card instances only once the owner's deck search is open; rejects unrelated prompts; invokes native prompt validation; and audits physical deck-to-Bench custody, result settlement and mandatory shuffle. The from-hand guard is important because [pinned Twinleaf has a separate verified non-hand Telepath origin defect](../twinleaf/telepath-attachment-source-confusion.md).

An explicitly **separate** retrospective treatment was created at [`agent9-issue25-telepath-v6-development.cjs`](../../simulation/evaluation/agent9-issue25-telepath-v6-development.cjs), preserving the steward-selected v4 and controlled v5. Its [single full-native comparison test](../../tests/agent9-issue25-telepath-v6.native.test.cjs) runs the unchanged original eight v5 attempts against v6, checks full actual physical initial-deal parity, audits root13→prompt→owner physical custody, preserves every failure/cap, and writes a SHA sidecar archive. The existing [manual-only Twinleaf completion workflow](../../.github/workflows/twinleaf-completion.yml) acquired an explicit opt-in; no on-push workflow, vendor edit or new workflow file was introduced.

**Execution status at initial writing:** Native CI [run 42065232453](https://github.com/FlareZ123/experiment-01/actions/runs/42065232453) was dispatched/queued at source head `40e5b5d2b303d2334514ba2304386af434b2c357`. Its outcome must be read from the actual job, not inferred from submitted code. Tests intentionally fail if the real root14 does not progress beyond the original 14 accepted roots.

## Admission boundaries

A native terminal would remain unqualified without owner information-set correctness, printed payment/recipient evidence, legal deck-search eligibility, meaningful source attack/control payoff, genuine opponent reply, official clock and all 32 authenticated source inventories. The 48-root v5/v6 horizon is unchanged, so added mandatory prompt actions may consume more of that horizon without increasing useful turns. All eight registered attempts, negative or positive, remain part of the development denominator.

**Finding:** Exact root14 family and existing compatible narrow remedy are located and reproducibly linked to the frozen v5 public ledger. Actual integrated v6 success, full paper game admission and competitive performance require distinct evidence.

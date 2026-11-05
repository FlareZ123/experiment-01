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


## Independent original-source decision denominator in the same frozen v5 eight

I recomputed the actual accepted Store root inventory from **all eight** `issue25-steward-v5.json` entries rather than limiting attention to the aborted candidate. For completed rows, the original source seat comes from the raw native row; for the one abort it comes from the verified native abort provenance, cross-checked with the registered source-seat convention. The root ledger already excludes the failed decoder's nonexistent action14. The following counts are strictly **native, public, post-acceptance** actions. They are not independent matched games or paper-certified resource opportunities.

| Frozen source / candidate trial | Source accepted root actions (including prompts) | Source voluntary root actions | Source Pass | Source PlayCard | Source Attack |
| --- | ---: | ---: | ---: | ---: | ---: |
| `6:100:A:champion-reference` | 22 | 6 | 5 | 1 | 0 |
| `6:100:A:new-moon-lockbreaker-v1` | 24 | 6 | 4 | 2 | 0 |
| `6:101:B:champion-reference` | 22 | 5 | 5 | 0 | 0 |
| `6:101:B:new-moon-lockbreaker-v1` | 21 | 4 | 4 | 0 | 0 |
| `11:102:A:champion-reference` | 20 | 6 | 5 | 1 | 0 |
| `11:102:A:new-moon-lockbreaker-v1` (aborted root14) | 4 | 0 | 0 | 0 | 0 |
| `11:103:B:champion-reference` | 23 | 8 | 6 | 2 | 0 |
| `11:103:B:new-moon-lockbreaker-v1` | 19 | 5 | 4 | 1 | 0 |
| **Total, eight developmental arms** | **155** | **40** | **33** | **7** | **0** |

The seven source card plays consist of Speed Lightning Energy twice, Capture Energy once, Darkness Energy twice, Squawkabilly ex once, and Crobat V once. In the source rank6 v5 New Moon arm, the one genuine Capture attachment was as late as public native ordinal45 and its mandatory owner search consumed subsequent roots. This is consistent with Agent36's physical deck-to-Bench observation. It cannot be interpreted as an ensuing attack and opponent reply within a 48-root cap.

**Implication for the integration owner:** repairing candidate-seat0 Telepath's pending prompt will improve one stalled native run. The observed source decisions are separately dominated by Pass actions, and none of the eight observed sources declared an Attack within their available histories. A future actual source-attack-to-reply gate needs meaningful source-side choices and enough native root horizon after paid setup. The denominator above makes clear why a prompt-only success is insufficient, without inferring that every Pass had an affordable better paper option.


## Previously archived original v6 versus selected v5: all-eight identical physical openings

I separately downloaded the older [original mirrored v6 native archive (run41894027367, artifact13353289881)](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367/artifacts/13353289881), independently verifying full ZIP SHA256 `7f8f8ab3f95f6cc7eb17ec12d5d37ff666924216a007b934ccaf662b4e905178` and its `issue25-mirrored-v6.json` (**145,149 bytes**, SHA256 `7ce7d32391074d9802a92c56056641b89b71ac16cd1e52f38f0fb2d0933b7f59`). Comparing against the independently verified selected-v5 archived eight rows yields **8/8 identical source and full two-player initial physical fingerprint digests within each exact registered ID**. This establishes a stronger common physical-start basis than matching seeds alone.

I compared each accepted root's public ordinal, turn, actor seat, action class, pending prompt, printed card and attack. This is an action-level cross-version comparison. Both code and several policy options changed, so the observed divergence cannot be causally assigned to a single adapter without another controlled treatment.

| Exact original ID group | First public accepted root difference | Earlier v6 | Later selected v5 |
| --- | --- | --- | --- |
| rank6 seed100 A / champion-reference | root13, source seat1 turn1 | Source Pass | Source **Speed Lightning Energy** |
| rank6 seed100 A / new-moon-lockbreaker-v1 | root13, source seat1 turn1 | Source Pass | Source **Speed Lightning Energy** |
| rank6 seed101 B / both contenders | **None within 48 accepted roots** | Identical observed accepted root sequence | Identical observed accepted root sequence |
| rank11 seed102 A / champion-reference | **No accepted action mismatch in shared first 25 roots** | Native error root25 | Progressed to original 48-root cap |
| rank11 seed102 A / new-moon-lockbreaker-v1 | root13, candidate seat0 turn1 | Candidate Pass | Candidate **Telepathic Psychic Energy**, then abort at prompt14 |
| rank11 seed103 B / both contenders | **None within 48 accepted roots** | Identical observed accepted root sequence | Identical observed accepted root sequence |

The earlier v6 had **4** source non-Pass/non-prompt actions (all rank11) and zero source Attack actions, independently reported by Agent3. The selected-v5 archive has **7** source non-Pass/non-prompt actions (three rank6 Energy plays and four rank11 plays), with zero source Attack actions. The rank11 New Moon candidate prompt regression and rank11 champion prompt rescue happen in *opposite* arms of the same original source seed102 pair. Aggregate error count therefore hides an important transfer of the liveness bottleneck.

**Decision consequence:** the selected policy has demonstrated additional authentic source root activity on otherwise identical physical starts, although most original source turns still Pass and no source attack/payoff or fully paid opponent reply is observed. It is useful to isolate the root13 candidate Telepath continuation without discarding that source-side Energy progress. These retrospective starts remain development-only; the comparison does not produce a valid causal estimate of competitive deck strength.


## Execution update: lower-priority outer-stack trial cancelled before native execution

At **2026-11-05 16:52:59 UTC**, [my optional outer-stack v6 run42065232453](https://github.com/FlareZ123/experiment-01/actions/runs/42065232453) reached verified GitHub Actions status **completed/cancelled**, after staying in the job queue. Its `abort-custody` job ended `cancelled` before any verified test result; this run provides **zero compiled native evidence**. No result from it is represented as PASS, even though its task dispatched successfully.

Agent8 independently implemented a stronger, true **innermost `headless.runMatch` Telepath decoder** in [`agent8-issue25-v5-telepath-development.cjs`](../../simulation/evaluation/agent8-issue25-v5-telepath-development.cjs), with genuine native staged tests and a separate same-eight treatment. My earlier `withOwnerTelepathicBenchSearch(()=>runStewardInnermostPrizeV5())` installs before v5's nested policies, giving it **lower decision precedence** and a risk of being masked. After confirming this overlap and coordinating with Agent8 and Agent10, I intentionally cancelled my still-queued, duplicated 16-attempt experiment to conserve CI capacity and prioritize [Agent8's already queued inner-stack run42065462779](https://github.com/FlareZ123/experiment-01/actions/runs/42065462779).

The Agent9 outer-stack code and opt-in remain available as explicitly **untested**, separate diagnostic artifacts. Current CI cannot certify its effect. The public root14 diagnosis, exact eight-deal old-v6 versus selected-v5 comparison, and source action-denominator conclusions rely on **successfully executed earlier archived native runs** and remain independently supported. No competitive games are qualified.

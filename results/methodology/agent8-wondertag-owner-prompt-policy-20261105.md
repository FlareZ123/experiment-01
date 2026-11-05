# Agent 8 | 5 November 2026 | owner-bound Wonder Tag prompt baseline for Issue #25

**Status:** new research-owned hook and five pure two-seat mock regressions pass locally; compiled pinned-Twinleaf native fixture is committed but **not yet executed in GitHub Actions**. No release certification, no natural-game estimate and **zero qualified competitive games**.

## Motivating native failure

The independently reproduced [Issue #25 v12 public first-difference](agent3-issue25-v12-tapulele-confirm-and-prize-botdecoder-native-20261105.md) isolates two rank-11 original-source 103:B attempts where the post-Store accepted root changes from Darkness Energy to **Tapu Lele-GX** and the executing bot aborts on a ConfirmPrompt. Another unrelated attempt aborts on a ChoosePrizePrompt; this adapter does not address Prize choices. The v12 observations do not prove that affirming Wonder Tag is the strategically best root.

Pinned source at Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 in sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx.ts generates ConfirmPrompt(WANT_TO_USE_ABILITY) on authentic hand-to-Bench Wonder Tag use. After an affirmative answer it creates ChooseCardsPrompt(CHOOSE_CARD_TO_HAND) restricted to one owner-deck Supporter, with minimum zero, maximum one and no cancellation. The source has an independent zero-selection shuffle defect already reproduced and corrected conditionally in [Agent8's original-60 native study](../twinleaf/agent8-lele-gri-original-source-wondertag-zero-shuffle-native-20261104.md).

## Submitted bounded policy

[Owner-bound prompt adapter](../../simulation/twinleaf/agent8-owner-wondertag-prompt.cjs) wraps the **exact Tapu Lele-GX GRI PlayPokemonEffect** to mark only the actual Confirm and owner-deck Supporter-search prompt instances. During the genuine Confirm prompt it submits an affirmative ResolvePromptAction. **Only after the native owner-deck search prompt exists** does it inspect eligible Supporter objects in that already-searchable owner deck and submit the first valid one or the permitted empty selection. It calls the existing strict assertValidPromptAction before dispatch. Existing native Store dispatch is preserved and selected accepted/rejected actions counted by physical seat. Other prompts delegate to the previous policy, so full-policy hidden-information safety remains explicitly false.

The first valid Supporter rule is a minimal source-independent liveness baseline. It is **not** claimed to be matchup-optimal. It does not read opponent private zones, inspect unrevealed owner-deck order before the search opens, or independently access Prize faces. The exact post-search deck composition is allowed information during a real deck search by Rulebook I-H. The hook is reversible and stays outside upstream vendor/twinleaf. The independent zero-choice shuffle repair must be installed separately if those actions are admitted.

## Regressions and proposed native gate

- [Five pure tests](../../tests/agent8-owner-wondertag-prompt.test.cjs) passed with local Node on 5 November, testing both seats, Supporter-present/absent search, unrelated Confirm delegation and prototype restoration. These use a deliberately faithful mock of the relevant native callback path, **not compiled Twinleaf**.
- [New compiled native test](../../tests/agent8-owner-wondertag-prompt.native.test.cjs) is committed to exercise authentic rank-1/rank-10 printed original 60s staged with Lele in hand in each physical seat, genuine PlayCardAction, the actual pinned SimpleTacticsAi decoder seam, real prompt actions, Store accepted transitions and Supporter custody. Its ShowCards acknowledgment and shuffle choices are deliberately supplied by the fixture, so it **does not prove a fully autonomous whole-game policy**.
- The existing manually dispatched [radiant-gate-engine workflow](../../.github/workflows/radiant-gate-engine.yml) now includes the two new tests. No workflow triggered on commits was introduced. **The native outcome remains UNVERIFIED until that workflow actually runs against the new source revision.** Do not treat the test file or CI configuration as a passing native fixture.

## Integration and falsification criteria

An Issue #25 integrator should install this **inside the selected canonical two-seat actor callback**, or demonstrate that an outer wrapper actually receives these real prompts. Preserve all v12 original source trial identifiers and baseline error outcomes. A prospective native run must show owner-held/played Lele, correct source seat, affirmative Confirm action accepted, selected Supporter physically transferred from owner deck to owner hand, mandatory reveal/shuffle and next legal owner/other-player continuation, with both negative controls (unrelated Confirm and no/blocked Wonder Tag). Capture candidate/source roots separately and report source-side conversion.

A match ending with fewer bot-decoder aborts does not independently establish a stronger player. The gate is a test of **liveness, owner information and exact paper-payment transitions**, followed by strategic comparison. The historic Aichi benchmark still has 29/32 authenticated card-name/count original lists (ranks 23, 25, 28 absent), no selected final 60, and no demonstrated 99.5% paper-field win rate.

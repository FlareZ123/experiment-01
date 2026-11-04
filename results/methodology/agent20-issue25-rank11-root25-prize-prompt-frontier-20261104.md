# Agent20: exact Issue #25 rank11/champion root25 abort is an owner Prize-prompt integration frontier

**4 November 2026, archival trace + pinned-source review.** This is an actionable **hypothesis** for an existing canonical-prompt component, with no newly executed native match. Do not convert it into a paper/legal or engine correctness claim without an unchanged-same-deal test.

## Original-Store evidence

The [registered v6 original rank11 champion trial](agent1-issue25-joined-v4-v6-mirrored-policy-development-20261104.md) `11:102:A:champion-reference` returned a 25-root `engine-error`. The original [Actions 41894027367](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367) ZIP artifact **13353289881** archives `issue25-mirrored-v6.json`; I independently extracted the actual 25 native `publicRootActions` and the redacted `nativeAbortProvenance`. Under original source rank11 as **seat1**, candidate champion is **seat0**. The exact final accepted roots are:

| Ordinal | Actor / turn | Actual native accepted action |
| --- | --- | --- |
| 20 | champion seat0, global turn5 | `ResolvePromptAction`, `WaitPrompt` |
| 21 | champion seat0, turn5 | `PlayCardAction`, Lillie's Clefairy ex |
| 22 | champion seat0, turn5 | `PlayCardAction`, Psychic Energy |
| 23 | champion seat0, turn5 | `AttackAction`, **Eon Blade** |
| 24 | champion seat0, turn5 | `ResolvePromptAction`, `WaitPrompt`, initiated by root23 |
| **25** | champion seat0, turn5 | **No accepted action.** Bot decoder fails with active **`ChoosePrizePrompt`** |

The actual source/full-deal fingerprints in the abort receipt have `sourceDealStatus=VERIFIED`, `fullPhysicalDealStatus=VERIFIED`; its accepted root ledger has `acceptedRootLedgerStatus=VERIFIED`; physical source seat1 is verified. The archived schema redacts the underlying exception and **does not include the Prize prompt's owner-visible message, `count`, `blocked`, `allowCancel`, `useOpponentPrizes`, or occupied-slot cardinality**. There is insufficient evidence to assert the prompt is an ordinary KO Prize selection or that any particular adapter would accept it. The source owner had not yet been given a reply to the candidate's attack.

The [same registered v11 canonical VIP study](agent16-issue25-v11-canonical-vip-first-turn-native-20261104.md), Actions **41907884146** artifact **13360683037**, independently reproduces **the identical 25 accepted-root action sequence and same unresolved decoder abort** for this ID. The two changed VIP roots in other arms do not fix this error.

## Reusable owner-visibility-safe candidate handler, with a decisive gate

The repository already has [Agent21's reversible owner-first-occupied KO Prize response](../../simulation/twinleaf/agent21-owner-first-prize-reveal.cjs), backed by [native rank5 prompt evidence](agent21-two-prize-native-choice-next-pokemon-20261104.md). It matches **only** owner `CHOOSE_PRIZE_CARD` with `ChoosePrizePrompt`, `options.allowCancel=false`, `useOpponentPrizes=false`, empty blocked slots, count 1–6, a recognized owner, six physical Prize slots and native `prompt.validate` success. It chooses by **occupied physical slot index**, without reading concealed Prize faces.

The pinned engine's `simple-bot/prompt-resolver/choose-prize-prompt-resolver.ts` handles generic `ChoosePrizePrompt`, but its alone-availability does not establish owner-information-safe integration under the canonical actor's raw-State quarantine. The [canonical actor composition](../../simulation/evaluation/agent7-canonical-actor-composition.cjs) installs its own decoder and can shadow outer wrappers, as independently proven for VIP v10→v11. **An analogous inner callback for Agent21's existing Prize selector is the most focused next test**:

1. Reuse the frozen `11:102:A:champion-reference` registered original 60s, exact seed and native full/source opening; first verify the 25-root control prefix is identical and the error envelope is unchanged.
2. Capture only the **acting owner's safe prompt metadata** at root25, then identify whether it satisfies *all* Agent21 ordinary-Prize guards. If it does not, the correct result is **UNRESOLVED / delegated**, not a forced Prize selection.
3. If eligible, invoke the existing owner-first-occupied selector inside the canonical decoder and require actual Store `ResolvePromptAction` acceptance, physical own Prize-to-hand custody and next genuine opponent-source decision. A returned action or native prompt-validation alone is insufficient.
4. Preserve the original and treatment root histories, exact physical deal SHA, action cap/error/terminal outcomes, and both-seat effect-scope audit. Report Prize choice optimization and paper legality limitations separately.

## Why this matters

The selected v6 and v11 panels both lose **1/8** registered attempts before the intended root cap due to this unhandled source-opponent interaction. A single successfully settled owner-safe Prize prompt could increase fidelity and reach a genuine source reply in that original rank11 arm, without inventing a matchup win. The retrieved native source and existing Agent21 adapter provide a clear falsifiable integration path, subject to the actual root25 metadata.

**Current verdict: missing prompt metadata and unexecuted correction, therefore UNRESOLVED.** Zero qualified games, no selected fixed 60, no proven 99.5% field result.

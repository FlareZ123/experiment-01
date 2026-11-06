# Agent50 preregistration: rank4 Dedechange prospective 32-deal source-first opening census

**Registered 6 November 2026 before implementation and native execution.** This is a prospective physical-opening opportunity census, not a game-performance experiment.

## Question and estimand

Under the already documented owner-only entry-priority opening policy, how often do fresh physical source-rank-4 openings reach the source's first turn with an original Dedenne-GX UNB in its own hand and an empty Bench, and how often does the native Store accept the resulting physical Dedechange sequence?

Primary denominators are all 32 preregistered attempts. Preserve no-opportunity, setup-blocked, rejected, and aborted rows. Report separately:
- source turn reached;
- Dedenne physically available in the source's own hand;
- an empty source Bench slot;
- eligible Dedechange opportunity (both preceding conditions);
- native accepted hand-to-Bench transfer;
- accepted printed Ability confirmation;
- actual physical payment destinations and draw count;
- any setup compensation SelectPrompt and its physical deck-to-hand movement;
- the first fail-closed decision boundary.

The Dedechange hook is an automatic, forced-positive intervention when its own-card and empty-Bench conditions are met. This census estimates execution opportunities under that narrow hook; it does not evaluate whether using Dedechange is strategically beneficial.

## Frozen deck and engine conditions

- Source: original Aichi rank 4 printed 60, source deck hash `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`.
- Reference: original Aichi rank 1 printed 60, reference deck hash `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source seat is balanced 16/16 across physical seats 0 and 1.
- Source is deliberately chosen to go first in all 32 attempts, using the existing owner-specific Go First prompt adapter. This ensures the source's first-turn root can be observed before any opponent turn. The coin choice is controlled, not a natural tournament coin outcome.
- The existing single-Basic entry-priority setup policy is unchanged. It prefers an eligible Basic without a printed hand-to-Bench Ability as Active, preserving entry supports in hand where possible. The existing min-zero optional compensation Bench choice declines the optional placement.
- The existing actor-only detached SelectPrompt adapter is enabled for both seats. Its default option is selected. For the pinned `WANT_TO_DRAW_CARDS` prompt, setup-reducer constructs options in descending draw count and defaultValue 0, so the default corresponds to the maximum compensation draw. The native Store receipt will verify the physical hand/deck delta; no hidden deck order is supplied to the policy.
- The first-turn Dedechange hook is unchanged and is enabled for the source owner. It proposes the first eligible physical Dedenne-GX UNB in hand only when an empty Bench slot exists, then accepts the genuine owner ConfirmPrompt. The raw-State fallback quarantine remains outside all adapters and terminates at the first unsupported root or prompt.
- All attempts are source-first, use the same fixed source/reference 60s, and stop at the first unsupported owner decision. No full-game or win-rate claim is permitted.

## Precommitted physical trials

Seeds were generated with Python `secrets.randbits(32)`, sampled without replacement, and fixed in this file before test implementation. Seat assignment alternates to balance the two physical seats.

| Trial | Source seat | Seed | Source first |
|---:|---:|---:|:---:|
| 1 | 0 | 659596847 | Yes |
| 2 | 1 | 3374395305 | Yes |
| 3 | 0 | 3767656280 | Yes |
| 4 | 1 | 1334448369 | Yes |
| 5 | 0 | 1015114065 | Yes |
| 6 | 1 | 2721212630 | Yes |
| 7 | 0 | 3093975646 | Yes |
| 8 | 1 | 3866265543 | Yes |
| 9 | 0 | 3156942071 | Yes |
| 10 | 1 | 2011905764 | Yes |
| 11 | 0 | 1103482661 | Yes |
| 12 | 1 | 795422078 | Yes |
| 13 | 0 | 1285175489 | Yes |
| 14 | 1 | 3644145136 | Yes |
| 15 | 0 | 166706843 | Yes |
| 16 | 1 | 3879134323 | Yes |
| 17 | 0 | 633372073 | Yes |
| 18 | 1 | 86623464 | Yes |
| 19 | 0 | 3741635901 | Yes |
| 20 | 1 | 3937313210 | Yes |
| 21 | 0 | 3935354425 | Yes |
| 22 | 1 | 469693129 | Yes |
| 23 | 0 | 3112483819 | Yes |
| 24 | 1 | 4036501400 | Yes |
| 25 | 0 | 1618181490 | Yes |
| 26 | 1 | 3127876404 | Yes |
| 27 | 0 | 358071138 | Yes |
| 28 | 1 | 246568075 | Yes |
| 29 | 0 | 614184015 | Yes |
| 30 | 1 | 3658443122 | Yes |
| 31 | 0 | 988546863 | Yes |
| 32 | 1 | 3425622581 | Yes |

## Execution and evidence gates

Use the existing manual workflow `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml` with a new isolated input `rank4_dedechange_natural32_only=true`. Do not add a new workflow. The job must execute only this test and upload all 32 atomic JSON receipts plus SHA-256 sidecars, including rows that fail before source turn.

For every `WANT_TO_DRAW_CARDS` SelectPrompt, the observer records the exact offered labels, default and chosen option, then verifies the actual number of physical cards moved from the acting player's deck to hand through native Store dispatch. This observer does not alter decisions.

The test must retain the existing fail-closed boundary. It must not invoke the original raw-State native decoder, infer opponent private information, or continue with an unregistered fallback policy. A row that fails before source turn remains in the denominator and is reported as blocked.

## Interpretation limits

This 32-attempt cohort is a small prospective sample of one original source 60 against one historical reference 60, under a controlled source-first choice and the specified setup policy. It does not estimate all Aichi matchups, natural first-player frequency, Dedechange's strategic value, opponent response, match outcomes, or deck win rate. The automatic Dedechange treatment may discard valuable held Trainers and other entry supports; a six-card draw is not a net six-card gain.

No candidate 60 changes are authorized. Do not promote any setup hook or update the public fixed-60 decision board based on this census. Competitive qualification remains zero unless separate full-game paper-fidelity and opponent-policy gates pass.

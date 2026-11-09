# Shared v16 mandatory Trainer-card payment custody, five source printings

**Agent 14 | 9 November 2026 | pinned native Store, two physical seats, focused positive payment events.** Extension of [v15 Ultra Ball report](agent14-shared-ultraball-physical-payment-v15-20261109.md), with no deck or default policy changes.

## Delivered

The previous shared portfolio already preflighted source-stamped payment selection rules for five important Trainers. It could report a native accepted `ResolvePromptAction` without independently confirming that selected physical objects were actually removed from the acting owner's hand and added to the owner's discard. The [v16 shared portfolio commit](https://github.com/FlareZ123/experiment-01/commit/6a46085446aa931e7e7a393cdfbb368c6d9879d6) expands the post-native physically paid verification from Ultra Ball to:

- `Ultra Ball MEG 131`: two distinct actual owner cards;
- `Mysterious Treasure FLI 113`: one other owner card;
- `Quick Ball FST 237`: one other owner card **when an explicit mandatory payment prompt exists**; its special one-other-card *automatic root payment* remains separately unverified by this observer;
- `Secret Box TWM 163`: three distinct other owner cards;
- `Roxie CEC 205`: one or two actually selected eligible owner Pokémon.

The common `independentPrintedDiscardPaidCustody(owner, selected, count)` checks that all exact selected card objects are present in owner's discard and absent from their hand immediately after a genuine native Store payment prompt settles. Per-source-printing `physicalPaidDiscardByPrinting[printing].verified/unverified` and per-event `physicalEffectVerified` preserve unverified cases. It does not mutate the Store or choose actions. The Ultra-specific v15 counters and public helper remain backward compatible. The Ultra prompt now receives its independent printed two-payment check based on source identity and actual mandatory discard message even if vendor prompt `min/max` are wrongly set.

## Native evidence and complete source inventory

[GitHub Actions run **42562350736**](https://github.com/FlareZ123/experiment-01/actions/runs/42562350736) **success**, compiled the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, ran the prior five-family pure Store regressions and all 12 relevant native tests: four prior Ultra paid/zero tests plus eight new additional-family positive tests.

| Source-stamped paid cost | Native positive physical seats | Authenticated Aichi originals carrying printing | Original copies |
| --- | ---: | ---: | ---: |
| Ultra Ball MEG 131 | 2/2 | 14/29 | 24 |
| Mysterious Treasure FLI 113 | 2/2 | 10/29 | 37 |
| Quick Ball FST 237, explicit one-card prompt | 2/2 | 21/29 | 72 |
| Secret Box TWM 163 | 2/2 | 10/29 | 10 |
| Roxie CEC 205 | 2/2 | 1/29 | 4 |

The card quantities are exact counts of listed original-sixty copies, **not** occurrences in native games. Native positive witnesses are hand/board-staged, sometimes from actual authenticated printed source-sixty zones; none are randomized complete source-versus-candidate games.

The reused native fixtures are `agent49-mysterious-treasure-native-probe.cjs`, `agent4-quickball-mandatory-payment-native.cjs`, `agent4-secret-box-payment-native.cjs`, `agent4-rank31-roxie-koffing-spoons-native.cjs`, and the prior Ultra fixtures. New test `tests/2026-11/agent14-paid-discard-five-trainers.native.test.cjs` asserts that each of the four additional original printed costs receives one physically verified event for each native owner seat. An additional pure test asserts exactly 1/2/3 selected distinct owner cards with no remaining hand references. Reproduction: manually dispatch `.github/workflows/agent14-source-mobility-census.yml` with `ultra_ball_portfolio_native=true` (now runs the full five-family suite).

## What this does and does not change

This is the first unified receipt in this branch for these **five** printing-specific explicit payment prompts. It adds a reproducible semantic gate that the current single shared paper-profile can consume. Original 60s, root policies, opponent choices, and engine source remain untouched. Staged native observations do not prove decision quality, Item search continuation, paper 25-minute clock, complete 29/32 field outcomes, or even one competitive paper-qualified match.

The native prompt may be accepted while a payment cannot be physically confirmed; that outcome is kept **unverified**, rather than silently classified as a legal paid cost. A successfully paid prompt still carries `PAPER_PROMPT_UNVERIFIED` as its original family-wide admission status, because the broader effect and entire game remain outside this narrow proof. Do not infer paper-qualified games from the extra receipt.

**Decision:** Paper-opponent field remains 29 authenticated originals, ranks 23/25/28 missing. Zero competitive paper-qualified games. No fixed selected 60 and no supported 99.5% win-rate claim.

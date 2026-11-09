# Shared v17: Quick Ball automatic one-other-card root-payment custody

**Agent 14 | 9 November 2026 | native pinned Store, source rank5 printing, both owner seats.** Extension of [five-Trainer prompt payment v16](agent14-five-trainer-physical-discard-v16-20261109.md). The original native Quick Ball prints may pay their mandatory cost at `PlayCardAction` when the hand has exactly one other physical card, then expose only an optional Pokémon search; these successful costs cannot be counted by any prompt-only observer.

The [shared v17 portfolio update](https://github.com/FlareZ123/experiment-01/commit/3ade63b626d2ae6c3bb632a2ebb06082db7c6178) adds `audit.quickBallAutomaticRootPayments` for genuine `Quick Ball FST/SSH` Item roots with exactly one other owner-hand card. It captures the **one other physical reference before native dispatch** and proves that same reference is removed from that owner's hand and present in their discard immediately after the genuine native Item root. It records `attempted/verified/unverified` and one redacted first event. It does not alter policy decisions or remove any existing prompt checks. When two or more other cards exist, the separate source-stamped prompted payment v16 remains in effect.

[Compiled native CI **42562770860**](https://github.com/FlareZ123/experiment-01/actions/runs/42562770860) **passed**. Pure tests checked a native-like physically paid sole-other-card root and an accepted-but-unpaid root; the latter stays unverified. The same pinned native Store fixture with original rank5 `Quick Ball FST 237` ran each two physical player seats both ways:

| Genuine native route | Seat 0 | Seat 1 | Result |
| --- | --- | --- | --- |
| Exactly one other hand card, automatic `PlayCardAction` payment | Pass | Pass | Owner Energy physically discarded **before** the optional Basic search; portfolio recorded one verified automatic root and **zero** prompted cost replies |
| At least two other hand cards, explicit `CHOOSE_CARD_TO_DISCARD` prompt | Pass | Pass | Owner Energy physically discarded after native prompt; portfolio records one v16 prompted paid-cost receipt and **zero** automatic root payments |

The native [five-family payment tests](agent14-five-trainer-physical-discard-v16-20261109.md) were also rerun and passed. Original Aichi printed source field includes **72 Quick Ball FST 237 copies in 21/29 authenticated decks**, so a prompt-only mandatory-payment count is an incomplete physical-cost census for these decks. This is a native semantic calibration, not empirical play strength; both fixtures stage source-printed real cards with artificial board/opponent zones.

**Reproduction:** `tests/2026-11/agent14-quickball-auto-payment.native.test.cjs`, the existing fixture `simulation/twinleaf/agent4-quickball-mandatory-payment-native.cjs`, pure tests in `tests/2026-11/agent14-ultra-ball-portfolio-paid-custody.test.cjs`, and the already existing manual CI workflow with `ultra_ball_portfolio_native=true`. Shared default-off `sharedPaperPaymentPortfolio` and all historical profiles remain unchanged. Any accepted root with missing physical payment is explicitly **unverified**.

**Release status unchanged:** 29/32 authenticated original 60s, no paper-clock/competent full-game coverage, zero competitively qualified games and no demonstrated 99.5% fixed-deck win rate.

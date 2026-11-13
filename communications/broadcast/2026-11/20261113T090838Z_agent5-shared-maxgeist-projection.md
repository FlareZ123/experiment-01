# Agent5: paid and free Max Geist retreat now share one projection

**Date:** 2026-11-13T09:08:38.475Z  
**Sender:** Agent5

I refactored the Max Geist-aware `paidRetreatRoot` frontier to reuse Agent42's tested `postRetreatPrintedDamage` helper. The paid path supplies payment index 0 and subtracts Mimikyu's Psychic Energy; Agent8's post-Timeless Latias/Skyliner path uses an empty payment and retains the Mimikyu Energy. The two policy paths now share one printed-damage implementation without conflating paid and free retreat.

The frontier version is `agent6-owner-visible-printed-retreat-and-damage-v4-shared-projection`. The complete nine-test paid-retreat suite passed 9/9 in a V8 harness after refactor, not native Node/CI.

This is distinct from the post-Timeless free-retreat line: it targets the rank-19 non-Regidrago Filch → paid retreat → Max Geist policy gap. The existing Hood candidate policy still needs `paidRetreatRoot` and `mimikyuApexFundedPromotion` enabled together, followed by native Store replay.

Details: `results/methodology/2026-11/agent5-max-geist-paid-retreat-20261113.md`.

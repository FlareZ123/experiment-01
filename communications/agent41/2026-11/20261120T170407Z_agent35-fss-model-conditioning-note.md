# Agent35 → Agent41: FSS route-model conditioning clarification

**Date:** 2026-11-20T17:04:07.729Z

I checked the exact result table in Agent43's FSS report. The values are explicitly conditional on a valid opening seven:

- Anchor-only with FSS: 24.8928% going first / 29.3519% going second.
- Joint Enamorus+Hood anchor and Shadow Rider V/VMAX core: 4.0990% / 6.0508%.
- The model separately reports 88.2499% initial valid-opening probability for the 15-Basic list.

I updated the synthesis to preserve the going-first/going-second distinction and the conditional denominator. These are still restricted no-lock route-access sensitivities, not full setup or matchup rates; the FSS-as-Item prose correction and exact-arm portability remain pending Agent43 confirmation.

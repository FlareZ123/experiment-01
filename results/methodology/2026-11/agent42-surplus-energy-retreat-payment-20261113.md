# Surplus Psychic Energy support for the two-unit paid-retreat proposal

**Agent 42 · 13 November 2026 · policy opportunity correction, not a gameplay result**

## Problem

The shared `twoPsychicPayment` helper required the Active Pokémon to have exactly two attached Energy cards. The proposed retreat cost is two Colorless units, and any two attached Energy cards can pay it. A Shadow Rider Calyrex VMAX with three or more basic Psychic Energy could therefore pay the retreat while retaining surplus Energy, but the planner abstained solely because the Active had more than two attachments.

That is a false negative for the Hooded Block counterline: Underworld Door can leave the Shadow Rider with more than the minimum two Energy.

## Correction

Updated the shared helper to `agent42-owner-visible-two-basic-psychic-retreat-terminal-v2.3-surplus-psychic-retreat-payment`.

- Accept at least two attached Energy cards, provided every attached Energy is a known basic Psychic Energy.
- Select indices `[0, 1]` and report only those two printings as the retreat payment.
- Leave any surplus Psychic Energy attached.
- Existing post-retreat Max Geist projection already subtracts the selected payment indices from the board's Psychic Energy total, so it retains the remaining Energy correctly.
- Continue to reject fewer than two attachments, unknown catalogs, and any non-Psychic or unsupported Special Energy.

This expands the legal-looking proposal set without relaxing the payment-type assumptions.

## Validation

- Local Node 22 regression: **4/4 passed**.
- The exact updated repository source was evaluated in an isolated V8 harness: **6/6 cases passed**, covering two, three and four Psychic attachments, insufficient payment, unsupported Special Energy, and unknown catalog.
- New test: `tests/2026-11/agent42-retreat-payment-surplus-energy.test.cjs`.

## Limitations

No native Twinleaf Store retreat was run for the new surplus-energy case. The native Store remains the final legality authority. This is a policy opportunity correction, not evidence of improved matchup or deck win rate.

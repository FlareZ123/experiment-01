# Agent6: Night Stretcher adapter preflight patch

**Time:** 2026-11-24T04:32Z

I confirmed your Night Stretcher source audit against the pinned tree: the SFA card's `canPlay` accepts any Energy or Pokémon in discard, while the effect only accepts Pokémon or Basic Energy. The failed fixture's public actor discard contains only Trainer cards, so Night Stretcher is not a plausible selected action in that specific state; this is a separate simulator-compatibility defect.

I patched the adapter's exact-print preflight on `agent6/gameerror-safe-diagnostic-20261124` at `43599bc2a13f252fdb3ae12b5724b2dcaf98a266` to mirror the effect's Basic-Energy-or-Pokémon predicate, and added fake-native coverage for Special Energy-only rejection plus Basic Energy/Pokémon acceptance and selected cloned-Store revalidation. The exact-head no-game witness passed on the prior head; Actions API is currently rate-limited, so this new patch is not yet CI-verified.

Please review whether this adapter-side preflight is the right compatibility boundary and continue the source-level triage of the original selected-action failure. Keep private card identity/family out of public receipts.

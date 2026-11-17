# Agent6: full-state diagnostic key is optional under the selected public-seed model

**To:** Agent49 (canonical PR #58 owner)  
**Date:** 2026-11-17 00:06 UTC

One correction to my earlier trace handoff: do **not** make the first post-acceptance fixture contingent on `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`.

The current root README records the owner's selected model as public reproducibility: publish the physical shuffle seed and receipts, while keeping the seed/state out of policy-worker inputs. The README's private-diagnostic section explicitly makes encrypted full-state diagnostics optional, only for a specific unresolved question. Agent36's deterministic-frontier guidance to Agent6 (2026-11-16 05:21 UTC) says the persisted trace can be replayed from initial decks, the public physical seed, exact pinned engine/research revisions and frozen policies, with zero policy RNG draws and validation RNG reset to `0x6d2b79f5`.

Therefore, once the same-SHA V3 acceptance gates pass, sanitized-only fixture output plus the public seed and deterministic replay is a valid route to reconstruct each ordered frontier and full state for analysis. Use encrypted-full mode only if a specific trace question cannot be resolved by replay and the owner has configured the key. This does not relax worker isolation: workers must still receive only their own actor-visible observation, projected prompt, public receipts and frontier, never physical seed, engine state or opponent hidden zones.

This supersedes my earlier suggestion to confirm the public-key variable before any fixture. It should not become an unnecessary owner-side blocker.

# Agent48 practical staged baseline for non-root K1

If the full joint latent pre-root opponent-history model is too expensive for the first adapter integration, there is a useful honest intermediate target: initialize the non-root seat as K0 at the root, then update its branch-local K1 only from simulated prompt-owner evidence after the root. Label the capability exactly as `K0-at-root / post-root K1`; do not claim full two-sided K1. This avoids copying the actual opponent's private snapshot into root determinizations while still preserving knowledge gained during the simulated continuation.

This requires the adapter's real `transitionEvidenceBySeat` routing to work, but does not require the full latent-history sampler yet. I added it as the practical fallback in the review note and board.

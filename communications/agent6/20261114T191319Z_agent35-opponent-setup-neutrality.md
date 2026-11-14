# Agent35 review: opponent worker setup neutrality

Your current rank-1 policy has explicit `GO_FIRST` and `WANT_TO_DRAW_CARDS` handlers, but the `CHOOSE_STARTING_POKEMONS` branch still prefers `Shadow Rider V` as Active (around line 663). The Critic's worker acceptance slice is intentionally protocol-only: keep setup decisions deterministic and legal, but do not add card-specific strategic priority there. Preserve native hand order / choose a deterministic first legal Basic, or keep the Shadow Rider preference as a separately labeled strategic experiment outside the setup-acceptance path.

Please add tests for initial min:1 and repeated post-mulligan min:0 prompts, both physical seats, and verify `WANT_TO_DRAW_CARDS` maps every native value to the `Draw N card(s)` projection without relying on a hidden/off-by-one index assumption. The host projection change is in the current worker branch; coordinate with Agent49 after rebase.

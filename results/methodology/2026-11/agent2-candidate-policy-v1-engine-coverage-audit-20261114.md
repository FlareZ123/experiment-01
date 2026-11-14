# Agent2 — Hood Shadow Rider candidate-policy engine-coverage audit

**14 November 2026 · source review only · no policy or deck changes**

## Scope and pinned source state

Reviewed the current main-branch candidate worker module at repository head `3cca5fa14c315d0af566c2afcbbaaa41035749fc`:

- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` blob `55ef8f99717b9c8fe0c10960aa6ab7ae338e1323` (955 lines; `agent46-hood-candidate-v1`).
- `tests/2026-11/agent46-candidate-policy.test.cjs` blob `39ca98e3d38c92dfc69be207e67bc4671a70fd1a` (9 tests).
- Fixed paper list: `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`.
- Heuristic contract: `results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md`.

This is a policy-coverage audit, not a card-interaction ruling, legality audit, game result, or matchup-strength estimate. No tests or game fixtures were run.

## Highest-priority gap: the policy does not operate the deck's principal engine

The fixed 60 includes four Shadow Rider Calyrex VMAX, one Radiant Eternatus, one Tapu Lele-GX, one Forest Seal Stone, and one Trevenant & Dusknoir-GX.

The current root policy:

1. Scores `play-card` actions only through `scoreBasicPlay`, `scoreEvolutionPlay`, `scoreEnergyPlay`, and `scoreTrainerPlay` (`chooseRoot`, lines 879–893).
2. Its `scoreBasicPlay` allowlist covers Shadow Rider V, Mimikyu, Lillie's Clefairy ex, Latias ex, Girafarig and Marshadow, but not Radiant Eternatus, Tapu Lele-GX or Trevenant & Dusknoir-GX (lines 736–752).
3. Selects a `use-ability` action only when its ability name is `Resetting Hole` and a stadium-removal target exists (lines 917–921).

There is no handling for:

- **Underworld Door** on Shadow Rider VMAX: no ability selection and therefore no energy-recipient prompt sequence.
- **Climactic Gate** on Radiant Eternatus: Radiant Eternatus has no positive basic-play score and its Ability is not selected.
- **Wonder Tag** on Tapu Lele-GX: Tapu Lele has no positive basic-play score and its Ability is not selected.
- **Star Alchemy** on Forest Seal Stone: no positive Tool-play branch or Ability selection.
- **Trevenant & Dusknoir-GX** as a played Basic/GX attacker: no positive basic-play branch, despite a narrow `Night Watch` damage label existing in the attack scorer.

The omission is material because Agent50's own policy specification explicitly requires Underworld Door sequencing and recipient choice (spec lines 107–115), Tapu Lele's conditional Supporter access, Radiant Eternatus's turn-ending VMAX search, and Forest Seal Stone's once-per-game search. A policy can satisfy the worker protocol and still be far from a competent pilot if it cannot invoke these actions.

### Wonder Tag's search target is also unscored

Even if a Tapu Lele-GX play branch were added, the current card-search scorer has no `effectName === 'Wonder Tag'` route or general state-conditioned Supporter priority. `searchNeedScore` only gives VS Seeker a narrow score when a desired Supporter is already in the discard; other Supporter choices receive the default score of zero. When no positive choice exists, `chooseCardCombination` falls back to the first required choices after lexical sorting. That is protocol-deterministic but not a state-aware Wonder Tag plan. Add tests where the correct Supporter changes among Arven, Guzma, Raihan, Teammates, Pokémon Ranger and draw Supporters as the board/Supporter quota/KO condition changes.

## Additional concrete coverage gaps

### Prize-aware Dialga/Mimikyu access is not implemented

- The candidate observation fixture contains `ownerK1: null`, but the current policy source never reads `ownerK1` or models K0/K1 known-Prize state.
- `searchNeedScore` assigns Hisuian Heavy Ball a constant score of 25 (lines 394–396); it does not prioritize a known-Prized Dialga-GX or Mimikyu.
- `scoreTrainerPlay` has no play branch for Hisuian Heavy Ball or Night Stretcher (lines 809–842). `searchNeedScore`'s low generic Night Stretcher score is only used after another effect has already opened a card-selection prompt; it does not cause the Item to be played.
- This leaves the spec's required K0/K1, prized-core-card, Heavy Ball and recovery cases (spec lines 200–207) outside the current policy.

### Multi-energy selection returns only one card

`chooseEnergyPayment` calculates a prompt maximum from `energyCount` / `count`, but then slices the ranked choices with `Math.min(1, maximum)` (lines 607–622). It therefore selects at most one Energy even when a valid actor-owned prompt requires multiple cards. The existing test exercises only a one-Energy prompt (test file line 358 onward); there is no multi-count regression.

### Other conditional trainer lines remain unreachable

The current `scoreTrainerPlay` has no positive branch for Teammates, Raihan, Acerola, Iono, Pokémon Ranger, VS Seeker, Float Stone, Night Stretcher or Hisuian Heavy Ball. Some related unreachable-action observations were already sent by Agent35; this report does not ask for duplicate review or immediate expansion.

### Root-action ordering also blocks the required sequence

Even after adding the missing Ability handlers, the current `chooseRoot` ordering is unsafe for this deck: it returns the highest-scored `play-card` immediately (lines 884–893), considers retreat next, attacks after that, and only considers `use-ability` actions after attack selection (lines 895–921). Agent50's spec requires Underworld Door and other setup actions before Radiant Eternatus's Climactic Gate, because Climactic Gate ends the turn (spec lines 111–115). A simple positive score for Radiant Eternatus would therefore cause it to be played before the policy has exhausted the useful pre-Gate ability/attack/setup actions. The same late Ability ordering can leave Resetting Hole or other enabling Abilities unused until after the attack decision.

Post-gate work must compare the live frontier across action classes and encode terminal-action ordering explicitly: perform useful non-ending actions and required Abilities first; treat Climactic Gate as a deliberate end-of-turn commitment, not an ordinary high-scoring Basic play. Add a deterministic fixture where Radiant Eternatus is playable while Underworld Door and a useful attack remain available, and assert the intended sequence.

## Suggested post-gate acceptance work

Do not expand the module while the Critic's worker stopline remains active. Once Agent49's shared worker contract gate is closed and Agent46 resumes the bounded candidate-module work, add a supported-action matrix and deterministic tests for:

1. Underworld Door: ability availability/once-per-VMAX-per-turn, Ability suppression, energy attachment to a legal benched Psychic recipient, then draw prompt; choose the recipient against the declared next attack and resource plan.
2. Radiant Eternatus: play only when the Bench and remaining VMAX targets make Climactic Gate useful; select up to two legal VMAX and honor the turn-ending effect.
3. Tapu Lele-GX: play and use Wonder Tag only when Ability is live and a useful Supporter remains accessible; test lock and Supporter-contention states.
4. Forest Seal Stone: attach/use Star Alchemy only when its VSTAR Power is unused and a genuine bottleneck exists.
5. Prize route: explicit K0/K1 inputs; distinguish unknown Prizes from known Prized core cards; prioritize Heavy Ball and Night Stretcher only when their exact recovery target and opportunity cost justify them.
6. Energy-payment prompts: select exactly the required count of distinct legal owner-visible energy tokens, including multi-card and duplicate-printing fixtures.
7. Unsupported engine confirmations: retain fail-closed behavior except for explicitly allowlisted setup prompts (Agent35's `GO_FIRST` note is a separate known gap).

Keep the fixed 60 unchanged. Do not dispatch another fixture or promote a terminal game as competitive evidence until the worker acceptance gate and the policy's supported-action coverage are both satisfied.

## Disposition

The module is currently a narrow deterministic developmental policy, not a complete Shadow Rider pilot. The source-level omissions above are actionable coverage gaps, but they do not show that the deck is weak or strong. No 99.5% claim, matchup estimate, or competitive qualification follows from this audit.

# Agent 46 — two-profile candidate policy successor

## Purpose and boundary

This is a policy-engineering successor for two exact Shadow Rider candidate lists already registered in the Aichi research workspace. It is **not** a final deck nomination, complete Expanded rules implementation, or evidence of a tournament win rate.

| Profile | Exact 60-card source | Printed-deck SHA-256 |
|---|---|---|
| `hood-shield-shadow-rider-v1` | `results/aichi-2026/candidate-hood-shadow-rider.json` | `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924` |
| `lockbridge-shadow-rider-v1` | `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json` | `011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642` |

The branch is based on current mainline. It reuses the mainline owner-K1 capture/sampler, actor observation protocol, prompt provenance hook, pinned Twinleaf filter, and shared worker bundle/session path. It does not modify the Twinleaf submodule.

## Implemented

- **Profile identity/config:** `prepareTwoProfileCandidate`, `buildTwoProfileCandidateIdentity`, and `bindTwoProfileCandidate` resolve the exact printed 60 and bind the candidate-only worker bundle. The session sends frozen identity-bound config; the protocol accepts only the two registered profile IDs and exact printed-deck hashes.
- **Owner prize facts:** `agent46-owner-prize-facts.cjs` wraps the current mainline K1 capture/advance/sampler. Protocol validation checks optional `prizeFacts` against the selected profile, current turn/prize count, and cards already visible in the owner's public zones. No opponent prize identities are exposed.
- **Prompt projection:** successor-only ChooseCards projection uses pinned `matchesPromptFilter`. Hisuian Heavy Ball exposes only the actor's revealed own Prize collection; owner deck/discard/hand searches respect native filters, including empty collections.
- **Energy payment:** `energyCount` remains the number of offered Energy entries; `energyType` carries the required cost vector. The worker selects the minimum exact number of Basic Psychic Energy cards for Colorless/Psychic costs and abstains on unsupported types or non-Basic/non-Psychic Energy. This follows the pinned `ChooseEnergyPrompt` exact-Energy validation contract.
- **Stadium projection:** a projected Stadium replaces the shared Stadium on both actor and opponent views. Sky Field is considered only when it changes a real three-slot Radiant Eternatus Gate bottleneck; Dimension Valley only when it funds the active's attack without newly enabling a visible opponent attack. Unknown opponent Energy supply fails closed; already-funded final KOs are preserved.

## Coverage matrix

Local tests were executed in a V8 harness with small Node `test`/`assert` shims. This is **not** a full Node/npm run and does not exercise Docker, the native Twinleaf fixture, or real games.

| Surface | Coverage | Status / limit |
|---|---|---|
| Root policy | 31 named groups; paired cases cover both seats and both profiles | Passed; synthetic observations |
| Setup | 7 groups: initial Active, pre-deal GO_FIRST, post-bonus placement | Passed; no native setup dispatch |
| Owner K1/prize facts | 3 groups: owner-only capture, safe-source progression, invalidation | Passed against mainline helper/sampler |
| Prompt projection | 4 groups: Heavy Ball Prize visibility, native-filtered search, empty owner collection, Energy metadata | Passed; pinned filter injected by host |
| Shared mainline prompt-projection regression | 23/23 existing tests, including actor-relative projection, multi-select dispatch, setup projection, and cloned prompt validation | Passed in V8 harness with Buffer/assert/hash shims; actual mainline createStoreStateSnapshotter loaded, but not the Node test runner or a native game |
| Energy payment | One-cost/two-cost from three offered Basic Psychic cards; unsupported Fire cost abstains | Passed; Special Energy unsupported |
| Stadium decisions | Sky Field Gate bottleneck, Dimension Valley active unlock/opponent unlock, shared-Stadium replacement | Passed in synthetic harness; wider Stadium interactions untested |

## Explicit limits

- **Raihan `AttachEnergyPrompt` is unsupported:** current projection supports the pinned Underworld Door contract, not Raihan's distinct attachment prompt. A test asserts fail-closed `UNSUPPORTED_ATTACH_ENERGY_PROMPT_SOURCE`.
- Special Energy payment, non-Psychic candidate Energy, unknown prompts, and unsupported native card effects remain fail-closed or untested.
- Host binding/config resolver are implemented, but no Docker worker or native fixture/game was started.
- No held-out adversarial games, all-32 matchup results, confidence intervals, or paper-play validation were produced.
- The 99.5% target remains aspirational. These two candidates are not one nominated final deck.

## Next validation

1. Run actual Node tests and a no-game Docker worker ready handshake against the pinned submodule.
2. Have an independent reviewer attack both profiles/seats: Wobbuffet/Klefki/Garbodor lock, Ranger vs Arven under Item lock, Heavy Ball/K1 invalidation, Temple/Dimension Valley near a funded KO, and profile/deck/options mismatch.
3. Extend continuation coverage and keep unsupported actions explicitly marked.
4. Only after worker/rules validation, test both candidates against the authenticated Aichi Top 32 field. Do not infer win rates from these policy tests.

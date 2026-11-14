# Agent2 correction: shared makeSource allowlist rejects the exact engine setup prompts

I found an additional shared projection blocker while verifying the setup prompt contract. The low-level SelectPrompt mapping is correct (agent36-prompt-projection.cjs lines 526–540: native values.length, option choiceIndex, separate cancel row), but projectPrompt calls makeSource first.

Current makeSource (lines 225–269) admits card-effect provenance and only one engine shape: ChooseStartingPokemonPrompt in phase 0/1. Agent11's actual pinned-engine shapes are:
- ChooseCardsPrompt + message CHOOSE_STARTING_POKEMONS
- ConfirmPrompt + message GO_FIRST
- SelectPrompt + message WANT_TO_DRAW_CARDS

hostOnlyPrompt does not classify these as host-only, and makeSource does not allowlist them. All three therefore fail with PROMPT_SOURCE_PROVENANCE_MISSING before the policy receives them. The fix is a narrow, phase-validated constructor/message allowlist in makeSource; no new schema fields are needed. Both physical-seat mappings need tests.

I corrected results/methodology/2026-11/agent2-engine-setup-prompt-coverage-audit-20261114.md and results/README.md. This supersedes my earlier message saying the shared projection needed no change: the count/index shape is correct, but the shared source allowlist must change.

— Agent2

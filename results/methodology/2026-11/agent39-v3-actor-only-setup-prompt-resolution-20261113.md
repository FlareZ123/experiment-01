# Agent39: actor-only V3 setup-prompt resolution

**Status:** source implementation and pure bilateral regression complete; pinned native V3 replay pending. This is an integration/policy-boundary result, not a competitive matchup result.

## Question

The first local V3 fixture replay accepted 38 Store actions (19 per seat) but retained three unsupported prompt fallbacks: the two players' starting-Pokémon selections and the candidate seat's `GO_FIRST` confirmation. The actor-only boundary audit consequently remained invalid and recorded two opponent-role seat bypasses. Could those setup decisions be handled without exposing any opponent hidden information or delegating to the unrestricted `SimpleTacticsAi` decoder?

## Source-grounded contract

The repository pins Twinleaf at `vendor/twinleaf`, commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- Starting Pokémon selection is a `ChooseCardsPrompt` carrying `GameMessage.CHOOSE_STARTING_POKEMONS`. The relevant card list must be the acting owner's exact `owner.hand` object. Legal selections are Basic Pokémon or cards tagged `PLAY_DURING_SETUP`, limited by the prompt's maximum and blocked indices, with `prompt.validate` as the final authority.
- The first-player decision is `ConfirmPrompt` with `GameMessage.GO_FIRST`. Twinleaf's pinned `ConfirmPromptResolver` returns `false` by default. The handler is deliberately restricted to this message and setup phase; it does not answer arbitrary confirmation prompts.
- The owner-scoped checks occur only when the prompt's `playerId` matches the physical actor, `state.turn === 0`, and `state.phase === GamePhase.SETUP`. No opponent hand, deck, Prize, or other hidden zone is read.

## Implementation

Commits on main:

- `bf47465` — `agent34-actor-only-root-policy.cjs`: add fail-closed starting-Basic selection and explicit `GO_FIRST=false` handling inside the existing actor-only wrapper; attach setup decision receipts to the wrapper audit and observe native Store dispatch.
- `60dc0a5` — `agent44-role-scoped-policy-composition.cjs`: expose setup-prompt counts in bilateral boundary summaries and protect the optional `setupPromptTypes` runtime binding from policy-option override.
- `c72adbc` — `tests/agent34-actor-only-root-policy.test.cjs`: add a bilateral regression covering both starting prompts and candidate `GO_FIRST`.

The starting-Basic selector examines only the exact owner hand, filters to setup-eligible cards, respects blocked indices and maximum count, and validates each incremental selection and the final selection with Twinleaf's native prompt validator. A failed precondition returns no action and leaves the existing unsupported-prompt fail-closed path intact.

The `GO_FIRST` handler constructs `ResolvePromptAction(prompt.id, false)`, matching the pinned native default. Both handlers are in the actor-only wrapper rather than a wrapper layered above it, so the role audit sees them as explicit owner decisions and the outer opponent wrapper is not asked to service candidate-owned setup prompts.

## Validation

Workflow [43481408027](https://github.com/FlareZ123/experiment-01/actions/runs/43481408027) ran the existing Agent36 workflow in `contract_only=true` mode on main. The new regression passed as test 189:

- both seats' starting-Basic prompts resolved;
- the candidate's `GO_FIRST` prompt resolved to `false`;
- the test installs throwing hidden-deck getters on both players, and no hidden-deck read occurred;
- candidate and opponent audits reported zero unsupported prompt fallbacks and zero non-owner seat bypasses;
- candidate peer-role delegations reconciled exactly with opponent owner decisions;
- all three setup prompt actions reached the fake Store dispatch observer.

The workflow's full contract suite was **not green**: 339/363 tests passed, 23 failed and one skipped. The failures were in separate Agent41/Agent45 test files (undefined `agent48CologneNativePlayAudit`, frozen candidate-script digest mismatch, and adapter-version/intake expectation drift); the new Agent34 test passed. These unrelated failures were sent to Agents 41 and 45. The syntax-check step passed.

## Limits and next work

1. The new handler has not yet been exercised in a full native Twinleaf V3 game. The prior three-fallback/two-bypass counts remain the historical baseline until the fixture is rerun.
2. `V3_FIXTURE.policyVersion` was first advanced in commit `74a70371da4556ea77afb98e0dda7c761b71ed74` to Agent34 v15. Agent36 subsequently advanced the current fixture identity to `agent34-actor-only-root-slice-v16-agent9-fog-crystal-setup` in commits `243eb33c00` and `628e0c27dd` to include the Fog Crystal prompt integration and pinned message dependency. This remains source-level integration only; the next Quick Ball integration must advance the composite version again, and no native replay has validated either change.
3. The fixture's larger strategic failure remains: the candidate did not bench a second Pokémon despite having an in-hand search route during each of its first three turns. No search root has been enabled. Wait for Agent49's sanitized candidate-owned trace before choosing between Fog Crystal, Mysterious Treasure, Quick Ball, or another route.
4. Search payment prompts are a separate unresolved boundary. Agent5 identified that proposed Mysterious Treasure discard metadata is not a physical discard receipt; Agent50 further identified that the existing Treasure continuation binds only a printing rather than the exact donor Card object and prompt source. Those issues must be fixed with physical-card identity, owner, source, zone and native-validator checks before any such root is enabled. This does not justify using the Regidrago-specific Treasure root for Shadow Rider.
5. No decklist was changed, no matchup result was generated, and no win-rate claim follows from this work. The 99.5% objective remains unproven.

## Reproduction

- Repository revision containing the implementation: `c72adbc` (subsequent communication commits may advance main).
- Twinleaf submodule: `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Pure test: `node --test tests/agent34-actor-only-root-policy.test.cjs` in the repository's existing Node 20.19.0 contract environment.
- CI evidence: [workflow run 43481408027](https://github.com/FlareZ123/experiment-01/actions/runs/43481408027), test 189.

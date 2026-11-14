# Pinned, research-owned adapter removing Twinleaf ActionEnumerator's eight-candidate caps

**Date:** 14 November 2026  
**Owner:** Agent3  
**Status:** standalone adapter prototype; not integrated into the V3 runner or validated against the compiled pinned Store

## Motivation

The pinned Twinleaf ActionEnumerator at commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 has a MAX_CANDIDATES_PER_TYPE limit of eight in eight action families. The previous cap-audit report documents the exact source methods and the runner's missing admission gate.

A fail-closed detector prevents capped roots from being admitted, but it does not let the game continue when a family legitimately has more than eight candidates. This adapter is a second option: replace only the eight capped instance methods while retaining the pinned ActionEnumerator's original enumerate() method and its uncapped Stadium, use-Stadium, retreat, attack and PassTurn methods.

## Implementation

Added:

- simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs
- tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs

The adapter is hard-pinned to the exact Twinleaf commit above and verifies the expected ActionEnumerator methods, action constructors, card classes and enums before patching the instance. It replaces the eight capped methods with source-shaped uncapped implementations, preserving their family order and existing rules:

- evolution candidates retain the same eligible-Pokémon and hand-order traversal;
- Basic plays retain the original first-empty-Bench target by obtaining it from the pinned method, then extend the hand-index list beyond eight;
- Energy candidates retain the source's fullName deduplication and per-Pokémon target order;
- Tool, discard Ability, Item, Supporter and in-play Ability candidates retain the source predicates and traversal order;
- uncapped methods are left on the original instance.

The adapter records a non-writable pin/schema marker on the instance. It intentionally does not claim that the entire paper Expanded action space is complete; it only removes the eight identified caps from this pinned enumerator. Unsupported actions, any other source omissions, and the outer adapter's separate 256-item cutoff remain separate gates.

## Validation and limits

Four Node v22.16.0 tests pass locally:

1. A synthetic reference ActionEnumerator mirroring the pinned source emits eight per family; the adapter emits all nine candidates in all eight families and preserves family ordering.
2. Energy fullName deduplication is preserved while target combinations are uncapped.
3. An unreviewed engine pin or missing native exports fails closed.
4. When no known cap is hit, adapter output is deeply equal to the synthetic reference enumerator output.

This is a source-shaped synthetic test, not a run against the compiled pinned Twinleaf Store. No V3 game, matchup, CI run, or competitive result is claimed.

## Integration requirements

The current Agent49 loader already imports cardActions and gameActions and also imports PokemonCard, EnergyCard, TrainerCard, Stage and TrainerType. Its returned native dependency object currently omits those five classes/enums; expose them (or pass an equivalent typed bundle) before constructing this adapter.

The V3 frontier builder can instantiate the adapter with the actual frozen engine pin, then call its ordinary enumerate() method. Preserve the adapter marker in per-root diagnostics. Independently reject the outer frontier's truncated flag or nonzero omittedCount; the 256-item cap is not removed by this adapter. Add the tests to the existing bounded contract-only lane, not a new workflow.

Agent49 remains the V3 integration owner. This standalone prototype is a reviewable option, not a change to the runner, vendor submodule, CI or fixture policy.

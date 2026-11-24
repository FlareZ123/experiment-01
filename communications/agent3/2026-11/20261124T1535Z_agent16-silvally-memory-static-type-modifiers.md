# Agent16 source-scope addendum: in-scope Silvally Memory type modifiers

**From:** Agent16  
**To:** Agent3  
**Date:** 2026-11-24

One precision point from the pinned-source review: Expanded contains in-scope static type modifiers beyond the pre-BW Crystal Shard example. The Silvally-GX Memory Tools include Fighting Memory (Crimson Invasion), Psychic Memory (Crimson Invasion), Fire Memory and Electric Memory (Ultra Prism), and Water Memory / Grass Memory (Team Up). Their reducers modify `CheckPokemonTypeEffect.cardTypes` when the corresponding Tool is attached to Silvally-GX.

These are **pre-existing/static** type states, not `AttachEnergyEffect` handlers. A preflight probe that runs `CheckPokemonTypeEffect` against its isolated clone should see them before deciding whether DDE can be attached. I found no intersection with the 29 available Aichi lists or fixed Hood Shield candidate, so they do not change Agent43's field conclusion and are not a same-propagation ordering counterexample.

This corrects any overly broad shorthand that Crystal Shard is the only direct Trainer type-setting effect in the full Expanded pool. It does not require a new test or change PR #65's gate.

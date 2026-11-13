# Opponent Active Tool Jammer guard for the Hooded Block retreat proposal

**Agent 42 · 13 November 2026 · false-positive prevention, not a gameplay result**

## Problem

The paid-retreat proposal assumes that attaching Stealthy Hood to the current Active Pokémon prevents the opponent's Snorlax PGO Block Ability from preventing retreat. The Aichi Snorlax review correctly scoped its positive sequence to games with **no Tool Jammer on the opponent's Active**.

The helper previously allowed Tool Jammer as a known opponent Tool in `opponentHasUnmodeledDamageOrPrizeText`, but did not enforce that Active-only scope. Tool Jammer BST 136 says that while its attached Pokémon is Active, Pokémon Tools attached to the opponent's Active Pokémon have no effect. Therefore an opponent Active Tool Jammer disables the Stealthy Hood that this proposal intends to attach, and the planned retreat remains blocked.

## Correction

Bumped the shared helper to `agent42-owner-visible-two-basic-psychic-retreat-terminal-v2.4-opponent-active-tool-jammer-guard`.

- Added `opponentActiveToolJammerDisablesHood(view)`.
- It returns `true` when the opponent's Active has Tool Jammer, `false` only when the Active Tool list is present and contains no Tool Jammer, and `null` for missing or malformed public Tool metadata.
- `proposeTwoUnitPaidRetreatV2` now abstains unless that helper returns `false`.
- Tool Jammer on the opponent's Bench does not block the current Hood line, because the Tool's text requires its attached Pokémon to be Active. Other unmodeled opponent Tools remain rejected by the existing guard.

This enforces the existing no-Tool-Jammer-on-opponent-Active scope; it does not add Field Blower or Arven search lines.

## Validation

- Local Node 22 regression: **5/5 passed**.
- Exact updated repository source in isolated V8: **7/7 checks passed**, including direct helper cases and a call through `proposeTwoUnitPaidRetreatV2` that abstains before treating Block as Hood-answerable.
- Test: `tests/2026-11/agent42-opponent-active-tool-jammer-guard.test.cjs`.

No native Store sequence was run in this incarnation. Existing Agent3 native sequence/negative fixtures remain the source for native mechanics; this change is a policy precondition guard only.

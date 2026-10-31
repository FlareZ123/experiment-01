# Champion Shadow Rider: pinned Underworld Door marker has incorrect cross-copy scope

**31 October 2026, Agent8 | high-confidence source-derived engine fidelity defect, pending native action proof. No competitive performance measured.**

## Source-original stakes

The authenticated **rank1 Aichi Open League 2026** Shadow Rider deck runs **4 Shadow Rider Calyrex VMAX CRE #75**. Its printed **Underworld Door** Ability says *Once during your turn, you may attach a [P] Energy card from your hand to 1 of your Benched [P] Pokémon. If you attached Energy to a Pokémon in this way, draw 2 cards.* It has **no** restriction that only one Underworld Door can be used across all Pokémon each turn.

The supplied official Advanced Player's Rulebook, section **E-12** (lines 2455–2457 in the attached text), explicitly permits each of several Pokémon in play with the same once-per-turn Ability to use that Ability once per turn **unless specified otherwise**. With two VMAX in play, sufficient Psychic Energy in hand and eligible Bench recipients, both should be able to attach once and each draw 2.

## Pinpointed source defect in actual pinned Twinleaf

Pinned revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

1. `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts`: `UNDERWORLD_DOOR_MARKER='UNDERWORLD_DOOR_MARKER'` is identical for all copies. On power use, `player.marker.hasMarker(this.UNDERWORLD_DOOR_MARKER)` unconditionally throws `POWER_ALREADY_USED` if true. After a successful non-cancelled `AttachEnergyPrompt`, it calls `player.marker.addMarker(this.UNDERWORLD_DOOR_MARKER,this)`.
2. `ptcg-server/src/game/store/state/card-marker.ts::hasMarker(name,source?)`: when `source` is omitted, checks **any marker with the same name**, regardless of source card instance; only `hasMarker(name, source)` checks a particular card. The first successful VMAX writes a player marker whose name matches all other VMAX cards. Therefore a later VMAX sees `hasMarker(name)===true` and is incorrectly denied, despite its **own** card-instance marker not existing.
3. `shadow-rider-calyrex-vmax.ts::EndTurnEffect` also checks `hasMarker(name)` globally but removes `removeMarker(name,this)` individually. This inconsistent global-check/per-card-removal pattern reinforces that the gate mistakenly conflates card instances. The marker's source is present, so a minimal research-side correction can scope the use check to `hasMarker(name,this)`.

This follows directly from the pinned engine code and attached official paper rules; reproducing both native physical seats remains necessary to assess dispatch paths and any other runtime gates. The defect could suppress three of the four champions' Underworld Door activations on a fully developed board, materially distorting draw and Energy acceleration in simulated head-to-head matchups.

## Controlled native falsification

The intended diagnostic stages **two distinct Shadow Rider Calyrex VMAX CRE75** in play, two Psychic Energy in hand, and an eligible Psychic Bench recipient for each. It dispatches a genuine `UseAbilityAction` for VMAX A, resolves the actual `AttachEnergyPrompt` with a valid transfer, verifies one Energy attached and two cards drawn. It then attempts VMAX B in the same turn. Source-derived prediction for **unmodified pinned Twinleaf**: second action fails with `POWER_ALREADY_USED`; paper-rules expectation: second action remains usable. The report does **not** claim the native test has passed. A new native test and an opt-in adapter-only scoped repair should be added to existing manual smoke after executable validation.

## Research-owned fix, measurement and caution

The smallest correct marker predicate in the Underworld Door card effect is `player.marker.hasMarker(this.UNDERWORLD_DOOR_MARKER,this)`. Apply as an explicitly versioned **adapter hook**, not an in-place upstream vendor edit. Keep the marker write and cleanup per-card; validate cancellation semantics, several copies active/bench, Ability locks, simultaneous prompt restrictions and two physical seats. Preserve unhooked/opt-in paired test output and exact engine/hash provenance. Do not infer strength from raw engine win-loss counts until this release-classified issue is either corrected and tested or excluded with a visible unsupported mechanic.

This is a **different** issue from the independently documented public actor observation omission of Ability used-state. Merely exposing used status cannot fix an engine that forbids legal independent Ability uses.

**Current objective:** 29/32 authenticated source opposing 60s, 0 competitively qualified games; 99.5% not demonstrated.

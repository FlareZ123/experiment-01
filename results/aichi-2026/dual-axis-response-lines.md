# Counterplay under overlapping Aichi Item and Ability restrictions

**Evidence level:** conditional card-rule decision analysis from published Aichi lists, not game outcomes. The 8/29 dual-axis placements are split into mechanically distinct subgroups by exact source printing.

## Exact source grouping

| Opposition | Ranks | Printed concurrent candidates |
| --- | --- | --- |
| Budew with Tool-enabled Garbotoxin | **8, 16, 22** | Budew ASC16 (Itchy Pollen); Garbodor LTR68 and/or BKP57 (Garbotoxin) |
| Budew with Path to the Peak | **12, 20, 21, 27** | Budew ASC16; Path to the Peak CRE148 |
| Budew, persistent Vileplume Item lock, and Path | **15** | Budew ASC16; Vileplume AOR3 (Irritating Pollen); Path to the Peak CRE148 |

This classification covers all eight placements identified by the [dual-axis census](champion-axes-observation.md). The source lists contain the cards; simultaneous establishment is unverified and different lock lines can require mutually competing turn actions.

## Distinct response lines in the rank 1 reference

**Path plus Budew:** After Itchy Pollen, Items from hand are prohibited during the affected turn. Sky Field (two copies) or Dimension Valley (one copy) can still be played as a Stadium to replace Path, allowing previously suppressed Rule Box Abilities such as Underworld Door to operate again. Forest Seal Stone can be attached to an eligible Pokémon V as a Tool and use its own Star Alchemy Ability through Path to search a Stadium. Access to the Stadium from the opening seven (directly or via a Stone plus Shadow Rider V) is **33.07160% conditional on a valid opener** under the narrowly defined initial-hand model, including all-Stadium-Prized failure. This figure does not model lock formation or subsequent draws. See [exact calculation](stadium-lock-response.md).

**Garbodor plus Budew:** Removing Path would not remove Garbotoxin because it is a Pokémon Ability enabled by a Tool, potentially on the Bench. The champion's sole Field Blower is an Item, so it cannot be played while the attack-based Item restriction remains. A Supporter such as Pokémon Ranger or Channeler can remove the attack-origin restriction, after which an available Field Blower can discard Garbodor's attached Tool. However, **neither Supporter is present in the rank 1 list**. Adding one would consume a deck slot and Supporter action and still require a realistic way to access Field Blower. Forest Seal Stone can fetch one resource from the deck; it does not automatically satisfy two independent missing cards. Other routes such as gust-and-KO are board and Energy dependent. This is a research hypothesis for candidate-list development, not a proposed winning swap.

**Vileplume plus Path plus Budew (rank 15):** Vileplume AOR3's Item prohibition is a *persistent Ability* affecting both players. Pokémon Ranger/Channeler remove attack effects and cannot alone erase this Item lock, even if they clear Budew's temporary restriction. A playable Stadium or Forest Seal Stone line can replace Path and potentially restore Underworld Door while Items stay locked by Vileplume. Additional active Ability suppression, evolution state or Tool blockers change that conclusion.

## Why this matters to decision algorithms

Do not collapse Item lock and Ability lock into a global Boolean. Each restriction has a source, target player/card scope, activation condition, duration, removal method, and counteraction costs. A route that solves one blocked action channel need not solve another. Search effects should compare realistic alternative uses of the same single-use connector and Supporter turn, including the availability of the required discard targets, Pokémon V, Stadium play and Tool slot.

## Test priorities

1. Replay resolved Budew Itchy Pollen plus Path with a live Shadow Rider V, Stone and Path-replacement Stadium in deck. Verify Star Alchemy search, Stadium replacement, Item denial and Underworld Door recovery in the same turn.
2. Replay Budew plus attached-Tool Garbodor. Assert Field Blower is unplayable before Ranger, then playable after Ranger and Able to remove the enabling Tool. Confirm Garbotoxin ends and Power discovery changes without further action.
3. Repeat with rank 15's Vileplume Item lock: Ranger should fail to reopen Item play while Vileplume's Ability persists, though direct Stadium replacement remains legal.
4. Measure full-line success under both verified starting-turn positions and realistic card access, rather than crediting abstract search reachability.

Sources: [Aichi exact manifest](full-decklists.json), [Agent 1 lock printing verification](lock-threats.md), [Agent 5 Ranger/Channeler study](ranger-lock-response.md), [Forest Seal Stone engine regression](../twinleaf/forest-seal-ci-evidence.md), and the supplied advanced player's rulebook. Paper-rule expectations require in-engine fixture validation.

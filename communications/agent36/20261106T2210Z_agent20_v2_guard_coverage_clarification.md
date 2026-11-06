# Agent20: v2 selector guard coverage clarification

I reviewed the current `agent42-public-two-unit-paid-retreat-proposal-v2.cjs` after the v10 design note. The opt-in v2 selector already contains explicit fail-closed checks for the named guard categories:
- Latias ex Skyliner and own/opponent retreat-text abilities via `retreatAbilityGuard`;
- opponent Active Snorlax Block via the public ability details;
- payable competing Active attacks, including GX availability, via `activeHasCompetingAttack`;
- incomplete restriction/attack metadata returning null;
- held free-mobility cards via `ownerHasUnmodeledFreeMobility`;
- unmodeled damage/Prize text and unknown modifiers via `opponentHasUnmodeledDamageOrPrizeText` and conservative printed-damage checks.

The code is integrated into Agent34 behind the default-off `twoUnitPaidRetreatRootV2` option. Thus the remaining v10 gap is baseline activation/provenance and proof coverage, not absence of those named guards from the prototype. My Confused patch is in the generic printed-attack path and does not replace the v2 selector's own Confused/competing-attack fail-closed logic.

The per-seat paid-intent array is now emitted and tested [1,1]; the old replay runner still needs to consume it. The 2026 Confused rulebook caveat is documented in the Agent20 guard report.

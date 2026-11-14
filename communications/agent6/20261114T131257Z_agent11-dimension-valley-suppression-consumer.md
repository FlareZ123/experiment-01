# Agent11 follow-up: policy ignores newly exposed Dimension Valley suppression epoch

Agent8's commit `1b39faf9b46e9b52cd2708d34d7587eb2dadb7bd` now exposes `stadiumAndToolHaveNoEffectTurnsRemaining` in actor-view `publicTurnRestrictions` for both physical players.

Agent6's current `scorePokemonChoice()` still checks only whether a Dimension Valley card is present in `activeStadiums()` when deciding Latias's two-Psychic Eon Blade threshold. It does not consult the suppression epoch for Dimension Valley. The separate `pathLockStatus()` epoch logic only checks Path to the Peak / Silent Lab. Therefore a present-but-suppressed Dimension Valley is treated as effective, and the policy can target Latias at two Psychic when Eon Blade actually needs three Energy.

Please add an `effectiveDimensionValleyStatus` (tri-state) that uses the newly projected epoch for both physical players; only use the two-Psychic threshold when the Stadium is present and unsuppressed. Suppressed or unknown must require three. Add present/active, present/suppressed, absent, and unknown tests. I updated review section 5 with the exact code gap.

— Agent11

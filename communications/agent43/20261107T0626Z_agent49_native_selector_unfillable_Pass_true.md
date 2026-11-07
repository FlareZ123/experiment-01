# Agent49: actual imported Box/Fog selector positive despite absent Fog

**Sender Agent49 | 7 Nov 2026.** Strengthened previous 0/29 audit:
I directly imported your unchanged `choosePublicOneEnergyBoxKo`
and ran it on synthetic but printing-aligned owner-public roots for original
Aichi ranks **9, 17, 30**, each containing *Unown AOR* (Hidden Power,
one Colorless, 10 damage), Secret Box, 2+ VIP and Rescue Carrier in its real
fixed 60, but **zero Fog Crystal**. An otherwise Pass decision with
unpowered Active Unown and an opponent Active at 10 HP produced a
non-null Box/Fog/Basic Psychic attack plan in **all three cases**. The real
later owner-deck Fog search cannot succeed for any of those original 60s.

Imported-hook regression:
`tests/agent49-original-field-box-fog-hook-unfillable-plan.test.cjs`
**1/1 passed** in an isolated V8 harness (not native Store/CI).
Updated report:
`results/methodology/agent49-original-field-box-fog-hard-coverage-20261107.md`.

**No naturally encountered matching source root or engine error is claimed**.
This is a synthetic executable precondition gap. Source-deck membership
can be checked from the owner's trusted fixed 60 before proposing,
while remaining-deck eligibility requires legitimate K1 or a prompt.

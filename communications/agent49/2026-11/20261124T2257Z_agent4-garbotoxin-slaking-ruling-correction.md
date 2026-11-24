# Agent4 correction — Garbotoxin/Slaking is a confirmed mixed-source order case

The v4 field remains Active-only, and the new paper evidence makes one consequence concrete:

The Celestial Storm FAQ's TPCi Rules Team answer for **Slaking Lazy vs Garbodor Garbotoxin** says whichever Ability activates first controls; if that Ability is disabled (Slaking leaves Active or Garbodor loses its Tool), the other can activate even if previously prevented. The PokéBeach reproduction attributes this to TPCi Rules Team, 2018-08-02: https://www.pokebeach.com/forums/threads/lunatone-kecleon/ (post #6). A second TPCi ruling says first-in-effect also controls Neutralizing Gas vs Wobbuffet: https://www.pokebeach.com/forums/threads/please-explain-to-me-this.153648/.

Pinned Twinleaf tracks Slaking (Active + `abilityLock: true`) but not Garbodor (no `abilityLock: true`; Tool-conditional, global). A correct research-side ledger would need to stamp when Garbotoxin actually becomes effective, including reactivation after the competing lock is disabled; Tool-attach time alone is insufficient if Garbotoxin is initially suppressed.

Please do not broaden the shared adapter spec unless this mixed source pair is shown to affect the current fixed candidate matchup. If it is, add a separate effective-suppressor order observation; do not overload `abilityLockActivationOrder`. Full note: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`.

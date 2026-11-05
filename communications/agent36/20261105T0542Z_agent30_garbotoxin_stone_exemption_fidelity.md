# Agent30 urgent source-native fidelity gate: Garbotoxin can suppress Forest Seal Stone

Independent Japanese paper Expanded player guides (2023, 2025) and 2026 match account agree **Garbotoxin active => Forest Seal Stone Star Alchemy cannot be used**. Pinned Twinleaf FSS (`forest-seal-stone.ts`) has `exemptFromAbilityLock:true`; Garbodor BKP `HANDLE_ABILITY_LOCK` default respects this exemption. This suggests native Store may incorrectly expose Stone under Garbotoxin. No direct official matchup FAQ or native Store result verified, so treat as a high-priority uncertainty, not proven vendor bug.

Original Budew + Garbotoxin source ranks **8,16,22**. In existing exact early Ranger/Lele/Stone model, unrestricted two-draw opportunity is **30.26936% Hood / 30.31531% Temple**, Lele-disabled Stone-available **20.22381% / 20.17769%**, and if both Lele and Stone are unavailable, **direct-only 14.45029% / 14.50175%**. These are hand/search resources, not win rates.

Read `results/aichi-2026/agent30-garbotoxin-forest-seal-stone-rule-fidelity-gap-20261105.md` for sources, exact functions and proposed native both-seat checks, plus the separate Ranger lock study. If you reproduce a bug, research-side adapter hook only; never edit Twinleaf upstream. Please gate any Issue25 winning lines and Star Alchemy policy around this uncertainty.

Agent30

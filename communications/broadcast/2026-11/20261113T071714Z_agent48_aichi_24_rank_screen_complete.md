# Agent48: Aichi 24-rank identity screen complete — physical print remains open

**Identity-level status:** all 24 potentially compatible authenticated lists (ranks 1,2,4,5,8–22,26,27,30–32) now have card-pool / official-banlist / event-date identity screens. The final four ranks 1,2,4,5 are documented in `results/aichi-2026/2026-11/agent48-ranks1-2-4-5-expanded-eligibility-screen-20261113.md`. Their CI audit and deck-construction tests passed in run `43384301565`.

**Do not overstate this:** 0/32 Aichi lists are yet physically print-authenticated as paper Expanded opponents. Ranks 3,6,7,24,29 remain incompatible with unchanged international Expanded (14 copies of three Japanese-only promo identities); ranks 23,25,28 remain unavailable. All 24 identity-screened lists pass 60-card, four-copy (Basic Energy exempt), ACE SPEC, Prism Star and Radiant construction checks.

The current official Expanded banned-printing overlay reports 0 exact hits across 29 lists (27 identities / 49 printings), while eight bundled `expanded: Legal` flags are stale. Use the official overlay, not bundled legality flags alone.

The focused reusable audit is `scripts/aichi_expanded_identity_audit.py`; it is tested and wired into the existing `aichi-card-audit.yml` workflow (no new workflow). The next substantive bottlenecks are physical Japanese-print authentication and recovering ranks 23,25,28—not repeating card-pool checks or claiming matchup strength.
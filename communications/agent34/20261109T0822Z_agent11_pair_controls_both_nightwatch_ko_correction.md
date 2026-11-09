# Agent11 correction: both physical Raihan choices achieve identical Night Watch Prize on this deal

**Sender Agent11 | 9 Nov 2026 ~08:22 UTC.**

The prospective paired replay I mentioned in the earlier handoff is now complete. [Full compiled native CI 42584782264](https://github.com/FlareZ123/experiment-01/actions/runs/42584782264) passed. **Both** arms begin at the same physical original rank1 t18 source, use two actual source Psychic on Trev, printed-correct Pale Moon-GX strips three original opposing Psychic, Latias retreats to Girafarig and passes, and the source on t20 physically attaches a third Psychic, settles 150-damage Night Watch, takes **one real Prize 6→5**, resolves the opponent's Latias promotion and returns opponent actor202.

The two source Raihan search choices genuinely differ: original first-card **Lillie's Clefairy ex JTG** versus treatment **Psychic Energy MEE**. The control nevertheless found a Psychic in its acting owner's hand on t20 after the source deck was actually shuffled and the next turn drew. Both `sourceNextTurn.hasHeldThirdPsychic=true`, both fully settled and share the same public final State fingerprint `82bba565e3ebbdcd5e2a39bd0accfd5c535a18959f398d4f4980f056fa03a2dd`.

**Please disregard my previous suggestion that selecting Psychic with Raihan was shown superior to searching Clefairy on this game.** The evidence demonstrates a real missed opponent-source attack/Prize path; search-target causality is unsupported by this particular shuffled physical deal. I corrected `results/methodology/2026-11/agent11-original-rank1-raihan-third-psychic-nightwatch-prize-20261109.md` accordingly. The default-off search/prompt adapter and all original roots remain intact.

Next constructive test: vary the legitimate owner-deck shuffle after Raihan across a precommitted set of physical orders, preserving each original source state, to measure how often control naturally draws a Psychic versus how often the searched Psychic guarantees the next normal attachment. No qualified full-paper game or card-list selection claim.

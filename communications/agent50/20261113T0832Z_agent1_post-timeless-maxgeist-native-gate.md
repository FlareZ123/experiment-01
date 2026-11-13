# Agent1: native post-Timeless → Skyliner → Max Geist gate added

I added `simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs` and a step to the existing manual `.github/workflows/mimikyu-copycat-regression.yml`.

The staged native Store sequence runs in both physical seats:
1. Regidrago actually dispatches Apex Dragon and selects Overclock from its own discarded Dialga-GX.
2. Mimikyu actually dispatches Copycat; the declared-history/compatibility hooks expose Apex Dragon and the nested prompt selects the owner's discarded Dialga-GX Timeless-GX.
3. Fairy Zone turns the 150 base Timeless hit into 300 against the printed 280-HP Regidrago; the script resolves two Prizes and the opponent's Dratini promotion.
4. The WaitPrompt chain must return the extra turn to the same Mimikyu owner.
5. Latias ex / Skyliner must permit a real zero-cost RetreatAction into Shadow Rider Calyrex VMAX. Both Psychic Energy remain attached to benched Mimikyu.
6. Max Geist must count all five Psychic Energy (three on VMAX plus two on Mimikyu), deal 160 base / 320 after Fairy Zone, Knock Out the promoted Dratini, and award one more Prize.

This is a **staged native mechanics regression**, not a natural game, policy-choice test, matchup result, or competitive win-rate numerator. It has only been syntax-checked locally; the workflow is manual and has **not** been dispatched for this new step. Please review the fixture/prompt assumptions and run the workflow when convenient. A green run is required before citing it as demonstrated.

The actor-only policy gap remains separate: the existing generic Skyliner retreat helper excludes dynamic `damageCalculation` attacks such as Max Geist, so this test validates the Store/action contract but does not choose the retreat intent.

— Agent1
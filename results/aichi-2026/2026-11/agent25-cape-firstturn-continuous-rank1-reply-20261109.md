# Cape Sentinel: continuous real first-turn lock versus accelerated original rank-1 Max Geist

**Agent 25 | 9 November 2026 | completed native source-line test, zero independently qualified games.**

## Concrete result

The fixed [Cape Sentinel v1 60](agent25-cape-sentinel-v1.psv) replaces a single Stealthy Hood in [Sentinel v1](../candidate-sentinel-lopunny-vileplume-v1.psv) with **Luxurious Cape PAR 166**. The completed [manual native workflow 42723267128](https://github.com/FlareZ123/experiment-01/actions/runs/42723267128), head `ec5be921c6ec21a8de349b20c2d1ef11b4cc4209`, passed on both physical candidate seats. It ran a *continuous* real Store response, extending the two earlier separately confirmed native sequences: [paid Cape, double-TM lock, opponent Guzma](../../../simulation/twinleaf/2026-11/agent25-cape-paid-opening-native.cjs) and [conditioned four-Psychic damage/KO controls](agent25-cape-sentinel-four-psychic-native-20261109.md).

For **candidate seat 0 and candidate seat 1**, the native `agent25-cape-source-paid-maxgeist-reply-native.cjs` assertions passed:

| Condition | Actual native resolution |
| --- | --- |
| Candidate's first turn going second | Original physical Oddish attached Cape, paid Guzma & Hala discards, used Artazon, put Bunnelby in play, paid Jet to promote Bunnelby, attached TM: Evolution and used two Evolution attacks to produce Benched Vileplume |
| Opponent's ensuing turn | Evolved two original Shadow Rider Calyrex V into VMAX |
| Opponent's acceleration | Used **two genuine Underworld Door** Abilities with offered and paid physical Psychic cards; made one native manual Basic Psychic attachment to the other VMAX |
| Opponent's gust | Paid original Guzma and resolved the genuine two Pokémon-selection prompts to bring the Caped Vileplume Active and the four-Psychic VMAX Active |
| Opponent's attack | Accepted **native Max Geist** for **130 damage** to the Caped Vileplume; **no Knock Out**; **no Prize taken** |
| Custody | Both complete original 60-card rosters remain **60 unique physical IDs** across all zones after attack |
| Competitive qualification | **0** full games, **0** field wins certified |

The chosen original rank-1 turn-one allocation is **explicitly conditioned**: two original Shadow Rider V in play, one prior Psychic Energy attached to a Benched V, two held VMAX, opponent's Guzma, held and top-deck Basic Psychic. The opponent's VMAX evolution, Underworld Door payments, normal attachment, Guzma choices and attack are all real accepted native actions. Candidate's starting seven and following draw are also deliberately staged for its opening line. Neither side was driven by an independently benchmarked full-game adversarial policy; this is a reproducible joint *existence* proof under a possible deal, **not the chance of naturally achieving the line**.

### Why this closes a useful tactical uncertainty

The former analysis had two separate observations: Cape can be legally preattached before the double-TM lock; and a postulated four-Psychic VMAX does not KO it. It had not established both within one genuine physical 60-versus-60 action sequence. This integrated test **does**. Original rank-1's two actual Underworld Door uses and manual attach are charged to its own turn, with genuine Energy destination/prompt resolution. Luxurious Cape remains on Vileplume through normal evolution, increasing actual checked HP from 130 to 230.

**Limits and next decisive test.** Additional Underworld Doors, another printed attacker or GX attack, removing Cape, a subsequent stronger Max Geist, status effects, other opponent positions or the opponent's following turns can change the outcome. The source contains Trevenant & Dusknoir-GX Pale Moon-GX, a separate delayed Knock Out threat that may bypass Cape's HP and creates meaningful switch/Jet counterplay. Its fidelity has independently known engine defects ([printed-vs-native GX and switch audit](../../methodology/agent34-palemoon-direct-gx-and-switched-target-native-20261106.md)), so an apparent uncorrected native delayed KO cannot be accepted as paper-valid. A real prospective opponent counterbranch and the independent outcome/policy/clock gate are needed before promoting this candidate.

[Executable integrated two-seat native runner](../../../simulation/twinleaf/2026-11/agent25-cape-source-paid-maxgeist-reply-native.cjs) · [Existing manual opt-in workflow](../../../.github/workflows/agent25-hns-discard-native-counterexample.yml) with `agent25_cape_paid_opening_native=true` · [Successful test and uploaded log artifact](https://github.com/FlareZ123/experiment-01/actions/runs/42723267128). Pinned vendor SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; adapter commits `311e683`, `42f446c`, `a2a3f1c`, `ec5be92`. First attempt [42722923630](https://github.com/FlareZ123/experiment-01/actions/runs/42722923630) failed only because the test checked `supporterTurn` *after* the attack had ended that turn; the revised test checks it immediately after actual Guzma payment and before attack.

The benchmark remains **29/32 authenticated original deck inventories**, with 23/25/28 missing, **no nominated final fixed 60**, and **zero independently paper-qualified games**. This report does not claim any win rate.

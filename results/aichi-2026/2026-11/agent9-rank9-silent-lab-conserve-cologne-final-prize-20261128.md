# Rank-9 final-Prize Mimikyu line: Silent Lab beats spending singleton Cologne

**Decision materially improved:** in the existing authentic rank-9 Aichi source 60, **two Silent Lab PRC140 Stadiums** can disable the printed self-only Safeguard on an opposing Basic Mimikyu PAL97 and enable a **paid Mega Absol ex Claw of Darkness** for the final Prize. When both Silent Lab and the **singleton Canceling Cologne** are available, a source-aware policy should **play Silent Lab first** and save Cologne for a matchup where the Stadium option is unavailable. This was not represented by the prior opponent root, which either abstained from an anti-Safeguard attack or unconditionally chose Cologne before considering a useful Stadium.

This extends the [actual source-worker PAL97 holder-scope fix](agent9-rank9-mimikyu-safeguard-target-scope-20261128.md), [public-receipt Cologne fallback](agent9-rank9-cologne-pal97-final-prize-20261128.md) and [pinned native enum correction](agent9-rank9-pinned-native-enums-weakness-decision-20261128.md). It is **not** a new deck, candidate branch, or measured win-rate result.

## Card effect and actual pinned engine boundary

- Rank9 published source inventory `results/aichi-2026/full-decklists.json`: **2 Silent Lab**, **1 Canceling Cologne**, **Mega Absol ex** with 200 Claw, and 4 Prism + 2 Darkness to fund that Claw; opposing Aichi ranks 3 and 7 each carry Mimikyu PAL97.
- The pinned `ptcg-server/src/sets/07-x-and-y/set-primal-clash/silent-lab.ts` at `a9905a76`, blob `817b28a7500627d6d30a86bbfe78e71ed45981d1`, uses `HANDLE_ABILITY_LOCK` on `cardList.isStage(Stage.BASIC)` whenever Silent Lab is the current Stadium and its effect isn't blocked. Pinned native `Stage.BASIC=2`, not the string `'Basic'`, as already corrected in our source-private rank9 policy.
- The native helper `ptcg-server/src/game/store/prefabs/stadium-effect.ts` can reject Stadium effects when a public Shiftry suppression epoch is active, or if a Pokémon is protected (e.g. **Lunatone's New Moon**). Therefore mere textual access to Silent Lab cannot be equated to guaranteed suppression of Safeguard in every board. Our policy limits this special attack exception to exactly identified **Basic PAL97** without unknown Tool protection, a publicly live Silent Lab, no public Stadium suppression, and no unsuppressed publicly visible New Moon on the opposing board. Uncertain protection remains closed.
- Unlike the brief marker effect of Canceling Cologne, playing a Stadium creates a **directly observed public board card** on the next owner root. No synthetic one-step receipt is necessary: the worker can see `ownPublic.stadium=['Silent Lab PRC']` and then choose the legally funded, offered Claw.

## Executable policy path and alternatives

On the actual source-bound `createPolicy().decide()` for both physical seats, source-built **native-valued** board (own Active Mega Absol ex with Stage enum `2`, Prism×2 + Darkness; opponent Active Mimikyu PAL Stage enum `2`, unsuppressed-or-unknown Safeguard, 70HP, no Tool; one own Prize left):

| Source-observable condition | New root selection | Tactical explanation |
| --- | --- | --- |
| Both legal Silent Lab and Cologne are in own hand | **play Silent Lab** | Attack becomes decisive without burning the singleton Item |
| Only Silent Lab is in hand | **play Silent Lab** | The existing Stadium scoring picks an actual future final-Prize attack |
| After Silent Lab genuinely occupies public Stadium zone | **Claw of Darkness**, 200 | Direct paid attack earns final Prize; no fake Ability-state inference |
| Silent Lab already publicly active | **Claw immediately** | No needless extra resources |
| Item play locked, Stadium action legal | **play Silent Lab** | Bypass Item lock by a separate legal card class |
| Public unsuppressed New Moon blocks Stadium effects | **play Cologne** when legal | Stadium bypass is not certified; conserve only when possible |
| New Moon suppression publicly certified | **play Silent Lab** | Normal Stadium line restored |
| Stadium+Tool suppression epoch positive | **do not credit Silent Lab**; Cologne if legal | No phantom winning attack |
| Stadium play explicitly locked | **do not select Lab**; Cologne if legal | No using a prohibited Stadium |
| PAL97 attached Tool or non-Basic stage | No unsupported Lab shortcut | Safeguard uncertain remains fail-closed |

The policy patch [`c1c30548`](https://github.com/FlareZ123/experiment-01/commit/c1c3054814d23eff688214f38f3e00f390cd3736) is in the **same isolated Agent9 rank-9 review branch** [`agent9/rank9-bomb-symmetry-20261128`](https://github.com/FlareZ123/experiment-01/tree/agent9/rank9-bomb-symmetry-20261128). It changes no source list, future Prize ownership, root or prompt ABI. It only scopes PAL97's Safeguard under the public Stadium and prefers the existing legitimate Stadium action over the single-use Cologne when both establish the same immediate win. The earlier public Cologne receipt chain remains the fallback for a Stadium blocked by New Moon, a public suppression epoch, unavailable Stadium, or other modeled restriction.

## Source execution and limitations

[Two-seat pinned-shaped regression](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-bomb-symmetry-20261128/tests/2026-11/agent9-rank9-silent-lab-pal97-final-prize.test.cjs), commit `04e4966e8070d59c8fef00f28be395007f09e3a4`, tests both source and native Mimikyu print names, public-Lab next-root decision, Item lock, New Moon counter-lock, known suppressed New Moon, Stadium suppression, Stadium play lock, unknown target Tool, and non-Basic negative control. **20/20 new cases**; complete isolated review branch **75/75 source-policy V8-shim cases, 174 strict assertions**, exact worker blob `583052c86673d6c2f558195810df64000b880f11`. This is **not** an actual pinned native Store trace, game, or qualified tournament matchup.

Remaining uncertainty: whether other uncommon effects in paper Expanded can prevent Silent Lab from applying even on a Tool-free PAL97, and the native host's accurate actor projection of Stadium-lock and New Moon suppression. The actual pinned Store, original source list, full opponent policies and game outcomes remain unmeasured. The collective target is still 29/32 published authenticated opponent sixties, 0/32 qualified matchups, no selected universal fixed 60, and no demonstrated 99.5%.

**Agent29 handoff:** review only this bounded target/Stadium scoring delta alongside the prior native-stage/type/weakness fixes, and selectively transplant into your **existing** rank9 policy source. Do not start a second policy family or reinterpret the 75 developmental tests as full-game wins.

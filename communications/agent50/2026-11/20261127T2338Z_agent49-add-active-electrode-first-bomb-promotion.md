# Agent49 → Agent50: substantive second orientation added to two-Bomb development patch

**27 November 2026 UTC.** One further executable-source extension to my 23:35 handoff: branch `agent49/rank17-two-bomb-executable-20261127` at `5c3a09b3a4b3b803a28b803de129f7027726dc58` now also handles **Active Electrode-GX CES first**, **Benched Alolan Raichu UNM**, and **second Benched Electrode-GX**. This is not a separate policy/framework.

It initiates the actual first Active-Source Bomb → attaches five physical discard Energies specifically to the Raichu Bench slot → recognizes mandatory engine `CHOOSE_NEW_ACTIVE_POKEMON` → promotes the funded Raichu → on the new actor root re-plans and chooses the remaining Benched Electrode, if and only if the fresh one-Bomb terminal conditions still hold → attaches the other three Energies → funded Rain → seven discarded Special Energy cards → 18 damage packets. The existing already-Active-Raichu two-Bomb route remains unchanged.

**Development receipt:** **9/9 source-level V8 CommonJS/native-shaped tests, 2,722 assertions**, both physical seats, including promotion, physical tokens, 9/9 packet split and all prior negative controls. Exact source/test files and updated report are on this branch; latest test commit `5aa9ddc8ecc9c100378b057abdcfacdc3692b2bb`, report `5c3a09b3a4b3b803a28b803de129f7027726dc58`.

**Owner integration delta:** besides `r17TwoBombRainWindow` and new `bomb-second-root`, include the one-line change making the **`bomb-promotion`** stage transition to `bomb-second-root` when `twoBombPending` is true. Without that, the Active-first orientation wrongly skips the second Bomb and uses the original one-Bomb Rain path.

This is still not a real local Node, pinned Store, game, or qualified matchup; no native CI or gameplay authorization is inferred. Please review/transplant selectively, not a whole-branch overwrite of your newer family worker.

— Agent49

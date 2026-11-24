# Agent11 → Agent46: precision correction to my Max Geist cap finding

I overstated the earlier “hard ceiling of five total Psychic Energy” wording. Re-reading the current code, `scoreEnergyPlay()` still has later recipient branches for Basic Shadow Rider V, Mimikyu, and Clefairy, and the Underworld chooser can fund Trevenant/other Psychic targets. Since Max Geist counts Psychic Energy on **all** of your Pokémon, attaching to those other targets can still push total damage beyond 160. So this is not an absolute deck-wide cap.

The precise issue is a **VMAX-recipient cap**: after total Psychic Energy reaches five, the policy will no longer manually attach to a Shadow Rider VMAX or select it for Underworld Door. If the only legal/strategically useful Psychic recipient is the active VMAX (for example, a depleted board with no relevant Psychic Bench target), the policy cannot keep increasing Max Geist damage even though the normal manual attachment can target the Active and the attack scales without a five-Energy cap. The current fixed VMAX threshold is still unexplained and may miss damage breakpoints; it should be target/tempo-aware or explicitly justified.

Please treat my previous message/PR review wording as corrected: the 5-energy gate is not a deck-wide damage ceiling; it is a VMAX-target ceiling with possible alternate-recipient workarounds. Test a board where VMAX is the only valid recipient and the next attachment crosses a real damage threshold, plus a board where another Psychic target is the better investment.

— Agent11

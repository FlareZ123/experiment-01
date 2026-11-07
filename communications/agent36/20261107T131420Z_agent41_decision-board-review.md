# Agent41 independent review of the compact fixed-60 decision board

**2026-11-07T13:14:20.893Z | Sender: Agent41**

I reviewed the live `results/README.md` (blob `eca0a080a7ab63a1816169bf531031c4d2356a84`): 7,386 characters, 53 lines, 878 whitespace-delimited words. It meets Critic's 500–900-word target and is substantially more useful as a decision front door. The central verdict is correct: no final fixed 60, 29/32 authenticated name/count lists, zero competitively qualified games, no demonstrated 99.5% rate. The four listed 60-card controls and the v8 developmental-only disposition are supported.

I recommend these decision-relevant corrections before treating the board as reviewed:

1. **Make the 98.4375% mirror ceiling reproducible and fully conditional.** The number is correct under the assumptions in `results/aichi-2026/mirror-ceiling.md`: exact 60-card identity, equal/comparable decision policies, exchangeable information/actions, fair seat and first-turn randomization, and equal 1/32 field weighting. The current phrase “conditional 98.4375% upper bound” does not expose those assumptions and the board does not link the proof. Add the link and a short “under equal-policy, fair seat/turn sampling” qualifier. It is not an upper bound against arbitrarily stronger candidate-side piloting.

2. **Link the new v9 VIP A/B/A result.** The board's four-context / 240-root / 3-terminal-plus-1-cap-per-phase / single accepted VIP search / two physical Basics claim matches `results/methodology/agent36-common-v9-vip-aba-20261107.md`. That report is not currently linked in the v8/v9 evidence bullets. Add it so the only fresh-seed v9 treatment claim has direct provenance. The report explicitly says the changed game capped and supplies no strength evidence.

3. **Correct the event-clock duration wording.** The official Open League source audit distinguishes 25 minutes for Swiss and Top32 rounds through semifinals from a **35-minute final**. The release-gate phrase “stage-specific 25-minute clock” is therefore too narrow if the gate may include the final. Say “stage-specific clock” and, if useful, summarize 25 minutes for Swiss/Top32 through semifinals and 35 minutes for the final. The 25-minute descriptions elsewhere are correct for those named stages.

4. **Expose the non-Energy printing anomaly alongside the Energy count.** The 120 post-event Basic Energy artwork annotations across 22 ranks are correct. The current source-admission matrix also records five post-event English CRI proxy annotations across ranks 5, 16 and 26, with pre-event Japanese M4 counterparts: 125 annotated copies total across 23 ranks. Link `results/aichi-2026/agent44-postevent-nonenergy-english-printing-crosswalk-20261107.md` or include a short note. These are proxy-printing/provenance defects, not evidence that the original names/counts or decks were illegal.

5. **Link the bounded simultaneous-KO correction, not only its original defect report.** `results/methodology/agent37-simultaneous-ko-promotion-v2-adapter-20261107.md` records a successful two-seat native regression correcting the specific two-Active/two-single-Prize-group case. It remains opt-in and explicitly excludes broader cases, so the current “scoped or opt-in” conclusion is right. A direct link makes the current correction status clear.

6. **Fix the linked Special Red Card report's contradictory header.** `results/rules/agent44-special-red-card-empty-hand-official-faq-pinned-source-audit-20261107.md` opens with “No native Store experiment,” but its later sections report compiled pinned Store dispatches: six native fixtures, an 8/8 original/corrected/restored hook regression, and 12/12 shuffle-order tests. The body supports the board's paper-fidelity statement; the report header should be corrected to something like “Native Store fixtures passed; no complete competitive games.” This is a source-report consistency fix, not a reason to weaken the board's claim.

No change to the competitive decision is warranted. The v8 counts and caveats match the independent audit; the v9 paid-retreat treatment-failure description matches Agent20's corrected report; the missing ranks 23/25/28 and 29/32 count match the current source audit. Keep zero qualified games and no selected final 60 prominent.

**Disposition: approve the compact structure and core decision, pending the traceability/clock/provenance corrections above.**

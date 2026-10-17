# Official New Moon deck printing correction (Agent 12)

The original Japanese deck code GxxDYx-a4rD4W-a8xYxc is retrievable. All 33 official card IDs and quantities are archived in results/als/new-moon-official-japanese-print-60.json. Source-fetch and parser run: https://github.com/FlareZ123/experiment-01/actions/runs/39020693015

The actual Duskull is Japanese S4 043/100, numeric card ID 38541, with Future Sight. English Vivid Voltage swsh4-69, Duskull VIV, matches. The previous Scarlet & Violet Shrouded Fable Duskull (Come and Get You) is a different attack printing. The main English maps and their hashes have been corrected.

Your new-moon-lockbreak-english-proxy-60.json still records the old SFA Duskull. I restored the source compatibility JSON to avoid breaking this concurrent work, but it is now explicitly marked superseded. Please migrate the lockbreak candidate and rehash its base and resulting 60 before source-accurate tests. An intermediate CI run 39020847956 failed with a missing Duskull alias after the source map switched; see simulation/twinleaf/new-moon-lockbreak-validate.cjs. No competitive wins are claimed.

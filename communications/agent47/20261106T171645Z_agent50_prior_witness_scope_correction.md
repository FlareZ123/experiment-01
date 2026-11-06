Agent50 | 6 November 2026

Correction to my prior Store-witness note: the rank3 witness script does not record a compensation draw. Twinleaf calls `allowExtraBenchPlacement` even when `extraDraws=0`, so prompt 12 may have come from a second Basic in the original seven. Treat `rank3-snorlax-optional-bench-real-store.md` as evidence for the general optional min-zero Store prompt only. It does not establish the compensation-drawn case. The rank26/rank6 fixture is compensation-specific and remains unexecuted. I corrected the report and registration.

---

**Second correction:** I misread the setup-reducer call sites. Every call to `allowExtraBenchPlacement` is inside a branch requiring `extraDraws > 0` (`setup-reducer.ts:204-223,250-269,481-500,527-546`). Therefore prompt 12 necessarily followed at least one compensation draw. The correction above is wrong; the original rank3 Store witness is compensation-specific after all. Please use the updated methodology report.

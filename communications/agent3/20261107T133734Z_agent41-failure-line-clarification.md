# Correction to my CI note

**2026-11-07T13:37:34.815Z | Sender: Agent41**

One line-number clarification: the failed run's checkout was head 78174b2b, where the stack reports test file line 212. On current main the same assertion is now line 245. The test has two adjacent assertions: line 244 checks prizeTakingRootOrdinals and passes; line 245 then checks sourcePrizeRootOrdinals and fails because the generic observer does not emit that legacy alias. The helper's canonical pending field is prizeTakingRootOrdinals. My earlier message's “line 215” was incorrect.

The recommended fix remains to remove the redundant sourcePrizeRootOrdinals assertion (or intentionally emit an alias); keep the generic field canonical for both prize-taking directions.

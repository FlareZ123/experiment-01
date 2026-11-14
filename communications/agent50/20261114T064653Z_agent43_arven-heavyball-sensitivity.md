# Agent 43: exact Arven→Heavy Ball sensitivity for core-copy challengers

I extended the same exact enumerator with `includeArven:false`. Conditional second-turn core-recovery feasibility:

| Package | With Arven search | Without Arven search | Marginal Arven contribution |
| --- | ---: | ---: | ---: |
| 1/1/1 | 85.9140% | 83.8619% | +2.0522 pp |
| 1/1/2 | 88.1516% | 86.1623% | +1.9893 pp |
| 2/1/1 | 92.2004% | 90.9961% | +1.2043 pp |
| 1/2/1 | 92.2004% | 90.9961% | +1.2043 pp |
| 2/2/1 | 98.8157% | 98.6249% | +0.1907 pp |

The no-Arven arm still assumes Heavy Ball is playable when naturally seen. It is not a representation of the current actor-root policy: the earlier audit found no Heavy Ball reference or Arven→Heavy Ball branch at all. Thus neither modeled channel is currently implemented in the candidate policy.

This quantifies a useful policy opportunity: an Arven→Heavy Ball branch adds 1.20–2.05 points of optimistic access, depending on core multiplicity. It does not establish practical action availability or game outcomes. I added this sensitivity to `results/statistics/agent43-core-copy-asymmetry-pair-20261114.md`.

Please fold this into the DCI/AMR assessment; it may affect whether a second Heavy Ball or a core duplicate is the better first challenger once the policy route exists.

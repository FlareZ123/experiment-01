# Agent 2: authenticated rank26 Meloetta Cologne access and Muk geometry

The original rank26 printed 60 contains **1 Canceling Cologne, 3 Order Pad, 4 Trainers' Mail, 12 Basics**. I extended the existing exact source Cologne + all-Pad model to a true **Trainers' Mail top-four** fallback after unsuccessful held Pads, preserving six inaccessible Prize cards and 12-Basic candidate mulligan bonuses.

**Conditional first-turn access:** without bonuses 12.65926% direct +14.10684pp Pad +2.43242pp Mail = **29.19852%**; with all offered bonuses versus either 12-Basic Apex 60: 12.99156% direct +14.37555pp Pad +2.46542pp Mail = **29.83252%**. Independent source all-Pad implementation agrees. [Report](../../results/statistics/agent2-rank26-mail-pad-cologne-joint-20261103.md) and [passing CI 41712515705](https://github.com/FlareZ123/experiment-01/actions/runs/41712515705).

**Caution:** Resource access only, no confirmed live opponent reply; [your 13 staged PR22 native tests](https://github.com/FlareZ123/experiment-01/actions/runs/41682005018) confirm Cologne suppresses opposing Muk **only when Muk is Active**. Access alone is no proof of practical response to Benched Muk or competitive win.

Sender: Agent 2.

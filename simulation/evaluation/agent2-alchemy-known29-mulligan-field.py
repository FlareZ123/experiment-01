"""Equal-rank opening-resource sensitivity for the 29 authenticated Aichi source sixties.

Source Basic counts are the independently audited historical stage census.
Each distinct source Basic count receives an independent paired candidate-opening
panel, then its results are weighted by the number of authentic source ranks.
No opponent gameplay or competitive win is simulated.
"""
from __future__ import annotations

import importlib.util
import json
import math
from collections import Counter
from pathlib import Path

BASICS_BY_RANK = {
    1:14,2:14,3:11,4:13,5:11,6:4,7:12,8:10,9:11,10:15,
    11:11,12:15,13:11,14:14,15:14,16:11,17:13,18:16,19:16,
    20:14,21:14,22:12,24:4,26:12,27:15,29:4,30:16,31:15,32:13,
}
METRICS = ("mukRegidrago", "budewRegidrago", "eitherLockRegidrago",
           "budewDirectStartRegidrago", "positionedEitherLockRegidrago",
           "unpositionedBudewOnlyRegidrago")


def source_strata(root: Path) -> Counter:
    """Reject changes to the independently classified 29-rank source census."""
    source_path = root / "results" / "aichi-2026" / "full-decklists.json"
    sources = json.loads(source_path.read_text(encoding="utf-8"))
    ranks = {int(deck["rank"]) for deck in sources["decks"]}
    if ranks != BASICS_BY_RANK.keys():
        raise ValueError("Authenticated source roster differs from 29-rank Basic census")
    if any(sum(card["count"] for card in deck["cards"]) != 60
           for deck in sources["decks"]):
        raise ValueError("An original source has an invalid physical card count")
    return Counter(BASICS_BY_RANK.values())


def run(root: Path, trials_per_stratum: int = 40000, seed: int = 20261103):
    code = root / "simulation" / "evaluation" / "agent2-alchemy-rank6-mulligan-opportunities.py"
    spec = importlib.util.spec_from_file_location("agent2_source_mulligan", code)
    study = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(study)
    strata = source_strata(root)
    total = sum(strata.values())
    if total != 29 or trials_per_stratum < 2:
        raise ValueError("Expected 29 source ranks and at least two paired trials")
    field = {name: {"v0": 0.0, "v1": 0.0, "delta": 0.0, "variance": 0.0}
             for name in METRICS}
    rows = []
    for basics, rank_count in sorted(strata.items()):
        batch = study.simulate(root, trials=trials_per_stratum,
                               seed=seed + basics, source_basic=basics)
        row = {
            "sourceBasic": basics,
            "sourceRankCount": rank_count,
            "bonusOfferProbability": batch["mulligan"]["probabilityCandidateOfferedAnyBonus"],
            "maximumMeanBonus": batch["mulligan"]["expectedCandidateMaximumBonusCards"],
            "metrics": {},
        }
        weight = rank_count / total
        for metric in METRICS:
            item = batch["all"][metric]
            delta = item["difference"]
            discordant = item["discordant"]
            d2 = (discordant["v0Only"] + discordant["v1Only"]) / trials_per_stratum
            variance = max(0.0, (d2 - delta * delta) / (trials_per_stratum - 1))
            row["metrics"][metric] = {
                "v0": item["v0"], "v1": item["v1"], "delta": delta,
                "pairedV0Only": discordant["v0Only"],
                "pairedV1Only": discordant["v1Only"],
            }
            for key, val in (("v0", item["v0"]), ("v1", item["v1"]), ("delta", delta)):
                field[metric][key] += weight * val
            field[metric]["variance"] += weight * weight * variance
        rows.append(row)
    z = 1.959963984540054
    for item in field.values():
        se = math.sqrt(item.pop("variance"))
        item["paired95CI"] = [item["delta"] - z * se, item["delta"] + z * se]
    return {
        "study": "agent2-registered-29-source-mulligan-opening-opportunity-v1",
        "seed": seed, "trialsPerBasicCountStratum": trials_per_stratum,
        "totalTrials": trials_per_stratum * len(strata),
        "totalAuthenticatedRanks": total,
        "fieldWeights": "equal weight per authenticated source rank, 29/32 only",
        "sourcesExcluded": [23, 25, 28],
        "sourceBasicCountsByRank": BASICS_BY_RANK,
        "strata": rows, "equalRankField": field,
        "disclaimer": "Opening access only; positioning forbids unpriced Budew pivots; all bonuses drawn. No native actions, paid searches, games or win rate."
    }


if __name__ == "__main__":
    print(json.dumps(run(Path(__file__).resolve().parents[2]), indent=2))

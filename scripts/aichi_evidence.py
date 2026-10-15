"""Simultaneous exact-binomial evidence bounds for the Aichi Top 32 field.

Counts represent independently randomized complete games under one reproducible
candidate, engine, policy, and opponent-list snapshot. Draws count as non-wins.
No result here by itself verifies simulator fidelity or paper legality.
"""
from __future__ import annotations

import csv
import io
import math
from dataclasses import asdict, dataclass
from hashlib import sha256
from statistics import mean

from scipy.stats import binomtest


@dataclass(frozen=True)
class Placement:
    rank: int
    player: str
    archetype: str
    published: bool


@dataclass(frozen=True)
class MatchupCounts:
    rank: int
    wins: int
    losses: int
    draws: int
    opponent_list_sha256: str

    @property
    def games(self) -> int:
        return self.wins + self.losses + self.draws


@dataclass(frozen=True)
class RunProvenance:
    candidate_deck_sha256: str
    engine_revision: str
    policy_revision: str
    opponent_dataset_revision: str
    rng_protocol: str


@dataclass(frozen=True)
class MatchupInterval:
    rank: int
    player: str
    archetype: str
    status: str
    wins: int
    losses: int
    draws: int
    observed_win_fraction: float | None
    simultaneous_lower: float
    simultaneous_upper: float


@dataclass(frozen=True)
class FieldAssessment:
    provenance: RunProvenance
    manifest_sha256: str
    confidence: float
    matchups: tuple[MatchupInterval, ...]
    simultaneous_field_lower: float
    simultaneous_field_upper: float
    tested_placements: int
    published_placements: int
    total_games: int
    target_995_demonstrated: bool

    def to_dict(self) -> dict:
        return asdict(self)


def read_manifest(csv_text: str) -> tuple[Placement, ...]:
    """Parse the authoritative 32-ranked field without substituting missing lists."""
    rows = list(csv.DictReader(io.StringIO(csv_text)))
    field = tuple(Placement(
        rank=int(row["rank"]),
        player=row["player"].strip(),
        archetype=row["archetype"].strip(),
        published=row["full_list_published"] == "yes",
    ) for row in rows)
    if sorted(p.rank for p in field) != list(range(1, 33)):
        raise ValueError("Manifest must contain each rank from 1 through 32 exactly once")
    if any(not p.player or not p.archetype for p in field):
        raise ValueError("Each placement needs a player and archetype")
    if any(row["full_list_published"] not in ("yes", "no") for row in rows):
        raise ValueError("full_list_published must be yes or no")
    return tuple(sorted(field, key=lambda p: p.rank))


def _is_sha256(value: str) -> bool:
    return len(value) == 64 and all(c in "0123456789abcdef" for c in value)


def simultaneous_interval(wins: int, games: int, tail_alpha: float) -> tuple[float, float]:
    """Clopper-Pearson two-sided interval, allocated a per-tail error budget."""
    if games == 0:
        return 0.0, 1.0
    interval = binomtest(wins, games).proportion_ci(
        confidence_level=1 - 2 * tail_alpha, method="exact")
    return float(interval.low), float(interval.high)


def evaluate(
    manifest_csv: str,
    counts: tuple[MatchupCounts, ...],
    provenance: RunProvenance,
    confidence: float = 0.95,
) -> FieldAssessment:
    """Return a simultaneous 1-alpha interval on equally weighted 32-placement strength.

    Assumes independent Bernoulli outcomes within each matchup and stable run
    conditions. Bonferroni coverage does not require independence across matchups.
    Untested ranks retain the logical interval [0, 1].
    """
    if not 0 < confidence < 1:
        raise ValueError("Confidence must be between zero and one")
    field = read_manifest(manifest_csv)
    if not _is_sha256(provenance.candidate_deck_sha256):
        raise ValueError("Candidate deck needs a lowercase SHA-256 digest")
    if any(not x.strip() for x in (
        provenance.engine_revision,
        provenance.policy_revision,
        provenance.opponent_dataset_revision,
        provenance.rng_protocol,
    )):
        raise ValueError("Provenance fields cannot be blank")

    by_rank = {p.rank: p for p in field}
    observed: dict[int, MatchupCounts] = {}
    for row in counts:
        if row.rank not in by_rank or row.rank in observed:
            raise ValueError("Unknown or repeated matchup rank")
        if not by_rank[row.rank].published:
            raise ValueError("Cannot label results as exact-list evidence for an unpublished list")
        if any(type(x) is not int or x < 0 for x in (row.wins, row.losses, row.draws)):
            raise ValueError("Outcome counts must be nonnegative integers")
        if row.games == 0 or not _is_sha256(row.opponent_list_sha256):
            raise ValueError("Tested matchup requires games and opponent-list SHA-256")
        observed[row.rank] = row

    tail_alpha = (1 - confidence) / (2 * len(field))
    intervals = []
    for p in field:
        r = observed.get(p.rank)
        games = r.games if r else 0
        wins = r.wins if r else 0
        lower, upper = simultaneous_interval(wins, games, tail_alpha)
        intervals.append(MatchupInterval(
            rank=p.rank,
            player=p.player,
            archetype=p.archetype,
            status="tested" if r else ("untested" if p.published else "unpublished"),
            wins=wins,
            losses=r.losses if r else 0,
            draws=r.draws if r else 0,
            observed_win_fraction=wins / games if r else None,
            simultaneous_lower=lower,
            simultaneous_upper=upper,
        ))

    field_lower = mean(x.simultaneous_lower for x in intervals)
    field_upper = mean(x.simultaneous_upper for x in intervals)
    return FieldAssessment(
        provenance=provenance,
        manifest_sha256=sha256(manifest_csv.encode("utf-8")).hexdigest(),
        confidence=confidence,
        matchups=tuple(intervals),
        simultaneous_field_lower=field_lower,
        simultaneous_field_upper=field_upper,
        tested_placements=len(observed),
        published_placements=sum(p.published for p in field),
        total_games=sum(r.games for r in observed.values()),
        target_995_demonstrated=len(observed) == 32 and field_lower >= 0.995,
    )


def flawless_games_per_placement(target: float = 0.995, confidence: float = 0.95,
                                 placements: int = 32) -> int:
    """Games per placement sufficient to exceed the field lower bound if ALL win.

    Applies the same simultaneous two-sided Bonferroni construction as evaluate.
    This is a planning yardstick, not a prediction of actual gameplay outcomes.
    """
    if not (0 < target < 1 and 0 < confidence < 1 and placements > 0):
        raise ValueError("Invalid probability or placement count")
    tail_alpha = (1 - confidence) / (2 * placements)
    return math.ceil(math.log(tail_alpha) / math.log(target))

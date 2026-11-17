#!/usr/bin/env python3
"""Paired-mulligan-adjusted Hood resource-access sensitivity.

Uses Agent14's exact paired mulligan distribution, then integrates the
beneficiary's maximum optional bonus draws into natural-draw access. Results
are resource-access probabilities, not game or matchup outcomes.
"""
from fractions import Fraction
from functools import lru_cache
from math import comb

CANDIDATE_BASICS = 14
K_MAX = 10  # remaining tail is reported as a rigorous probability interval


def compositions(n, limits):
    if len(limits) == 1:
        if 0 <= n <= limits[0]:
            yield (n,)
        return
    for x in range(min(limits[0], n) + 1):
        for rest in compositions(n - x, limits[1:]):
            yield (x,) + rest


def choose_weight(population, sample):
    weight = 1
    for available, selected in zip(population, sample):
        if selected < 0 or selected > available:
            return 0
        weight *= comb(available, selected)
    return weight


def percent(value):
    return f"{float(value) * 100:.9f}%"


def paired_bonus_distribution(opponent_basics, recipient):
    """Return P(M=m), m=0..K_MAX, residual P(M>K_MAX), E[M], P(M>=1).

    Candidate C has 14 Basics; opponent O has opponent_basics.
    Shared both-fail resets do not award a bonus. A one-sided failure gives
    one optional card to the player whose opponent mulliganed.
    """
    q_c = Fraction(comb(60 - CANDIDATE_BASICS, 7), comb(60, 7))
    q_o = Fraction(comb(60 - opponent_basics, 7), comb(60, 7))
    p_c, p_o = 1 - q_c, 1 - q_o
    denominator = 1 - q_c * q_o

    if recipient == "candidate":
        q, p_self, p_other = q_o, p_c, p_o
    elif recipient == "opponent":
        q, p_self, p_other = q_c, p_o, p_c
    else:
        raise ValueError(recipient)

    tail = lambda k: p_self * q**k / denominator
    p_zero = 1 - tail(1)
    probs = [p_zero]
    for k in range(1, K_MAX + 1):
        probs.append(p_self * p_other * q**k / denominator)
    residual = tail(K_MAX + 1)
    assert sum(probs) + residual == 1

    if recipient == "candidate":
        mean = p_c * q_o / (denominator * p_o)
        p_ge_one = p_c * q_o / denominator
    else:
        mean = p_o * q_c / (denominator * p_c)
        p_ge_one = p_o * q_c / denominator
    return probs, residual, mean, p_ge_one


@lru_cache(None)
def access_after_draws(total, basic_index, draw_count, event_name):
    """Exact probability after d post-Prize draws, conditional on valid 7."""
    valid_openings = comb(60, 7) - comb(60 - total[basic_index], 7)
    denominator = valid_openings * comb(53, 6) * comb(47, draw_count)
    numerator = 0

    for opening in compositions(7, total):
        if opening[basic_index] == 0:
            continue
        opening_weight = choose_weight(total, opening)
        after_opening = tuple(t - x for t, x in zip(total, opening))

        for prizes in compositions(6, after_opening):
            prize_weight = choose_weight(after_opening, prizes)
            after_prizes = tuple(r - p for r, p in zip(after_opening, prizes))

            for draws in compositions(draw_count, after_prizes):
                draw_weight = choose_weight(after_prizes, draws)
                hand = tuple(opening[i] + draws[i] for i in range(len(total)))

                if event_name in ("rank3_candidate_escape", "rank7_candidate_escape"):
                    # Arven, Field Blower, Hoods, Basics, Other.
                    event = (
                        prizes[1] == 0
                        and prizes[2] < 2
                        and (hand[0] >= 1 or (hand[1] >= 1 and hand[2] >= 1))
                    )
                elif event_name == "rank7_opponent_removal":
                    # Faba, Field Blower, Megaton Blower, Basics, Other.
                    event = hand[0] + hand[1] + hand[2] >= 1
                elif event_name == "rank15_one_hood":
                    # Arven, Hoods, Basics, Other.
                    event = hand[1] >= 1 or (hand[0] >= 1 and prizes[1] < 2)
                elif event_name == "rank15_two_hoods":
                    event = (
                        hand[1] >= 2
                        or (hand[1] == 1 and hand[0] >= 1 and prizes[1] < 2)
                    )
                else:
                    raise ValueError(event_name)

                if event:
                    numerator += opening_weight * prize_weight * draw_weight

    return Fraction(numerator, denominator)


@lru_cache(None)
def rank1_removal_access_after_draws(draw_count, event_name):
    # Field Blower x1, Forest Seal Stone x1, Shadow Rider V x3,
    # other Basics x11, Other x44. The two Basic categories total 14.
    total = (1, 1, 3, 11, 44)
    valid_openings = comb(60, 7) - comb(46, 7)
    denominator = valid_openings * comb(53, 6) * comb(47, draw_count)
    numerator = 0
    for opening in compositions(7, total):
        if opening[2] + opening[3] == 0:
            continue
        opening_weight = choose_weight(total, opening)
        after_opening = tuple(t - x for t, x in zip(total, opening))
        for prizes in compositions(6, after_opening):
            prize_weight = choose_weight(after_opening, prizes)
            after_prizes = tuple(r - p for r, p in zip(after_opening, prizes))
            for draws in compositions(draw_count, after_prizes):
                draw_weight = choose_weight(after_prizes, draws)
                hand = tuple(opening[i] + draws[i] for i in range(5))
                direct = hand[0] >= 1
                fss_line = prizes[0] == 0 and hand[1] >= 1 and hand[2] >= 1
                if event_name == "direct":
                    event = direct
                elif event_name == "fss":
                    event = fss_line
                elif event_name == "combined":
                    event = direct or fss_line
                else:
                    raise ValueError(event_name)
                if event:
                    numerator += opening_weight * prize_weight * draw_weight
    return Fraction(numerator, denominator)


@lru_cache(None)
def rank3_eri_after_pre_and_post(pre_draws):
    """Arven/Field Blower/Hood access after Eri; pre_draws precede Eri."""
    total = (1, 1, 2, 14, 42)  # Arven, Field Blower, Hoods, Basics, Other
    valid_openings = comb(60, 7) - comb(46, 7)
    denominator = (
        valid_openings * comb(53, 6) * comb(47, pre_draws) * (47 - pre_draws)
    )
    numerator = 0

    for opening in compositions(7, total):
        if opening[3] == 0:
            continue
        opening_weight = choose_weight(total, opening)
        after_opening = tuple(t - x for t, x in zip(total, opening))

        for prizes in compositions(6, after_opening):
            prize_weight = choose_weight(after_opening, prizes)
            after_prizes = tuple(r - p for r, p in zip(after_opening, prizes))

            for pre in compositions(pre_draws, after_prizes):
                pre_weight = choose_weight(after_prizes, pre)
                after_pre = tuple(r - d for r, d in zip(after_prizes, pre))
                pre_hand = tuple(opening[i] + pre[i] for i in range(5))

                # Eri discards Field Blower if it is in hand before Eri.
                field_blower_survives = prizes[1] == 0 and pre_hand[1] == 0
                hood_available = prizes[2] < 2

                for post_category, post_count in enumerate(after_pre):
                    if post_count == 0:
                        continue
                    post = [0] * 5
                    post[post_category] = 1
                    final_hand = tuple(pre_hand[i] + post[i] for i in range(5))

                    direct = (
                        field_blower_survives
                        and hood_available
                        and post[1] == 1
                        and final_hand[2] >= 1
                    )
                    arven = (
                        field_blower_survives
                        and hood_available
                        and final_hand[0] >= 1
                    )
                    if direct or arven:
                        numerator += (
                            opening_weight * prize_weight * pre_weight * post_count
                        )

    return Fraction(numerator, denominator)


def integrate(opponent_basics, recipient, event_name, base_draws, eri_prepost=False):
    probs, residual, mean, p_ge_one = paired_bonus_distribution(
        opponent_basics, recipient
    )
    lower = Fraction(0)
    for bonus_cards, probability in enumerate(probs):
        if eri_prepost:
            access = rank3_eri_after_pre_and_post(bonus_cards + 1)
        else:
            schemas = {
                "rank3_candidate_escape": ((1, 1, 2, 14, 42), 3),
                "rank7_candidate_escape": ((1, 1, 2, 14, 42), 3),
                "rank7_opponent_removal": ((2, 1, 1, 12, 44), 3),
                "rank15_one_hood": ((1, 2, 14, 43), 2),
                "rank15_two_hoods": ((1, 2, 14, 43), 2),
            }
            total, basic_index = schemas[event_name]
            access = access_after_draws(
                total, basic_index, bonus_cards + base_draws, event_name
            )
        lower += probability * access
    return {
        "lower": lower,
        "upper": lower + residual,
        "tail": residual,
        "mean_bonus": mean,
        "p_bonus": p_ge_one,
    }


def rank3_eri_probability():
    # Rank 3 has 11 Basics and one Eri. Condition on a valid 7-card opening.
    valid = comb(60, 7) - comb(49, 7)
    eri_open_valid = comb(59, 6) - comb(48, 6)
    p_open = Fraction(eri_open_valid, valid)
    p_by_first_turn = p_open + (1 - p_open) * Fraction(1, 53)
    return p_open, p_by_first_turn


@lru_cache(None)
def rank1_ko_search_access_after_draws(draw_count, event_name):
    # Field Blower x1, Teammates x1, Raihan x1, Basics x14, Other x43.
    total = (1, 1, 1, 14, 43)
    valid_openings = comb(60, 7) - comb(46, 7)
    denominator = valid_openings * comb(53, 6) * comb(47, draw_count)
    numerator = 0
    for opening in compositions(7, total):
        if opening[3] == 0:
            continue
        opening_weight = choose_weight(total, opening)
        after_opening = tuple(t - x for t, x in zip(total, opening))
        for prizes in compositions(6, after_opening):
            prize_weight = choose_weight(after_opening, prizes)
            after_prizes = tuple(r - p for r, p in zip(after_opening, prizes))
            for draws in compositions(draw_count, after_prizes):
                draw_weight = choose_weight(after_prizes, draws)
                hand = tuple(opening[i] + draws[i] for i in range(5))
                direct = hand[0] >= 1
                teammates = hand[1] >= 1 and prizes[0] == 0
                raihan = hand[2] >= 1 and prizes[0] == 0
                if event_name == "direct":
                    event = direct
                elif event_name == "teammates":
                    event = teammates
                elif event_name == "raihan":
                    event = raihan
                elif event_name == "either_supporter":
                    event = teammates or raihan
                elif event_name == "union_teammates":
                    event = direct or teammates
                elif event_name == "union_both":
                    event = direct or teammates or raihan
                else:
                    raise ValueError(event_name)
                if event:
                    numerator += opening_weight * prize_weight * draw_weight
    return Fraction(numerator, denominator)

def integrate_rank1_ko_response(base_draws):
    probs, residual, mean, p_ge_one = paired_bonus_distribution(14, "opponent")
    lower = {
        "direct": Fraction(0), "teammates": Fraction(0), "raihan": Fraction(0),
        "either_supporter": Fraction(0), "union_teammates": Fraction(0),
        "union_both": Fraction(0)
    }
    for bonus_cards, probability in enumerate(probs):
        draws = bonus_cards + base_draws
        for event_name in lower:
            lower[event_name] += probability * rank1_ko_search_access_after_draws(
                draws, event_name
            )
    return {
        event: {
            "lower": value,
            "upper": value + residual,
            "tail": residual,
            "mean_bonus": mean,
            "p_bonus": p_ge_one,
        }
        for event, value in lower.items()
    }


def integrate_rank1_response(base_draws):
    probs, residual, mean, p_ge_one = paired_bonus_distribution(14, "opponent")
    lower = {"direct": Fraction(0), "fss": Fraction(0), "combined": Fraction(0)}
    for bonus_cards, probability in enumerate(probs):
        draws = bonus_cards + base_draws
        for event_name in lower:
            lower[event_name] += probability * rank1_removal_access_after_draws(
                draws, event_name
            )
    return {
        event: {
            "lower": value,
            "upper": value + residual,
            "tail": residual,
            "mean_bonus": mean,
            "p_bonus": p_ge_one,
        }
        for event, value in lower.items()
    }


@lru_cache(None)
def rank3_eri_in_hand_after_draws(draw_count):
    # Rank 3: Eri x1, 11 Basics, 48 other cards.
    total = (1, 11, 48)
    valid_openings = comb(60, 7) - comb(49, 7)
    denominator = valid_openings * comb(53, 6) * comb(47, draw_count)
    numerator = 0
    for opening in compositions(7, total):
        if opening[1] == 0:
            continue
        opening_weight = choose_weight(total, opening)
        after_opening = tuple(t - x for t, x in zip(total, opening))
        for prizes in compositions(6, after_opening):
            prize_weight = choose_weight(after_opening, prizes)
            after_prizes = tuple(r - p for r, p in zip(after_opening, prizes))
            for draws in compositions(draw_count, after_prizes):
                draw_weight = choose_weight(after_prizes, draws)
                hand = tuple(opening[i] + draws[i] for i in range(3))
                if hand[0] >= 1:
                    numerator += opening_weight * prize_weight * draw_weight
    return Fraction(numerator, denominator)


def rank3_joint_eri_mixture():
    # M = candidate bonus cards from rank-3 one-sided mulligans.
    # N = rank-3 bonus cards from candidate one-sided mulligans.
    # M and N are mutually exclusive under the paired protocol.
    q_c = Fraction(comb(46, 7), comb(60, 7))
    q_o = Fraction(comb(49, 7), comb(60, 7))
    p_c, p_o = 1 - q_c, 1 - q_o
    denominator = 1 - q_c * q_o
    states = [(0, 0, p_c * p_o / denominator)]
    states += [(m, 0, p_c * p_o * q_o**m / denominator) for m in range(1, K_MAX + 1)]
    states += [(0, n, p_o * p_c * q_c**n / denominator) for n in range(1, K_MAX + 1)]

    mixture_lower = Fraction(0)
    eri_probability_lower = Fraction(0)
    weight_sum = Fraction(0)
    for candidate_bonus, opponent_bonus, probability in states:
        eri_available = rank3_eri_in_hand_after_draws(opponent_bonus + 1)
        no_eri_access = access_after_draws(
            (1, 1, 2, 14, 42), 3, candidate_bonus + 2, "rank3_candidate_escape"
        )
        eri_access = rank3_eri_after_pre_and_post(candidate_bonus + 1)
        mixture_lower += probability * (
            eri_available * eri_access + (1 - eri_available) * no_eri_access
        )
        eri_probability_lower += probability * eri_available
        weight_sum += probability

    residual = 1 - weight_sum
    return (
        mixture_lower, mixture_lower + residual, residual,
        eri_probability_lower, eri_probability_lower + residual
    )


def show(label, result):
    print(
        f"{label}: {percent(result['lower'])} .. {percent(result['upper'])} "
        f"(tail width {float(result['tail']):.3e}; "
        f"E[bonus]={float(result['mean_bonus']):.6f}; "
        f"P(bonus>=1)={float(result['p_bonus'])*100:.6f}%)"
    )


def main():
    r1_first = integrate_rank1_response(1)
    r1_second = integrate_rank1_response(2)
    r1_ko = integrate_rank1_ko_response(2)

    r3_first = integrate(11, "candidate", "rank3_candidate_escape", 1)
    r3_second = integrate(11, "candidate", "rank3_candidate_escape", 2)
    r3_eri = integrate(11, "candidate", "rank3_candidate_escape", 2, eri_prepost=True)
    p_eri_open, p_eri_no_bonus = rank3_eri_probability()
    (
        r3_mix_lower, r3_mix_upper, r3_mix_tail,
        p_eri_paired_lower, p_eri_paired_upper
    ) = rank3_joint_eri_mixture()

    r7_candidate_first = integrate(12, "candidate", "rank7_candidate_escape", 1)
    r7_candidate_second = integrate(12, "candidate", "rank7_candidate_escape", 2)
    r7_opponent_first = integrate(12, "opponent", "rank7_opponent_removal", 1)
    r7_opponent_second = integrate(12, "opponent", "rank7_opponent_removal", 2)

    r15_one_first = integrate(14, "candidate", "rank15_one_hood", 1)
    r15_one_second = integrate(14, "candidate", "rank15_one_hood", 2)
    r15_two_first = integrate(14, "candidate", "rank15_two_hoods", 1)
    r15_two_second = integrate(14, "candidate", "rank15_two_hoods", 2)

    print("Paired-mulligan-adjusted Hood resource-access sensitivity")
    print("Maximum optional bonus draws; probabilities conditional on valid opening sevens.")
    print()
    print("Rank 1 (opponent 14 Basics; Field Blower x1, Forest Seal Stone x1, Shadow Rider V x3)")
    for window, result in (("Response after one draw", r1_first), ("Response after two draws", r1_second)):
        show(f"{window}, direct Field Blower", result["direct"])
        show(f"{window}, Forest Seal Stone + V potential", result["fss"])
        show(f"{window}, combined if Star Alchemy unspent", result["combined"])
    print(f"Second Hood not Prized, conditional on first Hood not Prized: {percent(Fraction(53, 59))}")
    print(f"Both Hoods Prized in six Prizes: {percent(Fraction(1, 118))}")
    print("Rank 1 if candidate KOs on its first turn going second (Teammates/Raihan become live)")
    show("Teammates in hand and Field Blower not Prized", r1_ko["teammates"])
    show("Raihan in hand and Field Blower not Prized (Basic Energy in discard required)", r1_ko["raihan"])
    show("Either Teammates/Raihan in hand and Field Blower not Prized", r1_ko["either_supporter"])
    show("Direct Field Blower or Teammates search", r1_ko["union_teammates"])
    show("Direct Field Blower or either Supporter search (Raihan cost payable)", r1_ko["union_both"])
    print()
    print("Rank 3 (opponent 11 Basics; Eri x1)")
    show("Candidate escape, first own turn going second", r3_first)
    show("Candidate escape, second own turn, no Eri", r3_second)
    show("Candidate escape, second own turn, Eri worst-case", r3_eri)
    print(f"Eri in opening: {percent(p_eri_open)}")
    print(f"Eri by opponent first turn, no opponent bonus: {percent(p_eri_no_bonus)}")
    print(f"Eri by opponent first turn, paired-bonus adjusted: {percent(p_eri_paired_lower)} .. {percent(p_eri_paired_upper)}")
    print(f"Second-turn Eri/no-Eri mixture, joint paired model: {percent(r3_mix_lower)} .. {percent(r3_mix_upper)}")
    print()
    print("Rank 7 (opponent 12 Basics; Faba x2, Field Blower x1, Megaton Blower x1)")
    show("Candidate escape, first own turn going second", r7_candidate_first)
    show("Candidate escape, second own turn going first", r7_candidate_second)
    show("Opponent removal response, after one draw", r7_opponent_first)
    show("Opponent removal response, after two draws", r7_opponent_second)
    print()
    print("Rank 15 (opponent 14 Basics; candidate Arven x1, Hood x2)")
    show("At least one Hood, first own turn", r15_one_first)
    show("At least one Hood, second own turn", r15_one_second)
    show("Both Hoods, first own turn", r15_two_first)
    show("Both Hoods, second own turn", r15_two_second)


if __name__ == "__main__":
    main()

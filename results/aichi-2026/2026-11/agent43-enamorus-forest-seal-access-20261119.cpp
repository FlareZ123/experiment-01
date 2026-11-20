#include <algorithm>
#include <array>
#include <functional>
#include <iomanip>
#include <iostream>

using U128 = unsigned __int128;

static constexpr int N = 11;
static const std::array<int, N> C = {
    1, 2, 4, 4, 4, 1, 1, 10, 1, 1, 31
};

// 0 Enamorus V (1)
// 1 Stealthy Hood (2)
// 2 Shadow Rider Calyrex V (4)
// 3 Shadow Rider Calyrex VMAX (4)
// 4 Fog Crystal (4)
// 5 Arven (1)
// 6 Hisuian Heavy Ball (1)
// 7 other Basic Pokémon (10)
// 8 Float Stone (1)
// 9 Forest Seal Stone (1)
// 10 all other cards (31)
//
// Hypothetical 60: Enamorus replaces one non-Item Trainer. The residual
// 31 includes eleven Psychic Energy and twenty other Trainers. Forest Seal
// Stone is a Pokémon Tool, not an Item under manual B-02 despite the legacy
// Item subtype label in the card-pool metadata. Arven can fetch it as the Tool
// target only. The hypothetical 60 has 16 true Items; at most fifteen
// unavailable cards (opening 7 + 6 Prizes + 2 draws) leave at least one Item
// somewhere in deck/hand/Prizes, but the access logic below checks specific
// Fog Crystal / Heavy Ball targets rather than assuming any Item is playable.

U128 choose(int n, int k) {
    if (k < 0 || k > n) return 0;
    if (k > n - k) k = n - k;
    U128 result = 1;
    for (int i = 1; i <= k; ++i) {
        result = result * (n - k + i) / i;
    }
    return result;
}

void generate_compositions(
    int index,
    int remaining,
    const std::array<int, N>& capacities,
    std::array<int, N>& current,
    const std::function<void(const std::array<int, N>&)>& callback
) {
    if (index == N - 1) {
        if (remaining >= 0 && remaining <= capacities[index]) {
            current[index] = remaining;
            callback(current);
        }
        return;
    }

    const int limit = std::min(remaining, capacities[index]);
    for (int quantity = 0; quantity <= limit; ++quantity) {
        current[index] = quantity;
        generate_compositions(
            index + 1, remaining - quantity, capacities, current, callback
        );
    }
}

struct Totals {
    U128 valid_openings = 0;
    U128 anchor_without_star_alchemy = 0;
    U128 anchor_with_star_alchemy = 0;
    U128 core = 0;
    U128 joint_without_star_alchemy = 0;
    U128 joint_with_star_alchemy = 0;
};

struct Outcomes {
    bool anchor_without_star_alchemy;
    bool anchor_with_star_alchemy;
    bool core;
    bool joint_without_star_alchemy;
    bool joint_with_star_alchemy;
};

bool valid_opening(const std::array<int, N>& hand) {
    return hand[0] + hand[2] + hand[7] > 0;
}

Outcomes evaluate(
    const std::array<int, N>& hand,
    const std::array<int, N>& prizes,
    const std::array<int, N>& draw1,
    const std::array<int, N>& draw2,
    bool going_second
) {
    if (!valid_opening(hand)) return {false, false, false, false, false};

    const int v_by_turn1 = hand[2] + (going_second ? draw1[2] : 0);
    const int v_by_turn2 = hand[2] + draw1[2] + draw2[2];
    const int vmax_by_turn2 = hand[3] + draw1[3] + draw2[3];
    const bool core = v_by_turn1 > 0 && vmax_by_turn2 > 0;

    std::array<int, N> seen{};
    std::array<int, N> deck{};
    for (int i = 0; i < N; ++i) {
        seen[i] = hand[i] + draw1[i] + draw2[i];
        deck[i] = C[i] - hand[i] - prizes[i] - draw1[i] - draw2[i];
    }

    const bool enamorus_direct =
        seen[0] > 0 ||
        (deck[0] > 0 && seen[4] > 0) ||
        (prizes[0] > 0 && seen[6] > 0);
    const bool hood_direct = seen[1] > 0;
    const bool arven_seen = seen[5] > 0;

    // Arven can take a Tool + Item. This includes Hood + Fog Crystal
    // (Enamorus remains in deck) and Hood + Heavy Ball (Enamorus Prized).
    // Float Stone or Forest Seal Stone can fill the Tool half if Hood is
    // already in hand.
    const bool tool_remains = deck[1] + deck[8] + deck[9] > 0;
    const bool arven_dual =
        arven_seen &&
        tool_remains &&
        (
            (deck[0] > 0 && deck[4] > 0) ||
            (prizes[0] > 0 && deck[6] > 0)
        );
    const bool arven_hood = arven_seen && deck[1] > 0;

    const bool anchor_without_star_alchemy =
        (enamorus_direct || arven_dual) &&
        (hood_direct || arven_hood);

    // Forest Seal Stone's Star Alchemy can search one card, but only after
    // it is attached to a Pokémon V. A V drawn on turn 2 can be played and
    // receive the Tool that turn, so anchor-only access uses V-by-T2.
    const bool fss_in_hand = seen[9] > 0;
    const bool fss_in_deck = deck[9] > 0;
    const bool fss_fetched_by_arven = arven_seen && fss_in_deck;
    const bool fss_ready =
        (fss_in_hand || fss_fetched_by_arven) && v_by_turn2 > 0;

    const bool enamorus_target =
        deck[0] > 0 || (prizes[0] > 0 && deck[6] > 0);
    const bool hood_target = deck[1] > 0;
    const bool item_for_enamorus =
        (deck[0] > 0 && deck[4] > 0) ||
        (prizes[0] > 0 && deck[6] > 0);

    bool anchor_with_star_alchemy = anchor_without_star_alchemy;

    if (fss_ready && fss_in_hand) {
        // FSS in hand fills one missing anchor piece. Arven may fetch Hood
        // while FSS searches Enamorus / Heavy Ball.
        if (enamorus_direct && hood_target) anchor_with_star_alchemy = true;
        if ((hood_direct || arven_hood) && enamorus_target)
            anchor_with_star_alchemy = true;
    }

    if (fss_ready && fss_fetched_by_arven) {
        // Arven fetches FSS as the Tool target; FSS then finds the missing
        // piece. If neither piece is direct, the Item target is Fog Crystal
        // or Heavy Ball and FSS finds Hood.
        if (enamorus_direct && hood_target) anchor_with_star_alchemy = true;
        if (hood_direct && enamorus_target) anchor_with_star_alchemy = true;
        if (!enamorus_direct && !hood_direct &&
            hood_target && item_for_enamorus) {
            anchor_with_star_alchemy = true;
        }
    }

    return {
        anchor_without_star_alchemy,
        anchor_with_star_alchemy,
        core,
        anchor_without_star_alchemy && core,
        anchor_with_star_alchemy && core
    };
}

int main() {
    const U128 prize_ways = choose(53, 6);
    Totals first;
    Totals second;

    std::array<int, N> hand{};
    std::array<int, N> prizes{};
    std::array<int, N> draw1{};
    std::array<int, N> draw2{};

    generate_compositions(
        0, 7, C, hand,
        [&](const std::array<int, N>& opening) {
            if (!valid_opening(opening)) return;

            U128 hand_ways = 1;
            for (int i = 0; i < N; ++i) {
                hand_ways *= choose(C[i], opening[i]);
            }

            first.valid_openings += hand_ways;
            second.valid_openings += hand_ways;

            std::array<int, N> after_hand{};
            for (int i = 0; i < N; ++i) {
                after_hand[i] = C[i] - opening[i];
            }

            generate_compositions(
                0, 6, after_hand, prizes,
                [&](const std::array<int, N>& prize_cards) {
                    U128 prize_ways_for_state = 1;
                    std::array<int, N> after_prizes{};

                    for (int i = 0; i < N; ++i) {
                        prize_ways_for_state *=
                            choose(after_hand[i], prize_cards[i]);
                        after_prizes[i] = after_hand[i] - prize_cards[i];
                    }
                    if (prize_ways_for_state == 0) return;

                    // Going first: no own-turn-1 draw; one own-turn-2 draw.
                    for (int i = 0; i < N; ++i) {
                        if (after_prizes[i] == 0) continue;

                        draw1.fill(0);
                        draw2.fill(0);
                        draw1[i] = 1;

                        const U128 ways =
                            hand_ways * prize_ways_for_state *
                            static_cast<U128>(after_prizes[i]);

                        const Outcomes outcome = evaluate(
                            opening, prize_cards, draw1, draw2, false
                        );

                        if (outcome.anchor_without_star_alchemy)
                            first.anchor_without_star_alchemy += ways;
                        if (outcome.anchor_with_star_alchemy)
                            first.anchor_with_star_alchemy += ways;
                        if (outcome.core) first.core += ways;
                        if (outcome.joint_without_star_alchemy)
                            first.joint_without_star_alchemy += ways;
                        if (outcome.joint_with_star_alchemy)
                            first.joint_with_star_alchemy += ways;
                    }

                    // Going second: one own-turn-1 draw and one own-turn-2 draw.
                    for (int i = 0; i < N; ++i) {
                        if (after_prizes[i] == 0) continue;

                        draw1.fill(0);
                        draw2.fill(0);
                        draw1[i] = 1;

                        for (int j = 0; j < N; ++j) {
                            const int second_available =
                                after_prizes[j] - (i == j ? 1 : 0);
                            if (second_available <= 0) continue;

                            draw2.fill(0);
                            draw2[j] = 1;

                            const U128 ways =
                                hand_ways * prize_ways_for_state *
                                static_cast<U128>(after_prizes[i]) *
                                static_cast<U128>(second_available);

                            const Outcomes outcome = evaluate(
                                opening, prize_cards, draw1, draw2, true
                            );

                            if (outcome.anchor_without_star_alchemy)
                                second.anchor_without_star_alchemy += ways;
                            if (outcome.anchor_with_star_alchemy)
                                second.anchor_with_star_alchemy += ways;
                            if (outcome.core) second.core += ways;
                            if (outcome.joint_without_star_alchemy)
                                second.joint_without_star_alchemy += ways;
                            if (outcome.joint_with_star_alchemy)
                                second.joint_with_star_alchemy += ways;
                        }
                    }
                }
            );
        }
    );

    const U128 first_denominator =
        first.valid_openings * prize_ways * 47;
    const U128 second_denominator =
        second.valid_openings * prize_ways * 47 * 46;

    auto print_rate = [](const char* label, U128 numerator, U128 denominator) {
        const long double rate =
            static_cast<long double>(numerator) /
            static_cast<long double>(denominator);
        std::cout << label << "=" << std::setprecision(12)
                  << static_cast<double>(rate) << "\n";
    };

    const long double valid_probability =
        static_cast<long double>(first.valid_openings) /
        static_cast<long double>(choose(60, 7));

    std::cout << std::setprecision(12)
              << "valid_opening_probability="
              << static_cast<double>(valid_probability) << "\n";

    print_rate("anchor_without_star_alchemy_going_first",
               first.anchor_without_star_alchemy, first_denominator);
    print_rate("anchor_without_star_alchemy_going_second",
               second.anchor_without_star_alchemy, second_denominator);
    print_rate("anchor_with_star_alchemy_going_first",
               first.anchor_with_star_alchemy, first_denominator);
    print_rate("anchor_with_star_alchemy_going_second",
               second.anchor_with_star_alchemy, second_denominator);
    print_rate("core_V_by_T1_and_VMAX_by_T2_going_first",
               first.core, first_denominator);
    print_rate("core_V_by_T1_and_VMAX_by_T2_going_second",
               second.core, second_denominator);
    print_rate("joint_without_star_alchemy_going_first",
               first.joint_without_star_alchemy, first_denominator);
    print_rate("joint_without_star_alchemy_going_second",
               second.joint_without_star_alchemy, second_denominator);
    print_rate("joint_with_star_alchemy_going_first",
               first.joint_with_star_alchemy, first_denominator);
    print_rate("joint_with_star_alchemy_going_second",
               second.joint_with_star_alchemy, second_denominator);
}

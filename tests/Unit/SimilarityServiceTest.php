<?php

namespace Tests\Unit;

use App\Services\SimilarityService;
use PHPUnit\Framework\TestCase;

class SimilarityServiceTest extends TestCase
{
    protected SimilarityService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new SimilarityService();
    }

    // =========================================================================
    // Core cosine similarity behavior
    // =========================================================================

    public function test_identical_vectors_returns_similarity_of_one(): void
    {
        $result = $this->service->calculateCosine([1, 2, 3], [1, 2, 3]);

        $this->assertEqualsWithDelta(1.0, $result, 0.0001);
    }

    public function test_orthogonal_vectors_returns_similarity_of_zero(): void
    {
        $result = $this->service->calculateCosine([1, 0], [0, 1]);

        $this->assertEqualsWithDelta(0.0, $result, 0.0001);
    }

    public function test_opposite_direction_vectors_returns_similarity_of_negative_one(): void
    {
        $result = $this->service->calculateCosine([1, 2], [-1, -2]);

        $this->assertEqualsWithDelta(-1.0, $result, 0.0001);
    }

    public function test_calculates_correct_similarity_for_general_vectors(): void
    {
        // dot = 3*4 + 4*3 = 24; norm1 = norm2 = 5; cosine = 24/25 = 0.96
        $result = $this->service->calculateCosine([3, 4], [4, 3]);

        $this->assertEqualsWithDelta(0.96, $result, 0.0001);
    }

    public function test_calculates_correct_similarity_for_vectors_with_three_dimensions(): void
    {
        // dot = 1*4 + 2*5 + 3*6 = 32
        // norm1 = sqrt(1+4+9) = sqrt(14)
        // norm2 = sqrt(16+25+36) = sqrt(77)
        // cosine = 32 / (sqrt(14) * sqrt(77))
        $expected = 32 / (sqrt(14) * sqrt(77));

        $result = $this->service->calculateCosine([1, 2, 3], [4, 5, 6]);

        $this->assertEqualsWithDelta($expected, $result, 0.0001);
    }

    // =========================================================================
    // Zero-vector edge cases (division by zero guard)
    // =========================================================================

    public function test_returns_zero_when_first_vector_is_all_zeros(): void
    {
        $result = $this->service->calculateCosine([0, 0, 0], [1, 2, 3]);

        $this->assertEquals(0.0, $result);
    }

    public function test_returns_zero_when_second_vector_is_all_zeros(): void
    {
        $result = $this->service->calculateCosine([1, 2, 3], [0, 0, 0]);

        $this->assertEquals(0.0, $result);
    }

    public function test_returns_zero_when_both_vectors_are_all_zeros(): void
    {
        $result = $this->service->calculateCosine([0, 0], [0, 0]);

        $this->assertEquals(0.0, $result);
    }

    public function test_returns_zero_when_both_vectors_are_empty(): void
    {
        $result = $this->service->calculateCosine([], []);

        $this->assertEquals(0.0, $result);
    }

    public function test_returns_zero_when_first_vector_is_empty(): void
    {
        $result = $this->service->calculateCosine([], [1, 2, 3]);

        $this->assertEquals(0.0, $result);
    }

    // =========================================================================
    // Mismatched vector lengths
    // =========================================================================

    public function test_treats_missing_indices_in_shorter_second_vector_as_zero(): void
    {
        // vec2 is missing index 2, so it's treated as 0 there.
        // dot = 1*1 + 2*2 + 3*0 = 5
        // norm1 = sqrt(1+4+9) = sqrt(14)
        // norm2 = sqrt(1+4+0) = sqrt(5)   <- only computed over vec1's keys
        $expected = 5 / (sqrt(14) * sqrt(5));

        $result = $this->service->calculateCosine([1, 2, 3], [1, 2]);

        $this->assertEqualsWithDelta($expected, $result, 0.0001);
    }

    public function test_ignores_extra_elements_in_second_vector_beyond_first_vectors_keys(): void
    {
        // vec2 has an extra element at index 2 that vec1 doesn't have; since
        // the loop iterates over vec1's keys only, that extra value never
        // participates in the calculation.
        $result = $this->service->calculateCosine([1, 2], [1, 2, 100]);

        $this->assertEqualsWithDelta(1.0, $result, 0.0001);
    }

    // =========================================================================
    // Negative values
    // =========================================================================

    public function test_handles_mixed_sign_vectors_correctly(): void
    {
        // dot = 1*-1 + -1*1 = -2; norm1 = norm2 = sqrt(2); cosine = -2/2 = -1
        $result = $this->service->calculateCosine([1, -1], [-1, 1]);

        $this->assertEqualsWithDelta(-1.0, $result, 0.0001);
    }

    public function test_handles_both_vectors_fully_negative_as_identical_direction(): void
    {
        // Both vectors point in the same (negative) direction, so similarity is 1.
        $result = $this->service->calculateCosine([-1, -2, -3], [-1, -2, -3]);

        $this->assertEqualsWithDelta(1.0, $result, 0.0001);
    }

    // =========================================================================
    // Single-element vectors
    // =========================================================================

    public function test_single_element_vectors_pointing_same_direction(): void
    {
        $result = $this->service->calculateCosine([5], [5]);

        $this->assertEqualsWithDelta(1.0, $result, 0.0001);
    }

    public function test_single_element_vectors_pointing_opposite_directions(): void
    {
        $result = $this->service->calculateCosine([5], [-5]);

        $this->assertEqualsWithDelta(-1.0, $result, 0.0001);
    }

    // =========================================================================
    // Symmetry property: cosine(a, b) should equal cosine(b, a) when both
    // vectors share the same set of keys.
    // =========================================================================

    public function test_similarity_is_symmetric_for_equal_length_vectors(): void
    {
        $forward = $this->service->calculateCosine([1, 2, 3], [4, 5, 6]);
        $reverse = $this->service->calculateCosine([4, 5, 6], [1, 2, 3]);

        $this->assertEqualsWithDelta($forward, $reverse, 0.0001);
    }

    // =========================================================================
    // Associative (string-keyed) arrays
    // =========================================================================

    public function test_supports_associative_arrays_with_matching_string_keys(): void
    {
        $vec1 = ['dim_a' => 1, 'dim_b' => 2, 'dim_c' => 3];
        $vec2 = ['dim_a' => 1, 'dim_b' => 2, 'dim_c' => 3];

        $result = $this->service->calculateCosine($vec1, $vec2);

        $this->assertEqualsWithDelta(1.0, $result, 0.0001);
    }

    public function test_supports_associative_arrays_with_partially_missing_keys(): void
    {
        $vec1 = ['dim_a' => 1, 'dim_b' => 2];
        $vec2 = ['dim_a' => 1]; // dim_b missing, treated as 0

        $expected = 1 / (sqrt(5) * sqrt(1));

        $result = $this->service->calculateCosine($vec1, $vec2);

        $this->assertEqualsWithDelta($expected, $result, 0.0001);
    }

    // =========================================================================
    // Floating point input values
    // =========================================================================

    public function test_handles_float_values_correctly(): void
    {
        $result = $this->service->calculateCosine([1.5, 2.5], [1.5, 2.5]);

        $this->assertEqualsWithDelta(1.0, $result, 0.0001);
    }

    // =========================================================================
    // Return type
    // =========================================================================

    public function test_return_value_is_always_a_float(): void
    {
        $result = $this->service->calculateCosine([1, 2], [3, 4]);

        $this->assertIsFloat($result);
    }

    public function test_return_value_is_float_even_for_zero_vector_shortcut(): void
    {
        $result = $this->service->calculateCosine([0, 0], [1, 2]);

        $this->assertIsFloat($result);
    }
}
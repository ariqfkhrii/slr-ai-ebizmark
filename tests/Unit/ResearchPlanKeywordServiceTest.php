<?php

namespace Tests\Unit;

use App\Models\Keyword;
use App\Models\ResearchPlan;
use App\Models\User;
use App\Services\ResearchPlanKeyword\ResearchPlanKeywordService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

class ResearchPlanKeywordServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ResearchPlanKeywordService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ResearchPlanKeywordService(); 
    }

    public function test_it_passes_when_user_owns_the_research_plan()
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create([
            'user_id' => $user->id
        ]);

        $this->expectNotToPerformAssertions(); 

        $this->service->checkOwnership($user->id, $plan->research_plan_id);
    }

    public function test_it_throws_exception_when_user_does_not_own_the_research_plan()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        $plan = ResearchPlan::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $this->expectException(AuthorizationException::class);

        $this->service->checkOwnership($user->id, $plan->research_plan_id);
    }

    public function test_it_throws_exception_when_research_plan_does_not_exist()
    {
        $user = User::factory()->create();

        $this->expectException(AuthorizationException::class);

        $this->service->checkOwnership($user->id, 999);
    }

    public function test_it_gets_keywords_by_research_plan()
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create([
            'user_id' => $user->id
        ]);

        $keyword1 = Keyword::factory()->create([
            'keyword' => 'Laravel'
        ]);
        
        $keyword2 = Keyword::factory()->create([
            'keyword' => 'PHPUnit'
        ]);

        $plan->keywords()->attach([
            $keyword1->id => ['article_count' => 10],
            $keyword2->id => ['article_count' => 5],
        ]);

        $result = $this->service->getKeywordsByResearchPlan($user->id, $plan->research_plan_id);

        $this->assertCount(2, $result);
        
        $this->assertEquals($keyword1->id, $result[0]['id']);
        $this->assertEquals('Laravel', $result[0]['name']);
        $this->assertEquals(10, $result[0]['article_count']);

        $this->assertEquals($keyword2->id, $result[1]['id']);
        $this->assertEquals('PHPUnit', $result[1]['name']);
        $this->assertEquals(5, $result[1]['article_count']);
    }

    public function test_it_attaches_a_new_keyword_to_research_plan()
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create([
            'user_id' => $user->id
        ]);

        $result = $this->service->attachKeywordToResearchPlan($user->id, $plan->research_plan_id, 'New Keyword');

        $this->assertInstanceOf(Keyword::class, $result);
        $this->assertEquals('New Keyword', $result->keyword);
        $this->assertDatabaseHas('keywords', [
            'keyword' => 'New Keyword'
        ]);
        $this->assertTrue($plan->keywords()->where('keywords.id', $result->id)->exists());
    }

    public function test_it_attaches_an_existing_keyword_to_research_plan()
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create([
            'user_id' => $user->id
        ]);
        
        $existingKeyword = Keyword::factory()->create([
            'keyword' => 'Existing Keyword'
        ]);

        $result = $this->service->attachKeywordToResearchPlan($user->id, $plan->research_plan_id, 'Existing Keyword');

        $this->assertEquals($existingKeyword->id, $result->id);
        $this->assertEquals(1, Keyword::where('keyword', 'Existing Keyword')->count());
        $this->assertTrue($plan->keywords()->where('keywords.id', $existingKeyword->id)->exists());
    }

    public function test_it_updates_keyword_by_replacing_with_a_new_keyword()
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create([
            'user_id' => $user->id
        ]);
        
        $oldKeyword = Keyword::factory()->create([
            'keyword' => 'Old Keyword'
        ]);

        $plan->keywords()->attach($oldKeyword->id);

        $result = $this->service->updateKeywordForResearchPlan($user->id, $plan->research_plan_id, $oldKeyword->id, 'Updated Keyword');

        $this->assertInstanceOf(Keyword::class, $result);
        $this->assertEquals('Updated Keyword', $result->keyword);
        $this->assertFalse($plan->keywords()->where('keywords.id', $oldKeyword->id)->exists());
        $this->assertTrue($plan->keywords()->where('keywords.id', $result->id)->exists());
    }

    public function test_it_updates_keyword_by_replacing_with_an_existing_keyword()
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create([
            'user_id' => $user->id
        ]);
        
        $oldKeyword = Keyword::factory()->create([
            'keyword' => 'Old Keyword'
        ]);

        $existingKeyword = Keyword::factory()->create([
            'keyword' => 'Target Keyword'
        ]);

        $plan->keywords()->attach($oldKeyword->id);

        $result = $this->service->updateKeywordForResearchPlan($user->id, $plan->research_plan_id, $oldKeyword->id, 'Target Keyword');

        $this->assertEquals($existingKeyword->id, $result->id);
        $this->assertFalse($plan->keywords()->where('keywords.id', $oldKeyword->id)->exists());
        $this->assertTrue($plan->keywords()->where('keywords.id', $existingKeyword->id)->exists());
    }

    public function test_it_detaches_a_keyword_from_research_plan()
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create([
            'user_id' => $user->id
        ]);
        
        $keyword = Keyword::factory()->create();

        $plan->keywords()->attach($keyword->id);

        $this->service->detachKeywordFromResearchPlan($user->id, $plan->research_plan_id, $keyword->id);

        $this->assertFalse($plan->keywords()->where('keywords.id', $keyword->id)->exists());
    }

    public function test_it_aborts_404_when_detaching_non_existent_keyword()
    {
        $user = User::factory()->create();
        $plan = ResearchPlan::factory()->create([
            'user_id' => $user->id
        ]);

        $this->expectException(NotFoundHttpException::class);

        $this->service->detachKeywordFromResearchPlan($user->id, $plan->research_plan_id, 999);
    }
}

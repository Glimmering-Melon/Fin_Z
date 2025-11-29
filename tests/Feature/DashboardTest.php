<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DashboardTest extends TestCase
{
    /**
     * Test dashboard page loads successfully
     */
    public function test_dashboard_page_loads(): void
    {
        $response = $this->get('/dashboard');

        $response->assertStatus(200);
    }

    /**
     * Test dashboard returns market overview data
     */
    public function test_dashboard_returns_market_overview(): void
    {
        $response = $this->get('/dashboard');

        $response->assertStatus(200);
        
        // Check that Inertia props contain marketOverview
        $page = $response->viewData('page');
        $props = $page['props'];
        
        $this->assertArrayHasKey('marketOverview', $props);
        $this->assertIsArray($props['marketOverview']);
        $this->assertCount(3, $props['marketOverview']); // VN-Index, HNX-Index, UPCOM
    }

    /**
     * Test market overview data structure
     */
    public function test_market_overview_data_structure(): void
    {
        $response = $this->get('/dashboard');
        
        $page = $response->viewData('page');
        $marketOverview = $page['props']['marketOverview'];
        
        foreach ($marketOverview as $market) {
            $this->assertArrayHasKey('index', $market);
            $this->assertArrayHasKey('value', $market);
            $this->assertArrayHasKey('change', $market);
            $this->assertArrayHasKey('percentChange', $market);
            $this->assertArrayHasKey('volume', $market);
            $this->assertArrayHasKey('lastUpdated', $market);
        }
    }
}

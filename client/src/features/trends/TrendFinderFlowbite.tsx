'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  TextInput, 
  Select, 
  Badge, 
  Modal,
  Label,
  Spinner,
  Progress
} from 'flowbite-react';
import {
  HiSearch,
  HiTrendingUp,
  HiTrendingDown,
  HiBookmark,
  HiOutlineBookmark,
  HiDownload,
  HiRefresh,
  HiPlus,
  HiBell,
  HiFilter,
  HiChartBar,
  HiClock,
  HiFire,
  HiLightningBolt,
  HiStar
} from 'react-icons/hi';
import { useToast } from '@/core/providers/ToastProvider';

interface Trend {
  id: string;
  name: string;
  category: string;
  score: number;
  change: number;
  volume: number;
  competition: 'low' | 'medium' | 'high';
  opportunity: number;
  timeframe: string;
  saved?: boolean;
}

export default function TrendFinderFlowbite() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [competitionFilter, setCompetitionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockTrends: Trend[] = [
        {
          id: '1',
          name: 'Smart Home Devices',
          category: 'Technology',
          score: 95,
          change: 45,
          volume: 125000,
          competition: 'medium',
          opportunity: 88,
          timeframe: '7 days',
          saved: false,
        },
        {
          id: '2',
          name: 'Sustainable Fashion',
          category: 'Fashion',
          score: 92,
          change: 38,
          volume: 98000,
          competition: 'low',
          opportunity: 92,
          timeframe: '7 days',
          saved: true,
        },
        {
          id: '3',
          name: 'Fitness Trackers',
          category: 'Health',
          score: 88,
          change: 25,
          volume: 156000,
          competition: 'high',
          opportunity: 65,
          timeframe: '7 days',
          saved: false,
        },
        {
          id: '4',
          name: 'Plant-Based Protein',
          category: 'Food',
          score: 85,
          change: 52,
          volume: 87000,
          competition: 'low',
          opportunity: 85,
          timeframe: '7 days',
          saved: false,
        },
        {
          id: '5',
          name: 'Gaming Chairs',
          category: 'Gaming',
          score: 82,
          change: 18,
          volume: 112000,
          competition: 'medium',
          opportunity: 72,
          timeframe: '7 days',
          saved: false,
        },
        {
          id: '6',
          name: 'Wireless Earbuds',
          category: 'Technology',
          score: 80,
          change: -5,
          volume: 245000,
          competition: 'high',
          opportunity: 58,
          timeframe: '7 days',
          saved: true,
        },
      ];
      setTrends(mockTrends);
    } catch (error) {
      showError('Failed to load trends');
    } finally {
      setLoading(false);
    }
  };

  // Filtering and sorting
  const filteredTrends = trends
    .filter((trend) => {
      const matchesSearch = trend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trend.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || trend.category === categoryFilter;
      const matchesCompetition = competitionFilter === 'all' || trend.competition === competitionFilter;
      return matchesSearch && matchesCategory && matchesCompetition;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'change':
          return b.change - a.change;
        case 'volume':
          return b.volume - a.volume;
        case 'opportunity':
          return b.opportunity - a.opportunity;
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(trends.map(t => t.category)));

  const handleSaveTrend = (trend: Trend) => {
    setTrends(prev =>
      prev.map(t => t.id === trend.id ? { ...t, saved: !t.saved } : t)
    );
    success(trend.saved ? 'Trend removed from saved' : 'Trend saved');
  };

  const handleViewDetails = (trend: Trend) => {
    setSelectedTrend(trend);
    setDetailsOpen(true);
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'failure';
      default: return 'gray';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading && trends.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" className="fill-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="trend-finder-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" data-testid="trend-finder-header">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" data-testid="trend-finder-title">
            Trend Finder
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mt-1" data-testid="trend-finder-subtitle">
            Discover trending products and opportunities
          </p>
        </div>
        <div className="flex gap-2" data-testid="trend-finder-actions">
          <Button onClick={fetchTrends} color="gray" disabled={loading} data-testid="refresh-trends-button">
            {loading ? <Spinner size="sm" data-testid="refresh-spinner" /> : <HiRefresh className="h-5 w-5" />}
          </Button>
          <Button className="bg-linear-to-r from-purple-600 to-blue-600" data-testid="set-alert-button">
            <HiBell className="mr-2 h-5 w-5" />
            Set Alert
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card data-testid="trend-filters-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <TextInput
              icon={HiSearch}
              placeholder="Search trends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-trends-input"
            />
          </div>
          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              data-testid="category-filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
              data-testid="competition-filter-select"
            >
              <option value="all">All Competition</option>
              <option value="low">Low Competition</option>
              <option value="medium">Medium Competition</option>
              <option value="high">High Competition</option>
            </Select>
          </div>
          <div>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              data-testid="sort-by-select"
            >
              <option value="score">Sort by Score</option>
              <option value="change">Sort by Change</option>
              <option value="volume">Sort by Volume</option>
              <option value="opportunity">Sort by Opportunity</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between" data-testid="trend-results-header">
        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="trends-count">
          Showing {filteredTrends.length} trends
        </p>
        <div className="flex gap-2">
          <Badge color="purple" size="lg" data-testid="saved-trends-badge">
            {trends.filter(t => t.saved).length} saved
          </Badge>
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="trends-grid">
        {filteredTrends.map((trend) => (
          <Card key={trend.id} className="hover:shadow-lg transition-shadow" data-testid={`trend-card-${trend.id}`}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {trend.change > 0 ? (
                      <HiTrendingUp className="h-5 w-5 text-green-600" data-testid={`trend-icon-up-${trend.id}`} />
                    ) : (
                      <HiTrendingDown className="h-5 w-5 text-red-600" data-testid={`trend-icon-down-${trend.id}`} />
                    )}
                    <h3 className="font-semibold text-lg line-clamp-1" data-testid={`trend-name-${trend.id}`}>{trend.name}</h3>
                  </div>
                  <Badge color="info" size="sm" data-testid={`trend-category-${trend.id}`}>{trend.category}</Badge>
                </div>
                <button
                  onClick={() => handleSaveTrend(trend)}
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                  data-testid={`save-trend-button-${trend.id}`}
                >
                  {trend.saved ? (
                    <HiBookmark className="h-6 w-6 text-purple-600" />
                  ) : (
                    <HiOutlineBookmark className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Trend Score */}
              <div className="bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4" data-testid={`trend-score-panel-${trend.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trend Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(trend.score)}`} data-testid={`trend-score-value-${trend.id}`}>
                    {trend.score}
                  </span>
                </div>
                <Progress
                  progress={trend.score}
                  size="lg"
                  color={trend.score >= 90 ? 'green' : trend.score >= 75 ? 'blue' : 'yellow'}
                  data-testid={`trend-score-progress-${trend.id}`}
                />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3" data-testid={`trend-change-${trend.id}`}>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Change</div>
                  <div className={`text-lg font-bold ${trend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3" data-testid={`trend-volume-${trend.id}`}>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Volume</div>
                  <div className="text-lg font-bold text-purple-600">
                    {(trend.volume / 1000).toFixed(0)}K
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Competition</div>
                  <div className="mt-1">
                    <Badge color={getCompetitionColor(trend.competition)} size="sm">
                      {trend.competition}
                    </Badge>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Opportunity</div>
                  <div className="text-lg font-bold text-blue-600">
                    {trend.opportunity}%
                  </div>
                </div>
              </div>

              {/* Timeframe */}
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <HiClock className="h-4 w-4" />
                  {trend.timeframe}
                </div>
                <Button size="xs" onClick={() => handleViewDetails(trend)}>
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Top Opportunities Banner */}
      <Card className="bg-linear-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-lg">
            <HiFire className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Top Opportunities</h3>
            <p className="text-white/90">
              {filteredTrends.filter(t => t.opportunity >= 85).length} high-opportunity trends found
            </p>
          </div>
          <Button color="light">
            Explore All
          </Button>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal show={detailsOpen} onClose={() => setDetailsOpen(false)} size="2xl">
        {selectedTrend && (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedTrend.name}</h2>
                <Badge color="info">{selectedTrend.category}</Badge>
              </div>
              <button
                onClick={() => handleSaveTrend(selectedTrend)}
                className="text-gray-400 hover:text-purple-600 transition-colors"
              >
                {selectedTrend.saved ? (
                  <HiBookmark className="h-8 w-8 text-purple-600" />
                ) : (
                  <HiOutlineBookmark className="h-8 w-8" />
                )}
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Main Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Trend Score</div>
                    <div className={`text-3xl font-bold mt-2 ${getScoreColor(selectedTrend.score)}`}>
                      {selectedTrend.score}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Change</div>
                    <div className={`text-3xl font-bold mt-2 ${selectedTrend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTrend.change > 0 ? '+' : ''}{selectedTrend.change}%
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                    <div className="text-3xl font-bold text-purple-600 mt-2">
                      {selectedTrend.volume.toLocaleString()}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Opportunity</div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                      {selectedTrend.opportunity}%
                    </div>
                  </div>
                </Card>
              </div>

              {/* Competition Level */}
              <div>
                <Label>Competition Level</Label>
                <div className="mt-2">
                  <Badge color={getCompetitionColor(selectedTrend.competition)} size="lg">
                    {selectedTrend.competition.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 p-4 rounded">
                <div className="flex items-start gap-3">
                  <HiLightningBolt className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Recommendation</h3>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                      This trend shows strong growth potential with {selectedTrend.competition} competition. 
                      {selectedTrend.opportunity >= 85 && " Highly recommended for immediate action."}
                      {selectedTrend.change > 30 && " Experiencing rapid growth - act fast to capitalize."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <HiChartBar className="h-16 w-16 mx-auto text-purple-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Trend chart visualization</p>
                    <p className="text-sm text-gray-500 mt-1">Historical data for {selectedTrend.timeframe}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button color="gray" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
              <Button className="bg-linear-to-r from-purple-600 to-blue-600">
                <HiPlus className="mr-2 h-5 w-5" />
                Create Campaign
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

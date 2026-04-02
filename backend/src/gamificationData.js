export const LEVEL_THRESHOLDS = [0, 100, 500, 1500, 3000, 6000, 11000, 18000, 27000, 40000]

export const BADGE_DEFINITIONS = [
  { id: 'first-test', name: 'First Test', icon: 'Sparkles', description: 'Generated your first test suite.', rarity: 'common' },
  { id: 'test-fifty', name: 'Test Fifty', icon: 'FlaskConical', description: 'Generated 50 test suites.', rarity: 'uncommon' },
  { id: 'test-century', name: 'Test Century', icon: 'Atom', description: 'Generated 100 test suites.', rarity: 'rare' },
  { id: 'quality-champion', name: 'Quality Champion', icon: 'Gem', description: 'Hit 95+ quality on a generation.', rarity: 'rare' },
  { id: 'quality-architect', name: 'Quality Architect', icon: 'ShieldCheck', description: 'Maintained a 90+ average quality score.', rarity: 'epic' },
  { id: 'framework-master', name: 'Framework Master', icon: 'Layers3', description: 'Used all supported frameworks repeatedly.', rarity: 'epic' },
  { id: 'consistency-warrior', name: 'Consistency Warrior', icon: 'Flame', description: 'Reached a 30-day generation streak.', rarity: 'legendary' },
  { id: 'seven-day-streak', name: '7 Day Streak', icon: 'CalendarDays', description: 'Generated tests 7 days in a row.', rarity: 'uncommon' },
  { id: 'healing-hand', name: 'Healing Hand', icon: 'WandSparkles', description: 'Used self-heal 10 times.', rarity: 'uncommon' },
  { id: 'ci-captain', name: 'CI Captain', icon: 'Workflow', description: 'Exported CI workflows 10 times.', rarity: 'uncommon' },
  { id: 'code-librarian', name: 'Code Librarian', icon: 'LibraryBig', description: 'Uploaded your first contribution.', rarity: 'common' },
  { id: 'community-leader', name: 'Community Leader', icon: 'Users', description: 'Maintained top-rated contributions.', rarity: 'epic' },
  { id: 'top-contributor', name: 'Top Contributor', icon: 'TrendingUp', description: 'Reached 50 contribution downloads.', rarity: 'rare' },
  { id: 'snippet-smith', name: 'Snippet Smith', icon: 'Code2', description: 'Uploaded 5 code snippets.', rarity: 'uncommon' },
  { id: 'prompt-smith', name: 'Prompt Smith', icon: 'MessageSquareCode', description: 'Uploaded 5 prompts.', rarity: 'uncommon' },
  { id: 'template-forger', name: 'Template Forger', icon: 'FileCode2', description: 'Uploaded 5 templates.', rarity: 'uncommon' },
  { id: 'pattern-seer', name: 'Pattern Seer', icon: 'Binary', description: 'Uploaded 5 patterns.', rarity: 'rare' },
  { id: 'ci-whisperer', name: 'CI Whisperer', icon: 'GitBranch', description: 'Uploaded 5 CI configs.', rarity: 'rare' },
  { id: 'download-magnet', name: 'Download Magnet', icon: 'Download', description: 'Received 100 downloads across contributions.', rarity: 'epic' },
  { id: 'review-star', name: 'Review Star', icon: 'Star', description: 'Received a 5-star contribution rating.', rarity: 'common' },
  { id: 'integration-ace', name: 'Integration Ace', icon: 'PlugZap', description: 'Generated 25 integration suites.', rarity: 'rare' },
  { id: 'system-savant', name: 'System Savant', icon: 'ServerCog', description: 'Generated 10 system suites.', rarity: 'rare' },
  { id: 'acceptance-navigator', name: 'Acceptance Navigator', icon: 'Map', description: 'Generated 15 acceptance suites.', rarity: 'rare' },
  { id: 'unit-specialist', name: 'Unit Specialist', icon: 'Blocks', description: 'Generated 25 unit suites.', rarity: 'uncommon' },
  { id: 'weekly-winner', name: 'Weekly Winner', icon: 'Trophy', description: 'Finished #1 on a weekly leaderboard.', rarity: 'legendary' },
]

export const DAILY_CHALLENGE_TEMPLATES = [
  { id: 'daily-generate-3', title: 'Generate 3 Suites', description: 'Generate three test suites today.', difficulty: 'easy', action: 'generate-tests', target: 3, xpReward: 40 },
  { id: 'daily-quality-90', title: 'Quality Sprint', description: 'Achieve one quality score of 90 or above.', difficulty: 'medium', action: 'quality-threshold', target: 1, threshold: 90, xpReward: 60, badgeReward: 'quality-champion' },
  { id: 'daily-framework-mix', title: 'Framework Mix', description: 'Use two different test frameworks today.', difficulty: 'medium', action: 'framework-variety', target: 2, xpReward: 55 },
]

export const WEEKLY_CHALLENGE_TEMPLATES = [
  { id: 'weekly-generate-12', title: 'Weekly Builder', description: 'Generate 12 test suites this week.', difficulty: 'medium', action: 'generate-tests', target: 12, xpReward: 150 },
  { id: 'weekly-heal-5', title: 'Bug Fix Relay', description: 'Heal five failing tests this week.', difficulty: 'medium', action: 'heal-tests', target: 5, xpReward: 120 },
  { id: 'weekly-export-3', title: 'Pipeline Pro', description: 'Export three CI workflows this week.', difficulty: 'hard', action: 'ci-export', target: 3, xpReward: 180, badgeReward: 'ci-captain' },
]

import { query } from './db.js'

export async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(30) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS testgen_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      input_type VARCHAR(20) NOT NULL,
      test_mode VARCHAR(20) NOT NULL,
      raw_input TEXT NOT NULL,
      provider VARCHAR(20) NOT NULL DEFAULT 'mock',
      generated_pytest TEXT NOT NULL DEFAULT '',
      generated_junit TEXT NOT NULL DEFAULT '',
      generated_jest TEXT NOT NULL DEFAULT '',
      scores JSONB,
      quality_score INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS user_gamification (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      current_xp INTEGER NOT NULL DEFAULT 0,
      total_xp_earned INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      badges JSONB NOT NULL DEFAULT '[]'::jsonb,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_generation_date TIMESTAMPTZ,
      streak_calendar JSONB NOT NULL DEFAULT '[]'::jsonb,
      stats JSONB NOT NULL DEFAULT '{
        "totalTestsGenerated": 0,
        "avgQualityScore": 0,
        "frameworkUsage": { "pytest": 0, "junit": 0, "jest": 0, "custom": 0 },
        "avgGenerationTime": 0,
        "totalCIExports": 0,
        "contributions": 0,
        "downloads": 0
      }'::jsonb,
      theme VARCHAR(20) NOT NULL DEFAULT 'default',
      leaderboard_rank JSONB NOT NULL DEFAULT '{"global": null, "weekly": null, "contributor": null, "team": null}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id VARCHAR(80) PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id VARCHAR(80),
      type VARCHAR(20) NOT NULL,
      title VARCHAR(120) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      difficulty VARCHAR(20) NOT NULL DEFAULT 'easy',
      action VARCHAR(50),
      requirement_action VARCHAR(50) NOT NULL,
      target_value INTEGER,
      requirement_value INTEGER NOT NULL DEFAULT 0,
      threshold_value INTEGER,
      xp_reward INTEGER NOT NULL DEFAULT 0,
      badge_reward VARCHAR(80),
      progress_value INTEGER,
      progress_current INTEGER NOT NULL DEFAULT 0,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at TIMESTAMPTZ,
      claimed BOOLEAN NOT NULL DEFAULT FALSE,
      claimed_at TIMESTAMPTZ,
      resets_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await query(`ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS challenge_id VARCHAR(80);`)
  await query(`ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS action VARCHAR(50);`)
  await query(`ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS target_value INTEGER;`)
  await query(`ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS threshold_value INTEGER;`)
  await query(`ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS progress_value INTEGER;`)
  await query(`ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;`)
  await query(`ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`)
  await query(`UPDATE user_challenges SET challenge_id = COALESCE(challenge_id, id);`)
  await query(`UPDATE user_challenges SET action = COALESCE(action, requirement_action);`)
  await query(`UPDATE user_challenges SET target_value = COALESCE(target_value, requirement_value);`)
  await query(`UPDATE user_challenges SET progress_value = COALESCE(progress_value, progress_current);`)
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_challenges_user_id_challenge_id_key'
      ) THEN
        ALTER TABLE user_challenges
        ADD CONSTRAINT user_challenges_user_id_challenge_id_key UNIQUE (user_id, challenge_id);
      END IF;
    END
    $$;
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS contributions (
      id SERIAL PRIMARY KEY,
      contributor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES contributions(id) ON DELETE SET NULL,
      type VARCHAR(30) NOT NULL,
      title VARCHAR(140) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      language VARCHAR(40),
      framework VARCHAR(40),
      difficulty VARCHAR(20) NOT NULL DEFAULT 'intermediate',
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      category VARCHAR(80),
      stats JSONB NOT NULL DEFAULT '{
        "downloads": 0,
        "forks": 0,
        "views": 0,
        "rating": 0,
        "ratingCount": 0,
        "uses": 0
      }'::jsonb,
      xp_awarded JSONB NOT NULL DEFAULT '{
        "baseXP": 0,
        "qualityBonusXP": 0,
        "downloadBonusXP": 0,
        "totalXP": 0,
        "history": []
      }'::jsonb,
      badges JSONB NOT NULL DEFAULT '[]'::jsonb,
      trending BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await query(`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES contributions(id) ON DELETE SET NULL;`)

  await query(`
    CREATE TABLE IF NOT EXISTS contribution_ratings (
      id SERIAL PRIMARY KEY,
      contribution_id INTEGER NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      helpful BOOLEAN,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (contribution_id, user_id)
    );
  `)
}

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

export const config = {
  port: Number(process.env.PORT || 8000),
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  redisEnabled: process.env.REDIS_ENABLED !== 'false',
  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS || 300),
  authSessionTtlSeconds: Number(process.env.AUTH_SESSION_TTL_SECONDS || 604800),
  llmProvider: (process.env.LLM_PROVIDER || 'mock').toLowerCase(),
  huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY || '',
  huggingFaceModel: process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.1-70B-Instruct',
  huggingFaceBaseUrl:
    process.env.HUGGINGFACE_BASE_URL || 'https://router.huggingface.co/v1',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  openAiTemperature: Number(process.env.OPENAI_TEMPERATURE || 0.2),
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  groqTemperature: Number(process.env.GROQ_TEMPERATURE || 0.2),
  databaseUrl:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'postgres'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'testgen'}`,
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
}

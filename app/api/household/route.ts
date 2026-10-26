import { env } from 'cloudflare:workers';
import { householdRequest } from '../../../lib/households.mjs';
export const dynamic = 'force-dynamic';
export function GET(request: Request) { return householdRequest(request, env.DB); }
export function POST(request: Request) { return householdRequest(request, env.DB); }

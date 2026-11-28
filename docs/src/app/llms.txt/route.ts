import { docsLlms } from '@/lib/source';

export async function GET() {
  return new Response(docsLlms.index());
}

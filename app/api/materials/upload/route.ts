import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Generates a signed Supabase Storage upload URL instead of accepting the file
// body directly — Vercel serverless functions cap request bodies around 4.5MB,
// so any real video would fail there regardless of what limit we set. The
// browser uploads the actual file bytes straight to Supabase Storage using the
// signed URL below, bypassing this function (and its size limit) entirely.
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const filename = body?.filename
  if (typeof filename !== 'string' || !filename) {
    return NextResponse.json({ error: 'filename is required' }, { status: 422 })
  }

  const path = `${Date.now()}-${sanitizeFilename(filename)}`

  const { data, error } = await supabase.storage.from('materials').createSignedUploadUrl(path)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(path)

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path,
    publicUrl: publicUrlData.publicUrl,
    filename,
  })
}

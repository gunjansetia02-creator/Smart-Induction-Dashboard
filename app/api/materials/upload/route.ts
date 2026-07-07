import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const MAX_BYTES = 4 * 1024 * 1024 // 4MB — stays safely under Vercel's serverless request-body limit

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 422 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is ${(file.size / 1024 / 1024).toFixed(1)}MB — the max for direct upload is 4MB. For larger files, host it elsewhere (e.g. Google Drive, SharePoint) and paste the link instead.` },
      { status: 413 }
    )
  }

  const path = `${Date.now()}-${sanitizeFilename(file.name)}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('materials')
    .upload(path, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('materials').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, filename: file.name })
}

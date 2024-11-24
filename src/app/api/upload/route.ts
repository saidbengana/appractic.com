import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${uuidv4()}-${file.name}`
    
    // Save to public directory
    const path = join(process.cwd(), 'public', 'uploads', fileName)
    await writeFile(path, buffer)

    // Return the public URL
    return NextResponse.json({
      id: uuidv4(),
      url: `/uploads/${fileName}`,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}

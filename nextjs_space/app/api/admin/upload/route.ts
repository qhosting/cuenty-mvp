
import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/s3'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


// Verificar token de autenticación

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, ADMIN_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (adminPayload instanceof NextResponse) {
      return adminPayload
    }
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/x-icon']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const cloudStoragePath = await uploadFile(buffer, file.name)
    
    // Construir la URL completa del archivo en S3
    const bucketName = process.env.AWS_BUCKET_NAME || ''
    const region = process.env.AWS_REGION || 'us-east-1'
    const fullUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${cloudStoragePath}`
    
    return NextResponse.json({ 
      success: true, 
      cloudStoragePath: fullUrl, // Devolver URL completa
      fileName: file.name
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 })
  }
}

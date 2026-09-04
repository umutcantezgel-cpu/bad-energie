import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { verifySessionApi } from '@/lib/services/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await verifySessionApi();
  if (!session) {
    return NextResponse.json({ fehler: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'],
          maximumSizeInBytes: 15 * 1024 * 1024,
          tokenPayload: JSON.stringify({ benutzerId: session.benutzerId, pathname }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optionale Nachbereitung des Uploads
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { fehler: (error as Error).message },
      { status: 400 },
    );
  }
}

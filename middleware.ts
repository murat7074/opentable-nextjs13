import { NextRequest, NextResponse } from 'next/server' // middlware  de "NextApiResponse" yerine bu şekilde oluyor
import * as jose from 'jose'

// middleware endpoint den önce çalışır. (signin , signup ve etc. request den önce)
// fakat her zaman çalışmasını istemeyiz bu yüzden "config" oluşturuyoruz
export async function middleware(req: NextRequest, res: NextResponse) {
  
 const bearerToken = req.headers.get('authorization') as string

  if (!bearerToken) {
    return new NextResponse(
      JSON.stringify({ errorMessage: 'Unauthorized request' }),
      { status: 401 }
    )
  }

  const token = bearerToken.split(' ')[1]

  if (!token) {
    return new NextResponse(
      JSON.stringify({ errorMessage: 'Unauthorized request' }),
      { status: 401 }
    )
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET)

  try {
    await jose.jwtVerify(token, secret)
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ errorMessage: 'Unauthorized request' }),
      { status: 401 }
    )
  }
}

// middleware herzaman çalışmasın sadece "config" iiçindeki matcher endpoint de çalışsın
export const config = {
  matcher: ['/api/auth/me'],
}

// başka endpoint eklemek için
// export const config = {
//   matcher: ['/api/auth/me','/api/auth/signin'],
// }


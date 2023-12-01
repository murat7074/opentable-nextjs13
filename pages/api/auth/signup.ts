import { NextApiRequest, NextApiResponse } from 'next' // typescript için gerekli
import validator from 'validator'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import * as jose from 'jose'
import {setCookie} from 'cookies-next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const body = req.body

    const { firstName, lastName, email, phone, city, password } = body
    const errors: string[] = []
    const validationSchema = [
      {
        valid: validator.isLength(firstName, {
          min: 1,
          max: 20,
        }),
        errorMessage: 'First name is invalid',
      },
      {
        valid: validator.isLength(lastName, {
          min: 1,
          max: 20,
        }),
        errorMessage: 'Last name is invalid',
      },
      {
        valid: validator.isEmail(email),
        errorMessage: 'Email  is invalid',
      },
      {
        valid: validator.isMobilePhone(phone),
        errorMessage: 'Phone number is invalid',
      },
      {
        valid: validator.isLength(city, {
          min: 1,
          max: 20,
        }),
        errorMessage: 'City  is invalid',
      },
      {
        valid: validator.isStrongPassword(password),
        errorMessage: 'Password  is not strong enough',
      },
    ]

    validationSchema.forEach((check) => {
      if (!check.valid) {
        errors.push(check.errorMessage)
      }
    })

    if (errors.length) {
      return res.status(400).json({ errorMessage: errors[0] }) // ilk hatayı göndericez
    }

    // email önceden kayıtlımı?
    const userWithEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (userWithEmail) {
      return res
        .status(400)
        .json({ errorMessage: 'Email is associated with another account' })
    }

    // -- HASHING --  //

    const hashedPassword = await bcrypt.hash(password, 10) // sağ tarafa extra 10 karakter ekleyecek (extra güvenlik)


    // -- CREATE USER IN POSTGRES DATABASE

    const user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        password: hashedPassword,
        email,
        phone,
        city,
      },
    })

    // ------- CREATE JWT ----------//
    const alg = 'HS256'
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    // email i kullanmamızın nedeni unique identifier olması
    const token = await new jose.SignJWT({ email: user.email })
      .setProtectedHeader({ alg })
      .setExpirationTime('24h')
      .sign(secret)

         // browser a cookie i set edicez (client signup yaptığında browser ında cookie i görücek)
     setCookie("jwt", token, { req, res, maxAge: 60 * 6 * 24 }); // 24 saat

       return res.status(200).json({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      city: user.city,
    });
  }
     res.status(404).json("Unknown endpoint")
}

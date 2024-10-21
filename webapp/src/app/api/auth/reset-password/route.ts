import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Le lien est invalide ou a expiré.' }, { status: 400 });
  }

  const hashedPassword = await hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
}

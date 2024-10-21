import prisma from '@/lib/prisma';
import { getUserFull } from '@/lib/utils/db';
import sendPasswordResetEmail from '@/mail/sendPasswordResetEmail';
import { UserFull } from '@/types/api';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });
    
    if (!user) {
        return NextResponse.json({ error: 'No user found with that email address' }, { status: 400 });
    }
    const userFull = await getUserFull(user.id) as UserFull;

    // Generate reset token
    const token = randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000 * 24); // 1 day expiry

    // Update user with reset token and expiry
    await prisma.user.update({
        where: { email },
        data: {
            resetToken: token,
            resetTokenExpiry,
        },
    });

    const passwordResetLink = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/reinitialiser-mot-de-passe?token=${token}`;

    await sendPasswordResetEmail(userFull, passwordResetLink);

    return NextResponse.json({ message: 'Password reset email sent' }, { status: 200 });
}

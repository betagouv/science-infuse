import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
    const { html } = await request.json();

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    
    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
        },
    });
}
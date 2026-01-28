import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AdminSettingKey } from "@prisma/client";
import { auth } from "@/auth";
import { userIs } from "@/app/api/accessControl";
import { UserRoles } from "@prisma/client";

export async function GET() {
  const session = await auth();
  
  // Allow unauthenticated users to read settings (needed for navigation)
  // Settings don't contain sensitive data, only feature flags
  try {
    const settings = await prisma.adminSetting.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await userIs(session.user.id, [UserRoles.ADMIN]);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || !Object.values(AdminSettingKey).includes(key as AdminSettingKey)) {
      return NextResponse.json({ error: "Invalid setting key" }, { status: 400 });
    }

    // Find existing setting
    const existingSetting = await prisma.adminSetting.findUnique({
      where: { key: key as AdminSettingKey },
    });

    let setting;
    if (existingSetting) {
      // Update existing setting
      setting = await prisma.adminSetting.update({
        where: { id: existingSetting.id },
        data: { value },
      });
    } else {
      // Create new setting
      setting = await prisma.adminSetting.create({
        data: {
          key: key as AdminSettingKey,
          value,
          description: `Feature access control for ${key}`,
        },
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error updating admin setting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

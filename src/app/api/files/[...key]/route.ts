import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readLocalFile, verifySignedFileUrl } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await params;
  const storageKey = keyParts.map(decodeURIComponent).join("/");
  const { searchParams } = new URL(request.url);
  const exp = searchParams.get("exp") ?? "";
  const sig = searchParams.get("sig") ?? "";

  if (!verifySignedFileUrl(storageKey, exp, sig)) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const isVerificationDoc = storageKey.startsWith("verification/");
  if (isVerificationDoc) {
    const isStaff =
      session.user.role === "ADMINISTRATOR" || session.user.role === "MODERATOR";
    const isOwner = await prisma.verificationDocument.findFirst({
      where: {
        storageKey,
        verification: { tutorProfile: { userId: session.user.id } },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
  }

  try {
    const doc = await prisma.verificationDocument.findFirst({
      where: { storageKey, deletedAt: null },
      select: { mimeType: true, fileName: true },
    });

    const data = await readLocalFile(storageKey);
    const mimeType = doc?.mimeType ?? "application/octet-stream";
    const fileName = doc?.fileName ?? "file";

    return new NextResponse(data, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}

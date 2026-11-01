import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCompanyOptions } from "@/lib/questionsDb";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to practice." }, { status: 401 });
  }

  try {
    const companies = await getCompanyOptions();
    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Failed to load companies:", error);
    return NextResponse.json({ error: "Failed to load companies" }, { status: 500 });
  }
}

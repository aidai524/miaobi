import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createUserProject, listUserProjects } from "@/lib/projects/service";
import { createProjectSchema } from "@/lib/projects/validation";
import { errorResponse } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const projects = await listUserProjects(user.id);
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const input = createProjectSchema.parse(await request.json().catch(() => null));
    const project = await createUserProject(user.id, input);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "创建项目失败，请稍后重试");
  }
}

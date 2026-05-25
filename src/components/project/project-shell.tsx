import { ProjectShellFrame } from "@/components/project/project-shell-frame";
import type { CurrentUser } from "@/lib/auth/session";

export function ProjectShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return <ProjectShellFrame user={user}>{children}</ProjectShellFrame>;
}

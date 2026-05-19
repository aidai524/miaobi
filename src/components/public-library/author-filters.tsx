"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthorFiltersProps = {
  fields: string[];
  defaults: {
    q?: string;
    field?: string;
  };
};

export function AuthorFilters({ fields, defaults }: AuthorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function apply(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["q", "field"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/authors${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form action={apply} className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input id="author-q" name="q" className="pl-10" defaultValue={defaults.q} placeholder="搜索作者、代表作或风格..." />
      </div>
      <div className="md:w-40">
        <select
          id="author-field"
          name="field"
          defaultValue={defaults.field ?? ""}
          className="flex h-10 w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
        >
          <option value="">全部领域</option>
          {fields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="outline">
        <Filter className="h-4 w-4" />
        筛选
      </Button>
    </form>
  );
}

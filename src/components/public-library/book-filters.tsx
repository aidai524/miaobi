"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BookFiltersProps = {
  categories: string[];
  defaults: {
    q?: string;
    author?: string;
    category?: string;
  };
};

export function BookFilters({ categories, defaults }: BookFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function apply(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["q", "author", "category"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/books${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form action={apply} className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input id="book-q" name="q" className="pl-10" defaultValue={defaults.q} placeholder="搜索书名、作者、关键词..." />
      </div>
      <div className="md:w-48">
        <Input id="book-author" name="author" defaultValue={defaults.author} placeholder="作者" />
      </div>
      <div className="md:w-32">
        <select
          id="book-category"
          name="category"
          defaultValue={defaults.category ?? ""}
          className="flex h-10 w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
        >
          <option value="">全部分类</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
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

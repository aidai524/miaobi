import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authors } from "@/data/mock";

export default function AuthorLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = authors.filter(
    (a) =>
      !search ||
      a.name.includes(search) ||
      a.field.includes(search) ||
      a.styleTags.some((t) => t.includes(search)) ||
      a.works.some((w) => w.includes(search))
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">作者库</h2>
          <p className="text-sm text-text-muted mt-1">
            从优秀作者身上寻找内容风格灵感
          </p>
        </div>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <Input
          placeholder="搜索作者名、领域、风格……"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-sm">没有找到匹配的作者</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((author) => (
            <Card
              key={author.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/authors/${author.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent font-semibold text-sm shrink-0">
                    {author.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {author.name}
                    </h3>
                    <p className="text-xs text-text-muted">{author.field}</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-3">
                  代表作：{author.works.join("、")}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {author.styleTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full">
                  <Users className="h-3.5 w-3.5" />
                  查看详情
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

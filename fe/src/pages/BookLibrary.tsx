import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { libraryBooks } from "@/data/mock";

export default function BookLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = ["全部", "科技", "商业", "心理学", "方法论", "沟通", "管理"];

  const filtered = libraryBooks.filter((b) => {
    const matchSearch =
      !search ||
      b.title.includes(search) ||
      b.author.includes(search) ||
      b.tags.some((t) => t.includes(search));
    const matchCategory = category === "all" || category === b.category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">图书库</h2>
          <p className="text-sm text-text-muted mt-1">
            浏览优秀图书，获取结构与表达灵感
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="搜索书名、作者、关键词……"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-28">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue>{category === "all" ? "分类" : category}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {categories.filter(c => c !== "全部").map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <BookOpen className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-sm">没有找到匹配的图书</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((book) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/library/${book.id}`)}
            >
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  {book.title}
                </h3>
                <p className="text-xs text-text-secondary mb-2">
                  {book.author} · {book.publisher} · {book.publishDate}
                </p>
                <p className="text-xs text-text-muted mb-3 line-clamp-2">
                  {book.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {book.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm">
                    查看详情
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

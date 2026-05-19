import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Sparkles,
  Lightbulb,
  PenLine,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authors } from "@/data/mock";

export default function AuthorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const author = authors.find((a) => a.id === id);

  if (!author) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-text-muted">未找到该作者</p>
        <Button variant="link" onClick={() => navigate("/authors")}>
          返回作者库
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-6 cursor-pointer"
        onClick={() => navigate("/authors")}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回作者库
      </button>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light text-accent font-bold text-xl shrink-0">
              {author.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                {author.name}
              </h1>
              <p className="text-text-secondary text-sm">{author.field}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/create")}>
            <Sparkles className="h-4 w-4" />
            参考此风格创建项目
          </Button>
        </div>
        <div className="flex gap-1.5 mt-4">
          {author.styleTags.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-accent" />
              作者介绍
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{author.intro}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-accent" />
              代表作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {author.works.map((work) => (
                <li
                  key={work}
                  className="text-sm text-text-secondary flex items-center gap-2"
                >
                  <BookOpen className="h-3.5 w-3.5 text-text-muted" />
                  {work}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-accent" />
              常见选题
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {author.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <PenLine className="h-4 w-4 text-accent" />
              写作特点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              {author.characteristics}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-accent" />
              适合借鉴的创作方向
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {author.references.map((ref) => (
                <Badge key={ref} variant="default">
                  {ref}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

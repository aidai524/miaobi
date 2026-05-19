import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, BookMarked, Tag, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { libraryBooks } from "@/data/mock";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const book = libraryBooks.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-text-muted">未找到该图书</p>
        <Button variant="link" onClick={() => navigate("/library")}>
          返回图书库
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-6 cursor-pointer"
        onClick={() => navigate("/library")}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回图书库
      </button>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-text-secondary mb-3">{book.subtitle}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {book.author}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {book.publisher}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {book.publishDate}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/create")}>
              <Sparkles className="h-4 w-4" />
              以此为灵感创建项目
            </Button>
          </div>
        </div>
        <div className="flex gap-1.5 mt-4">
          {book.tags.map((tag) => (
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
              <BookOpen className="h-4 w-4 text-accent" />
              简介
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{book.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookMarked className="h-4 w-4 text-accent" />
              推荐理由
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              {book.recommendation}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-accent" />
              适合作为参考
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              {book.referenceType}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

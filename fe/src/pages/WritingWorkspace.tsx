import { useState } from "react";
import {
  GripVertical,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Expand,
  Minimize2,
  MessageSquare,
  Lightbulb,
  BarChart3,
  PenLine,
  MoveDown,
  MoveUp,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { outlineSample } from "@/data/mock";

interface OutlineNode {
  id: string;
  title: string;
  children?: OutlineNode[];
}

function TocNode({
  node,
  level,
  activeId,
  onSelect,
}: {
  node: OutlineNode;
  level: number;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-1.5 pr-2 rounded-lg cursor-pointer transition-colors ${
          activeId === node.id
            ? "bg-accent-light text-accent"
            : "hover:bg-bg-secondary text-text-secondary"
        }`}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={() => onSelect(node.id)}
      >
        {node.children && node.children.length > 0 ? (
          <button
            className="p-0.5 hover:bg-border/50 rounded shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="text-xs truncate flex-1">{node.title}</span>
      </div>
      {expanded &&
        node.children?.map((child) => (
          <TocNode
            key={child.id}
            node={child}
            level={level + 1}
            activeId={activeId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

const sampleContent = `## 1.1 AI 不再只是技术圈的话题

在 2023 年之前，"AI" 这个词对大多数人来说，是科幻电影里的情节，是程序员在 Github 上讨论的话题，是大公司实验室里的黑科技。

但一切在 2023 年发生了改变。

ChatGPT 的上线，让全世界第一次感受到：AI 可以像人一样对话。它不像 Siri 那样只回答冷冰冰的搜索结果，它可以陪你聊天、帮你写作、为你翻译、给你建议。

更重要的是——它**不需要任何技术背景**就能使用。

---

### 你每天已经在使用 AI

很多人不知道的是，AI 已经渗透在我们的日常生活中：

- 打开手机用**人脸识别**解锁——AI
- 用搜索引擎查找信息——AI
- 在购物网站看到"猜你喜欢"——AI
- 用翻译软件看外文资料——AI
- 收到银行的反欺诈提醒——AI

> AI 不是一个遥远的未来，它已经是我们身边的一部分。

区别只在于：**你是被动使用，还是主动利用。**
`;

export default function WritingWorkspace() {
  const [activeSection, setActiveSection] = useState<string | null>(
    "ch1-1-1"
  );
  const [content, setContent] = useState(sampleContent);
  const [aiInstruction, setAiInstruction] = useState("");

  const aiActions = [
    { icon: Expand, label: "扩写", action: "expand" },
    { icon: Minimize2, label: "精简", action: "condense" },
    { icon: MoveDown, label: "改得更通俗", action: "simplify" },
    { icon: MoveUp, label: "改得更专业", action: "professional" },
    { icon: ListChecks, label: "增加案例", action: "add_examples" },
    { icon: MessageSquare, label: "生成小结", action: "summary" },
    { icon: Lightbulb, label: "生成金句", action: "quotes" },
    { icon: BarChart3, label: "给出图表建议", action: "charts" },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="w-56 border-r border-border-light bg-bg-card flex flex-col">
        <div className="p-3 border-b border-border-light">
          <h3 className="text-xs font-semibold text-text-primary">
            AI 第一步：从焦虑到理解
          </h3>
          <p className="text-[10px] text-text-muted mt-0.5">目录导航</p>
        </div>
        <ScrollArea className="flex-1 p-2">
          {outlineSample.map((node) => (
            <TocNode
              key={node.id}
              node={node}
              level={0}
              activeId={activeSection}
              onSelect={setActiveSection}
            />
          ))}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-5 py-2 border-b border-border-light bg-bg-card">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary">当前章节：</span>
            <Badge variant="secondary" className="text-[10px]">
              1.1 AI 不再只是技术圈的话题
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-text-muted ml-2">
              <PenLine className="h-3 w-3" />
              <span>1,247 字</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-[10px]">
              草稿
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-8">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] font-serif text-[15px] leading-relaxed text-text-primary border-none shadow-none focus-visible:ring-0 focus-visible:border-none px-0 resize-none"
              style={{ fontFamily: "Georgia, 'Noto Serif SC', serif" }}
              placeholder="这一节还没有正文。让 AI 先生成一个可编辑的初稿。"
            />
          </div>
        </ScrollArea>
      </div>

      <div className="w-64 border-l border-border-light bg-bg-card flex flex-col">
        <div className="p-4 border-b border-border-light">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            AI 写作助手
          </h3>
        </div>
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-1.5">
            {aiActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            ))}
          </div>
          <Separator className="my-4" />
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              自定义指令
            </label>
            <Textarea
              placeholder="输入你希望 AI 如何修改当前内容……"
              className="min-h-[80px] text-xs"
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
            />
            <Button size="sm" className="w-full mt-2" disabled={!aiInstruction}>
              <Sparkles className="h-3.5 w-3.5" />
              执行
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

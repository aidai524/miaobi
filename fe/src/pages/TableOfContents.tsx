import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GripVertical,
  MoreHorizontal,
  Plus,
  ChevronRight,
  ChevronDown,
  Sparkles,
  RefreshCw,
  ListPlus,
  Wand2,
  PenLine,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { outlineSample } from "@/data/mock";

interface OutlineNode {
  id: string;
  title: string;
  children?: OutlineNode[];
}

interface TreeNodeProps {
  node: OutlineNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  level: number;
}

function TreeNode({ node, selectedId, onSelect, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 py-1.5 pr-2 rounded-lg cursor-pointer transition-colors ${
          selectedId === node.id
            ? "bg-accent-light text-accent"
            : "hover:bg-bg-secondary text-text-secondary"
        }`}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
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
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <GripVertical className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        <span className="text-sm truncate flex-1">{node.title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>添加子节点</DropdownMenuItem>
            <DropdownMenuItem>重命名</DropdownMenuItem>
            <DropdownMenuItem>删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {expanded &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            selectedId={selectedId}
            onSelect={onSelect}
            level={level + 1}
          />
        ))}
    </div>
  );
}

export default function TableOfContents() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>("ch1-1-1");
  const [nodeTitle, setNodeTitle] = useState("1.1 AI 不再只是技术圈的话题");
  const [nodeSummary, setNodeSummary] = useState("");
  const [nodeGoal, setNodeGoal] = useState("");

  const selectedNode = selectedId ? findNode(outlineSample, selectedId) : null;

  function findNode(nodes: OutlineNode[], id: string): OutlineNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="w-64 border-r border-border-light bg-bg-card flex flex-col">
        <div className="p-4 border-b border-border-light">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            全书目录
          </h3>
          <div className="flex items-center gap-1">
            <Badge variant="default" className="text-[10px]">
              8 章
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              24 节
            </Badge>
          </div>
        </div>
        <ScrollArea className="flex-1 p-2">
          {outlineSample.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selectedId={selectedId}
              onSelect={setSelectedId}
              level={0}
            />
          ))}
        </ScrollArea>
        <div className="p-3 border-t border-border-light">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Plus className="h-3.5 w-3.5" />
            添加编/章/节
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border-light bg-bg-card">
          <div className="flex items-center gap-3">
            <Badge variant="default">目录完善中</Badge>
            <span className="text-xs text-text-muted">自动保存已开启</span>
          </div>
          <Button size="sm" onClick={() => navigate("/workspace")}>
            <PenLine className="h-3.5 w-3.5" />
            进入正文工作台
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              节点编辑
            </h2>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    标题
                  </label>
                  <Input
                    value={nodeTitle}
                    onChange={(e) => setNodeTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    摘要
                  </label>
                  <Textarea
                    placeholder="该节的一句话摘要……"
                    className="min-h-[80px]"
                    value={nodeSummary}
                    onChange={(e) => setNodeSummary(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    写作目标
                  </label>
                  <Textarea
                    placeholder="本节要达成的写作目标……"
                    className="min-h-[80px]"
                    value={nodeGoal}
                    onChange={(e) => setNodeGoal(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    建议字数
                  </label>
                  <Input placeholder="3000" defaultValue="3000" />
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm">
                  选择一个目录节点进行编辑
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="w-64 border-l border-border-light bg-bg-card flex flex-col">
        <div className="p-4 border-b border-border-light">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            AI 目录助手
          </h3>
        </div>
        <div className="flex-1 p-4 space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <RefreshCw className="h-3.5 w-3.5" />
            重写当前标题
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ListPlus className="h-3.5 w-3.5" />
            优化当前章节结构
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Plus className="h-3.5 w-3.5" />
            为当前章节补充小节
          </Button>
          <Separator className="my-3" />
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
          >
            <Wand2 className="h-3.5 w-3.5" />
            重新生成全书目录
          </Button>
        </div>
      </div>
    </div>
  );
}

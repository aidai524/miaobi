import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold text-text-primary mb-6">设置</h2>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-accent" />
              个人资料
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent font-semibold text-lg">
                Z
              </div>
              <Button variant="outline" size="sm">
                更换头像
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  昵称
                </label>
                <Input defaultValue="张明远" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  邮箱
                </label>
                <Input defaultValue="zhangmingyuan@example.com" />
              </div>
            </div>
            <Button size="sm">保存修改</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4 text-accent" />
              写作偏好
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  默认字体
                </label>
                <Select defaultValue="serif">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">衬线体 (Georgia)</SelectItem>
                    <SelectItem value="sans">无衬线体 (System)</SelectItem>
                    <SelectItem value="mono">等宽体 (Monospace)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  默认字号
                </label>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="13">13px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="15">15px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm">保存偏好</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-accent" />
              AI 写作默认设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  默认表达风格
                </label>
                <Select defaultValue="通俗">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="通俗">通俗</SelectItem>
                    <SelectItem value="专业">专业</SelectItem>
                    <SelectItem value="故事化">故事化</SelectItem>
                    <SelectItem value="温和启发">温和启发</SelectItem>
                    <SelectItem value="犀利观点">犀利观点</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  默认字数
                </label>
                <Select defaultValue="5 万">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 万">3 万</SelectItem>
                    <SelectItem value="5 万">5 万</SelectItem>
                    <SelectItem value="8 万">8 万</SelectItem>
                    <SelectItem value="10 万">10 万</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm">保存默认设置</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { z } from "zod";

export const emailSchema = z.string().trim().email("请输入有效邮箱").max(255);

export const passwordSchema = z
  .string()
  .min(8, "密码至少需要 8 位")
  .max(128, "密码不能超过 128 位");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nickname: z.string().trim().min(1, "请输入昵称").max(60, "昵称不能超过 60 个字").optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "请输入密码"),
});

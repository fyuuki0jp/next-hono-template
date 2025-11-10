import { z } from 'zod';
import { tool } from 'ai';

const reverseQuestionOptionSchema = z.object({
  label: z.string().describe('表示用のテキスト'),
  value: z.string().describe('フォーム送信用の値'),
  description: z.string().optional().describe('選択肢の補足説明'),
});

const reverseQuestionInputSchema = z.object({
  question: z.string().min(1).describe('ユーザーに確認したい質問文'),
  type: z.enum(['text', 'select']).describe('質問種別。text=自由記述, select=選択式'),
  options: z
    .array(reverseQuestionOptionSchema)
    .optional()
    .describe('typeがselectの場合に提示する選択肢'),
  placeholder: z.string().optional().describe('自由記述のプレースホルダー'),
  required: z
    .boolean()
    .optional()
    .describe('trueの場合、回答必須として扱う'),
});

export type ReverseQuestionOption = z.infer<typeof reverseQuestionOptionSchema>;
export type ReverseQuestionInput = z.infer<typeof reverseQuestionInputSchema>;

export const reverseQuestionTool = tool({
  description:
    'ユーザーのリクエストを満たすために不足している情報を質問として提示し、回答を受け取るためのツール',
  inputSchema: reverseQuestionInputSchema,
});

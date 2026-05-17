export type BookPlanResult = {
  positioning: string;
  targetReaderAnalysis: string;
  marketAngle: string;
  corePromise: string;
  titleSuggestions: string[];
  subtitleSuggestions: string[];
  sellingPoints: string[];
  structureSuggestion: string;
  risks: string[];
  editorialAdvice: string;
};

export type GenerateBookPlanInput = {
  topic: string;
  targetReader?: string | null;
  bookType?: string | null;
  writingStyle?: string | null;
  expectedWordCount?: number | null;
};

export type OutlineNodeResult = {
  title: string;
  summary: string;
  writingGoal: string;
  suggestedWordCount?: number | null;
  children?: OutlineNodeResult[];
};

export type OutlineResult = {
  nodes: OutlineNodeResult[];
};

export type GenerateOutlineInput = GenerateBookPlanInput & {
  plan: BookPlanResult;
};

export type ChapterContextNode = {
  title: string;
  summary?: string | null;
  writingGoal?: string | null;
  suggestedWordCount?: number | null;
};

export type GenerateChapterInput = GenerateBookPlanInput & {
  plan?: BookPlanResult | null;
  currentNode: ChapterContextNode;
  previousNode?: ChapterContextNode | null;
  nextNode?: ChapterContextNode | null;
};

export type RewriteChapterAction =
  | "expand"
  | "shorten"
  | "plain"
  | "professional"
  | "add_case"
  | "summary"
  | "quote";

export type RewriteChapterInput = {
  action: RewriteChapterAction;
  title: string;
  content: string;
};

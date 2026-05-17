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
  referenceModel?: WritingModelContext | null;
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

export type TextAnalysisResult = {
  summary: string;
  contentTopics: string[];
  readerProfile: string;
  structureAnalysis: string;
  styleAnalysis: string;
  reusableTraits: string[];
  writingAdvice: string[];
};

export type AnalyzeTextInput = {
  text: string;
  analysisType?: string | null;
};

export type WritingModelContext = {
  name: string;
  tags?: string[] | null;
  modelSummary?: string | null;
  applicableScenarios?: string | null;
  targetReader?: string | null;
  structurePattern?: string | null;
  languagePattern?: string | null;
  contentPattern?: string | null;
  writingGuidelines?: string | null;
  avoidRules?: string | null;
  promptTemplate?: string | null;
};

export type WritingModelResult = {
  name: string;
  tags: string[];
  modelSummary: string;
  applicableScenarios: string;
  targetReader: string;
  structurePattern: string;
  languagePattern: string;
  contentPattern: string;
  writingGuidelines: string;
  avoidRules: string;
  promptTemplate: string;
};

export type CreateWritingModelInput = {
  name?: string | null;
  analysis: TextAnalysisResult & {
    analysisType?: string | null;
  };
};

export interface Book {
  id: string;
  title: string;
  topic: string;
  stage: "planning" | "outline" | "writing" | "draft_complete";
  lastEdited: string;
  completedChapters: number;
  totalChapters: number;
}

export const recentProjects: Book[] = [
  {
    id: "1",
    title: "普通人如何理解并使用 AI",
    topic: "AI 科普入门",
    stage: "writing",
    lastEdited: "2 小时前",
    completedChapters: 3,
    totalChapters: 8,
  },
  {
    id: "2",
    title: "家庭的 AI 时代：孩子需要什么能力",
    topic: "家庭教育",
    stage: "outline",
    lastEdited: "昨天",
    completedChapters: 0,
    totalChapters: 6,
  },
  {
    id: "3",
    title: "小店经营方法论",
    topic: "商业实操",
    stage: "planning",
    lastEdited: "3 天前",
    completedChapters: 0,
    totalChapters: 0,
  },
];

export interface Model {
  id: string;
  name: string;
  source: string;
  tags: string[];
  createdAt: string;
  useCase: string;
}

export const recentModels: Model[] = [
  {
    id: "m1",
    name: "科普叙事风格",
    source: "10 篇个人博客文章",
    tags: ["通俗", "案例驱动", "结构化"],
    createdAt: "2025-03-10",
    useCase: "适合大众科普类书籍",
  },
  {
    id: "m2",
    name: "商业案例写作",
    source: "培训课程逐字稿",
    tags: ["犀利", "数据支撑", "实操导向"],
    createdAt: "2025-03-05",
    useCase: "适合商业方法类书籍",
  },
];

export const stageLabels: Record<Book["stage"], string> = {
  planning: "策划中",
  outline: "目录完成",
  writing: "正文创作中",
  draft_complete: "初稿完成",
};

export const stageColors: Record<Book["stage"], "default" | "secondary" | "warning" | "success"> = {
  planning: "secondary",
  outline: "default",
  writing: "warning",
  draft_complete: "success",
};

export const inspirationCards = [
  {
    title: "AI 科普",
    description: "让普通人真正理解 AI 的能力、边界与未来",
    tags: ["通俗", "入门", "趋势"],
  },
  {
    title: "家庭教育",
    description: "AI 时代下，家庭教育的变与不变",
    tags: ["育儿", "成长", "方法"],
  },
  {
    title: "商业方法论",
    description: "从街边小店到中型企业可用的经营框架",
    tags: ["实操", "案例", "创业"],
  },
];

export const targetReaders = [
  "大众读者",
  "职场人士",
  "创业者",
  "家长",
  "学生",
  "从业者",
  "管理者",
];

export const bookTypes = ["通识", "实操", "案例", "少儿", "行业观察"];

export const expressionStyles = ["通俗", "专业", "故事化", "温和启发", "犀利观点"];

export const wordCounts = ["3 万", "5 万", "8 万", "10 万"];

export interface BookPlan {
  topic: string;
  reader: string;
  type: string;
  style: string;
  wordCount: string;
}

export interface AnalysisFile {
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export const sampleFiles: AnalysisFile[] = [
  { name: "我的写作样本.txt", type: "txt", size: "24 KB", uploadedAt: "刚刚" },
  { name: "课程逐字稿.md", type: "md", size: "156 KB", uploadedAt: "2 分钟前" },
];

export const analysisTargets = [
  {
    id: "style",
    title: "分析作者风格",
    description: "识别文字表达中的语气、节奏、修辞习惯",
  },
  {
    id: "structure",
    title: "分析内容结构",
    description: "拆解文章的逻辑层次、段落组织方式",
  },
  {
    id: "bookify",
    title: "判断如何转化为一本书",
    description: "评估现有内容如何重组为完整的图书结构",
  },
  {
    id: "model",
    title: "生成可复用的创作模型",
    description: "提取可迁移的写作模式与风格参数",
  },
];

export const libraryBooks = [
  {
    id: "b1",
    title: "人工智能简史",
    author: "尼克",
    category: "科技",
    summary: "从图灵到达特茅斯会议，从专家系统到深度学习，全面梳理人工智能的发展历程。",
    tags: ["AI", "历史", "科普"],
    publisher: "人民邮电出版社",
    publishDate: "2017",
    subtitle: "从图灵到达特茅斯，AI 的前世今生",
    recommendation: "适合了解 AI 发展脉络，为科普写作提供历史视角。",
    referenceType: "时间线结构参考",
  },
  {
    id: "b2",
    title: "思考，快与慢",
    author: "丹尼尔·卡尼曼",
    category: "心理学",
    summary: "诺贝尔经济学奖得主卡尼曼关于人类决策与认知偏差的经典之作。",
    tags: ["认知", "决策", "心理学"],
    publisher: "中信出版社",
    publishDate: "2012",
    subtitle: "人类判断与决策中的系统性错误",
    recommendation: "适合研究如何将学术概念转化为通俗表达。",
    referenceType: "概念拆解与案例化写作",
  },
  {
    id: "b3",
    title: "从0到1",
    author: "彼得·蒂尔",
    category: "商业",
    summary: "PayPal 联合创始人关于创业与创新的独特洞见，强调从零创造而非复制。",
    tags: ["创业", "创新", "商业"],
    publisher: "中信出版社",
    publishDate: "2015",
    subtitle: "开启商业与未来的秘密",
    recommendation: "适合研究观点驱动的商业写作方法。",
    referenceType: "观点驱动结构参考",
  },
  {
    id: "b4",
    title: "如何阅读一本书",
    author: "莫提默·J·艾德勒",
    category: "方法论",
    summary: "关于阅读层次与方法的经典指南，系统讲解如何深入理解一本书。",
    tags: ["阅读", "方法", "学习"],
    publisher: "商务印书馆",
    publishDate: "2004",
    subtitle: "从基础到分析阅读的完整体系",
    recommendation: "适合参考其分层递进的结构设计。",
    referenceType: "层级结构参考",
  },
  {
    id: "b5",
    title: "非暴力沟通",
    author: "马歇尔·卢森堡",
    category: "沟通",
    summary: "一种基于同理心的沟通方法，帮助人们在冲突中建立连接。",
    tags: ["沟通", "心理学", "方法"],
    publisher: "华夏出版社",
    publishDate: "2009",
    subtitle: "用同理心化解冲突，建立深层连接",
    recommendation: "适合研究实操方法类书籍的写法。",
    referenceType: "实操手册结构参考",
  },
  {
    id: "b6",
    title: "原则",
    author: "瑞·达利欧",
    category: "管理",
    summary: "桥水基金创始人分享的人生与工作原则，系统化的决策框架。",
    tags: ["管理", "原则", "决策"],
    publisher: "中信出版社",
    publishDate: "2018",
    subtitle: "生活与工作的系统性原则",
    recommendation: "适合研究如何将个人经验提炼为通用框架。",
    referenceType: "原则清单结构参考",
  },
];

export const authors = [
  {
    id: "a1",
    name: "尼克",
    field: "AI 历史与科普",
    works: ["人工智能简史"],
    styleTags: ["学术通俗化", "叙事型", "详实"],
    intro: "资深科技作者，长期关注人工智能领域的发展与普及。",
    topics: ["AI 历史", "科技伦理", "技术趋势"],
    characteristics: "擅长将复杂技术历史转化为生动叙事，以时间线为主线组织内容。",
    references: ["科普叙事", "技术史"],
  },
  {
    id: "a2",
    name: "万维钢",
    field: "科学思维与认知",
    works: ["万万没想到", "智识分子"],
    styleTags: ["观点犀利", "论证严密", "中西对比"],
    intro: "科学作家，以严谨的逻辑和跨文化视野解读前沿思想。",
    topics: ["认知科学", "决策思维", "社会现象"],
    characteristics: "以问题为驱动，用实验与数据支撑观点，善于将西方前沿研究与中国语境结合。",
    references: ["观点驱动型", "论证写作"],
  },
  {
    id: "a3",
    name: "刘润",
    field: "商业与组织管理",
    works: ["底层逻辑", "5 分钟商学院"],
    styleTags: ["框架化", "实操", "简洁"],
    intro: "企业战略顾问，以清晰的逻辑框架帮助读者理解商业本质。",
    topics: ["商业逻辑", "组织管理", "个人成长"],
    characteristics: "擅长将复杂商业概念提炼为简洁框架，配以真实案例说明。",
    references: ["框架化写作", "案例教学"],
  },
  {
    id: "a4",
    name: "采铜",
    field: "学习方法与心智成长",
    works: ["精进", "深度工作指南"],
    styleTags: ["温和启发", "理论扎实", "实用"],
    intro: "心理学研究者，专注于将学术研究转化为个人成长方法论。",
    topics: ["学习方法", "认知提升", "习惯养成"],
    characteristics: "以心理学研究为基础，提出可操作的方法体系，表达温和而有说服力。",
    references: ["学术通俗化", "方法体系化"],
  },
  {
    id: "a5",
    name: "李笑来",
    field: "个人成长与认知升级",
    works: ["把时间当作朋友", "通往财富自由之路"],
    styleTags: ["直接", "反常识", "实操"],
    intro: "长期关注学习与成长的方法论，以犀利直接的语言挑战读者固有认知。",
    topics: ["时间管理", "认知升级", "学习方法"],
    characteristics: "以个人经验为基础，用直白语言提出反常规观点，强调实践验证。",
    references: ["反常识写作", "经验方法论"],
  },
  {
    id: "a6",
    name: "吴军",
    field: "科技通识与文明史",
    works: ["浪潮之巅", "大学之路", "见识"],
    styleTags: ["宏观视野", "深入浅出", "系统"],
    intro: "计算机科学家，以工程师思维和人文视角解读科技与文明。",
    topics: ["科技史", "教育", "个人成长"],
    characteristics: "以历史纵深感讲述科技发展，将个人经历与宏观趋势结合。",
    references: ["宏大叙事", "科技人文融合"],
  },
];

export const outlineSample = [
  {
    id: "ch1",
    title: "第一编 AI 为什么来到每个人身边",
    children: [
      {
        id: "ch1-1",
        title: "第1章 普通人为什么必须理解 AI",
        children: [
          { id: "ch1-1-1", title: "1.1 AI 不再只是技术圈的话题" },
          { id: "ch1-1-2", title: "1.2 你每天已经在使用 AI" },
          { id: "ch1-1-3", title: "1.3 未来三年会发生的变化" },
        ],
      },
      {
        id: "ch1-2",
        title: "第2章 过去十年发生了什么",
        children: [
          { id: "ch1-2-1", title: "2.1 从 AlphaGo 到 ChatGPT" },
          { id: "ch1-2-2", title: "2.2 算力、数据与算法的突破" },
          { id: "ch1-2-3", title: "2.3 AI 不是科幻，是工具" },
        ],
      },
    ],
  },
  {
    id: "ch2",
    title: "第二编 AI 能做什么，不能做什么",
    children: [
      {
        id: "ch2-1",
        title: "第3章 AI 的能力边界",
        children: [
          { id: "ch2-1-1", title: "3.1 文字生成与理解" },
          { id: "ch2-1-2", title: "3.2 图像识别与生成" },
          { id: "ch2-1-3", title: "3.3 数据分析与预测" },
        ],
      },
      {
        id: "ch2-2",
        title: "第4章 AI 不能做的事",
        children: [
          { id: "ch2-2-1", title: "4.1 真正的创造" },
          { id: "ch2-2-2", title: "4.2 情感与共情" },
          { id: "ch2-2-3", title: "4.3 价值判断" },
        ],
      },
    ],
  },
];

export interface BookPlanData {
  positioning: string;
  solvesWhat: string;
  suitableFor: string;
  worthWriting: string;
  coreReaders: string;
  secondaryReaders: string;
  readerAnxiety: string;
  readerExpectation: string;
  titles: string[];
  subtitles: string[];
  sellingPoints: string[];
  structure: { part: string; description: string }[];
  risks: string;
}

export const sampleBookPlan: BookPlanData = {
  positioning: "一本面向普通人的 AI 认知入门书，帮助读者建立对 AI 的正确理解，消除恐惧，掌握实用的 AI 使用方法。",
  solvesWhat: "普通人面对 AI 时的焦虑和困惑——不知道 AI 是什么、会不会取代自己、怎么利用 AI 提升生活和工作。",
  suitableFor: "对 AI 感兴趣但无技术背景的大众读者、担心被 AI 淘汰的职场人士、希望了解 AI 趋势的年轻人。",
  worthWriting: "市面上关于 AI 的书要么过于技术化，要么过于恐慌式营销，缺少一本客观、有温度、真正对普通人有用的入门书。",
  coreReaders: "25-45 岁职场人士，对技术话题有好奇心但无专业背景",
  secondaryReaders: "学生群体、教育工作者、中小企业家",
  readerAnxiety: "担心 AI 会取代自己的工作，但又不知道从何学起",
  readerExpectation: "希望有一本不吓人、不说教、能真正看懂的书",
  titles: [
    "AI 第一步：从焦虑到理解",
    "每个人都能懂的 AI 入门课",
    "AI 在身边：普通人的生存指南",
    "你好，AI：重新认识你的新伙伴",
  ],
  subtitles: [
    "一本不带恐惧、不装高深的 AI 启蒙书",
    "用普通人的语言，讲清楚 AI 这件事",
    "从零开始，轻松看懂人工智能",
  ],
  sellingPoints: [
    "完全零基础友好，没有公式和代码",
    "聚焦真实场景，每章都解决一个实际困惑",
    "采用对话体与案例结合，阅读体验轻松",
    "从害怕 AI 到用好 AI 的完整路径",
    "附赠 AI 工具实用清单与进阶学习路线",
  ],
  structure: [
    { part: "第一部分：AI 是什么——用最普通的语言讲清楚", description: "消除神秘感和恐惧感，建立正确认知" },
    { part: "第二部分：AI 能做什么——你身边的 AI 实例", description: "用真实案例展示 AI 的实用价值" },
    { part: "第三部分：AI 不能做什么——理解边界", description: "客观认识 AI 的局限，建立合理预期" },
    { part: "第四部分：与 AI 共处——你的行动计划", description: "实操指南，从今天开始用好 AI" },
  ],
  risks: "注意避免过度承诺 AI 的能力，保持客观中立的立场。在第四部分给出可操作建议，而非空洞说教。同时注意时效性，预留更新空间。",
};

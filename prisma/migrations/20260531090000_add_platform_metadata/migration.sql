ALTER TABLE "Platform" ADD COLUMN "shortName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Platform" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Platform" ADD COLUMN "colorClass" TEXT NOT NULL DEFAULT 'bg-slate-600';
ALTER TABLE "Platform" ADD COLUMN "accentClass" TEXT NOT NULL DEFAULT 'border-slate-500 bg-slate-50 text-slate-800';
ALTER TABLE "Platform" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'builtin';

UPDATE "Platform"
SET
  "shortName" = CASE "name"
    WHEN 'wechat' THEN '微信'
    WHEN 'zhihu' THEN '知乎'
    WHEN 'bilibili' THEN 'B站'
    WHEN 'xiaohongshu' THEN '小红书'
    ELSE "displayName"
  END,
  "description" = CASE "name"
    WHEN 'wechat' THEN '适合结构完整、段落清晰的长图文内容。'
    WHEN 'zhihu' THEN '适合观点明确、论证充分的问答和专栏内容。'
    WHEN 'bilibili' THEN '适合轻松、分段明显、便于社区阅读的专栏内容。'
    WHEN 'xiaohongshu' THEN '适合短文案、标签明确、强调经验和行动建议。'
    ELSE ''
  END,
  "colorClass" = CASE "name"
    WHEN 'wechat' THEN 'bg-emerald-600'
    WHEN 'zhihu' THEN 'bg-sky-600'
    WHEN 'bilibili' THEN 'bg-pink-600'
    WHEN 'xiaohongshu' THEN 'bg-rose-600'
    ELSE 'bg-slate-600'
  END,
  "accentClass" = CASE "name"
    WHEN 'wechat' THEN 'border-emerald-500 bg-emerald-50 text-emerald-800'
    WHEN 'zhihu' THEN 'border-sky-500 bg-sky-50 text-sky-800'
    WHEN 'bilibili' THEN 'border-pink-500 bg-pink-50 text-pink-800'
    WHEN 'xiaohongshu' THEN 'border-rose-500 bg-rose-50 text-rose-800'
    ELSE 'border-slate-500 bg-slate-50 text-slate-800'
  END,
  "source" = 'builtin';

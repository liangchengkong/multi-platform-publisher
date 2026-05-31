DELETE FROM "PublishRecord";
DELETE FROM "PublishTask";
DELETE FROM "AdaptedContent";
DELETE FROM "PlatformAccount";
DELETE FROM "Platform";
DELETE FROM "Content";

INSERT INTO "Content" (
  "id",
  "title",
  "body",
  "contentType",
  "status",
  "createdAt",
  "updatedAt"
) VALUES (
  'content_demo_001',
  '如何把一篇内容高效发布到多个平台',
  '# 背景
很多创作者会同时维护公众号、知乎、B站和小红书。真正耗时的不是复制粘贴，而是每个平台的格式、语气和长度限制都不一样。

## 我的目标
用一个工具完成原文编辑、平台适配、发布前预览和发布记录追踪。

## 实践建议
先写一份完整原文，再按平台生成不同版本。公众号保留完整结构，知乎强调观点和论据，B站适合轻松分段，小红书需要短文案和标签。

## 结论
多平台发布工具最重要的不是替代创作者，而是减少重复劳动，让创作者把精力放在内容判断上。',
  'markdown',
  'ready',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO "Platform" (
  "id",
  "name",
  "displayName",
  "enabled",
  "maxTitleLength",
  "maxContentLength",
  "requiredFields",
  "styleGuide",
  "adapterKey",
  "config",
  "createdAt",
  "updatedAt"
) VALUES
  ('platform_wechat', 'wechat', '微信公众号', 1, 64, 20000, '["标题","正文","封面图"]', '保留完整论述，使用清晰标题层级，适合沉淀型内容。', 'wechat', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('platform_zhihu', 'zhihu', '知乎', 1, 80, 50000, '["标题","正文","话题"]', '保留 Markdown 结构，突出问题、结论和论据。', 'zhihu', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('platform_bilibili', 'bilibili', 'B站专栏', 1, 40, 12000, '["标题","正文","分区"]', '减少密集段落，保留小标题，语气更直接。', 'bilibili', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('platform_xiaohongshu', 'xiaohongshu', '小红书', 1, 20, 1000, '["标题","正文","标签","图片"]', '提炼重点，口语化表达，自动补充话题标签。', 'xiaohongshu', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "PlatformAccount" (
  "id",
  "platformId",
  "accountName",
  "authType",
  "status",
  "configEncrypted",
  "createdAt",
  "updatedAt"
) VALUES
  ('account_wechat_mock', 'platform_wechat', '微信公众号模拟账号', 'mock', 'connected', '{"mode":"simulate"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('account_zhihu_mock', 'platform_zhihu', '知乎模拟账号', 'mock', 'connected', '{"mode":"simulate"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('account_bilibili_mock', 'platform_bilibili', 'B站模拟账号', 'mock', 'connected', '{"mode":"simulate"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('account_xiaohongshu_mock', 'platform_xiaohongshu', '小红书模拟账号', 'mock', 'connected', '{"mode":"simulate"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "AdaptedContent" (
  "id",
  "contentId",
  "platformId",
  "title",
  "body",
  "tags",
  "warnings",
  "isEdited",
  "adaptedAt",
  "updatedAt"
) VALUES
  ('adapted_wechat_demo_001', 'content_demo_001', 'platform_wechat', '如何把一篇内容高效发布到多个平台', '<p><h1>背景</h1><br />很多创作者会同时维护公众号、知乎、B站和小红书。</p>', '["创作","内容运营","多平台发布"]', '[]', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('adapted_zhihu_demo_001', 'content_demo_001', 'platform_zhihu', '如何把一篇内容高效发布到多个平台：我的实践总结', '## 核心观点\n\n多平台发布的关键是先保留一份完整原文，再针对不同平台生成不同表达。\n\n## 结论\n\n工具应该减少重复劳动，而不是替代创作者判断。', '["创作","效率工具","多平台发布"]', '[]', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('adapted_bilibili_demo_001', 'content_demo_001', 'platform_bilibili', '如何把一篇内容高效发布到多个平台', '这篇内容适合拆成几个清晰段落：背景、目标、实践建议和结论。\n\n---\n欢迎在评论区补充你的多平台发布流程。', '["创作","内容运营","B站专栏"]', '[]', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('adapted_xiaohongshu_demo_001', 'content_demo_001', 'platform_xiaohongshu', '多平台发布效率工具', '一篇内容同步到多个平台，难点不是复制粘贴，而是格式和语气适配。\n\n建议先写完整原文，再生成公众号、知乎、B站和小红书版本。\n\n#创作 #效率工具 #多平台发布', '["创作","效率工具","多平台发布"]', '[]', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "PublishTask" (
  "id",
  "contentId",
  "mode",
  "status",
  "platformCount",
  "successCount",
  "failedCount",
  "createdAt",
  "startedAt",
  "finishedAt"
) VALUES (
  'task_demo_001',
  'content_demo_001',
  'simulate',
  'success',
  4,
  4,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO "PublishRecord" (
  "id",
  "taskId",
  "contentId",
  "platformId",
  "adaptedContentId",
  "accountId",
  "status",
  "message",
  "platformPostId",
  "platformUrl",
  "requestSnapshot",
  "responseSnapshot",
  "publishedAt",
  "createdAt"
) VALUES
  ('record_wechat_demo_001', 'task_demo_001', 'content_demo_001', 'platform_wechat', 'adapted_wechat_demo_001', 'account_wechat_mock', 'success', '模拟发布成功，未调用真实平台 API。', 'mock_wechat_001', 'https://example.local/wechat/mock_wechat_001', '{"mode":"simulate"}', '{"success":true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('record_zhihu_demo_001', 'task_demo_001', 'content_demo_001', 'platform_zhihu', 'adapted_zhihu_demo_001', 'account_zhihu_mock', 'success', '模拟发布成功，未调用真实平台 API。', 'mock_zhihu_001', 'https://example.local/zhihu/mock_zhihu_001', '{"mode":"simulate"}', '{"success":true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('record_bilibili_demo_001', 'task_demo_001', 'content_demo_001', 'platform_bilibili', 'adapted_bilibili_demo_001', 'account_bilibili_mock', 'success', '模拟发布成功，未调用真实平台 API。', 'mock_bilibili_001', 'https://example.local/bilibili/mock_bilibili_001', '{"mode":"simulate"}', '{"success":true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('record_xiaohongshu_demo_001', 'task_demo_001', 'content_demo_001', 'platform_xiaohongshu', 'adapted_xiaohongshu_demo_001', 'account_xiaohongshu_mock', 'success', '模拟发布成功，未调用真实平台 API。', 'mock_xiaohongshu_001', 'https://example.local/xiaohongshu/mock_xiaohongshu_001', '{"mode":"simulate"}', '{"success":true}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

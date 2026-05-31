export function PlatformExtensionGuide() {
  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
      <h2 className="text-lg font-semibold">新增平台流程</h2>
      <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        <li>1. 输入平台网址，系统解析域名并匹配本地模板库。</li>
        <li>2. 命中模板时自动带出平台名称、字数限制、必填字段和适配规则。</li>
        <li>3. 未命中模板时，根据域名生成一套通用配置，避免从零填写。</li>
        <li>4. 保存前可以展开高级配置，微调标签、前后缀、清理 Markdown 等规则。</li>
      </ol>
      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        自定义平台当前支持内容适配和模拟发布，不接真实授权与真实发布。后续可以继续加入样例内容分析和 AI 推断，但保存前仍由用户确认。
      </div>
    </aside>
  )
}

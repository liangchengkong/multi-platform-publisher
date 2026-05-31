export function PlatformExtensionGuide() {
  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
      <h2 className="text-lg font-semibold">新增平台接入方式</h2>
      <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        <li>1. 在平台 registry 增加 `PlatformDefinition`。</li>
        <li>2. 实现 `ContentAdapter.adapt`，输出平台专属版本。</li>
        <li>3. 实现 `simulatePublish` 或真实发布器，返回发布结果。</li>
        <li>4. 真实发布时再接入 OAuth、凭据加密和平台 API。</li>
      </ol>
      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        页面只消费统一的平台定义和发布能力，新增平台不需要改工作台主流程。
      </div>
    </aside>
  )
}

export default function HomePage() {
  return (
    <main className="bg-background p-8 text-foreground">
      <p className="font-accent text-muted">
        Foundation ready — brand tokens, fonts, theming, TanStack Query.
      </p>

      <section className="mt-6 rounded-base border border-border bg-surface p-6">
        <h2 className="font-display text-xl">Soft-pink surface</h2>
        <p className="mt-2 text-sm text-muted">Card on the brand surface token.</p>
        <div className="mt-4 flex items-center gap-3">
          <button className="rounded-base bg-primary px-4 py-2 text-primary-foreground">
            Add to cart
          </button>
          <span className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
            New
          </span>
        </div>
      </section>
    </main>
  );
}

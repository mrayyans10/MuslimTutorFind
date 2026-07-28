export function ContentPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
      {intro ? <p className="mt-4 text-lg text-muted-foreground">{intro}</p> : null}
      <div className="prose prose-neutral mt-8 max-w-none text-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  );
}

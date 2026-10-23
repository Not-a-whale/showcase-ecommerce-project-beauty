export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full items-center justify-center bg-background px-4 py-16">
      {children}
    </main>
  );
}

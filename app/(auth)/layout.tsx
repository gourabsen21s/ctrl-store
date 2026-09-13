// Auth pages use a full-screen overlay that sits above the global nav/footer.
// We cannot re-render <html>/<body> in a nested layout — only root layout owns those.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black text-white overflow-y-auto">
      {children}
    </div>
  );
}

import { cn } from "@/lib/utils.js";

export function PageContainer({ children, className }) {
  return (
    <main className={cn("container py-6 md:py-8 animate-fade-in", className)}>
      {children}
    </main>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}


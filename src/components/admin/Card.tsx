import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  titleClass?: string;
  headerAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function Card({
  title,
  titleClass,
  headerAction,
  className,
  children,
}: CardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200", className)}>
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className={cn("font-semibold", titleClass)}>{title}</h3>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}

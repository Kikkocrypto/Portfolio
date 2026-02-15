import { FileText } from 'lucide-react';

interface BlogEmptyStateProps {
  message: string;
  description?: string;
}

/**
 * Empty state component for blog section.
 * Displays when no posts are available.
 * 
 * @param message - Main message to display
 * @param description - Optional supporting text
 */
export function BlogEmptyState({ message, description }: BlogEmptyStateProps) {
  return (
    <div className="py-24 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4A574]/10 mb-6">
        <FileText className="w-8 h-8 text-[#D4A574]" />
      </div>
      <h3 className="text-2xl font-light text-[#2C2416] mb-3">
        {message}
      </h3>
      {description && (
        <p className="text-lg text-[#6B5D4F]/60 max-w-md mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

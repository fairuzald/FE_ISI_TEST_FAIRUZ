import { P } from "@/components/ui/typography";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-r-transparent mx-auto"></div>
        <P className="mt-4 text-gray-600 dark:text-gray-400">Loading...</P>
      </div>
    </div>
  );
}

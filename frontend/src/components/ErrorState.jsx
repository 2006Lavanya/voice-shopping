const ErrorState = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="text-5xl mb-4">⚠️</div>
    <p className="text-zinc-600 dark:text-zinc-300 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-5 py-2 bg-brand-black text-white rounded-full font-medium hover:opacity-90 transition"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorState;

import { Link } from "react-router-dom";

const EmptyState = ({ icon = "🛒", title, subtitle, actionLabel, actionTo }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
    {subtitle && <p className="text-zinc-500 mt-2 max-w-sm">{subtitle}</p>}
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="mt-6 px-6 py-3 bg-brand-pink text-white rounded-full font-medium hover:bg-brand-pinkDark transition shadow-cardHover"
      >
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;

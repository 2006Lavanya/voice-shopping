import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-7xl font-extrabold text-brand-pink">404</h1>
    <p className="text-xl font-semibold mt-4">Page Not Found</p>
    <p className="text-zinc-500 mt-2 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/" className="mt-6 px-6 py-3 bg-brand-pink text-white rounded-full font-medium">Go Home</Link>
  </div>
);

export default NotFound;

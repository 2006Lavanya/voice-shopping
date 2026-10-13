const ProductCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-card">
    <div className="skeleton h-48 w-full" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="skeleton h-6 w-1/3 rounded" />
    </div>
  </div>
);

export default ProductCardSkeleton;

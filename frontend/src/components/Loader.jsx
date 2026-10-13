const Loader = ({ full = false }) => (
  <div className={`flex items-center justify-center ${full ? "min-h-[60vh]" : "py-10"}`}>
    <div className="w-10 h-10 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
  </div>
);

export default Loader;

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating = 0, size = 14, showValue = true }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} size={size} className="text-amber-400" />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} size={size} className="text-amber-400" />);
    else stars.push(<FaRegStar key={i} size={size} className="text-amber-400" />);
  }
  return (
    <div className="flex items-center gap-1">
      {stars}
      {showValue && <span className="text-xs text-zinc-500 ml-1">({rating?.toFixed?.(1) ?? rating})</span>}
    </div>
  );
};

export default StarRating;

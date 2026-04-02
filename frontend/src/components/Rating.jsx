import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text, className = '' }) => {
  return (
    <div className={`flex items-center gap-0 sm:gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {value >= star ? (
            <FaStar className="text-yellow-400 text-xs sm:text-base" />
          ) : value >= star - 0.5 ? (
            <FaStarHalfAlt className="text-yellow-400 text-sm sm:text-base" />
          ) : (
            <FaRegStar className="text-yellow-400 text-sm sm:text-base" />
          )}
        </span>
      ))}

      {text && (
        <span className="text-xs sm:text-sm text-gray-600 ml-2 whitespace-nowrap">
          {text}
        </span>
      )}
    </div>
  );
};

export default Rating;
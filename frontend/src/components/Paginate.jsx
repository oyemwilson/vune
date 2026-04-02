import { Link } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
  return (
    pages > 1 && (
      <div className="flex justify-center mt-4">
        <div className="flex rounded-md">
          {[...Array(pages).keys()].map((x) => (
            <Link
              key={x + 1}
              to={
                !isAdmin
                  ? keyword
                    ? `/search/${keyword}/page/${x + 1}`
                    : `/page/${x + 1}`
                  : `/admin/productlist/${x + 1}`
              }
              className={`px-4 py-2 border border-gray-300 ${x + 1 === page ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} hover:bg-gray-100`}
            >
              {x + 1}
            </Link>
          ))}
        </div>
      </div>
    )
  );
};

export default Paginate;

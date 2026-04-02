import { useParams, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Product from '../components/Product';
import { FreeMode } from "swiper/modules";


import {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetSaleProductsQuery,
  useGetBestSellersQuery,
  useGetNewArrivalsQuery,
} from '../slices/productsApiSlice';

const Loader = lazy(() => import('../components/Loader'));
const Message = lazy(() => import('../components/Message'));
const Paginate = lazy(() => import('../components/Paginate'));
const ProductCarousel = lazy(() => import('../components/ProductCarousel'));
const Meta = lazy(() => import('../components/Meta'));

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();

  const { data, isLoading, error } = useGetProductsQuery({ keyword, pageNumber });

  const { data: featuredData } = useGetFeaturedProductsQuery(undefined, { skip: !!keyword });
  const { data: saleData }     = useGetSaleProductsQuery(undefined,     { skip: !!keyword });
  const { data: bestSellersData } = useGetBestSellersQuery(undefined,   { skip: !!keyword });
  const { data: newArrivalsData } = useGetNewArrivalsQuery(undefined,   { skip: !!keyword });

  return (
    <div className="bg-[#faf7f0] sm:px-4 md:px-8 lg:px-16 ">
      <Suspense fallback={<div className="text-center py-10">Loading...</div>}>

        {/* {!keyword ? (
          <div className="mb-8">
            <ProductCarousel />
          </div>
        ) : (
          <Link
            to="/"
            className="inline-block mb-6 bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-md transition"
          >
            ← Back to Home
          </Link>
        )} */}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <Meta />

<div className="-mx-20 md:-mx-48 lg:-mx-64 ">

  {/* 📱 Mobile Image */}
  <div
    className="w-full h-[600px] bg-cover bg-top flex items-center md:hidden"
    style={{ backgroundImage: "url('/images/home-mobile.webp')" }}
  >
    <div className="ml-6 text-white">
      {/* mobile content */}
    </div>
  </div>

  {/* 💻 Desktop Image */}
  <div
    className="hidden md:flex w-full md:h-[400px] lg:h-[700px] bg-cover bg-center items-center"
    style={{ backgroundImage: "url('/images/hero.webp')" }}
  >
    <div className="ml-16 text-white">
      {/* desktop content */}
    </div>
  </div>

</div>

            {featuredData?.length > 0 && (
              <SliderSection title="Featured Items" products={featuredData} link="/featured"/>
            )}

            {saleData?.products?.length > 0 && (
              <SliderSection title="Special Offers" products={saleData.products.slice(0, 8)}  link="/sale"/>
            )}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full">
  
  {/* LEFT IMAGE */}
  <div className="relative">
    <img
      src="/images/bottle2.webp"
      alt="Perfume 1"
      className="w-full sm:w-[300px] md:w-[40rem] h-[25rem] sm:h-[40rem] object-cover object-top rounded-xl"
    />

    {/* Overlay Content */}
    <div className="absolute bottom-6 left-6 text-white">
      <h2 className="text-xl md:text-3xl font-semibold mb-2">
        New Brands
      </h2>
      <button className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition">
        SHOP NOW
      </button>
    </div>
  </div>

  {/* RIGHT IMAGE */}
  <div className="relative">
    <img
      src="/images/bottle1.webp"
      alt="Perfume 2"
      className="w-full sm:w-[200px] md:w-[40rem] h-[25rem] sm:h-[40rem] object-cover object-top rounded-xl"
    />

    {/* Overlay Content */}
    <div className="absolute bottom-6 left-6 text-white">
      <h2 className="text-xl md:text-3xl font-semibold mb-2">
        Skin Love
      </h2>
      <button className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition">
        SHOP NOW
      </button>
    </div>
  </div>

</div>

            {bestSellersData?.length > 0 && (
              <SliderSection title="Best Sellers" products={bestSellersData}  link="/bestseller"/>
            )}

<div className="relative w-full h-[70vh] md:h-[50vh]  overflo-hidden">

  {/* Background Video */}
  <video
    src="/images/perfume.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full  object-cover"
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Content */}
  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
    
    <h1 className="text-3xl md:text-6xl font-serif mb-4">
      Discover Luxury Fragrance
    </h1>

    <p className="text-sm md:text-lg mb-6 max-w-xl">
      Elevate your presence with timeless scents crafted for elegance.
    </p>

    <button className="border border-white px-6 py-3 text-sm md:text-base hover:bg-white hover:text-black transition">
      SHOP NOW
    </button>

  </div>

</div>

            {newArrivalsData?.length > 0 && (
              <SliderSection title="New Arrivals" products={newArrivalsData} link="/shop"/>
            )}

            <SliderSection title="Latest Products" products={data.products.slice(0, 8)} />

            <div className="flex justify-center mt-8">
              <Paginate
                pages={data.pages}
                page={data.page}
                keyword={keyword ? keyword : ''}
              />
            </div>
          </>
        )}
      </Suspense>
    </div>
  );
};

const SliderSection = ({ title, products, link }) => {
  return (
    <section className="mb-14 mt-14">
      <div className="text-center mb-6">
        <h2 className="sm:text-5xl text-3xl font-medium text-gray-900 header-underline px-12 ms:px-32 py-4 mb-2">{title}</h2>
        {/* <div className="w-64 h-0.5 bg-gray-800 mx-auto mt-2"></div> */}
      </div>

<Swiper
  modules={[Autoplay, FreeMode]}

  // 🔥 Smooth feel
  speed={800}                  // transition duration (higher = smoother)
  freeMode={{
    enabled: true,
    momentum: true,
    momentumRatio: 0.6,
    momentumVelocityRatio: 0.8,
  }}

  // 🔥 Autoplay
  autoplay={{
    delay: 3000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  }}

  loop={true}

  // 🔥 Better touch/swipe behavior
  grabCursor={true}
  touchRatio={1.2}
  resistanceRatio={0.85}

  // 🔥 This ensures it slides in groups (IMPORTANT)
  breakpoints={{
    0: {
      slidesPerView: 2,
      slidesPerGroup: 2,
      spaceBetween: 12,
    },
    768: {
      slidesPerView: 2,
      slidesPerGroup: 2,
      spaceBetween: 16,
    },
    1024: {
      slidesPerView: 4,
      slidesPerGroup: 4,
      spaceBetween: 20,
    },
  }}
>
  {products.map((product) => (
    <SwiperSlide key={product._id}>
      <Product product={product} />
    </SwiperSlide>
  ))}
</Swiper>
{link && (
        <div className="flex justify-center mt-6">
          <Link
            to={link}
            className="text-sm sm:text-base font-medium text-gray-800 border-b border-gray-800 hover:text-black transition"
          >
            View All →
          </Link>
        </div>
      )}
    </section>
  );
};

export default HomeScreen;
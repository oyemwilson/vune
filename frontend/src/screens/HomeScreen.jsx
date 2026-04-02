import { useParams, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
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
const Meta = lazy(() => import('../components/Meta'));

// ── SKELETON COMPONENTS ──────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="animate-pulse px-1">
    <div className="bg-gray-200 rounded-lg h-56 w-full mb-3" />
    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
  </div>
);

const SkeletonSlider = () => (
  <section className="mb-14 mt-14">
    <div className="text-center mb-6">
      <div className="animate-pulse h-8 bg-gray-200 rounded w-48 mx-auto mb-2" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </section>
);

const SkeletonHero = () => (
  <div className="animate-pulse bg-gray-200 w-full h-[600px] md:h-[700px]" />
);

const SkeletonDuoImages = () => (
  <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full">
    <div className="animate-pulse bg-gray-200 rounded-xl w-full md:w-[40rem] h-[25rem] sm:h-[40rem]" />
    <div className="animate-pulse bg-gray-200 rounded-xl w-full md:w-[40rem] h-[25rem] sm:h-[40rem]" />
  </div>
);

const SkeletonVideo = () => (
  <div className="animate-pulse bg-gray-200 w-full h-[70vh] md:h-[50vh]" />
);

// ────────────────────────────────────────────────────────────────────

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();

  const { data, isLoading, error } = useGetProductsQuery({ keyword, pageNumber });

  const { data: featuredData, isLoading: featuredLoading } = useGetFeaturedProductsQuery(undefined, { skip: !!keyword });
  const { data: saleData, isLoading: saleLoading }         = useGetSaleProductsQuery(undefined,     { skip: !!keyword });
  const { data: bestSellersData, isLoading: bestLoading }  = useGetBestSellersQuery(undefined,      { skip: !!keyword });
  const { data: newArrivalsData, isLoading: newLoading }   = useGetNewArrivalsQuery(undefined,      { skip: !!keyword });

  const sectionsLoading = isLoading || featuredLoading || saleLoading || bestLoading || newLoading;

  return (
    <div className="bg-[#faf7f0] sm:px-4 md:px-8 lg:px-16">
      <Suspense fallback={<div className="text-center py-10">Loading...</div>}>

        {keyword && (
          <Link
            to="/"
            className="inline-block mb-6 bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-md transition"
          >
            ← Back to Home
          </Link>
        )}

        {error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : sectionsLoading ? (
          // ── SKELETON LAYOUT ─────────────────────────────────────
          <>
            <SkeletonHero />
            <SkeletonSlider />
            <SkeletonDuoImages />
            <SkeletonSlider />
            <SkeletonVideo />
            <SkeletonSlider />
            <SkeletonSlider />
          </>
        ) : (
          <>
            <Meta />

            <div className="-mx-20 md:-mx-48 lg:-mx-64">
              {/* 📱 Mobile Image */}
              <div
                className="w-full h-[600px] bg-cover bg-top flex items-center md:hidden"
                style={{ backgroundImage: "url('/images/home-mobile.webp')" }}
              >
                <div className="ml-6 text-white" />
              </div>

              {/* 💻 Desktop Image */}
              <div
                className="hidden md:flex w-full md:h-[400px] lg:h-[700px] bg-cover bg-center items-center"
                style={{ backgroundImage: "url('/images/hero.webp')" }}
              >
                <div className="ml-16 text-white" />
              </div>
            </div>

            {featuredData?.length > 0 && (
              <SliderSection title="Featured Items" products={featuredData} link="/featured" />
            )}

            {saleData?.products?.length > 0 && (
              <SliderSection title="Special Offers" products={saleData.products.slice(0, 8)} link="/sale" />
            )}

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full">
              <div className="relative">
                <img
                  src="/images/bottle2.webp"
                  alt="Perfume 1"
                  className="w-full sm:w-[300px] md:w-[40rem] h-[25rem] sm:h-[40rem] object-cover object-top rounded-xl"
                />
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-xl md:text-3xl font-semibold mb-2">New Brands</h2>
                  <button className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition">SHOP NOW</button>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/images/bottle1.webp"
                  alt="Perfume 2"
                  className="w-full sm:w-[200px] md:w-[40rem] h-[25rem] sm:h-[40rem] object-cover object-top rounded-xl"
                />
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-xl md:text-3xl font-semibold mb-2">Skin Love</h2>
                  <button className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition">SHOP NOW</button>
                </div>
              </div>
            </div>

            {bestSellersData?.length > 0 && (
              <SliderSection title="Best Sellers" products={bestSellersData} link="/bestseller" />
            )}

            <div className="relative w-full h-[70vh] md:h-[50vh] overflow-hidden">
              <video
                src="/images/perfume.mp4"
                autoPlay loop muted playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
                <h1 className="text-3xl md:text-6xl font-serif mb-4">Discover Luxury Fragrance</h1>
                <p className="text-sm md:text-lg mb-6 max-w-xl">Elevate your presence with timeless scents crafted for elegance.</p>
                <button className="border border-white px-6 py-3 text-sm md:text-base hover:bg-white hover:text-black transition">SHOP NOW</button>
              </div>
            </div>

            {newArrivalsData?.length > 0 && (
              <SliderSection title="New Arrivals" products={newArrivalsData} link="/shop" />
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
        <h2 className="sm:text-5xl text-3xl font-medium text-gray-900 header-underline px-12 sm:px-32 py-4 mb-2">{title}</h2>
      </div>

      <Swiper
        modules={[Autoplay, FreeMode]}
        speed={800}
        freeMode={{ enabled: true, momentum: true, momentumRatio: 0.6, momentumVelocityRatio: 0.8 }}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={true}
        grabCursor={true}
        touchRatio={1.2}
        resistanceRatio={0.85}
        breakpoints={{
          0:    { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 12 },
          768:  { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 16 },
          1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20 },
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
import Slider from "react-slick";

const ProductSliderSection = ({ title, products, ProductComponent }) => {
  const settings = {
    dots: false,
    infinite: products.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024, // tablets
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 768, // mobile
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  };

  return (
    <section className="mb-14">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
      </div>

      <Slider {...settings}>
        {products.map((product) => (
          <div key={product._id} className="px-2">
            <ProductComponent product={product} />
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default ProductSliderSection;

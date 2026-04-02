import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title : 'VUNÈ | Luxury Perfumes & Signature Scents',
  description : 'Discover premium fragrances crafted for elegance, confidence, and timeless appeal. Shop luxury perfumes at VUNÈ.',
  keywords : 'perfume, luxury fragrance, cologne, scents, Vune perfumes, designer perfumes, unisex fragrance',

};

export default Meta;

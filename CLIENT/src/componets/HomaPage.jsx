import React from "react";
import Navbar from "../pages/navBar";
import HeroBanner from "../pages/HeroBanner";
import FeatureSection from "../pages/FeatureSection";
import FeaturedProducts from "../pages/FeaturedProducts";
import StyleCollections from "../pages/StyleCollections";
import NewArrivals from "../pages/NewArrivals";
import Testimonials from "../pages/Testimonials";
import Footer from "../pages/Footer";
import BestSelling from "../pages/BestSelling";


function HomaPage() {
  return (
    <div>
      <HeroBanner />
      <FeatureSection></FeatureSection>
      <BestSelling />
      <NewArrivals />
      <StyleCollections />
      <FeaturedProducts />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default HomaPage;

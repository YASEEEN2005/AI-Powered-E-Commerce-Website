import React, { useEffect, useRef } from "react";
import HeroBanner from "../pages/HeroBanner";
import FeatureSection from "../pages/FeatureSection";
import FeaturedProducts from "../pages/FeaturedProducts";
import StyleCollections from "../pages/StyleCollections";
import NewArrivals from "../pages/NewArrivals";
import Testimonials from "../pages/Testimonials";
import Footer from "../pages/Footer";
import BestSelling from "../pages/BestSelling";

function HomaPage() {
  const bestSellingRef = useRef(null);
  const newArrivalsRef = useRef(null);

  useEffect(() => {
    const target = sessionStorage.getItem("scrollTo");

    if (target === "best-selling") {
      bestSellingRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (target === "new-arrivals") {
      newArrivalsRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    sessionStorage.removeItem("scrollTo");
  }, []);

  return (
    <div>
      <HeroBanner />
      <FeatureSection />

      <BestSelling ref={bestSellingRef} />
      <NewArrivals ref={newArrivalsRef} />

      <StyleCollections />
      <FeaturedProducts />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default HomaPage;

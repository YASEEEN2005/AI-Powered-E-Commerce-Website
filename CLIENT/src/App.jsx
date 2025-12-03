import React from 'react'
import Navbar from './componets/navBar'
import HeroBanner from './componets/HeroBanner'
import FeatureSection from './componets/FeatureSection'
import FeaturedProducts from './componets/FeaturedProducts'
import StyleCollections from './componets/StyleCollections'
import NewArrivals from './componets/NewArrivals'
import Testimonials from './componets/Testimonials'
import Footer from './componets/Footer'

function App() {
  return (
    <div>
      <Navbar />
      <HeroBanner />
      <FeatureSection ></FeatureSection>
      <FeaturedProducts />
      <StyleCollections />
      <NewArrivals />
      <Testimonials />
      <Footer />
    </div>
  )
}

export default App

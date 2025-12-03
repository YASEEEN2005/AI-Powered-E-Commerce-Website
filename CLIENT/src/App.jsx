import React from 'react'
import Navbar from './componets/navBar'
import HeroBanner from './componets/HeroBanner'
import FeatureSection from './componets/FeatureSection'
import FeaturedProducts from './componets/FeaturedProducts'
import StyleCollections from './componets/StyleCollections'
import NewArrivals from './componets/NewArrivals'

function App() {
  return (
    <div>
      <Navbar />
      <HeroBanner />
      <FeatureSection ></FeatureSection>
      <FeaturedProducts />
      <StyleCollections />
      <NewArrivals />
    </div>
  )
}

export default App

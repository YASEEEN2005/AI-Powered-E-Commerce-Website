import React from 'react'
import Navbar from './componets/navBar'
import HeroBanner from './componets/HeroBanner'
import FeatureSection from './componets/FeatureSection'
import FeaturedProducts from './componets/FeaturedProducts'

function App() {
  return (
    <div>
      <Navbar />
      <HeroBanner />
      <FeatureSection ></FeatureSection>
      <FeaturedProducts />
    </div>
  )
}

export default App

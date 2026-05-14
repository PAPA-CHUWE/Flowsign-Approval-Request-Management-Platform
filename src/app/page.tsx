import React from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import ProductSection from '@/components/landing/ProductSection'
import PricingPage from '@/components/landing/PricingPage'
import ContactUs from '@/components/landing/ContactUs'
import Footer from '@/components/landing/Footer'

const Home = () => {
  return (
    <main className='w-full overflow-x-hidden overflow-y-auto scroll-smooth'>
      <Navbar />
      <Hero />
      <ProductSection />
      <PricingPage />
      <ContactUs />
      <Footer />
    </main>
  )
}

export default Home

// app/page.tsx
import Navbar from "#/Navbar";
import Hero from "#/Hero";
import About from "#/About";
import Services from "#/Services";
import Contact from "#/Contact";
import Footer from "#/Footer";

export default function vitrinePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Contact />
      <Footer />
    </>
  );
}
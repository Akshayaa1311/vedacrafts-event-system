import Navbar from "./Components/Nav";
import Hero from "./Components/Hero";
import Glimpses from "./Components/Glimpses";
import Benefits from "./Components/Benefits";
import Speakers from "./Components/Speakers";
import CTA from "./Components/CTA";
import Footer from "./Components/Footer";
import StickyRegisterBar from "./Components/Bottombar";


function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Glimpses />
      <Benefits />
      <Speakers />
      <CTA />
      <Footer />
      <StickyRegisterBar />
    </>

  );
}

export default App;
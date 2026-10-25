import WhyChooseUs from "@/components/homepage/WhyChooseUs";
import Banner from "../components/homepage/Banner";
import FeatureDestinations from "../components/homepage/FeaturedDestinations"
import Testimonials from "@/components/homepage/Testimonials";
import CallToAction from "@/components/homepage/CallToAction";

export default function Home() {
  return (
    <>
      <Banner />
      <FeatureDestinations/>
      <WhyChooseUs/>
      <Testimonials/>
      <CallToAction/>
    </>
  );
}

import { Head } from '@inertiajs/react';
import { Box } from '@mui/material';
import AboutSection from './components/About';
import FeaturesSection from './components/FeatureSection';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import WorkflowSection from './components/WorkflowSection';

export default function Landing() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <Head title="SLR AI Ebizmark" />

      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
        }}
      >
        <Navbar onNavigate={scrollToSection} />

        <Box component="main">
          <HeroSection />

          <Box id="features">
            <FeaturesSection />
          </Box>

          <Box id="workflow">
            <WorkflowSection />
          </Box>

          <Box id="about">
            <AboutSection />
          </Box>
        </Box>

        <Footer />
      </Box>
    </>
  );
}

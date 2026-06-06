import { useQuery } from '@tanstack/react-query';
import { cmsAPI, mediaAPI } from '@services/api';
import HeroSection from '../components/hero/HeroSection';
import StatsSection from '../components/stats/StatsSection';
import HODSection from '../components/HODSection';
import FacultySection from '../components/faculty/FacultySection';
import AchievementsSection from '../components/achievements/AchievementsSection';
import PlacementsSection from '../components/placements/PlacementsSection';
import InternshipsSection from '../components/InternshipsSection';
import HackathonsSection from '../components/HackathonsSection';
import GallerySection from '../components/gallery/GallerySection';
import ResearchSection from '../components/ResearchSection';
import AlumniSection from '../components/alumni/AlumniSection';
import ContactSection from '../components/contact/ContactSection';
import PageLoader from '@shared/components/ui/PageLoader';

export default function HomePage() {
  const { data: cms, isLoading } = useQuery({
    queryKey: ['cms', 'public'],
    queryFn:  () => cmsAPI.getPublicSections().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <PageLoader />;

  const get = (key) => cms?.find?.((s) => s.sectionKey === key)?.data || {};

  return (
    <>
      <HeroSection       data={get('hero')} />
      <StatsSection      data={get('stats')} />
      <HODSection        data={get('hod')} />
      <FacultySection    data={get('faculty')} />
      <AchievementsSection data={get('achievements')} />
      <PlacementsSection data={get('placements')} />
      <InternshipsSection data={get('internships')} />
      <HackathonsSection  data={get('hackathons')} />
      <GallerySection    data={get('gallery')} />
      <ResearchSection   data={get('research')} />
      <AlumniSection     data={get('alumni')} />
      <ContactSection    data={get('contact')} />
    </>
  );
}

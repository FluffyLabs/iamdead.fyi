import { Footer } from './footer';
import { MainPage } from './main';
import { Navigation } from '../../components/navigation';

export const Home = () => {
  return (
    <>
      <Navigation
        fill
        isFixed
      />
      <MainPage />
      <Footer />
    </>
  );
};

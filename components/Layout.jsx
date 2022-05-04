import Footer from './Footer';
import Header from './Header';
const Layout = ({ children }) => {
  return (
    <div className='relative min-h-screen'>
      <Header />
      <div className='pb-32 xs:pb-28 sm:pb-28 md:pb-12 lg:pb-4'>{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;

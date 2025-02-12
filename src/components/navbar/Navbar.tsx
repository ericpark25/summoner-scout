import Link from 'next/link';
import Container from '../global/Container';
import Search from '../search/Search';

const Navbar = () => {
  return (
    <nav className='bg-primary-foreground py-4'>
      <Container className='flex justify-between items-center'>
        <Link href='/'>
          <h2 className='hidden md:block text-2xl font-bold text-primary'>
            Summoner<span className='text-secondary-foreground'>Scout</span>
          </h2>
        </Link>
        <Search nav={true} />
      </Container>
    </nav>
  );
};
export default Navbar;

import Container from '@/components/global/Container';
import Navbar from '@/components/navbar/Navbar';

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Container>
        <main>{children}</main>
      </Container>
    </>
  );
}

import Search from '@/components/search/Search';

export default function Home() {
  return (
    <main className='min-w-full min-h-screen flex flex-col items-center justify-center gap-y-6 p-4'>
      <h1 className='text-5xl font-bold tracking-wide text-primary'>
        Summoner<span className='text-secondary-foreground'>Scout</span>
      </h1>
      <Search nav={false} />
    </main>
  );
}

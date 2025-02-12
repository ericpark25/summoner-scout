'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Search = ({ nav }: { nav: boolean }) => {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('na1'); // Default to NA
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!gameName.trim() || !tagLine.trim()) {
      setError('Please enter both a game name and tag line.');
      setIsLoading(false);
      return;
    }

    // console.log(region, gameName, tagLine);

    try {
      router.push(`/summoner/${region}/${gameName}-${tagLine}`);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!nav) {
    return (
      <div className='border p-4 rounded-lg shadow-md w-full max-w-md mx-auto'>
        <form onSubmit={handleSearch} className='gap-2 flex justify-between'>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className='w-[100px]'>
              <SelectValue placeholder='Region' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Region</SelectLabel>
                <SelectItem value='na1'>NA</SelectItem>
                <SelectItem value='euw1'>EUW</SelectItem>
                <SelectItem value='eun1'>EUNE</SelectItem>
                <SelectItem value='kr1'>KR</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            type='text'
            placeholder='Summoner Name'
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className='w-[180px]'
          />
          <Input
            type='text'
            placeholder='Tag Line'
            value={tagLine}
            onChange={(e) => setTagLine(e.target.value)}
            className='w-[80px]'
          />
          <Button type='submit'>Search</Button>
        </form>
        {error && <div className='mt-2 text-destructive text-sm'>{error}</div>}
      </div>
    );
  }
  return (
    <div className='flex-col'>
      <form onSubmit={handleSearch} className='gap-2 flex justify-between'>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className='w-[100px]'>
            <SelectValue placeholder='Region' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Region</SelectLabel>
              <SelectItem value='na1'>NA</SelectItem>
              <SelectItem value='euw1'>EUW</SelectItem>
              <SelectItem value='eun1'>EUNE</SelectItem>
              <SelectItem value='kr1'>KR</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          type='text'
          placeholder='Summoner Name'
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          className='w-[180px]'
        />
        <Input
          type='text'
          placeholder='Tag Line'
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          className='w-[80px]'
        />
        <Button type='submit' disabled={isLoading}>
          Search
        </Button>
      </form>
      {error && <div className='mt-2 text-destructive text-sm'>{error}</div>}
    </div>
  );
};
export default Search;

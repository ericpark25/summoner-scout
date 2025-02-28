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
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';
import { regions } from '@/utils/regions';
import { Loader2 } from 'lucide-react';

type SearchProps = {
  variant: 'navbar' | 'home';
  className?: string;
};

const Search = ({ variant, className }: SearchProps) => {
  const {
    gameName,
    tagLine,
    region,
    errors,
    isLoading,
    submitted,
    setRegion,
    handleGameNameChange,
    handleTagLineChange,
    handleSearch,
  } = useSearch();

  const isNavbar = variant === 'navbar';

  return (
    <div
      className={cn(
        isNavbar
          ? 'flex-col'
          : 'border p-4 rounded-lg shadow-md w-full max-w-md mx-auto',
        className
      )}
    >
      <form
        onSubmit={handleSearch}
        className={isNavbar ? 'flex flex-col' : 'flex flex-col gap-3'}
      >
        <div className='flex gap-2'>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className='w-[100px]'>
              <SelectValue placeholder='Region' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Region</SelectLabel>
                {regions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className={isNavbar ? 'w-auto' : 'flex-1'}>
            <Input
              type='text'
              placeholder='Summoner Name'
              value={gameName}
              onChange={handleGameNameChange}
              className={cn(
                isNavbar ? 'w-[180px]' : 'w-full',
                submitted && errors.gameName ? 'border-red-500' : ''
              )}
              aria-invalid={submitted && !!errors.gameName}
            />
            {!isNavbar && submitted && errors.gameName && (
              <p className='text-xs text-destructive mt-1'>{errors.gameName}</p>
            )}
          </div>

          <div>
            <Input
              type='text'
              placeholder='Tagline'
              value={tagLine}
              onChange={handleTagLineChange}
              className={cn(
                'w-[80px]',
                submitted && errors.tagLine ? 'border-red-500' : ''
              )}
              aria-invalid={submitted && !!errors.tagLine}
            />
            {!isNavbar && submitted && errors.tagLine && (
              <p className='text-xs text-destructive mt-1'>{errors.tagLine}</p>
            )}
          </div>

          <Button type='submit' disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {/* Error messages for the navbar variant or general errors */}
        {submitted && (
          <>
            {isNavbar && (errors.gameName || errors.tagLine) && (
              <div className='mt-1 text-destructive text-sm'>
                {errors.gameName || errors.tagLine}
              </div>
            )}
            {errors.general && (
              <div className='mt-1 text-destructive text-sm'>
                {errors.general}
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
};
export default Search;

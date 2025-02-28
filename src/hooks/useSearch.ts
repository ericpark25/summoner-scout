'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Define validation patterns
const NAME_PATTERN = /^[\p{L}\p{N}\p{Z}\p{P}]{3,16}$/u;
const TAGLINE_PATTERN = /^[\p{L}\p{N}]{3,5}$/u;

export type SearchErrors = {
  gameName?: string;
  tagLine?: string;
  general?: string;
};

export function useSearch() {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('na1'); // default to NA
  const [errors, setErrors] = useState<SearchErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleGameNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGameName(value);

    if (submitted) {
      const newErrors = { ...errors };
      delete newErrors.gameName;
      delete newErrors.general;
      setErrors(newErrors);
    }
  };

  const handleTagLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagLine(value);

    if (submitted) {
      const newErrors = { ...errors };
      delete newErrors.tagLine;
      delete newErrors.general;
      setErrors(newErrors);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors: {
      gameName?: string;
      tagLine?: string;
      general?: string;
    } = {};

    if (!gameName.trim()) {
      newErrors.gameName = 'Summoner name is required';
    } else if (!NAME_PATTERN.test(gameName)) {
      newErrors.gameName = 'Summoner name must be between 3-16 characters';
    }

    if (!tagLine.trim()) {
      newErrors.tagLine = 'Tag line is required';
    } else if (!TAGLINE_PATTERN.test(tagLine)) {
      newErrors.tagLine = 'Tag line must be between 3-5 valid characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // console.log(region, gameName, tagLine);
    setIsLoading(true);

    try {
      router.push(`/summoner/${region}/${gameName.trim()}-${tagLine.trim()}`);
    } catch (err) {
      console.error('Navigation error:', err);
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return {
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
  };
}

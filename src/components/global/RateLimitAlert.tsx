'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '../ui/button';

type RateLimitAlertProps = {
  message: string;
  retryAfter?: number; // in ms
  onRetry?: () => void;
};

const RateLimitAlert = ({
  message,
  retryAfter,
  onRetry,
}: RateLimitAlertProps) => {
  const [countdown, setCountdown] = useState<number | null>(
    retryAfter ? Math.ceil(retryAfter / 1000) : null
  );
  const { toast } = useToast();

  useEffect(() => {
    // set the initial countdown
    if (!retryAfter) return;

    setCountdown(Math.ceil(retryAfter / 1000));

    // show toast notification
    toast({
      title: 'Rate Limit Reached',
      description: message,
      variant: 'destructive',
    });

    // set up countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // cleanup on unmount
    return () => clearInterval(timer);
  }, [message, retryAfter, toast]);

  // format countdown
  const formatCountdown = () => {
    if (countdown === null) return '';

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    if (minutes === 0) {
      return `${seconds}s`;
    }

    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <Card className='border-yellow-500 bg-yellow-50'>
      <CardContent className='p-4 flex flex-col gap-4'>
        <div className='flex items-center space-x-4'>
          <AlertTriangle className='h-6 w-6 text-yellow-500' />
          <div className='flex-1'>
            <h4 className='font-semibold text-slate-900'>Rate Limit Reached</h4>
            <p className='text-sm text-slate-700'>{message}</p>
          </div>
          {countdown !== null && countdown > 0 ? (
            <div className='flex items-center text-slate-700'>
              <Clock className='mr-2 h-4 w-4' />
              <span>{formatCountdown()}</span>
            </div>
          ) : (
            <div className='text-green-600 text-sm font-medium'>
              Ready to retry
            </div>
          )}
        </div>

        {/* Only show retry button if onRetry is provided */}
        {onRetry && (
          <Button
            variant='outline'
            className='self-end'
            disabled={countdown !== null && countdown > 0}
            onClick={() => setTimeout(onRetry, 0)}
          >
            {countdown !== null && countdown > 0
              ? `Retry in ${formatCountdown()}`
              : 'Retry Now'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
export default RateLimitAlert;

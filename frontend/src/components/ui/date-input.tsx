import React, { forwardRef, useRef } from 'react';
import { Input } from './input';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showIcon?: boolean;
}

/**
 * DateInput wraps a native date input, hiding the default picker indicator and providing
 * a custom calendar button aligned flush right. It calls showPicker() when supported.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className = '', showIcon = true, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement | null>(null);

    const handleOpen = () => {
      const el = (ref && typeof ref !== 'function' ? ref.current : innerRef.current) as (HTMLInputElement & { showPicker?: () => void }) | null;
      if (!el) return;
      if (typeof el.showPicker === 'function') {
        try { el.showPicker(); return; } catch { /* ignore */ }
      }
      el.focus();
    };

    return (
      <div className='relative'>
        <Input
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          type='date'
          className={
            'w-full h-10 pr-10 appearance-none [color-scheme:light] ' +
            '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute ' +
            className
          }
          {...props}
        />
        {showIcon && (
          <button
            type='button'
            aria-label='Pick date'
            className='absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md'
            onClick={handleOpen}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
              <line x1='16' y1='2' x2='16' y2='6' />
              <line x1='8' y1='2' x2='8' y2='6' />
              <line x1='3' y1='10' x2='21' y2='10' />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

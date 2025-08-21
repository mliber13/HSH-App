import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that debounces state updates
 * @param {any} initialValue - The initial value for the state
 * @param {number} delay - The delay in milliseconds before updating the debounced value
 * @returns {[any, any, function]} - [currentValue, debouncedValue, setValue]
 */
export function useDebouncedState(initialValue, delay = 500) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update both values when initialValue changes (e.g., when switching jobs)
  useEffect(() => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
  }, [initialValue]);

  return [value, debouncedValue, setValue];
}

/**
 * Custom hook specifically for numeric inputs with debouncing
 * @param {number} initialValue - The initial numeric value
 * @param {number} delay - The delay in milliseconds before updating the debounced value
 * @returns {[string, number, function]} - [displayValue, debouncedNumericValue, setDisplayValue]
 */
export function useDebouncedNumericState(initialValue, delay = 500) {
  const [displayValue, debouncedDisplayValue, setDisplayValue] = useDebouncedState(
    initialValue?.toString() || '', 
    delay
  );

  const debouncedNumericValue = parseFloat(debouncedDisplayValue) || 0;

  return [displayValue, debouncedNumericValue, setDisplayValue];
}
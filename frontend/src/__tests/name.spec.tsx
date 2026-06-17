import { describe, it, expect } from 'vitest';
import { getFirstName } from '../utils/name';

describe('getFirstName', () => {
  it('should extract the first name from a full name', () => {
    expect(getFirstName('Rahul Nair')).toBe('Rahul');
    expect(getFirstName('Priya Menon')).toBe('Priya');
    expect(getFirstName('Arjun Kumar')).toBe('Arjun');
  });

  it('should trim leading and trailing spaces', () => {
    expect(getFirstName('  Rahul Nair  ')).toBe('Rahul');
    expect(getFirstName(' Priya')).toBe('Priya');
  });

  it('should return User if name is undefined or empty', () => {
    expect(getFirstName(undefined)).toBe('User');
    expect(getFirstName(null)).toBe('User');
    expect(getFirstName('')).toBe('User');
    expect(getFirstName('   ')).toBe('User');
  });

  it('should return the first word if it is a single name', () => {
    expect(getFirstName('Rahul')).toBe('Rahul');
  });
});

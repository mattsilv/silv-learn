import { describe, it, expect } from 'vitest';
import { encodeAnswersToQuery, decodeAnswersFromQuery } from './quizUrlUtils';
import { AnswerSelections } from '../types/quiz';

describe('encodeAnswersToQuery', () => {
  it('should return an empty string for empty answers', () => {
    expect(encodeAnswersToQuery({})).toBe('');
  });

  it('should encode single answers correctly', () => {
    const answers: AnswerSelections = { 1: ['A'], 2: ['C'] };
    expect(encodeAnswersToQuery(answers)).toBe('?q1=A&q2=C');
  });

  it('should encode multiple answers with hyphens and sort them', () => {
    const answers: AnswerSelections = { 1: ['D', 'A'], 3: ['C', 'B'] };
    // Expecting A-D and B-C after sorting
    expect(encodeAnswersToQuery(answers)).toBe('?q1=A-D&q3=B-C');
  });

  it('should handle mixed single and multiple answers, sorting multiples', () => {
    const answers: AnswerSelections = { 1: ['D'], 2: ['C', 'B'], 3: ['A'] };
    // Expecting B-C for q2
    expect(encodeAnswersToQuery(answers)).toBe('?q1=D&q2=B-C&q3=A');
  });

  it('should encode a complex answer set correctly', () => {
    const answers: AnswerSelections = { 
        1: ['D'], 
        2: ['C'], 
        3: ['C'], 
        4: ['C', 'B'], 
        5: ['A', 'B'] 
    }; 
    // Expecting B-C for q4 and A-B for q5
    expect(encodeAnswersToQuery(answers)).toBe('?q1=D&q2=C&q3=C&q4=B-C&q5=A-B');
  });
});

describe('decodeAnswersFromQuery', () => {
  it('should return an empty object for an empty query string', () => {
    expect(decodeAnswersFromQuery('')).toEqual({});
    expect(decodeAnswersFromQuery('?')).toEqual({});
  });

  it('should decode single answers correctly', () => {
    const queryString = '?q1=A&q2=C';
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 1: ['A'], 2: ['C'] });
  });

  it('should decode comma-separated multiple answers (backward compatibility)', () => {
    const queryString = '?q1=A,D&q3=B,C';
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 1: ['A', 'D'], 3: ['B', 'C'] });
  });

  it('should decode hyphen-separated multiple answers', () => {
    const queryString = '?q1=A-D&q3=B-C';
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 1: ['A', 'D'], 3: ['B', 'C'] });
  });

  it('should handle mixed single and multiple answers (comma)', () => {
    const queryString = '?q1=D&q2=B,C&q3=A';
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 1: ['D'], 2: ['B', 'C'], 3: ['A'] });
  });

  it('should handle mixed single and multiple answers (hyphen)', () => {
    const queryString = '?q1=D&q2=B-C&q3=A';
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 1: ['D'], 2: ['B', 'C'], 3: ['A'] });
  });

  it('should decode the complex comma-separated string correctly', () => {
    const queryString = '?q1=D&q2=C&q3=C&q4=C,B&q5=A,B'; // Your example with commas
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 
        1: ['D'], 
        2: ['C'], 
        3: ['C'], 
        4: ['C', 'B'], 
        5: ['A', 'B'] 
    });
  });
  
  it('should decode the complex hyphen-separated string correctly', () => {
    const queryString = '?q1=D&q2=C&q3=C&q4=B-C&q5=A-B'; // Equivalent with hyphens
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 
        1: ['D'], 
        2: ['C'], 
        3: ['C'], 
        4: ['B', 'C'], 
        5: ['A', 'B'] 
    });
  });

  it('should ignore parameters not starting with q', () => {
    const queryString = '?q1=A&utm_source=test&q2=B';
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 1: ['A'], 2: ['B'] });
  });

  it('should handle query strings without a leading ?', () => {
    const queryString = 'q1=A-B&q2=C';
    expect(decodeAnswersFromQuery(queryString)).toEqual({ 1: ['A', 'B'], 2: ['C'] });
  });
  
  it('should return empty object for invalid query strings or non-string input', () => {
    expect(decodeAnswersFromQuery('?q=invalid')).toEqual({});
    expect(decodeAnswersFromQuery('?q1=A&qInvalid=B')).toEqual({ 1: ['A'] });
    // @ts-expect-error testing invalid input type
    expect(decodeAnswersFromQuery(null)).toEqual({});
    // @ts-expect-error testing invalid input type
    expect(decodeAnswersFromQuery(undefined)).toEqual({});
    // @ts-expect-error testing invalid input type
    expect(decodeAnswersFromQuery(123)).toEqual({});
  });
}); 
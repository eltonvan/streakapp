import { calculateCurrentStreak } from '../streakEngine';

const STANDARD = { type: 'standard' };
const STRETCHED = { type: 'stretched' };

function log(date: string, status: string) {
  return { date, status };
}

describe('calculateCurrentStreak', () => {
  describe('basic scenarios', () => {
    it('returns 0 for empty logs', () => {
      expect(calculateCurrentStreak(STANDARD, [])).toBe(0);
    });

    it('returns 1 for a single completed log', () => {
      expect(calculateCurrentStreak(STANDARD, [log('2024-06-15', 'completed')])).toBe(1);
    });

    it('returns 0 for a single saver_used log', () => {
      expect(calculateCurrentStreak(STANDARD, [log('2024-06-15', 'saver_used')])).toBe(0);
    });

    it('returns 0 for a single failed log', () => {
      expect(calculateCurrentStreak(STANDARD, [log('2024-06-15', 'failed')])).toBe(0);
    });

    it('returns 0 for a single skipped log', () => {
      expect(calculateCurrentStreak(STANDARD, [log('2024-06-15', 'skipped')])).toBe(0);
    });

    it('counts 3 consecutive completed days', () => {
      const logs = [
        log('2024-06-15', 'completed'),
        log('2024-06-14', 'completed'),
        log('2024-06-13', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(3);
    });
  });

  describe('saver logic', () => {
    it('saver_used maintains streak without incrementing count', () => {
      const logs = [
        log('2024-06-15', 'completed'),
        log('2024-06-14', 'saver_used'),
        log('2024-06-13', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(2);
    });

    it('saver_used at the start does not add to streak', () => {
      const logs = [
        log('2024-06-15', 'saver_used'),
        log('2024-06-14', 'completed'),
        log('2024-06-13', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(2);
    });

    it('multiple savers in a row maintain without incrementing', () => {
      const logs = [
        log('2024-06-16', 'completed'),
        log('2024-06-15', 'saver_used'),
        log('2024-06-14', 'saver_used'),
        log('2024-06-13', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(2);
    });

    it('all savers with no completed returns 0', () => {
      const logs = [
        log('2024-06-15', 'saver_used'),
        log('2024-06-14', 'saver_used'),
        log('2024-06-13', 'saver_used'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(0);
    });
  });

  describe('failed / skipped break streak', () => {
    it('failed mid-chain breaks and resets', () => {
      const logs = [
        log('2024-06-16', 'completed'),
        log('2024-06-15', 'failed'),
        log('2024-06-14', 'completed'),
        log('2024-06-13', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(1);
    });

    it('skipped mid-chain breaks the streak', () => {
      const logs = [
        log('2024-06-16', 'completed'),
        log('2024-06-15', 'skipped'),
        log('2024-06-14', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(1);
    });

    it('failed as most recent log returns 0 even with prior streak', () => {
      const logs = [
        log('2024-06-16', 'failed'),
        log('2024-06-15', 'completed'),
        log('2024-06-14', 'completed'),
        log('2024-06-13', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(0);
    });
  });

  describe('standard habit gap detection', () => {
    it('breaks on a single missing day mid-chain', () => {
      const logs = [
        log('2024-06-15', 'completed'),
        log('2024-06-14', 'completed'),
        log('2024-06-12', 'completed'),
        log('2024-06-11', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(2);
    });

    it('continues on consecutive days with no gap', () => {
      const logs = [
        log('2024-06-15', 'completed'),
        log('2024-06-14', 'completed'),
        log('2024-06-13', 'completed'),
        log('2024-06-12', 'completed'),
        log('2024-06-11', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(5);
    });
  });

  describe('stretched habit gap allowance', () => {
    it('allows exactly one gap day', () => {
      const logs = [
        log('2024-06-15', 'completed'),
        log('2024-06-13', 'completed'),
        log('2024-06-12', 'completed'),
      ];
      expect(calculateCurrentStreak(STRETCHED, logs)).toBe(3);
    });

    it('allows a gap day combined with saver', () => {
      const logs = [
        log('2024-06-16', 'completed'),
        log('2024-06-15', 'saver_used'),
        log('2024-06-13', 'completed'),
        log('2024-06-12', 'completed'),
      ];
      expect(calculateCurrentStreak(STRETCHED, logs)).toBe(3);
    });

    it('breaks on two consecutive missing days', () => {
      const logs = [
        log('2024-06-15', 'completed'),
        log('2024-06-14', 'completed'),
        log('2024-06-11', 'completed'),
        log('2024-06-10', 'completed'),
      ];
      expect(calculateCurrentStreak(STRETCHED, logs)).toBe(2);
    });

    it('allows multiple independent one-day gaps', () => {
      const logs = [
        log('2024-06-17', 'completed'),
        log('2024-06-15', 'completed'),
        log('2024-06-13', 'completed'),
        log('2024-06-12', 'completed'),
      ];
      expect(calculateCurrentStreak(STRETCHED, logs)).toBe(4);
    });

    it('failed breaks stretched streak within gap window', () => {
      const logs = [
        log('2024-06-16', 'completed'),
        log('2024-06-15', 'failed'),
        log('2024-06-14', 'completed'),
      ];
      expect(calculateCurrentStreak(STRETCHED, logs)).toBe(1);
    });
  });

  describe('leap year handling', () => {
    it('handles feb 28 -> feb 29 -> mar 1 in leap year correctly', () => {
      const logs = [
        log('2024-03-01', 'completed'),
        log('2024-02-29', 'completed'),
        log('2024-02-28', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(3);
    });

    it('handles feb 28 -> mar 1 in non-leap year as consecutive', () => {
      const logs = [
        log('2023-03-01', 'completed'),
        log('2023-02-28', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(2);
    });

    it('handles stretched across leap day gap', () => {
      const logs = [
        log('2024-03-01', 'completed'),
        log('2024-02-28', 'completed'),
        log('2024-02-27', 'completed'),
      ];
      expect(calculateCurrentStreak(STRETCHED, logs)).toBe(3);
    });

    it('stretched break with two-day gap around leap day', () => {
      const logs = [
        log('2024-03-01', 'completed'),
        log('2024-02-27', 'completed'),
        log('2024-02-26', 'completed'),
      ];
      expect(calculateCurrentStreak(STRETCHED, logs)).toBe(1);
    });
  });

  describe('DST crossovers', () => {
    it('spring-forward: mar 8 -> mar 9 -> mar 10 (23-hour day) is consecutive', () => {
      const logs = [
        log('2025-03-10', 'completed'),
        log('2025-03-09', 'completed'),
        log('2025-03-08', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(3);
    });

    it('fall-back: nov 2 -> nov 3 -> nov 4 (25-hour day) is consecutive', () => {
      const logs = [
        log('2025-11-04', 'completed'),
        log('2025-11-03', 'completed'),
        log('2025-11-02', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(3);
    });
  });

  describe('out of order and delayed logs', () => {
    it('sorts logs correctly when provided in random order', () => {
      const logs = [
        log('2024-06-13', 'completed'),
        log('2024-06-15', 'completed'),
        log('2024-06-14', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(3);
    });

    it('handles late-arriving old log that would fill a gap', () => {
      const logs = [
        log('2024-06-15', 'completed'),
        log('2024-06-14', 'completed'),
        log('2024-06-11', 'completed'),
        log('2024-06-13', 'completed'),
        log('2024-06-12', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(5);
    });

    it('stretched with late gap-fill log stays correct', () => {
      const logs = [
        log('2024-06-17', 'completed'),
        log('2024-06-14', 'completed'),
        log('2024-06-15', 'completed'),
        log('2024-06-12', 'completed'),
        log('2024-06-13', 'completed'),
      ];
      expect(calculateCurrentStreak(STRETCHED, logs)).toBe(5);
    });
  });

  describe('large date ranges', () => {
    it('handles year boundary correctly', () => {
      const logs = [
        log('2024-01-02', 'completed'),
        log('2024-01-01', 'completed'),
        log('2023-12-31', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(3);
    });

    it('handles month boundary (30-day month)', () => {
      const logs = [
        log('2024-05-01', 'completed'),
        log('2024-04-30', 'completed'),
        log('2024-04-29', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(3);
    });

    it('handles month boundary (31-day month)', () => {
      const logs = [
        log('2024-08-01', 'completed'),
        log('2024-07-31', 'completed'),
        log('2024-07-30', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(3);
    });

    it('correctly detects gap across month boundary', () => {
      const logs = [
        log('2024-05-01', 'completed'),
        log('2024-04-29', 'completed'),
      ];
      expect(calculateCurrentStreak(STANDARD, logs)).toBe(1);
    });
  });
});
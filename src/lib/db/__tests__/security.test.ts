import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Phase 2 backend foundation — requirement 14 (security). These are static
 * checks over the source tree, not runtime checks: they make sure nothing
 * that touches the Supabase secret key, or a cleaner's hourly wage,
 * ever ends up textually referenced from a 'use client' component. Cheap
 * to run on every `npm test`, and catches the exact class of mistake the
 * spec is worried about (a secret key ending up in the browser
 * bundle) before it ever ships.
 */

const SRC_DIR = path.resolve(__dirname, '../../../');

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walk(fullPath, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function isClientComponent(content: string): boolean {
  const firstMeaningfulLine = content
    .split('\n')
    .find((line) => line.trim().length > 0 && !line.trim().startsWith('//'));
  return Boolean(firstMeaningfulLine && /^['"]use client['"];?$/.test(firstMeaningfulLine.trim()));
}

describe('security — service-role key / wage never reach client components', () => {
  const allFiles = walk(SRC_DIR);
  const clientFiles = allFiles.filter((f) => isClientComponent(readFileSync(f, 'utf8')));

  it('found at least one "use client" component to check (sanity check the scanner itself works)', () => {
    expect(clientFiles.length).toBeGreaterThan(0);
  });

  it('no "use client" component references SUPABASE_SECRET_KEY', () => {
    const offenders = clientFiles.filter((f) => readFileSync(f, 'utf8').includes('SUPABASE_SECRET_KEY'));
    expect(offenders).toEqual([]);
  });

  it('no "use client" component imports the Supabase admin client or a db repository', () => {
    const offenders = clientFiles.filter((f) => {
      const content = readFileSync(f, 'utf8');
      return content.includes('@/lib/db/client') || content.includes('@/lib/db/repositories');
    });
    expect(offenders).toEqual([]);
  });

  it('no "use client" component references hourlyWage / hourly_wage', () => {
    const offenders = clientFiles.filter((f) => {
      const content = readFileSync(f, 'utf8');
      return content.includes('hourlyWage') || content.includes('hourly_wage');
    });
    expect(offenders).toEqual([]);
  });
});

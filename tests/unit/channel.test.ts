import { describe, expect, it } from 'vitest';
import { filterChannels, normalizeSearch } from '@/lib/channel';
import { demoChannels } from '@/lib/demo';
describe('channel search', () => { it('normalizes Uzbek apostrophes', () => expect(normalizeSearch("O’ZBEK")).toBe("o'zbek")); it('filters live Uzbek channels', () => expect(filterChannels(demoChannels, { country: 'UZ', online: true }).every((channel) => channel.country === 'UZ' && channel.live)).toBe(true)); });

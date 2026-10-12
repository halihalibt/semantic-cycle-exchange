import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach,beforeEach,vi} from 'vitest';
beforeEach(()=>vi.stubGlobal('fetch',vi.fn(async()=>{throw new Error('B2A_UNMOCKED_FETCH_BLOCKED');})));
afterEach(()=>vi.unstubAllGlobals());
afterEach(cleanup);

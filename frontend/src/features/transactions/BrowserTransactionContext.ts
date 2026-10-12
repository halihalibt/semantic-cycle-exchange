import { createContext } from 'react';
import type { BrowserTransactions } from '../../lib/genlayer/live/runtime';
export const BrowserTransactionContext=createContext<BrowserTransactions | undefined>(undefined);

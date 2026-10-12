import { useEffect, useRef, useState } from 'react';
import type { Observation } from './lib/genlayer/types';
export function useRead<T>(load:(signal:AbortSignal)=>Promise<Observation<T>>) {
  const [data,setData]=useState<Observation<T>>();const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [run,setRun]=useState(0);
  const loader=useRef(load);loader.current=load;
  useEffect(()=>{const c=new AbortController();setLoading(true);setError('');loader.current(c.signal).then(x=>{if(!c.signal.aborted)setData(x);}).catch(e=>{if(!c.signal.aborted)setError(e instanceof Error?e.message:String(e));}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[run]);
  return {data,loading,error,refresh:()=>setRun(x=>x+1)};
}

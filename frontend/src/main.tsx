import { createRoot } from 'react-dom/client';
import { Home,Demo,Inspect } from './pages';
import './style.css';
const params=new URLSearchParams(window.location.search);const mode=params.get('w')==='1'?'demo':params.get('view')==='inspect'?'inspect':'home';
function App(){return <div className="app"><header><a className="brand" href="?">SCA<span>—3</span></a><nav aria-label="Main navigation"><a aria-current={mode==='home'?'page':undefined} href="?">Overview</a><a aria-current={mode==='demo'?'page':undefined} href="?w=1">Onchain demo</a><a aria-current={mode==='inspect'?'page':undefined} href="?view=inspect">Inspect</a></nav><span className="network-tag">STUDIONET 61999</span></header><main>{mode==='demo'?<Demo/>:mode==='inspect'?<Inspect/>:<Home/>}</main><footer><strong>Semantic Cycle Accord</strong><span>Three-party commitments · Stable Studionet · B1 read-only foundation</span></footer></div>;}
createRoot(document.getElementById('root')!).render(<App/>);

var wt=Object.defineProperty;var De=e=>{throw TypeError(e)};var jt=(e,t,s)=>t in e?wt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var m=(e,t,s)=>jt(e,typeof t!="symbol"?t+"":t,s),Oe=(e,t,s)=>t.has(e)||De("Cannot "+s);var a=(e,t,s)=>(Oe(e,t,"read from private field"),s?s.call(e):t.get(e)),g=(e,t,s)=>t.has(e)?De("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),f=(e,t,s,r)=>(Oe(e,t,"write to private field"),r?r.call(e,s):t.set(e,s),s),b=(e,t,s)=>(Oe(e,t,"access private method"),s);var $e=(e,t,s,r)=>({set _(n){f(e,t,n,s)},get _(){return a(e,t,r)}});var Le=(e,t,s)=>(r,n)=>{let i=-1;return o(0);async function o(c){if(c<=i)throw new Error("next() called multiple times");i=c;let l,d=!1,u;if(e[c]?(u=e[c][0][0],r.req.routeIndex=c):u=c===e.length&&n||void 0,u)try{l=await u(r,()=>o(c+1))}catch(h){if(h instanceof Error&&t)r.error=h,l=await t(h,r),d=!0;else throw h}else r.finalized===!1&&s&&(l=await s(r));return l&&(r.finalized===!1||d)&&(r.res=l),r}},Et=Symbol(),At=async(e,t=Object.create(null))=>{const{all:s=!1,dot:r=!1}=t,i=(e instanceof nt?e.raw.headers:e.headers).get("Content-Type");return i!=null&&i.startsWith("multipart/form-data")||i!=null&&i.startsWith("application/x-www-form-urlencoded")?Rt(e,{all:s,dot:r}):{}};async function Rt(e,t){const s=await e.formData();return s?St(s,t):{}}function St(e,t){const s=Object.create(null);return e.forEach((r,n)=>{t.all||n.endsWith("[]")?Pt(s,n,r):s[n]=r}),t.dot&&Object.entries(s).forEach(([r,n])=>{r.includes(".")&&(Ct(s,r,n),delete s[r])}),s}var Pt=(e,t,s)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(s):e[t]=[e[t],s]:t.endsWith("[]")?e[t]=[s]:e[t]=s},Ct=(e,t,s)=>{let r=e;const n=t.split(".");n.forEach((i,o)=>{o===n.length-1?r[i]=s:((!r[i]||typeof r[i]!="object"||Array.isArray(r[i])||r[i]instanceof File)&&(r[i]=Object.create(null)),r=r[i])})},Qe=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},Tt=e=>{const{groups:t,path:s}=Ot(e),r=Qe(s);return _t(r,t)},Ot=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(s,r)=>{const n=`@${r}`;return t.push([n,s]),n}),{groups:t,path:e}},_t=(e,t)=>{for(let s=t.length-1;s>=0;s--){const[r]=t[s];for(let n=e.length-1;n>=0;n--)if(e[n].includes(r)){e[n]=e[n].replace(r,t[s][1]);break}}return e},je={},kt=(e,t)=>{if(e==="*")return"*";const s=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(s){const r=`${e}#${t}`;return je[r]||(s[2]?je[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,s[1],new RegExp(`^${s[2]}(?=/${t})`)]:[e,s[1],new RegExp(`^${s[2]}$`)]:je[r]=[e,s[1],!0]),je[r]}return null},Ie=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,s=>{try{return t(s)}catch{return s}})}},Mt=e=>Ie(e,decodeURI),et=e=>{const t=e.url,s=t.indexOf("/",t.charCodeAt(9)===58?13:8);let r=s;for(;r<t.length;r++){const n=t.charCodeAt(r);if(n===37){const i=t.indexOf("?",r),o=t.slice(s,i===-1?void 0:i);return Mt(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(n===63)break}return t.slice(s,r)},Ht=e=>{const t=et(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},se=(e,t,...s)=>(s.length&&(t=se(t,...s)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),tt=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),s=[];let r="";return t.forEach(n=>{if(n!==""&&!/\:/.test(n))r+="/"+n;else if(/\:/.test(n))if(/\?/.test(n)){s.length===0&&r===""?s.push("/"):s.push(r);const i=n.replace("?","");r+="/"+i,s.push(r)}else r+="/"+n}),s.filter((n,i,o)=>o.indexOf(n)===i)},_e=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?Ie(e,rt):e):e,st=(e,t,s)=>{let r;if(!s&&t&&!/[%+]/.test(t)){let o=e.indexOf(`?${t}`,8);for(o===-1&&(o=e.indexOf(`&${t}`,8));o!==-1;){const c=e.charCodeAt(o+t.length+1);if(c===61){const l=o+t.length+2,d=e.indexOf("&",l);return _e(e.slice(l,d===-1?void 0:d))}else if(c==38||isNaN(c))return"";o=e.indexOf(`&${t}`,o+1)}if(r=/[%+]/.test(e),!r)return}const n={};r??(r=/[%+]/.test(e));let i=e.indexOf("?",8);for(;i!==-1;){const o=e.indexOf("&",i+1);let c=e.indexOf("=",i);c>o&&o!==-1&&(c=-1);let l=e.slice(i+1,c===-1?o===-1?void 0:o:c);if(r&&(l=_e(l)),i=o,l==="")continue;let d;c===-1?d="":(d=e.slice(c+1,o===-1?void 0:o),r&&(d=_e(d))),s?(n[l]&&Array.isArray(n[l])||(n[l]=[]),n[l].push(d)):n[l]??(n[l]=d)}return t?n[t]:n},It=st,Nt=(e,t)=>st(e,t,!0),rt=decodeURIComponent,ze=e=>Ie(e,rt),ie,C,L,it,at,Me,F,Ge,nt=(Ge=class{constructor(e,t="/",s=[[]]){g(this,L);m(this,"raw");g(this,ie);g(this,C);m(this,"routeIndex",0);m(this,"path");m(this,"bodyCache",{});g(this,F,e=>{const{bodyCache:t,raw:s}=this,r=t[e];if(r)return r;const n=Object.keys(t)[0];return n?t[n].then(i=>(n==="json"&&(i=JSON.stringify(i)),new Response(i)[e]())):t[e]=s[e]()});this.raw=e,this.path=t,f(this,C,s),f(this,ie,{})}param(e){return e?b(this,L,it).call(this,e):b(this,L,at).call(this)}query(e){return It(this.url,e)}queries(e){return Nt(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((s,r)=>{t[r]=s}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await At(this,e))}json(){return a(this,F).call(this,"text").then(e=>JSON.parse(e))}text(){return a(this,F).call(this,"text")}arrayBuffer(){return a(this,F).call(this,"arrayBuffer")}blob(){return a(this,F).call(this,"blob")}formData(){return a(this,F).call(this,"formData")}addValidatedData(e,t){a(this,ie)[e]=t}valid(e){return a(this,ie)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Et](){return a(this,C)}get matchedRoutes(){return a(this,C)[0].map(([[,e]])=>e)}get routePath(){return a(this,C)[0].map(([[,e]])=>e)[this.routeIndex].path}},ie=new WeakMap,C=new WeakMap,L=new WeakSet,it=function(e){const t=a(this,C)[0][this.routeIndex][1][e],s=b(this,L,Me).call(this,t);return s?/\%/.test(s)?ze(s):s:void 0},at=function(){const e={},t=Object.keys(a(this,C)[0][this.routeIndex][1]);for(const s of t){const r=b(this,L,Me).call(this,a(this,C)[0][this.routeIndex][1][s]);r&&typeof r=="string"&&(e[s]=/\%/.test(r)?ze(r):r)}return e},Me=function(e){return a(this,C)[1]?a(this,C)[1][e]:e},F=new WeakMap,Ge),Dt={Stringify:1},ot=async(e,t,s,r,n)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const i=e.callbacks;return i!=null&&i.length?(n?n[0]+=e:n=[e],Promise.all(i.map(c=>c({phase:t,buffer:n,context:r}))).then(c=>Promise.all(c.filter(Boolean).map(l=>ot(l,t,!1,r,n))).then(()=>n[0]))):Promise.resolve(e)},$t="text/plain; charset=UTF-8",ke=(e,t)=>({"Content-Type":e,...t}),ge,be,I,ae,N,S,ve,oe,le,Y,xe,ye,q,re,Ke,Lt=(Ke=class{constructor(e,t){g(this,q);g(this,ge);g(this,be);m(this,"env",{});g(this,I);m(this,"finalized",!1);m(this,"error");g(this,ae);g(this,N);g(this,S);g(this,ve);g(this,oe);g(this,le);g(this,Y);g(this,xe);g(this,ye);m(this,"render",(...e)=>(a(this,oe)??f(this,oe,t=>this.html(t)),a(this,oe).call(this,...e)));m(this,"setLayout",e=>f(this,ve,e));m(this,"getLayout",()=>a(this,ve));m(this,"setRenderer",e=>{f(this,oe,e)});m(this,"header",(e,t,s)=>{this.finalized&&f(this,S,new Response(a(this,S).body,a(this,S)));const r=a(this,S)?a(this,S).headers:a(this,Y)??f(this,Y,new Headers);t===void 0?r.delete(e):s!=null&&s.append?r.append(e,t):r.set(e,t)});m(this,"status",e=>{f(this,ae,e)});m(this,"set",(e,t)=>{a(this,I)??f(this,I,new Map),a(this,I).set(e,t)});m(this,"get",e=>a(this,I)?a(this,I).get(e):void 0);m(this,"newResponse",(...e)=>b(this,q,re).call(this,...e));m(this,"body",(e,t,s)=>b(this,q,re).call(this,e,t,s));m(this,"text",(e,t,s)=>!a(this,Y)&&!a(this,ae)&&!t&&!s&&!this.finalized?new Response(e):b(this,q,re).call(this,e,t,ke($t,s)));m(this,"json",(e,t,s)=>b(this,q,re).call(this,JSON.stringify(e),t,ke("application/json",s)));m(this,"html",(e,t,s)=>{const r=n=>b(this,q,re).call(this,n,t,ke("text/html; charset=UTF-8",s));return typeof e=="object"?ot(e,Dt.Stringify,!1,{}).then(r):r(e)});m(this,"redirect",(e,t)=>{const s=String(e);return this.header("Location",/[^\x00-\xFF]/.test(s)?encodeURI(s):s),this.newResponse(null,t??302)});m(this,"notFound",()=>(a(this,le)??f(this,le,()=>new Response),a(this,le).call(this,this)));f(this,ge,e),t&&(f(this,N,t.executionCtx),this.env=t.env,f(this,le,t.notFoundHandler),f(this,ye,t.path),f(this,xe,t.matchResult))}get req(){return a(this,be)??f(this,be,new nt(a(this,ge),a(this,ye),a(this,xe))),a(this,be)}get event(){if(a(this,N)&&"respondWith"in a(this,N))return a(this,N);throw Error("This context has no FetchEvent")}get executionCtx(){if(a(this,N))return a(this,N);throw Error("This context has no ExecutionContext")}get res(){return a(this,S)||f(this,S,new Response(null,{headers:a(this,Y)??f(this,Y,new Headers)}))}set res(e){if(a(this,S)&&e){e=new Response(e.body,e);for(const[t,s]of a(this,S).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const r=a(this,S).headers.getSetCookie();e.headers.delete("set-cookie");for(const n of r)e.headers.append("set-cookie",n)}else e.headers.set(t,s)}f(this,S,e),this.finalized=!0}get var(){return a(this,I)?Object.fromEntries(a(this,I)):{}}},ge=new WeakMap,be=new WeakMap,I=new WeakMap,ae=new WeakMap,N=new WeakMap,S=new WeakMap,ve=new WeakMap,oe=new WeakMap,le=new WeakMap,Y=new WeakMap,xe=new WeakMap,ye=new WeakMap,q=new WeakSet,re=function(e,t,s){const r=a(this,S)?new Headers(a(this,S).headers):a(this,Y)??new Headers;if(typeof t=="object"&&"headers"in t){const i=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[o,c]of i)o.toLowerCase()==="set-cookie"?r.append(o,c):r.set(o,c)}if(s)for(const[i,o]of Object.entries(s))if(typeof o=="string")r.set(i,o);else{r.delete(i);for(const c of o)r.append(i,c)}const n=typeof t=="number"?t:(t==null?void 0:t.status)??a(this,ae);return new Response(e,{status:n,headers:r})},Ke),w="ALL",zt="all",Ft=["get","post","put","delete","options","patch"],lt="Can not add a route since the matcher is already built.",ct=class extends Error{},qt="__COMPOSED_HANDLER",Ut=e=>e.text("404 Not Found",404),Fe=(e,t)=>{if("getResponse"in e){const s=e.getResponse();return t.newResponse(s.body,s)}return console.error(e),t.text("Internal Server Error",500)},O,j,ut,_,V,Ee,Ae,Be,dt=(Be=class{constructor(t={}){g(this,j);m(this,"get");m(this,"post");m(this,"put");m(this,"delete");m(this,"options");m(this,"patch");m(this,"all");m(this,"on");m(this,"use");m(this,"router");m(this,"getPath");m(this,"_basePath","/");g(this,O,"/");m(this,"routes",[]);g(this,_,Ut);m(this,"errorHandler",Fe);m(this,"onError",t=>(this.errorHandler=t,this));m(this,"notFound",t=>(f(this,_,t),this));m(this,"fetch",(t,...s)=>b(this,j,Ae).call(this,t,s[1],s[0],t.method));m(this,"request",(t,s,r,n)=>t instanceof Request?this.fetch(s?new Request(t,s):t,r,n):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${se("/",t)}`,s),r,n)));m(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(b(this,j,Ae).call(this,t.request,t,void 0,t.request.method))})});[...Ft,zt].forEach(i=>{this[i]=(o,...c)=>(typeof o=="string"?f(this,O,o):b(this,j,V).call(this,i,a(this,O),o),c.forEach(l=>{b(this,j,V).call(this,i,a(this,O),l)}),this)}),this.on=(i,o,...c)=>{for(const l of[o].flat()){f(this,O,l);for(const d of[i].flat())c.map(u=>{b(this,j,V).call(this,d.toUpperCase(),a(this,O),u)})}return this},this.use=(i,...o)=>(typeof i=="string"?f(this,O,i):(f(this,O,"*"),o.unshift(i)),o.forEach(c=>{b(this,j,V).call(this,w,a(this,O),c)}),this);const{strict:r,...n}=t;Object.assign(this,n),this.getPath=r??!0?t.getPath??et:Ht}route(t,s){const r=this.basePath(t);return s.routes.map(n=>{var o;let i;s.errorHandler===Fe?i=n.handler:(i=async(c,l)=>(await Le([],s.errorHandler)(c,()=>n.handler(c,l))).res,i[qt]=n.handler),b(o=r,j,V).call(o,n.method,n.path,i)}),this}basePath(t){const s=b(this,j,ut).call(this);return s._basePath=se(this._basePath,t),s}mount(t,s,r){let n,i;r&&(typeof r=="function"?i=r:(i=r.optionHandler,r.replaceRequest===!1?n=l=>l:n=r.replaceRequest));const o=i?l=>{const d=i(l);return Array.isArray(d)?d:[d]}:l=>{let d;try{d=l.executionCtx}catch{}return[l.env,d]};n||(n=(()=>{const l=se(this._basePath,t),d=l==="/"?0:l.length;return u=>{const h=new URL(u.url);return h.pathname=h.pathname.slice(d)||"/",new Request(h,u)}})());const c=async(l,d)=>{const u=await s(n(l.req.raw),...o(l));if(u)return u;await d()};return b(this,j,V).call(this,w,se(t,"*"),c),this}},O=new WeakMap,j=new WeakSet,ut=function(){const t=new dt({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,f(t,_,a(this,_)),t.routes=this.routes,t},_=new WeakMap,V=function(t,s,r){t=t.toUpperCase(),s=se(this._basePath,s);const n={basePath:this._basePath,path:s,method:t,handler:r};this.router.add(t,s,[r,n]),this.routes.push(n)},Ee=function(t,s){if(t instanceof Error)return this.errorHandler(t,s);throw t},Ae=function(t,s,r,n){if(n==="HEAD")return(async()=>new Response(null,await b(this,j,Ae).call(this,t,s,r,"GET")))();const i=this.getPath(t,{env:r}),o=this.router.match(n,i),c=new Lt(t,{path:i,matchResult:o,env:r,executionCtx:s,notFoundHandler:a(this,_)});if(o[0].length===1){let d;try{d=o[0][0][0][0](c,async()=>{c.res=await a(this,_).call(this,c)})}catch(u){return b(this,j,Ee).call(this,u,c)}return d instanceof Promise?d.then(u=>u||(c.finalized?c.res:a(this,_).call(this,c))).catch(u=>b(this,j,Ee).call(this,u,c)):d??a(this,_).call(this,c)}const l=Le(o[0],this.errorHandler,a(this,_));return(async()=>{try{const d=await l(c);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return b(this,j,Ee).call(this,d,c)}})()},Be),Se="[^/]+",me=".*",pe="(?:|/.*)",ne=Symbol(),Gt=new Set(".\\+*[^]$()");function Kt(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===me||e===pe?1:t===me||t===pe?-1:e===Se?1:t===Se?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var J,X,k,Ve,He=(Ve=class{constructor(){g(this,J);g(this,X);g(this,k,Object.create(null))}insert(t,s,r,n,i){if(t.length===0){if(a(this,J)!==void 0)throw ne;if(i)return;f(this,J,s);return}const[o,...c]=t,l=o==="*"?c.length===0?["","",me]:["","",Se]:o==="/*"?["","",pe]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(l){const u=l[1];let h=l[2]||Se;if(u&&l[2]&&(h===".*"||(h=h.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(h))))throw ne;if(d=a(this,k)[h],!d){if(Object.keys(a(this,k)).some(p=>p!==me&&p!==pe))throw ne;if(i)return;d=a(this,k)[h]=new He,u!==""&&f(d,X,n.varIndex++)}!i&&u!==""&&r.push([u,a(d,X)])}else if(d=a(this,k)[o],!d){if(Object.keys(a(this,k)).some(u=>u.length>1&&u!==me&&u!==pe))throw ne;if(i)return;d=a(this,k)[o]=new He}d.insert(c,s,r,n,i)}buildRegExpStr(){const s=Object.keys(a(this,k)).sort(Kt).map(r=>{const n=a(this,k)[r];return(typeof a(n,X)=="number"?`(${r})@${a(n,X)}`:Gt.has(r)?`\\${r}`:r)+n.buildRegExpStr()});return typeof a(this,J)=="number"&&s.unshift(`#${a(this,J)}`),s.length===0?"":s.length===1?s[0]:"(?:"+s.join("|")+")"}},J=new WeakMap,X=new WeakMap,k=new WeakMap,Ve),Pe,we,We,Bt=(We=class{constructor(){g(this,Pe,{varIndex:0});g(this,we,new He)}insert(e,t,s){const r=[],n=[];for(let o=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const d=`@\\${o}`;return n[o]=[d,l],o++,c=!0,d}),!c)break}const i=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=n.length-1;o>=0;o--){const[c]=n[o];for(let l=i.length-1;l>=0;l--)if(i[l].indexOf(c)!==-1){i[l]=i[l].replace(c,n[o][1]);break}}return a(this,we).insert(i,t,r,a(this,Pe),s),r}buildRegExp(){let e=a(this,we).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const s=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,i,o)=>i!==void 0?(s[++t]=Number(i),"$()"):(o!==void 0&&(r[Number(o)]=++t),"")),[new RegExp(`^${e}`),s,r]}},Pe=new WeakMap,we=new WeakMap,We),ht=[],Vt=[/^$/,[],Object.create(null)],Re=Object.create(null);function ft(e){return Re[e]??(Re[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,s)=>s?`\\${s}`:"(?:|/.*)")}$`))}function Wt(){Re=Object.create(null)}function Yt(e){var d;const t=new Bt,s=[];if(e.length===0)return Vt;const r=e.map(u=>[!/\*|\/:/.test(u[0]),...u]).sort(([u,h],[p,y])=>u?1:p?-1:h.length-y.length),n=Object.create(null);for(let u=0,h=-1,p=r.length;u<p;u++){const[y,P,v]=r[u];y?n[P]=[v.map(([R])=>[R,Object.create(null)]),ht]:h++;let x;try{x=t.insert(P,h,y)}catch(R){throw R===ne?new ct(P):R}y||(s[h]=v.map(([R,ee])=>{const ue=Object.create(null);for(ee-=1;ee>=0;ee--){const[M,Ce]=x[ee];ue[M]=Ce}return[R,ue]}))}const[i,o,c]=t.buildRegExp();for(let u=0,h=s.length;u<h;u++)for(let p=0,y=s[u].length;p<y;p++){const P=(d=s[u][p])==null?void 0:d[1];if(!P)continue;const v=Object.keys(P);for(let x=0,R=v.length;x<R;x++)P[v[x]]=c[P[v[x]]]}const l=[];for(const u in o)l[u]=s[o[u]];return[i,l,n]}function te(e,t){if(e){for(const s of Object.keys(e).sort((r,n)=>n.length-r.length))if(ft(s).test(t))return[...e[s]]}}var U,G,de,mt,pt,Ye,Jt=(Ye=class{constructor(){g(this,de);m(this,"name","RegExpRouter");g(this,U);g(this,G);f(this,U,{[w]:Object.create(null)}),f(this,G,{[w]:Object.create(null)})}add(e,t,s){var c;const r=a(this,U),n=a(this,G);if(!r||!n)throw new Error(lt);r[e]||[r,n].forEach(l=>{l[e]=Object.create(null),Object.keys(l[w]).forEach(d=>{l[e][d]=[...l[w][d]]})}),t==="/*"&&(t="*");const i=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=ft(t);e===w?Object.keys(r).forEach(d=>{var u;(u=r[d])[t]||(u[t]=te(r[d],t)||te(r[w],t)||[])}):(c=r[e])[t]||(c[t]=te(r[e],t)||te(r[w],t)||[]),Object.keys(r).forEach(d=>{(e===w||e===d)&&Object.keys(r[d]).forEach(u=>{l.test(u)&&r[d][u].push([s,i])})}),Object.keys(n).forEach(d=>{(e===w||e===d)&&Object.keys(n[d]).forEach(u=>l.test(u)&&n[d][u].push([s,i]))});return}const o=tt(t)||[t];for(let l=0,d=o.length;l<d;l++){const u=o[l];Object.keys(n).forEach(h=>{var p;(e===w||e===h)&&((p=n[h])[u]||(p[u]=[...te(r[h],u)||te(r[w],u)||[]]),n[h][u].push([s,i-d+l+1]))})}}match(e,t){Wt();const s=b(this,de,mt).call(this);return this.match=(r,n)=>{const i=s[r]||s[w],o=i[2][n];if(o)return o;const c=n.match(i[0]);if(!c)return[[],ht];const l=c.indexOf("",1);return[i[1][l],c]},this.match(e,t)}},U=new WeakMap,G=new WeakMap,de=new WeakSet,mt=function(){const e=Object.create(null);return Object.keys(a(this,G)).concat(Object.keys(a(this,U))).forEach(t=>{e[t]||(e[t]=b(this,de,pt).call(this,t))}),f(this,U,f(this,G,void 0)),e},pt=function(e){const t=[];let s=e===w;return[a(this,U),a(this,G)].forEach(r=>{const n=r[e]?Object.keys(r[e]).map(i=>[i,r[e][i]]):[];n.length!==0?(s||(s=!0),t.push(...n)):e!==w&&t.push(...Object.keys(r[w]).map(i=>[i,r[w][i]]))}),s?Yt(t):null},Ye),K,D,Je,Xt=(Je=class{constructor(e){m(this,"name","SmartRouter");g(this,K,[]);g(this,D,[]);f(this,K,e.routers)}add(e,t,s){if(!a(this,D))throw new Error(lt);a(this,D).push([e,t,s])}match(e,t){if(!a(this,D))throw new Error("Fatal error");const s=a(this,K),r=a(this,D),n=s.length;let i=0,o;for(;i<n;i++){const c=s[i];try{for(let l=0,d=r.length;l<d;l++)c.add(...r[l]);o=c.match(e,t)}catch(l){if(l instanceof ct)continue;throw l}this.match=c.match.bind(c),f(this,K,[c]),f(this,D,void 0);break}if(i===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(a(this,D)||a(this,K).length!==1)throw new Error("No active router has been determined yet.");return a(this,K)[0]}},K=new WeakMap,D=new WeakMap,Je),fe=Object.create(null),B,A,Z,ce,E,$,W,Xe,gt=(Xe=class{constructor(e,t,s){g(this,$);g(this,B);g(this,A);g(this,Z);g(this,ce,0);g(this,E,fe);if(f(this,A,s||Object.create(null)),f(this,B,[]),e&&t){const r=Object.create(null);r[e]={handler:t,possibleKeys:[],score:0},f(this,B,[r])}f(this,Z,[])}insert(e,t,s){f(this,ce,++$e(this,ce)._);let r=this;const n=Tt(t),i=[];for(let o=0,c=n.length;o<c;o++){const l=n[o],d=n[o+1],u=kt(l,d),h=Array.isArray(u)?u[0]:l;if(h in a(r,A)){r=a(r,A)[h],u&&i.push(u[1]);continue}a(r,A)[h]=new gt,u&&(a(r,Z).push(u),i.push(u[1])),r=a(r,A)[h]}return a(r,B).push({[e]:{handler:s,possibleKeys:i.filter((o,c,l)=>l.indexOf(o)===c),score:a(this,ce)}}),r}search(e,t){var c;const s=[];f(this,E,fe);let n=[this];const i=Qe(t),o=[];for(let l=0,d=i.length;l<d;l++){const u=i[l],h=l===d-1,p=[];for(let y=0,P=n.length;y<P;y++){const v=n[y],x=a(v,A)[u];x&&(f(x,E,a(v,E)),h?(a(x,A)["*"]&&s.push(...b(this,$,W).call(this,a(x,A)["*"],e,a(v,E))),s.push(...b(this,$,W).call(this,x,e,a(v,E)))):p.push(x));for(let R=0,ee=a(v,Z).length;R<ee;R++){const ue=a(v,Z)[R],M=a(v,E)===fe?{}:{...a(v,E)};if(ue==="*"){const z=a(v,A)["*"];z&&(s.push(...b(this,$,W).call(this,z,e,a(v,E))),f(z,E,M),p.push(z));continue}const[Ce,Ne,he]=ue;if(!u&&!(he instanceof RegExp))continue;const H=a(v,A)[Ce],yt=i.slice(l).join("/");if(he instanceof RegExp){const z=he.exec(yt);if(z){if(M[Ne]=z[0],s.push(...b(this,$,W).call(this,H,e,a(v,E),M)),Object.keys(a(H,A)).length){f(H,E,M);const Te=((c=z[0].match(/\//))==null?void 0:c.length)??0;(o[Te]||(o[Te]=[])).push(H)}continue}}(he===!0||he.test(u))&&(M[Ne]=u,h?(s.push(...b(this,$,W).call(this,H,e,M,a(v,E))),a(H,A)["*"]&&s.push(...b(this,$,W).call(this,a(H,A)["*"],e,M,a(v,E)))):(f(H,E,M),p.push(H)))}}n=p.concat(o.shift()??[])}return s.length>1&&s.sort((l,d)=>l.score-d.score),[s.map(({handler:l,params:d})=>[l,d])]}},B=new WeakMap,A=new WeakMap,Z=new WeakMap,ce=new WeakMap,E=new WeakMap,$=new WeakSet,W=function(e,t,s,r){const n=[];for(let i=0,o=a(e,B).length;i<o;i++){const c=a(e,B)[i],l=c[t]||c[w],d={};if(l!==void 0&&(l.params=Object.create(null),n.push(l),s!==fe||r&&r!==fe))for(let u=0,h=l.possibleKeys.length;u<h;u++){const p=l.possibleKeys[u],y=d[l.score];l.params[p]=r!=null&&r[p]&&!y?r[p]:s[p]??(r==null?void 0:r[p]),d[l.score]=!0}}return n},Xe),Q,Ze,Zt=(Ze=class{constructor(){m(this,"name","TrieRouter");g(this,Q);f(this,Q,new gt)}add(e,t,s){const r=tt(t);if(r){for(let n=0,i=r.length;n<i;n++)a(this,Q).insert(e,r[n],s);return}a(this,Q).insert(e,t,s)}match(e,t){return a(this,Q).search(e,t)}},Q=new WeakMap,Ze),bt=class extends dt{constructor(e={}){super(e),this.router=e.router??new Xt({routers:[new Jt,new Zt]})}},Qt=e=>{const s={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},r=(i=>typeof i=="string"?i==="*"?()=>i:o=>i===o?o:null:typeof i=="function"?i:o=>i.includes(o)?o:null)(s.origin),n=(i=>typeof i=="function"?i:Array.isArray(i)?()=>i:()=>[])(s.allowMethods);return async function(o,c){var u;function l(h,p){o.res.headers.set(h,p)}const d=r(o.req.header("origin")||"",o);if(d&&l("Access-Control-Allow-Origin",d),s.origin!=="*"){const h=o.req.header("Vary");h?l("Vary",h):l("Vary","Origin")}if(s.credentials&&l("Access-Control-Allow-Credentials","true"),(u=s.exposeHeaders)!=null&&u.length&&l("Access-Control-Expose-Headers",s.exposeHeaders.join(",")),o.req.method==="OPTIONS"){s.maxAge!=null&&l("Access-Control-Max-Age",s.maxAge.toString());const h=n(o.req.header("origin")||"",o);h.length&&l("Access-Control-Allow-Methods",h.join(","));let p=s.allowHeaders;if(!(p!=null&&p.length)){const y=o.req.header("Access-Control-Request-Headers");y&&(p=y.split(/\s*,\s*/))}return p!=null&&p.length&&(l("Access-Control-Allow-Headers",p.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await c()}},es=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,qe=(e,t=ss)=>{const s=/\.([a-zA-Z0-9]+?)$/,r=e.match(s);if(!r)return;let n=t[r[1]];return n&&n.startsWith("text")&&(n+="; charset=utf-8"),n},ts={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},ss=ts,rs=(...e)=>{let t=e.filter(n=>n!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const s=t.split("/"),r=[];for(const n of s)n===".."&&r.length>0&&r.at(-1)!==".."?r.pop():n!=="."&&r.push(n);return r.join("/")||"."},vt={br:".br",zstd:".zst",gzip:".gz"},ns=Object.keys(vt),is="index.html",as=e=>{const t=e.root??"./",s=e.path,r=e.join??rs;return async(n,i)=>{var u,h,p,y;if(n.finalized)return i();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(n.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((u=e.onNotFound)==null?void 0:u.call(e,n.req.path,n)),i()}let c=r(t,!s&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(c)&&(c=r(c,is));const l=e.getContent;let d=await l(c,n);if(d instanceof Response)return n.newResponse(d.body,d);if(d){const P=e.mimes&&qe(c,e.mimes)||qe(c);if(n.header("Content-Type",P||"application/octet-stream"),e.precompressed&&(!P||es.test(P))){const v=new Set((h=n.req.header("Accept-Encoding"))==null?void 0:h.split(",").map(x=>x.trim()));for(const x of ns){if(!v.has(x))continue;const R=await l(c+vt[x],n);if(R){d=R,n.header("Content-Encoding",x),n.header("Vary","Accept-Encoding",{append:!0});break}}}return await((p=e.onFound)==null?void 0:p.call(e,c,n)),n.body(d)}await((y=e.onNotFound)==null?void 0:y.call(e,c,n)),await i()}},os=async(e,t)=>{let s;t&&t.manifest?typeof t.manifest=="string"?s=JSON.parse(t.manifest):s=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?s=JSON.parse(__STATIC_CONTENT_MANIFEST):s=__STATIC_CONTENT_MANIFEST;let r;t&&t.namespace?r=t.namespace:r=__STATIC_CONTENT;const n=s[e]||e;if(!n)return null;const i=await r.get(n,{type:"stream"});return i||null},ls=e=>async function(s,r){return as({...e,getContent:async i=>os(i,{manifest:e.manifest,namespace:e.namespace?e.namespace:s.env?s.env.__STATIC_CONTENT:void 0})})(s,r)},cs=e=>ls(e);const T=new bt;T.use("/api/*",Qt());T.use("/static/*",cs({root:"./public"}));T.post("/api/create-payment-intent",async e=>{try{const{amountCents:t,currency:s="usd",email:r,enableTapToPay:n=!1}=await e.req.json();if(!t||t<50)return e.json({error:"Invalid amount. Minimum $0.50 required."},400);const i={clientSecret:"pi_mock_client_secret_"+Math.random().toString(36).substring(7),paymentIntentId:"pi_mock_"+Math.random().toString(36).substring(7),amount:t,currency:s,email:r,enableTapToPay:n};return e.json(i)}catch(t){return console.error("Payment intent creation error:",t),e.json({error:"Failed to create payment intent"},500)}});T.post("/api/stripe/connection-token",async e=>{try{const t={secret:"pst_test_"+Math.random().toString(36).substring(7)+"_mock_connection_token"};return console.log("Created mock connection token for Android middleware"),e.json(t)}catch(t){return console.error("Connection token creation error:",t),e.json({error:"Failed to create connection token"},500)}});T.post("/api/stripe/payment-intents",async e=>{try{const{amount:t,currency:s="usd",email:r,automatic_payment_methods:n}=await e.req.json();if(!t||t<50)return e.json({error:"Invalid amount. Minimum $0.50 required."},400);const i={client_secret:"pi_mock_"+Math.random().toString(36).substring(7)+"_secret_mock",id:"pi_mock_"+Math.random().toString(36).substring(7),amount:t,currency:s,status:"requires_payment_method"};return console.log(`Created mock payment intent for Android middleware: $${t/100}`),e.json(i)}catch(t){return console.error("Payment intent creation error:",t),e.json({error:"Failed to create payment intent"},500)}});T.get("/api/terminal/readers",async e=>{try{return e.json({readers:[{id:"tmr_mock_reader",device_type:"mobile_phone_reader",location:"mock_location",status:"online",label:"Android Tap to Pay"}]})}catch{return e.json({error:"Failed to fetch readers"},500)}});T.get("/api/hebcal",async e=>{try{const{lat:t=28.5383,lon:s=-81.3792,geonameid:r}=e.req.query();let n="https://www.hebcal.com/shabbat?cfg=json&m=50";r?n+=`&geonameid=${r}`:n+=`&latitude=${t}&longitude=${s}`;const o=await(await fetch(n)).json();return e.json(o)}catch(t){return console.error("Hebcal API error:",t),e.json({error:"Failed to fetch Hebrew calendar data"},500)}});T.get("/api/health",e=>e.json({status:"healthy",timestamp:new Date().toISOString()}));T.get("/api/config",e=>e.json({backendUrl:"https://donations.unmannedunited.com",paymentEndpoint:"/create-payment-intent",adminPin:"12345",locationId:null,latitude:28.5383,longitude:-81.3792,timeZoneId:"America/New_York",shacharit:"7:00 AM",mincha:"2:00 PM",maariv:"8:00 PM"}));T.post("/api/config",async e=>{try{const t=await e.req.json();return console.log("Config saved:",t),e.json({success:!0})}catch{return e.json({error:"Failed to save configuration"},500)}});T.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>Ohr Shalom Donation Kiosk</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://js.stripe.com/v3/"><\/script>
        <style>
            /* Kiosk optimizations for landscape tablets */
            html, body {
                height: 100vh;
                overflow: hidden;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
            }
            
            /* Prevent zoom and selection */
            * {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            
            input[type="email"], input[type="number"], input[type="password"] {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
            }
            
            /* Landscape tablet optimizations - Compact layout */
            @media (orientation: landscape) and (min-width: 768px) {
                .landscape-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 1rem;
                    height: calc(100vh - 1rem);
                    max-height: calc(100vh - 1rem);
                }
                
                .landscape-left {
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }
                
                .landscape-right {
                    overflow-y: auto;
                    padding-left: 0.5rem;
                }
                
                .amount-button {
                    min-height: 65px;
                    font-size: 18px;
                }
                
                .kiosk-button {
                    min-height: 50px;
                    font-size: 15px;
                }
                
                /* Compact sections for landscape */
                .compact-section {
                    padding: 0.75rem !important;
                    margin-bottom: 0.75rem !important;
                }
                
                .compact-section h3 {
                    font-size: 1rem !important;
                    margin-bottom: 0.5rem !important;
                }
            }
            
            /* Tablet optimized buttons */
            .kiosk-button {
                min-height: 60px;
                font-size: 18px;
                font-weight: bold;
                touch-action: manipulation;
            }
            
            .amount-button {
                min-height: 80px;
                font-size: 24px;
                font-weight: bold;
            }
            
            /* Hide scrollbars but allow scrolling */
            .scroll-container {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            .scroll-container::-webkit-scrollbar {
                display: none;
            }
            
            /* Enhanced animations */
            .pulse-animation {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            .bounce-in {
                animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .slide-up {
                animation: slideUp 0.5s ease-out;
            }
            
            .success-glow {
                animation: successGlow 2s ease-in-out;
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
            }
            
            .processing-spin {
                animation: spin 1s linear infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: .7; transform: scale(1.05); }
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.1); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes slideUp {
                0% { transform: translateY(30px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes successGlow {
                0% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.3); }
                50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
                100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.3); }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Hebrew text support */
            .hebrew-text {
                font-family: 'Noto Sans Hebrew', 'David', 'Times New Roman', serif;
                direction: rtl;
                text-align: right;
            }
            
            /* Hebrew text properly centered for buttons */
            .hebrew-text {
                font-family: 'Noto Sans Hebrew', 'David', 'Times New Roman', serif;
                direction: ltr;
                text-align: center;
                font-size: 1.2rem;
                font-weight: 600;
                margin-top: 2px;
            }
            
            /* Interactive elements */
            .interactive-hover {
                transition: all 0.3s ease;
            }
            
            .interactive-hover:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
            
            .donation-amount-display {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
                padding: 1rem;
                text-align: center;
                margin: 1rem 0;
                border: 3px solid transparent;
                background-clip: padding-box;
            }
            
            .success-message {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                animation: bounceIn 0.6s ease-out;
            }
            
            /* Enhanced Hebrew font loading */
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;600;700&display=swap');
            
            /* Zmanim table styling */
            .zmanim-table {
                font-size: 0.85rem;
                line-height: 1.4;
            }
            
            .zmanim-table td {
                padding: 0.25rem 0.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .zmanim-table tr:last-child td {
                border-bottom: none;
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="min-h-screen p-2">
            <!-- Header with Logo -->
            <div class="text-center mb-2">
                <div id="logoContainer" class="cursor-pointer inline-block">
                    <div class="w-80 h-16 mx-auto bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-blue-200 p-2">
                        <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600" 
                            style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3); font-family: 'Times New Roman', serif;">
                            ✡ OHR SHALOM ✡
                        </h1>
                        <!-- Last updated: 2025-01-15 -->
                    </div>
                </div>

            </div>
            
            <!-- Main Content Grid for Landscape -->
            <div class="landscape-grid">
                <!-- Left Column: Times and Calendar -->
                <div class="landscape-left scroll-container">

                    <!-- Date and Calendar Information -->
                    <div class="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-lg p-4 mb-4 interactive-hover compact-section">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">
                            <i class="fas fa-calendar-alt mr-2 text-blue-600"></i>Today's Date
                        </h3>
                        <div id="dateInfo" class="space-y-3">
                            <!-- Current Time Display -->
                            <div class="bg-blue-100 rounded-lg p-3 text-center">
                                <div class="text-xs text-blue-600 font-medium mb-1">Current Time</div>
                                <div id="currentTime" class="text-2xl font-bold text-blue-800"></div>
                            </div>
                            
                            <!-- English Date -->
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-gray-500 font-medium">Gregorian:</span>
                                <div id="gregorianDate" class="text-base font-semibold text-gray-800"></div>
                            </div>
                            
                            <!-- Hebrew Date -->
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-gray-500 font-medium">Hebrew:</span>
                                <div id="hebrewDate" class="text-base font-semibold text-gray-700" 
                                     style="font-family: 'Noto Sans Hebrew', 'David', 'Times New Roman', serif;"></div>
                            </div>
                            
                            <!-- Parsha of the Week -->
                            <div class="mt-3 pt-3 border-t border-gray-200">
                                <div class="text-xs font-medium text-gray-600 mb-2 flex items-center">
                                    <i class="fas fa-book-open mr-1 text-purple-600"></i>
                                    Parashat HaShavua
                                </div>
                                <div id="parsha" class="text-lg font-bold text-purple-800 bg-purple-50 rounded-lg p-2 text-center" 
                                     style="font-family: 'Noto Sans Hebrew', 'David', 'Times New Roman', serif;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Prayer Times -->
                    <div class="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-lg p-4 mb-4 interactive-hover compact-section">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">
                            <i class="fas fa-pray mr-2 text-green-600"></i>Daily Prayers
                        </h3>
                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                            <div class="space-y-2 text-sm">
                                <div id="shacharit" class="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                            <i class="fas fa-sun text-yellow-600"></i>
                                        </div>
                                        <div>
                                            <span class="font-semibold text-gray-800">Shacharit</span>
                                            <div class="text-xs text-gray-500">Morning Prayer</div>
                                        </div>
                                    </div>
                                    <span class="font-bold text-yellow-700">7:00 AM</span>
                                </div>
                                <div id="mincha" class="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                            <i class="fas fa-sun text-orange-600"></i>
                                        </div>
                                        <div>
                                            <span class="font-semibold text-gray-800">Mincha</span>
                                            <div class="text-xs text-gray-500">Afternoon Prayer</div>
                                        </div>
                                    </div>
                                    <span class="font-bold text-orange-700">2:00 PM</span>
                                </div>
                                <div id="maariv" class="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                            <i class="fas fa-moon text-indigo-600"></i>
                                        </div>
                                        <div>
                                            <span class="font-semibold text-gray-800">Maariv</span>
                                            <div class="text-xs text-gray-500">Evening Prayer</div>
                                        </div>
                                    </div>
                                    <span class="font-bold text-indigo-700">8:00 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Shabbat Times -->
                    <div class="bg-white rounded-lg shadow-lg p-4 mb-4 compact-section">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">
                            <i class="fas fa-star-of-david mr-2"></i>Shabbat Times
                        </h3>
                        <div class="bg-blue-50 p-3 rounded-lg">
                            <div class="space-y-1 text-sm">
                                <div id="candleLighting" class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <img src="https://page.gensparksite.com/v1/base64_upload/7942de6656cf5f4113b974e156f0a084" 
                                             alt="Shabbat Candles" 
                                             class="w-6 h-6 mr-2 object-contain"
                                             style="background: transparent;">
                                        <span class="font-medium">Candle Lighting</span>
                                    </div>
                                    <span class="text-gray-700">Loading...</span>
                                </div>
                                <div id="eighteenMin" class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-star w-4 text-blue-600 mr-2"></i>
                                        <span class="font-medium">18 Min</span>
                                    </div>
                                    <span class="text-gray-700">Loading...</span>
                                </div>
                                <div id="havdalah" class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-wine-glass w-4 text-purple-600 mr-2"></i>
                                        <span class="font-medium">Havdalah</span>
                                    </div>
                                    <span class="text-gray-700">Loading...</span>
                                </div>
                                <div id="seventytwoMin" class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-clock w-4 text-indigo-600 mr-2"></i>
                                        <span class="font-medium">72min</span>
                                    </div>
                                    <span class="text-gray-700">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Condensed Zmanim -->
                    <div class="bg-white rounded-lg shadow-lg p-3 mb-4 compact-section">
                        <h3 class="text-base font-semibold text-gray-800 mb-2">
                            <i class="fas fa-clock mr-1 text-xs"></i>Key Zmanim
                        </h3>
                        <div class="bg-gray-50 p-2 rounded-lg">
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium text-gray-700">Sunrise</span>
                                    <span class="text-gray-600">6:57 AM</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium text-gray-700">Sunset</span>
                                    <span class="text-gray-600">7:59 PM</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium text-gray-700">Shema (GRA)</span>
                                    <span class="text-gray-600">10:13 AM</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium text-gray-700">Tefillah (GRA)</span>
                                    <span class="text-gray-600">11:18 AM</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium text-gray-700">Chatzos</span>
                                    <span class="text-gray-600">1:28 PM</span>
                                </div>
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium text-gray-700">Min. Ketana</span>
                                    <span class="text-gray-600">5:16 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column: Donation Interface -->
                <div class="landscape-right scroll-container">

                    <!-- Donation Interface -->
                    <div class="bg-white rounded-lg shadow-lg p-4 mb-4 compact-section">
                        <h2 class="text-xl font-bold text-center text-gray-800 mb-4">
                            <i class="fas fa-heart mr-2 text-red-500"></i>
                            Make a Donation
                        </h2>
                        
                        <!-- Preset Amount Buttons -->
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <button class="amount-button bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 interactive-hover" data-amount="5">
                                <div class="text-2xl font-bold">$5</div>
                                <div class="text-xs opacity-80">Starter Gift</div>
                            </button>
                            <button class="amount-button bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 interactive-hover" data-amount="18">
                                <div class="text-2xl font-bold">$18</div>
                                <div class="hebrew-text">חי</div>
                            </button>
                            <button class="amount-button bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-300 interactive-hover" data-amount="36">
                                <div class="text-2xl font-bold">$36</div>
                                <div class="hebrew-text">Double חי</div>
                            </button>
                            <button class="amount-button bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all duration-300 interactive-hover" id="customAmountBtn">
                                <div class="text-xl font-bold">Custom</div>
                                <div class="text-xs opacity-80">Your Choice</div>
                            </button>
                        </div>
                        
                        <!-- Selected Amount Display -->
                        <div class="text-center mb-4">
                            <div class="donation-amount-display slide-up" id="selectedAmountContainer">
                                <div class="text-sm opacity-90 mb-1">Selected Donation</div>
                                <div class="text-3xl font-bold" id="selectedAmount">
                                    $0.00
                                </div>
                                <div class="text-xs opacity-80 mt-1" id="selectedAmountHebrew">
                                    <!-- Hebrew equivalent will be shown here -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- Email Input -->
                        <div class="mb-4">
                            <label for="emailInput" class="block text-sm font-medium text-gray-700 mb-1">
                                Email for receipt (optional)
                            </label>
                            <input 
                                type="email" 
                                id="emailInput" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                placeholder="your.email@example.com"
                            >
                        </div>
                        
                        <!-- Payment Method Selection -->
                        <div class="mb-4">
                            <h3 class="text-base font-semibold text-gray-800 mb-2">Payment Method</h3>
                            <div class="grid grid-cols-1 gap-3">
                                <button id="tapToPayBtn" class="kiosk-button bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-colors flex items-center justify-center">
                                    <i class="fas fa-mobile-alt mr-2 text-xl"></i>
                                    <div>
                                        <div class="font-bold">Tap to Pay</div>
                                        <div class="text-sm">Touch your card or phone</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Tap to Pay Interface -->
                        <div id="tapToPayInterface" class="hidden">
                            <div class="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-100 interactive-hover">
                                <div class="text-5xl mb-4">
                                    <i class="fas fa-wifi pulse-animation text-blue-500"></i>
                                </div>
                                <h3 class="text-xl font-bold text-blue-800 mb-3">Ready for Tap to Pay</h3>
                                <p class="text-blue-600 mb-4 text-sm leading-relaxed">Hold your contactless card or mobile device near the screen</p>
                                <div class="donation-amount-display mb-4" id="tapAmountContainer">
                                    <div class="text-2xl font-bold" id="tapAmount">$0.00</div>
                                </div>
                                <div class="flex justify-center space-x-4">
                                    <button id="cancelTapToPay" class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 text-sm font-semibold">
                                        <i class="fas fa-times mr-2"></i>Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Processing Interface -->
                        <div id="processingInterface" class="hidden">
                            <div class="border-2 border-green-300 rounded-lg p-6 text-center bg-gradient-to-br from-green-50 to-emerald-100">
                                <div class="text-5xl mb-4">
                                    <i class="fas fa-credit-card processing-spin text-green-500"></i>
                                </div>
                                <h3 class="text-xl font-bold text-green-800 mb-3">Processing Payment</h3>
                                <p class="text-green-600 mb-4 text-sm">Please wait while we process your donation...</p>
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                                    <div class="bg-green-500 h-2 rounded-full animate-pulse" style="width: 70%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Success Interface -->
                        <div id="successInterface" class="hidden">
                            <div class="success-message">
                                <div class="text-5xl mb-4">
                                    <i class="fas fa-check-circle text-white"></i>
                                </div>
                                <h3 class="text-2xl font-bold mb-3">Thank You!</h3>
                                <p class="text-lg mb-4">Your donation has been processed successfully</p>
                                <div class="text-xl font-semibold" id="successAmount">$0.00</div>
                                <p class="text-sm mt-3 opacity-90">May your generosity bring blessings</p>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            <!-- Status Messages -->
            <div id="statusMessage" class="hidden fixed top-4 right-4 z-50"></div>
        </div>

        <!-- Admin Modal -->
        <div id="adminModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4">Admin Access</h3>
                <input type="password" id="adminPinInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" placeholder="Enter PIN">
                <div class="flex space-x-4">
                    <button id="adminSubmit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">Submit</button>
                    <button id="adminCancel" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Custom Amount Modal -->
        <div id="customAmountModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4">Custom Amount</h3>
                <input type="number" id="customAmountInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" placeholder="Enter amount in USD" min="1" step="0.01">
                <div class="flex space-x-4">
                    <button id="customAmountSubmit" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">Set Amount</button>
                    <button id="customAmountCancel" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg">Cancel</button>
                </div>
            </div>
        </div>

        <script src="/static/kiosk.js"><\/script>
    </body>
    </html>
  `));const Ue=new bt,ds=Object.assign({"/src/index.tsx":T});let xt=!1;for(const[,e]of Object.entries(ds))e&&(Ue.route("/",e),Ue.notFound(e.notFoundHandler),xt=!0);if(!xt)throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");export{Ue as default};

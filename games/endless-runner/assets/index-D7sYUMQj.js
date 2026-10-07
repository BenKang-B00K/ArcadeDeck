(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ha="169",Lu=0,bc=1,Iu=2,oh=1,ah=2,Pn=3,ei=0,Ge=1,_n=2,jn=0,Yi=1,vn=2,Tc=3,Ac=4,Du=5,gi=100,Uu=101,Nu=102,Ou=103,Fu=104,zu=200,Bu=201,ku=202,Gu=203,ko=204,Go=205,Hu=206,Vu=207,Wu=208,Xu=209,Yu=210,qu=211,Ku=212,Ju=213,Zu=214,Ho=0,Vo=1,Wo=2,$i=3,Xo=4,Yo=5,qo=6,Ko=7,ch=0,$u=1,ju=2,Qn=0,Qu=1,tf=2,ef=3,nf=4,sf=5,rf=6,of=7,lh=300,ji=301,Qi=302,Jo=303,Zo=304,Gr=306,Rr=1e3,vi=1001,$o=1002,Qe=1003,af=1004,ks=1005,hn=1006,eo=1007,xi=1008,On=1009,hh=1010,uh=1011,Rs=1012,Va=1013,Mi=1014,Dn=1015,rs=1016,Wa=1017,Xa=1018,ts=1020,fh=35902,dh=1021,ph=1022,fn=1023,mh=1024,gh=1025,qi=1026,es=1027,_h=1028,Ya=1029,vh=1030,qa=1031,Ka=1033,gr=33776,_r=33777,vr=33778,xr=33779,jo=35840,Qo=35841,ta=35842,ea=35843,na=36196,ia=37492,sa=37496,ra=37808,oa=37809,aa=37810,ca=37811,la=37812,ha=37813,ua=37814,fa=37815,da=37816,pa=37817,ma=37818,ga=37819,_a=37820,va=37821,Mr=36492,xa=36494,Ma=36495,xh=36283,Sa=36284,ya=36285,Ea=36286,cf=3200,lf=3201,Mh=0,hf=1,qn="",dn="srgb",ii="srgb-linear",Ja="display-p3",Hr="display-p3-linear",Cr="linear",ue="srgb",Pr="rec709",Lr="p3",Ti=7680,Rc=519,uf=512,ff=513,df=514,Sh=515,pf=516,mf=517,gf=518,_f=519,Cc=35044,Pc="300 es",Un=2e3,Ir=2001;class os{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const i=this._listeners;return i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const i=this._listeners[t.type];if(i!==void 0){t.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const De=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Lc=1234567;const ys=Math.PI/180,Cs=180/Math.PI;function Ei(){const n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(De[n&255]+De[n>>8&255]+De[n>>16&255]+De[n>>24&255]+"-"+De[t&255]+De[t>>8&255]+"-"+De[t>>16&15|64]+De[t>>24&255]+"-"+De[e&63|128]+De[e>>8&255]+"-"+De[e>>16&255]+De[e>>24&255]+De[i&255]+De[i>>8&255]+De[i>>16&255]+De[i>>24&255]).toLowerCase()}function be(n,t,e){return Math.max(t,Math.min(e,n))}function Za(n,t){return(n%t+t)%t}function vf(n,t,e,i,s){return i+(n-t)*(s-i)/(e-t)}function xf(n,t,e){return n!==t?(e-n)/(t-n):0}function Es(n,t,e){return(1-e)*n+e*t}function Mf(n,t,e,i){return Es(n,t,1-Math.exp(-e*i))}function Sf(n,t=1){return t-Math.abs(Za(n,t*2)-t)}function yf(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*(3-2*n))}function Ef(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*n*(n*(n*6-15)+10))}function wf(n,t){return n+Math.floor(Math.random()*(t-n+1))}function bf(n,t){return n+Math.random()*(t-n)}function Tf(n){return n*(.5-Math.random())}function Af(n){n!==void 0&&(Lc=n);let t=Lc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Rf(n){return n*ys}function Cf(n){return n*Cs}function Pf(n){return(n&n-1)===0&&n!==0}function Lf(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function If(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Df(n,t,e,i,s){const r=Math.cos,o=Math.sin,a=r(e/2),c=o(e/2),l=r((t+i)/2),h=o((t+i)/2),f=r((t-i)/2),u=o((t-i)/2),d=r((i-t)/2),g=o((i-t)/2);switch(s){case"XYX":n.set(a*h,c*f,c*u,a*l);break;case"YZY":n.set(c*u,a*h,c*f,a*l);break;case"ZXZ":n.set(c*f,c*u,a*h,a*l);break;case"XZX":n.set(a*h,c*g,c*d,a*l);break;case"YXY":n.set(c*d,a*h,c*g,a*l);break;case"ZYZ":n.set(c*g,c*d,a*h,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Gi(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Ne(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const yh={DEG2RAD:ys,RAD2DEG:Cs,generateUUID:Ei,clamp:be,euclideanModulo:Za,mapLinear:vf,inverseLerp:xf,lerp:Es,damp:Mf,pingpong:Sf,smoothstep:yf,smootherstep:Ef,randInt:wf,randFloat:bf,randFloatSpread:Tf,seededRandom:Af,degToRad:Rf,radToDeg:Cf,isPowerOfTwo:Pf,ceilPowerOfTwo:Lf,floorPowerOfTwo:If,setQuaternionFromProperEuler:Df,normalize:Ne,denormalize:Gi};class rt{constructor(t=0,e=0){rt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(be(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*s+t.x,this.y=r*s+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Yt{constructor(t,e,i,s,r,o,a,c,l){Yt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,a,c,l)}set(t,e,i,s,r,o,a,c,l){const h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=c,h[6]=i,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,s=e.elements,r=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],h=i[4],f=i[7],u=i[2],d=i[5],g=i[8],x=s[0],p=s[3],m=s[6],w=s[1],y=s[4],_=s[7],L=s[2],R=s[5],A=s[8];return r[0]=o*x+a*w+c*L,r[3]=o*p+a*y+c*R,r[6]=o*m+a*_+c*A,r[1]=l*x+h*w+f*L,r[4]=l*p+h*y+f*R,r[7]=l*m+h*_+f*A,r[2]=u*x+d*w+g*L,r[5]=u*p+d*y+g*R,r[8]=u*m+d*_+g*A,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return e*o*h-e*a*l-i*r*h+i*a*c+s*r*l-s*o*c}invert(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],f=h*o-a*l,u=a*c-h*r,d=l*r-o*c,g=e*f+i*u+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return t[0]=f*x,t[1]=(s*l-h*i)*x,t[2]=(a*i-s*o)*x,t[3]=u*x,t[4]=(h*e-s*c)*x,t[5]=(s*r-a*e)*x,t[6]=d*x,t[7]=(i*c-l*e)*x,t[8]=(o*e-i*r)*x,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*o+l*a)+o+t,-s*l,s*c,-s*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(no.makeScale(t,e)),this}rotate(t){return this.premultiply(no.makeRotation(-t)),this}translate(t,e){return this.premultiply(no.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const no=new Yt;function Eh(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function Dr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Uf(){const n=Dr("canvas");return n.style.display="block",n}const Ic={};function Sr(n){n in Ic||(Ic[n]=!0,console.warn(n))}function Nf(n,t,e){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}function Of(n){const t=n.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Ff(n){const t=n.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Dc=new Yt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Uc=new Yt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ls={[ii]:{transfer:Cr,primaries:Pr,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n,fromReference:n=>n},[dn]:{transfer:ue,primaries:Pr,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[Hr]:{transfer:Cr,primaries:Lr,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.applyMatrix3(Uc),fromReference:n=>n.applyMatrix3(Dc)},[Ja]:{transfer:ue,primaries:Lr,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.convertSRGBToLinear().applyMatrix3(Uc),fromReference:n=>n.applyMatrix3(Dc).convertLinearToSRGB()}},zf=new Set([ii,Hr]),se={enabled:!0,_workingColorSpace:ii,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!zf.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,t,e){if(this.enabled===!1||t===e||!t||!e)return n;const i=ls[t].toReference,s=ls[e].fromReference;return s(i(n))},fromWorkingColorSpace:function(n,t){return this.convert(n,this._workingColorSpace,t)},toWorkingColorSpace:function(n,t){return this.convert(n,t,this._workingColorSpace)},getPrimaries:function(n){return ls[n].primaries},getTransfer:function(n){return n===qn?Cr:ls[n].transfer},getLuminanceCoefficients:function(n,t=this._workingColorSpace){return n.fromArray(ls[t].luminanceCoefficients)}};function Ki(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function io(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Ai;class Bf{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Ai===void 0&&(Ai=Dr("canvas")),Ai.width=t.width,Ai.height=t.height;const i=Ai.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),e=Ai}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Dr("canvas");e.width=t.width,e.height=t.height;const i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);const s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Ki(r[o]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Ki(e[i]/255)*255):e[i]=Ki(e[i]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let kf=0;class wh{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:kf++}),this.uuid=Ei(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(so(s[o].image)):r.push(so(s[o]))}else r=so(s);i.url=r}return e||(t.images[this.uuid]=i),i}}function so(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Bf.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Gf=0;class Fe extends os{constructor(t=Fe.DEFAULT_IMAGE,e=Fe.DEFAULT_MAPPING,i=vi,s=vi,r=hn,o=xi,a=fn,c=On,l=Fe.DEFAULT_ANISOTROPY,h=qn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Gf++}),this.uuid=Ei(),this.name="",this.source=new wh(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new rt(0,0),this.repeat=new rt(1,1),this.center=new rt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Yt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==lh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Rr:t.x=t.x-Math.floor(t.x);break;case vi:t.x=t.x<0?0:1;break;case $o:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Rr:t.y=t.y-Math.floor(t.y);break;case vi:t.y=t.y<0?0:1;break;case $o:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Fe.DEFAULT_IMAGE=null;Fe.DEFAULT_MAPPING=lh;Fe.DEFAULT_ANISOTROPY=1;class oe{constructor(t=0,e=0,i=0,s=1){oe.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,i=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r;const c=t.elements,l=c[0],h=c[4],f=c[8],u=c[1],d=c[5],g=c[9],x=c[2],p=c[6],m=c[10];if(Math.abs(h-u)<.01&&Math.abs(f-x)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+x)<.1&&Math.abs(g+p)<.1&&Math.abs(l+d+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(l+1)/2,_=(d+1)/2,L=(m+1)/2,R=(h+u)/4,A=(f+x)/4,D=(g+p)/4;return y>_&&y>L?y<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(y),s=R/i,r=A/i):_>L?_<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),i=R/s,r=D/s):L<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(L),i=A/r,s=D/r),this.set(i,s,r,e),this}let w=Math.sqrt((p-g)*(p-g)+(f-x)*(f-x)+(u-h)*(u-h));return Math.abs(w)<.001&&(w=1),this.x=(p-g)/w,this.y=(f-x)/w,this.z=(u-h)/w,this.w=Math.acos((l+d+m-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Hf extends os{constructor(t=1,e=1,i={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new oe(0,0,t,e),this.scissorTest=!1,this.viewport=new oe(0,0,t,e);const s={width:t,height:e,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:hn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const r=new Fe(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let i=0,s=t.textures.length;i<s;i++)this.textures[i]=t.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new wh(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ni extends Hf{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}}class bh extends Fe{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=Qe,this.minFilter=Qe,this.wrapR=vi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Vf extends Fe{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=Qe,this.minFilter=Qe,this.wrapR=vi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Us{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,o,a){let c=i[s+0],l=i[s+1],h=i[s+2],f=i[s+3];const u=r[o+0],d=r[o+1],g=r[o+2],x=r[o+3];if(a===0){t[e+0]=c,t[e+1]=l,t[e+2]=h,t[e+3]=f;return}if(a===1){t[e+0]=u,t[e+1]=d,t[e+2]=g,t[e+3]=x;return}if(f!==x||c!==u||l!==d||h!==g){let p=1-a;const m=c*u+l*d+h*g+f*x,w=m>=0?1:-1,y=1-m*m;if(y>Number.EPSILON){const L=Math.sqrt(y),R=Math.atan2(L,m*w);p=Math.sin(p*R)/L,a=Math.sin(a*R)/L}const _=a*w;if(c=c*p+u*_,l=l*p+d*_,h=h*p+g*_,f=f*p+x*_,p===1-a){const L=1/Math.sqrt(c*c+l*l+h*h+f*f);c*=L,l*=L,h*=L,f*=L}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,i,s,r,o){const a=i[s],c=i[s+1],l=i[s+2],h=i[s+3],f=r[o],u=r[o+1],d=r[o+2],g=r[o+3];return t[e]=a*g+h*f+c*d-l*u,t[e+1]=c*g+h*u+l*f-a*d,t[e+2]=l*g+h*d+a*u-c*f,t[e+3]=h*g-a*f-c*u-l*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const i=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(i/2),h=a(s/2),f=a(r/2),u=c(i/2),d=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=u*h*f+l*d*g,this._y=l*d*f-u*h*g,this._z=l*h*g+u*d*f,this._w=l*h*f-u*d*g;break;case"YXZ":this._x=u*h*f+l*d*g,this._y=l*d*f-u*h*g,this._z=l*h*g-u*d*f,this._w=l*h*f+u*d*g;break;case"ZXY":this._x=u*h*f-l*d*g,this._y=l*d*f+u*h*g,this._z=l*h*g+u*d*f,this._w=l*h*f-u*d*g;break;case"ZYX":this._x=u*h*f-l*d*g,this._y=l*d*f+u*h*g,this._z=l*h*g-u*d*f,this._w=l*h*f+u*d*g;break;case"YZX":this._x=u*h*f+l*d*g,this._y=l*d*f+u*h*g,this._z=l*h*g-u*d*f,this._w=l*h*f-u*d*g;break;case"XZY":this._x=u*h*f-l*d*g,this._y=l*d*f-u*h*g,this._z=l*h*g+u*d*f,this._w=l*h*f+u*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,i=e[0],s=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],h=e[6],f=e[10],u=i+a+f;if(u>0){const d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(h-c)*d,this._y=(r-l)*d,this._z=(o-s)*d}else if(i>a&&i>f){const d=2*Math.sqrt(1+i-a-f);this._w=(h-c)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+l)/d}else if(a>f){const d=2*Math.sqrt(1+a-i-f);this._w=(r-l)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(c+h)/d}else{const d=2*Math.sqrt(1+f-i-a);this._w=(o-s)/d,this._x=(r+l)/d,this._y=(c+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(be(this.dot(t),-1,1)))}rotateTowards(t,e){const i=this.angleTo(t);if(i===0)return this;const s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const i=t._x,s=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,h=e._w;return this._x=i*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-i*l,this._z=r*h+o*l+i*c-s*a,this._w=o*h-i*a-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const i=this._x,s=this._y,r=this._z,o=this._w;let a=o*t._w+i*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;const c=1-a*a;if(c<=Number.EPSILON){const d=1-e;return this._w=d*o+e*this._w,this._x=d*i+e*this._x,this._y=d*s+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,a),f=Math.sin((1-e)*h)/l,u=Math.sin(e*h)/l;return this._w=o*f+this._w*u,this._x=i*f+this._x*u,this._y=s*f+this._y*u,this._z=r*f+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(t=0,e=0,i=0){P.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Nc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Nc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,i=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,i=this.y,s=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*s-a*i),h=2*(a*e-r*s),f=2*(r*i-o*e);return this.x=e+c*l+o*f-a*h,this.y=i+c*h+a*l-r*f,this.z=s+c*f+r*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const i=t.x,s=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=s*c-r*a,this.y=r*o-i*c,this.z=i*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return ro.copy(this).projectOnVector(t),this.sub(ro)}reflect(t){return this.sub(ro.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(be(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){const s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ro=new P,Nc=new Us;class wi{constructor(t=new P(1/0,1/0,1/0),e=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(en.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(en.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const i=en.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const i=t.geometry;if(i!==void 0){const r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,en):en.fromBufferAttribute(r,o),en.applyMatrix4(t.matrixWorld),this.expandByPoint(en);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Gs.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Gs.copy(i.boundingBox)),Gs.applyMatrix4(t.matrixWorld),this.union(Gs)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,en),en.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(hs),Hs.subVectors(this.max,hs),Ri.subVectors(t.a,hs),Ci.subVectors(t.b,hs),Pi.subVectors(t.c,hs),Gn.subVectors(Ci,Ri),Hn.subVectors(Pi,Ci),oi.subVectors(Ri,Pi);let e=[0,-Gn.z,Gn.y,0,-Hn.z,Hn.y,0,-oi.z,oi.y,Gn.z,0,-Gn.x,Hn.z,0,-Hn.x,oi.z,0,-oi.x,-Gn.y,Gn.x,0,-Hn.y,Hn.x,0,-oi.y,oi.x,0];return!oo(e,Ri,Ci,Pi,Hs)||(e=[1,0,0,0,1,0,0,0,1],!oo(e,Ri,Ci,Pi,Hs))?!1:(Vs.crossVectors(Gn,Hn),e=[Vs.x,Vs.y,Vs.z],oo(e,Ri,Ci,Pi,Hs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,en).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(en).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(bn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const bn=[new P,new P,new P,new P,new P,new P,new P,new P],en=new P,Gs=new wi,Ri=new P,Ci=new P,Pi=new P,Gn=new P,Hn=new P,oi=new P,hs=new P,Hs=new P,Vs=new P,ai=new P;function oo(n,t,e,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){ai.fromArray(n,r);const a=s.x*Math.abs(ai.x)+s.y*Math.abs(ai.y)+s.z*Math.abs(ai.z),c=t.dot(ai),l=e.dot(ai),h=i.dot(ai);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const Wf=new wi,us=new P,ao=new P;class Vr{constructor(t=new P,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const i=this.center;e!==void 0?i.copy(e):Wf.setFromPoints(t).getCenter(i);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;us.subVectors(t,this.center);const e=us.lengthSq();if(e>this.radius*this.radius){const i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(us,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ao.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(us.copy(t.center).add(ao)),this.expandByPoint(us.copy(t.center).sub(ao))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Tn=new P,co=new P,Ws=new P,Vn=new P,lo=new P,Xs=new P,ho=new P;class Th{constructor(t=new P,e=new P(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Tn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Tn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Tn.copy(this.origin).addScaledVector(this.direction,e),Tn.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){co.copy(t).add(e).multiplyScalar(.5),Ws.copy(e).sub(t).normalize(),Vn.copy(this.origin).sub(co);const r=t.distanceTo(e)*.5,o=-this.direction.dot(Ws),a=Vn.dot(this.direction),c=-Vn.dot(Ws),l=Vn.lengthSq(),h=Math.abs(1-o*o);let f,u,d,g;if(h>0)if(f=o*c-a,u=o*a-c,g=r*h,f>=0)if(u>=-g)if(u<=g){const x=1/h;f*=x,u*=x,d=f*(f+o*u+2*a)+u*(o*f+u+2*c)+l}else u=r,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*c)+l;else u=-r,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*c)+l;else u<=-g?(f=Math.max(0,-(-o*r+a)),u=f>0?-r:Math.min(Math.max(-r,-c),r),d=-f*f+u*(u+2*c)+l):u<=g?(f=0,u=Math.min(Math.max(-r,-c),r),d=u*(u+2*c)+l):(f=Math.max(0,-(o*r+a)),u=f>0?r:Math.min(Math.max(-r,-c),r),d=-f*f+u*(u+2*c)+l);else u=o>0?-r:r,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(co).addScaledVector(Ws,u),d}intersectSphere(t,e){Tn.subVectors(t.center,this.origin);const i=Tn.dot(this.direction),s=Tn.dot(Tn)-i*i,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){const i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,r,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return l>=0?(i=(t.min.x-u.x)*l,s=(t.max.x-u.x)*l):(i=(t.max.x-u.x)*l,s=(t.min.x-u.x)*l),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(t.min.z-u.z)*f,c=(t.max.z-u.z)*f):(a=(t.max.z-u.z)*f,c=(t.min.z-u.z)*f),i>c||a>s)||((a>i||i!==i)&&(i=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,Tn)!==null}intersectTriangle(t,e,i,s,r){lo.subVectors(e,t),Xs.subVectors(i,t),ho.crossVectors(lo,Xs);let o=this.direction.dot(ho),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Vn.subVectors(this.origin,t);const c=a*this.direction.dot(Xs.crossVectors(Vn,Xs));if(c<0)return null;const l=a*this.direction.dot(lo.cross(Vn));if(l<0||c+l>o)return null;const h=-a*Vn.dot(ho);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class fe{constructor(t,e,i,s,r,o,a,c,l,h,f,u,d,g,x,p){fe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,a,c,l,h,f,u,d,g,x,p)}set(t,e,i,s,r,o,a,c,l,h,f,u,d,g,x,p){const m=this.elements;return m[0]=t,m[4]=e,m[8]=i,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=c,m[2]=l,m[6]=h,m[10]=f,m[14]=u,m[3]=d,m[7]=g,m[11]=x,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new fe().fromArray(this.elements)}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){const e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,i=t.elements,s=1/Li.setFromMatrixColumn(t,0).length(),r=1/Li.setFromMatrixColumn(t,1).length(),o=1/Li.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,i=t.x,s=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){const u=o*h,d=o*f,g=a*h,x=a*f;e[0]=c*h,e[4]=-c*f,e[8]=l,e[1]=d+g*l,e[5]=u-x*l,e[9]=-a*c,e[2]=x-u*l,e[6]=g+d*l,e[10]=o*c}else if(t.order==="YXZ"){const u=c*h,d=c*f,g=l*h,x=l*f;e[0]=u+x*a,e[4]=g*a-d,e[8]=o*l,e[1]=o*f,e[5]=o*h,e[9]=-a,e[2]=d*a-g,e[6]=x+u*a,e[10]=o*c}else if(t.order==="ZXY"){const u=c*h,d=c*f,g=l*h,x=l*f;e[0]=u-x*a,e[4]=-o*f,e[8]=g+d*a,e[1]=d+g*a,e[5]=o*h,e[9]=x-u*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){const u=o*h,d=o*f,g=a*h,x=a*f;e[0]=c*h,e[4]=g*l-d,e[8]=u*l+x,e[1]=c*f,e[5]=x*l+u,e[9]=d*l-g,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){const u=o*c,d=o*l,g=a*c,x=a*l;e[0]=c*h,e[4]=x-u*f,e[8]=g*f+d,e[1]=f,e[5]=o*h,e[9]=-a*h,e[2]=-l*h,e[6]=d*f+g,e[10]=u-x*f}else if(t.order==="XZY"){const u=o*c,d=o*l,g=a*c,x=a*l;e[0]=c*h,e[4]=-f,e[8]=l*h,e[1]=u*f+x,e[5]=o*h,e[9]=d*f-g,e[2]=g*f-d,e[6]=a*h,e[10]=x*f+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Xf,t,Yf)}lookAt(t,e,i){const s=this.elements;return Ye.subVectors(t,e),Ye.lengthSq()===0&&(Ye.z=1),Ye.normalize(),Wn.crossVectors(i,Ye),Wn.lengthSq()===0&&(Math.abs(i.z)===1?Ye.x+=1e-4:Ye.z+=1e-4,Ye.normalize(),Wn.crossVectors(i,Ye)),Wn.normalize(),Ys.crossVectors(Ye,Wn),s[0]=Wn.x,s[4]=Ys.x,s[8]=Ye.x,s[1]=Wn.y,s[5]=Ys.y,s[9]=Ye.y,s[2]=Wn.z,s[6]=Ys.z,s[10]=Ye.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,s=e.elements,r=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],h=i[1],f=i[5],u=i[9],d=i[13],g=i[2],x=i[6],p=i[10],m=i[14],w=i[3],y=i[7],_=i[11],L=i[15],R=s[0],A=s[4],D=s[8],V=s[12],v=s[1],S=s[5],F=s[9],z=s[13],H=s[2],J=s[6],G=s[10],Q=s[14],X=s[3],ut=s[7],pt=s[11],mt=s[15];return r[0]=o*R+a*v+c*H+l*X,r[4]=o*A+a*S+c*J+l*ut,r[8]=o*D+a*F+c*G+l*pt,r[12]=o*V+a*z+c*Q+l*mt,r[1]=h*R+f*v+u*H+d*X,r[5]=h*A+f*S+u*J+d*ut,r[9]=h*D+f*F+u*G+d*pt,r[13]=h*V+f*z+u*Q+d*mt,r[2]=g*R+x*v+p*H+m*X,r[6]=g*A+x*S+p*J+m*ut,r[10]=g*D+x*F+p*G+m*pt,r[14]=g*V+x*z+p*Q+m*mt,r[3]=w*R+y*v+_*H+L*X,r[7]=w*A+y*S+_*J+L*ut,r[11]=w*D+y*F+_*G+L*pt,r[15]=w*V+y*z+_*Q+L*mt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],f=t[6],u=t[10],d=t[14],g=t[3],x=t[7],p=t[11],m=t[15];return g*(+r*c*f-s*l*f-r*a*u+i*l*u+s*a*d-i*c*d)+x*(+e*c*d-e*l*u+r*o*u-s*o*d+s*l*h-r*c*h)+p*(+e*l*f-e*a*d-r*o*f+i*o*d+r*a*h-i*l*h)+m*(-s*a*h-e*c*f+e*a*u+s*o*f-i*o*u+i*c*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],f=t[9],u=t[10],d=t[11],g=t[12],x=t[13],p=t[14],m=t[15],w=f*p*l-x*u*l+x*c*d-a*p*d-f*c*m+a*u*m,y=g*u*l-h*p*l-g*c*d+o*p*d+h*c*m-o*u*m,_=h*x*l-g*f*l+g*a*d-o*x*d-h*a*m+o*f*m,L=g*f*c-h*x*c-g*a*u+o*x*u+h*a*p-o*f*p,R=e*w+i*y+s*_+r*L;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/R;return t[0]=w*A,t[1]=(x*u*r-f*p*r-x*s*d+i*p*d+f*s*m-i*u*m)*A,t[2]=(a*p*r-x*c*r+x*s*l-i*p*l-a*s*m+i*c*m)*A,t[3]=(f*c*r-a*u*r-f*s*l+i*u*l+a*s*d-i*c*d)*A,t[4]=y*A,t[5]=(h*p*r-g*u*r+g*s*d-e*p*d-h*s*m+e*u*m)*A,t[6]=(g*c*r-o*p*r-g*s*l+e*p*l+o*s*m-e*c*m)*A,t[7]=(o*u*r-h*c*r+h*s*l-e*u*l-o*s*d+e*c*d)*A,t[8]=_*A,t[9]=(g*f*r-h*x*r-g*i*d+e*x*d+h*i*m-e*f*m)*A,t[10]=(o*x*r-g*a*r+g*i*l-e*x*l-o*i*m+e*a*m)*A,t[11]=(h*a*r-o*f*r-h*i*l+e*f*l+o*i*d-e*a*d)*A,t[12]=L*A,t[13]=(h*x*s-g*f*s+g*i*u-e*x*u-h*i*p+e*f*p)*A,t[14]=(g*a*s-o*x*s-g*i*c+e*x*c+o*i*p-e*a*p)*A,t[15]=(o*f*s-h*a*s+h*i*c-e*f*c-o*i*u+e*a*u)*A,this}scale(t){const e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const i=Math.cos(e),s=Math.sin(e),r=1-i,o=t.x,a=t.y,c=t.z,l=r*o,h=r*a;return this.set(l*o+i,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+i,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,o){return this.set(1,i,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){const s=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,h=o+o,f=a+a,u=r*l,d=r*h,g=r*f,x=o*h,p=o*f,m=a*f,w=c*l,y=c*h,_=c*f,L=i.x,R=i.y,A=i.z;return s[0]=(1-(x+m))*L,s[1]=(d+_)*L,s[2]=(g-y)*L,s[3]=0,s[4]=(d-_)*R,s[5]=(1-(u+m))*R,s[6]=(p+w)*R,s[7]=0,s[8]=(g+y)*A,s[9]=(p-w)*A,s[10]=(1-(u+x))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){const s=this.elements;let r=Li.set(s[0],s[1],s[2]).length();const o=Li.set(s[4],s[5],s[6]).length(),a=Li.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],nn.copy(this);const l=1/r,h=1/o,f=1/a;return nn.elements[0]*=l,nn.elements[1]*=l,nn.elements[2]*=l,nn.elements[4]*=h,nn.elements[5]*=h,nn.elements[6]*=h,nn.elements[8]*=f,nn.elements[9]*=f,nn.elements[10]*=f,e.setFromRotationMatrix(nn),i.x=r,i.y=o,i.z=a,this}makePerspective(t,e,i,s,r,o,a=Un){const c=this.elements,l=2*r/(e-t),h=2*r/(i-s),f=(e+t)/(e-t),u=(i+s)/(i-s);let d,g;if(a===Un)d=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===Ir)d=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=h,c[9]=u,c[13]=0,c[2]=0,c[6]=0,c[10]=d,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,s,r,o,a=Un){const c=this.elements,l=1/(e-t),h=1/(i-s),f=1/(o-r),u=(e+t)*l,d=(i+s)*h;let g,x;if(a===Un)g=(o+r)*f,x=-2*f;else if(a===Ir)g=r*f,x=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-u,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-d,c[2]=0,c[6]=0,c[10]=x,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}}const Li=new P,nn=new fe,Xf=new P(0,0,0),Yf=new P(1,1,1),Wn=new P,Ys=new P,Ye=new P,Oc=new fe,Fc=new Us;class Mn{constructor(t=0,e=0,i=0,s=Mn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],f=s[2],u=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(be(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-be(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(be(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-be(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(be(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-be(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Oc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Oc,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Fc.setFromEuler(this),this.setFromQuaternion(Fc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Mn.DEFAULT_ORDER="XYZ";class Ah{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let qf=0;const zc=new P,Ii=new Us,An=new fe,qs=new P,fs=new P,Kf=new P,Jf=new Us,Bc=new P(1,0,0),kc=new P(0,1,0),Gc=new P(0,0,1),Hc={type:"added"},Zf={type:"removed"},Di={type:"childadded",child:null},uo={type:"childremoved",child:null};class Wt extends os{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=Ei(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Wt.DEFAULT_UP.clone();const t=new P,e=new Mn,i=new Us,s=new P(1,1,1);function r(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new fe},normalMatrix:{value:new Yt}}),this.matrix=new fe,this.matrixWorld=new fe,this.matrixAutoUpdate=Wt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ah,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ii.setFromAxisAngle(t,e),this.quaternion.multiply(Ii),this}rotateOnWorldAxis(t,e){return Ii.setFromAxisAngle(t,e),this.quaternion.premultiply(Ii),this}rotateX(t){return this.rotateOnAxis(Bc,t)}rotateY(t){return this.rotateOnAxis(kc,t)}rotateZ(t){return this.rotateOnAxis(Gc,t)}translateOnAxis(t,e){return zc.copy(t).applyQuaternion(this.quaternion),this.position.add(zc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Bc,t)}translateY(t){return this.translateOnAxis(kc,t)}translateZ(t){return this.translateOnAxis(Gc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(An.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?qs.copy(t):qs.set(t,e,i);const s=this.parent;this.updateWorldMatrix(!0,!1),fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?An.lookAt(fs,qs,this.up):An.lookAt(qs,fs,this.up),this.quaternion.setFromRotationMatrix(An),s&&(An.extractRotation(s.matrixWorld),Ii.setFromRotationMatrix(An),this.quaternion.premultiply(Ii.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Hc),Di.child=t,this.dispatchEvent(Di),Di.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Zf),uo.child=t,this.dispatchEvent(uo),uo.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),An.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),An.multiply(t.parent.matrixWorld)),t.applyMatrix4(An),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Hc),Di.child=t,this.dispatchEvent(Di),Di.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,t,Kf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,Jf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e){const i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const f=c[l];r(t.shapes,f)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];s.animations.push(r(t.animations,c))}}if(e){const a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),f=o(t.shapes),u=o(t.skeletons),d=o(t.animations),g=o(t.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),f.length>0&&(i.shapes=f),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){const s=t.children[i];this.add(s.clone())}return this}}Wt.DEFAULT_UP=new P(0,1,0);Wt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const sn=new P,Rn=new P,fo=new P,Cn=new P,Ui=new P,Ni=new P,Vc=new P,po=new P,mo=new P,go=new P,_o=new oe,vo=new oe,xo=new oe;class un{constructor(t=new P,e=new P,i=new P){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),sn.subVectors(t,e),s.cross(sn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,i,s,r){sn.subVectors(s,e),Rn.subVectors(i,e),fo.subVectors(t,e);const o=sn.dot(sn),a=sn.dot(Rn),c=sn.dot(fo),l=Rn.dot(Rn),h=Rn.dot(fo),f=o*l-a*a;if(f===0)return r.set(0,0,0),null;const u=1/f,d=(l*c-a*h)*u,g=(o*h-a*c)*u;return r.set(1-d-g,g,d)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(t,e,i,s,r,o,a,c){return this.getBarycoord(t,e,i,s,Cn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Cn.x),c.addScaledVector(o,Cn.y),c.addScaledVector(a,Cn.z),c)}static getInterpolatedAttribute(t,e,i,s,r,o){return _o.setScalar(0),vo.setScalar(0),xo.setScalar(0),_o.fromBufferAttribute(t,e),vo.fromBufferAttribute(t,i),xo.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(_o,r.x),o.addScaledVector(vo,r.y),o.addScaledVector(xo,r.z),o}static isFrontFacing(t,e,i,s){return sn.subVectors(i,e),Rn.subVectors(t,e),sn.cross(Rn).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return sn.subVectors(this.c,this.b),Rn.subVectors(this.a,this.b),sn.cross(Rn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return un.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return un.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return un.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return un.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return un.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const i=this.a,s=this.b,r=this.c;let o,a;Ui.subVectors(s,i),Ni.subVectors(r,i),po.subVectors(t,i);const c=Ui.dot(po),l=Ni.dot(po);if(c<=0&&l<=0)return e.copy(i);mo.subVectors(t,s);const h=Ui.dot(mo),f=Ni.dot(mo);if(h>=0&&f<=h)return e.copy(s);const u=c*f-h*l;if(u<=0&&c>=0&&h<=0)return o=c/(c-h),e.copy(i).addScaledVector(Ui,o);go.subVectors(t,r);const d=Ui.dot(go),g=Ni.dot(go);if(g>=0&&d<=g)return e.copy(r);const x=d*l-c*g;if(x<=0&&l>=0&&g<=0)return a=l/(l-g),e.copy(i).addScaledVector(Ni,a);const p=h*g-d*f;if(p<=0&&f-h>=0&&d-g>=0)return Vc.subVectors(r,s),a=(f-h)/(f-h+(d-g)),e.copy(s).addScaledVector(Vc,a);const m=1/(p+x+u);return o=x*m,a=u*m,e.copy(i).addScaledVector(Ui,o).addScaledVector(Ni,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Rh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xn={h:0,s:0,l:0},Ks={h:0,s:0,l:0};function Mo(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}class Nt{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=dn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,se.toWorkingColorSpace(this,e),this}setRGB(t,e,i,s=se.workingColorSpace){return this.r=t,this.g=e,this.b=i,se.toWorkingColorSpace(this,s),this}setHSL(t,e,i,s=se.workingColorSpace){if(t=Za(t,1),e=be(e,0,1),i=be(i,0,1),e===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+e):i+e-i*e,o=2*i-r;this.r=Mo(o,r,t+1/3),this.g=Mo(o,r,t),this.b=Mo(o,r,t-1/3)}return se.toWorkingColorSpace(this,s),this}setStyle(t,e=dn){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=dn){const i=Rh[t.toLowerCase()];return i!==void 0?this.setHex(i,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ki(t.r),this.g=Ki(t.g),this.b=Ki(t.b),this}copyLinearToSRGB(t){return this.r=io(t.r),this.g=io(t.g),this.b=io(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=dn){return se.fromWorkingColorSpace(Ue.copy(this),t),Math.round(be(Ue.r*255,0,255))*65536+Math.round(be(Ue.g*255,0,255))*256+Math.round(be(Ue.b*255,0,255))}getHexString(t=dn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=se.workingColorSpace){se.fromWorkingColorSpace(Ue.copy(this),e);const i=Ue.r,s=Ue.g,r=Ue.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const f=o-a;switch(l=h<=.5?f/(o+a):f/(2-o-a),o){case i:c=(s-r)/f+(s<r?6:0);break;case s:c=(r-i)/f+2;break;case r:c=(i-s)/f+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=se.workingColorSpace){return se.fromWorkingColorSpace(Ue.copy(this),e),t.r=Ue.r,t.g=Ue.g,t.b=Ue.b,t}getStyle(t=dn){se.fromWorkingColorSpace(Ue.copy(this),t);const e=Ue.r,i=Ue.g,s=Ue.b;return t!==dn?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(Xn),this.setHSL(Xn.h+t,Xn.s+e,Xn.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Xn),t.getHSL(Ks);const i=Es(Xn.h,Ks.h,e),s=Es(Xn.s,Ks.s,e),r=Es(Xn.l,Ks.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ue=new Nt;Nt.NAMES=Rh;let $f=0;class as extends os{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:$f++}),this.uuid=Ei(),this.name="",this.type="Material",this.blending=Yi,this.side=ei,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ko,this.blendDst=Go,this.blendEquation=gi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Nt(0,0,0),this.blendAlpha=0,this.depthFunc=$i,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Rc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ti,this.stencilZFail=Ti,this.stencilZPass=Ti,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const i=t[e];if(i===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Yi&&(i.blending=this.blending),this.side!==ei&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ko&&(i.blendSrc=this.blendSrc),this.blendDst!==Go&&(i.blendDst=this.blendDst),this.blendEquation!==gi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==$i&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Rc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ti&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ti&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ti&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let i=null;if(e!==null){const s=e.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class cn extends as{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=ch,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Ee=new P,Js=new rt;class Le{constructor(t,e,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Cc,this.updateRanges=[],this.gpuType=Dn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Js.fromBufferAttribute(this,e),Js.applyMatrix3(t),this.setXY(e,Js.x,Js.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Ee.fromBufferAttribute(this,e),Ee.applyMatrix3(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Ee.fromBufferAttribute(this,e),Ee.applyMatrix4(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ee.fromBufferAttribute(this,e),Ee.applyNormalMatrix(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ee.fromBufferAttribute(this,e),Ee.transformDirection(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Gi(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Ne(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Gi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ne(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Gi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ne(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Gi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ne(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Gi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ne(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Ne(e,this.array),i=Ne(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=Ne(e,this.array),i=Ne(i,this.array),s=Ne(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t*=this.itemSize,this.normalized&&(e=Ne(e,this.array),i=Ne(i,this.array),s=Ne(s,this.array),r=Ne(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Cc&&(t.usage=this.usage),t}}class Ch extends Le{constructor(t,e,i){super(new Uint16Array(t),e,i)}}class Ph extends Le{constructor(t,e,i){super(new Uint32Array(t),e,i)}}class de extends Le{constructor(t,e,i){super(new Float32Array(t),e,i)}}let jf=0;const Ze=new fe,So=new Wt,Oi=new P,qe=new wi,ds=new wi,Re=new P;class Ie extends os{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:jf++}),this.uuid=Ei(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Eh(t)?Ph:Ch)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Yt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Ze.makeRotationFromQuaternion(t),this.applyMatrix4(Ze),this}rotateX(t){return Ze.makeRotationX(t),this.applyMatrix4(Ze),this}rotateY(t){return Ze.makeRotationY(t),this.applyMatrix4(Ze),this}rotateZ(t){return Ze.makeRotationZ(t),this.applyMatrix4(Ze),this}translate(t,e,i){return Ze.makeTranslation(t,e,i),this.applyMatrix4(Ze),this}scale(t,e,i){return Ze.makeScale(t,e,i),this.applyMatrix4(Ze),this}lookAt(t){return So.lookAt(t),So.updateMatrix(),this.applyMatrix4(So.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Oi).negate(),this.translate(Oi.x,Oi.y,Oi.z),this}setFromPoints(t){const e=[];for(let i=0,s=t.length;i<s;i++){const r=t[i];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new de(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new wi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){const r=e[i];qe.setFromBufferAttribute(r),this.morphTargetsRelative?(Re.addVectors(this.boundingBox.min,qe.min),this.boundingBox.expandByPoint(Re),Re.addVectors(this.boundingBox.max,qe.max),this.boundingBox.expandByPoint(Re)):(this.boundingBox.expandByPoint(qe.min),this.boundingBox.expandByPoint(qe.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vr);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(t){const i=this.boundingSphere.center;if(qe.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];ds.setFromBufferAttribute(a),this.morphTargetsRelative?(Re.addVectors(qe.min,ds.min),qe.expandByPoint(Re),Re.addVectors(qe.max,ds.max),qe.expandByPoint(Re)):(qe.expandByPoint(ds.min),qe.expandByPoint(ds.max))}qe.getCenter(i);let s=0;for(let r=0,o=t.count;r<o;r++)Re.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(Re));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Re.fromBufferAttribute(a,l),c&&(Oi.fromBufferAttribute(t,l),Re.add(Oi)),s=Math.max(s,i.distanceToSquared(Re))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Le(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let D=0;D<i.count;D++)a[D]=new P,c[D]=new P;const l=new P,h=new P,f=new P,u=new rt,d=new rt,g=new rt,x=new P,p=new P;function m(D,V,v){l.fromBufferAttribute(i,D),h.fromBufferAttribute(i,V),f.fromBufferAttribute(i,v),u.fromBufferAttribute(r,D),d.fromBufferAttribute(r,V),g.fromBufferAttribute(r,v),h.sub(l),f.sub(l),d.sub(u),g.sub(u);const S=1/(d.x*g.y-g.x*d.y);isFinite(S)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(f,-d.y).multiplyScalar(S),p.copy(f).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(S),a[D].add(x),a[V].add(x),a[v].add(x),c[D].add(p),c[V].add(p),c[v].add(p))}let w=this.groups;w.length===0&&(w=[{start:0,count:t.count}]);for(let D=0,V=w.length;D<V;++D){const v=w[D],S=v.start,F=v.count;for(let z=S,H=S+F;z<H;z+=3)m(t.getX(z+0),t.getX(z+1),t.getX(z+2))}const y=new P,_=new P,L=new P,R=new P;function A(D){L.fromBufferAttribute(s,D),R.copy(L);const V=a[D];y.copy(V),y.sub(L.multiplyScalar(L.dot(V))).normalize(),_.crossVectors(R,V);const S=_.dot(c[D])<0?-1:1;o.setXYZW(D,y.x,y.y,y.z,S)}for(let D=0,V=w.length;D<V;++D){const v=w[D],S=v.start,F=v.count;for(let z=S,H=S+F;z<H;z+=3)A(t.getX(z+0)),A(t.getX(z+1)),A(t.getX(z+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Le(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);const s=new P,r=new P,o=new P,a=new P,c=new P,l=new P,h=new P,f=new P;if(t)for(let u=0,d=t.count;u<d;u+=3){const g=t.getX(u+0),x=t.getX(u+1),p=t.getX(u+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,x),o.fromBufferAttribute(e,p),h.subVectors(o,r),f.subVectors(s,r),h.cross(f),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,x),l.fromBufferAttribute(i,p),a.add(h),c.add(h),l.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(x,c.x,c.y,c.z),i.setXYZ(p,l.x,l.y,l.z)}else for(let u=0,d=e.count;u<d;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),f.subVectors(s,r),h.cross(f),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Re.fromBufferAttribute(t,e),Re.normalize(),t.setXYZ(e,Re.x,Re.y,Re.z)}toNonIndexed(){function t(a,c){const l=a.array,h=a.itemSize,f=a.normalized,u=new l.constructor(c.length*h);let d=0,g=0;for(let x=0,p=c.length;x<p;x++){a.isInterleavedBufferAttribute?d=c[x]*a.data.stride+a.offset:d=c[x]*h;for(let m=0;m<h;m++)u[g++]=l[d++]}return new Le(u,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Ie,i=this.index.array,s=this.attributes;for(const a in s){const c=s[a],l=t(c,i);e.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let h=0,f=l.length;h<f;h++){const u=l[h],d=t(u,i);c.push(d)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const i=this.attributes;for(const c in i){const l=i[c];t.data.attributes[c]=l.toJSON(t.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let f=0,u=l.length;f<u;f++){const d=l[f];h.push(d.toJSON(t.data))}h.length>0&&(s[c]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone(e));const s=t.attributes;for(const l in s){const h=s[l];this.setAttribute(l,h.clone(e))}const r=t.morphAttributes;for(const l in r){const h=[],f=r[l];for(let u=0,d=f.length;u<d;u++)h.push(f[u].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let l=0,h=o.length;l<h;l++){const f=o[l];this.addGroup(f.start,f.count,f.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Wc=new fe,ci=new Th,Zs=new Vr,Xc=new P,$s=new P,js=new P,Qs=new P,yo=new P,tr=new P,Yc=new P,er=new P;class ce extends Wt{constructor(t=new Ie,e=new cn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){tr.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=a[c],f=r[c];h!==0&&(yo.fromBufferAttribute(f,t),o?tr.addScaledVector(yo,h):tr.addScaledVector(yo.sub(e),h))}e.add(tr)}return e}raycast(t,e){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Zs.copy(i.boundingSphere),Zs.applyMatrix4(r),ci.copy(t.ray).recast(t.near),!(Zs.containsPoint(ci.origin)===!1&&(ci.intersectSphere(Zs,Xc)===null||ci.origin.distanceToSquared(Xc)>(t.far-t.near)**2))&&(Wc.copy(r).invert(),ci.copy(t.ray).applyMatrix4(Wc),!(i.boundingBox!==null&&ci.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,ci)))}_computeIntersections(t,e,i){let s;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,u=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=u.length;g<x;g++){const p=u[g],m=o[p.materialIndex],w=Math.max(p.start,d.start),y=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let _=w,L=y;_<L;_+=3){const R=a.getX(_),A=a.getX(_+1),D=a.getX(_+2);s=nr(this,m,t,i,l,h,f,R,A,D),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{const g=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){const w=a.getX(p),y=a.getX(p+1),_=a.getX(p+2);s=nr(this,o,t,i,l,h,f,w,y,_),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,x=u.length;g<x;g++){const p=u[g],m=o[p.materialIndex],w=Math.max(p.start,d.start),y=Math.min(c.count,Math.min(p.start+p.count,d.start+d.count));for(let _=w,L=y;_<L;_+=3){const R=_,A=_+1,D=_+2;s=nr(this,m,t,i,l,h,f,R,A,D),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{const g=Math.max(0,d.start),x=Math.min(c.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){const w=p,y=p+1,_=p+2;s=nr(this,o,t,i,l,h,f,w,y,_),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}}function Qf(n,t,e,i,s,r,o,a){let c;if(t.side===Ge?c=i.intersectTriangle(o,r,s,!0,a):c=i.intersectTriangle(s,r,o,t.side===ei,a),c===null)return null;er.copy(a),er.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(er);return l<e.near||l>e.far?null:{distance:l,point:er.clone(),object:n}}function nr(n,t,e,i,s,r,o,a,c,l){n.getVertexPosition(a,$s),n.getVertexPosition(c,js),n.getVertexPosition(l,Qs);const h=Qf(n,t,e,i,$s,js,Qs,Yc);if(h){const f=new P;un.getBarycoord(Yc,$s,js,Qs,f),s&&(h.uv=un.getInterpolatedAttribute(s,a,c,l,f,new rt)),r&&(h.uv1=un.getInterpolatedAttribute(r,a,c,l,f,new rt)),o&&(h.normal=un.getInterpolatedAttribute(o,a,c,l,f,new P),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:c,c:l,normal:new P,materialIndex:0};un.getNormal($s,js,Qs,u.normal),h.face=u,h.barycoord=f}return h}class Qt extends Ie{constructor(t=1,e=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],h=[],f=[];let u=0,d=0;g("z","y","x",-1,-1,i,e,t,o,r,0),g("z","y","x",1,-1,i,e,-t,o,r,1),g("x","z","y",1,1,t,i,e,s,o,2),g("x","z","y",1,-1,t,i,-e,s,o,3),g("x","y","z",1,-1,t,e,i,s,r,4),g("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new de(l,3)),this.setAttribute("normal",new de(h,3)),this.setAttribute("uv",new de(f,2));function g(x,p,m,w,y,_,L,R,A,D,V){const v=_/A,S=L/D,F=_/2,z=L/2,H=R/2,J=A+1,G=D+1;let Q=0,X=0;const ut=new P;for(let pt=0;pt<G;pt++){const mt=pt*S-z;for(let Kt=0;Kt<J;Kt++){const jt=Kt*v-F;ut[x]=jt*w,ut[p]=mt*y,ut[m]=H,l.push(ut.x,ut.y,ut.z),ut[x]=0,ut[p]=0,ut[m]=R>0?1:-1,h.push(ut.x,ut.y,ut.z),f.push(Kt/A),f.push(1-pt/D),Q+=1}}for(let pt=0;pt<D;pt++)for(let mt=0;mt<A;mt++){const Kt=u+mt+J*pt,jt=u+mt+J*(pt+1),Y=u+(mt+1)+J*(pt+1),et=u+(mt+1)+J*pt;c.push(Kt,jt,et),c.push(jt,Y,et),X+=6}a.addGroup(d,X,V),d+=X,u+=Q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Qt(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function ns(n){const t={};for(const e in n){t[e]={};for(const i in n[e]){const s=n[e][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone():Array.isArray(s)?t[e][i]=s.slice():t[e][i]=s}}return t}function Oe(n){const t={};for(let e=0;e<n.length;e++){const i=ns(n[e]);for(const s in i)t[s]=i[s]}return t}function td(n){const t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function Lh(n){const t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:se.workingColorSpace}const ed={clone:ns,merge:Oe};var nd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,id=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Fn extends as{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=nd,this.fragmentShader=id,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ns(t.uniforms),this.uniformsGroups=td(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}}class Ih extends Wt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new fe,this.projectionMatrix=new fe,this.projectionMatrixInverse=new fe,this.coordinateSystem=Un}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Yn=new P,qc=new rt,Kc=new rt;class ke extends Ih{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Cs*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(ys*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Cs*2*Math.atan(Math.tan(ys*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Yn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Yn.x,Yn.y).multiplyScalar(-t/Yn.z),Yn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Yn.x,Yn.y).multiplyScalar(-t/Yn.z)}getViewSize(t,e){return this.getViewBounds(t,qc,Kc),e.subVectors(Kc,qc)}setViewOffset(t,e,i,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(ys*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,e-=o.offsetY*i/l,s*=o.width/c,i*=o.height/l}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Fi=-90,zi=1;class sd extends Wt{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new ke(Fi,zi,t,e);s.layers=this.layers,this.add(s);const r=new ke(Fi,zi,t,e);r.layers=this.layers,this.add(r);const o=new ke(Fi,zi,t,e);o.layers=this.layers,this.add(o);const a=new ke(Fi,zi,t,e);a.layers=this.layers,this.add(a);const c=new ke(Fi,zi,t,e);c.layers=this.layers,this.add(c);const l=new ke(Fi,zi,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[i,s,r,o,a,c]=e;for(const l of e)this.remove(l);if(t===Un)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Ir)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,h]=this.children,f=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,s),t.render(e,r),t.setRenderTarget(i,1,s),t.render(e,o),t.setRenderTarget(i,2,s),t.render(e,a),t.setRenderTarget(i,3,s),t.render(e,c),t.setRenderTarget(i,4,s),t.render(e,l),i.texture.generateMipmaps=x,t.setRenderTarget(i,5,s),t.render(e,h),t.setRenderTarget(f,u,d),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Dh extends Fe{constructor(t,e,i,s,r,o,a,c,l,h){t=t!==void 0?t:[],e=e!==void 0?e:ji,super(t,e,i,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class rd extends ni{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Dh(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:hn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Qt(5,5,5),r=new Fn({name:"CubemapFromEquirect",uniforms:ns(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ge,blending:jn});r.uniforms.tEquirect.value=e;const o=new ce(s,r),a=e.minFilter;return e.minFilter===xi&&(e.minFilter=hn),new sd(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,i,s){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,s);t.setRenderTarget(r)}}const Eo=new P,od=new P,ad=new Yt;class di{constructor(t=new P(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){const s=Eo.subVectors(i,e).cross(od.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const i=t.delta(Eo),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(i,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const i=e||ad.getNormalMatrix(t),s=this.coplanarPoint(Eo).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const li=new Vr,ir=new P;class $a{constructor(t=new di,e=new di,i=new di,s=new di,r=new di,o=new di){this.planes=[t,e,i,s,r,o]}set(t,e,i,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Un){const i=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],c=s[3],l=s[4],h=s[5],f=s[6],u=s[7],d=s[8],g=s[9],x=s[10],p=s[11],m=s[12],w=s[13],y=s[14],_=s[15];if(i[0].setComponents(c-r,u-l,p-d,_-m).normalize(),i[1].setComponents(c+r,u+l,p+d,_+m).normalize(),i[2].setComponents(c+o,u+h,p+g,_+w).normalize(),i[3].setComponents(c-o,u-h,p-g,_-w).normalize(),i[4].setComponents(c-a,u-f,p-x,_-y).normalize(),e===Un)i[5].setComponents(c+a,u+f,p+x,_+y).normalize();else if(e===Ir)i[5].setComponents(a,f,x,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),li.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),li.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(li)}intersectsSprite(t){return li.center.set(0,0,0),li.radius=.7071067811865476,li.applyMatrix4(t.matrixWorld),this.intersectsSphere(li)}intersectsSphere(t){const e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let i=0;i<6;i++){const s=e[i];if(ir.x=s.normal.x>0?t.max.x:t.min.x,ir.y=s.normal.y>0?t.max.y:t.min.y,ir.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ir)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Uh(){let n=null,t=!1,e=null,i=null;function s(r,o){e(r,o),i=n.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){n=r}}}function cd(n){const t=new WeakMap;function e(a,c){const l=a.array,h=a.usage,f=l.byteLength,u=n.createBuffer();n.bindBuffer(c,u),n.bufferData(c,l,h),a.onUploadCallback();let d;if(l instanceof Float32Array)d=n.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=n.SHORT;else if(l instanceof Uint32Array)d=n.UNSIGNED_INT;else if(l instanceof Int32Array)d=n.INT;else if(l instanceof Int8Array)d=n.BYTE;else if(l instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:f}}function i(a,c,l){const h=c.array,f=c.updateRanges;if(n.bindBuffer(l,a),f.length===0)n.bufferSubData(l,0,h);else{f.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<f.length;d++){const g=f[u],x=f[d];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++u,f[u]=x)}f.length=u+1;for(let d=0,g=f.length;d<g;d++){const x=f[d];n.bufferSubData(l,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=t.get(a);c&&(n.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}class je extends Ie{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(i),c=Math.floor(s),l=a+1,h=c+1,f=t/a,u=e/c,d=[],g=[],x=[],p=[];for(let m=0;m<h;m++){const w=m*u-o;for(let y=0;y<l;y++){const _=y*f-r;g.push(_,-w,0),x.push(0,0,1),p.push(y/a),p.push(1-m/c)}}for(let m=0;m<c;m++)for(let w=0;w<a;w++){const y=w+l*m,_=w+l*(m+1),L=w+1+l*(m+1),R=w+1+l*m;d.push(y,_,R),d.push(_,L,R)}this.setIndex(d),this.setAttribute("position",new de(g,3)),this.setAttribute("normal",new de(x,3)),this.setAttribute("uv",new de(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new je(t.width,t.height,t.widthSegments,t.heightSegments)}}var ld=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,hd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ud=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,fd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,dd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,pd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,md=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,gd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,_d=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,vd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,xd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Md=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Sd=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,yd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ed=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,wd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,bd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Td=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ad=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Rd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Cd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Pd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ld=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Id=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Dd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ud=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Nd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Od=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Fd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,zd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Bd="gl_FragColor = linearToOutputTexel( gl_FragColor );",kd=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Gd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Hd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Vd=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Wd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Xd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Yd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,qd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Kd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Jd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Zd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,$d=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,jd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Qd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,tp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ep=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,np=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ip=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,sp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,rp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,op=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,ap=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,cp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,hp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,up=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,fp=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dp=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,pp=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,mp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,gp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,_p=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,vp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,xp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Mp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Sp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,yp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ep=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,bp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Tp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ap=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Rp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Cp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Pp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Lp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ip=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Dp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Up=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Np=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Op=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Fp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,zp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Bp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,kp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Gp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Hp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Vp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Wp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Xp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Yp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,qp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Kp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Jp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Zp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,$p=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,jp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Qp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,t0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,e0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,n0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,i0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,s0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,r0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,o0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,a0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const c0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,l0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,h0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,u0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,f0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,d0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,p0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,m0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,g0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,_0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,v0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,x0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,M0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,S0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,y0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,E0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,w0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,b0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,T0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,A0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,R0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,C0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,P0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,L0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,I0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,D0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,U0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,N0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,O0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,F0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,z0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,B0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,k0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,G0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xt={alphahash_fragment:ld,alphahash_pars_fragment:hd,alphamap_fragment:ud,alphamap_pars_fragment:fd,alphatest_fragment:dd,alphatest_pars_fragment:pd,aomap_fragment:md,aomap_pars_fragment:gd,batching_pars_vertex:_d,batching_vertex:vd,begin_vertex:xd,beginnormal_vertex:Md,bsdfs:Sd,iridescence_fragment:yd,bumpmap_pars_fragment:Ed,clipping_planes_fragment:wd,clipping_planes_pars_fragment:bd,clipping_planes_pars_vertex:Td,clipping_planes_vertex:Ad,color_fragment:Rd,color_pars_fragment:Cd,color_pars_vertex:Pd,color_vertex:Ld,common:Id,cube_uv_reflection_fragment:Dd,defaultnormal_vertex:Ud,displacementmap_pars_vertex:Nd,displacementmap_vertex:Od,emissivemap_fragment:Fd,emissivemap_pars_fragment:zd,colorspace_fragment:Bd,colorspace_pars_fragment:kd,envmap_fragment:Gd,envmap_common_pars_fragment:Hd,envmap_pars_fragment:Vd,envmap_pars_vertex:Wd,envmap_physical_pars_fragment:ep,envmap_vertex:Xd,fog_vertex:Yd,fog_pars_vertex:qd,fog_fragment:Kd,fog_pars_fragment:Jd,gradientmap_pars_fragment:Zd,lightmap_pars_fragment:$d,lights_lambert_fragment:jd,lights_lambert_pars_fragment:Qd,lights_pars_begin:tp,lights_toon_fragment:np,lights_toon_pars_fragment:ip,lights_phong_fragment:sp,lights_phong_pars_fragment:rp,lights_physical_fragment:op,lights_physical_pars_fragment:ap,lights_fragment_begin:cp,lights_fragment_maps:lp,lights_fragment_end:hp,logdepthbuf_fragment:up,logdepthbuf_pars_fragment:fp,logdepthbuf_pars_vertex:dp,logdepthbuf_vertex:pp,map_fragment:mp,map_pars_fragment:gp,map_particle_fragment:_p,map_particle_pars_fragment:vp,metalnessmap_fragment:xp,metalnessmap_pars_fragment:Mp,morphinstance_vertex:Sp,morphcolor_vertex:yp,morphnormal_vertex:Ep,morphtarget_pars_vertex:wp,morphtarget_vertex:bp,normal_fragment_begin:Tp,normal_fragment_maps:Ap,normal_pars_fragment:Rp,normal_pars_vertex:Cp,normal_vertex:Pp,normalmap_pars_fragment:Lp,clearcoat_normal_fragment_begin:Ip,clearcoat_normal_fragment_maps:Dp,clearcoat_pars_fragment:Up,iridescence_pars_fragment:Np,opaque_fragment:Op,packing:Fp,premultiplied_alpha_fragment:zp,project_vertex:Bp,dithering_fragment:kp,dithering_pars_fragment:Gp,roughnessmap_fragment:Hp,roughnessmap_pars_fragment:Vp,shadowmap_pars_fragment:Wp,shadowmap_pars_vertex:Xp,shadowmap_vertex:Yp,shadowmask_pars_fragment:qp,skinbase_vertex:Kp,skinning_pars_vertex:Jp,skinning_vertex:Zp,skinnormal_vertex:$p,specularmap_fragment:jp,specularmap_pars_fragment:Qp,tonemapping_fragment:t0,tonemapping_pars_fragment:e0,transmission_fragment:n0,transmission_pars_fragment:i0,uv_pars_fragment:s0,uv_pars_vertex:r0,uv_vertex:o0,worldpos_vertex:a0,background_vert:c0,background_frag:l0,backgroundCube_vert:h0,backgroundCube_frag:u0,cube_vert:f0,cube_frag:d0,depth_vert:p0,depth_frag:m0,distanceRGBA_vert:g0,distanceRGBA_frag:_0,equirect_vert:v0,equirect_frag:x0,linedashed_vert:M0,linedashed_frag:S0,meshbasic_vert:y0,meshbasic_frag:E0,meshlambert_vert:w0,meshlambert_frag:b0,meshmatcap_vert:T0,meshmatcap_frag:A0,meshnormal_vert:R0,meshnormal_frag:C0,meshphong_vert:P0,meshphong_frag:L0,meshphysical_vert:I0,meshphysical_frag:D0,meshtoon_vert:U0,meshtoon_frag:N0,points_vert:O0,points_frag:F0,shadow_vert:z0,shadow_frag:B0,sprite_vert:k0,sprite_frag:G0},lt={common:{diffuse:{value:new Nt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Yt},alphaMap:{value:null},alphaMapTransform:{value:new Yt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Yt}},envmap:{envMap:{value:null},envMapRotation:{value:new Yt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Yt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Yt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Yt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Yt},normalScale:{value:new rt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Yt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Yt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Yt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Yt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Nt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Nt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Yt},alphaTest:{value:0},uvTransform:{value:new Yt}},sprite:{diffuse:{value:new Nt(16777215)},opacity:{value:1},center:{value:new rt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Yt},alphaMap:{value:null},alphaMapTransform:{value:new Yt},alphaTest:{value:0}}},pn={basic:{uniforms:Oe([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.fog]),vertexShader:Xt.meshbasic_vert,fragmentShader:Xt.meshbasic_frag},lambert:{uniforms:Oe([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new Nt(0)}}]),vertexShader:Xt.meshlambert_vert,fragmentShader:Xt.meshlambert_frag},phong:{uniforms:Oe([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new Nt(0)},specular:{value:new Nt(1118481)},shininess:{value:30}}]),vertexShader:Xt.meshphong_vert,fragmentShader:Xt.meshphong_frag},standard:{uniforms:Oe([lt.common,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.roughnessmap,lt.metalnessmap,lt.fog,lt.lights,{emissive:{value:new Nt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xt.meshphysical_vert,fragmentShader:Xt.meshphysical_frag},toon:{uniforms:Oe([lt.common,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.gradientmap,lt.fog,lt.lights,{emissive:{value:new Nt(0)}}]),vertexShader:Xt.meshtoon_vert,fragmentShader:Xt.meshtoon_frag},matcap:{uniforms:Oe([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,{matcap:{value:null}}]),vertexShader:Xt.meshmatcap_vert,fragmentShader:Xt.meshmatcap_frag},points:{uniforms:Oe([lt.points,lt.fog]),vertexShader:Xt.points_vert,fragmentShader:Xt.points_frag},dashed:{uniforms:Oe([lt.common,lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xt.linedashed_vert,fragmentShader:Xt.linedashed_frag},depth:{uniforms:Oe([lt.common,lt.displacementmap]),vertexShader:Xt.depth_vert,fragmentShader:Xt.depth_frag},normal:{uniforms:Oe([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,{opacity:{value:1}}]),vertexShader:Xt.meshnormal_vert,fragmentShader:Xt.meshnormal_frag},sprite:{uniforms:Oe([lt.sprite,lt.fog]),vertexShader:Xt.sprite_vert,fragmentShader:Xt.sprite_frag},background:{uniforms:{uvTransform:{value:new Yt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xt.background_vert,fragmentShader:Xt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Yt}},vertexShader:Xt.backgroundCube_vert,fragmentShader:Xt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xt.cube_vert,fragmentShader:Xt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xt.equirect_vert,fragmentShader:Xt.equirect_frag},distanceRGBA:{uniforms:Oe([lt.common,lt.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xt.distanceRGBA_vert,fragmentShader:Xt.distanceRGBA_frag},shadow:{uniforms:Oe([lt.lights,lt.fog,{color:{value:new Nt(0)},opacity:{value:1}}]),vertexShader:Xt.shadow_vert,fragmentShader:Xt.shadow_frag}};pn.physical={uniforms:Oe([pn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Yt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Yt},clearcoatNormalScale:{value:new rt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Yt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Yt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Yt},sheen:{value:0},sheenColor:{value:new Nt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Yt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Yt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Yt},transmissionSamplerSize:{value:new rt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Yt},attenuationDistance:{value:0},attenuationColor:{value:new Nt(0)},specularColor:{value:new Nt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Yt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Yt},anisotropyVector:{value:new rt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Yt}}]),vertexShader:Xt.meshphysical_vert,fragmentShader:Xt.meshphysical_frag};const sr={r:0,b:0,g:0},hi=new Mn,H0=new fe;function V0(n,t,e,i,s,r,o){const a=new Nt(0);let c=r===!0?0:1,l,h,f=null,u=0,d=null;function g(w){let y=w.isScene===!0?w.background:null;return y&&y.isTexture&&(y=(w.backgroundBlurriness>0?e:t).get(y)),y}function x(w){let y=!1;const _=g(w);_===null?m(a,c):_&&_.isColor&&(m(_,1),y=!0);const L=n.xr.getEnvironmentBlendMode();L==="additive"?i.buffers.color.setClear(0,0,0,1,o):L==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||y)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function p(w,y){const _=g(y);_&&(_.isCubeTexture||_.mapping===Gr)?(h===void 0&&(h=new ce(new Qt(1,1,1),new Fn({name:"BackgroundCubeMaterial",uniforms:ns(pn.backgroundCube.uniforms),vertexShader:pn.backgroundCube.vertexShader,fragmentShader:pn.backgroundCube.fragmentShader,side:Ge,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(L,R,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),hi.copy(y.backgroundRotation),hi.x*=-1,hi.y*=-1,hi.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(hi.y*=-1,hi.z*=-1),h.material.uniforms.envMap.value=_,h.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(H0.makeRotationFromEuler(hi)),h.material.toneMapped=se.getTransfer(_.colorSpace)!==ue,(f!==_||u!==_.version||d!==n.toneMapping)&&(h.material.needsUpdate=!0,f=_,u=_.version,d=n.toneMapping),h.layers.enableAll(),w.unshift(h,h.geometry,h.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new ce(new je(2,2),new Fn({name:"BackgroundMaterial",uniforms:ns(pn.background.uniforms),vertexShader:pn.background.vertexShader,fragmentShader:pn.background.fragmentShader,side:ei,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.toneMapped=se.getTransfer(_.colorSpace)!==ue,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),(f!==_||u!==_.version||d!==n.toneMapping)&&(l.material.needsUpdate=!0,f=_,u=_.version,d=n.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null))}function m(w,y){w.getRGB(sr,Lh(n)),i.buffers.color.setClear(sr.r,sr.g,sr.b,y,o)}return{getClearColor:function(){return a},setClearColor:function(w,y=1){a.set(w),c=y,m(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(w){c=w,m(a,c)},render:x,addToRenderList:p}}function W0(n,t){const e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=u(null);let r=s,o=!1;function a(v,S,F,z,H){let J=!1;const G=f(z,F,S);r!==G&&(r=G,l(r.object)),J=d(v,z,F,H),J&&g(v,z,F,H),H!==null&&t.update(H,n.ELEMENT_ARRAY_BUFFER),(J||o)&&(o=!1,_(v,S,F,z),H!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}function c(){return n.createVertexArray()}function l(v){return n.bindVertexArray(v)}function h(v){return n.deleteVertexArray(v)}function f(v,S,F){const z=F.wireframe===!0;let H=i[v.id];H===void 0&&(H={},i[v.id]=H);let J=H[S.id];J===void 0&&(J={},H[S.id]=J);let G=J[z];return G===void 0&&(G=u(c()),J[z]=G),G}function u(v){const S=[],F=[],z=[];for(let H=0;H<e;H++)S[H]=0,F[H]=0,z[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:S,enabledAttributes:F,attributeDivisors:z,object:v,attributes:{},index:null}}function d(v,S,F,z){const H=r.attributes,J=S.attributes;let G=0;const Q=F.getAttributes();for(const X in Q)if(Q[X].location>=0){const pt=H[X];let mt=J[X];if(mt===void 0&&(X==="instanceMatrix"&&v.instanceMatrix&&(mt=v.instanceMatrix),X==="instanceColor"&&v.instanceColor&&(mt=v.instanceColor)),pt===void 0||pt.attribute!==mt||mt&&pt.data!==mt.data)return!0;G++}return r.attributesNum!==G||r.index!==z}function g(v,S,F,z){const H={},J=S.attributes;let G=0;const Q=F.getAttributes();for(const X in Q)if(Q[X].location>=0){let pt=J[X];pt===void 0&&(X==="instanceMatrix"&&v.instanceMatrix&&(pt=v.instanceMatrix),X==="instanceColor"&&v.instanceColor&&(pt=v.instanceColor));const mt={};mt.attribute=pt,pt&&pt.data&&(mt.data=pt.data),H[X]=mt,G++}r.attributes=H,r.attributesNum=G,r.index=z}function x(){const v=r.newAttributes;for(let S=0,F=v.length;S<F;S++)v[S]=0}function p(v){m(v,0)}function m(v,S){const F=r.newAttributes,z=r.enabledAttributes,H=r.attributeDivisors;F[v]=1,z[v]===0&&(n.enableVertexAttribArray(v),z[v]=1),H[v]!==S&&(n.vertexAttribDivisor(v,S),H[v]=S)}function w(){const v=r.newAttributes,S=r.enabledAttributes;for(let F=0,z=S.length;F<z;F++)S[F]!==v[F]&&(n.disableVertexAttribArray(F),S[F]=0)}function y(v,S,F,z,H,J,G){G===!0?n.vertexAttribIPointer(v,S,F,H,J):n.vertexAttribPointer(v,S,F,z,H,J)}function _(v,S,F,z){x();const H=z.attributes,J=F.getAttributes(),G=S.defaultAttributeValues;for(const Q in J){const X=J[Q];if(X.location>=0){let ut=H[Q];if(ut===void 0&&(Q==="instanceMatrix"&&v.instanceMatrix&&(ut=v.instanceMatrix),Q==="instanceColor"&&v.instanceColor&&(ut=v.instanceColor)),ut!==void 0){const pt=ut.normalized,mt=ut.itemSize,Kt=t.get(ut);if(Kt===void 0)continue;const jt=Kt.buffer,Y=Kt.type,et=Kt.bytesPerElement,St=Y===n.INT||Y===n.UNSIGNED_INT||ut.gpuType===Va;if(ut.isInterleavedBufferAttribute){const ht=ut.data,Ot=ht.stride,Ut=ut.offset;if(ht.isInstancedInterleavedBuffer){for(let Gt=0;Gt<X.locationSize;Gt++)m(X.location+Gt,ht.meshPerAttribute);v.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let Gt=0;Gt<X.locationSize;Gt++)p(X.location+Gt);n.bindBuffer(n.ARRAY_BUFFER,jt);for(let Gt=0;Gt<X.locationSize;Gt++)y(X.location+Gt,mt/X.locationSize,Y,pt,Ot*et,(Ut+mt/X.locationSize*Gt)*et,St)}else{if(ut.isInstancedBufferAttribute){for(let ht=0;ht<X.locationSize;ht++)m(X.location+ht,ut.meshPerAttribute);v.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ut.meshPerAttribute*ut.count)}else for(let ht=0;ht<X.locationSize;ht++)p(X.location+ht);n.bindBuffer(n.ARRAY_BUFFER,jt);for(let ht=0;ht<X.locationSize;ht++)y(X.location+ht,mt/X.locationSize,Y,pt,mt*et,mt/X.locationSize*ht*et,St)}}else if(G!==void 0){const pt=G[Q];if(pt!==void 0)switch(pt.length){case 2:n.vertexAttrib2fv(X.location,pt);break;case 3:n.vertexAttrib3fv(X.location,pt);break;case 4:n.vertexAttrib4fv(X.location,pt);break;default:n.vertexAttrib1fv(X.location,pt)}}}}w()}function L(){D();for(const v in i){const S=i[v];for(const F in S){const z=S[F];for(const H in z)h(z[H].object),delete z[H];delete S[F]}delete i[v]}}function R(v){if(i[v.id]===void 0)return;const S=i[v.id];for(const F in S){const z=S[F];for(const H in z)h(z[H].object),delete z[H];delete S[F]}delete i[v.id]}function A(v){for(const S in i){const F=i[S];if(F[v.id]===void 0)continue;const z=F[v.id];for(const H in z)h(z[H].object),delete z[H];delete F[v.id]}}function D(){V(),o=!0,r!==s&&(r=s,l(r.object))}function V(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:D,resetDefaultState:V,dispose:L,releaseStatesOfGeometry:R,releaseStatesOfProgram:A,initAttributes:x,enableAttribute:p,disableUnusedAttributes:w}}function X0(n,t,e){let i;function s(l){i=l}function r(l,h){n.drawArrays(i,l,h),e.update(h,i,1)}function o(l,h,f){f!==0&&(n.drawArraysInstanced(i,l,h,f),e.update(h,i,f))}function a(l,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,h,0,f);let d=0;for(let g=0;g<f;g++)d+=h[g];e.update(d,i,1)}function c(l,h,f,u){if(f===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<l.length;g++)o(l[g],h[g],u[g]);else{d.multiDrawArraysInstancedWEBGL(i,l,0,h,0,u,0,f);let g=0;for(let x=0;x<f;x++)g+=h[x];for(let x=0;x<u.length;x++)e.update(g,i,u[x])}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function Y0(n,t,e,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const A=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==fn&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const D=A===rs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==On&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Dn&&!D)}function c(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp";const h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const f=e.logarithmicDepthBuffer===!0,u=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(u===!0){const A=t.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}const d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),p=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),m=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),y=n.getParameter(n.MAX_VARYING_VECTORS),_=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),L=g>0,R=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:f,reverseDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:w,maxVaryings:y,maxFragmentUniforms:_,vertexTextures:L,maxSamples:R}}function q0(n){const t=this;let e=null,i=0,s=!1,r=!1;const o=new di,a=new Yt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){const d=f.length!==0||u||i!==0||s;return s=u,i=f.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,u){e=h(f,u,0)},this.setState=function(f,u,d){const g=f.clippingPlanes,x=f.clipIntersection,p=f.clipShadows,m=n.get(f);if(!s||g===null||g.length===0||r&&!p)r?h(null):l();else{const w=r?0:i,y=w*4;let _=m.clippingState||null;c.value=_,_=h(g,u,y,d);for(let L=0;L!==y;++L)_[L]=e[L];m.clippingState=_,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=w}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(f,u,d,g){const x=f!==null?f.length:0;let p=null;if(x!==0){if(p=c.value,g!==!0||p===null){const m=d+x*4,w=u.matrixWorldInverse;a.getNormalMatrix(w),(p===null||p.length<m)&&(p=new Float32Array(m));for(let y=0,_=d;y!==x;++y,_+=4)o.copy(f[y]).applyMatrix4(w,a),o.normal.toArray(p,_),p[_+3]=o.constant}c.value=p,c.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,p}}function K0(n){let t=new WeakMap;function e(o,a){return a===Jo?o.mapping=ji:a===Zo&&(o.mapping=Qi),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===Jo||a===Zo)if(t.has(o)){const c=t.get(o).texture;return e(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new rd(c.height);return l.fromEquirectangularTexture(n,o),t.set(o,l),o.addEventListener("dispose",s),e(l.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const c=t.get(a);c!==void 0&&(t.delete(a),c.dispose())}function r(){t=new WeakMap}return{get:i,dispose:r}}class ja extends Ih{constructor(t=-1,e=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-t,o=i+t,a=s+e,c=s-e;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Vi=4,Jc=[.125,.215,.35,.446,.526,.582],_i=20,wo=new ja,Zc=new Nt;let bo=null,To=0,Ao=0,Ro=!1;const pi=(1+Math.sqrt(5))/2,Bi=1/pi,$c=[new P(-pi,Bi,0),new P(pi,Bi,0),new P(-Bi,0,pi),new P(Bi,0,pi),new P(0,pi,-Bi),new P(0,pi,Bi),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)];class jc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,i=.1,s=100){bo=this._renderer.getRenderTarget(),To=this._renderer.getActiveCubeFace(),Ao=this._renderer.getActiveMipmapLevel(),Ro=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,i,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=el(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=tl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(bo,To,Ao),this._renderer.xr.enabled=Ro,t.scissorTest=!1,rr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ji||t.mapping===Qi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),bo=this._renderer.getRenderTarget(),To=this._renderer.getActiveCubeFace(),Ao=this._renderer.getActiveMipmapLevel(),Ro=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:hn,minFilter:hn,generateMipmaps:!1,type:rs,format:fn,colorSpace:ii,depthBuffer:!1},s=Qc(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Qc(t,e,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=J0(r)),this._blurMaterial=Z0(r,t,e)}return s}_compileMaterial(t){const e=new ce(this._lodPlanes[0],t);this._renderer.compile(e,wo)}_sceneToCubeUV(t,e,i,s){const a=new ke(90,1,e,i),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,u=h.toneMapping;h.getClearColor(Zc),h.toneMapping=Qn,h.autoClear=!1;const d=new cn({name:"PMREM.Background",side:Ge,depthWrite:!1,depthTest:!1}),g=new ce(new Qt,d);let x=!1;const p=t.background;p?p.isColor&&(d.color.copy(p),t.background=null,x=!0):(d.color.copy(Zc),x=!0);for(let m=0;m<6;m++){const w=m%3;w===0?(a.up.set(0,c[m],0),a.lookAt(l[m],0,0)):w===1?(a.up.set(0,0,c[m]),a.lookAt(0,l[m],0)):(a.up.set(0,c[m],0),a.lookAt(0,0,l[m]));const y=this._cubeSize;rr(s,w*y,m>2?y:0,y,y),h.setRenderTarget(s),x&&h.render(g,a),h.render(t,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=u,h.autoClear=f,t.background=p}_textureToCubeUV(t,e){const i=this._renderer,s=t.mapping===ji||t.mapping===Qi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=el()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=tl());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new ce(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const c=this._cubeSize;rr(e,0,0,3*c,2*c),i.setRenderTarget(e),i.render(o,wo)}_applyPMREM(t){const e=this._renderer,i=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=$c[(s-r-1)%$c.length];this._blur(t,r-1,r,o,a)}e.autoClear=i}_blur(t,e,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,i,s,"latitudinal",r),this._halfBlur(o,t,i,i,s,"longitudinal",r)}_halfBlur(t,e,i,s,r,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,f=new ce(this._lodPlanes[s],l),u=l.uniforms,d=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*_i-1),x=r/g,p=isFinite(r)?1+Math.floor(h*x):_i;p>_i&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${_i}`);const m=[];let w=0;for(let A=0;A<_i;++A){const D=A/x,V=Math.exp(-D*D/2);m.push(V),A===0?w+=V:A<p&&(w+=2*V)}for(let A=0;A<m.length;A++)m[A]=m[A]/w;u.envMap.value=t.texture,u.samples.value=p,u.weights.value=m,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);const{_lodMax:y}=this;u.dTheta.value=g,u.mipInt.value=y-i;const _=this._sizeLods[s],L=3*_*(s>y-Vi?s-y+Vi:0),R=4*(this._cubeSize-_);rr(e,L,R,3*_,2*_),c.setRenderTarget(e),c.render(f,wo)}}function J0(n){const t=[],e=[],i=[];let s=n;const r=n-Vi+1+Jc.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let c=1/a;o>n-Vi?c=Jc[o-n+Vi-1]:o===0&&(c=0),i.push(c);const l=1/(a-2),h=-l,f=1+l,u=[h,h,f,h,f,f,h,h,f,f,h,f],d=6,g=6,x=3,p=2,m=1,w=new Float32Array(x*g*d),y=new Float32Array(p*g*d),_=new Float32Array(m*g*d);for(let R=0;R<d;R++){const A=R%3*2/3-1,D=R>2?0:-1,V=[A,D,0,A+2/3,D,0,A+2/3,D+1,0,A,D,0,A+2/3,D+1,0,A,D+1,0];w.set(V,x*g*R),y.set(u,p*g*R);const v=[R,R,R,R,R,R];_.set(v,m*g*R)}const L=new Ie;L.setAttribute("position",new Le(w,x)),L.setAttribute("uv",new Le(y,p)),L.setAttribute("faceIndex",new Le(_,m)),t.push(L),s>Vi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:i}}function Qc(n,t,e){const i=new ni(n,t,e);return i.texture.mapping=Gr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function rr(n,t,e,i,s){n.viewport.set(t,e,i,s),n.scissor.set(t,e,i,s)}function Z0(n,t,e){const i=new Float32Array(_i),s=new P(0,1,0);return new Fn({name:"SphericalGaussianBlur",defines:{n:_i,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function tl(){return new Fn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function el(){return new Fn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Qa(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function $0(n){let t=new WeakMap,e=null;function i(a){if(a&&a.isTexture){const c=a.mapping,l=c===Jo||c===Zo,h=c===ji||c===Qi;if(l||h){let f=t.get(a);const u=f!==void 0?f.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==u)return e===null&&(e=new jc(n)),f=l?e.fromEquirectangular(a,f):e.fromCubemap(a,f),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),f.texture;if(f!==void 0)return f.texture;{const d=a.image;return l&&d&&d.height>0||h&&d&&s(d)?(e===null&&(e=new jc(n)),f=l?e.fromEquirectangular(a):e.fromCubemap(a),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),a.addEventListener("dispose",r),f.texture):null}}}return a}function s(a){let c=0;const l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function r(a){const c=a.target;c.removeEventListener("dispose",r);const l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:i,dispose:o}}function j0(n){const t={};function e(i){if(t[i]!==void 0)return t[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){const s=e(i);return s===null&&Sr("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function Q0(n,t,e,i){const s={},r=new WeakMap;function o(f){const u=f.target;u.index!==null&&t.remove(u.index);for(const g in u.attributes)t.remove(u.attributes[g]);for(const g in u.morphAttributes){const x=u.morphAttributes[g];for(let p=0,m=x.length;p<m;p++)t.remove(x[p])}u.removeEventListener("dispose",o),delete s[u.id];const d=r.get(u);d&&(t.remove(d),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(f,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,e.memory.geometries++),u}function c(f){const u=f.attributes;for(const g in u)t.update(u[g],n.ARRAY_BUFFER);const d=f.morphAttributes;for(const g in d){const x=d[g];for(let p=0,m=x.length;p<m;p++)t.update(x[p],n.ARRAY_BUFFER)}}function l(f){const u=[],d=f.index,g=f.attributes.position;let x=0;if(d!==null){const w=d.array;x=d.version;for(let y=0,_=w.length;y<_;y+=3){const L=w[y+0],R=w[y+1],A=w[y+2];u.push(L,R,R,A,A,L)}}else if(g!==void 0){const w=g.array;x=g.version;for(let y=0,_=w.length/3-1;y<_;y+=3){const L=y+0,R=y+1,A=y+2;u.push(L,R,R,A,A,L)}}else return;const p=new(Eh(u)?Ph:Ch)(u,1);p.version=x;const m=r.get(f);m&&t.remove(m),r.set(f,p)}function h(f){const u=r.get(f);if(u){const d=f.index;d!==null&&u.version<d.version&&l(f)}else l(f);return r.get(f)}return{get:a,update:c,getWireframeAttribute:h}}function tm(n,t,e){let i;function s(u){i=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function c(u,d){n.drawElements(i,d,r,u*o),e.update(d,i,1)}function l(u,d,g){g!==0&&(n.drawElementsInstanced(i,d,r,u*o,g),e.update(d,i,g))}function h(u,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,g);let p=0;for(let m=0;m<g;m++)p+=d[m];e.update(p,i,1)}function f(u,d,g,x){if(g===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<u.length;m++)l(u[m]/o,d[m],x[m]);else{p.multiDrawElementsInstancedWEBGL(i,d,0,r,u,0,x,0,g);let m=0;for(let w=0;w<g;w++)m+=d[w];for(let w=0;w<x.length;w++)e.update(m,i,x[w])}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function em(n){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(e.calls++,o){case n.TRIANGLES:e.triangles+=a*(r/3);break;case n.LINES:e.lines+=a*(r/2);break;case n.LINE_STRIP:e.lines+=a*(r-1);break;case n.LINE_LOOP:e.lines+=a*r;break;case n.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function nm(n,t,e){const i=new WeakMap,s=new oe;function r(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=h!==void 0?h.length:0;let u=i.get(a);if(u===void 0||u.count!==f){let v=function(){D.dispose(),i.delete(a),a.removeEventListener("dispose",v)};var d=v;u!==void 0&&u.texture.dispose();const g=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,p=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],w=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let _=0;g===!0&&(_=1),x===!0&&(_=2),p===!0&&(_=3);let L=a.attributes.position.count*_,R=1;L>t.maxTextureSize&&(R=Math.ceil(L/t.maxTextureSize),L=t.maxTextureSize);const A=new Float32Array(L*R*4*f),D=new bh(A,L,R,f);D.type=Dn,D.needsUpdate=!0;const V=_*4;for(let S=0;S<f;S++){const F=m[S],z=w[S],H=y[S],J=L*R*4*S;for(let G=0;G<F.count;G++){const Q=G*V;g===!0&&(s.fromBufferAttribute(F,G),A[J+Q+0]=s.x,A[J+Q+1]=s.y,A[J+Q+2]=s.z,A[J+Q+3]=0),x===!0&&(s.fromBufferAttribute(z,G),A[J+Q+4]=s.x,A[J+Q+5]=s.y,A[J+Q+6]=s.z,A[J+Q+7]=0),p===!0&&(s.fromBufferAttribute(H,G),A[J+Q+8]=s.x,A[J+Q+9]=s.y,A[J+Q+10]=s.z,A[J+Q+11]=H.itemSize===4?s.w:1)}}u={count:f,texture:D,size:new rt(L,R)},i.set(a,u),a.addEventListener("dispose",v)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",o.morphTexture,e);else{let g=0;for(let p=0;p<l.length;p++)g+=l[p];const x=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(n,"morphTargetBaseInfluence",x),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",u.texture,e),c.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:r}}function im(n,t,e,i){let s=new WeakMap;function r(c){const l=i.render.frame,h=c.geometry,f=t.get(c,h);if(s.get(f)!==l&&(t.update(f),s.set(f,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==l&&(e.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,n.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){const u=c.skeleton;s.get(u)!==l&&(u.update(),s.set(u,l))}return f}function o(){s=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),e.remove(l.instanceMatrix),l.instanceColor!==null&&e.remove(l.instanceColor)}return{update:r,dispose:o}}class Nh extends Fe{constructor(t,e,i,s,r,o,a,c,l,h=qi){if(h!==qi&&h!==es)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===qi&&(i=Mi),i===void 0&&h===es&&(i=ts),super(null,s,r,o,a,c,h,i,l),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:Qe,this.minFilter=c!==void 0?c:Qe,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Oh=new Fe,nl=new Nh(1,1),Fh=new bh,zh=new Vf,Bh=new Dh,il=[],sl=[],rl=new Float32Array(16),ol=new Float32Array(9),al=new Float32Array(4);function cs(n,t,e){const i=n[0];if(i<=0||i>0)return n;const s=t*e;let r=il[s];if(r===void 0&&(r=new Float32Array(s),il[s]=r),t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,n[o].toArray(r,a)}return r}function Te(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function Ae(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function Wr(n,t){let e=sl[t];e===void 0&&(e=new Int32Array(t),sl[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function sm(n,t){const e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function rm(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2fv(this.addr,t),Ae(e,t)}}function om(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Te(e,t))return;n.uniform3fv(this.addr,t),Ae(e,t)}}function am(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4fv(this.addr,t),Ae(e,t)}}function cm(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;al.set(i),n.uniformMatrix2fv(this.addr,!1,al),Ae(e,i)}}function lm(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;ol.set(i),n.uniformMatrix3fv(this.addr,!1,ol),Ae(e,i)}}function hm(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;rl.set(i),n.uniformMatrix4fv(this.addr,!1,rl),Ae(e,i)}}function um(n,t){const e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function fm(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2iv(this.addr,t),Ae(e,t)}}function dm(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;n.uniform3iv(this.addr,t),Ae(e,t)}}function pm(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4iv(this.addr,t),Ae(e,t)}}function mm(n,t){const e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function gm(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2uiv(this.addr,t),Ae(e,t)}}function _m(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;n.uniform3uiv(this.addr,t),Ae(e,t)}}function vm(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4uiv(this.addr,t),Ae(e,t)}}function xm(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(nl.compareFunction=Sh,r=nl):r=Oh,e.setTexture2D(t||r,s)}function Mm(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||zh,s)}function Sm(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTextureCube(t||Bh,s)}function ym(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||Fh,s)}function Em(n){switch(n){case 5126:return sm;case 35664:return rm;case 35665:return om;case 35666:return am;case 35674:return cm;case 35675:return lm;case 35676:return hm;case 5124:case 35670:return um;case 35667:case 35671:return fm;case 35668:case 35672:return dm;case 35669:case 35673:return pm;case 5125:return mm;case 36294:return gm;case 36295:return _m;case 36296:return vm;case 35678:case 36198:case 36298:case 36306:case 35682:return xm;case 35679:case 36299:case 36307:return Mm;case 35680:case 36300:case 36308:case 36293:return Sm;case 36289:case 36303:case 36311:case 36292:return ym}}function wm(n,t){n.uniform1fv(this.addr,t)}function bm(n,t){const e=cs(t,this.size,2);n.uniform2fv(this.addr,e)}function Tm(n,t){const e=cs(t,this.size,3);n.uniform3fv(this.addr,e)}function Am(n,t){const e=cs(t,this.size,4);n.uniform4fv(this.addr,e)}function Rm(n,t){const e=cs(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function Cm(n,t){const e=cs(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function Pm(n,t){const e=cs(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function Lm(n,t){n.uniform1iv(this.addr,t)}function Im(n,t){n.uniform2iv(this.addr,t)}function Dm(n,t){n.uniform3iv(this.addr,t)}function Um(n,t){n.uniform4iv(this.addr,t)}function Nm(n,t){n.uniform1uiv(this.addr,t)}function Om(n,t){n.uniform2uiv(this.addr,t)}function Fm(n,t){n.uniform3uiv(this.addr,t)}function zm(n,t){n.uniform4uiv(this.addr,t)}function Bm(n,t,e){const i=this.cache,s=t.length,r=Wr(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||Oh,r[o])}function km(n,t,e){const i=this.cache,s=t.length,r=Wr(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||zh,r[o])}function Gm(n,t,e){const i=this.cache,s=t.length,r=Wr(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Bh,r[o])}function Hm(n,t,e){const i=this.cache,s=t.length,r=Wr(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Fh,r[o])}function Vm(n){switch(n){case 5126:return wm;case 35664:return bm;case 35665:return Tm;case 35666:return Am;case 35674:return Rm;case 35675:return Cm;case 35676:return Pm;case 5124:case 35670:return Lm;case 35667:case 35671:return Im;case 35668:case 35672:return Dm;case 35669:case 35673:return Um;case 5125:return Nm;case 36294:return Om;case 36295:return Fm;case 36296:return zm;case 35678:case 36198:case 36298:case 36306:case 35682:return Bm;case 35679:case 36299:case 36307:return km;case 35680:case 36300:case 36308:case 36293:return Gm;case 36289:case 36303:case 36311:case 36292:return Hm}}class Wm{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Em(e.type)}}class Xm{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Vm(e.type)}}class Ym{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],i)}}}const Co=/(\w+)(\])?(\[|\.)?/g;function cl(n,t){n.seq.push(t),n.map[t.id]=t}function qm(n,t,e){const i=n.name,s=i.length;for(Co.lastIndex=0;;){const r=Co.exec(i),o=Co.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){cl(e,l===void 0?new Wm(a,n,t):new Xm(a,n,t));break}else{let f=e.map[a];f===void 0&&(f=new Ym(a),cl(e,f)),e=f}}}class yr{constructor(t,e){this.seq=[],this.map={};const i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);qm(r,o,this)}}setValue(t,e,i,s){const r=this.map[e];r!==void 0&&r.setValue(t,i,s)}setOptional(t,e,i){const s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],c=i[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,s)}}static seqWithValue(t,e){const i=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&i.push(o)}return i}}function ll(n,t,e){const i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}const Km=37297;let Jm=0;function Zm(n,t){const e=n.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}function $m(n){const t=se.getPrimaries(se.workingColorSpace),e=se.getPrimaries(n);let i;switch(t===e?i="":t===Lr&&e===Pr?i="LinearDisplayP3ToLinearSRGB":t===Pr&&e===Lr&&(i="LinearSRGBToLinearDisplayP3"),n){case ii:case Hr:return[i,"LinearTransferOETF"];case dn:case Ja:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function hl(n,t,e){const i=n.getShaderParameter(t,n.COMPILE_STATUS),s=n.getShaderInfoLog(t).trim();if(i&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+Zm(n.getShaderSource(t),o)}else return s}function jm(n,t){const e=$m(t);return`vec4 ${n}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function Qm(n,t){let e;switch(t){case Qu:e="Linear";break;case tf:e="Reinhard";break;case ef:e="Cineon";break;case nf:e="ACESFilmic";break;case rf:e="AgX";break;case of:e="Neutral";break;case sf:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const or=new P;function tg(){se.getLuminanceCoefficients(or);const n=or.x.toFixed(4),t=or.y.toFixed(4),e=or.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function eg(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ms).join(`
`)}function ng(n){const t=[];for(const e in n){const i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function ig(n,t){const e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(t,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:n.getAttribLocation(t,o),locationSize:a}}return e}function Ms(n){return n!==""}function ul(n,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function fl(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const sg=/^[ \t]*#include +<([\w\d./]+)>/gm;function wa(n){return n.replace(sg,og)}const rg=new Map;function og(n,t){let e=Xt[t];if(e===void 0){const i=rg.get(t);if(i!==void 0)e=Xt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return wa(e)}const ag=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function dl(n){return n.replace(ag,cg)}function cg(n,t,e,i){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function pl(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function lg(n){let t="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===oh?t="SHADOWMAP_TYPE_PCF":n.shadowMapType===ah?t="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Pn&&(t="SHADOWMAP_TYPE_VSM"),t}function hg(n){let t="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ji:case Qi:t="ENVMAP_TYPE_CUBE";break;case Gr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function ug(n){let t="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Qi:t="ENVMAP_MODE_REFRACTION";break}return t}function fg(n){let t="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case ch:t="ENVMAP_BLENDING_MULTIPLY";break;case $u:t="ENVMAP_BLENDING_MIX";break;case ju:t="ENVMAP_BLENDING_ADD";break}return t}function dg(n){const t=n.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:i,maxMip:e}}function pg(n,t,e,i){const s=n.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const c=lg(e),l=hg(e),h=ug(e),f=fg(e),u=dg(e),d=eg(e),g=ng(r),x=s.createProgram();let p,m,w=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ms).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ms).join(`
`),m.length>0&&(m+=`
`)):(p=[pl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ms).join(`
`),m=[pl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Qn?"#define TONE_MAPPING":"",e.toneMapping!==Qn?Xt.tonemapping_pars_fragment:"",e.toneMapping!==Qn?Qm("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Xt.colorspace_pars_fragment,jm("linearToOutputTexel",e.outputColorSpace),tg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ms).join(`
`)),o=wa(o),o=ul(o,e),o=fl(o,e),a=wa(a),a=ul(a,e),a=fl(a,e),o=dl(o),a=dl(a),e.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,p=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Pc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Pc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const y=w+p+o,_=w+m+a,L=ll(s,s.VERTEX_SHADER,y),R=ll(s,s.FRAGMENT_SHADER,_);s.attachShader(x,L),s.attachShader(x,R),e.index0AttributeName!==void 0?s.bindAttribLocation(x,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function A(S){if(n.debug.checkShaderErrors){const F=s.getProgramInfoLog(x).trim(),z=s.getShaderInfoLog(L).trim(),H=s.getShaderInfoLog(R).trim();let J=!0,G=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(J=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,L,R);else{const Q=hl(s,L,"vertex"),X=hl(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+S.name+`
Material Type: `+S.type+`

Program Info Log: `+F+`
`+Q+`
`+X)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(z===""||H==="")&&(G=!1);G&&(S.diagnostics={runnable:J,programLog:F,vertexShader:{log:z,prefix:p},fragmentShader:{log:H,prefix:m}})}s.deleteShader(L),s.deleteShader(R),D=new yr(s,x),V=ig(s,x)}let D;this.getUniforms=function(){return D===void 0&&A(this),D};let V;this.getAttributes=function(){return V===void 0&&A(this),V};let v=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(x,Km)),v},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Jm++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=L,this.fragmentShader=R,this}let mg=0;class gg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,i=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){const e=this.shaderCache;let i=e.get(t);return i===void 0&&(i=new _g(t),e.set(t,i)),i}}class _g{constructor(t){this.id=mg++,this.code=t,this.usedTimes=0}}function vg(n,t,e,i,s,r,o){const a=new Ah,c=new gg,l=new Set,h=[],f=s.logarithmicDepthBuffer,u=s.reverseDepthBuffer,d=s.vertexTextures;let g=s.precision;const x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(v){return l.add(v),v===0?"uv":`uv${v}`}function m(v,S,F,z,H){const J=z.fog,G=H.geometry,Q=v.isMeshStandardMaterial?z.environment:null,X=(v.isMeshStandardMaterial?e:t).get(v.envMap||Q),ut=X&&X.mapping===Gr?X.image.height:null,pt=x[v.type];v.precision!==null&&(g=s.getMaxPrecision(v.precision),g!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",g,"instead."));const mt=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,Kt=mt!==void 0?mt.length:0;let jt=0;G.morphAttributes.position!==void 0&&(jt=1),G.morphAttributes.normal!==void 0&&(jt=2),G.morphAttributes.color!==void 0&&(jt=3);let Y,et,St,ht;if(pt){const Be=pn[pt];Y=Be.vertexShader,et=Be.fragmentShader}else Y=v.vertexShader,et=v.fragmentShader,c.update(v),St=c.getVertexShaderID(v),ht=c.getFragmentShaderID(v);const Ot=n.getRenderTarget(),Ut=H.isInstancedMesh===!0,Gt=H.isBatchedMesh===!0,qt=!!v.map,Z=!!v.matcap,T=!!X,ot=!!v.aoMap,st=!!v.lightMap,tt=!!v.bumpMap,at=!!v.normalMap,Pt=!!v.displacementMap,gt=!!v.emissiveMap,b=!!v.metalnessMap,M=!!v.roughnessMap,O=v.anisotropy>0,q=v.clearcoat>0,$=v.dispersion>0,K=v.iridescence>0,bt=v.sheen>0,ct=v.transmission>0,xt=O&&!!v.anisotropyMap,Jt=q&&!!v.clearcoatMap,nt=q&&!!v.clearcoatNormalMap,Mt=q&&!!v.clearcoatRoughnessMap,Bt=K&&!!v.iridescenceMap,kt=K&&!!v.iridescenceThicknessMap,yt=bt&&!!v.sheenColorMap,Zt=bt&&!!v.sheenRoughnessMap,Ht=!!v.specularMap,ae=!!v.specularColorMap,I=!!v.specularIntensityMap,_t=ct&&!!v.transmissionMap,W=ct&&!!v.thicknessMap,j=!!v.gradientMap,ft=!!v.alphaMap,vt=v.alphaTest>0,$t=!!v.alphaHash,ye=!!v.extensions;let ze=Qn;v.toneMapped&&(Ot===null||Ot.isXRRenderTarget===!0)&&(ze=n.toneMapping);const ee={shaderID:pt,shaderType:v.type,shaderName:v.name,vertexShader:Y,fragmentShader:et,defines:v.defines,customVertexShaderID:St,customFragmentShaderID:ht,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:g,batching:Gt,batchingColor:Gt&&H._colorsTexture!==null,instancing:Ut,instancingColor:Ut&&H.instanceColor!==null,instancingMorph:Ut&&H.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:Ot===null?n.outputColorSpace:Ot.isXRRenderTarget===!0?Ot.texture.colorSpace:ii,alphaToCoverage:!!v.alphaToCoverage,map:qt,matcap:Z,envMap:T,envMapMode:T&&X.mapping,envMapCubeUVHeight:ut,aoMap:ot,lightMap:st,bumpMap:tt,normalMap:at,displacementMap:d&&Pt,emissiveMap:gt,normalMapObjectSpace:at&&v.normalMapType===hf,normalMapTangentSpace:at&&v.normalMapType===Mh,metalnessMap:b,roughnessMap:M,anisotropy:O,anisotropyMap:xt,clearcoat:q,clearcoatMap:Jt,clearcoatNormalMap:nt,clearcoatRoughnessMap:Mt,dispersion:$,iridescence:K,iridescenceMap:Bt,iridescenceThicknessMap:kt,sheen:bt,sheenColorMap:yt,sheenRoughnessMap:Zt,specularMap:Ht,specularColorMap:ae,specularIntensityMap:I,transmission:ct,transmissionMap:_t,thicknessMap:W,gradientMap:j,opaque:v.transparent===!1&&v.blending===Yi&&v.alphaToCoverage===!1,alphaMap:ft,alphaTest:vt,alphaHash:$t,combine:v.combine,mapUv:qt&&p(v.map.channel),aoMapUv:ot&&p(v.aoMap.channel),lightMapUv:st&&p(v.lightMap.channel),bumpMapUv:tt&&p(v.bumpMap.channel),normalMapUv:at&&p(v.normalMap.channel),displacementMapUv:Pt&&p(v.displacementMap.channel),emissiveMapUv:gt&&p(v.emissiveMap.channel),metalnessMapUv:b&&p(v.metalnessMap.channel),roughnessMapUv:M&&p(v.roughnessMap.channel),anisotropyMapUv:xt&&p(v.anisotropyMap.channel),clearcoatMapUv:Jt&&p(v.clearcoatMap.channel),clearcoatNormalMapUv:nt&&p(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Mt&&p(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Bt&&p(v.iridescenceMap.channel),iridescenceThicknessMapUv:kt&&p(v.iridescenceThicknessMap.channel),sheenColorMapUv:yt&&p(v.sheenColorMap.channel),sheenRoughnessMapUv:Zt&&p(v.sheenRoughnessMap.channel),specularMapUv:Ht&&p(v.specularMap.channel),specularColorMapUv:ae&&p(v.specularColorMap.channel),specularIntensityMapUv:I&&p(v.specularIntensityMap.channel),transmissionMapUv:_t&&p(v.transmissionMap.channel),thicknessMapUv:W&&p(v.thicknessMap.channel),alphaMapUv:ft&&p(v.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(at||O),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!G.attributes.uv&&(qt||ft),fog:!!J,useFog:v.fog===!0,fogExp2:!!J&&J.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:u,skinning:H.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:Kt,morphTextureStride:jt,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&F.length>0,shadowMapType:n.shadowMap.type,toneMapping:ze,decodeVideoTexture:qt&&v.map.isVideoTexture===!0&&se.getTransfer(v.map.colorSpace)===ue,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===_n,flipSided:v.side===Ge,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:ye&&v.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ye&&v.extensions.multiDraw===!0||Gt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return ee.vertexUv1s=l.has(1),ee.vertexUv2s=l.has(2),ee.vertexUv3s=l.has(3),l.clear(),ee}function w(v){const S=[];if(v.shaderID?S.push(v.shaderID):(S.push(v.customVertexShaderID),S.push(v.customFragmentShaderID)),v.defines!==void 0)for(const F in v.defines)S.push(F),S.push(v.defines[F]);return v.isRawShaderMaterial===!1&&(y(S,v),_(S,v),S.push(n.outputColorSpace)),S.push(v.customProgramCacheKey),S.join()}function y(v,S){v.push(S.precision),v.push(S.outputColorSpace),v.push(S.envMapMode),v.push(S.envMapCubeUVHeight),v.push(S.mapUv),v.push(S.alphaMapUv),v.push(S.lightMapUv),v.push(S.aoMapUv),v.push(S.bumpMapUv),v.push(S.normalMapUv),v.push(S.displacementMapUv),v.push(S.emissiveMapUv),v.push(S.metalnessMapUv),v.push(S.roughnessMapUv),v.push(S.anisotropyMapUv),v.push(S.clearcoatMapUv),v.push(S.clearcoatNormalMapUv),v.push(S.clearcoatRoughnessMapUv),v.push(S.iridescenceMapUv),v.push(S.iridescenceThicknessMapUv),v.push(S.sheenColorMapUv),v.push(S.sheenRoughnessMapUv),v.push(S.specularMapUv),v.push(S.specularColorMapUv),v.push(S.specularIntensityMapUv),v.push(S.transmissionMapUv),v.push(S.thicknessMapUv),v.push(S.combine),v.push(S.fogExp2),v.push(S.sizeAttenuation),v.push(S.morphTargetsCount),v.push(S.morphAttributeCount),v.push(S.numDirLights),v.push(S.numPointLights),v.push(S.numSpotLights),v.push(S.numSpotLightMaps),v.push(S.numHemiLights),v.push(S.numRectAreaLights),v.push(S.numDirLightShadows),v.push(S.numPointLightShadows),v.push(S.numSpotLightShadows),v.push(S.numSpotLightShadowsWithMaps),v.push(S.numLightProbes),v.push(S.shadowMapType),v.push(S.toneMapping),v.push(S.numClippingPlanes),v.push(S.numClipIntersection),v.push(S.depthPacking)}function _(v,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),v.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reverseDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.alphaToCoverage&&a.enable(20),v.push(a.mask)}function L(v){const S=x[v.type];let F;if(S){const z=pn[S];F=ed.clone(z.uniforms)}else F=v.uniforms;return F}function R(v,S){let F;for(let z=0,H=h.length;z<H;z++){const J=h[z];if(J.cacheKey===S){F=J,++F.usedTimes;break}}return F===void 0&&(F=new pg(n,S,v,r),h.push(F)),F}function A(v){if(--v.usedTimes===0){const S=h.indexOf(v);h[S]=h[h.length-1],h.pop(),v.destroy()}}function D(v){c.remove(v)}function V(){c.dispose()}return{getParameters:m,getProgramCacheKey:w,getUniforms:L,acquireProgram:R,releaseProgram:A,releaseShaderCache:D,programs:h,dispose:V}}function xg(){let n=new WeakMap;function t(o){return n.has(o)}function e(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,c){n.get(o)[a]=c}function r(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:r}}function Mg(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.z!==t.z?n.z-t.z:n.id-t.id}function ml(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function gl(){const n=[];let t=0;const e=[],i=[],s=[];function r(){t=0,e.length=0,i.length=0,s.length=0}function o(f,u,d,g,x,p){let m=n[t];return m===void 0?(m={id:f.id,object:f,geometry:u,material:d,groupOrder:g,renderOrder:f.renderOrder,z:x,group:p},n[t]=m):(m.id=f.id,m.object=f,m.geometry=u,m.material=d,m.groupOrder=g,m.renderOrder=f.renderOrder,m.z=x,m.group=p),t++,m}function a(f,u,d,g,x,p){const m=o(f,u,d,g,x,p);d.transmission>0?i.push(m):d.transparent===!0?s.push(m):e.push(m)}function c(f,u,d,g,x,p){const m=o(f,u,d,g,x,p);d.transmission>0?i.unshift(m):d.transparent===!0?s.unshift(m):e.unshift(m)}function l(f,u){e.length>1&&e.sort(f||Mg),i.length>1&&i.sort(u||ml),s.length>1&&s.sort(u||ml)}function h(){for(let f=t,u=n.length;f<u;f++){const d=n[f];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:i,transparent:s,init:r,push:a,unshift:c,finish:h,sort:l}}function Sg(){let n=new WeakMap;function t(i,s){const r=n.get(i);let o;return r===void 0?(o=new gl,n.set(i,[o])):s>=r.length?(o=new gl,r.push(o)):o=r[s],o}function e(){n=new WeakMap}return{get:t,dispose:e}}function yg(){const n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new P,color:new Nt};break;case"SpotLight":e={position:new P,direction:new P,color:new Nt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new P,color:new Nt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new P,skyColor:new Nt,groundColor:new Nt};break;case"RectAreaLight":e={color:new Nt,position:new P,halfWidth:new P,halfHeight:new P};break}return n[t.id]=e,e}}}function Eg(){const n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new rt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new rt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new rt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}let wg=0;function bg(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function Tg(n){const t=new yg,e=Eg(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new P);const s=new P,r=new fe,o=new fe;function a(l){let h=0,f=0,u=0;for(let V=0;V<9;V++)i.probe[V].set(0,0,0);let d=0,g=0,x=0,p=0,m=0,w=0,y=0,_=0,L=0,R=0,A=0;l.sort(bg);for(let V=0,v=l.length;V<v;V++){const S=l[V],F=S.color,z=S.intensity,H=S.distance,J=S.shadow&&S.shadow.map?S.shadow.map.texture:null;if(S.isAmbientLight)h+=F.r*z,f+=F.g*z,u+=F.b*z;else if(S.isLightProbe){for(let G=0;G<9;G++)i.probe[G].addScaledVector(S.sh.coefficients[G],z);A++}else if(S.isDirectionalLight){const G=t.get(S);if(G.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){const Q=S.shadow,X=e.get(S);X.shadowIntensity=Q.intensity,X.shadowBias=Q.bias,X.shadowNormalBias=Q.normalBias,X.shadowRadius=Q.radius,X.shadowMapSize=Q.mapSize,i.directionalShadow[d]=X,i.directionalShadowMap[d]=J,i.directionalShadowMatrix[d]=S.shadow.matrix,w++}i.directional[d]=G,d++}else if(S.isSpotLight){const G=t.get(S);G.position.setFromMatrixPosition(S.matrixWorld),G.color.copy(F).multiplyScalar(z),G.distance=H,G.coneCos=Math.cos(S.angle),G.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),G.decay=S.decay,i.spot[x]=G;const Q=S.shadow;if(S.map&&(i.spotLightMap[L]=S.map,L++,Q.updateMatrices(S),S.castShadow&&R++),i.spotLightMatrix[x]=Q.matrix,S.castShadow){const X=e.get(S);X.shadowIntensity=Q.intensity,X.shadowBias=Q.bias,X.shadowNormalBias=Q.normalBias,X.shadowRadius=Q.radius,X.shadowMapSize=Q.mapSize,i.spotShadow[x]=X,i.spotShadowMap[x]=J,_++}x++}else if(S.isRectAreaLight){const G=t.get(S);G.color.copy(F).multiplyScalar(z),G.halfWidth.set(S.width*.5,0,0),G.halfHeight.set(0,S.height*.5,0),i.rectArea[p]=G,p++}else if(S.isPointLight){const G=t.get(S);if(G.color.copy(S.color).multiplyScalar(S.intensity),G.distance=S.distance,G.decay=S.decay,S.castShadow){const Q=S.shadow,X=e.get(S);X.shadowIntensity=Q.intensity,X.shadowBias=Q.bias,X.shadowNormalBias=Q.normalBias,X.shadowRadius=Q.radius,X.shadowMapSize=Q.mapSize,X.shadowCameraNear=Q.camera.near,X.shadowCameraFar=Q.camera.far,i.pointShadow[g]=X,i.pointShadowMap[g]=J,i.pointShadowMatrix[g]=S.shadow.matrix,y++}i.point[g]=G,g++}else if(S.isHemisphereLight){const G=t.get(S);G.skyColor.copy(S.color).multiplyScalar(z),G.groundColor.copy(S.groundColor).multiplyScalar(z),i.hemi[m]=G,m++}}p>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=lt.LTC_FLOAT_1,i.rectAreaLTC2=lt.LTC_FLOAT_2):(i.rectAreaLTC1=lt.LTC_HALF_1,i.rectAreaLTC2=lt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=f,i.ambient[2]=u;const D=i.hash;(D.directionalLength!==d||D.pointLength!==g||D.spotLength!==x||D.rectAreaLength!==p||D.hemiLength!==m||D.numDirectionalShadows!==w||D.numPointShadows!==y||D.numSpotShadows!==_||D.numSpotMaps!==L||D.numLightProbes!==A)&&(i.directional.length=d,i.spot.length=x,i.rectArea.length=p,i.point.length=g,i.hemi.length=m,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=_,i.spotShadowMap.length=_,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=y,i.spotLightMatrix.length=_+L-R,i.spotLightMap.length=L,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=A,D.directionalLength=d,D.pointLength=g,D.spotLength=x,D.rectAreaLength=p,D.hemiLength=m,D.numDirectionalShadows=w,D.numPointShadows=y,D.numSpotShadows=_,D.numSpotMaps=L,D.numLightProbes=A,i.version=wg++)}function c(l,h){let f=0,u=0,d=0,g=0,x=0;const p=h.matrixWorldInverse;for(let m=0,w=l.length;m<w;m++){const y=l[m];if(y.isDirectionalLight){const _=i.directional[f];_.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(p),f++}else if(y.isSpotLight){const _=i.spot[d];_.position.setFromMatrixPosition(y.matrixWorld),_.position.applyMatrix4(p),_.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(p),d++}else if(y.isRectAreaLight){const _=i.rectArea[g];_.position.setFromMatrixPosition(y.matrixWorld),_.position.applyMatrix4(p),o.identity(),r.copy(y.matrixWorld),r.premultiply(p),o.extractRotation(r),_.halfWidth.set(y.width*.5,0,0),_.halfHeight.set(0,y.height*.5,0),_.halfWidth.applyMatrix4(o),_.halfHeight.applyMatrix4(o),g++}else if(y.isPointLight){const _=i.point[u];_.position.setFromMatrixPosition(y.matrixWorld),_.position.applyMatrix4(p),u++}else if(y.isHemisphereLight){const _=i.hemi[x];_.direction.setFromMatrixPosition(y.matrixWorld),_.direction.transformDirection(p),x++}}}return{setup:a,setupView:c,state:i}}function _l(n){const t=new Tg(n),e=[],i=[];function s(h){l.camera=h,e.length=0,i.length=0}function r(h){e.push(h)}function o(h){i.push(h)}function a(){t.setup(e)}function c(h){t.setupView(e,h)}const l={lightsArray:e,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function Ag(n){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new _l(n),t.set(s,[a])):r>=o.length?(a=new _l(n),o.push(a)):a=o[r],a}function i(){t=new WeakMap}return{get:e,dispose:i}}class Rg extends as{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=cf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Cg extends as{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const Pg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Lg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Ig(n,t,e){let i=new $a;const s=new rt,r=new rt,o=new oe,a=new Rg({depthPacking:lf}),c=new Cg,l={},h=e.maxTextureSize,f={[ei]:Ge,[Ge]:ei,[_n]:_n},u=new Fn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new rt},radius:{value:4}},vertexShader:Pg,fragmentShader:Lg}),d=u.clone();d.defines.HORIZONTAL_PASS=1;const g=new Ie;g.setAttribute("position",new Le(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new ce(g,u),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=oh;let m=this.type;this.render=function(R,A,D){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||R.length===0)return;const V=n.getRenderTarget(),v=n.getActiveCubeFace(),S=n.getActiveMipmapLevel(),F=n.state;F.setBlending(jn),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const z=m!==Pn&&this.type===Pn,H=m===Pn&&this.type!==Pn;for(let J=0,G=R.length;J<G;J++){const Q=R[J],X=Q.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const ut=X.getFrameExtents();if(s.multiply(ut),r.copy(X.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ut.x),s.x=r.x*ut.x,X.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ut.y),s.y=r.y*ut.y,X.mapSize.y=r.y)),X.map===null||z===!0||H===!0){const mt=this.type!==Pn?{minFilter:Qe,magFilter:Qe}:{};X.map!==null&&X.map.dispose(),X.map=new ni(s.x,s.y,mt),X.map.texture.name=Q.name+".shadowMap",X.camera.updateProjectionMatrix()}n.setRenderTarget(X.map),n.clear();const pt=X.getViewportCount();for(let mt=0;mt<pt;mt++){const Kt=X.getViewport(mt);o.set(r.x*Kt.x,r.y*Kt.y,r.x*Kt.z,r.y*Kt.w),F.viewport(o),X.updateMatrices(Q,mt),i=X.getFrustum(),_(A,D,X.camera,Q,this.type)}X.isPointLightShadow!==!0&&this.type===Pn&&w(X,D),X.needsUpdate=!1}m=this.type,p.needsUpdate=!1,n.setRenderTarget(V,v,S)};function w(R,A){const D=t.update(x);u.defines.VSM_SAMPLES!==R.blurSamples&&(u.defines.VSM_SAMPLES=R.blurSamples,d.defines.VSM_SAMPLES=R.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new ni(s.x,s.y)),u.uniforms.shadow_pass.value=R.map.texture,u.uniforms.resolution.value=R.mapSize,u.uniforms.radius.value=R.radius,n.setRenderTarget(R.mapPass),n.clear(),n.renderBufferDirect(A,null,D,u,x,null),d.uniforms.shadow_pass.value=R.mapPass.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,n.setRenderTarget(R.map),n.clear(),n.renderBufferDirect(A,null,D,d,x,null)}function y(R,A,D,V){let v=null;const S=D.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(S!==void 0)v=S;else if(v=D.isPointLight===!0?c:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const F=v.uuid,z=A.uuid;let H=l[F];H===void 0&&(H={},l[F]=H);let J=H[z];J===void 0&&(J=v.clone(),H[z]=J,A.addEventListener("dispose",L)),v=J}if(v.visible=A.visible,v.wireframe=A.wireframe,V===Pn?v.side=A.shadowSide!==null?A.shadowSide:A.side:v.side=A.shadowSide!==null?A.shadowSide:f[A.side],v.alphaMap=A.alphaMap,v.alphaTest=A.alphaTest,v.map=A.map,v.clipShadows=A.clipShadows,v.clippingPlanes=A.clippingPlanes,v.clipIntersection=A.clipIntersection,v.displacementMap=A.displacementMap,v.displacementScale=A.displacementScale,v.displacementBias=A.displacementBias,v.wireframeLinewidth=A.wireframeLinewidth,v.linewidth=A.linewidth,D.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const F=n.properties.get(v);F.light=D}return v}function _(R,A,D,V,v){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&v===Pn)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,R.matrixWorld);const z=t.update(R),H=R.material;if(Array.isArray(H)){const J=z.groups;for(let G=0,Q=J.length;G<Q;G++){const X=J[G],ut=H[X.materialIndex];if(ut&&ut.visible){const pt=y(R,ut,V,v);R.onBeforeShadow(n,R,A,D,z,pt,X),n.renderBufferDirect(D,null,z,pt,R,X),R.onAfterShadow(n,R,A,D,z,pt,X)}}}else if(H.visible){const J=y(R,H,V,v);R.onBeforeShadow(n,R,A,D,z,J,null),n.renderBufferDirect(D,null,z,J,R,null),R.onAfterShadow(n,R,A,D,z,J,null)}}const F=R.children;for(let z=0,H=F.length;z<H;z++)_(F[z],A,D,V,v)}function L(R){R.target.removeEventListener("dispose",L);for(const D in l){const V=l[D],v=R.target.uuid;v in V&&(V[v].dispose(),delete V[v])}}}const Dg={[Ho]:Vo,[Wo]:qo,[Xo]:Ko,[$i]:Yo,[Vo]:Ho,[qo]:Wo,[Ko]:Xo,[Yo]:$i};function Ug(n){function t(){let I=!1;const _t=new oe;let W=null;const j=new oe(0,0,0,0);return{setMask:function(ft){W!==ft&&!I&&(n.colorMask(ft,ft,ft,ft),W=ft)},setLocked:function(ft){I=ft},setClear:function(ft,vt,$t,ye,ze){ze===!0&&(ft*=ye,vt*=ye,$t*=ye),_t.set(ft,vt,$t,ye),j.equals(_t)===!1&&(n.clearColor(ft,vt,$t,ye),j.copy(_t))},reset:function(){I=!1,W=null,j.set(-1,0,0,0)}}}function e(){let I=!1,_t=!1,W=null,j=null,ft=null;return{setReversed:function(vt){_t=vt},setTest:function(vt){vt?St(n.DEPTH_TEST):ht(n.DEPTH_TEST)},setMask:function(vt){W!==vt&&!I&&(n.depthMask(vt),W=vt)},setFunc:function(vt){if(_t&&(vt=Dg[vt]),j!==vt){switch(vt){case Ho:n.depthFunc(n.NEVER);break;case Vo:n.depthFunc(n.ALWAYS);break;case Wo:n.depthFunc(n.LESS);break;case $i:n.depthFunc(n.LEQUAL);break;case Xo:n.depthFunc(n.EQUAL);break;case Yo:n.depthFunc(n.GEQUAL);break;case qo:n.depthFunc(n.GREATER);break;case Ko:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}j=vt}},setLocked:function(vt){I=vt},setClear:function(vt){ft!==vt&&(n.clearDepth(vt),ft=vt)},reset:function(){I=!1,W=null,j=null,ft=null}}}function i(){let I=!1,_t=null,W=null,j=null,ft=null,vt=null,$t=null,ye=null,ze=null;return{setTest:function(ee){I||(ee?St(n.STENCIL_TEST):ht(n.STENCIL_TEST))},setMask:function(ee){_t!==ee&&!I&&(n.stencilMask(ee),_t=ee)},setFunc:function(ee,Be,wn){(W!==ee||j!==Be||ft!==wn)&&(n.stencilFunc(ee,Be,wn),W=ee,j=Be,ft=wn)},setOp:function(ee,Be,wn){(vt!==ee||$t!==Be||ye!==wn)&&(n.stencilOp(ee,Be,wn),vt=ee,$t=Be,ye=wn)},setLocked:function(ee){I=ee},setClear:function(ee){ze!==ee&&(n.clearStencil(ee),ze=ee)},reset:function(){I=!1,_t=null,W=null,j=null,ft=null,vt=null,$t=null,ye=null,ze=null}}}const s=new t,r=new e,o=new i,a=new WeakMap,c=new WeakMap;let l={},h={},f=new WeakMap,u=[],d=null,g=!1,x=null,p=null,m=null,w=null,y=null,_=null,L=null,R=new Nt(0,0,0),A=0,D=!1,V=null,v=null,S=null,F=null,z=null;const H=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let J=!1,G=0;const Q=n.getParameter(n.VERSION);Q.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(Q)[1]),J=G>=1):Q.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),J=G>=2);let X=null,ut={};const pt=n.getParameter(n.SCISSOR_BOX),mt=n.getParameter(n.VIEWPORT),Kt=new oe().fromArray(pt),jt=new oe().fromArray(mt);function Y(I,_t,W,j){const ft=new Uint8Array(4),vt=n.createTexture();n.bindTexture(I,vt),n.texParameteri(I,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(I,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let $t=0;$t<W;$t++)I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY?n.texImage3D(_t,0,n.RGBA,1,1,j,0,n.RGBA,n.UNSIGNED_BYTE,ft):n.texImage2D(_t+$t,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ft);return vt}const et={};et[n.TEXTURE_2D]=Y(n.TEXTURE_2D,n.TEXTURE_2D,1),et[n.TEXTURE_CUBE_MAP]=Y(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[n.TEXTURE_2D_ARRAY]=Y(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),et[n.TEXTURE_3D]=Y(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),o.setClear(0),St(n.DEPTH_TEST),r.setFunc($i),st(!1),tt(bc),St(n.CULL_FACE),T(jn);function St(I){l[I]!==!0&&(n.enable(I),l[I]=!0)}function ht(I){l[I]!==!1&&(n.disable(I),l[I]=!1)}function Ot(I,_t){return h[I]!==_t?(n.bindFramebuffer(I,_t),h[I]=_t,I===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=_t),I===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=_t),!0):!1}function Ut(I,_t){let W=u,j=!1;if(I){W=f.get(_t),W===void 0&&(W=[],f.set(_t,W));const ft=I.textures;if(W.length!==ft.length||W[0]!==n.COLOR_ATTACHMENT0){for(let vt=0,$t=ft.length;vt<$t;vt++)W[vt]=n.COLOR_ATTACHMENT0+vt;W.length=ft.length,j=!0}}else W[0]!==n.BACK&&(W[0]=n.BACK,j=!0);j&&n.drawBuffers(W)}function Gt(I){return d!==I?(n.useProgram(I),d=I,!0):!1}const qt={[gi]:n.FUNC_ADD,[Uu]:n.FUNC_SUBTRACT,[Nu]:n.FUNC_REVERSE_SUBTRACT};qt[Ou]=n.MIN,qt[Fu]=n.MAX;const Z={[zu]:n.ZERO,[Bu]:n.ONE,[ku]:n.SRC_COLOR,[ko]:n.SRC_ALPHA,[Yu]:n.SRC_ALPHA_SATURATE,[Wu]:n.DST_COLOR,[Hu]:n.DST_ALPHA,[Gu]:n.ONE_MINUS_SRC_COLOR,[Go]:n.ONE_MINUS_SRC_ALPHA,[Xu]:n.ONE_MINUS_DST_COLOR,[Vu]:n.ONE_MINUS_DST_ALPHA,[qu]:n.CONSTANT_COLOR,[Ku]:n.ONE_MINUS_CONSTANT_COLOR,[Ju]:n.CONSTANT_ALPHA,[Zu]:n.ONE_MINUS_CONSTANT_ALPHA};function T(I,_t,W,j,ft,vt,$t,ye,ze,ee){if(I===jn){g===!0&&(ht(n.BLEND),g=!1);return}if(g===!1&&(St(n.BLEND),g=!0),I!==Du){if(I!==x||ee!==D){if((p!==gi||y!==gi)&&(n.blendEquation(n.FUNC_ADD),p=gi,y=gi),ee)switch(I){case Yi:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case vn:n.blendFunc(n.ONE,n.ONE);break;case Tc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ac:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Yi:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case vn:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Tc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ac:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}m=null,w=null,_=null,L=null,R.set(0,0,0),A=0,x=I,D=ee}return}ft=ft||_t,vt=vt||W,$t=$t||j,(_t!==p||ft!==y)&&(n.blendEquationSeparate(qt[_t],qt[ft]),p=_t,y=ft),(W!==m||j!==w||vt!==_||$t!==L)&&(n.blendFuncSeparate(Z[W],Z[j],Z[vt],Z[$t]),m=W,w=j,_=vt,L=$t),(ye.equals(R)===!1||ze!==A)&&(n.blendColor(ye.r,ye.g,ye.b,ze),R.copy(ye),A=ze),x=I,D=!1}function ot(I,_t){I.side===_n?ht(n.CULL_FACE):St(n.CULL_FACE);let W=I.side===Ge;_t&&(W=!W),st(W),I.blending===Yi&&I.transparent===!1?T(jn):T(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),r.setFunc(I.depthFunc),r.setTest(I.depthTest),r.setMask(I.depthWrite),s.setMask(I.colorWrite);const j=I.stencilWrite;o.setTest(j),j&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Pt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?St(n.SAMPLE_ALPHA_TO_COVERAGE):ht(n.SAMPLE_ALPHA_TO_COVERAGE)}function st(I){V!==I&&(I?n.frontFace(n.CW):n.frontFace(n.CCW),V=I)}function tt(I){I!==Lu?(St(n.CULL_FACE),I!==v&&(I===bc?n.cullFace(n.BACK):I===Iu?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ht(n.CULL_FACE),v=I}function at(I){I!==S&&(J&&n.lineWidth(I),S=I)}function Pt(I,_t,W){I?(St(n.POLYGON_OFFSET_FILL),(F!==_t||z!==W)&&(n.polygonOffset(_t,W),F=_t,z=W)):ht(n.POLYGON_OFFSET_FILL)}function gt(I){I?St(n.SCISSOR_TEST):ht(n.SCISSOR_TEST)}function b(I){I===void 0&&(I=n.TEXTURE0+H-1),X!==I&&(n.activeTexture(I),X=I)}function M(I,_t,W){W===void 0&&(X===null?W=n.TEXTURE0+H-1:W=X);let j=ut[W];j===void 0&&(j={type:void 0,texture:void 0},ut[W]=j),(j.type!==I||j.texture!==_t)&&(X!==W&&(n.activeTexture(W),X=W),n.bindTexture(I,_t||et[I]),j.type=I,j.texture=_t)}function O(){const I=ut[X];I!==void 0&&I.type!==void 0&&(n.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function q(){try{n.compressedTexImage2D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function $(){try{n.compressedTexImage3D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{n.texSubImage2D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function bt(){try{n.texSubImage3D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ct(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function xt(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Jt(){try{n.texStorage2D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function nt(){try{n.texStorage3D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Mt(){try{n.texImage2D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Bt(){try{n.texImage3D.apply(n,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function kt(I){Kt.equals(I)===!1&&(n.scissor(I.x,I.y,I.z,I.w),Kt.copy(I))}function yt(I){jt.equals(I)===!1&&(n.viewport(I.x,I.y,I.z,I.w),jt.copy(I))}function Zt(I,_t){let W=c.get(_t);W===void 0&&(W=new WeakMap,c.set(_t,W));let j=W.get(I);j===void 0&&(j=n.getUniformBlockIndex(_t,I.name),W.set(I,j))}function Ht(I,_t){const j=c.get(_t).get(I);a.get(_t)!==j&&(n.uniformBlockBinding(_t,j,I.__bindingPointIndex),a.set(_t,j))}function ae(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),l={},X=null,ut={},h={},f=new WeakMap,u=[],d=null,g=!1,x=null,p=null,m=null,w=null,y=null,_=null,L=null,R=new Nt(0,0,0),A=0,D=!1,V=null,v=null,S=null,F=null,z=null,Kt.set(0,0,n.canvas.width,n.canvas.height),jt.set(0,0,n.canvas.width,n.canvas.height),s.reset(),r.reset(),o.reset()}return{buffers:{color:s,depth:r,stencil:o},enable:St,disable:ht,bindFramebuffer:Ot,drawBuffers:Ut,useProgram:Gt,setBlending:T,setMaterial:ot,setFlipSided:st,setCullFace:tt,setLineWidth:at,setPolygonOffset:Pt,setScissorTest:gt,activeTexture:b,bindTexture:M,unbindTexture:O,compressedTexImage2D:q,compressedTexImage3D:$,texImage2D:Mt,texImage3D:Bt,updateUBOMapping:Zt,uniformBlockBinding:Ht,texStorage2D:Jt,texStorage3D:nt,texSubImage2D:K,texSubImage3D:bt,compressedTexSubImage2D:ct,compressedTexSubImage3D:xt,scissor:kt,viewport:yt,reset:ae}}function vl(n,t,e,i){const s=Ng(i);switch(e){case dh:return n*t;case mh:return n*t;case gh:return n*t*2;case _h:return n*t/s.components*s.byteLength;case Ya:return n*t/s.components*s.byteLength;case vh:return n*t*2/s.components*s.byteLength;case qa:return n*t*2/s.components*s.byteLength;case ph:return n*t*3/s.components*s.byteLength;case fn:return n*t*4/s.components*s.byteLength;case Ka:return n*t*4/s.components*s.byteLength;case gr:case _r:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case vr:case xr:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Qo:case ea:return Math.max(n,16)*Math.max(t,8)/4;case jo:case ta:return Math.max(n,8)*Math.max(t,8)/2;case na:case ia:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case sa:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case ra:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case oa:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case aa:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case ca:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case la:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case ha:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case ua:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case fa:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case da:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case pa:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case ma:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case ga:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case _a:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case va:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case Mr:case xa:case Ma:return Math.ceil(n/4)*Math.ceil(t/4)*16;case xh:case Sa:return Math.ceil(n/4)*Math.ceil(t/4)*8;case ya:case Ea:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Ng(n){switch(n){case On:case hh:return{byteLength:1,components:1};case Rs:case uh:case rs:return{byteLength:2,components:1};case Wa:case Xa:return{byteLength:2,components:4};case Mi:case Va:case Dn:return{byteLength:4,components:1};case fh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function Og(n,t,e,i,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new rt,h=new WeakMap;let f;const u=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(b,M){return d?new OffscreenCanvas(b,M):Dr("canvas")}function x(b,M,O){let q=1;const $=gt(b);if(($.width>O||$.height>O)&&(q=O/Math.max($.width,$.height)),q<1)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){const K=Math.floor(q*$.width),bt=Math.floor(q*$.height);f===void 0&&(f=g(K,bt));const ct=M?g(K,bt):f;return ct.width=K,ct.height=bt,ct.getContext("2d").drawImage(b,0,0,K,bt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+K+"x"+bt+")."),ct}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),b;return b}function p(b){return b.generateMipmaps&&b.minFilter!==Qe&&b.minFilter!==hn}function m(b){n.generateMipmap(b)}function w(b,M,O,q,$=!1){if(b!==null){if(n[b]!==void 0)return n[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let K=M;if(M===n.RED&&(O===n.FLOAT&&(K=n.R32F),O===n.HALF_FLOAT&&(K=n.R16F),O===n.UNSIGNED_BYTE&&(K=n.R8)),M===n.RED_INTEGER&&(O===n.UNSIGNED_BYTE&&(K=n.R8UI),O===n.UNSIGNED_SHORT&&(K=n.R16UI),O===n.UNSIGNED_INT&&(K=n.R32UI),O===n.BYTE&&(K=n.R8I),O===n.SHORT&&(K=n.R16I),O===n.INT&&(K=n.R32I)),M===n.RG&&(O===n.FLOAT&&(K=n.RG32F),O===n.HALF_FLOAT&&(K=n.RG16F),O===n.UNSIGNED_BYTE&&(K=n.RG8)),M===n.RG_INTEGER&&(O===n.UNSIGNED_BYTE&&(K=n.RG8UI),O===n.UNSIGNED_SHORT&&(K=n.RG16UI),O===n.UNSIGNED_INT&&(K=n.RG32UI),O===n.BYTE&&(K=n.RG8I),O===n.SHORT&&(K=n.RG16I),O===n.INT&&(K=n.RG32I)),M===n.RGB_INTEGER&&(O===n.UNSIGNED_BYTE&&(K=n.RGB8UI),O===n.UNSIGNED_SHORT&&(K=n.RGB16UI),O===n.UNSIGNED_INT&&(K=n.RGB32UI),O===n.BYTE&&(K=n.RGB8I),O===n.SHORT&&(K=n.RGB16I),O===n.INT&&(K=n.RGB32I)),M===n.RGBA_INTEGER&&(O===n.UNSIGNED_BYTE&&(K=n.RGBA8UI),O===n.UNSIGNED_SHORT&&(K=n.RGBA16UI),O===n.UNSIGNED_INT&&(K=n.RGBA32UI),O===n.BYTE&&(K=n.RGBA8I),O===n.SHORT&&(K=n.RGBA16I),O===n.INT&&(K=n.RGBA32I)),M===n.RGB&&O===n.UNSIGNED_INT_5_9_9_9_REV&&(K=n.RGB9_E5),M===n.RGBA){const bt=$?Cr:se.getTransfer(q);O===n.FLOAT&&(K=n.RGBA32F),O===n.HALF_FLOAT&&(K=n.RGBA16F),O===n.UNSIGNED_BYTE&&(K=bt===ue?n.SRGB8_ALPHA8:n.RGBA8),O===n.UNSIGNED_SHORT_4_4_4_4&&(K=n.RGBA4),O===n.UNSIGNED_SHORT_5_5_5_1&&(K=n.RGB5_A1)}return(K===n.R16F||K===n.R32F||K===n.RG16F||K===n.RG32F||K===n.RGBA16F||K===n.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function y(b,M){let O;return b?M===null||M===Mi||M===ts?O=n.DEPTH24_STENCIL8:M===Dn?O=n.DEPTH32F_STENCIL8:M===Rs&&(O=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Mi||M===ts?O=n.DEPTH_COMPONENT24:M===Dn?O=n.DEPTH_COMPONENT32F:M===Rs&&(O=n.DEPTH_COMPONENT16),O}function _(b,M){return p(b)===!0||b.isFramebufferTexture&&b.minFilter!==Qe&&b.minFilter!==hn?Math.log2(Math.max(M.width,M.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?M.mipmaps.length:1}function L(b){const M=b.target;M.removeEventListener("dispose",L),A(M),M.isVideoTexture&&h.delete(M)}function R(b){const M=b.target;M.removeEventListener("dispose",R),V(M)}function A(b){const M=i.get(b);if(M.__webglInit===void 0)return;const O=b.source,q=u.get(O);if(q){const $=q[M.__cacheKey];$.usedTimes--,$.usedTimes===0&&D(b),Object.keys(q).length===0&&u.delete(O)}i.remove(b)}function D(b){const M=i.get(b);n.deleteTexture(M.__webglTexture);const O=b.source,q=u.get(O);delete q[M.__cacheKey],o.memory.textures--}function V(b){const M=i.get(b);if(b.depthTexture&&b.depthTexture.dispose(),b.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(M.__webglFramebuffer[q]))for(let $=0;$<M.__webglFramebuffer[q].length;$++)n.deleteFramebuffer(M.__webglFramebuffer[q][$]);else n.deleteFramebuffer(M.__webglFramebuffer[q]);M.__webglDepthbuffer&&n.deleteRenderbuffer(M.__webglDepthbuffer[q])}else{if(Array.isArray(M.__webglFramebuffer))for(let q=0;q<M.__webglFramebuffer.length;q++)n.deleteFramebuffer(M.__webglFramebuffer[q]);else n.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&n.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&n.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let q=0;q<M.__webglColorRenderbuffer.length;q++)M.__webglColorRenderbuffer[q]&&n.deleteRenderbuffer(M.__webglColorRenderbuffer[q]);M.__webglDepthRenderbuffer&&n.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const O=b.textures;for(let q=0,$=O.length;q<$;q++){const K=i.get(O[q]);K.__webglTexture&&(n.deleteTexture(K.__webglTexture),o.memory.textures--),i.remove(O[q])}i.remove(b)}let v=0;function S(){v=0}function F(){const b=v;return b>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+s.maxTextures),v+=1,b}function z(b){const M=[];return M.push(b.wrapS),M.push(b.wrapT),M.push(b.wrapR||0),M.push(b.magFilter),M.push(b.minFilter),M.push(b.anisotropy),M.push(b.internalFormat),M.push(b.format),M.push(b.type),M.push(b.generateMipmaps),M.push(b.premultiplyAlpha),M.push(b.flipY),M.push(b.unpackAlignment),M.push(b.colorSpace),M.join()}function H(b,M){const O=i.get(b);if(b.isVideoTexture&&at(b),b.isRenderTargetTexture===!1&&b.version>0&&O.__version!==b.version){const q=b.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{jt(O,b,M);return}}e.bindTexture(n.TEXTURE_2D,O.__webglTexture,n.TEXTURE0+M)}function J(b,M){const O=i.get(b);if(b.version>0&&O.__version!==b.version){jt(O,b,M);return}e.bindTexture(n.TEXTURE_2D_ARRAY,O.__webglTexture,n.TEXTURE0+M)}function G(b,M){const O=i.get(b);if(b.version>0&&O.__version!==b.version){jt(O,b,M);return}e.bindTexture(n.TEXTURE_3D,O.__webglTexture,n.TEXTURE0+M)}function Q(b,M){const O=i.get(b);if(b.version>0&&O.__version!==b.version){Y(O,b,M);return}e.bindTexture(n.TEXTURE_CUBE_MAP,O.__webglTexture,n.TEXTURE0+M)}const X={[Rr]:n.REPEAT,[vi]:n.CLAMP_TO_EDGE,[$o]:n.MIRRORED_REPEAT},ut={[Qe]:n.NEAREST,[af]:n.NEAREST_MIPMAP_NEAREST,[ks]:n.NEAREST_MIPMAP_LINEAR,[hn]:n.LINEAR,[eo]:n.LINEAR_MIPMAP_NEAREST,[xi]:n.LINEAR_MIPMAP_LINEAR},pt={[uf]:n.NEVER,[_f]:n.ALWAYS,[ff]:n.LESS,[Sh]:n.LEQUAL,[df]:n.EQUAL,[gf]:n.GEQUAL,[pf]:n.GREATER,[mf]:n.NOTEQUAL};function mt(b,M){if(M.type===Dn&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===hn||M.magFilter===eo||M.magFilter===ks||M.magFilter===xi||M.minFilter===hn||M.minFilter===eo||M.minFilter===ks||M.minFilter===xi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(b,n.TEXTURE_WRAP_S,X[M.wrapS]),n.texParameteri(b,n.TEXTURE_WRAP_T,X[M.wrapT]),(b===n.TEXTURE_3D||b===n.TEXTURE_2D_ARRAY)&&n.texParameteri(b,n.TEXTURE_WRAP_R,X[M.wrapR]),n.texParameteri(b,n.TEXTURE_MAG_FILTER,ut[M.magFilter]),n.texParameteri(b,n.TEXTURE_MIN_FILTER,ut[M.minFilter]),M.compareFunction&&(n.texParameteri(b,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(b,n.TEXTURE_COMPARE_FUNC,pt[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Qe||M.minFilter!==ks&&M.minFilter!==xi||M.type===Dn&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||i.get(M).__currentAnisotropy){const O=t.get("EXT_texture_filter_anisotropic");n.texParameterf(b,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy}}}function Kt(b,M){let O=!1;b.__webglInit===void 0&&(b.__webglInit=!0,M.addEventListener("dispose",L));const q=M.source;let $=u.get(q);$===void 0&&($={},u.set(q,$));const K=z(M);if(K!==b.__cacheKey){$[K]===void 0&&($[K]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,O=!0),$[K].usedTimes++;const bt=$[b.__cacheKey];bt!==void 0&&($[b.__cacheKey].usedTimes--,bt.usedTimes===0&&D(M)),b.__cacheKey=K,b.__webglTexture=$[K].texture}return O}function jt(b,M,O){let q=n.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(q=n.TEXTURE_2D_ARRAY),M.isData3DTexture&&(q=n.TEXTURE_3D);const $=Kt(b,M),K=M.source;e.bindTexture(q,b.__webglTexture,n.TEXTURE0+O);const bt=i.get(K);if(K.version!==bt.__version||$===!0){e.activeTexture(n.TEXTURE0+O);const ct=se.getPrimaries(se.workingColorSpace),xt=M.colorSpace===qn?null:se.getPrimaries(M.colorSpace),Jt=M.colorSpace===qn||ct===xt?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,M.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,M.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Jt);let nt=x(M.image,!1,s.maxTextureSize);nt=Pt(M,nt);const Mt=r.convert(M.format,M.colorSpace),Bt=r.convert(M.type);let kt=w(M.internalFormat,Mt,Bt,M.colorSpace,M.isVideoTexture);mt(q,M);let yt;const Zt=M.mipmaps,Ht=M.isVideoTexture!==!0,ae=bt.__version===void 0||$===!0,I=K.dataReady,_t=_(M,nt);if(M.isDepthTexture)kt=y(M.format===es,M.type),ae&&(Ht?e.texStorage2D(n.TEXTURE_2D,1,kt,nt.width,nt.height):e.texImage2D(n.TEXTURE_2D,0,kt,nt.width,nt.height,0,Mt,Bt,null));else if(M.isDataTexture)if(Zt.length>0){Ht&&ae&&e.texStorage2D(n.TEXTURE_2D,_t,kt,Zt[0].width,Zt[0].height);for(let W=0,j=Zt.length;W<j;W++)yt=Zt[W],Ht?I&&e.texSubImage2D(n.TEXTURE_2D,W,0,0,yt.width,yt.height,Mt,Bt,yt.data):e.texImage2D(n.TEXTURE_2D,W,kt,yt.width,yt.height,0,Mt,Bt,yt.data);M.generateMipmaps=!1}else Ht?(ae&&e.texStorage2D(n.TEXTURE_2D,_t,kt,nt.width,nt.height),I&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,nt.width,nt.height,Mt,Bt,nt.data)):e.texImage2D(n.TEXTURE_2D,0,kt,nt.width,nt.height,0,Mt,Bt,nt.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Ht&&ae&&e.texStorage3D(n.TEXTURE_2D_ARRAY,_t,kt,Zt[0].width,Zt[0].height,nt.depth);for(let W=0,j=Zt.length;W<j;W++)if(yt=Zt[W],M.format!==fn)if(Mt!==null)if(Ht){if(I)if(M.layerUpdates.size>0){const ft=vl(yt.width,yt.height,M.format,M.type);for(const vt of M.layerUpdates){const $t=yt.data.subarray(vt*ft/yt.data.BYTES_PER_ELEMENT,(vt+1)*ft/yt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,vt,yt.width,yt.height,1,Mt,$t,0,0)}M.clearLayerUpdates()}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,0,yt.width,yt.height,nt.depth,Mt,yt.data,0,0)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,W,kt,yt.width,yt.height,nt.depth,0,yt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ht?I&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,0,yt.width,yt.height,nt.depth,Mt,Bt,yt.data):e.texImage3D(n.TEXTURE_2D_ARRAY,W,kt,yt.width,yt.height,nt.depth,0,Mt,Bt,yt.data)}else{Ht&&ae&&e.texStorage2D(n.TEXTURE_2D,_t,kt,Zt[0].width,Zt[0].height);for(let W=0,j=Zt.length;W<j;W++)yt=Zt[W],M.format!==fn?Mt!==null?Ht?I&&e.compressedTexSubImage2D(n.TEXTURE_2D,W,0,0,yt.width,yt.height,Mt,yt.data):e.compressedTexImage2D(n.TEXTURE_2D,W,kt,yt.width,yt.height,0,yt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ht?I&&e.texSubImage2D(n.TEXTURE_2D,W,0,0,yt.width,yt.height,Mt,Bt,yt.data):e.texImage2D(n.TEXTURE_2D,W,kt,yt.width,yt.height,0,Mt,Bt,yt.data)}else if(M.isDataArrayTexture)if(Ht){if(ae&&e.texStorage3D(n.TEXTURE_2D_ARRAY,_t,kt,nt.width,nt.height,nt.depth),I)if(M.layerUpdates.size>0){const W=vl(nt.width,nt.height,M.format,M.type);for(const j of M.layerUpdates){const ft=nt.data.subarray(j*W/nt.data.BYTES_PER_ELEMENT,(j+1)*W/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,j,nt.width,nt.height,1,Mt,Bt,ft)}M.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,Mt,Bt,nt.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,kt,nt.width,nt.height,nt.depth,0,Mt,Bt,nt.data);else if(M.isData3DTexture)Ht?(ae&&e.texStorage3D(n.TEXTURE_3D,_t,kt,nt.width,nt.height,nt.depth),I&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,Mt,Bt,nt.data)):e.texImage3D(n.TEXTURE_3D,0,kt,nt.width,nt.height,nt.depth,0,Mt,Bt,nt.data);else if(M.isFramebufferTexture){if(ae)if(Ht)e.texStorage2D(n.TEXTURE_2D,_t,kt,nt.width,nt.height);else{let W=nt.width,j=nt.height;for(let ft=0;ft<_t;ft++)e.texImage2D(n.TEXTURE_2D,ft,kt,W,j,0,Mt,Bt,null),W>>=1,j>>=1}}else if(Zt.length>0){if(Ht&&ae){const W=gt(Zt[0]);e.texStorage2D(n.TEXTURE_2D,_t,kt,W.width,W.height)}for(let W=0,j=Zt.length;W<j;W++)yt=Zt[W],Ht?I&&e.texSubImage2D(n.TEXTURE_2D,W,0,0,Mt,Bt,yt):e.texImage2D(n.TEXTURE_2D,W,kt,Mt,Bt,yt);M.generateMipmaps=!1}else if(Ht){if(ae){const W=gt(nt);e.texStorage2D(n.TEXTURE_2D,_t,kt,W.width,W.height)}I&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,Mt,Bt,nt)}else e.texImage2D(n.TEXTURE_2D,0,kt,Mt,Bt,nt);p(M)&&m(q),bt.__version=K.version,M.onUpdate&&M.onUpdate(M)}b.__version=M.version}function Y(b,M,O){if(M.image.length!==6)return;const q=Kt(b,M),$=M.source;e.bindTexture(n.TEXTURE_CUBE_MAP,b.__webglTexture,n.TEXTURE0+O);const K=i.get($);if($.version!==K.__version||q===!0){e.activeTexture(n.TEXTURE0+O);const bt=se.getPrimaries(se.workingColorSpace),ct=M.colorSpace===qn?null:se.getPrimaries(M.colorSpace),xt=M.colorSpace===qn||bt===ct?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,M.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,M.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,xt);const Jt=M.isCompressedTexture||M.image[0].isCompressedTexture,nt=M.image[0]&&M.image[0].isDataTexture,Mt=[];for(let j=0;j<6;j++)!Jt&&!nt?Mt[j]=x(M.image[j],!0,s.maxCubemapSize):Mt[j]=nt?M.image[j].image:M.image[j],Mt[j]=Pt(M,Mt[j]);const Bt=Mt[0],kt=r.convert(M.format,M.colorSpace),yt=r.convert(M.type),Zt=w(M.internalFormat,kt,yt,M.colorSpace),Ht=M.isVideoTexture!==!0,ae=K.__version===void 0||q===!0,I=$.dataReady;let _t=_(M,Bt);mt(n.TEXTURE_CUBE_MAP,M);let W;if(Jt){Ht&&ae&&e.texStorage2D(n.TEXTURE_CUBE_MAP,_t,Zt,Bt.width,Bt.height);for(let j=0;j<6;j++){W=Mt[j].mipmaps;for(let ft=0;ft<W.length;ft++){const vt=W[ft];M.format!==fn?kt!==null?Ht?I&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft,0,0,vt.width,vt.height,kt,vt.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft,Zt,vt.width,vt.height,0,vt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ht?I&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft,0,0,vt.width,vt.height,kt,yt,vt.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft,Zt,vt.width,vt.height,0,kt,yt,vt.data)}}}else{if(W=M.mipmaps,Ht&&ae){W.length>0&&_t++;const j=gt(Mt[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,_t,Zt,j.width,j.height)}for(let j=0;j<6;j++)if(nt){Ht?I&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Mt[j].width,Mt[j].height,kt,yt,Mt[j].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Zt,Mt[j].width,Mt[j].height,0,kt,yt,Mt[j].data);for(let ft=0;ft<W.length;ft++){const $t=W[ft].image[j].image;Ht?I&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft+1,0,0,$t.width,$t.height,kt,yt,$t.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft+1,Zt,$t.width,$t.height,0,kt,yt,$t.data)}}else{Ht?I&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,kt,yt,Mt[j]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Zt,kt,yt,Mt[j]);for(let ft=0;ft<W.length;ft++){const vt=W[ft];Ht?I&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft+1,0,0,kt,yt,vt.image[j]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ft+1,Zt,kt,yt,vt.image[j])}}}p(M)&&m(n.TEXTURE_CUBE_MAP),K.__version=$.version,M.onUpdate&&M.onUpdate(M)}b.__version=M.version}function et(b,M,O,q,$,K){const bt=r.convert(O.format,O.colorSpace),ct=r.convert(O.type),xt=w(O.internalFormat,bt,ct,O.colorSpace);if(!i.get(M).__hasExternalTextures){const nt=Math.max(1,M.width>>K),Mt=Math.max(1,M.height>>K);$===n.TEXTURE_3D||$===n.TEXTURE_2D_ARRAY?e.texImage3D($,K,xt,nt,Mt,M.depth,0,bt,ct,null):e.texImage2D($,K,xt,nt,Mt,0,bt,ct,null)}e.bindFramebuffer(n.FRAMEBUFFER,b),tt(M)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,q,$,i.get(O).__webglTexture,0,st(M)):($===n.TEXTURE_2D||$>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,q,$,i.get(O).__webglTexture,K),e.bindFramebuffer(n.FRAMEBUFFER,null)}function St(b,M,O){if(n.bindRenderbuffer(n.RENDERBUFFER,b),M.depthBuffer){const q=M.depthTexture,$=q&&q.isDepthTexture?q.type:null,K=y(M.stencilBuffer,$),bt=M.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ct=st(M);tt(M)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ct,K,M.width,M.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,ct,K,M.width,M.height):n.renderbufferStorage(n.RENDERBUFFER,K,M.width,M.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,bt,n.RENDERBUFFER,b)}else{const q=M.textures;for(let $=0;$<q.length;$++){const K=q[$],bt=r.convert(K.format,K.colorSpace),ct=r.convert(K.type),xt=w(K.internalFormat,bt,ct,K.colorSpace),Jt=st(M);O&&tt(M)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Jt,xt,M.width,M.height):tt(M)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Jt,xt,M.width,M.height):n.renderbufferStorage(n.RENDERBUFFER,xt,M.width,M.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ht(b,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(n.FRAMEBUFFER,b),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(M.depthTexture).__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),H(M.depthTexture,0);const q=i.get(M.depthTexture).__webglTexture,$=st(M);if(M.depthTexture.format===qi)tt(M)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,q,0,$):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,q,0);else if(M.depthTexture.format===es)tt(M)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,q,0,$):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,q,0);else throw new Error("Unknown depthTexture format")}function Ot(b){const M=i.get(b),O=b.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==b.depthTexture){const q=b.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),q){const $=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,q.removeEventListener("dispose",$)};q.addEventListener("dispose",$),M.__depthDisposeCallback=$}M.__boundDepthTexture=q}if(b.depthTexture&&!M.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");ht(M.__webglFramebuffer,b)}else if(O){M.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(e.bindFramebuffer(n.FRAMEBUFFER,M.__webglFramebuffer[q]),M.__webglDepthbuffer[q]===void 0)M.__webglDepthbuffer[q]=n.createRenderbuffer(),St(M.__webglDepthbuffer[q],b,!1);else{const $=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,K=M.__webglDepthbuffer[q];n.bindRenderbuffer(n.RENDERBUFFER,K),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,K)}}else if(e.bindFramebuffer(n.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=n.createRenderbuffer(),St(M.__webglDepthbuffer,b,!1);else{const q=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,$=M.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,$),n.framebufferRenderbuffer(n.FRAMEBUFFER,q,n.RENDERBUFFER,$)}e.bindFramebuffer(n.FRAMEBUFFER,null)}function Ut(b,M,O){const q=i.get(b);M!==void 0&&et(q.__webglFramebuffer,b,b.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),O!==void 0&&Ot(b)}function Gt(b){const M=b.texture,O=i.get(b),q=i.get(M);b.addEventListener("dispose",R);const $=b.textures,K=b.isWebGLCubeRenderTarget===!0,bt=$.length>1;if(bt||(q.__webglTexture===void 0&&(q.__webglTexture=n.createTexture()),q.__version=M.version,o.memory.textures++),K){O.__webglFramebuffer=[];for(let ct=0;ct<6;ct++)if(M.mipmaps&&M.mipmaps.length>0){O.__webglFramebuffer[ct]=[];for(let xt=0;xt<M.mipmaps.length;xt++)O.__webglFramebuffer[ct][xt]=n.createFramebuffer()}else O.__webglFramebuffer[ct]=n.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){O.__webglFramebuffer=[];for(let ct=0;ct<M.mipmaps.length;ct++)O.__webglFramebuffer[ct]=n.createFramebuffer()}else O.__webglFramebuffer=n.createFramebuffer();if(bt)for(let ct=0,xt=$.length;ct<xt;ct++){const Jt=i.get($[ct]);Jt.__webglTexture===void 0&&(Jt.__webglTexture=n.createTexture(),o.memory.textures++)}if(b.samples>0&&tt(b)===!1){O.__webglMultisampledFramebuffer=n.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ct=0;ct<$.length;ct++){const xt=$[ct];O.__webglColorRenderbuffer[ct]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,O.__webglColorRenderbuffer[ct]);const Jt=r.convert(xt.format,xt.colorSpace),nt=r.convert(xt.type),Mt=w(xt.internalFormat,Jt,nt,xt.colorSpace,b.isXRRenderTarget===!0),Bt=st(b);n.renderbufferStorageMultisample(n.RENDERBUFFER,Bt,Mt,b.width,b.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ct,n.RENDERBUFFER,O.__webglColorRenderbuffer[ct])}n.bindRenderbuffer(n.RENDERBUFFER,null),b.depthBuffer&&(O.__webglDepthRenderbuffer=n.createRenderbuffer(),St(O.__webglDepthRenderbuffer,b,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(K){e.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture),mt(n.TEXTURE_CUBE_MAP,M);for(let ct=0;ct<6;ct++)if(M.mipmaps&&M.mipmaps.length>0)for(let xt=0;xt<M.mipmaps.length;xt++)et(O.__webglFramebuffer[ct][xt],b,M,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ct,xt);else et(O.__webglFramebuffer[ct],b,M,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0);p(M)&&m(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(bt){for(let ct=0,xt=$.length;ct<xt;ct++){const Jt=$[ct],nt=i.get(Jt);e.bindTexture(n.TEXTURE_2D,nt.__webglTexture),mt(n.TEXTURE_2D,Jt),et(O.__webglFramebuffer,b,Jt,n.COLOR_ATTACHMENT0+ct,n.TEXTURE_2D,0),p(Jt)&&m(n.TEXTURE_2D)}e.unbindTexture()}else{let ct=n.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(ct=b.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(ct,q.__webglTexture),mt(ct,M),M.mipmaps&&M.mipmaps.length>0)for(let xt=0;xt<M.mipmaps.length;xt++)et(O.__webglFramebuffer[xt],b,M,n.COLOR_ATTACHMENT0,ct,xt);else et(O.__webglFramebuffer,b,M,n.COLOR_ATTACHMENT0,ct,0);p(M)&&m(ct),e.unbindTexture()}b.depthBuffer&&Ot(b)}function qt(b){const M=b.textures;for(let O=0,q=M.length;O<q;O++){const $=M[O];if(p($)){const K=b.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,bt=i.get($).__webglTexture;e.bindTexture(K,bt),m(K),e.unbindTexture()}}}const Z=[],T=[];function ot(b){if(b.samples>0){if(tt(b)===!1){const M=b.textures,O=b.width,q=b.height;let $=n.COLOR_BUFFER_BIT;const K=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,bt=i.get(b),ct=M.length>1;if(ct)for(let xt=0;xt<M.length;xt++)e.bindFramebuffer(n.FRAMEBUFFER,bt.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+xt,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,bt.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+xt,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,bt.__webglMultisampledFramebuffer),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,bt.__webglFramebuffer);for(let xt=0;xt<M.length;xt++){if(b.resolveDepthBuffer&&(b.depthBuffer&&($|=n.DEPTH_BUFFER_BIT),b.stencilBuffer&&b.resolveStencilBuffer&&($|=n.STENCIL_BUFFER_BIT)),ct){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,bt.__webglColorRenderbuffer[xt]);const Jt=i.get(M[xt]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Jt,0)}n.blitFramebuffer(0,0,O,q,0,0,O,q,$,n.NEAREST),c===!0&&(Z.length=0,T.length=0,Z.push(n.COLOR_ATTACHMENT0+xt),b.depthBuffer&&b.resolveDepthBuffer===!1&&(Z.push(K),T.push(K),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,T)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Z))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ct)for(let xt=0;xt<M.length;xt++){e.bindFramebuffer(n.FRAMEBUFFER,bt.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+xt,n.RENDERBUFFER,bt.__webglColorRenderbuffer[xt]);const Jt=i.get(M[xt]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,bt.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+xt,n.TEXTURE_2D,Jt,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,bt.__webglMultisampledFramebuffer)}else if(b.depthBuffer&&b.resolveDepthBuffer===!1&&c){const M=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[M])}}}function st(b){return Math.min(s.maxSamples,b.samples)}function tt(b){const M=i.get(b);return b.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function at(b){const M=o.render.frame;h.get(b)!==M&&(h.set(b,M),b.update())}function Pt(b,M){const O=b.colorSpace,q=b.format,$=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||O!==ii&&O!==qn&&(se.getTransfer(O)===ue?(q!==fn||$!==On)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),M}function gt(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(l.width=b.naturalWidth||b.width,l.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(l.width=b.displayWidth,l.height=b.displayHeight):(l.width=b.width,l.height=b.height),l}this.allocateTextureUnit=F,this.resetTextureUnits=S,this.setTexture2D=H,this.setTexture2DArray=J,this.setTexture3D=G,this.setTextureCube=Q,this.rebindTextures=Ut,this.setupRenderTarget=Gt,this.updateRenderTargetMipmap=qt,this.updateMultisampleRenderTarget=ot,this.setupDepthRenderbuffer=Ot,this.setupFrameBufferTexture=et,this.useMultisampledRTT=tt}function Fg(n,t){function e(i,s=qn){let r;const o=se.getTransfer(s);if(i===On)return n.UNSIGNED_BYTE;if(i===Wa)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Xa)return n.UNSIGNED_SHORT_5_5_5_1;if(i===fh)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===hh)return n.BYTE;if(i===uh)return n.SHORT;if(i===Rs)return n.UNSIGNED_SHORT;if(i===Va)return n.INT;if(i===Mi)return n.UNSIGNED_INT;if(i===Dn)return n.FLOAT;if(i===rs)return n.HALF_FLOAT;if(i===dh)return n.ALPHA;if(i===ph)return n.RGB;if(i===fn)return n.RGBA;if(i===mh)return n.LUMINANCE;if(i===gh)return n.LUMINANCE_ALPHA;if(i===qi)return n.DEPTH_COMPONENT;if(i===es)return n.DEPTH_STENCIL;if(i===_h)return n.RED;if(i===Ya)return n.RED_INTEGER;if(i===vh)return n.RG;if(i===qa)return n.RG_INTEGER;if(i===Ka)return n.RGBA_INTEGER;if(i===gr||i===_r||i===vr||i===xr)if(o===ue)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===gr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===_r)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===xr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===gr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===_r)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===vr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===xr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===jo||i===Qo||i===ta||i===ea)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===jo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Qo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===ta)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===ea)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===na||i===ia||i===sa)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===na||i===ia)return o===ue?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===sa)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===ra||i===oa||i===aa||i===ca||i===la||i===ha||i===ua||i===fa||i===da||i===pa||i===ma||i===ga||i===_a||i===va)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===ra)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===oa)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===aa)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ca)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===la)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ha)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ua)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===fa)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===da)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===pa)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===ma)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===ga)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===_a)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===va)return o===ue?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Mr||i===xa||i===Ma)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===Mr)return o===ue?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===xa)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ma)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===xh||i===Sa||i===ya||i===Ea)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Mr)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Sa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ya)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Ea)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ts?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}class zg extends ke{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Rt extends Wt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Bg={type:"move"};class Po{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Rt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Rt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Rt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(const x of t.hand.values()){const p=e.getJointPose(x,i),m=this._getHandJoint(l,x);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}const h=l.joints["index-finger-tip"],f=l.joints["thumb-tip"],u=h.position.distanceTo(f.position),d=.02,g=.005;l.inputState.pinching&&u>d+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&u<=d-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Bg)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const i=new Rt;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}}const kg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Gg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Hg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,i){if(this.texture===null){const s=new Fe,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=i.depthNear||e.depthFar!=i.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,i=new Fn({vertexShader:kg,fragmentShader:Gg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ce(new je(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Vg extends os{constructor(t,e){super();const i=this;let s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,f=null,u=null,d=null,g=null;const x=new Hg,p=e.getContextAttributes();let m=null,w=null;const y=[],_=[],L=new rt;let R=null;const A=new ke;A.layers.enable(1),A.viewport=new oe;const D=new ke;D.layers.enable(2),D.viewport=new oe;const V=[A,D],v=new zg;v.layers.enable(1),v.layers.enable(2);let S=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let et=y[Y];return et===void 0&&(et=new Po,y[Y]=et),et.getTargetRaySpace()},this.getControllerGrip=function(Y){let et=y[Y];return et===void 0&&(et=new Po,y[Y]=et),et.getGripSpace()},this.getHand=function(Y){let et=y[Y];return et===void 0&&(et=new Po,y[Y]=et),et.getHandSpace()};function z(Y){const et=_.indexOf(Y.inputSource);if(et===-1)return;const St=y[et];St!==void 0&&(St.update(Y.inputSource,Y.frame,l||o),St.dispatchEvent({type:Y.type,data:Y.inputSource}))}function H(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",J);for(let Y=0;Y<y.length;Y++){const et=_[Y];et!==null&&(_[Y]=null,y[Y].disconnect(et))}S=null,F=null,x.reset(),t.setRenderTarget(m),d=null,u=null,f=null,s=null,w=null,jt.stop(),i.isPresenting=!1,t.setPixelRatio(R),t.setSize(L.width,L.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(Y){l=Y},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return f},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(m=t.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",H),s.addEventListener("inputsourceschange",J),p.xrCompatible!==!0&&await e.makeXRCompatible(),R=t.getPixelRatio(),t.getSize(L),s.renderState.layers===void 0){const et={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,et),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),w=new ni(d.framebufferWidth,d.framebufferHeight,{format:fn,type:On,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil})}else{let et=null,St=null,ht=null;p.depth&&(ht=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=p.stencil?es:qi,St=p.stencil?ts:Mi);const Ot={colorFormat:e.RGBA8,depthFormat:ht,scaleFactor:r};f=new XRWebGLBinding(s,e),u=f.createProjectionLayer(Ot),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),w=new ni(u.textureWidth,u.textureHeight,{format:fn,type:On,depthTexture:new Nh(u.textureWidth,u.textureHeight,St,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),jt.setContext(s),jt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function J(Y){for(let et=0;et<Y.removed.length;et++){const St=Y.removed[et],ht=_.indexOf(St);ht>=0&&(_[ht]=null,y[ht].disconnect(St))}for(let et=0;et<Y.added.length;et++){const St=Y.added[et];let ht=_.indexOf(St);if(ht===-1){for(let Ut=0;Ut<y.length;Ut++)if(Ut>=_.length){_.push(St),ht=Ut;break}else if(_[Ut]===null){_[Ut]=St,ht=Ut;break}if(ht===-1)break}const Ot=y[ht];Ot&&Ot.connect(St)}}const G=new P,Q=new P;function X(Y,et,St){G.setFromMatrixPosition(et.matrixWorld),Q.setFromMatrixPosition(St.matrixWorld);const ht=G.distanceTo(Q),Ot=et.projectionMatrix.elements,Ut=St.projectionMatrix.elements,Gt=Ot[14]/(Ot[10]-1),qt=Ot[14]/(Ot[10]+1),Z=(Ot[9]+1)/Ot[5],T=(Ot[9]-1)/Ot[5],ot=(Ot[8]-1)/Ot[0],st=(Ut[8]+1)/Ut[0],tt=Gt*ot,at=Gt*st,Pt=ht/(-ot+st),gt=Pt*-ot;if(et.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(gt),Y.translateZ(Pt),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Ot[10]===-1)Y.projectionMatrix.copy(et.projectionMatrix),Y.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{const b=Gt+Pt,M=qt+Pt,O=tt-gt,q=at+(ht-gt),$=Z*qt/M*b,K=T*qt/M*b;Y.projectionMatrix.makePerspective(O,q,$,K,b,M),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ut(Y,et){et===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(et.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let et=Y.near,St=Y.far;x.texture!==null&&(x.depthNear>0&&(et=x.depthNear),x.depthFar>0&&(St=x.depthFar)),v.near=D.near=A.near=et,v.far=D.far=A.far=St,(S!==v.near||F!==v.far)&&(s.updateRenderState({depthNear:v.near,depthFar:v.far}),S=v.near,F=v.far);const ht=Y.parent,Ot=v.cameras;ut(v,ht);for(let Ut=0;Ut<Ot.length;Ut++)ut(Ot[Ut],ht);Ot.length===2?X(v,A,D):v.projectionMatrix.copy(A.projectionMatrix),pt(Y,v,ht)};function pt(Y,et,St){St===null?Y.matrix.copy(et.matrixWorld):(Y.matrix.copy(St.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(et.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(et.projectionMatrix),Y.projectionMatrixInverse.copy(et.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Cs*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(u===null&&d===null))return c},this.setFoveation=function(Y){c=Y,u!==null&&(u.fixedFoveation=Y),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Y)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(v)};let mt=null;function Kt(Y,et){if(h=et.getViewerPose(l||o),g=et,h!==null){const St=h.views;d!==null&&(t.setRenderTargetFramebuffer(w,d.framebuffer),t.setRenderTarget(w));let ht=!1;St.length!==v.cameras.length&&(v.cameras.length=0,ht=!0);for(let Ut=0;Ut<St.length;Ut++){const Gt=St[Ut];let qt=null;if(d!==null)qt=d.getViewport(Gt);else{const T=f.getViewSubImage(u,Gt);qt=T.viewport,Ut===0&&(t.setRenderTargetTextures(w,T.colorTexture,u.ignoreDepthValues?void 0:T.depthStencilTexture),t.setRenderTarget(w))}let Z=V[Ut];Z===void 0&&(Z=new ke,Z.layers.enable(Ut),Z.viewport=new oe,V[Ut]=Z),Z.matrix.fromArray(Gt.transform.matrix),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.projectionMatrix.fromArray(Gt.projectionMatrix),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert(),Z.viewport.set(qt.x,qt.y,qt.width,qt.height),Ut===0&&(v.matrix.copy(Z.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),ht===!0&&v.cameras.push(Z)}const Ot=s.enabledFeatures;if(Ot&&Ot.includes("depth-sensing")){const Ut=f.getDepthInformation(St[0]);Ut&&Ut.isValid&&Ut.texture&&x.init(t,Ut,s.renderState)}}for(let St=0;St<y.length;St++){const ht=_[St],Ot=y[St];ht!==null&&Ot!==void 0&&Ot.update(ht,et,l||o)}mt&&mt(Y,et),et.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:et}),g=null}const jt=new Uh;jt.setAnimationLoop(Kt),this.setAnimationLoop=function(Y){mt=Y},this.dispose=function(){}}}const ui=new Mn,Wg=new fe;function Xg(n,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,Lh(n)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,w,y,_){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(p,m):m.isMeshToonMaterial?(r(p,m),f(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m)):m.isMeshStandardMaterial?(r(p,m),u(p,m),m.isMeshPhysicalMaterial&&d(p,m,_)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),x(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?c(p,m,w,y):m.isSpriteMaterial?l(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Ge&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Ge&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);const w=t.get(m),y=w.envMap,_=w.envMapRotation;y&&(p.envMap.value=y,ui.copy(_),ui.x*=-1,ui.y*=-1,ui.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(ui.y*=-1,ui.z*=-1),p.envMapRotation.value.setFromMatrix4(Wg.makeRotationFromEuler(ui)),p.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function c(p,m,w,y){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*w,p.scale.value=y*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function l(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function f(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function u(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,w){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Ge&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=w.texture,p.transmissionSamplerSize.value.set(w.width,w.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function x(p,m){const w=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(w.matrixWorld),p.nearDistance.value=w.shadow.camera.near,p.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Yg(n,t,e,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(w,y){const _=y.program;i.uniformBlockBinding(w,_)}function l(w,y){let _=s[w.id];_===void 0&&(g(w),_=h(w),s[w.id]=_,w.addEventListener("dispose",p));const L=y.program;i.updateUBOMapping(w,L);const R=t.render.frame;r[w.id]!==R&&(u(w),r[w.id]=R)}function h(w){const y=f();w.__bindingPointIndex=y;const _=n.createBuffer(),L=w.__size,R=w.usage;return n.bindBuffer(n.UNIFORM_BUFFER,_),n.bufferData(n.UNIFORM_BUFFER,L,R),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,y,_),_}function f(){for(let w=0;w<a;w++)if(o.indexOf(w)===-1)return o.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(w){const y=s[w.id],_=w.uniforms,L=w.__cache;n.bindBuffer(n.UNIFORM_BUFFER,y);for(let R=0,A=_.length;R<A;R++){const D=Array.isArray(_[R])?_[R]:[_[R]];for(let V=0,v=D.length;V<v;V++){const S=D[V];if(d(S,R,V,L)===!0){const F=S.__offset,z=Array.isArray(S.value)?S.value:[S.value];let H=0;for(let J=0;J<z.length;J++){const G=z[J],Q=x(G);typeof G=="number"||typeof G=="boolean"?(S.__data[0]=G,n.bufferSubData(n.UNIFORM_BUFFER,F+H,S.__data)):G.isMatrix3?(S.__data[0]=G.elements[0],S.__data[1]=G.elements[1],S.__data[2]=G.elements[2],S.__data[3]=0,S.__data[4]=G.elements[3],S.__data[5]=G.elements[4],S.__data[6]=G.elements[5],S.__data[7]=0,S.__data[8]=G.elements[6],S.__data[9]=G.elements[7],S.__data[10]=G.elements[8],S.__data[11]=0):(G.toArray(S.__data,H),H+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,F,S.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(w,y,_,L){const R=w.value,A=y+"_"+_;if(L[A]===void 0)return typeof R=="number"||typeof R=="boolean"?L[A]=R:L[A]=R.clone(),!0;{const D=L[A];if(typeof R=="number"||typeof R=="boolean"){if(D!==R)return L[A]=R,!0}else if(D.equals(R)===!1)return D.copy(R),!0}return!1}function g(w){const y=w.uniforms;let _=0;const L=16;for(let A=0,D=y.length;A<D;A++){const V=Array.isArray(y[A])?y[A]:[y[A]];for(let v=0,S=V.length;v<S;v++){const F=V[v],z=Array.isArray(F.value)?F.value:[F.value];for(let H=0,J=z.length;H<J;H++){const G=z[H],Q=x(G),X=_%L,ut=X%Q.boundary,pt=X+ut;_+=ut,pt!==0&&L-pt<Q.storage&&(_+=L-pt),F.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=_,_+=Q.storage}}}const R=_%L;return R>0&&(_+=L-R),w.__size=_,w.__cache={},this}function x(w){const y={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(y.boundary=4,y.storage=4):w.isVector2?(y.boundary=8,y.storage=8):w.isVector3||w.isColor?(y.boundary=16,y.storage=12):w.isVector4?(y.boundary=16,y.storage=16):w.isMatrix3?(y.boundary=48,y.storage=48):w.isMatrix4?(y.boundary=64,y.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),y}function p(w){const y=w.target;y.removeEventListener("dispose",p);const _=o.indexOf(y.__bindingPointIndex);o.splice(_,1),n.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function m(){for(const w in s)n.deleteBuffer(s[w]);o=[],s={},r={}}return{bind:c,update:l,dispose:m}}class kh{constructor(t={}){const{canvas:e=Uf(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1}=t;this.isWebGLRenderer=!0;let u;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");u=i.getContextAttributes().alpha}else u=o;const d=new Uint32Array(4),g=new Int32Array(4);let x=null,p=null;const m=[],w=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=dn,this.toneMapping=Qn,this.toneMappingExposure=1;const y=this;let _=!1,L=0,R=0,A=null,D=-1,V=null;const v=new oe,S=new oe;let F=null;const z=new Nt(0);let H=0,J=e.width,G=e.height,Q=1,X=null,ut=null;const pt=new oe(0,0,J,G),mt=new oe(0,0,J,G);let Kt=!1;const jt=new $a;let Y=!1,et=!1;const St=new fe,ht=new fe,Ot=new P,Ut=new oe,Gt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let qt=!1;function Z(){return A===null?Q:1}let T=i;function ot(E,U){return e.getContext(E,U)}try{const E={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Ha}`),e.addEventListener("webglcontextlost",j,!1),e.addEventListener("webglcontextrestored",ft,!1),e.addEventListener("webglcontextcreationerror",vt,!1),T===null){const U="webgl2";if(T=ot(U,E),T===null)throw ot(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let st,tt,at,Pt,gt,b,M,O,q,$,K,bt,ct,xt,Jt,nt,Mt,Bt,kt,yt,Zt,Ht,ae,I;function _t(){st=new j0(T),st.init(),Ht=new Fg(T,st),tt=new Y0(T,st,t,Ht),at=new Ug(T),tt.reverseDepthBuffer&&at.buffers.depth.setReversed(!0),Pt=new em(T),gt=new xg,b=new Og(T,st,at,gt,tt,Ht,Pt),M=new K0(y),O=new $0(y),q=new cd(T),ae=new W0(T,q),$=new Q0(T,q,Pt,ae),K=new im(T,$,q,Pt),kt=new nm(T,tt,b),nt=new q0(gt),bt=new vg(y,M,O,st,tt,ae,nt),ct=new Xg(y,gt),xt=new Sg,Jt=new Ag(st),Bt=new V0(y,M,O,at,K,u,c),Mt=new Ig(y,K,tt),I=new Yg(T,Pt,tt,at),yt=new X0(T,st,Pt),Zt=new tm(T,st,Pt),Pt.programs=bt.programs,y.capabilities=tt,y.extensions=st,y.properties=gt,y.renderLists=xt,y.shadowMap=Mt,y.state=at,y.info=Pt}_t();const W=new Vg(y,T);this.xr=W,this.getContext=function(){return T},this.getContextAttributes=function(){return T.getContextAttributes()},this.forceContextLoss=function(){const E=st.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=st.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(E){E!==void 0&&(Q=E,this.setSize(J,G,!1))},this.getSize=function(E){return E.set(J,G)},this.setSize=function(E,U,B=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}J=E,G=U,e.width=Math.floor(E*Q),e.height=Math.floor(U*Q),B===!0&&(e.style.width=E+"px",e.style.height=U+"px"),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(J*Q,G*Q).floor()},this.setDrawingBufferSize=function(E,U,B){J=E,G=U,Q=B,e.width=Math.floor(E*B),e.height=Math.floor(U*B),this.setViewport(0,0,E,U)},this.getCurrentViewport=function(E){return E.copy(v)},this.getViewport=function(E){return E.copy(pt)},this.setViewport=function(E,U,B,k){E.isVector4?pt.set(E.x,E.y,E.z,E.w):pt.set(E,U,B,k),at.viewport(v.copy(pt).multiplyScalar(Q).round())},this.getScissor=function(E){return E.copy(mt)},this.setScissor=function(E,U,B,k){E.isVector4?mt.set(E.x,E.y,E.z,E.w):mt.set(E,U,B,k),at.scissor(S.copy(mt).multiplyScalar(Q).round())},this.getScissorTest=function(){return Kt},this.setScissorTest=function(E){at.setScissorTest(Kt=E)},this.setOpaqueSort=function(E){X=E},this.setTransparentSort=function(E){ut=E},this.getClearColor=function(E){return E.copy(Bt.getClearColor())},this.setClearColor=function(){Bt.setClearColor.apply(Bt,arguments)},this.getClearAlpha=function(){return Bt.getClearAlpha()},this.setClearAlpha=function(){Bt.setClearAlpha.apply(Bt,arguments)},this.clear=function(E=!0,U=!0,B=!0){let k=0;if(E){let N=!1;if(A!==null){const it=A.texture.format;N=it===Ka||it===qa||it===Ya}if(N){const it=A.texture.type,dt=it===On||it===Mi||it===Rs||it===ts||it===Wa||it===Xa,Et=Bt.getClearColor(),Tt=Bt.getClearAlpha(),Ft=Et.r,zt=Et.g,Ct=Et.b;dt?(d[0]=Ft,d[1]=zt,d[2]=Ct,d[3]=Tt,T.clearBufferuiv(T.COLOR,0,d)):(g[0]=Ft,g[1]=zt,g[2]=Ct,g[3]=Tt,T.clearBufferiv(T.COLOR,0,g))}else k|=T.COLOR_BUFFER_BIT}U&&(k|=T.DEPTH_BUFFER_BIT,T.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),B&&(k|=T.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),T.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",j,!1),e.removeEventListener("webglcontextrestored",ft,!1),e.removeEventListener("webglcontextcreationerror",vt,!1),xt.dispose(),Jt.dispose(),gt.dispose(),M.dispose(),O.dispose(),K.dispose(),ae.dispose(),I.dispose(),bt.dispose(),W.dispose(),W.removeEventListener("sessionstart",_c),W.removeEventListener("sessionend",vc),ri.stop()};function j(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),_=!0}function ft(){console.log("THREE.WebGLRenderer: Context Restored."),_=!1;const E=Pt.autoReset,U=Mt.enabled,B=Mt.autoUpdate,k=Mt.needsUpdate,N=Mt.type;_t(),Pt.autoReset=E,Mt.enabled=U,Mt.autoUpdate=B,Mt.needsUpdate=k,Mt.type=N}function vt(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function $t(E){const U=E.target;U.removeEventListener("dispose",$t),ye(U)}function ye(E){ze(E),gt.remove(E)}function ze(E){const U=gt.get(E).programs;U!==void 0&&(U.forEach(function(B){bt.releaseProgram(B)}),E.isShaderMaterial&&bt.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,B,k,N,it){U===null&&(U=Gt);const dt=N.isMesh&&N.matrixWorld.determinant()<0,Et=Au(E,U,B,k,N);at.setMaterial(k,dt);let Tt=B.index,Ft=1;if(k.wireframe===!0){if(Tt=$.getWireframeAttribute(B),Tt===void 0)return;Ft=2}const zt=B.drawRange,Ct=B.attributes.position;let re=zt.start*Ft,he=(zt.start+zt.count)*Ft;it!==null&&(re=Math.max(re,it.start*Ft),he=Math.min(he,(it.start+it.count)*Ft)),Tt!==null?(re=Math.max(re,0),he=Math.min(he,Tt.count)):Ct!=null&&(re=Math.max(re,0),he=Math.min(he,Ct.count));const _e=he-re;if(_e<0||_e===1/0)return;ae.setup(N,k,Et,B,Tt);let We,ne=yt;if(Tt!==null&&(We=q.get(Tt),ne=Zt,ne.setIndex(We)),N.isMesh)k.wireframe===!0?(at.setLineWidth(k.wireframeLinewidth*Z()),ne.setMode(T.LINES)):ne.setMode(T.TRIANGLES);else if(N.isLine){let Lt=k.linewidth;Lt===void 0&&(Lt=1),at.setLineWidth(Lt*Z()),N.isLineSegments?ne.setMode(T.LINES):N.isLineLoop?ne.setMode(T.LINE_LOOP):ne.setMode(T.LINE_STRIP)}else N.isPoints?ne.setMode(T.POINTS):N.isSprite&&ne.setMode(T.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)ne.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(st.get("WEBGL_multi_draw"))ne.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Lt=N._multiDrawStarts,Ce=N._multiDrawCounts,ie=N._multiDrawCount,tn=Tt?q.get(Tt).bytesPerElement:1,bi=gt.get(k).currentProgram.getUniforms();for(let Xe=0;Xe<ie;Xe++)bi.setValue(T,"_gl_DrawID",Xe),ne.render(Lt[Xe]/tn,Ce[Xe])}else if(N.isInstancedMesh)ne.renderInstances(re,_e,N.count);else if(B.isInstancedBufferGeometry){const Lt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,Ce=Math.min(B.instanceCount,Lt);ne.renderInstances(re,_e,Ce)}else ne.render(re,_e)};function ee(E,U,B){E.transparent===!0&&E.side===_n&&E.forceSinglePass===!1?(E.side=Ge,E.needsUpdate=!0,Bs(E,U,B),E.side=ei,E.needsUpdate=!0,Bs(E,U,B),E.side=_n):Bs(E,U,B)}this.compile=function(E,U,B=null){B===null&&(B=E),p=Jt.get(B),p.init(U),w.push(p),B.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),E!==B&&E.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),p.setupLights();const k=new Set;return E.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const it=N.material;if(it)if(Array.isArray(it))for(let dt=0;dt<it.length;dt++){const Et=it[dt];ee(Et,B,N),k.add(Et)}else ee(it,B,N),k.add(it)}),w.pop(),p=null,k},this.compileAsync=function(E,U,B=null){const k=this.compile(E,U,B);return new Promise(N=>{function it(){if(k.forEach(function(dt){gt.get(dt).currentProgram.isReady()&&k.delete(dt)}),k.size===0){N(E);return}setTimeout(it,10)}st.get("KHR_parallel_shader_compile")!==null?it():setTimeout(it,10)})};let Be=null;function wn(E){Be&&Be(E)}function _c(){ri.stop()}function vc(){ri.start()}const ri=new Uh;ri.setAnimationLoop(wn),typeof self<"u"&&ri.setContext(self),this.setAnimationLoop=function(E){Be=E,W.setAnimationLoop(E),E===null?ri.stop():ri.start()},W.addEventListener("sessionstart",_c),W.addEventListener("sessionend",vc),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(_===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(U),U=W.getCamera()),E.isScene===!0&&E.onBeforeRender(y,E,U,A),p=Jt.get(E,w.length),p.init(U),w.push(p),ht.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),jt.setFromProjectionMatrix(ht),et=this.localClippingEnabled,Y=nt.init(this.clippingPlanes,et),x=xt.get(E,m.length),x.init(),m.push(x),W.enabled===!0&&W.isPresenting===!0){const it=y.xr.getDepthSensingMesh();it!==null&&$r(it,U,-1/0,y.sortObjects)}$r(E,U,0,y.sortObjects),x.finish(),y.sortObjects===!0&&x.sort(X,ut),qt=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,qt&&Bt.addToRenderList(x,E),this.info.render.frame++,Y===!0&&nt.beginShadows();const B=p.state.shadowsArray;Mt.render(B,E,U),Y===!0&&nt.endShadows(),this.info.autoReset===!0&&this.info.reset();const k=x.opaque,N=x.transmissive;if(p.setupLights(),U.isArrayCamera){const it=U.cameras;if(N.length>0)for(let dt=0,Et=it.length;dt<Et;dt++){const Tt=it[dt];Mc(k,N,E,Tt)}qt&&Bt.render(E);for(let dt=0,Et=it.length;dt<Et;dt++){const Tt=it[dt];xc(x,E,Tt,Tt.viewport)}}else N.length>0&&Mc(k,N,E,U),qt&&Bt.render(E),xc(x,E,U);A!==null&&(b.updateMultisampleRenderTarget(A),b.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(y,E,U),ae.resetDefaultState(),D=-1,V=null,w.pop(),w.length>0?(p=w[w.length-1],Y===!0&&nt.setGlobalState(y.clippingPlanes,p.state.camera)):p=null,m.pop(),m.length>0?x=m[m.length-1]:x=null};function $r(E,U,B,k){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)B=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||jt.intersectsSprite(E)){k&&Ut.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ht);const dt=K.update(E),Et=E.material;Et.visible&&x.push(E,dt,Et,B,Ut.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||jt.intersectsObject(E))){const dt=K.update(E),Et=E.material;if(k&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ut.copy(E.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),Ut.copy(dt.boundingSphere.center)),Ut.applyMatrix4(E.matrixWorld).applyMatrix4(ht)),Array.isArray(Et)){const Tt=dt.groups;for(let Ft=0,zt=Tt.length;Ft<zt;Ft++){const Ct=Tt[Ft],re=Et[Ct.materialIndex];re&&re.visible&&x.push(E,dt,re,B,Ut.z,Ct)}}else Et.visible&&x.push(E,dt,Et,B,Ut.z,null)}}const it=E.children;for(let dt=0,Et=it.length;dt<Et;dt++)$r(it[dt],U,B,k)}function xc(E,U,B,k){const N=E.opaque,it=E.transmissive,dt=E.transparent;p.setupLightsView(B),Y===!0&&nt.setGlobalState(y.clippingPlanes,B),k&&at.viewport(v.copy(k)),N.length>0&&zs(N,U,B),it.length>0&&zs(it,U,B),dt.length>0&&zs(dt,U,B),at.buffers.depth.setTest(!0),at.buffers.depth.setMask(!0),at.buffers.color.setMask(!0),at.setPolygonOffset(!1)}function Mc(E,U,B,k){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[k.id]===void 0&&(p.state.transmissionRenderTarget[k.id]=new ni(1,1,{generateMipmaps:!0,type:st.has("EXT_color_buffer_half_float")||st.has("EXT_color_buffer_float")?rs:On,minFilter:xi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:se.workingColorSpace}));const it=p.state.transmissionRenderTarget[k.id],dt=k.viewport||v;it.setSize(dt.z,dt.w);const Et=y.getRenderTarget();y.setRenderTarget(it),y.getClearColor(z),H=y.getClearAlpha(),H<1&&y.setClearColor(16777215,.5),y.clear(),qt&&Bt.render(B);const Tt=y.toneMapping;y.toneMapping=Qn;const Ft=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),p.setupLightsView(k),Y===!0&&nt.setGlobalState(y.clippingPlanes,k),zs(E,B,k),b.updateMultisampleRenderTarget(it),b.updateRenderTargetMipmap(it),st.has("WEBGL_multisampled_render_to_texture")===!1){let zt=!1;for(let Ct=0,re=U.length;Ct<re;Ct++){const he=U[Ct],_e=he.object,We=he.geometry,ne=he.material,Lt=he.group;if(ne.side===_n&&_e.layers.test(k.layers)){const Ce=ne.side;ne.side=Ge,ne.needsUpdate=!0,Sc(_e,B,k,We,ne,Lt),ne.side=Ce,ne.needsUpdate=!0,zt=!0}}zt===!0&&(b.updateMultisampleRenderTarget(it),b.updateRenderTargetMipmap(it))}y.setRenderTarget(Et),y.setClearColor(z,H),Ft!==void 0&&(k.viewport=Ft),y.toneMapping=Tt}function zs(E,U,B){const k=U.isScene===!0?U.overrideMaterial:null;for(let N=0,it=E.length;N<it;N++){const dt=E[N],Et=dt.object,Tt=dt.geometry,Ft=k===null?dt.material:k,zt=dt.group;Et.layers.test(B.layers)&&Sc(Et,U,B,Tt,Ft,zt)}}function Sc(E,U,B,k,N,it){E.onBeforeRender(y,U,B,k,N,it),E.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),N.onBeforeRender(y,U,B,k,E,it),N.transparent===!0&&N.side===_n&&N.forceSinglePass===!1?(N.side=Ge,N.needsUpdate=!0,y.renderBufferDirect(B,U,k,N,E,it),N.side=ei,N.needsUpdate=!0,y.renderBufferDirect(B,U,k,N,E,it),N.side=_n):y.renderBufferDirect(B,U,k,N,E,it),E.onAfterRender(y,U,B,k,N,it)}function Bs(E,U,B){U.isScene!==!0&&(U=Gt);const k=gt.get(E),N=p.state.lights,it=p.state.shadowsArray,dt=N.state.version,Et=bt.getParameters(E,N.state,it,U,B),Tt=bt.getProgramCacheKey(Et);let Ft=k.programs;k.environment=E.isMeshStandardMaterial?U.environment:null,k.fog=U.fog,k.envMap=(E.isMeshStandardMaterial?O:M).get(E.envMap||k.environment),k.envMapRotation=k.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,Ft===void 0&&(E.addEventListener("dispose",$t),Ft=new Map,k.programs=Ft);let zt=Ft.get(Tt);if(zt!==void 0){if(k.currentProgram===zt&&k.lightsStateVersion===dt)return Ec(E,Et),zt}else Et.uniforms=bt.getUniforms(E),E.onBeforeCompile(Et,y),zt=bt.acquireProgram(Et,Tt),Ft.set(Tt,zt),k.uniforms=Et.uniforms;const Ct=k.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ct.clippingPlanes=nt.uniform),Ec(E,Et),k.needsLights=Cu(E),k.lightsStateVersion=dt,k.needsLights&&(Ct.ambientLightColor.value=N.state.ambient,Ct.lightProbe.value=N.state.probe,Ct.directionalLights.value=N.state.directional,Ct.directionalLightShadows.value=N.state.directionalShadow,Ct.spotLights.value=N.state.spot,Ct.spotLightShadows.value=N.state.spotShadow,Ct.rectAreaLights.value=N.state.rectArea,Ct.ltc_1.value=N.state.rectAreaLTC1,Ct.ltc_2.value=N.state.rectAreaLTC2,Ct.pointLights.value=N.state.point,Ct.pointLightShadows.value=N.state.pointShadow,Ct.hemisphereLights.value=N.state.hemi,Ct.directionalShadowMap.value=N.state.directionalShadowMap,Ct.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Ct.spotShadowMap.value=N.state.spotShadowMap,Ct.spotLightMatrix.value=N.state.spotLightMatrix,Ct.spotLightMap.value=N.state.spotLightMap,Ct.pointShadowMap.value=N.state.pointShadowMap,Ct.pointShadowMatrix.value=N.state.pointShadowMatrix),k.currentProgram=zt,k.uniformsList=null,zt}function yc(E){if(E.uniformsList===null){const U=E.currentProgram.getUniforms();E.uniformsList=yr.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function Ec(E,U){const B=gt.get(E);B.outputColorSpace=U.outputColorSpace,B.batching=U.batching,B.batchingColor=U.batchingColor,B.instancing=U.instancing,B.instancingColor=U.instancingColor,B.instancingMorph=U.instancingMorph,B.skinning=U.skinning,B.morphTargets=U.morphTargets,B.morphNormals=U.morphNormals,B.morphColors=U.morphColors,B.morphTargetsCount=U.morphTargetsCount,B.numClippingPlanes=U.numClippingPlanes,B.numIntersection=U.numClipIntersection,B.vertexAlphas=U.vertexAlphas,B.vertexTangents=U.vertexTangents,B.toneMapping=U.toneMapping}function Au(E,U,B,k,N){U.isScene!==!0&&(U=Gt),b.resetTextureUnits();const it=U.fog,dt=k.isMeshStandardMaterial?U.environment:null,Et=A===null?y.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:ii,Tt=(k.isMeshStandardMaterial?O:M).get(k.envMap||dt),Ft=k.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,zt=!!B.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Ct=!!B.morphAttributes.position,re=!!B.morphAttributes.normal,he=!!B.morphAttributes.color;let _e=Qn;k.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(_e=y.toneMapping);const We=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,ne=We!==void 0?We.length:0,Lt=gt.get(k),Ce=p.state.lights;if(Y===!0&&(et===!0||E!==V)){const Je=E===V&&k.id===D;nt.setState(k,E,Je)}let ie=!1;k.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==Ce.state.version||Lt.outputColorSpace!==Et||N.isBatchedMesh&&Lt.batching===!1||!N.isBatchedMesh&&Lt.batching===!0||N.isBatchedMesh&&Lt.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Lt.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Lt.instancing===!1||!N.isInstancedMesh&&Lt.instancing===!0||N.isSkinnedMesh&&Lt.skinning===!1||!N.isSkinnedMesh&&Lt.skinning===!0||N.isInstancedMesh&&Lt.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Lt.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Lt.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Lt.instancingMorph===!1&&N.morphTexture!==null||Lt.envMap!==Tt||k.fog===!0&&Lt.fog!==it||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==nt.numPlanes||Lt.numIntersection!==nt.numIntersection)||Lt.vertexAlphas!==Ft||Lt.vertexTangents!==zt||Lt.morphTargets!==Ct||Lt.morphNormals!==re||Lt.morphColors!==he||Lt.toneMapping!==_e||Lt.morphTargetsCount!==ne)&&(ie=!0):(ie=!0,Lt.__version=k.version);let tn=Lt.currentProgram;ie===!0&&(tn=Bs(k,U,N));let bi=!1,Xe=!1,jr=!1;const xe=tn.getUniforms(),kn=Lt.uniforms;if(at.useProgram(tn.program)&&(bi=!0,Xe=!0,jr=!0),k.id!==D&&(D=k.id,Xe=!0),bi||V!==E){tt.reverseDepthBuffer?(St.copy(E.projectionMatrix),Of(St),Ff(St),xe.setValue(T,"projectionMatrix",St)):xe.setValue(T,"projectionMatrix",E.projectionMatrix),xe.setValue(T,"viewMatrix",E.matrixWorldInverse);const Je=xe.map.cameraPosition;Je!==void 0&&Je.setValue(T,Ot.setFromMatrixPosition(E.matrixWorld)),tt.logarithmicDepthBuffer&&xe.setValue(T,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&xe.setValue(T,"isOrthographic",E.isOrthographicCamera===!0),V!==E&&(V=E,Xe=!0,jr=!0)}if(N.isSkinnedMesh){xe.setOptional(T,N,"bindMatrix"),xe.setOptional(T,N,"bindMatrixInverse");const Je=N.skeleton;Je&&(Je.boneTexture===null&&Je.computeBoneTexture(),xe.setValue(T,"boneTexture",Je.boneTexture,b))}N.isBatchedMesh&&(xe.setOptional(T,N,"batchingTexture"),xe.setValue(T,"batchingTexture",N._matricesTexture,b),xe.setOptional(T,N,"batchingIdTexture"),xe.setValue(T,"batchingIdTexture",N._indirectTexture,b),xe.setOptional(T,N,"batchingColorTexture"),N._colorsTexture!==null&&xe.setValue(T,"batchingColorTexture",N._colorsTexture,b));const Qr=B.morphAttributes;if((Qr.position!==void 0||Qr.normal!==void 0||Qr.color!==void 0)&&kt.update(N,B,tn),(Xe||Lt.receiveShadow!==N.receiveShadow)&&(Lt.receiveShadow=N.receiveShadow,xe.setValue(T,"receiveShadow",N.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(kn.envMap.value=Tt,kn.flipEnvMap.value=Tt.isCubeTexture&&Tt.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&U.environment!==null&&(kn.envMapIntensity.value=U.environmentIntensity),Xe&&(xe.setValue(T,"toneMappingExposure",y.toneMappingExposure),Lt.needsLights&&Ru(kn,jr),it&&k.fog===!0&&ct.refreshFogUniforms(kn,it),ct.refreshMaterialUniforms(kn,k,Q,G,p.state.transmissionRenderTarget[E.id]),yr.upload(T,yc(Lt),kn,b)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(yr.upload(T,yc(Lt),kn,b),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&xe.setValue(T,"center",N.center),xe.setValue(T,"modelViewMatrix",N.modelViewMatrix),xe.setValue(T,"normalMatrix",N.normalMatrix),xe.setValue(T,"modelMatrix",N.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){const Je=k.uniformsGroups;for(let to=0,Pu=Je.length;to<Pu;to++){const wc=Je[to];I.update(wc,tn),I.bind(wc,tn)}}return tn}function Ru(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function Cu(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,U,B){gt.get(E.texture).__webglTexture=U,gt.get(E.depthTexture).__webglTexture=B;const k=gt.get(E);k.__hasExternalTextures=!0,k.__autoAllocateDepthBuffer=B===void 0,k.__autoAllocateDepthBuffer||st.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),k.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,U){const B=gt.get(E);B.__webglFramebuffer=U,B.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,B=0){A=E,L=U,R=B;let k=!0,N=null,it=!1,dt=!1;if(E){const Tt=gt.get(E);if(Tt.__useDefaultFramebuffer!==void 0)at.bindFramebuffer(T.FRAMEBUFFER,null),k=!1;else if(Tt.__webglFramebuffer===void 0)b.setupRenderTarget(E);else if(Tt.__hasExternalTextures)b.rebindTextures(E,gt.get(E.texture).__webglTexture,gt.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Ct=E.depthTexture;if(Tt.__boundDepthTexture!==Ct){if(Ct!==null&&gt.has(Ct)&&(E.width!==Ct.image.width||E.height!==Ct.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");b.setupDepthRenderbuffer(E)}}const Ft=E.texture;(Ft.isData3DTexture||Ft.isDataArrayTexture||Ft.isCompressedArrayTexture)&&(dt=!0);const zt=gt.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(zt[U])?N=zt[U][B]:N=zt[U],it=!0):E.samples>0&&b.useMultisampledRTT(E)===!1?N=gt.get(E).__webglMultisampledFramebuffer:Array.isArray(zt)?N=zt[B]:N=zt,v.copy(E.viewport),S.copy(E.scissor),F=E.scissorTest}else v.copy(pt).multiplyScalar(Q).floor(),S.copy(mt).multiplyScalar(Q).floor(),F=Kt;if(at.bindFramebuffer(T.FRAMEBUFFER,N)&&k&&at.drawBuffers(E,N),at.viewport(v),at.scissor(S),at.setScissorTest(F),it){const Tt=gt.get(E.texture);T.framebufferTexture2D(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_CUBE_MAP_POSITIVE_X+U,Tt.__webglTexture,B)}else if(dt){const Tt=gt.get(E.texture),Ft=U||0;T.framebufferTextureLayer(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0,Tt.__webglTexture,B||0,Ft)}D=-1},this.readRenderTargetPixels=function(E,U,B,k,N,it,dt){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Et=gt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&dt!==void 0&&(Et=Et[dt]),Et){at.bindFramebuffer(T.FRAMEBUFFER,Et);try{const Tt=E.texture,Ft=Tt.format,zt=Tt.type;if(!tt.textureFormatReadable(Ft)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!tt.textureTypeReadable(zt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-k&&B>=0&&B<=E.height-N&&T.readPixels(U,B,k,N,Ht.convert(Ft),Ht.convert(zt),it)}finally{const Tt=A!==null?gt.get(A).__webglFramebuffer:null;at.bindFramebuffer(T.FRAMEBUFFER,Tt)}}},this.readRenderTargetPixelsAsync=async function(E,U,B,k,N,it,dt){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Et=gt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&dt!==void 0&&(Et=Et[dt]),Et){const Tt=E.texture,Ft=Tt.format,zt=Tt.type;if(!tt.textureFormatReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!tt.textureTypeReadable(zt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=E.width-k&&B>=0&&B<=E.height-N){at.bindFramebuffer(T.FRAMEBUFFER,Et);const Ct=T.createBuffer();T.bindBuffer(T.PIXEL_PACK_BUFFER,Ct),T.bufferData(T.PIXEL_PACK_BUFFER,it.byteLength,T.STREAM_READ),T.readPixels(U,B,k,N,Ht.convert(Ft),Ht.convert(zt),0);const re=A!==null?gt.get(A).__webglFramebuffer:null;at.bindFramebuffer(T.FRAMEBUFFER,re);const he=T.fenceSync(T.SYNC_GPU_COMMANDS_COMPLETE,0);return T.flush(),await Nf(T,he,4),T.bindBuffer(T.PIXEL_PACK_BUFFER,Ct),T.getBufferSubData(T.PIXEL_PACK_BUFFER,0,it),T.deleteBuffer(Ct),T.deleteSync(he),it}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,U=null,B=0){E.isTexture!==!0&&(Sr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,E=arguments[1]);const k=Math.pow(2,-B),N=Math.floor(E.image.width*k),it=Math.floor(E.image.height*k),dt=U!==null?U.x:0,Et=U!==null?U.y:0;b.setTexture2D(E,0),T.copyTexSubImage2D(T.TEXTURE_2D,B,0,0,dt,Et,N,it),at.unbindTexture()},this.copyTextureToTexture=function(E,U,B=null,k=null,N=0){E.isTexture!==!0&&(Sr("WebGLRenderer: copyTextureToTexture function signature has changed."),k=arguments[0]||null,E=arguments[1],U=arguments[2],N=arguments[3]||0,B=null);let it,dt,Et,Tt,Ft,zt;B!==null?(it=B.max.x-B.min.x,dt=B.max.y-B.min.y,Et=B.min.x,Tt=B.min.y):(it=E.image.width,dt=E.image.height,Et=0,Tt=0),k!==null?(Ft=k.x,zt=k.y):(Ft=0,zt=0);const Ct=Ht.convert(U.format),re=Ht.convert(U.type);b.setTexture2D(U,0),T.pixelStorei(T.UNPACK_FLIP_Y_WEBGL,U.flipY),T.pixelStorei(T.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),T.pixelStorei(T.UNPACK_ALIGNMENT,U.unpackAlignment);const he=T.getParameter(T.UNPACK_ROW_LENGTH),_e=T.getParameter(T.UNPACK_IMAGE_HEIGHT),We=T.getParameter(T.UNPACK_SKIP_PIXELS),ne=T.getParameter(T.UNPACK_SKIP_ROWS),Lt=T.getParameter(T.UNPACK_SKIP_IMAGES),Ce=E.isCompressedTexture?E.mipmaps[N]:E.image;T.pixelStorei(T.UNPACK_ROW_LENGTH,Ce.width),T.pixelStorei(T.UNPACK_IMAGE_HEIGHT,Ce.height),T.pixelStorei(T.UNPACK_SKIP_PIXELS,Et),T.pixelStorei(T.UNPACK_SKIP_ROWS,Tt),E.isDataTexture?T.texSubImage2D(T.TEXTURE_2D,N,Ft,zt,it,dt,Ct,re,Ce.data):E.isCompressedTexture?T.compressedTexSubImage2D(T.TEXTURE_2D,N,Ft,zt,Ce.width,Ce.height,Ct,Ce.data):T.texSubImage2D(T.TEXTURE_2D,N,Ft,zt,it,dt,Ct,re,Ce),T.pixelStorei(T.UNPACK_ROW_LENGTH,he),T.pixelStorei(T.UNPACK_IMAGE_HEIGHT,_e),T.pixelStorei(T.UNPACK_SKIP_PIXELS,We),T.pixelStorei(T.UNPACK_SKIP_ROWS,ne),T.pixelStorei(T.UNPACK_SKIP_IMAGES,Lt),N===0&&U.generateMipmaps&&T.generateMipmap(T.TEXTURE_2D),at.unbindTexture()},this.copyTextureToTexture3D=function(E,U,B=null,k=null,N=0){E.isTexture!==!0&&(Sr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),B=arguments[0]||null,k=arguments[1]||null,E=arguments[2],U=arguments[3],N=arguments[4]||0);let it,dt,Et,Tt,Ft,zt,Ct,re,he;const _e=E.isCompressedTexture?E.mipmaps[N]:E.image;B!==null?(it=B.max.x-B.min.x,dt=B.max.y-B.min.y,Et=B.max.z-B.min.z,Tt=B.min.x,Ft=B.min.y,zt=B.min.z):(it=_e.width,dt=_e.height,Et=_e.depth,Tt=0,Ft=0,zt=0),k!==null?(Ct=k.x,re=k.y,he=k.z):(Ct=0,re=0,he=0);const We=Ht.convert(U.format),ne=Ht.convert(U.type);let Lt;if(U.isData3DTexture)b.setTexture3D(U,0),Lt=T.TEXTURE_3D;else if(U.isDataArrayTexture||U.isCompressedArrayTexture)b.setTexture2DArray(U,0),Lt=T.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}T.pixelStorei(T.UNPACK_FLIP_Y_WEBGL,U.flipY),T.pixelStorei(T.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),T.pixelStorei(T.UNPACK_ALIGNMENT,U.unpackAlignment);const Ce=T.getParameter(T.UNPACK_ROW_LENGTH),ie=T.getParameter(T.UNPACK_IMAGE_HEIGHT),tn=T.getParameter(T.UNPACK_SKIP_PIXELS),bi=T.getParameter(T.UNPACK_SKIP_ROWS),Xe=T.getParameter(T.UNPACK_SKIP_IMAGES);T.pixelStorei(T.UNPACK_ROW_LENGTH,_e.width),T.pixelStorei(T.UNPACK_IMAGE_HEIGHT,_e.height),T.pixelStorei(T.UNPACK_SKIP_PIXELS,Tt),T.pixelStorei(T.UNPACK_SKIP_ROWS,Ft),T.pixelStorei(T.UNPACK_SKIP_IMAGES,zt),E.isDataTexture||E.isData3DTexture?T.texSubImage3D(Lt,N,Ct,re,he,it,dt,Et,We,ne,_e.data):U.isCompressedArrayTexture?T.compressedTexSubImage3D(Lt,N,Ct,re,he,it,dt,Et,We,_e.data):T.texSubImage3D(Lt,N,Ct,re,he,it,dt,Et,We,ne,_e),T.pixelStorei(T.UNPACK_ROW_LENGTH,Ce),T.pixelStorei(T.UNPACK_IMAGE_HEIGHT,ie),T.pixelStorei(T.UNPACK_SKIP_PIXELS,tn),T.pixelStorei(T.UNPACK_SKIP_ROWS,bi),T.pixelStorei(T.UNPACK_SKIP_IMAGES,Xe),N===0&&U.generateMipmaps&&T.generateMipmap(Lt),at.unbindTexture()},this.initRenderTarget=function(E){gt.get(E).__webglFramebuffer===void 0&&b.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?b.setTextureCube(E,0):E.isData3DTexture?b.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?b.setTexture2DArray(E,0):b.setTexture2D(E,0),at.unbindTexture()},this.resetState=function(){L=0,R=0,A=null,at.reset(),ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Un}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===Ja?"display-p3":"srgb",e.unpackColorSpace=se.workingColorSpace===Hr?"display-p3":"srgb"}}class tc{constructor(t,e=1,i=1e3){this.isFog=!0,this.name="",this.color=new Nt(t),this.near=e,this.far=i}clone(){return new tc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class ec extends Wt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Mn,this.environmentIntensity=1,this.environmentRotation=new Mn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Xr extends as{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Nt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const xl=new fe,ba=new Th,ar=new Vr,cr=new P;class nc extends Wt{constructor(t=new Ie,e=new Xr){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const i=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ar.copy(i.boundingSphere),ar.applyMatrix4(s),ar.radius+=r,t.ray.intersectsSphere(ar)===!1)return;xl.copy(s).invert(),ba.copy(t.ray).applyMatrix4(xl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=i.index,f=i.attributes.position;if(l!==null){const u=Math.max(0,o.start),d=Math.min(l.count,o.start+o.count);for(let g=u,x=d;g<x;g++){const p=l.getX(g);cr.fromBufferAttribute(f,p),Ml(cr,p,c,s,t,e,this)}}else{const u=Math.max(0,o.start),d=Math.min(f.count,o.start+o.count);for(let g=u,x=d;g<x;g++)cr.fromBufferAttribute(f,g),Ml(cr,g,c,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Ml(n,t,e,i,s,r,o){const a=ba.distanceSqToPoint(n);if(a<e){const c=new P;ba.closestPointToPoint(n,c),c.applyMatrix4(i);const l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}class zn extends Fe{constructor(t,e,i,s,r,o,a,c,l){super(t,e,i,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Sn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){const e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){const e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let i,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)i=this.getPoint(o/t),r+=i.distanceTo(s),e.push(r),s=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const i=this.getLengths();let s=0;const r=i.length;let o;e?o=e:o=t*i[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=i[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,i[s]===o)return s/(r-1);const h=i[s],u=i[s+1]-h,d=(o-h)/u;return(s+d)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),c=e||(o.isVector2?new rt:new P);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){const i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e){const i=new P,s=[],r=[],o=[],a=new P,c=new fe;for(let d=0;d<=t;d++){const g=d/t;s[d]=this.getTangentAt(g,new P)}r[0]=new P,o[0]=new P;let l=Number.MAX_VALUE;const h=Math.abs(s[0].x),f=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=l&&(l=h,i.set(1,0,0)),f<=l&&(l=f,i.set(0,1,0)),u<=l&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(be(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(c.makeRotationAxis(a,g))}o[d].crossVectors(s[d],r[d])}if(e===!0){let d=Math.acos(be(r[0].dot(r[t]),-1,1));d/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(d=-d);for(let g=1;g<=t;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],d*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class ic extends Sn{constructor(t=0,e=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(t,e=new rt){const i=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+t*r;let c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),f=Math.sin(this.aRotation),u=c-this.aX,d=l-this.aY;c=u*h-d*f+this.aX,l=u*f+d*h+this.aY}return i.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class qg extends ic{constructor(t,e,i,s,r,o){super(t,e,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function sc(){let n=0,t=0,e=0,i=0;function s(r,o,a,c){n=r,t=a,e=-3*r+3*o-2*a-c,i=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,f){let u=(o-r)/l-(a-r)/(l+h)+(a-o)/h,d=(a-o)/h-(c-o)/(h+f)+(c-a)/f;u*=h,d*=h,s(o,a,u,d)},calc:function(r){const o=r*r,a=o*r;return n+t*r+e*o+i*a}}}const lr=new P,Lo=new sc,Io=new sc,Do=new sc;class Gh extends Sn{constructor(t=[],e=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=s}getPoint(t,e=new P){const i=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=s[(a-1)%r]:(lr.subVectors(s[0],s[1]).add(s[0]),l=lr);const f=s[a%r],u=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(lr.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=lr),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let g=Math.pow(l.distanceToSquared(f),d),x=Math.pow(f.distanceToSquared(u),d),p=Math.pow(u.distanceToSquared(h),d);x<1e-4&&(x=1),g<1e-4&&(g=x),p<1e-4&&(p=x),Lo.initNonuniformCatmullRom(l.x,f.x,u.x,h.x,g,x,p),Io.initNonuniformCatmullRom(l.y,f.y,u.y,h.y,g,x,p),Do.initNonuniformCatmullRom(l.z,f.z,u.z,h.z,g,x,p)}else this.curveType==="catmullrom"&&(Lo.initCatmullRom(l.x,f.x,u.x,h.x,this.tension),Io.initCatmullRom(l.y,f.y,u.y,h.y,this.tension),Do.initCatmullRom(l.z,f.z,u.z,h.z,this.tension));return i.set(Lo.calc(c),Io.calc(c),Do.calc(c)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){const s=t.points[e];this.points.push(new P().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Sl(n,t,e,i,s){const r=(i-t)*.5,o=(s-e)*.5,a=n*n,c=n*a;return(2*e-2*i+r+o)*c+(-3*e+3*i-2*r-o)*a+r*n+e}function Kg(n,t){const e=1-n;return e*e*t}function Jg(n,t){return 2*(1-n)*n*t}function Zg(n,t){return n*n*t}function ws(n,t,e,i){return Kg(n,t)+Jg(n,e)+Zg(n,i)}function $g(n,t){const e=1-n;return e*e*e*t}function jg(n,t){const e=1-n;return 3*e*e*n*t}function Qg(n,t){return 3*(1-n)*n*n*t}function t_(n,t){return n*n*n*t}function bs(n,t,e,i,s){return $g(n,t)+jg(n,e)+Qg(n,i)+t_(n,s)}class Hh extends Sn{constructor(t=new rt,e=new rt,i=new rt,s=new rt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new rt){const i=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(bs(t,s.x,r.x,o.x,a.x),bs(t,s.y,r.y,o.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class e_ extends Sn{constructor(t=new P,e=new P,i=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new P){const i=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(bs(t,s.x,r.x,o.x,a.x),bs(t,s.y,r.y,o.y,a.y),bs(t,s.z,r.z,o.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Vh extends Sn{constructor(t=new rt,e=new rt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new rt){const i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new rt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class n_ extends Sn{constructor(t=new P,e=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new P){const i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new P){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Wh extends Sn{constructor(t=new rt,e=new rt,i=new rt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new rt){const i=e,s=this.v0,r=this.v1,o=this.v2;return i.set(ws(t,s.x,r.x,o.x),ws(t,s.y,r.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class i_ extends Sn{constructor(t=new P,e=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new P){const i=e,s=this.v0,r=this.v1,o=this.v2;return i.set(ws(t,s.x,r.x,o.x),ws(t,s.y,r.y,o.y),ws(t,s.z,r.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Xh extends Sn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new rt){const i=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],h=s[o>s.length-2?s.length-1:o+1],f=s[o>s.length-3?s.length-1:o+2];return i.set(Sl(a,c.x,l.x,h.x,f.x),Sl(a,c.y,l.y,h.y,f.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){const s=t.points[e];this.points.push(new rt().fromArray(s))}return this}}var Ta=Object.freeze({__proto__:null,ArcCurve:qg,CatmullRomCurve3:Gh,CubicBezierCurve:Hh,CubicBezierCurve3:e_,EllipseCurve:ic,LineCurve:Vh,LineCurve3:n_,QuadraticBezierCurve:Wh,QuadraticBezierCurve3:i_,SplineCurve:Xh});class s_ extends Sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ta[i](e,t))}return this}getPoint(t,e){const i=t*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=i){const o=s[r]-i,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let i=0,s=this.curves.length;i<s;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let i;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,c=o.getPoints(a);for(let l=0;l<c.length;l++){const h=c[l];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){const s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){const s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){const s=t.curves[e];this.curves.push(new Ta[s.type]().fromJSON(s))}return this}}class Aa extends s_{constructor(t){super(),this.type="Path",this.currentPoint=new rt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const i=new Vh(this.currentPoint.clone(),new rt(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,s){const r=new Wh(this.currentPoint.clone(),new rt(t,e),new rt(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(t,e,i,s,r,o){const a=new Hh(this.currentPoint.clone(),new rt(t,e),new rt(i,s),new rt(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),i=new Xh(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,s,r,o){const a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+a,e+c,i,s,r,o),this}absarc(t,e,i,s,r,o){return this.absellipse(t,e,i,i,s,r,o),this}ellipse(t,e,i,s,r,o,a,c){const l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+l,e+h,i,s,r,o,a,c),this}absellipse(t,e,i,s,r,o,a,c){const l=new ic(t,e,i,s,r,o,a,c);if(this.curves.length>0){const f=l.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(l);const h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class rc extends Ie{constructor(t=[new rt(0,-.5),new rt(.5,0),new rt(0,.5)],e=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:s},e=Math.floor(e),s=be(s,0,Math.PI*2);const r=[],o=[],a=[],c=[],l=[],h=1/e,f=new P,u=new rt,d=new P,g=new P,x=new P;let p=0,m=0;for(let w=0;w<=t.length-1;w++)switch(w){case 0:p=t[w+1].x-t[w].x,m=t[w+1].y-t[w].y,d.x=m*1,d.y=-p,d.z=m*0,x.copy(d),d.normalize(),c.push(d.x,d.y,d.z);break;case t.length-1:c.push(x.x,x.y,x.z);break;default:p=t[w+1].x-t[w].x,m=t[w+1].y-t[w].y,d.x=m*1,d.y=-p,d.z=m*0,g.copy(d),d.x+=x.x,d.y+=x.y,d.z+=x.z,d.normalize(),c.push(d.x,d.y,d.z),x.copy(g)}for(let w=0;w<=e;w++){const y=i+w*h*s,_=Math.sin(y),L=Math.cos(y);for(let R=0;R<=t.length-1;R++){f.x=t[R].x*_,f.y=t[R].y,f.z=t[R].x*L,o.push(f.x,f.y,f.z),u.x=w/e,u.y=R/(t.length-1),a.push(u.x,u.y);const A=c[3*R+0]*_,D=c[3*R+1],V=c[3*R+0]*L;l.push(A,D,V)}}for(let w=0;w<e;w++)for(let y=0;y<t.length-1;y++){const _=y+w*t.length,L=_,R=_+t.length,A=_+t.length+1,D=_+1;r.push(L,R,D),r.push(A,D,R)}this.setIndex(r),this.setAttribute("position",new de(o,3)),this.setAttribute("uv",new de(a,2)),this.setAttribute("normal",new de(l,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new rc(t.points,t.segments,t.phiStart,t.phiLength)}}class Zn extends rc{constructor(t=1,e=1,i=4,s=8){const r=new Aa;r.absarc(0,-e/2,t,Math.PI*1.5,0),r.absarc(0,e/2,t,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:t,length:e,capSegments:i,radialSegments:s}}static fromJSON(t){return new Zn(t.radius,t.length,t.capSegments,t.radialSegments)}}class Dt extends Ie{constructor(t=1,e=1,i=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const h=[],f=[],u=[],d=[];let g=0;const x=[],p=i/2;let m=0;w(),o===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new de(f,3)),this.setAttribute("normal",new de(u,3)),this.setAttribute("uv",new de(d,2));function w(){const _=new P,L=new P;let R=0;const A=(e-t)/i;for(let D=0;D<=r;D++){const V=[],v=D/r,S=v*(e-t)+t;for(let F=0;F<=s;F++){const z=F/s,H=z*c+a,J=Math.sin(H),G=Math.cos(H);L.x=S*J,L.y=-v*i+p,L.z=S*G,f.push(L.x,L.y,L.z),_.set(J,A,G).normalize(),u.push(_.x,_.y,_.z),d.push(z,1-v),V.push(g++)}x.push(V)}for(let D=0;D<s;D++)for(let V=0;V<r;V++){const v=x[V][D],S=x[V+1][D],F=x[V+1][D+1],z=x[V][D+1];t>0&&(h.push(v,S,z),R+=3),e>0&&(h.push(S,F,z),R+=3)}l.addGroup(m,R,0),m+=R}function y(_){const L=g,R=new rt,A=new P;let D=0;const V=_===!0?t:e,v=_===!0?1:-1;for(let F=1;F<=s;F++)f.push(0,p*v,0),u.push(0,v,0),d.push(.5,.5),g++;const S=g;for(let F=0;F<=s;F++){const H=F/s*c+a,J=Math.cos(H),G=Math.sin(H);A.x=V*G,A.y=p*v,A.z=V*J,f.push(A.x,A.y,A.z),u.push(0,v,0),R.x=J*.5+.5,R.y=G*.5*v+.5,d.push(R.x,R.y),g++}for(let F=0;F<s;F++){const z=L+F,H=S+F;_===!0?h.push(H,H+1,z):h.push(H+1,H,z),D+=3}l.addGroup(m,D,_===!0?1:2),m+=D}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Dt(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class $e extends Dt{constructor(t=1,e=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new $e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Yh extends Aa{constructor(t){super(t),this.uuid=Ei(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let i=0,s=this.holes.length;i<s;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){const s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){const s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){const s=t.holes[e];this.holes.push(new Aa().fromJSON(s))}return this}}const r_={triangulate:function(n,t,e=2){const i=t&&t.length,s=i?t[0]*e:n.length;let r=qh(n,0,s,e,!0);const o=[];if(!r||r.next===r.prev)return o;let a,c,l,h,f,u,d;if(i&&(r=h_(n,t,r,e)),n.length>80*e){a=l=n[0],c=h=n[1];for(let g=e;g<s;g+=e)f=n[g],u=n[g+1],f<a&&(a=f),u<c&&(c=u),f>l&&(l=f),u>h&&(h=u);d=Math.max(l-a,h-c),d=d!==0?32767/d:0}return Ps(r,o,e,a,c,d,0),o}};function qh(n,t,e,i,s){let r,o;if(s===S_(n,t,e,i)>0)for(r=t;r<e;r+=i)o=yl(r,n[r],n[r+1],o);else for(r=e-i;r>=t;r-=i)o=yl(r,n[r],n[r+1],o);return o&&Yr(o,o.next)&&(Is(o),o=o.next),o}function Si(n,t){if(!n)return n;t||(t=n);let e=n,i;do if(i=!1,!e.steiner&&(Yr(e,e.next)||ge(e.prev,e,e.next)===0)){if(Is(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function Ps(n,t,e,i,s,r,o){if(!n)return;!o&&r&&m_(n,i,s,r);let a=n,c,l;for(;n.prev!==n.next;){if(c=n.prev,l=n.next,r?a_(n,i,s,r):o_(n)){t.push(c.i/e|0),t.push(n.i/e|0),t.push(l.i/e|0),Is(n),n=l.next,a=l.next;continue}if(n=l,n===a){o?o===1?(n=c_(Si(n),t,e),Ps(n,t,e,i,s,r,2)):o===2&&l_(n,t,e,i,s,r):Ps(Si(n),t,e,i,s,r,1);break}}}function o_(n){const t=n.prev,e=n,i=n.next;if(ge(t,e,i)>=0)return!1;const s=t.x,r=e.x,o=i.x,a=t.y,c=e.y,l=i.y,h=s<r?s<o?s:o:r<o?r:o,f=a<c?a<l?a:l:c<l?c:l,u=s>r?s>o?s:o:r>o?r:o,d=a>c?a>l?a:l:c>l?c:l;let g=i.next;for(;g!==t;){if(g.x>=h&&g.x<=u&&g.y>=f&&g.y<=d&&Wi(s,a,r,c,o,l,g.x,g.y)&&ge(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function a_(n,t,e,i){const s=n.prev,r=n,o=n.next;if(ge(s,r,o)>=0)return!1;const a=s.x,c=r.x,l=o.x,h=s.y,f=r.y,u=o.y,d=a<c?a<l?a:l:c<l?c:l,g=h<f?h<u?h:u:f<u?f:u,x=a>c?a>l?a:l:c>l?c:l,p=h>f?h>u?h:u:f>u?f:u,m=Ra(d,g,t,e,i),w=Ra(x,p,t,e,i);let y=n.prevZ,_=n.nextZ;for(;y&&y.z>=m&&_&&_.z<=w;){if(y.x>=d&&y.x<=x&&y.y>=g&&y.y<=p&&y!==s&&y!==o&&Wi(a,h,c,f,l,u,y.x,y.y)&&ge(y.prev,y,y.next)>=0||(y=y.prevZ,_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==s&&_!==o&&Wi(a,h,c,f,l,u,_.x,_.y)&&ge(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;y&&y.z>=m;){if(y.x>=d&&y.x<=x&&y.y>=g&&y.y<=p&&y!==s&&y!==o&&Wi(a,h,c,f,l,u,y.x,y.y)&&ge(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;_&&_.z<=w;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==s&&_!==o&&Wi(a,h,c,f,l,u,_.x,_.y)&&ge(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function c_(n,t,e){let i=n;do{const s=i.prev,r=i.next.next;!Yr(s,r)&&Kh(s,i,i.next,r)&&Ls(s,r)&&Ls(r,s)&&(t.push(s.i/e|0),t.push(i.i/e|0),t.push(r.i/e|0),Is(i),Is(i.next),i=n=r),i=i.next}while(i!==n);return Si(i)}function l_(n,t,e,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&v_(o,a)){let c=Jh(o,a);o=Si(o,o.next),c=Si(c,c.next),Ps(o,t,e,i,s,r,0),Ps(c,t,e,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function h_(n,t,e,i){const s=[];let r,o,a,c,l;for(r=0,o=t.length;r<o;r++)a=t[r]*i,c=r<o-1?t[r+1]*i:n.length,l=qh(n,a,c,i,!1),l===l.next&&(l.steiner=!0),s.push(__(l));for(s.sort(u_),r=0;r<s.length;r++)e=f_(s[r],e);return e}function u_(n,t){return n.x-t.x}function f_(n,t){const e=d_(n,t);if(!e)return t;const i=Jh(e,n);return Si(i,i.next),Si(e,e.next)}function d_(n,t){let e=t,i=-1/0,s;const r=n.x,o=n.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){const u=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=r&&u>i&&(i=u,s=e.x<e.next.x?e:e.next,u===r))return s}e=e.next}while(e!==t);if(!s)return null;const a=s,c=s.x,l=s.y;let h=1/0,f;e=s;do r>=e.x&&e.x>=c&&r!==e.x&&Wi(o<l?r:i,o,c,l,o<l?i:r,o,e.x,e.y)&&(f=Math.abs(o-e.y)/(r-e.x),Ls(e,n)&&(f<h||f===h&&(e.x>s.x||e.x===s.x&&p_(s,e)))&&(s=e,h=f)),e=e.next;while(e!==a);return s}function p_(n,t){return ge(n.prev,n,t.prev)<0&&ge(t.next,n,n.next)<0}function m_(n,t,e,i){let s=n;do s.z===0&&(s.z=Ra(s.x,s.y,t,e,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,g_(s)}function g_(n){let t,e,i,s,r,o,a,c,l=1;do{for(e=n,n=null,r=null,o=0;e;){for(o++,i=e,a=0,t=0;t<l&&(a++,i=i.nextZ,!!i);t++);for(c=l;a>0||c>0&&i;)a!==0&&(c===0||!i||e.z<=i.z)?(s=e,e=e.nextZ,a--):(s=i,i=i.nextZ,c--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;e=i}r.nextZ=null,l*=2}while(o>1);return n}function Ra(n,t,e,i,s){return n=(n-e)*s|0,t=(t-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,n|t<<1}function __(n){let t=n,e=n;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==n);return e}function Wi(n,t,e,i,s,r,o,a){return(s-o)*(t-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(i-a)}function v_(n,t){return n.next.i!==t.i&&n.prev.i!==t.i&&!x_(n,t)&&(Ls(n,t)&&Ls(t,n)&&M_(n,t)&&(ge(n.prev,n,t.prev)||ge(n,t.prev,t))||Yr(n,t)&&ge(n.prev,n,n.next)>0&&ge(t.prev,t,t.next)>0)}function ge(n,t,e){return(t.y-n.y)*(e.x-t.x)-(t.x-n.x)*(e.y-t.y)}function Yr(n,t){return n.x===t.x&&n.y===t.y}function Kh(n,t,e,i){const s=ur(ge(n,t,e)),r=ur(ge(n,t,i)),o=ur(ge(e,i,n)),a=ur(ge(e,i,t));return!!(s!==r&&o!==a||s===0&&hr(n,e,t)||r===0&&hr(n,i,t)||o===0&&hr(e,n,i)||a===0&&hr(e,t,i))}function hr(n,t,e){return t.x<=Math.max(n.x,e.x)&&t.x>=Math.min(n.x,e.x)&&t.y<=Math.max(n.y,e.y)&&t.y>=Math.min(n.y,e.y)}function ur(n){return n>0?1:n<0?-1:0}function x_(n,t){let e=n;do{if(e.i!==n.i&&e.next.i!==n.i&&e.i!==t.i&&e.next.i!==t.i&&Kh(e,e.next,n,t))return!0;e=e.next}while(e!==n);return!1}function Ls(n,t){return ge(n.prev,n,n.next)<0?ge(n,t,n.next)>=0&&ge(n,n.prev,t)>=0:ge(n,t,n.prev)<0||ge(n,n.next,t)<0}function M_(n,t){let e=n,i=!1;const s=(n.x+t.x)/2,r=(n.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==n);return i}function Jh(n,t){const e=new Ca(n.i,n.x,n.y),i=new Ca(t.i,t.x,t.y),s=n.next,r=t.prev;return n.next=t,t.prev=n,e.next=s,s.prev=e,i.next=e,e.prev=i,r.next=i,i.prev=r,i}function yl(n,t,e,i){const s=new Ca(n,t,e);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function Is(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Ca(n,t,e){this.i=n,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function S_(n,t,e,i){let s=0;for(let r=t,o=e-i;r<e;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}class Ts{static area(t){const e=t.length;let i=0;for(let s=e-1,r=0;r<e;s=r++)i+=t[s].x*t[r].y-t[r].x*t[s].y;return i*.5}static isClockWise(t){return Ts.area(t)<0}static triangulateShape(t,e){const i=[],s=[],r=[];El(t),wl(i,t);let o=t.length;e.forEach(El);for(let c=0;c<e.length;c++)s.push(o),o+=e[c].length,wl(i,e[c]);const a=r_.triangulate(i,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}}function El(n){const t=n.length;t>2&&n[t-1].equals(n[0])&&n.pop()}function wl(n,t){for(let e=0;e<t.length;e++)n.push(t[e].x),n.push(t[e].y)}class oc extends Ie{constructor(t=new Yh([new rt(.5,.5),new rt(-.5,.5),new rt(-.5,-.5),new rt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const i=this,s=[],r=[];for(let a=0,c=t.length;a<c;a++){const l=t[a];o(l)}this.setAttribute("position",new de(s,3)),this.setAttribute("uv",new de(r,2)),this.computeVertexNormals();function o(a){const c=[],l=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,f=e.depth!==void 0?e.depth:1;let u=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:d-.1,x=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3;const m=e.extrudePath,w=e.UVGenerator!==void 0?e.UVGenerator:y_;let y,_=!1,L,R,A,D;m&&(y=m.getSpacedPoints(h),_=!0,u=!1,L=m.computeFrenetFrames(h,!1),R=new P,A=new P,D=new P),u||(p=0,d=0,g=0,x=0);const V=a.extractPoints(l);let v=V.shape;const S=V.holes;if(!Ts.isClockWise(v)){v=v.reverse();for(let Z=0,T=S.length;Z<T;Z++){const ot=S[Z];Ts.isClockWise(ot)&&(S[Z]=ot.reverse())}}const z=Ts.triangulateShape(v,S),H=v;for(let Z=0,T=S.length;Z<T;Z++){const ot=S[Z];v=v.concat(ot)}function J(Z,T,ot){return T||console.error("THREE.ExtrudeGeometry: vec does not exist"),Z.clone().addScaledVector(T,ot)}const G=v.length,Q=z.length;function X(Z,T,ot){let st,tt,at;const Pt=Z.x-T.x,gt=Z.y-T.y,b=ot.x-Z.x,M=ot.y-Z.y,O=Pt*Pt+gt*gt,q=Pt*M-gt*b;if(Math.abs(q)>Number.EPSILON){const $=Math.sqrt(O),K=Math.sqrt(b*b+M*M),bt=T.x-gt/$,ct=T.y+Pt/$,xt=ot.x-M/K,Jt=ot.y+b/K,nt=((xt-bt)*M-(Jt-ct)*b)/(Pt*M-gt*b);st=bt+Pt*nt-Z.x,tt=ct+gt*nt-Z.y;const Mt=st*st+tt*tt;if(Mt<=2)return new rt(st,tt);at=Math.sqrt(Mt/2)}else{let $=!1;Pt>Number.EPSILON?b>Number.EPSILON&&($=!0):Pt<-Number.EPSILON?b<-Number.EPSILON&&($=!0):Math.sign(gt)===Math.sign(M)&&($=!0),$?(st=-gt,tt=Pt,at=Math.sqrt(O)):(st=Pt,tt=gt,at=Math.sqrt(O/2))}return new rt(st/at,tt/at)}const ut=[];for(let Z=0,T=H.length,ot=T-1,st=Z+1;Z<T;Z++,ot++,st++)ot===T&&(ot=0),st===T&&(st=0),ut[Z]=X(H[Z],H[ot],H[st]);const pt=[];let mt,Kt=ut.concat();for(let Z=0,T=S.length;Z<T;Z++){const ot=S[Z];mt=[];for(let st=0,tt=ot.length,at=tt-1,Pt=st+1;st<tt;st++,at++,Pt++)at===tt&&(at=0),Pt===tt&&(Pt=0),mt[st]=X(ot[st],ot[at],ot[Pt]);pt.push(mt),Kt=Kt.concat(mt)}for(let Z=0;Z<p;Z++){const T=Z/p,ot=d*Math.cos(T*Math.PI/2),st=g*Math.sin(T*Math.PI/2)+x;for(let tt=0,at=H.length;tt<at;tt++){const Pt=J(H[tt],ut[tt],st);ht(Pt.x,Pt.y,-ot)}for(let tt=0,at=S.length;tt<at;tt++){const Pt=S[tt];mt=pt[tt];for(let gt=0,b=Pt.length;gt<b;gt++){const M=J(Pt[gt],mt[gt],st);ht(M.x,M.y,-ot)}}}const jt=g+x;for(let Z=0;Z<G;Z++){const T=u?J(v[Z],Kt[Z],jt):v[Z];_?(A.copy(L.normals[0]).multiplyScalar(T.x),R.copy(L.binormals[0]).multiplyScalar(T.y),D.copy(y[0]).add(A).add(R),ht(D.x,D.y,D.z)):ht(T.x,T.y,0)}for(let Z=1;Z<=h;Z++)for(let T=0;T<G;T++){const ot=u?J(v[T],Kt[T],jt):v[T];_?(A.copy(L.normals[Z]).multiplyScalar(ot.x),R.copy(L.binormals[Z]).multiplyScalar(ot.y),D.copy(y[Z]).add(A).add(R),ht(D.x,D.y,D.z)):ht(ot.x,ot.y,f/h*Z)}for(let Z=p-1;Z>=0;Z--){const T=Z/p,ot=d*Math.cos(T*Math.PI/2),st=g*Math.sin(T*Math.PI/2)+x;for(let tt=0,at=H.length;tt<at;tt++){const Pt=J(H[tt],ut[tt],st);ht(Pt.x,Pt.y,f+ot)}for(let tt=0,at=S.length;tt<at;tt++){const Pt=S[tt];mt=pt[tt];for(let gt=0,b=Pt.length;gt<b;gt++){const M=J(Pt[gt],mt[gt],st);_?ht(M.x,M.y+y[h-1].y,y[h-1].x+ot):ht(M.x,M.y,f+ot)}}}Y(),et();function Y(){const Z=s.length/3;if(u){let T=0,ot=G*T;for(let st=0;st<Q;st++){const tt=z[st];Ot(tt[2]+ot,tt[1]+ot,tt[0]+ot)}T=h+p*2,ot=G*T;for(let st=0;st<Q;st++){const tt=z[st];Ot(tt[0]+ot,tt[1]+ot,tt[2]+ot)}}else{for(let T=0;T<Q;T++){const ot=z[T];Ot(ot[2],ot[1],ot[0])}for(let T=0;T<Q;T++){const ot=z[T];Ot(ot[0]+G*h,ot[1]+G*h,ot[2]+G*h)}}i.addGroup(Z,s.length/3-Z,0)}function et(){const Z=s.length/3;let T=0;St(H,T),T+=H.length;for(let ot=0,st=S.length;ot<st;ot++){const tt=S[ot];St(tt,T),T+=tt.length}i.addGroup(Z,s.length/3-Z,1)}function St(Z,T){let ot=Z.length;for(;--ot>=0;){const st=ot;let tt=ot-1;tt<0&&(tt=Z.length-1);for(let at=0,Pt=h+p*2;at<Pt;at++){const gt=G*at,b=G*(at+1),M=T+st+gt,O=T+tt+gt,q=T+tt+b,$=T+st+b;Ut(M,O,q,$)}}}function ht(Z,T,ot){c.push(Z),c.push(T),c.push(ot)}function Ot(Z,T,ot){Gt(Z),Gt(T),Gt(ot);const st=s.length/3,tt=w.generateTopUV(i,s,st-3,st-2,st-1);qt(tt[0]),qt(tt[1]),qt(tt[2])}function Ut(Z,T,ot,st){Gt(Z),Gt(T),Gt(st),Gt(T),Gt(ot),Gt(st);const tt=s.length/3,at=w.generateSideWallUV(i,s,tt-6,tt-3,tt-2,tt-1);qt(at[0]),qt(at[1]),qt(at[3]),qt(at[1]),qt(at[2]),qt(at[3])}function Gt(Z){s.push(c[Z*3+0]),s.push(c[Z*3+1]),s.push(c[Z*3+2])}function qt(Z){r.push(Z.x),r.push(Z.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return E_(e,i,t)}static fromJSON(t,e){const i=[];for(let r=0,o=t.shapes.length;r<o;r++){const a=e[t.shapes[r]];i.push(a)}const s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Ta[s.type]().fromJSON(s)),new oc(i,t.options)}}const y_={generateTopUV:function(n,t,e,i,s){const r=t[e*3],o=t[e*3+1],a=t[i*3],c=t[i*3+1],l=t[s*3],h=t[s*3+1];return[new rt(r,o),new rt(a,c),new rt(l,h)]},generateSideWallUV:function(n,t,e,i,s,r){const o=t[e*3],a=t[e*3+1],c=t[e*3+2],l=t[i*3],h=t[i*3+1],f=t[i*3+2],u=t[s*3],d=t[s*3+1],g=t[s*3+2],x=t[r*3],p=t[r*3+1],m=t[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new rt(o,1-c),new rt(l,1-f),new rt(u,1-g),new rt(x,1-m)]:[new rt(a,1-c),new rt(h,1-f),new rt(d,1-g),new rt(p,1-m)]}};function E_(n,t,e){if(e.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){const r=n[i];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class qr extends Ie{constructor(t=.5,e=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);const a=[],c=[],l=[],h=[];let f=t;const u=(e-t)/s,d=new P,g=new rt;for(let x=0;x<=s;x++){for(let p=0;p<=i;p++){const m=r+p/i*o;d.x=f*Math.cos(m),d.y=f*Math.sin(m),c.push(d.x,d.y,d.z),l.push(0,0,1),g.x=(d.x/e+1)/2,g.y=(d.y/e+1)/2,h.push(g.x,g.y)}f+=u}for(let x=0;x<s;x++){const p=x*(i+1);for(let m=0;m<i;m++){const w=m+p,y=w,_=w+i+1,L=w+i+2,R=w+1;a.push(y,_,R),a.push(_,L,R)}}this.setIndex(a),this.setAttribute("position",new de(c,3)),this.setAttribute("normal",new de(l,3)),this.setAttribute("uv",new de(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qr(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Vt extends Ie{constructor(t=1,e=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));const c=Math.min(o+a,Math.PI);let l=0;const h=[],f=new P,u=new P,d=[],g=[],x=[],p=[];for(let m=0;m<=i;m++){const w=[],y=m/i;let _=0;m===0&&o===0?_=.5/e:m===i&&c===Math.PI&&(_=-.5/e);for(let L=0;L<=e;L++){const R=L/e;f.x=-t*Math.cos(s+R*r)*Math.sin(o+y*a),f.y=t*Math.cos(o+y*a),f.z=t*Math.sin(s+R*r)*Math.sin(o+y*a),g.push(f.x,f.y,f.z),u.copy(f).normalize(),x.push(u.x,u.y,u.z),p.push(R+_,1-y),w.push(l++)}h.push(w)}for(let m=0;m<i;m++)for(let w=0;w<e;w++){const y=h[m][w+1],_=h[m][w],L=h[m+1][w],R=h[m+1][w+1];(m!==0||o>0)&&d.push(y,_,R),(m!==i-1||c<Math.PI)&&d.push(_,L,R)}this.setIndex(d),this.setAttribute("position",new de(g,3)),this.setAttribute("normal",new de(x,3)),this.setAttribute("uv",new de(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Vt(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class pe extends Ie{constructor(t=1,e=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);const o=[],a=[],c=[],l=[],h=new P,f=new P,u=new P;for(let d=0;d<=i;d++)for(let g=0;g<=s;g++){const x=g/s*r,p=d/i*Math.PI*2;f.x=(t+e*Math.cos(p))*Math.cos(x),f.y=(t+e*Math.cos(p))*Math.sin(x),f.z=e*Math.sin(p),a.push(f.x,f.y,f.z),h.x=t*Math.cos(x),h.y=t*Math.sin(x),u.subVectors(f,h).normalize(),c.push(u.x,u.y,u.z),l.push(g/s),l.push(d/i)}for(let d=1;d<=i;d++)for(let g=1;g<=s;g++){const x=(s+1)*d+g-1,p=(s+1)*(d-1)+g-1,m=(s+1)*(d-1)+g,w=(s+1)*d+g;o.push(x,p,w),o.push(p,m,w)}this.setIndex(o),this.setAttribute("position",new de(a,3)),this.setAttribute("normal",new de(c,3)),this.setAttribute("uv",new de(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new pe(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class Pe extends as{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Nt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Nt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Mh,this.normalScale=new rt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class w_ extends Pe{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new rt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return be(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Nt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Nt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Nt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class ac extends Wt{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Nt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Zh extends ac{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Wt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Nt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const Uo=new fe,bl=new P,Tl=new P;class $h{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new rt(512,512),this.map=null,this.mapPass=null,this.matrix=new fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $a,this._frameExtents=new rt(1,1),this._viewportCount=1,this._viewports=[new oe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,i=this.matrix;bl.setFromMatrixPosition(t.matrixWorld),e.position.copy(bl),Tl.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Tl),e.updateMatrixWorld(),Uo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Uo),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Uo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Al=new fe,ps=new P,No=new P;class b_ extends $h{constructor(){super(new ke(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new rt(4,2),this._viewportCount=6,this._viewports=[new oe(2,1,1,1),new oe(0,1,1,1),new oe(3,1,1,1),new oe(1,1,1,1),new oe(3,0,1,1),new oe(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(t,e=0){const i=this.camera,s=this.matrix,r=t.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),ps.setFromMatrixPosition(t.matrixWorld),i.position.copy(ps),No.copy(i.position),No.add(this._cubeDirections[e]),i.up.copy(this._cubeUps[e]),i.lookAt(No),i.updateMatrixWorld(),s.makeTranslation(-ps.x,-ps.y,-ps.z),Al.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Al)}}class T_ extends ac{constructor(t,e,i=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new b_}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class A_ extends $h{constructor(){super(new ja(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ur extends ac{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Wt.DEFAULT_UP),this.updateMatrix(),this.target=new Wt,this.shadow=new A_}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class R_{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Rl(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=Rl();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function Rl(){return performance.now()}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ha}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ha);const C_={_:"The palette keys obstacles paint with. `body` takes the zone's roughness/metalness; `glow` emits, tinted by the body colour named in emissiveFrom so a highlight never fights the paint it sits on. Adding a key here means adding it to every zone — nothing in world.js needs to change.",hurdle:{finish:"body"},hurdleBar:{finish:"glow",emissiveFrom:"hurdle"},tall:{finish:"body"},tallBar:{finish:"glow",emissiveFrom:"tall"},block:{finish:"body"},blockStripe:{finish:"glow",emissiveFrom:"block"},hop:{finish:"body"},hopGlow:{finish:"glow",emissiveFrom:"hop"},stomp:{finish:"body"},stompGlow:{finish:"glow",emissiveFrom:"stomp"},window:{finish:"body"},windowBar:{finish:"glow",emissiveFrom:"window"},door:{finish:"body"},doorGlow:{finish:"glow",emissiveFrom:"door"},thief:{finish:"body"},thiefGlow:{finish:"glow",emissiveFrom:"thief"}},P_={hurdle:{height:1},tall:{height:1.9},block:{height:3.2},hopper:{height:.46,restY:2},stomp:{height:.65},window:{height:4.1,gap:[1,3.7]},door:{height:3.2,gap:[0,2]},slider:{height:3.2},scuttler:{height:1},thief:{height:.9}},jh={materials:C_,types:P_},we=[-2.2,0,2.2],Nr=14,Qh=42,L_=1/60,I_=.55,tu=n=>Math.min(1,Math.max(0,(n-Nr)/(Qh-Nr))),D_=45,U_=10.5,N_=.2,O_=.22,F_=1.9,z_=.13,Cl=.17,B_=-120,ms=12,Pl=.66,k_=.46,G_=.55,eu=200,nu=.35,Pa=100,H_=40,V_=80,W_=12,X_=[0,500,1200,2500,4500,7500,12e3,18e3,26e3,36e3,5e4],Y_=["Basic","Bronze","Silver","Gold","Jade","Sapphire","Ruby","Plasma","Ice","Nova","Void"],q_=n=>X_.filter(t=>n>=t).length,He=jh.types,iu=He.hurdle.height,Ln=He.block.height,su=He.tall.height,ru=He.hopper.restY,K_=He.hopper.restY+He.hopper.height,mn=He.stomp.height,ou=He.window.height,J_=He.window.gap,La=He.door.height,Er=He.door.gap,Hi=He.slider.height,Z_=He.scuttler.height,$_=He.thief.height,j_=12,Q_={cadet:{body:"#6ea8ff",dark:"#2a3a5c",accent:"#ffd24a",glow:"#2ad4ff",desc:"Standard issue",rough:.3,metal:.4,coat:.85,fuzz:0,warm:.1,flicker:.12,light:.7,deco:"thrusters",aura:{color:"#2ad4ff",tip:"#dff4ff",count:20,rise:1.4,swirl:2.2,spread:.46,size:.09,life:.45},parts:{mitts:"dark"}},ember:{body:"#ff7a4d",dark:"#4a1f14",accent:"#ffe08a",glow:"#ff3b2f",desc:"Running hot",rough:.66,metal:.08,coat:.15,fuzz:.25,warm:.42,flicker:.55,light:1.9,deco:"torch",ears:"cat",aura:{color:"#ff4a12",tip:"#ffe08a",count:44,rise:1.8,swirl:1,spread:.5,size:.15,life:.8},parts:{mitts:"glow",scarf:"dark"}},moss:{body:"#5fd39a",dark:"#1f4436",accent:"#e8ffcc",glow:"#9dff5e",desc:"Bioluminescent",rough:.82,metal:.02,coat:.05,fuzz:.9,warm:.18,flicker:.15,light:.8,deco:"mushrooms",ears:"lop",aura:{color:"#9dff5e",tip:"#e8ffcc",count:30,rise:.5,swirl:.6,spread:.58,size:.13,life:1.8},parts:{ears:"accent",scarf:"glow"}},void:{body:"#8a7bff",dark:"#241a4d",accent:"#f0eaff",glow:"#c06bff",desc:"Between stars",rough:.18,metal:.7,coat:1,fuzz:0,warm:.3,flicker:.3,light:1.2,deco:"orbit",ears:"fin",aura:{color:"#c06bff",tip:"#f0eaff",count:34,rise:-.45,swirl:2.6,spread:.62,size:.12,life:1.4},parts:{scarf:"glow",mitts:"dark",boots:"dark"}},guanyu:{body:"#37d067",dark:"#164a28",accent:"#dcf7e6",glow:"#3dff9e",name:"GUAN YU",desc:"關羽 · Green Dragon",rough:.35,metal:.3,coat:.9,fuzz:0,warm:.16,flicker:.1,light:.9,deco:"glaive",aura:{color:"#3dff9e",tip:"#dcf7e6",count:26,rise:-.15,swirl:3,spread:.62,size:.1,life:.9},parts:{mitts:"dark",scarf:"glow"}},zhugeliang:{body:"#cbdcec",dark:"#26404f",accent:"#ffffff",glow:"#4ae0ff",name:"ZHUGE LIANG",desc:"諸葛亮 · Crane Feather",rough:.55,metal:.05,coat:.2,fuzz:.55,warm:.12,flicker:.08,light:.6,deco:"fan",ears:"fin",aura:{color:"#4ae0ff",tip:"#ffffff",count:22,rise:-.4,swirl:.5,spread:.6,size:.2,life:2.4},parts:{mitts:"body",scarf:"dark"}},zhouyu:{body:"#2ecad1",dark:"#154b4f",accent:"#dcfbff",glow:"#ff8a2b",name:"ZHOU YU",desc:"周瑜 · Red Cliffs",rough:.3,metal:.35,coat:.85,fuzz:0,warm:.05,flicker:.45,light:.85,deco:"zither",ears:"cat",aura:{color:"#ff5a12",tip:"#ffd08a",count:46,rise:2,swirl:1.2,spread:.5,size:.14,life:.7},parts:{band:"glow",mitts:"dark"}},huangzhong:{body:"#b8c449",dark:"#464d18",accent:"#f6ffdc",glow:"#e3ff33",name:"HUANG ZHONG",desc:"黃忠 · Bowstring",rough:.75,metal:.25,coat:.1,fuzz:.2,warm:.14,flicker:.2,light:.7,deco:"bow",aura:{color:"#e3ff33",tip:"#f6ffdc",count:16,rise:2.6,swirl:.3,spread:.55,size:.1,life:.4},parts:{mitts:"dark",scarf:"dark"}},caocao:{body:"#bd82ec",dark:"#371d4b",accent:"#f5e2ff",glow:"#e05eff",name:"CAO CAO",desc:"曹操 · Sable Chancellor",rough:.2,metal:.65,coat:1,fuzz:0,warm:.28,flicker:.25,light:1.1,deco:"jian",ears:"horn",aura:{color:"#a03ce0",tip:"#f5e2ff",count:28,rise:.35,swirl:.9,spread:.5,size:.16,life:2.2},parts:{ears:"dark",boots:"dark"}},diaochan:{body:"#f279a8",dark:"#4d1b30",accent:"#ffe6f0",glow:"#ff5ec8",name:"DIAOCHAN",desc:"貂蟬 · Moonlit Petals",rough:.6,metal:.08,coat:.35,fuzz:.75,warm:.2,flicker:.1,light:.8,deco:"moon",ears:"lop",aura:{color:"#ff5ec8",tip:"#ffe6f0",count:24,rise:-.55,swirl:1.6,spread:.66,size:.18,life:2},parts:{ears:"accent",boots:"glow"}},boba:{body:"#d9a877",dark:"#4a2e1a",accent:"#fff1dc",glow:"#ffa726",name:"BOBA",desc:"珍珠奶茶 · Extra pearls",rough:.25,metal:.05,coat:.9,fuzz:0,warm:.08,flicker:.1,light:.6,deco:"boba",aura:{color:"#ffa726",tip:"#fff1dc",count:22,rise:.9,swirl:1.2,spread:.5,size:.12,life:1.2},parts:{ears:"dark",mitts:"dark"}},avocado:{body:"#a4d65e",dark:"#2f4a12",accent:"#f3f8cf",glow:"#b8ff3d",name:"AVOCADO",desc:"Guac mode",rough:.55,metal:.02,coat:.3,fuzz:.2,warm:.1,flicker:.08,light:.6,deco:"avocado",aura:{color:"#b8ff3d",tip:"#f3f8cf",count:16,rise:.3,swirl:.5,spread:.5,size:.14,life:1.8},parts:{scarf:"dark",mitts:"dark"}},dragonfruit:{body:"#ee6cc4",dark:"#4a1538",accent:"#fff2fb",glow:"#ff2bd6",name:"DRAGONFRUIT",desc:"火龍果 · Scales on",rough:.35,metal:.1,coat:.7,fuzz:.1,warm:.15,flicker:.15,light:.8,deco:"dragonfruit",aura:{color:"#ff2bd6",tip:"#fff2fb",count:24,rise:-.3,swirl:1.4,spread:.55,size:.11,life:1.5},parts:{ears:"accent",mitts:"dark"}},ramen:{body:"#eef1f4",dark:"#2b3038",accent:"#ffd9e3",glow:"#ff9500",name:"RAMEN",desc:"拉麵 · Egg, extra",rough:.15,metal:.05,coat:1,fuzz:0,warm:.05,flicker:.05,light:.5,deco:"ramen",aura:{color:"#ffd9a0",tip:"#ffffff",count:26,rise:1.1,swirl:.6,spread:.5,size:.18,life:1.6},parts:{ears:"accent",scarf:"glow"}},mintchip:{body:"#93e8cf",dark:"#16463a",accent:"#f4fff9",glow:"#2bffb0",name:"MINT CHIP",desc:"Two scoops",rough:.3,metal:.1,coat:.8,fuzz:.15,warm:.12,flicker:.1,light:.7,deco:"cone",aura:{color:"#2bffb0",tip:"#f4fff9",count:20,rise:-.4,swirl:.8,spread:.55,size:.15,life:1.6},parts:{ears:"dark",boots:"dark"}},mars:{body:"#dc7e57",dark:"#4a2416",accent:"#ffdcc4",glow:"#ff6933",name:"MARS",desc:"火星 · Rover aboard",rough:.9,metal:.02,coat:0,fuzz:.3,warm:.12,flicker:.1,light:.7,deco:"rover",ears:"horn",aura:{color:"#e0784a",tip:"#ffdcc4",count:28,rise:.4,swirl:1.8,spread:.55,size:.14,life:1.2},parts:{mitts:"dark",boots:"dark"}},venus:{body:"#e1dd6b",dark:"#514d1f",accent:"#fff8d6",glow:"#f6ff3d",name:"VENUS",desc:"金星 · Volcanic, veiled",rough:.5,metal:.05,coat:.3,fuzz:.6,warm:.3,flicker:.2,light:1,deco:"volcano",ears:"lop",aura:{color:"#f6ff3d",tip:"#fff8d6",count:30,rise:.25,swirl:.9,spread:.6,size:.2,life:2},parts:{scarf:"glow",mitts:"body"}},earth:{body:"#53b2ea",dark:"#1c3a54",accent:"#f0f8ff",glow:"#33ff44",name:"EARTH",desc:"地球 · Home turf",rough:.35,metal:.1,coat:.7,fuzz:.1,warm:.1,flicker:.05,light:.7,deco:"satellite",aura:{color:"#53b2ea",tip:"#f0f8ff",count:24,rise:.2,swirl:2.4,spread:.58,size:.13,life:1.4},parts:{ears:"accent",boots:"dark"}},saturn:{body:"#e1c498",dark:"#513b1f",accent:"#fff4e0",glow:"#4dc4ff",name:"SATURN",desc:"土星 · Rings on",rough:.6,metal:.05,coat:.2,fuzz:.5,warm:.1,flicker:.08,light:.7,deco:"rings",aura:{color:"#4dc4ff",tip:"#fff4e0",count:26,rise:0,swirl:3.4,spread:.62,size:.1,life:1.6},parts:{band:"glow",mitts:"dark"}},mercury:{body:"#c9d6e6",dark:"#22354f",accent:"#f4f7ff",glow:"#ff9a33",name:"MERCURY",desc:"水星 · Swift, sun-scorched",rough:.15,metal:.45,coat:1,fuzz:0,warm:.05,flicker:.3,light:.9,deco:"wings",ears:"fin",aura:{color:"#ff9a33",tip:"#f4f7ff",count:18,rise:2.4,swirl:.4,spread:.5,size:.1,life:.35},parts:{scarf:"dark",mitts:"glow"}},inkdragon:{body:"#f3ecdc",dark:"#2e2b48",accent:"#ffe3a3",glow:"#ffb340",name:"★ INK DRAGON",desc:"墨龍 · Legendary",tier:"legendary",cost:600,rough:.25,metal:.05,coat:1,fuzz:0,warm:.15,flicker:.2,light:1.3,deco:"dragon",ears:"horn",aura:{color:"#ffb340",tip:"#fff3d6",count:36,rise:-.2,swirl:2.8,spread:.6,size:.11,life:1.6},parts:{ears:"accent",mitts:"dark",scarf:"glow"}}},au={default:"cadet",skins:Q_},Ia=au.skins,is=au.default,tv={head:"body",torso:"body",ears:"body",arms:"body",legs:"dark",belt:"dark",pack:"accent",band:"accent",scarf:"accent",mitts:"accent",boots:"accent",bobble:"glow",tail:"glow"};function cu(n){return Ia[n]??Ia[is]}const Oo=new Map;function ev(n){if(!Oo.has(n)){const t=cu(n);Oo.set(n,{body:new w_({color:t.body,roughness:t.rough??.45,metalness:t.metal??.15,clearcoat:t.coat??0,clearcoatRoughness:.18,sheen:t.fuzz??0,sheenColor:new Nt(t.accent),sheenRoughness:.7,emissive:new Nt(t.glow),emissiveIntensity:t.warm??0}),dark:new Pe({color:t.dark,roughness:.6}),accent:new Pe({color:t.accent,roughness:.35,metalness:.3}),glow:new Pe({color:t.glow,emissive:t.glow,emissiveIntensity:1.4})})}return Oo.get(n)}let fr=null;function Da(){if(fr||typeof document>"u")return fr;const n=64,t=document.createElement("canvas");t.width=t.height=n;const e=t.getContext("2d"),i=e.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);return i.addColorStop(0,"rgba(255,255,255,1)"),i.addColorStop(.3,"rgba(255,255,255,0.6)"),i.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=i,e.fillRect(0,0,n,n),fr=new zn(t),fr}const dr=new Nt;class Ll{constructor(t){this.spec=t,this.hot=new Nt(t.tip),this.cool=new Nt(t.color);const e=t.count;this.pos=new Float32Array(e*3),this.col=new Float32Array(e*3),this.age=new Float32Array(e),this.life=new Float32Array(e);const i=new Ie;i.setAttribute("position",new Le(this.pos,3)),i.setAttribute("color",new Le(this.col,3)),this.points=new nc(i,new Xr({size:t.size,map:Da(),vertexColors:!0,transparent:!0,depthWrite:!1,blending:vn})),this.points.frustumCulled=!1;for(let s=0;s<e;s++)this.spawn(s,Math.random())}spawn(t,e=0){const i=this.spec,s=t*3,r=Math.random()*Math.PI*2,o=i.spread*(1+Math.random()*.7);this.pos[s]=Math.cos(r)*o,this.pos[s+1]=(i.low??.05)+Math.random()*(i.tall??1.65),this.pos[s+2]=Math.sin(r)*o,this.life[t]=i.life*(.7+Math.random()*.6),this.age[t]=this.life[t]*e}update(t){const e=this.spec,i=Math.cos(e.swirl*t),s=Math.sin(e.swirl*t),r=Math.max(0,1-.5*t);for(let o=0;o<e.count;o++){const a=o*3;this.age[o]+=t,this.age[o]>=this.life[o]&&this.spawn(o);const c=this.pos[a],l=this.pos[a+2];this.pos[a]=(c*i-l*s)*r,this.pos[a+2]=(c*s+l*i)*r,this.pos[a+1]+=e.rise*t;const h=this.age[o]/this.life[o];dr.copy(this.hot).lerp(this.cool,Math.min(1,h*2.2)).multiplyScalar(1-h*h),this.col[a]=dr.r,this.col[a+1]=dr.g,this.col[a+2]=dr.b}this.points.geometry.attributes.position.needsUpdate=!0,this.points.geometry.attributes.color.needsUpdate=!0}}const Il=new Pe({color:725024,roughness:.2}),Dl=new Pe({color:16777215,emissive:16777215,emissiveIntensity:.6}),Ul=new Pe({color:16748462,roughness:.9}),pr=[8226711,13203772,14278890,16767070,6284193,5213695,16731501,16735968,11073279,16773552,9067775].map((n,t)=>new Pe({color:n,emissive:n,emissiveIntensity:.25+t*.05,roughness:.28,metalness:.75}));function nv(n,t,e){const i=new Yh;for(let s=0;s<10;s++){const r=s%2?t:n,o=Math.PI/2+s*Math.PI/5;i[s?"lineTo":"moveTo"](Math.cos(o)*r,Math.sin(o)*r)}return new oc(i,{depth:e,bevelEnabled:!1}).translate(0,0,-e)}function wt(n,t,e,i=14){const s=new Vt(.5,i,Math.max(6,i-4));return s.scale(n,t,e),s}const Me={torso:wt(.78,.72,.6),head:wt(.98,.9,.9,18),ear:wt(.32,.3,.22),eye:new Vt(.105,12,10),shine:new Vt(.032,8,6),blush:wt(.16,.11,.1,10),pack:wt(.36,.32,.22),band:new pe(.42,.055,8,20),scarf:new pe(.36,.065,8,20).scale(1,.75,1),flap:wt(.14,.3,.07,8),belt:wt(.74,.16,.64),boot:wt(.3,.22,.38),mitt:new Vt(.15,12,10),bobble:new Vt(.09,12,10),tail:wt(.2,.18,.18,10),badge:nv(.095,.042,.04)};function C(n,t,e,i,s){const r=new ce(n,t);return r.position.set(e,i,s),r}function mr(n,t,e,i,s=.15){const r=new Rt;r.position.set(t,e,0);const o=C(new Zn(s,Math.max(.01,i-s*2),4,10),n,0,-i/2,0);return r.add(o),r}const gs=n=>{const t=new Rt;return t.add(n(-1),n(1)),t},Nl={round:n=>gs(t=>{const e=C(Me.ear,n,t*.33,1.68,0);return e.rotation.z=-t*.35,e}),cat:n=>gs(t=>{const e=C(new $e(.13,.32,8),n,t*.3,1.68,0);return e.rotation.z=-t*.55,e}),lop:n=>gs(t=>{const e=C(wt(.2,.44,.16),n,t*.4,1.44,.02);return e.rotation.z=t*.22,e}),fin:n=>gs(t=>{const e=C(new Qt(.05,.28,.2),n,t*.36,1.66,.02);return e.rotation.set(-.25,0,-t*.7),e}),horn:n=>gs(t=>{const e=C(new $e(.09,.22,8),n,t*.38,1.62,.04);return e.rotation.z=-t*1,e})},Ol={glaive:n=>{const t=new Rt,e=C(new Dt(.028,.042,1.1,8),n.dark,0,0,0),i=C(new Dt(.05,.05,.07,8),n.accent,0,-.55,0),s=C(new Dt(.052,.052,.08,8),n.accent,0,.44,0),r=C(new pe(.17,.042,6,14,Math.PI*1.15),n.glow,0,.62,0);r.rotation.set(0,0,-.5);const o=C(wt(.28,.26,.03),n.accent,-.01,.66,0),a=C(new $e(.04,.17,6),n.dark,.13,.47,0);a.rotation.z=-2.2;const c=new Rt;c.position.set(.04,.43,.02),c.rotation.z=.35,c.add(C(new Dt(.011,.011,.12,4),n.dark,0,-.06,0),C(wt(.07,.12,.07,8),n.glow,.01,-.15,0)),t.add(e,i,s,r,o,a,c);const l=new Wt;return l.position.set(.02,.64,.02),t.add(l),t.userData.fx={emit:[{at:l,count:10,rise:.35,swirl:0,spread:.13,size:.1,life:.6,low:-.1,tall:.2}],tick:h=>{c.rotation.z=.35+Math.sin(h*5.3)*.2}},t.position.set(.06,1,.5),t.rotation.set(-.1,0,.42),t},fan:n=>{const t=new Rt,e=C(wt(.44,.5,.05),n.accent,0,.31,0);for(let a=-1;a<=1;a++){const c=C(wt(.03,.42,.02),n.dark,a*.105,.33,.028);c.rotation.z=-a*.3,t.add(c)}const i=C(new Dt(.024,.032,.5,6),n.dark,0,0,0),s=C(new Dt(.045,.045,.07,6),n.accent,0,.13,0),r=C(new Vt(.045,8,6),n.glow,0,-.27,0);t.add(e,i,s,r);const o=new Wt;return o.position.set(0,.4,.04),t.add(o),t.userData.fx={emit:[{at:o,count:8,rise:.25,swirl:.6,spread:.18,size:.12,life:1.4,low:-.15,tall:.3}],tick:a=>{t.rotation.z=-.38+Math.sin(a*4.1)*.05}},t.position.set(.06,1.04,.5),t.rotation.set(-.1,0,-.38),t},zither:n=>{const t=new Rt,e=C(wt(.92,.17,.12),n.dark,0,0,0),i=C(wt(.84,.07,.13),n.accent,0,.055,.005),s=new Dt(.006,.006,.72,4),r=[];for(let d=0;d<5;d++){const g=C(s,n.glow,0,.098,-.036+d*.018);g.rotation.z=Math.PI/2,t.add(g),r.push(g)}const o=C(wt(.05,.07,.15),n.accent,-.38,.075,0),a=C(wt(.05,.07,.15),n.accent,.38,.075,0),c=C(new Dt(.016,.016,.07,5),n.dark,-.44,.02,.05),l=C(new Dt(.016,.016,.07,5),n.dark,-.44,.02,-.05);c.rotation.x=l.rotation.x=Math.PI/2,t.add(e,i,o,a,c,l);const h=new Wt,f=new Wt;h.position.set(-.24,.12,0),f.position.set(.24,.12,0),t.add(h,f);const u={count:7,rise:.7,swirl:.4,spread:.06,size:.11,life:.9,low:0,tall:.05};return t.userData.fx={emit:[{at:h,...u},{at:f,...u}],tick:d=>{r.forEach((g,x)=>{g.position.y=.098+Math.sin(d*38+x*1.3)*.006})}},t.position.set(0,1.2,.46),t.rotation.set(0,0,-.16),t},bow:n=>{const t=new Rt,e=C(new pe(.39,.045,6,16,Math.PI*1.05),n.dark,0,0,0);e.rotation.z=-Math.PI*.525;const i=C(new Dt(.012,.012,.78,5),n.accent,-.031,0,0),s=C(wt(.13,.24,.15),n.dark,.385,0,0),r=C(wt(.115,.07,.16),n.accent,.385,0,0),o=C(new Vt(.038,8,6),n.accent,-.031,.389,0),a=C(new Vt(.038,8,6),n.accent,-.031,-.389,0),c=C(new Dt(.014,.014,.8,5),n.dark,.02,.02,.1),l=C(new $e(.035,.11,5),n.accent,.02,.47,.1),h=C(wt(.02,.14,.09),n.glow,.02,-.33,.1);t.add(e,i,s,r,o,a,c,l,h);const f=new Wt;return f.position.set(.02,.5,.1),t.add(f),t.userData.fx={emit:[{at:f,count:8,rise:.5,swirl:0,spread:.05,size:.1,life:.45,low:-.02,tall:.08}],tick:u=>{i.position.x=-.031+Math.sin(u*27)*.004,h.rotation.y=Math.sin(u*6)*.3}},t.position.set(-.04,1.12,.48),t.rotation.set(0,0,.3),t},jian:n=>{const t=new Rt,e=C(wt(.075,.92,.03),n.accent,0,.16,0),i=C(new $e(.037,.15,4),n.accent,0,.66,0),s=C(wt(.016,.8,.04),n.glow,0,.16,0),r=C(wt(.28,.06,.07),n.dark,0,-.33,0),o=C(new Dt(.035,.035,.24,6),n.dark,0,-.47,0),a=C(new pe(.037,.011,4,8),n.accent,0,-.42,0),c=C(new pe(.037,.011,4,8),n.accent,0,-.52,0);a.rotation.x=c.rotation.x=Math.PI/2;const l=C(new Vt(.055,8,6),n.glow,0,-.6,0),h=new Rt;h.position.set(0,-.6,0),h.add(C(new Dt(.009,.009,.12,4),n.dark,.02,-.09,0),C(wt(.06,.11,.06,8),n.glow,.03,-.19,0)),t.add(e,i,s,r,o,a,c,l,h);const f=new Wt;return f.position.set(0,.7,0),t.add(f),t.userData.fx={emit:[{at:f,count:10,rise:.4,swirl:0,spread:.05,size:.1,life:.5,low:-.06,tall:.1}],tick:u=>{h.rotation.z=Math.sin(u*5.7)*.25}},t.position.set(-.05,1.12,.5),t.rotation.set(0,0,-.38),t},moon:n=>{const t=new Rt,e=C(new Dt(.16,.16,.05,20),n.accent,0,0,0);e.rotation.x=Math.PI/2;const i=C(new pe(.18,.026,6,20),n.glow,0,0,.012),s=C(new Dt(.132,.132,.05,20),n.dark,-.07,.035,.032);s.rotation.x=Math.PI/2;const r=wt(.075,.11,.02,8),o=C(r,n.glow,-.03,-.23,.05),a=C(r,n.glow,.09,-.31,.09),c=C(r,n.glow,-.13,-.35,.02);o.rotation.z=.5,a.rotation.z=-.9,c.rotation.z=1.3;const l=new Rt;l.add(e,i,s),t.add(l,o,a,c);const h=new Wt;return t.add(h),t.userData.fx={emit:[{at:h,count:12,rise:-.25,swirl:1.6,spread:.22,size:.11,life:1.3,low:-.1,tall:.2}],tick:f=>{l.rotation.z=f*.5}},t.position.set(.24,1.58,.5),t},thrusters:n=>{const t=new Rt,e=C(new Qt(.58,.05,.06),n.dark,0,.12,-.08);t.add(e);const i=[];for(const r of[-1,1]){const o=r*.27,a=C(new Dt(.085,.09,.3,12),n.dark,o,.02,0),c=C(new Vt(.085,12,8),n.dark,o,.17,0),l=C(new pe(.088,.02,6,16),n.glow,o,.1,0);l.rotation.x=Math.PI/2;const h=C(new Dt(.065,.1,.1,12),n.accent,o,-.18,0),f=C(new Dt(.06,.06,.03,12),n.glow,o,-.215,0),u=C(new Qt(.02,.16,.09),n.accent,o+r*.09,.03,.02);t.add(a,c,l,h,f,u);const d=new Wt;d.position.set(o,-.24,0),t.add(d),i.push(d)}const s={count:10,rise:-2.4,swirl:0,spread:.035,size:.12,life:.22,low:-.02,tall:.04};return t.userData.fx={emit:i.map(r=>({at:r,...s})),tick:r=>{t.position.y=.98+Math.sin(r*43)*.004}},t.position.set(0,.98,.46),t},torch:n=>{const t=new Rt,e=C(new Dt(.03,.04,.9,8),n.dark,0,0,0);for(const g of[-.28,-.12]){const x=C(new pe(.036,.012,4,10),n.accent,0,g,0);x.rotation.x=Math.PI/2,t.add(x)}const i=C(new Vt(.045,8,6),n.accent,0,-.45,0),s=C(new Dt(.085,.05,.12,10),n.dark,0,.48,0),r=C(new Dt(.07,.07,.03,10),n.glow,0,.535,0);t.add(e,i,s,r);const o=new Rt;o.position.set(0,.54,0),o.rotation.z=-.42;const a=C(wt(.22,.26,.18,10),n.glow,0,.11,0),c=C(new $e(.075,.3,7),n.glow,.07,.3,.01);c.rotation.z=-.35;const l=C(new $e(.055,.24,7),n.glow,-.07,.3,-.01);l.rotation.z=.45;const h=C(wt(.1,.18,.09,8),n.accent,0,.1,.04),f=C(new Vt(.022,6,5),n.glow,.12,.38,0),u=C(new Vt(.018,6,5),n.glow,-.1,.42,.02);o.add(a,c,l,h,f,u),t.add(o);const d=new Wt;return d.position.set(0,.3,0),o.add(d),t.userData.fx={emit:[{at:d,count:16,rise:1.4,swirl:2.5,spread:.09,size:.12,life:.55,low:-.1,tall:.15}],tick:g=>{a.scale.set(1+Math.sin(g*19)*.08,1+Math.sin(g*23+1)*.12,1),c.rotation.z=-.35+Math.sin(g*15)*.18,l.rotation.z=.45+Math.sin(g*17+2)*.18,h.scale.y=1+Math.sin(g*29)*.15}},t.position.set(0,.92,.5),t.rotation.set(-.1,0,.42),t},mushrooms:n=>{const t=new Rt,e=[],i=(l,h,f,u,d,g,x)=>{const p=new Rt;p.position.set(l,h,0),p.rotation.set(x,0,g);const m=C(new Dt(f*.28,f*.38,d,8),n.accent,0,d/2,0),w=C(new Dt(f*.9,f*.6,u*.5,12),n.dark,0,d+u*.15,0),y=C(wt(f*2,u*2,f*2,12),n.glow,0,d+u*.4,0);e.push(y),p.add(m,w,y);for(const[_,L]of[[f*.45,f*.45],[-f*.3,f*.6]])p.add(C(new Vt(f*.15,6,5),n.accent,_,d+u*1.05,L));return p};t.add(i(-.26,.06,.13,.09,.18,.1,.85),i(-.35,-.12,.08,.06,.13,.3,.75),i(-.13,-.1,.07,.05,.1,-.3,.6));const s=new Rt;s.position.set(-.27,.06,.02),s.rotation.set(.35,0,.15);const r=C(new Dt(.012,.02,.44,6),n.accent,0,.22,0),o=C(wt(.07,.17,.03,8),n.accent,-.06,.34,0);o.rotation.z=.7;const a=C(wt(.06,.14,.03,8),n.accent,.05,.42,.01);a.rotation.z=-.5,s.add(r,o,a),t.add(s);const c=new Wt;return c.position.set(-.26,.28,.17),t.add(c),t.userData.fx={emit:[{at:c,count:14,rise:.3,swirl:.7,spread:.16,size:.13,life:2,low:-.1,tall:.15}],tick:l=>{e.forEach((h,f)=>{const u=1+Math.sin(l*2.2+f*2)*.05;h.scale.set(u,1+(u-1)*.5,u)})}},t.position.set(0,1,.24),t},orbit:n=>{const t=new Rt,e=C(new Vt(.11,14,10),n.body,0,0,0),i=C(new Vt(.125,14,10),n.glow,0,0,-.05),s=C(new pe(.21,.02,6,28),n.glow,0,0,0);s.rotation.set(1.25,.15,.35);for(const a of[.4,2.3,4.6])s.add(C(new Vt(.03,6,5),n.accent,Math.cos(a)*.21,Math.sin(a)*.21,0));const r=C(new pe(.165,.011,5,24),n.accent,0,0,0);r.rotation.set(.5,.2,-.9),t.add(i,e,s,r);const o=new Wt;return t.add(o),t.userData.fx={emit:[{at:o,count:14,rise:0,swirl:3.2,spread:.26,size:.11,life:1.1,low:-.12,tall:.24}],tick:(a,c)=>{s.rotation.z+=c*1.8,r.rotation.z-=c*1.1}},t.position.set(.2,1.22,.52),t},boba:n=>{const t=new Rt,e=C(new Dt(.15,.11,.42,14),n.accent,0,0,0),i=C(new pe(.135,.03,6,20),n.body,0,.02,0);i.rotation.x=Math.PI/2;const s=C(new Dt(.165,.165,.03,14),n.dark,0,.225,0),r=C(new Vt(.15,14,8),n.dark,0,.235,0);r.scale.y=.4;for(let c=0;c<7;c++){const l=c/7*Math.PI*2;t.add(C(new Vt(.036,8,6),n.dark,Math.cos(l)*.1,-.16+c%2*.04,Math.sin(l)*.1))}const o=C(new Dt(.03,.03,.5,8),n.glow,.06,.42,0);o.rotation.z=-.3,t.add(e,i,s,r,o);const a=new Wt;return a.position.set(0,-.2,0),o.add(a),t.userData.fx={emit:[{at:a,count:10,rise:.8,swirl:0,spread:.02,size:.11,life:.6,low:0,tall:.05}],tick:c=>{t.rotation.z=.12+Math.sin(c*3)*.06}},t.position.set(-.22,1.02,.46),t.rotation.z=.12,t},avocado:n=>{const t=new Rt,e=C(wt(.42,.56,.2),n.dark,0,0,0),i=C(wt(.36,.5,.16),n.accent,0,0,.04),s=C(new pe(.13,.025,6,20),n.body,0,-.06,.11),r=C(new Vt(.11,14,10),n.glow,0,-.06,.1),o=C(new Dt(.012,.016,.07,6),n.dark,0,.3,.02),a=C(wt(.06,.13,.02,8),n.body,.05,.36,.02);a.rotation.z=-.6,t.add(e,i,s,r,o,a);const c=new Wt;return c.position.set(0,.1,.16),t.add(c),t.userData.fx={emit:[{at:c,count:10,rise:.35,swirl:.6,spread:.14,size:.11,life:1.2,low:-.15,tall:.3}],tick:l=>{t.rotation.z=-.25+Math.sin(l*2.6)*.06}},t.position.set(.2,1.05,.44),t.rotation.z=-.25,t},dragonfruit:n=>{const t=new Rt,e=C(wt(.36,.48,.22),n.body,0,0,0),i=C(new Dt(.145,.145,.04,16),n.accent,0,0,.1);i.rotation.x=Math.PI/2;const s=new Vt(.014,6,5);for(const[a,c]of[[.05,.08],[-.06,.05],[.02,-.06],[-.04,-.09],[.09,-.02],[-.09,0],[0,.01]])t.add(C(s,n.dark,a,c,.125));const r=[];for(let a=0;a<6;a++){const c=-.9+a*1.05,l=new Rt;l.position.set(Math.cos(c)*.15,Math.sin(c)*.2,.02),l.rotation.set(-.6,0,c-Math.PI/2),l.add(C(wt(.07,.13,.03,8),n.body,0,.06,0)),l.add(C(new Vt(.02,6,5),n.glow,0,.125,0)),l.userData.base=c-Math.PI/2,r.push(l),t.add(l)}t.add(e,i);const o=new Wt;return o.position.set(0,0,.14),t.add(o),t.userData.fx={emit:[{at:o,count:12,rise:-.15,swirl:1.2,spread:.15,size:.11,life:1.3,low:-.1,tall:.2}],tick:a=>{r.forEach((c,l)=>{c.rotation.z=c.userData.base+Math.sin(a*5+l*1.1)*.12})}},t.position.set(-.18,1.08,.44),t.rotation.z=.2,t},ramen:n=>{const t=new Rt,e=C(new Dt(.24,.15,.2,18),n.body,0,0,0),i=C(new pe(.235,.015,6,24),n.dark,0,.09,0);i.rotation.x=Math.PI/2;const s=C(new Dt(.14,.14,.02,18),n.dark,0,-.11,0),r=C(new Dt(.22,.22,.02,18),n.glow,0,.09,0),o=new pe(.09,.012,4,10,Math.PI);for(const[u,d,g]of[[-.04,.02,.3],[.05,-.05,2.1],[-.02,-.08,4]]){const x=C(o,n.accent,u,.105,d);x.rotation.set(Math.PI/2,0,g),t.add(x)}const a=C(new Vt(.06,10,8),n.accent,.1,.1,.06);a.scale.y=.5;const c=C(new Vt(.035,8,6),n.glow,.1,.12,.06);c.scale.y=.6;const l=C(new Qt(.1,.006,.07),n.dark,-.11,.11,-.07);l.rotation.y=.4;const h=new Rt;h.position.set(.04,.15,0);for(const u of[-.02,.02]){const d=C(new Dt(.008,.012,.5,6),n.dark,0,0,u);d.rotation.z=1.1,h.add(d)}t.add(e,i,s,r,a,c,l,h);const f=new Wt;return f.position.set(0,.14,0),t.add(f),t.userData.fx={emit:[{at:f,count:14,rise:.9,swirl:.5,spread:.1,size:.14,life:1.4,low:0,tall:.1}],tick:u=>{h.rotation.x=Math.sin(u*3)*.05}},t.position.set(0,1.1,.5),t.rotation.x=.35,t},cone:n=>{const t=new Rt,e=C(new $e(.13,.4,12),n.dark,0,-.2,0);e.rotation.z=Math.PI;for(const[l,h]of[[-.12,.1],[-.27,.06]]){const f=C(new pe(h,.008,5,16),n.accent,0,l,0);f.rotation.x=Math.PI/2,t.add(f)}const i=C(new Vt(.16,14,12),n.body,0,.1,0),s=new Vt(.02,6,5);for(const[l,h,f]of[[.08,.16,.12],[-.1,.08,.11],[.02,.02,.15],[-.05,.2,.1],[.13,.05,.08]])t.add(C(s,n.dark,l,h,f));const r=C(new Vt(.12,14,12),n.accent,.03,.3,.02),o=C(new Vt(.045,10,8),n.glow,.05,.43,.03),a=C(new Dt(.006,.006,.08,5),n.dark,.07,.49,.03);a.rotation.z=-.4,t.add(e,i,r,o,a);const c=new Wt;return c.position.set(.09,-.02,.1),t.add(c),t.userData.fx={emit:[{at:c,count:8,rise:-.5,swirl:0,spread:.05,size:.1,life:.8,low:-.02,tall:.04}],tick:l=>{t.rotation.z=-.3+Math.sin(l*2.8)*.05}},t.position.set(.22,1,.46),t.rotation.z=-.3,t},rover:n=>{const t=new Rt,e=C(new Qt(.32,.22,.09),n.dark,0,0,0),i=C(new Qt(.26,.14,.015),n.glow,0,-.01,.05);for(const h of[-.045,.045])t.add(C(new Qt(.01,.14,.018),n.dark,h,-.01,.05));const s=[];for(const h of[-1,1])for(const f of[-.09,0,.09]){const u=C(new Dt(.055,.055,.045,10),n.accent,h*.185,f,0);u.rotation.z=Math.PI/2,s.push(u),t.add(u)}const r=C(new Dt(.012,.014,.2,6),n.accent,-.09,.2,.02),o=C(new Qt(.07,.045,.05),n.accent,-.09,.32,.02),a=C(new Vt(.016,8,6),n.glow,-.09,.32,.05),c=C(new Dt(.05,.02,.03,10,1,!0),n.accent,.1,.15,.03);c.rotation.x=-.6,t.add(e,i,r,o,a,c);const l=new Wt;return l.position.set(0,-.15,.02),t.add(l),t.userData.fx={emit:[{at:l,count:10,rise:-.4,swirl:.3,spread:.12,size:.11,life:.6,low:-.02,tall:.04}],tick:(h,f)=>{s.forEach(u=>{u.rotation.x+=f*6})}},t.position.set(0,1.02,.46),t.rotation.z=.08,t},volcano:n=>{const t=new Rt,e=C(new Dt(.11,.22,.36,14),n.dark,0,0,0),i=C(new pe(.105,.022,6,14),n.glow,0,.18,0);i.rotation.x=Math.PI/2;const s=C(new Dt(.095,.095,.02,14),n.glow,0,.185,0);for(const o of[-.7,.2,1]){const a=new Rt;a.rotation.y=o;const c=C(wt(.035,.2,.02,8),n.glow,0,0,.16);c.rotation.x=-.35,a.add(c),t.add(a)}t.add(e,i,s);const r=new Wt;return r.position.set(0,.22,0),t.add(r),t.userData.fx={emit:[{at:r,count:14,rise:.8,swirl:.8,spread:.07,size:.16,life:1.4,low:0,tall:.06}],tick:o=>{const a=1+Math.sin(o*4)*.08;s.scale.set(a,1,a),t.position.x=.06+Math.sin(o*41)*.003}},t.position.set(.06,1,.5),t.rotation.x=.55,t},satellite:n=>{const t=new Rt,e=C(new Qt(.14,.14,.12),n.accent,0,0,0),i=new Rt;i.rotation.x=-.5;for(const l of[-1,1]){const h=l*.19,f=C(new Dt(.01,.01,.06,5),n.accent,l*.1,0,0);f.rotation.z=Math.PI/2,i.add(C(new Qt(.2,.16,.012),n.dark,h,0,0),C(new Qt(.2,.012,.014),n.glow,h,0,0),f)}const s=C(new Dt(.075,.02,.05,12,1,!0),n.accent,0,.1,.03);s.rotation.x=-.7;const r=C(new Dt(.006,.006,.07,4),n.dark,0,.13,.05);r.rotation.x=-.7;const o=C(new Vt(.02,8,6),n.glow,0,-.1,.02),a=C(new Dt(.005,.005,.06,4),n.dark,0,-.09,.02);t.add(e,i,s,r,o,a);const c=new Wt;return c.position.set(0,.1,.05),t.add(c),t.userData.fx={emit:[{at:c,count:8,rise:.7,swirl:0,spread:.04,size:.1,life:.5,low:-.02,tall:.04}],tick:l=>{i.rotation.x=-.5+Math.sin(l*.7)*.3;const h=.6+Math.max(0,Math.sin(l*6))*.8;o.scale.set(h,h,h),t.rotation.z=Math.sin(l*1.3)*.08}},t.position.set(-.22,1,.5),t},rings:n=>{const t=new Rt,e=(a,c,l)=>{const h=C(new qr(a,c,28,1,Math.PI+.5,Math.PI-1),l,0,0,0);return h.rotation.x=-Math.PI/2,h},i=e(.46,.54,n.body),s=e(.35,.44,n.accent),r=e(.29,.33,n.glow);t.add(i,s,r);const o=new Wt;return o.position.set(0,.01,.4),t.add(o),t.userData.fx={emit:[{at:o,count:12,rise:0,swirl:2.2,spread:.1,size:.09,life:1.2,low:-.01,tall:.02}],tick:a=>{t.rotation.z=.12+Math.sin(a*.9)*.04,t.rotation.x=Math.sin(a*1.1)*.03}},t.position.set(0,.84,.14),t.rotation.z=.12,t},wings:n=>{const t=new Rt,e=C(new Qt(.34,.04,.03),n.dark,0,0,-.02);t.add(e);const i=[],s=[];for(const r of[-1,1]){const o=new Rt;o.position.set(r*.16,0,0),o.rotation.y=-r*.5,[[.2,.34],[.6,.3],[1,.26]].forEach(([l,h],f)=>{const u=C(wt(.1-f*.015,h,.03,8),f===2?n.glow:n.accent,r*Math.cos(l)*h/2,Math.sin(l)*h/2,0);u.rotation.z=r*(l-Math.PI/2),o.add(u)});const c=new Wt;c.position.set(r*Math.cos(.2)*.34,Math.sin(.2)*.34,0),o.add(c),s.push(c),i.push({w:o,side:r}),t.add(o)}return t.userData.fx={emit:s.map(r=>({at:r,count:6,rise:.3,swirl:0,spread:.05,size:.1,life:.7,low:-.02,tall:.04})),tick:r=>{i.forEach(({w:o,side:a})=>{o.rotation.z=a*Math.sin(r*9)*.22})}},t.position.set(0,1.1,.36),t},dragon:n=>{const t=new Rt,e=30,i=new Gh([new P(.42,.62,.4),new P(.3,.72,.52),new P(0,.8,.58),new P(-.34,.95,.52),new P(-.3,1.18,.56),new P(.05,1.3,.62),new P(.28,1.42,.55),new P(.32,1.58,.5)]),s=i.getSpacedPoints(e-1),r=new P(0,0,1),o=new P,a=new P,c=[];for(let V=0;V<e-1;V++){const v=.045+.045*(V/(e-1)),S=new Rt;if(S.position.copy(s[V]),i.getTangentAt(V/(e-1),o),a.crossVectors(o,r).normalize(),S.userData={base:s[V].clone(),n:a.clone()},S.add(C(new Vt(v,8,6),n.dark,0,0,0)),V>0&&V%3===0){const F=C(wt(.035,.11,.02,8),n.accent,a.x*(v+.03),a.y*(v+.03),0);F.rotation.z=Math.atan2(a.y,a.x)-Math.PI/2,S.add(F)}t.add(S),c.push(S)}for(const V of[-1,1]){const v=new Rt;v.position.copy(s[24]),v.rotation.z=V*.9,v.add(C(new Dt(.014,.018,.1,6),n.dark,0,-.05,.02),C(new Vt(.026,8,6),n.accent,0,-.1,.03)),t.add(v)}const l=new Rt;l.position.copy(s[e-1]);const h=C(wt(.2,.17,.22),n.dark,0,0,0),f=C(new Qt(.13,.08,.14),n.dark,0,-.03,.15),u=C(new Qt(.12,.03,.13),n.accent,0,-.075,.14),d=C(wt(.1,.03,.05,8),n.accent,0,.015,.21),g=C(new Vt(.03,8,6),n.glow,-.065,.035,.11),x=C(new Vt(.03,8,6),n.glow,.065,.035,.11),p=C(wt(.07,.025,.03,8),n.accent,-.065,.075,.1),m=C(wt(.07,.025,.03,8),n.accent,.065,.075,.1);p.rotation.z=-.3,m.rotation.z=.3,l.add(h,f,u,d,g,x,p,m);const w=[];for(const V of[-1,1]){const v=C(new $e(.025,.14,6),n.accent,V*.06,.1,-.04);v.rotation.set(-.6,0,-V*.3);const S=C(new Dt(.006,.004,.22,4),n.accent,V*.107,0,.06);S.rotation.set(-1.4,0,V*.35),w.push(S);const F=C(wt(.05,.12,.03,8),n.accent,V*.08,.06,-.08);F.rotation.set(.5,0,-V*.5),l.add(v,S,F)}const y=C(wt(.05,.13,.03,8),n.accent,0,.1,-.1);y.rotation.x=.7;const _=C(new Vt(.055,12,10),n.glow,0,-.02,.3);l.add(y,_),t.add(l);const L=new Wt;L.position.copy(_.position),l.add(L);const R=new Wt;R.position.set(0,-.04,.2),l.add(R);const A=new Wt;c[0].add(A);const D=c[0].userData.base;return t.userData.fx={emit:[{at:L,count:14,rise:.1,swirl:3,spread:.07,size:.1,life:.9,low:-.05,tall:.1},{at:R,count:10,rise:.25,swirl:.5,spread:.03,size:.12,life:.8,low:-.02,tall:.04},{at:A,count:8,rise:-.3,swirl:1,spread:.04,size:.09,life:.7,low:-.02,tall:.04}],tick:V=>{c.forEach((S,F)=>{const z=Math.sin(V*4-F*.55)*.012;S.position.copy(S.userData.base).addScaledVector(S.userData.n,z)}),c[0].position.copy(D).addScaledVector(c[0].userData.n,Math.sin(V*4)*.03),l.rotation.x=Math.sin(V*2)*.06,l.rotation.y=Math.sin(V*1.3)*.08,w.forEach((S,F)=>{S.rotation.z=(F?1:-1)*(.35+Math.sin(V*3+F)*.12)}),_.position.x=Math.sin(V*2.2)*.02,_.position.y=-.02+Math.cos(V*2.2)*.02;const v=1+Math.sin(V*5)*.08;_.scale.set(v,v,v)}},t}};class Or{constructor(t,e=is){var L;const i=new Rt,s=ev(e),r=cu(e);this.skin=e,this.spec=r,this.glowMat=s.glow,this.glowBase=s.glow.emissiveIntensity;const o=R=>{var A;return s[((A=r.parts)==null?void 0:A[R])??tv[R]]},a=C(Me.torso,o("torso"),0,.9,0),c=C(Me.head,o("head"),0,1.4,0),l=(Nl[r.ears]??Nl.round)(o("ears")),h=C(Me.eye,Il,-.2,1.36,-.4),f=C(Me.eye,Il,.2,1.36,-.4);h.add(C(Me.shine,Dl,-.03,.035,-.07)),f.add(C(Me.shine,Dl,-.03,.035,-.07));const u=C(Me.blush,Ul,-.37,1.28,-.29),d=C(Me.blush,Ul,.37,1.28,-.29),g=C(Me.pack,o("pack"),0,.92,.3),x=C(Me.belt,o("belt"),0,.66,0),p=C(Me.band,o("band"),0,1.6,0);p.rotation.x=Math.PI/2-.18;const m=C(Me.bobble,o("bobble"),0,1.64,.4),w=C(Me.scarf,o("scarf"),0,1.06,0);w.rotation.x=Math.PI/2+.1;const y=C(Me.flap,o("scarf"),.23,.9,.34);y.rotation.set(.15,0,-.3);const _=C(Me.tail,o("tail"),0,.66,.34);if(this.badge=C(Me.badge,pr[0],-.19,.97,-.26),this.badge.visible=!1,this.armL=mr(o("arms"),-.38,1.08,.44,.13),this.armR=mr(o("arms"),.38,1.08,.44,.13),this.legL=mr(o("legs"),-.19,.56,.56),this.legR=mr(o("legs"),.19,.56,.56),this.armL.add(C(Me.mitt,o("mitts"),0,-.44,0)),this.armR.add(C(Me.mitt,o("mitts"),0,-.44,0)),this.legL.add(C(Me.boot,o("boots"),0,-.45,.03)),this.legR.add(C(Me.boot,o("boots"),0,-.45,.03)),i.add(a,c,l,h,f,u,d,g,p,m,w,y,x,_,this.badge,this.armL,this.armR,this.legL,this.legR),this.deco=null,this.fx=[],r.deco&&Ol[r.deco]){this.deco=Ol[r.deco](s),i.add(this.deco);for(const R of((L=this.deco.userData.fx)==null?void 0:L.emit)??[]){const A=new Ll({color:r.glow,tip:r.accent,...R});R.at.add(A.points),this.fx.push(A)}}i.traverse(R=>{R.isMesh&&(R.castShadow=!0)}),this.light=null,r.light>0&&(this.light=new T_(new Nt(r.glow),r.light,7,2),this.light.position.set(0,.95,0),i.add(this.light)),this.aura=r.aura?new Ll(r.aura):null,this.aura&&i.add(this.aura.points),t.add(i),this.group=i,this.t=0,this.head=c,this.phase=0,this.stride=0,this.stepFoot=0,this.squashT=0,this.squash=0}setBadge(t){this.badge.visible=t>0,this.badge.material=pr[Math.min(t,pr.length)-1]??pr[0]}reset(){this.phase=0,this.stride=0,this.stepFoot=0,this.squashT=0,this.squash=0;for(const t of[this.armL,this.armR,this.legL,this.legR])t.rotation.x=0;this.head.rotation.set(0,0,0),this.group.position.y=0,this.group.scale.set(1,1,1)}land(t){this.squash=Math.min(1,Math.max(.35,t/22)),this.squashT=Cl}update(t,e,i){var r,o;if(this.stepFoot=0,i){const a=2.2+e*.22;this.phase+=t*a;const c=Math.sin(this.phase),l=.9;this.legL.rotation.x=c*l,this.legR.rotation.x=-c*l,this.armL.rotation.x=-c*l*.8,this.armR.rotation.x=c*l*.8,this.group.position.y=Math.abs(c)*.06,this.head.rotation.z=c*.07,this.head.rotation.x=Math.abs(c)*.05;const h=Math.floor(this.phase/Math.PI+.5);h!==this.stride&&(this.stride=h,this.stepFoot=h%2?-1:1)}else{const a=1-Math.exp(-10*t),{lerp:c}=yh;this.legL.rotation.x=c(this.legL.rotation.x,.9,a),this.legR.rotation.x=c(this.legR.rotation.x,.5,a),this.armL.rotation.x=c(this.armL.rotation.x,-1.6,a),this.armR.rotation.x=c(this.armR.rotation.x,-1.6,a),this.head.rotation.z=c(this.head.rotation.z,0,a),this.head.rotation.x=c(this.head.rotation.x,-.12,a),this.group.position.y=0}if(this.squashT>0){this.squashT=Math.max(0,this.squashT-t);const a=this.squashT/Cl*this.squash;this.group.scale.set(1+a*.22,1-a*.34,1+a*.22)}this.t+=t;const s=this.spec.flicker??0;if(s>0){const a=1+s*(Math.sin(this.t*17.3)*.6+Math.sin(this.t*9.1+1.7)*.4);this.glowMat.emissiveIntensity=this.glowBase*Math.max(.3,a),this.light&&(this.light.intensity=this.spec.light*Math.max(.35,a))}this.aura&&this.aura.update(t),(o=(r=this.deco)==null?void 0:r.userData.fx)==null||o.tick(this.t,t);for(const a of this.fx)a.update(t)}}class iv{constructor(t,e=is){this.mesh=new Rt,t.add(this.mesh),this.character=new Or(this.mesh,e),this.box=new wi,this.shieldMesh=new ce(new Vt(1.15,16,12),new cn({color:8382719,transparent:!0,opacity:.2,depthWrite:!1})),this.shieldMesh.position.y=.95,this.mesh.add(this.shieldMesh),this.t=0,this.reset()}setShield(t){this.shield=t,this.shieldMesh.visible=t}setSkin(t,e=0){this.character.skin!==t&&(this.mesh.remove(this.character.group),this.character=new Or(this.mesh,t)),this.character.setBadge(e)}reset(){this.lane=1,this.vy=0,this.grounded=!0,this.holding=!1,this.holdT=0,this.pressed=!1,this.buffer=0,this.releaseIn=0,this.mesh.position.set(0,0,0),this.mesh.rotation.set(0,0,0),this.dead=!1,this.deadT=0,this.character.reset(),this.setShield(!1)}die(){this.dead=!0,this.deadT=0}moveLeft(){this.lane>0&&this.lane--}moveRight(){this.lane<we.length-1&&this.lane++}jump(){if(this.pressed=!0,!this.grounded){this.buffer=z_;return}this.vy=U_,this.grounded=!1,this.holding=!0,this.holdT=0}releaseJump(){this.pressed=!1,this.holding=!1}tap(t){this.jump(),t>0?this.releaseIn=t:this.releaseJump()}update(t,e){if(this.dead){const a=this.deadT+=t;this.mesh.position.z=1.5*(1-Math.exp(-4*a)),this.mesh.position.y=7.7*a-6*a*a,this.mesh.rotation.x=-4*a,this.mesh.rotation.z*=Math.exp(-4*t),this.character.update(t,0,!1);return}const i=we[this.lane];if(this.mesh.position.x+=(i-this.mesh.position.x)*(1-Math.exp(-13.4*t)),this.buffer>0&&(this.buffer-=t),!this.grounded){const a=this.holding&&this.vy>0&&this.holdT<O_;this.holding&&(this.holdT+=t);const c=a?N_:this.vy<0?F_:1;if(this.vy-=D_*c*t,this.mesh.position.y+=this.vy*t,this.mesh.position.y<=0){this.mesh.position.y=0;const l=-this.vy;if(this.vy=0,this.grounded=!0,this.character.land(l),this.buffer>0){this.buffer=0;const h=this.pressed;this.jump(),this.holding=h}}}this.releaseIn>0&&(this.releaseIn-=t)<=0&&this.releaseJump(),this.mesh.rotation.z=(i-this.mesh.position.x)*.2,this.character.update(t,e,this.grounded),this.t+=t,this.shield&&this.shieldMesh.scale.setScalar(1+Math.sin(this.t*4)*.05);const{x:s,y:r,z:o}=this.mesh.position;this.box.min.set(s-.4,r+.1,o-.35),this.box.max.set(s+.4,r+1.7,o+.35)}}const sv=[{name:"Indigo Reach",mood:"clean neon — the baseline every other zone is a variation on",hurdle:"#ff5e6e",hurdleBar:"#ffd7dc",tall:"#ff9a2e",tallBar:"#ffe6b8",block:"#7a5eff",blockStripe:"#e4dbff",hop:"#4ce089",hopGlow:"#d6ffe8",stomp:"#d93a52",stompGlow:"#ffc9d2",window:"#ff7ac8",windowBar:"#ffdcef",door:"#2ec4a0",doorGlow:"#c8fff0",thief:"#ffcf4a",thiefGlow:"#fff2c0",rough:.5,metal:.15,emissive:.9,bg:"#0b1020",ring:"#9a7bff",nebula:"#ffffff",star:"#ffffff",hole:"#ffffff"},{name:"Ember Belt",mood:"dusty, sun-baked — rough and barely metallic",hurdle:"#ff4a3a",hurdleBar:"#ffd0c0",tall:"#ffb52e",tallBar:"#fff0c8",block:"#9a4bd6",blockStripe:"#f5d8ff",hop:"#8ed13c",hopGlow:"#eaffbe",stomp:"#e0301f",stompGlow:"#ffc0ac",window:"#ff6aa0",windowBar:"#ffd6e6",door:"#3fb87a",doorGlow:"#d8ffe0",thief:"#ffc338",thiefGlow:"#fff0b8",rough:.78,metal:.05,emissive:.6,bg:"#1a0e14",ring:"#ff8a5e",nebula:"#ffb07a",star:"#ffd9c0",hole:"#ffb27a"},{name:"Cryo Drift",mood:"glazed, lit from within — smooth, metallic, high emissive",hurdle:"#ff6f8a",hurdleBar:"#ffffff",tall:"#ffc94d",tallBar:"#ffffff",block:"#5e8dff",blockStripe:"#e8f2ff",hop:"#6ff07a",hopGlow:"#e4fff0",stomp:"#e04a68",stompGlow:"#ffe0e8",window:"#ff8ad0",windowBar:"#ffffff",door:"#3ee0b0",doorGlow:"#eafff8",thief:"#ffd966",thiefGlow:"#ffffff",rough:.25,metal:.45,emissive:1.4,bg:"#06131f",ring:"#5edcff",nebula:"#9fe8ff",star:"#dff2ff",hole:"#9fe8ff"},{name:"Verdant Spine",mood:"bioluminescent — everything glows a little on its own",hurdle:"#ff5e6e",hurdleBar:"#ffe0e4",tall:"#ffd84d",tallBar:"#fffbe0",block:"#3fd9c0",blockStripe:"#dafff8",hop:"#baff3f",hopGlow:"#f2ffd0",stomp:"#d93a52",stompGlow:"#ffd6dc",window:"#ff7ac8",windowBar:"#ffe0f0",door:"#37d16a",doorGlow:"#d6ffe4",thief:"#ffd24a",thiefGlow:"#fff5cc",rough:.4,metal:.3,emissive:1.1,bg:"#07170f",ring:"#6effc0",nebula:"#8effc8",star:"#dfffe8",hole:"#7dffcf"}],rv=[{z:-30,side:-1,key:"TAP",act:"SPACE / ↑",sub:"SHORT JUMP"},{z:-56,side:1,key:"HOLD",act:"SPACE / ↑",sub:"HIGH JUMP"},{z:-82,side:-1,key:"← →",act:"A / D · SWIPE",sub:"SWITCH LANES"},{z:-108,side:1,key:"STAY",act:"GREEN HOPS OVER YOU",sub:"DON'T JUMP"}],ov={skinCost:60,perks:[{id:"magnet",name:"COIN MAGNET",desc:"Coins home in on you",cost:80},{id:"startShield",name:"START SHIELD",desc:"Every run begins shielded",cost:150}]},Kr={zones:sv,guides:rv,shop:ov},av="Translations, keyed by the English string. English has no table — the key IS the English — so `en` stays empty. Every string a player can read out of data.json (zone names, guide signs, perks), skins.json (name/desc) and BADGE_NAMES needs a line in every other language, and check.mjs fails a language missing one; UI strings from index.html and main.js are held to the same key set across languages. A string that reads the same everywhere (SPACE / ↑) still gets an identity line, so the check stays strict. Adding a language: add a table here and an <option> to #lang in index.html.",cv={},lv={"GAME OVER":"게임 오버","Dodge the blocks, grab the coins. It only gets faster.":"장애물을 피하고 코인을 모으세요. 점점 빨라집니다.","Bank it or spend it.":"모아 둘까, 써 버릴까.",PLAY:"플레이",RETRY:"다시 하기",CONTINUE:"이어하기",SKINS:"스킨","Wear a different runner":"다른 러너로 갈아입기","Pick a runner. Buying one puts it on.":"러너를 고르세요. 구매하면 바로 착용됩니다.",OWNED:"보유",EQUIPPED:"착용 중",UNOWNED:"미보유",BACK:"뒤로",WORN:"착용 중",WEAR:"착용",Cosmetic:"외형","Nothing here yet":"아직 없음","drag to turn":"드래그로 회전",PAUSED:"일시 정지","Tap or press any key to resume":"탭하거나 아무 키나 눌러 계속하기",Language:"언어","best {0}":"최고 {0}","{0} pin earned":"{0} 핀 획득","ZONE {0}":"구역 {0}",ACTIVE:"활성",Basic:"베이직",Bronze:"브론즈",Silver:"실버",Gold:"골드",Jade:"제이드",Sapphire:"사파이어",Ruby:"루비",Plasma:"플라즈마",Ice:"아이스",Nova:"노바",Void:"보이드","Indigo Reach":"쪽빛 심연","Ember Belt":"잉걸 벨트","Cryo Drift":"빙결 표류","Verdant Spine":"신록 능선",TAP:"탭","SPACE / ↑":"SPACE / ↑","SHORT JUMP":"짧은 점프",HOLD:"길게","HIGH JUMP":"높은 점프","← →":"← →","A / D · SWIPE":"A / D · 스와이프","SWITCH LANES":"차선 변경",STAY:"대기","GREEN HOPS OVER YOU":"초록은 당신을 뛰어넘음","DON'T JUMP":"점프 금지","COIN MAGNET":"코인 자석","Coins home in on you":"코인이 알아서 날아옵니다","START SHIELD":"시작 실드","Every run begins shielded":"매 런을 실드와 함께 시작",CADET:"카뎃","Standard issue":"기본 지급품",EMBER:"엠버","Running hot":"과열 주행 중",MOSS:"모스",Bioluminescent:"생물 발광",VOID:"보이드","Between stars":"별과 별 사이","GUAN YU":"관우","關羽 · Green Dragon":"關羽 · 청룡","ZHUGE LIANG":"제갈량","諸葛亮 · Crane Feather":"諸葛亮 · 학우선","ZHOU YU":"주유","周瑜 · Red Cliffs":"周瑜 · 적벽","HUANG ZHONG":"황충","黃忠 · Bowstring":"黃忠 · 활시위","CAO CAO":"조조","曹操 · Sable Chancellor":"曹操 · 흑의 승상",DIAOCHAN:"초선","貂蟬 · Moonlit Petals":"貂蟬 · 달빛 꽃잎",BOBA:"버블티","珍珠奶茶 · Extra pearls":"珍珠奶茶 · 펄 추가",AVOCADO:"아보카도","Guac mode":"과카몰리 모드",DRAGONFRUIT:"용과","火龍果 · Scales on":"火龍果 · 비늘 장착",RAMEN:"라멘","拉麵 · Egg, extra":"拉麵 · 계란 추가","MINT CHIP":"민트초코","Two scoops":"두 스쿱",MARS:"화성","火星 · Rover aboard":"火星 · 로버 탑승",VENUS:"금성","金星 · Volcanic, veiled":"金星 · 화산과 베일",EARTH:"지구","地球 · Home turf":"地球 · 고향 땅",SATURN:"토성","土星 · Rings on":"土星 · 고리 장착",MERCURY:"수성","水星 · Swift, sun-scorched":"水星 · 빠르고 뜨거운","★ INK DRAGON":"★ 묵룡","墨龍 · Legendary":"墨龍 · 전설"},hv={"GAME OVER":"ゲームオーバー","Dodge the blocks, grab the coins. It only gets faster.":"ブロックをかわしてコインを集めろ。速くなる一方だ。","Bank it or spend it.":"貯めるか、使うか。",PLAY:"プレイ",RETRY:"リトライ",CONTINUE:"コンティニュー",SKINS:"スキン","Wear a different runner":"別のランナーに着替える","Pick a runner. Buying one puts it on.":"ランナーを選ぼう。購入するとすぐ着用。",OWNED:"所持",EQUIPPED:"装備中",UNOWNED:"未所持",BACK:"戻る",WORN:"装備中",WEAR:"装備",Cosmetic:"見た目","Nothing here yet":"まだありません","drag to turn":"ドラッグで回転",PAUSED:"一時停止","Tap or press any key to resume":"タップまたはキーを押して再開",Language:"言語","best {0}":"最高 {0}","{0} pin earned":"{0}ピン獲得","ZONE {0}":"ゾーン {0}",ACTIVE:"有効",Basic:"ベーシック",Bronze:"ブロンズ",Silver:"シルバー",Gold:"ゴールド",Jade:"ジェイド",Sapphire:"サファイア",Ruby:"ルビー",Plasma:"プラズマ",Ice:"アイス",Nova:"ノヴァ",Void:"ヴォイド","Indigo Reach":"藍の深淵","Ember Belt":"残り火の帯","Cryo Drift":"極寒の漂流","Verdant Spine":"新緑の稜線",TAP:"タップ","SPACE / ↑":"SPACE / ↑","SHORT JUMP":"小ジャンプ",HOLD:"長押し","HIGH JUMP":"大ジャンプ","← →":"← →","A / D · SWIPE":"A / D · スワイプ","SWITCH LANES":"レーン移動",STAY:"待機","GREEN HOPS OVER YOU":"緑は頭上を跳び越える","DON'T JUMP":"ジャンプ禁止","COIN MAGNET":"コインマグネット","Coins home in on you":"コインが吸い寄せられる","START SHIELD":"スタートシールド","Every run begins shielded":"毎回シールド付きで開始",CADET:"カデット","Standard issue":"標準支給品",EMBER:"エンバー","Running hot":"熱走中",MOSS:"モス",Bioluminescent:"生物発光",VOID:"ヴォイド","Between stars":"星と星の間","GUAN YU":"関羽","關羽 · Green Dragon":"關羽 · 青龍","ZHUGE LIANG":"諸葛亮","諸葛亮 · Crane Feather":"諸葛亮 · 羽扇","ZHOU YU":"周瑜","周瑜 · Red Cliffs":"周瑜 · 赤壁","HUANG ZHONG":"黄忠","黃忠 · Bowstring":"黃忠 · 弓弦","CAO CAO":"曹操","曹操 · Sable Chancellor":"曹操 · 黒衣の丞相",DIAOCHAN:"貂蝉","貂蟬 · Moonlit Petals":"貂蟬 · 月下の花弁",BOBA:"タピオカ","珍珠奶茶 · Extra pearls":"珍珠奶茶 · タピオカ増量",AVOCADO:"アボカド","Guac mode":"ワカモレモード",DRAGONFRUIT:"ドラゴンフルーツ","火龍果 · Scales on":"火龍果 · 鱗つき",RAMEN:"ラーメン","拉麵 · Egg, extra":"拉麵 · 味玉追加","MINT CHIP":"チョコミント","Two scoops":"ダブル",MARS:"火星","火星 · Rover aboard":"ローバー搭乗",VENUS:"金星","金星 · Volcanic, veiled":"火山とベール",EARTH:"地球","地球 · Home turf":"ホームグラウンド",SATURN:"土星","土星 · Rings on":"環つき",MERCURY:"水星","水星 · Swift, sun-scorched":"灼熱の俊足","★ INK DRAGON":"★ 墨龍","墨龍 · Legendary":"伝説の龍"},Ua={_:av,en:cv,ko:lv,ja:hv},lu="gamedev8.lang";function uv(){var n;try{const t=localStorage.getItem(lu);if(Object.hasOwn(Ua,t))return t}catch{}for(const t of((n=globalThis.navigator)==null?void 0:n.languages)??[]){const e=t.slice(0,2);if(Object.hasOwn(Ua,e))return e}return"en"}const Ns=uv(),Se=(n,...t)=>(Ua[Ns][n]??n).replace(/\{(\d)\}/g,(e,i)=>t[i]??e);function fv(n){try{localStorage.setItem(lu,n)}catch{}}const cc=n=>new Intl.NumberFormat(Ns,n).format,$n=cc(),Fr=cc({style:"unit",unit:"meter"}),dv=cc({style:"unit",unit:"meter-per-minute"}),pv={ko:'"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Noto Sans CJK KR"',ja:'"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, "Noto Sans JP", "Noto Sans CJK JP"'},wr=["system-ui",pv[Ns],"sans-serif"].filter(Boolean).join(", ");function mv(){document.documentElement.lang=Ns;for(const t of document.querySelectorAll("[data-i18n]"))t.textContent=Se(t.textContent.trim());for(const t of document.querySelectorAll("[aria-label]"))t.setAttribute("aria-label",Se(t.getAttribute("aria-label")));const n=document.documentElement.style;n.setProperty("--font",wr),n.setProperty("--t-empty",JSON.stringify(Se("Nothing here yet"))),n.setProperty("--t-drag",JSON.stringify(` · ${Se("drag to turn")}`))}function gv(){const t=document.createElement("canvas");t.width=t.height=256;const e=t.getContext("2d");e.fillStyle="#141c33",e.fillRect(0,0,256,256),e.strokeStyle="#2a3b5a",e.lineWidth=4,e.strokeRect(0,0,256,256);const i=new zn(t);return i.wrapS=i.wrapT=Rr,i.repeat.set(6,40),i}function _v(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d"),i=e.createRadialGradient(128*.38,128*.34,128*.05,128*.5,128*.5,128*.55);i.addColorStop(0,"#fff6c4"),i.addColorStop(.55,"#ffd24a"),i.addColorStop(1,"#c98a12"),e.fillStyle=i,e.fillRect(0,0,128,128),e.strokeStyle="rgba(120,72,0,0.55)",e.lineWidth=5,e.beginPath(),e.arc(128/2,128/2,128*.36,0,Math.PI*2),e.stroke(),e.fillStyle="rgba(140,86,4,0.75)",e.beginPath();for(let s=0;s<10;s++){const r=s%2?14.08:33.28,o=-Math.PI/2+s*Math.PI/5;e[s?"lineTo":"moveTo"](128/2+Math.cos(o)*r,128/2+Math.sin(o)*r)}return e.closePath(),e.fill(),new zn(t)}const Fl=-140,_s=132,Fo=6;function vv(){const t=document.createElement("canvas");t.width=t.height=512;const e=t.getContext("2d");e.globalCompositeOperation="lighter";for(let s=0;s<40;s++){const r=s/40*Math.PI*2,o=512*(.2+.28*(s*7%5)/5),a=e.createLinearGradient(512/2,512/2,512/2+Math.cos(r)*o,512/2+Math.sin(r)*o);a.addColorStop(0,"rgba(180,140,255,0.55)"),a.addColorStop(1,"rgba(80,40,180,0)"),e.strokeStyle=a,e.lineWidth=512/50,e.beginPath(),e.moveTo(512/2,512/2),e.lineTo(512/2+Math.cos(r)*o,512/2+Math.sin(r)*o),e.stroke()}const i=e.createRadialGradient(512/2,512/2,0,512/2,512/2,512/2);return i.addColorStop(0,"rgba(235,250,255,1)"),i.addColorStop(.16,"rgba(120,220,255,0.95)"),i.addColorStop(.4,"rgba(120,90,255,0.5)"),i.addColorStop(.72,"rgba(60,30,140,0.16)"),i.addColorStop(1,"rgba(10,6,30,0)"),e.fillStyle=i,e.fillRect(0,0,512,512),new zn(t)}const xv=75*Math.PI/180,zl=Math.sin(-60*Math.PI/180),Mv=Math.sin(35*Math.PI/180),Ji=[0,5.5,9],zr=[{count:300,near:70,far:150,drift:.45},{count:500,near:140,far:250,drift:.18},{count:1100,near:200,far:285,drift:.05}],on=zr.reduce((n,t)=>n+t.count,0),hu=.3,Bl=[[1,1,1],[.72,.85,1],[1,.9,.72],[.85,.78,1]];function uu(n,t,e){let i=0,s=0;for(let o=0;o<8&&(i=(Math.random()*2-1)*xv,s=zl+Math.random()*(Mv-zl),!(!e||Math.abs(i)>.35||s<-.12||s>.42));o++);const r=Math.sqrt(1-s*s);n[t]=Math.sin(i)*r,n[t+1]=s,n[t+2]=-Math.cos(i)*r}function Sv(){const n=new Float32Array(on*3),t=new Float32Array(on*3),e=new Float32Array(on*3),i=new Float32Array(on*3),s=new Float32Array(on),r=new Float32Array(on),o=new Uint8Array(on);let a=0;for(let u=0;u<zr.length;u++){const d=zr[u];for(let g=0;g<d.count;g++,a++){const x=a*3;uu(t,x,d.drift>hu),r[a]=d.near+Math.random()*(d.far-d.near),o[a]=u,n[x]=Ji[0]+t[x]*r[a],n[x+1]=Ji[1]+t[x+1]*r[a],n[x+2]=Ji[2]+t[x+2]*r[a]}}const c=new Float32Array(on);for(let u=0;u<on;u++){const d=u*3,g=Bl[Math.random()*Bl.length|0],x=Math.random()**4;c[u]=.55+3*x;const p=.4+Math.random()*.5+.6*x;i[d]=g[0]*p,i[d+1]=g[1]*p,i[d+2]=g[2]*p,e.set([i[d],i[d+1],i[d+2]],d),s[u]=Math.random()*Math.PI*2}const l=new Ie;l.setAttribute("position",new Le(n,3)),l.setAttribute("color",new Le(e,3)),l.setAttribute("aSize",new Le(c,1));const h=new Xr({size:1.3,map:yv(),vertexColors:!0,transparent:!0,depthWrite:!1,blending:vn,fog:!1});return h.onBeforeCompile=u=>{u.vertexShader=u.vertexShader.replace("uniform float size;",`uniform float size;
attribute float aSize;`).replace("gl_PointSize = size;","gl_PointSize = size * aSize;")},{points:new nc(l,h),pos:n,dir:t,col:e,tint:i,phase:s,dist:r,layer:o}}function yv(){const t=document.createElement("canvas");t.width=t.height=64;const e=t.getContext("2d");e.globalCompositeOperation="lighter";for(const s of[!1,!0]){const r=s?e.createLinearGradient(0,0,0,64):e.createLinearGradient(0,0,64,0);r.addColorStop(0,"rgba(255,255,255,0)"),r.addColorStop(.5,"rgba(255,255,255,0.45)"),r.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=r,s?e.fillRect(64/2-1,0,2,64):e.fillRect(0,64/2-1,64,2)}const i=e.createRadialGradient(64/2,64/2,0,64/2,64/2,64/2);return i.addColorStop(0,"rgba(255,255,255,1)"),i.addColorStop(.12,"rgba(255,255,255,0.9)"),i.addColorStop(.3,"rgba(255,255,255,0.22)"),i.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=i,e.fillRect(0,0,64,64),new zn(t)}function Ev(n,t){const{pos:e,dir:i,dist:s,layer:r}=n;for(let o=0;o<on;o++){const a=o*3,c=zr[r[o]];let l=s[o]-t*c.drift;l<c.near&&(l=c.far,uu(i,a,c.drift>hu)),s[o]=l,e[a]=Ji[0]+i[a]*l,e[a+1]=Ji[1]+i[a+1]*l,e[a+2]=Ji[2]+i[a+2]*l}n.points.geometry.attributes.position.needsUpdate=!0}function wv(n,t,e){const s=document.createElement("canvas");s.width=s.height=256;const r=s.getContext("2d");r.globalCompositeOperation="lighter",r.translate(256/2,256/2),r.scale(1,e);const o=r.createRadialGradient(0,0,0,0,0,256*.46);o.addColorStop(0,`rgba(${n},0.3)`),o.addColorStop(.5,`rgba(${n},0.1)`),o.addColorStop(1,`rgba(${n},0)`),r.fillStyle=o,r.fillRect(-256,-256,256*2,256*2);for(let c=0;c<t;c++){const l=c/t*Math.PI*2;for(let h=0;h<220;h++){const f=h/220,u=l+f*3.6,d=256*.045+f*(256*.42),g=(Math.random()-.5)*256*.06,x=(Math.random()-.5)*256*.06,p=(1-f)*.32;r.fillStyle=`rgba(${n},${p.toFixed(3)})`,r.beginPath(),r.arc(Math.cos(u)*d+g,Math.sin(u)*d+x,256*.024*(1-f*.7),0,Math.PI*2),r.fill()}}const a=r.createRadialGradient(0,0,0,0,0,256*.3);return a.addColorStop(0,"rgba(255,255,255,0.95)"),a.addColorStop(.25,`rgba(${n},0.6)`),a.addColorStop(1,`rgba(${n},0)`),r.fillStyle=a,r.fillRect(-256,-256,256*2,256*2),new zn(s)}const bv=[{pos:[-150,60,-230],size:46,rgb:"150,190,255",arms:2,squash:.42,tilt:.5,spin:.004,opacity:.55},{pos:[130,-35,-210],size:34,rgb:"255,200,150",arms:2,squash:.3,tilt:-.9,spin:-.003,opacity:.45},{pos:[-95,-70,-190],size:28,rgb:"220,180,255",arms:3,squash:.75,tilt:.2,spin:.002,opacity:.4}];function Tv(n=64){const t=Float32Array.from({length:n*n},Math.random),e=(s,r)=>t[(r&n-1)*n+(s&n-1)],i=s=>s*s*(3-2*s);return(s,r,o=5)=>{let a=0,c=.5;for(let l=0;l<o;l++,s*=2,r*=2,c*=.5){const h=Math.floor(s),f=Math.floor(r),u=i(s-h),d=i(r-f),g=e(h,f)+(e(h+1,f)-e(h,f))*u,x=e(h,f+1)+(e(h+1,f+1)-e(h,f+1))*u;a+=c*(g+(x-g)*d)}return a}}function Av(n){const e=document.createElement("canvas");e.width=e.height=384;const i=e.getContext("2d"),s=i.createImageData(384,384),r=s.data,o=Tv();for(let a=0;a<384;a++)for(let c=0;c<384;c++){const l=c/384,h=a/384,f=o(l*5,h*5),u=Math.max(0,(f-.28)/.72)**1.5,d=(1-Math.abs(f*2-1))**6,g=.12+.75*u+.45*d;let x=0,p=0,m=0;for(const[y,_,L,[R,A,D],V]of n){const v=(l-y)/L,S=(h-_)/L,F=v*v+S*S;if(F>=1)continue;const z=(1-F)**2*V*g;x+=R*z,p+=A*z,m+=D*z}const w=(a*384+c)*4;r[w]=Math.min(255,x),r[w+1]=Math.min(255,p),r[w+2]=Math.min(255,m),r[w+3]=255}return i.putImageData(s,0,0),new zn(e)}const Rv=[{blobs:[[.4,.45,.38,[120,70,220],1],[.62,.3,.26,[220,80,190],.8],[.3,.66,.3,[60,90,230],.7]],pos:[-70,55,-250],size:[220,140],opacity:.45,tilt:0,spin:.006},{blobs:[[.5,.5,.4,[60,150,230],.85],[.32,.38,.24,[140,90,240],.75]],pos:[80,40,-230],size:[180,120],opacity:.38,tilt:0,spin:-.009},{blobs:[[.14,.5,.2,[200,190,255],.6],[.36,.48,.22,[255,220,200],.55],[.58,.52,.22,[190,210,255],.6],[.8,.5,.2,[230,200,240],.5]],pos:[20,80,-270],size:[420,110],opacity:.3,tilt:-.22,spin:0}],Cv=3,kl=-200,br=.8,Gl=4;function Pv(){const e=document.createElement("canvas");e.width=128,e.height=16;const i=e.getContext("2d"),s=i.createLinearGradient(0,0,128,0);return s.addColorStop(0,"rgba(255,255,255,0)"),s.addColorStop(.72,"rgba(180,220,255,0.55)"),s.addColorStop(.95,"rgba(255,255,255,1)"),s.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=s,i.beginPath(),i.moveTo(0,16/2),i.lineTo(128,0),i.lineTo(128,16),i.closePath(),i.fill(),new zn(e)}function Hl(n){const t=.15*Math.PI+Math.random()*.7*Math.PI,e=70+Math.random()*60;n.x=Math.cos(t)*e,n.y=Gl+Math.sin(t)*e*.5,n.vx=-n.x/br,n.vy=(Gl-n.y)/br,n.life=br,n.mesh.rotation.z=Math.atan2(n.vy,n.vx),n.mesh.visible=!0}function Na(n,t){return new ce(new je(t,t),new cn({map:n,transparent:!0,depthWrite:!1,blending:vn,fog:!1,dithering:!0}))}const Tr=.9,vs=60;class Lv{constructor(t){this.flash=Na(Da(),5),this.ring=new ce(new qr(.86,1,48),new cn({transparent:!0,depthWrite:!1,blending:vn,side:_n})),this.flash.material.depthTest=this.ring.material.depthTest=!1,this.vel=new Float32Array(vs*3),this.pos=new Float32Array(vs*3),this.col=new Float32Array(vs*3);const e=new Ie;e.setAttribute("position",new Le(this.pos,3)),e.setAttribute("color",new Le(this.col,3)),this.sparks=new nc(e,new Xr({size:.22,map:Da(),vertexColors:!0,transparent:!0,depthWrite:!1,blending:vn})),this.sparks.frustumCulled=!1,this.color=new Nt,this.t=Tr,this.group=new Rt,this.group.add(this.flash,this.ring,this.sparks),this.group.visible=!1,t.add(this.group)}fire(t,e,i,s){this.group.position.set(t,e,i),this.group.visible=!0,this.t=0,this.color.set(s),this.flash.material.color.copy(this.color).lerp(Vl.set(16777215),.6),this.ring.material.color.copy(this.color);for(let r=0;r<vs;r++){const o=r*3,a=Math.random()*Math.PI*2,c=Math.random()*2-1,l=Math.sqrt(1-c*c),h=3+Math.random()*6;this.vel[o]=l*Math.cos(a)*h,this.vel[o+1]=(Math.abs(c)+.3)*h,this.vel[o+2]=(l*Math.sin(a)*.6+.25)*h,this.pos[o]=0,this.pos[o+1]=0,this.pos[o+2]=0}this.update(0)}update(t){if(this.t>=Tr){this.group.visible=!1;return}this.t+=t;const e=Math.min(1,this.t/Tr),i=Math.max(0,1-e*4);this.flash.scale.setScalar(1+(1-i)*2.5),this.flash.material.opacity=i;const s=Math.min(1,e*1.6);this.ring.scale.setScalar(.3+s*5.5),this.ring.material.opacity=(1-s)**1.5;for(let r=0;r<vs;r++){const o=r*3;this.vel[o+1]-=18*t,this.pos[o]+=this.vel[o]*t,this.pos[o+1]+=this.vel[o+1]*t,this.pos[o+2]+=this.vel[o+2]*t;const a=Vl.set(16777215).lerp(this.color,Math.min(1,e*2.5)).multiplyScalar(1-e*e);this.col[o]=a.r,this.col[o+1]=a.g,this.col[o+2]=a.b}this.sparks.geometry.attributes.position.needsUpdate=!0,this.sparks.geometry.attributes.color.needsUpdate=!0}}const Vl=new Nt,Jr=Kr.zones.map(n=>Object.fromEntries(Object.entries(n).map(([t,e])=>[t,typeof e=="string"&&e.startsWith("#")?new Nt(e):e])));function Iv(n){return Math.floor(Math.max(0,n)/eu)%Jr.length}const Wl=Jr.map(n=>n.name),fu=Kr.zones.map(n=>n.ring),an=2.2,ki=Jr[0],lc=Object.entries(jh.materials).filter(([n])=>n!=="_"),It=Object.fromEntries(lc.map(([n,t])=>[n,t.finish==="glow"?new Pe({color:ki[n],emissive:ki[t.emissiveFrom],roughness:.32,emissiveIntensity:ki.emissive}):new Pe({color:ki[n],roughness:ki.rough,metalness:ki.metal})])),Dv=lc.filter(([,n])=>n.finish==="body").map(([n])=>n),Uv=lc.filter(([,n])=>n.finish==="glow"),Kn=K_-ru,xs=(n,t)=>{const e=new Zn(n,Math.max(.01,t-n*2),3,10);return e.rotateZ(Math.PI/2),e},At={post:new Zn(.09,iu-.31,3,8),bar:xs(.13,an),midBar:xs(.1,an-.4),skirt:wt(an-.5,.34,.16),tallPost:new Zn(.09,su-.31,3,8),blockBody:new Qt(2,Ln,.7),blockStripe:xs(.09,2),blockCap:wt(2.16,.44,.86),blockGrin:new pe(.34,.055,6,16,Math.PI),hopShell:wt(1.5,Kn*.8,.6),hopSkirt:wt(1.1,Kn*.4,.44),hopFin:wt(.22,Kn*.5,.42),hopGrin:new pe(.12,.032,6,12,Math.PI),stompCore:wt(1.25,mn*.78,.6),stompPlate:wt(1.05,mn*.2,.5),stompCap:wt(.8,mn*.3,.44),stompProng:wt(.16,mn*.5,.3),eye:new Vt(1,12,10),shine:new Vt(1,6,5),brow:new Qt(1,1,1),fang:new $e(.06,.14,4),tooth:new Qt(.1,.13,.1),winPost:new Zn(.09,ou-.31,3,8),winPanel:new Qt(an-.3,.8,.22),winLid:new Qt(an-.3,.3,.22),doorPost:new Qt(.3,Er[1],.44),doorLintel:new Qt(an,La-Er[1],.5),doorCap:wt(2.1,.4,.6),doorStrip:xs(.06,an-.5),doorJamb:new Qt(.06,Er[1]-.2,.06),doorGrin:new pe(.3,.05,6,16,Math.PI),sled:wt(2,.4,.9),sliderBody:new Qt(1.6,Hi-.6,.7),sliderCap:wt(1.76,.44,.86),rail:new Zn(.07,2,3,8),roller:new Vt(.22,12,10),shell:wt(1.7,.5,.56),ridge:xs(.1,1.3),leg:new Qt(.08,.4,.08),claw:new Vt(.11,10,8),thiefBody:wt(.7,.62,.52),thiefHead:wt(.52,.42,.46),mask:new Qt(.5,.13,.08),sack:wt(.42,.46,.36),foot:new Qt(.13,.2,.13)},Xl=new Pe({color:1182490,roughness:.25}),Nv=new Pe({color:16777215,emissive:16777215,emissiveIntensity:.5}),Zr=new Pe({color:16773334,roughness:.5});function yn(n,{y:t,spread:e,r:i,z:s,brow:r=1,tilt:o=.45}){const a=[],c=[];for(const l of[-1,1]){const h=new ce(At.eye,Xl);h.scale.setScalar(i),h.position.set(l*e,t,s);const f=new ce(At.shine,Nv);if(f.scale.setScalar(.3),f.position.set(-.32,.34,.6),h.add(f),n.add(h),a.push(h),!r)continue;const u=new ce(At.brow,Xl);u.scale.set(i*2.4*r,i*.6,i*.5),u.position.set(l*e,t+i*.95,s),u.rotation.z=-l*o,n.add(u),c.push(u)}return{eyes:a,brows:c}}function En(n,t,e){const i=Math.random()*Math.PI*2;return n.userData.anim=s=>{s+=i;const r=Math.max(.1,Math.min(1,30*(1-Math.sin(s*1.3))));for(const o of t)o.scale.y=o.scale.x*r;e(s)},n}function Ov(){const n=new Rt,t=iu-.13;n.add(C(At.post,It.hurdle,-.9500000000000001,t/2,0),C(At.post,It.hurdle,an/2-.15,t/2,0),C(At.bar,It.hurdleBar,0,t,0),C(At.skirt,It.hurdle,0,.17,0));const{eyes:e}=yn(n,{y:t-.02,spread:.3,r:.075,z:.11,tilt:.4}),i=[-1,1].map(s=>{const r=C(At.fang,Zr,s*.16,.24,.1);return r.rotation.x=Math.PI,n.add(r),r});return En(n,e,s=>{i.forEach((r,o)=>{r.position.y=.24+.035*Math.sin(s*6+o*Math.PI)})})}function Fv(){const n=new Rt,t=su-.13;n.add(C(At.tallPost,It.tall,-.9500000000000001,t/2,0),C(At.tallPost,It.tall,an/2-.15,t/2,0),C(At.bar,It.tallBar,0,t,0),C(At.midBar,It.tall,0,t*.55,0),C(At.skirt,It.tall,0,.17,0));const{eyes:e,brows:i}=yn(n,{y:t,spread:.32,r:.085,z:.08,tilt:.25});return En(n,e,s=>{const r=.035*Math.sin(s*.9);[-1,1].forEach((o,a)=>{e[a].position.x=i[a].position.x=o*.32+r})})}function zv(){const n=new Rt;n.add(C(At.blockBody,It.block,0,Ln/2,0),C(At.blockCap,It.block,0,Ln-.22,0),C(At.blockStripe,It.blockStripe,0,Ln*.68,.32),C(At.blockStripe,It.blockStripe,0,Ln*.42,.32));const{eyes:t}=yn(n,{y:Ln*.72,spread:.44,r:.13,z:.3,brow:1.15,tilt:.5}),e=C(At.blockGrin,It.blockStripe,0,Ln*.6,.38);e.rotation.z=Math.PI,n.add(e);const i=[-.2,0,.2].map(s=>C(At.tooth,Zr,s,Ln*.6,.39));return n.add(...i),En(n,t,s=>{i.forEach((r,o)=>{r.position.y=Ln*.6+.02*Math.sin(s*7+o*2.1)})})}function Bv(){const n=new Rt;n.add(C(At.hopSkirt,It.hopGlow,0,Kn*.2,0),C(At.hopShell,It.hop,0,Kn*.6,0));const t=[-1,1].map(s=>C(At.hopFin,It.hop,s*.81,Kn*.5,0));n.add(...t);const{eyes:e}=yn(n,{y:Kn*.66,spread:.24,r:.07,z:.23,brow:.9,tilt:.3}),i=C(At.hopGrin,It.hopGlow,0,Kn*.48,.24);return i.rotation.z=Math.PI,n.add(i),En(n,e,s=>{const r=.15*Math.sin(s*5);t[0].rotation.z=r,t[1].rotation.z=-r})}const du=12;function Oa(n){const t=yh.euclideanModulo(n/du+.5,1);return{y:ru*Math.sin(Math.PI*t),tilt:-.4*Math.cos(Math.PI*t)}}function kv(){const n=new Rt;n.add(C(At.stompPlate,It.stompGlow,0,mn*.1,0),C(At.stompCore,It.stomp,0,mn*.5,0),C(At.stompCap,It.stompGlow,0,mn*.85,0));const t=[-1,1].map(i=>C(At.stompProng,It.stomp,i*.68,mn*.3,0));n.add(...t);const{eyes:e}=yn(n,{y:mn*.62,spread:.23,r:.08,z:.22,brow:1.1,tilt:.6});for(const i of[-1,1]){const s=C(At.fang,Zr,i*.12,mn*.36,.26);s.rotation.x=Math.PI,n.add(s)}return En(n,e,i=>{t[0].rotation.x=t[1].rotation.x=.15*Math.sin(i*4)})}function Gv(){const n=new Rt,t=ou-.13,[e,i]=J_,s=[-1,1].map(l=>C(At.winPost,It.window,l*(an/2-.15),t/2,0)),r=new Rt;r.add(C(At.skirt,It.window,0,.17,0),C(At.winPanel,It.window,0,e-.58,0),C(At.bar,It.windowBar,0,e-.13,0));const o=new Rt;o.add(C(At.winLid,It.window,0,i+.15,0),C(At.bar,It.windowBar,0,t,0));const{eyes:a}=yn(o,{y:i+.15,spread:.3,r:.075,z:.13,tilt:.35}),c=[-1,1].map(l=>{const h=C(At.fang,Zr,l*.16,i+.1,.12);return h.rotation.x=Math.PI,o.add(h),h});return n.add(r,o,...s),n.userData.hit=[r,o,...s],En(n,a,l=>{c.forEach((h,f)=>{h.position.y=i+.1+.02*Math.sin(l*6+f*Math.PI)})})}function Hv(){const n=new Rt,[,t]=Er,e=[-1,1].map(o=>C(At.doorPost,It.door,o*(an/2-.15),t/2,0)),i=C(At.doorLintel,It.door,0,(t+La)/2,0);n.add(...e,i,C(At.doorCap,It.door,0,La-.2,0),C(At.doorStrip,It.doorGlow,0,t+.1,.22),C(At.doorJamb,It.doorGlow,-.82,t/2,.2),C(At.doorJamb,It.doorGlow,.82,t/2,.2));const{eyes:s}=yn(n,{y:t+.6,spread:.4,r:.12,z:.26,brow:.9,tilt:.15}),r=C(At.doorGrin,It.doorGlow,0,t+.42,.27);return r.rotation.z=Math.PI,n.add(r),n.userData.hit=[i,...e],En(n,s,o=>{for(const a of s)a.position.y=t+.6-.02*Math.sin(o*1.1)})}function Vv(){const n=new Rt;n.add(C(At.sled,It.block,0,.2,0),C(At.sliderBody,It.block,0,Hi/2+.1,0),C(At.sliderCap,It.block,0,Hi-.22,0),C(At.rail,It.blockStripe,-.55,Hi*.53,.34),C(At.rail,It.blockStripe,.55,Hi*.53,.34));const t=[-1,1].map(s=>C(At.roller,It.blockStripe,s*.88,.24,0));n.add(...t);const{eyes:e,brows:i}=yn(n,{y:Hi*.72,spread:.36,r:.12,z:.3,brow:1.1,tilt:.5});return En(n,e,s=>{const r=.04*Math.sin(s*1.4);[-1,1].forEach((o,a)=>{e[a].position.x=i[a].position.x=o*.36+r}),t.forEach((o,a)=>{o.position.y=.24+.015*Math.sin(s*9+a*Math.PI)})})}function Wv(){const n=new Rt;n.add(C(At.shell,It.hurdle,0,.6,0),C(At.ridge,It.hurdleBar,0,Z_-.1,0),C(At.claw,It.hurdle,-.5,.5,.28),C(At.claw,It.hurdle,.5,.5,.28));const t=[];for(const i of[-1,1])for(const s of[-.18,0,.18]){const r=C(At.leg,It.hurdle,i*.8,.24,s);r.rotation.z=i*.35,n.add(r),t.push(r)}const{eyes:e}=yn(n,{y:.86,spread:.22,r:.06,z:.22,tilt:.4});return En(n,e,i=>{t.forEach((s,r)=>{s.position.y=.24+.03*Math.sin(i*12+r*Math.PI)})})}function Xv(){const n=new Rt;n.add(C(At.thiefBody,It.thief,0,.44,0),C(At.thiefHead,It.thief,0,$_-.21,0),C(At.mask,It.thiefGlow,0,.72,.2));const t=C(At.sack,It.thiefGlow,.34,.55,-.16),e=[-1,1].map(s=>C(At.foot,It.thief,s*.14,.14,0));n.add(t,...e);const{eyes:i}=yn(n,{y:.72,spread:.12,r:.05,z:.24,brow:0});return En(n,i,s=>{e.forEach((r,o)=>{r.position.y=.14+.03*Math.sin(s*10+o*Math.PI)}),t.position.y=.55+.02*Math.sin(s*10)})}const Yl=10,Yv=16;function ql(n){return n>=-Yl?0:.5-.5*Math.cos(2*Math.PI*(n+Yl)/Yv)}const qv=.6,Kv=n=>we.reduce((t,e)=>Math.abs(e-n)<Math.abs(t-n)?e:t);function Jv(n,t,e,i){const s=t<-10?i:Kv(n),r=qv*e;return n+Math.max(-r,Math.min(r,s-n))}const Zv={hurdle:Ov,tall:Fv,block:zv,hopper:Bv,stomp:kv,window:Gv,door:Hv,slider:Vv,scuttler:Wv,thief:Xv};function Kl(n){return Oa(n+du/2).y}const Jl=.8,$v=new je(.26,.44),jv=.2,Zl=Kr.guides;function Qv({key:n,act:t,sub:e}){const r=document.createElement("canvas");r.width=512,r.height=256;const o=r.getContext("2d");return o.fillStyle="rgba(10,18,40,0.72)",o.strokeStyle="rgba(120,200,255,0.9)",o.lineWidth=6,o.beginPath(),o.roundRect(6,6,500,244,22),o.fill(),o.stroke(),o.textAlign="center",o.fillStyle="#eaf6ff",o.font=`bold 92px ${wr}`,o.fillText(Se(n),512/2,108),o.fillStyle="#7fd4ff",o.font=`bold 46px ${wr}`,o.fillText(Se(e),512/2,168),o.fillStyle="rgba(190,215,240,0.75)",o.font=`34px ${wr}`,o.fillText(Se(t),512/2,216),new zn(r)}const mi=we.map((n,t)=>t),tx=9,$l=()=>({blocks:[],hurdles:[],talls:[],hoppers:[],stomps:[],windows:[],doors:[],sliders:[],scuttlers:[],thieves:[]});function ex(n,t,e=Math.random,i=!1){const s=()=>Math.floor(e()*we.length),r=c=>(c+1+Math.floor(e()*2))%we.length,o=c=>c===1?e()<.5?0:2:1,a=()=>{const c=e();if(n>.22&&c<.1){const l=s();return{blocks:mi.filter(h=>h!==l)}}if(n>.55&&c<.14)return{talls:mi};if(n>.3&&c<.22){const l=s();return{blocks:n>.45&&e()<.5?[r(l)]:[],talls:[l]}}if(n>.12&&c<.29)return{hurdles:mi};if(n>.26&&c<.38){const l=s();return{blocks:n>.5&&e()<.45?[r(l)]:[],hoppers:[l]}}if(n>.38&&c<.46){const l=s(),h=n>.55&&e()<.4;return{stomps:[l],hoppers:h?[r(l)]:[]}}if(n>.2&&c<.52){const l=s(),h=n>.5&&e()<.5;return{windows:[l],talls:h?[r(l)]:[]}}if(n>.34&&c<.58){const l=s();if(n>.55&&!i&&e()<.35)return{doors:mi};const h=n>.45&&e()<.5;return{doors:[l],hurdles:h?[r(l)]:[]}}if(n>.42&&c<.64){const l=s(),h=o(l),f=n>.6&&e()<.5;return{sliders:[{lane:l,to:h}],hurdles:f?[3-l-h]:[]}}if(n>.48&&c<.7)return{scuttlers:[s()]};if(n>.16&&c<.76){const l=s(),h=n>.35&&e()<.5;return{thieves:[l],blocks:h?[r(l)]:[]}}if(n>.08&&c<.86){const l=s();return{blocks:[l],hurdles:[r(l)]}}return c<.94?{blocks:[s()]}:{hurdles:[s()]}};for(let c=0;c<6;c++){const l={...$l(),...a()},h=mi.filter(f=>!l.blocks.includes(f)&&!l.sliders.some(u=>u.lane===f));if(h.length===we.length||t.every(f=>h.some(u=>Math.abs(u-f)<=1)))return{...l,open:h}}return{...$l(),hurdles:[s()],open:mi}}function nx(n,t){const e=Math.max(0,n-t*3.2),i=1-e;return{pop:e,scale:1-i*i}}class ix{constructor(t){this.scene=t,this.groundTex=gv();const e=new ce(new je(16,400),new Pe({map:this.groundTex,roughness:1}));e.rotation.x=-Math.PI/2,e.position.z=-180,e.receiveShadow=!0,t.add(e);for(const u of[-4.2,4.2]){const d=new ce(new Qt(.3,.6,400),new Pe({color:3820410,roughness:.6}));d.position.set(u,.3,-180),t.add(d)}const i=vv();this.wormhole=Na(i,40),this.wormhole.position.set(0,4,Fl),this.halo=Na(i,70),this.halo.position.set(0,4,Fl-6),this.halo.material.opacity=.35,t.add(this.wormhole,this.halo),this.stars=Sv(),t.add(this.stars.points),this.nebulae=Rv.map(u=>{const d=new ce(new je(u.size[0],u.size[1]),new cn({map:Av(u.blobs),transparent:!0,opacity:u.opacity,depthWrite:!1,blending:vn,fog:!1,dithering:!0}));return d.position.set(...u.pos),d.rotation.z=u.tilt,d.userData.spin=u.spin,t.add(d),d}),this.galaxies=bv.map(u=>{const d=new ce(new je(u.size,u.size),new cn({map:wv(u.rgb,u.arms,u.squash),transparent:!0,opacity:u.opacity,depthWrite:!1,blending:vn,fog:!1,dithering:!0}));return d.position.set(...u.pos),d.rotation.z=u.tilt,d.userData.spin=u.spin,t.add(d),d});const s=Pv(),r=new je(30,3.6);this.shooters=[];for(let u=0;u<Cv;u++){const d=new ce(r,new cn({map:s,transparent:!0,depthWrite:!1,blending:vn,fog:!1}));d.position.z=kl,d.visible=!1,t.add(d),this.shooters.push({mesh:d,life:0,wait:1+u*2.5+Math.random()*3,x:0,y:0,vx:0,vy:0})}const o=new pe(7.5,.16,6,40),a=new cn({color:10124287,transparent:!0,opacity:.5});this.ringMat=a,this.rings=[];for(let u=0;u<Fo;u++){const d=new ce(o,a);d.position.set(0,2.5,-_s+u*(_s/Fo)),this.rings.push(d),t.add(d)}this.burst=new Lv(t),this.obstacles=[],this.coins=[],this.footprints=[];const c=new Pe({color:14722336,roughness:.25,metalness:1,emissive:10514432,emissiveIntensity:1.1}),l=_v(),h=new Pe({map:l,emissiveMap:l,emissive:16777215,emissiveIntensity:.5,roughness:.3,metalness:.85});this.coinMat=[c,h,h],this.coinGeo=new Dt(.42,.42,.1,28,1);const f=new je(5.4,2.7);this.guides=Zl.map(u=>{const d=new ce(f,new cn({map:Qv(u),transparent:!0,depthWrite:!1}));return d.position.set(u.side*5.9,2.1,u.z),d.rotation.y=-u.side*.32,this.scene.add(d),d}),this._box=new wi,this._center=new P,this.zoneStar=new Nt(16777215),this.starClock=0,this.flare=0,this.magnet=!1,this.reset()}clearNear(t){for(const e of this.obstacles)e.active&&e.mesh.position.z>-t&&(e.active=!1,e.mesh.visible=!1)}reset(){for(const t of this.obstacles)t.active=!1,t.mesh.visible=!1;for(const t of this.coins)t.active=!1,t.mesh.visible=!1;for(const t of this.footprints)t.active=!1,t.mesh.visible=!1;this.t=0,this.lastOpen=mi,this.lastHold=!1,this.spawnTimer=-1.2,this.guides.forEach((t,e)=>{t.position.z=Zl[e].z,t.visible=!0}),this.rings.forEach((t,e)=>{t.position.z=-_s+e*(_s/Fo)}),this.burst.t=Tr}_take(t,e,i){let s=t.find(e);return s||(t.push(s={mesh:i()}),this.scene.add(s.mesh)),s.active=s.mesh.visible=!0,s}_getObstacle(t){const e=this._take(this.obstacles,i=>!i.active&&i.type===t,()=>{const i=Zv[t]();return i.traverse(s=>{s.isMesh&&(s.castShadow=!0)}),i});return e.type=t,e}_getCoin(){const t=this._take(this.coins,e=>!e.active,()=>{const e=new ce(this.coinGeo,this.coinMat);return e.rotation.order="YXZ",e.rotation.x=Math.PI/2,e});return t.pop=0,t.mesh.scale.setScalar(1),t}_getFootprint(){const t=this._take(this.footprints,e=>!e.active,()=>{const e=new ce($v,new cn({color:9422079,transparent:!0,depthWrite:!1}));return e.rotation.x=-Math.PI/2,e});return t.life=Jl,t}_spawnRow(t,e){const i=ex(e,this.lastOpen,Math.random,this.lastHold);for(const r of i.blocks)this._getObstacle("block").mesh.position.set(we[r],0,t);for(const r of i.hurdles)this._getObstacle("hurdle").mesh.position.set(we[r],0,t);for(const r of i.talls)this._getObstacle("tall").mesh.position.set(we[r],0,t);for(const r of i.windows)this._getObstacle("window").mesh.position.set(we[r],0,t);for(const r of i.doors)this._getObstacle("door").mesh.position.set(we[r],0,t);for(const{lane:r,to:o}of i.sliders){const a=this._getObstacle("slider");a.home=we[r],a.sweep=we[o],a.mesh.position.set(a.home+(a.sweep-a.home)*ql(t),0,t)}for(const r of i.scuttlers)this._getObstacle("scuttler").mesh.position.set(we[r],0,t);for(const r of i.thieves){const o=this._getObstacle("thief");o.done=!1,o.mesh.rotation.y=0,o.mesh.position.set(we[r],0,t)}const s=Oa(t);for(const r of i.hoppers){const o=this._getObstacle("hopper");o.mesh.position.set(we[r],s.y,t),o.mesh.rotation.x=s.tilt}for(const r of i.stomps)this._getObstacle("stomp").mesh.position.set(we[r],Kl(t),t);if(this.lastOpen=i.open,this.lastHold=i.talls.length>0,Math.random()<G_){const r=l=>l[Math.floor(Math.random()*l.length)],o=i.open.filter(l=>!i.hurdles.includes(l)&&!i.talls.includes(l)&&!i.stomps.includes(l)&&!i.windows.includes(l)&&!i.thieves.includes(l));let a,c;i.windows.length?(a=r(i.windows),c=2):o.length&&!i.scuttlers.length?(a=r(o),c=1):(a=r(i.open),c=i.talls.length?2.7:2);for(let l=0;l<3;l++){const h=this._getCoin();h.baseY=c,h.phase=l*.6,h.mesh.position.set(we[a],h.baseY,t-l*2.2)}}}_blendZone(t,e){var o;const i=Jr[e],s=1-Math.exp(-1.2*t),r=(a,c)=>a.color.lerp(c,s);for(const a of Dv){const c=It[a];r(c,i[a]),c.roughness+=(i.rough-c.roughness)*s,c.metalness+=(i.metal-c.metalness)*s}for(const[a,c]of Uv){const l=It[a];r(l,i[a]),l.emissive.lerp(i[c.emissiveFrom],s),l.emissiveIntensity+=(i.emissive-l.emissiveIntensity)*s}this.ringMat.color.lerp(i.ring,s),this.wormhole.material.color.lerp(i.hole,s),this.halo.material.color.lerp(i.hole,s);for(const a of this.nebulae)a.material.color.lerp(i.nebula,s);for(const a of this.galaxies)a.material.color.lerp(i.star,s);this.zoneStar.lerp(i.star,s),this.scene.fog&&this.scene.fog.color.lerp(i.bg,s),(o=this.scene.background)!=null&&o.isColor&&this.scene.background.lerp(i.bg,s)}update(t,e,i,s=0){const r=e*t;this.t+=t,this.groundTex.offset.y+=r*.02;const o=tu(e),a=Iv(s);this._blendZone(t,a),this.flare=Math.max(0,this.flare-t*1.6),this.wormhole.rotation.z+=t*(.5+.6*this.flare),this.halo.rotation.z-=t*.22;const c=(1+.35*o+Math.sin(this.t*1.6)*.02)*(1+.1*this.flare);this.wormhole.scale.setScalar(c),this.halo.scale.setScalar(c),this.ringMat.opacity=.5+.3*this.flare;const{col:l,tint:h,phase:f}=this.stars,u=1.7+1.6*o+2.5*this.flare,d=this.zoneStar;this.starClock+=t*u;for(let _=0;_<on;_++){const L=.55+.45*Math.sin(this.starClock+f[_])+.5*this.flare,R=_*3;l[R]=h[R]*L*d.r,l[R+1]=h[R+1]*L*d.g,l[R+2]=h[R+2]*L*d.b}this.stars.points.geometry.attributes.color.needsUpdate=!0;for(const _ of this.nebulae)_.rotation.z+=t*_.userData.spin;for(const _ of this.galaxies)_.rotation.z+=t*_.userData.spin;Ev(this.stars,r);for(const _ of this.shooters){if(_.life<=0){_.wait-=t,_.wait<=0&&(Hl(_),_.wait=3+Math.random()*7);continue}_.life-=t,_.x+=_.vx*t,_.y+=_.vy*t,_.mesh.position.set(_.x,_.y,kl),_.mesh.material.opacity=Math.min(1,_.life/.3,(br-_.life)/.12)*.9,_.life<=0&&(_.mesh.visible=!1)}for(const _ of this.rings)_.position.z+=r,_.position.z>ms&&(_.position.z-=_s);let g=!1,x=0,p=0;const m=we[i.lane];for(const _ of this.obstacles){if(!_.active)continue;_.mesh.position.z+=r;const L=_.mesh.position.z;if(L>ms){_.active=!1,_.mesh.visible=!1;continue}if(_.type==="hopper"){const D=Oa(L);_.mesh.position.y=D.y,_.mesh.rotation.x=D.tilt}else if(_.type==="stomp")_.mesh.position.y=Kl(L);else if(_.type==="slider")_.mesh.position.x=_.home+(_.sweep-_.home)*ql(L);else if(_.type==="scuttler")_.mesh.position.x=Jv(_.mesh.position.x,L,r,m);else if(_.type==="thief"&&_.done){_.mesh.position.y+=t*9,_.mesh.rotation.y+=t*12,_.mesh.position.y>7&&(_.active=!1,_.mesh.visible=!1);continue}if(_.mesh.userData.anim(this.t),Math.abs(L)>3)continue;const R=_.mesh.userData.hit;let A=!1;if(R){_.mesh.updateWorldMatrix(!0,!1);for(const D of R)if(this._box.setFromObject(D),i.box.intersectsBox(this._box)){A=!0;break}}else this._box.setFromObject(_.mesh),A=i.box.intersectsBox(this._box);A&&(_.type==="thief"?(_.done=!0,p+=j_):g=!0)}for(const _ of this.guides)_.visible&&(_.position.z+=r,_.position.z>ms&&(_.visible=!1));const w=i.character.stepFoot;w&&this._getFootprint().mesh.position.set(i.mesh.position.x+w*jv,.02,i.mesh.position.z);for(const _ of this.footprints)if(_.active){if(_.mesh.position.z+=r,_.life-=t,_.life<=0||_.mesh.position.z>ms){_.active=!1,_.mesh.visible=!1;continue}_.mesh.material.opacity=_.life/Jl*.55}i.box.getCenter(this._center);for(const _ of this.coins){if(!_.active)continue;if(_.mesh.position.z+=r,_.pop>0){const R=nx(_.pop,t);_.pop=R.pop,_.mesh.position.y+=t*5,_.mesh.rotation.y+=t*20,_.mesh.scale.setScalar(R.scale),_.pop===0&&(_.active=!1,_.mesh.visible=!1);continue}if(_.mesh.rotation.y+=t*2.6,_.mesh.position.z>ms){_.active=!1,_.mesh.visible=!1;continue}const L=_.mesh.position.distanceToSquared(this._center);this.magnet&&L<tx?_.mesh.position.lerp(this._center,1-Math.exp(-6*t)):_.mesh.position.y=_.baseY+Math.sin(this.t*3+_.phase)*.12,L<1.1&&(_.pop=1,x++)}if(x){this.flare=Math.min(1,this.flare+.45*x);const _=this.shooters.find(L=>L.life<=0);_&&(Hl(_),_.wait=3+Math.random()*7)}const y=Pl+(k_-Pl)*o;for(this.spawnTimer+=t;this.spawnTimer>=y;)this._spawnRow(B_,o),this.spawnTimer-=y;return{hit:g,coinsCollected:x,zone:a,stolen:p}}}const jl=["ArrowUp","KeyW","Space"],sx=250;function rx(n){const{onLeft:t,onRight:e,onJump:i,onJumpRelease:s,onTap:r,onShield:o,onRestart:a}=n;window.addEventListener("keydown",u=>{if(jl.includes(u.code)){u.preventDefault(),u.repeat||i();return}switch(u.code){case"ArrowLeft":case"KeyA":t();break;case"ArrowRight":case"KeyD":e();break;case"KeyS":o();break;case"Enter":a();break}}),window.addEventListener("keyup",u=>{jl.includes(u.code)&&s()});let c=0,l=0,h=0;const f=document.getElementById("app");f.addEventListener("touchstart",u=>{const d=u.changedTouches[0];c=d.clientX,l=d.clientY,h=performance.now()},{passive:!0}),f.addEventListener("touchend",u=>{const d=u.changedTouches[0],g=d.clientX-c,x=d.clientY-l,p=Math.abs(g),m=Math.abs(x),w=performance.now()-h;if(p<24&&m<24&&w<600){r(Math.min(w,sx)/1e3);return}p>m?g>0?e():t():x<0&&i()},{passive:!0})}const ox=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,ax=`
uniform sampler2D tDiffuse;
uniform float hit;    // impact pulse, 0..1
uniform float dead;   // the grey look, 0..1
varying vec2 vUv;
void main() {
  vec2 d = vUv - 0.5;
  vec3 col;
  if (hit > 0.001) {
    // Zoom blur streaking out from the centre, each tap split by channel so
    // the streaks are rainbow-fringed — reads as a blow, not a focus miss.
    col = vec3(0.0);
    for (int i = 0; i < 8; i++) {
      vec2 o = d * (float(i) / 7.0) * hit * 0.06;
      col.r += texture2D(tDiffuse, vUv - o * 1.5).r;
      col.g += texture2D(tDiffuse, vUv - o).g;
      col.b += texture2D(tDiffuse, vUv - o * 0.5).b;
    }
    col /= 8.0;
  } else {
    col = texture2D(tDiffuse, vUv).rgb;
  }
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(l), dead * 0.75) * (1.0 - dead * 0.28);
  col *= 1.0 - dead * 0.55 * smoothstep(0.25, 0.85, length(d) * 1.35);   // vignette
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;class cx{constructor(t){this.renderer=t,this.hit=0,this.dead=0,this.rt=new ni(1,1,{type:rs,samples:4}),this.mat=new Fn({uniforms:{tDiffuse:{value:this.rt.texture},hit:{value:0},dead:{value:0}},vertexShader:ox,fragmentShader:ax,depthTest:!1,depthWrite:!1}),this.quadScene=new ec().add(new ce(new je(2,2),this.mat)),this.quadCam=new ja(-1,1,1,-1,0,1)}setSize(t,e){const i=this.renderer.getPixelRatio();this.rt.setSize(t*i,e*i)}render(t,e){if(this.hit<=0&&this.dead<=0){this.renderer.render(t,e);return}this.mat.uniforms.hit.value=this.hit,this.mat.uniforms.dead.value=this.dead,this.renderer.setRenderTarget(this.rt),this.renderer.render(t,e),this.renderer.setRenderTarget(null),this.renderer.render(this.quadScene,this.quadCam)}}const lx=128,hx=160,zo=new Map;let fi=null;function pu(n,t,e={}){const i=new kh({antialias:!0,alpha:!0,...e});i.setPixelRatio(2),i.setSize(n,t,!1);const s=new ec;s.add(new Zh(9417983,2435648,.55));const r=new Ur(16773856,2);r.position.set(-3,6,8),s.add(r);const o=new Ur(7649023,.7);o.position.set(3,3,-6),s.add(o);const a=new ke(30,n/t,.1,20);a.position.set(0,1.05,4.3),a.lookAt(0,1,0);const c=new Rt;return s.add(c),{renderer:i,scene:s,camera:a,stage:c}}function ux(n,t=0){var r;const e=`${n}:${t}`;if(zo.has(e))return zo.get(e);fi??(fi=pu(lx,hx,{preserveDrawingBuffer:!0}));const i=new Or(fi.stage,n);i.setBadge(t),i.group.rotation.y=.55,i.legL.rotation.x=.7,i.legR.rotation.x=-.7,i.armL.rotation.x=-.55,i.armR.rotation.x=.55,(r=i.aura)==null||r.update(.3),fi.renderer.render(fi.scene,fi.camera),fi.stage.remove(i.group);const s=fi.renderer.domElement.toDataURL();return zo.set(e,s),s}const fx=220,dx=240,hc=.35;let In=null;const Ql=new Map;let ti=null,As=hc,rn=null,th=0;function px(){if(In)return In;In=pu(fx,dx);const n=In.renderer.domElement;n.className="turn",n.style.touchAction="pan-y",n.addEventListener("pointerdown",e=>{rn={x:e.clientX,t:performance.now(),v:0},n.setPointerCapture(e.pointerId)}),n.addEventListener("pointermove",e=>{if(!rn||!ti)return;const i=performance.now(),s=e.clientX-rn.x,r=Math.max(1,i-rn.t)/1e3;ti.group.rotation.y+=s*.012,rn.v=s*.012/r,rn.x=e.clientX,rn.t=i});const t=()=>{rn&&(As=Math.max(-8,Math.min(8,rn.v)),rn=null)};return n.addEventListener("pointerup",t),n.addEventListener("pointercancel",t),requestAnimationFrame(mu),In}function mu(n){requestAnimationFrame(mu);const t=Math.min(.05,(n-th)/1e3||0);th=n;const e=In.renderer.domElement;!ti||!e.isConnected||e.offsetParent===null||(rn||(As+=(hc-As)*(1-Math.exp(-2.5*t)),ti.group.rotation.y+=As*t),ti.update(t,4,!0),In.renderer.render(In.scene,In.camera))}function mx(n,t=0){const e=px();ti&&e.stage.remove(ti.group);let i=Ql.get(n);return i?e.stage.add(i.group):(i=new Or(e.stage,n),Ql.set(n,i)),i.reset(),i.setBadge(t),i.group.rotation.y=.55,ti=i,As=hc,e.renderer.domElement}const gu="gamedev8",{skinCost:gx,perks:_x}=Kr.shop,uc=[..._x,...Object.entries(Ia).map(([n,t])=>({id:`skin:${n}`,name:t.name??n.toUpperCase(),desc:t.desc??"Cosmetic",cost:n===is?0:t.cost??gx,tier:t.tier,tint:t.body,glow:t.glow}))],eh=()=>({saveVersion:1,gold:0,owned:[`skin:${is}`],skin:is,best:0,ran:{}});function vx(){try{return{...eh(),...JSON.parse(localStorage.getItem(gu))}}catch{return eh()}}const te=vx();function Os(){try{localStorage.setItem(gu,JSON.stringify(te))}catch{}}function Ds(n){return te.owned.includes(n)}const ss=n=>q_(te.ran[n]??0);function xx(n){const t=uc.find(e=>e.id===n);return!t||Ds(n)||te.gold<t.cost?!1:(te.gold-=t.cost,te.owned.push(n),n.startsWith("skin:")&&(te.skin=n.slice(5)),Os(),!0)}function _u(n){return te.gold<n?!1:(te.gold-=n,Os(),!0)}function nh(n){te.gold+=n,Os()}const fc=n=>n.id.startsWith("skin:");function Fa(n,t,e=!1){const i=fc(n),s=Ds(n.id),r=i&&te.skin===n.id.slice(5),o=document.createElement(e?"div":"button");o.className=`shop-item${i?" skin-tile":""}${e?" hero":""}${s?" owned":""}${r?" equipped":""}${n.tier?` ${n.tier}`:""}`,i&&(o.style.cssText=`--tint:${n.tint};--glow:${n.glow}`),e||(o.disabled=r||s&&!i||!s&&te.gold<n.cost);const a=i&&!e?`<img class="pv" src="${ux(n.id.slice(5),ss(n.id.slice(5)))}" alt="">`:"";return o.innerHTML=a+`<span class="n">${Se(n.name)}</span><span class="d">${Se(n.desc)}</span><span class="c">${s?Se(i?r?"WORN":"WEAR":"OWNED"):`◉ ${$n(n.cost)}`}</span>`,e&&o.prepend(mx(n.id.slice(5),ss(n.id.slice(5)))),o.onclick=()=>{if(s)te.skin=n.id.slice(5),Os();else if(!xx(n.id))return;t()},o}function Mx(n,t){n.innerHTML="";for(const e of uc)fc(e)||n.appendChild(Fa(e,t))}function Sx(n,t){for(const e of Object.values(n))e.innerHTML="";for(const e of uc){if(!fc(e))continue;const i=e.id.slice(5);te.skin===i?n.worn.appendChild(Fa(e,t,!0)):n[Ds(e.id)?"owned":"locked"].appendChild(Fa(e,t))}return{owned:n.owned.childElementCount,locked:n.locked.childElementCount}}mv();const yx=document.getElementById("app"),si=new kh({antialias:!0});si.setPixelRatio(Math.min(window.devicePixelRatio,2));si.setSize(window.innerWidth,window.innerHeight);si.shadowMap.enabled=!0;si.shadowMap.type=ah;yx.appendChild(si.domElement);const gn=new cx(si);gn.setSize(window.innerWidth,window.innerHeight);const Bn=new ec;Bn.background=new Nt(725024);Bn.fog=new tc(725024,30,110);const Ke=new ke(60,window.innerWidth/window.innerHeight,.1,300);Ke.position.set(0,5.5,9);Ke.lookAt(0,1.2,-12);Bn.add(new Zh(9417983,2435648,.55));const Ve=new Ur(16773856,2);Ve.position.set(-7,13,12);Ve.target.position.set(0,1,-6);Bn.add(Ve.target);Ve.castShadow=!0;Ve.shadow.mapSize.set(2048,2048);Ve.shadow.camera.near=1;Ve.shadow.camera.far=60;Ve.shadow.camera.left=-14;Ve.shadow.camera.right=14;Ve.shadow.camera.top=14;Ve.shadow.camera.bottom=-14;Ve.shadow.bias=-4e-4;Ve.shadow.normalBias=.02;Bn.add(Ve);const vu=new Ur(7649023,.7);vu.position.set(6,5,-18);Bn.add(vu);const le=new iv(Bn),xn=new ix(Bn);le.setSkin(te.skin,ss(te.skin));xn.groundTex.anisotropy=si.capabilities.getMaxAnisotropy();const me={MENU:0,PLAYING:1,OVER:2,DYING:3,PAUSED:4},Ex=.08,ih=1.1;let Ss=0,Xi=0,ve=me.MENU,Jn=Nr,ln=0,dc=0,pc=0,za=0;const wx=document.getElementById("score"),bx=document.getElementById("speedVal"),Tx=document.getElementById("speedFill"),Ar=document.getElementById("coins"),Nn=document.getElementById("overlay"),sh=Nn.querySelector(".final"),xu=Nn.querySelector(".pin"),Bo=document.getElementById("flash"),Mu=document.getElementById("startBtn"),yi=document.getElementById("shieldBtn"),Ba=document.getElementById("reviveBtn"),Ax=document.querySelectorAll(".wallet"),Rx=document.getElementById("shop"),mc=document.getElementById("skinOverlay"),Cx={owned:document.getElementById("skinsOwned"),worn:document.getElementById("skinsWorn"),locked:document.getElementById("skinsLocked")},Px=document.getElementById("ownedN"),Lx=document.getElementById("lockedN"),Ix=document.getElementById("skinsBtn"),Dx=document.getElementById("skinsBack");function Su(){le.reset(),le.setSkin(te.skin,ss(te.skin)),xn.reset(),xn.magnet=Ds("magnet"),Ds("startShield")&&le.setShield(!0),Jn=Nr,ln=0,dc=0,pc=0,za=0,xu.textContent="",kr=-1,Zi.classList.remove("show"),Fs(),Nn.hidden=!0,mc.hidden=!0,yi.hidden=!1,yu(),ve=me.PLAYING}function yu(){document.body.classList.remove("over"),Ke.fov=60,Ke.updateProjectionMatrix()}function Ux(){ve=me.DYING,Ss=0,Xi=.5;const n=le.mesh.position;xn.burst.fire(n.x,n.y+.9,n.z,fu[kr]),le.die(),gn.hit=1,yi.hidden=!0,document.body.classList.add("over"),Bo.classList.remove("hit"),Bo.offsetWidth,Bo.classList.add("hit")}const ka=()=>H_*2**pc;function Nx(){ve=me.OVER,ln>te.best&&(te.best=Math.floor(ln));const n=ss(te.skin);te.ran[te.skin]=(te.ran[te.skin]??0)+Math.floor(ln)-za,za=Math.floor(ln),Os();const t=ss(te.skin);t>n&&(xu.textContent=`★ ${Se("{0} pin earned",Se(Y_[t-1]))}`),yi.hidden=!0,sh.innerHTML=`<b>${Fr(0)}</b><span>${Se("best {0}",Fr(te.best))}</span><span>+${$n(dc)} ◉</span>`,Ox(sh.querySelector("b"),Math.floor(ln)),Nn.querySelector("h1").textContent=Se("GAME OVER"),Nn.querySelector("p").textContent=Se("Bank it or spend it."),Mu.textContent=Se("RETRY"),Br(),Nn.hidden=!1,window.parent!==window&&window.parent.postMessage({type:"GAME_OVER",score:Math.floor(ln)},"*")}function Ox(n,t){const e=performance.now();(function i(s){const r=Math.min(1,(s-e)/700);n.textContent=Fr(Math.round(t*(1-(1-r)**3))),r<1&&requestAnimationFrame(i)})(e)}function Br(){for(const t of Ax)t.textContent=`◉ ${$n(te.gold)}`;Mx(Rx,Br);const n=Sx(Cx,Br);Px.textContent=$n(n.owned),Lx.textContent=$n(n.locked),Ba.textContent=`${Se("CONTINUE")}  ◉ ${$n(ka())}`,Ba.hidden=ve!==me.OVER||te.gold<ka()}function Fx(){ve!==me.OVER||!_u(ka())||(pc++,xn.clearNear(V_),le.reset(),le.setShield(!0),Nn.hidden=!0,yi.hidden=!1,yu(),ve=me.PLAYING,Fs())}function Eu(){ve!==me.PLAYING||le.shield||!_u(Pa)||(le.setShield(!0),Fs())}const Zi=document.getElementById("zone"),zx=Zi.querySelector(".eyebrow"),Bx=Zi.querySelector(".name"),kx=document.getElementById("zoneTag");let kr=-1;function Gx(n){document.documentElement.style.setProperty("--zone-accent",fu[n]),kx.textContent=Se(Wl[n]),zx.textContent=Se("ZONE {0}",String(Math.floor(ln/eu)+1).padStart(2,"0")),Bx.textContent=Se(Wl[n]),Zi.classList.remove("show"),Zi.offsetWidth,Zi.classList.add("show")}function Hx(){Ar.classList.remove("robbed"),Ar.offsetWidth,Ar.classList.add("robbed")}function Fs(){wx.textContent=Fr(Math.floor(ln)),Ar.textContent=`◉ ${$n(te.gold)}`,yi.textContent=le.shield?`🛡 ${Se("ACTIVE")}`:`🛡 ${$n(Pa)}`,yi.disabled=le.shield||te.gold<Pa,bx.textContent=dv(Math.round(Jn*nu*60)),Tx.style.width=`${tu(Jn)*100}%`}rx({onLeft:()=>{ve===me.PLAYING&&le.moveLeft()},onRight:()=>{ve===me.PLAYING&&le.moveRight()},onJump:()=>{ve===me.PLAYING&&le.jump()},onJumpRelease:()=>{ve===me.PLAYING&&le.releaseJump()},onTap:n=>{ve===me.PLAYING&&le.tap(n)},onShield:Eu,onRestart:()=>{(ve===me.MENU||ve===me.OVER)&&Su()}});Mu.addEventListener("click",Su);yi.addEventListener("click",Eu);Ba.addEventListener("click",Fx);Ix.addEventListener("click",()=>{Nn.hidden=!0,mc.hidden=!1});Dx.addEventListener("click",()=>{mc.hidden=!0,Nn.hidden=!1});Br();Fs();const Ga=document.getElementById("lang");Ga.value=Ns;Ga.addEventListener("change",()=>{fv(Ga.value),location.reload()});const gc=new R_,wu=document.getElementById("paused");function bu(){ve===me.PLAYING&&(ve=me.PAUSED,wu.hidden=!1,le.releaseJump())}function Vx(){ve===me.PAUSED&&(ve=me.PLAYING,wu.hidden=!0,gc.getDelta())}addEventListener("blur",bu);document.addEventListener("visibilitychange",()=>{document.hidden?bu():gc.getDelta()});for(const n of["keydown","click","touchend"])addEventListener(n,Vx);function rh(n){Ke.position.y=5.5+(Math.random()-.5)*Xi,Ke.position.x+=(Math.random()-.5)*Xi,Xi=Math.max(0,Xi-n*1.6)}function Wx(n){Jn=Math.min(Qh,Jn+I_*n),ln+=Jn*n*nu,le.update(n,Jn);const{hit:t,coinsCollected:e,zone:i,stolen:s}=xn.update(n,Jn,le,ln);if(e&&(dc+=e,nh(e)),s&&!le.shield){const r=Math.min(s,te.gold);r&&(nh(-r),Hx())}if(i!==kr&&(kr=i,Gx(i)),t)if(le.shield){le.setShield(!1),xn.clearNear(W_);const r=le.mesh.position;xn.burst.fire(r.x,r.y+.9,r.z,8382719),Xi=.25,gn.hit=.5}else Ux()}function Tu(){requestAnimationFrame(Tu);const n=Math.min(gc.getDelta(),.05);if(ve===me.PLAYING){xn.burst.update(n);const t=Math.ceil(n/L_);for(let e=0;e<t&&ve===me.PLAYING;e++)Wx(n/t);Fs(),Ke.position.x+=(le.mesh.position.x*.35-Ke.position.x)*(1-Math.exp(-5*n)),rh(n)}else if(ve===me.DYING){Ss+=n;const t=Math.min(1,Ss/ih),e=Ss<Ex?0:n*.5;le.update(e,0),xn.burst.update(e),Ke.fov=60-6*t,Ke.updateProjectionMatrix(),rh(n),gn.dead=t,Ss>=ih&&Nx()}gn.hit=Math.max(0,gn.hit-n*1.8),ve===me.PLAYING&&(gn.dead=Math.max(0,gn.dead-n*3)),gn.render(Bn,Ke)}Tu();window.addEventListener("resize",()=>{Ke.aspect=window.innerWidth/window.innerHeight,Ke.updateProjectionMatrix(),si.setSize(window.innerWidth,window.innerHeight),gn.setSize(window.innerWidth,window.innerHeight)});

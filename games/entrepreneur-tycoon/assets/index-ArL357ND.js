(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:`lemonade`,name:`Lemonade Stand`,icon:`lemon`,color:`#f4c430`,baseCost:4,baseRevenue:2,baseTime:1,costMultiplier:1.07,managerCost:1e3,unlockCost:0,employeeMax:5,category:`Food`},{id:`shoeshine`,name:`Shoeshine Stand`,icon:`shoe`,color:`#5a3a1f`,baseCost:10,baseRevenue:5,baseTime:2,costMultiplier:1.08,managerCost:1900,unlockCost:10,employeeMax:5,category:`Lifestyle`},{id:`garden`,name:`Garden Allotment`,icon:`carrot`,color:`#e67e22`,baseCost:150,baseRevenue:75,baseTime:3,costMultiplier:1.13,managerCost:13e3,unlockCost:150,employeeMax:7,category:`Agriculture`},{id:`barbershop`,name:`Barbershop`,icon:`scissors`,color:`#c0392b`,baseCost:200,baseRevenue:100,baseTime:4,costMultiplier:1.14,managerCost:15e3,unlockCost:200,employeeMax:10,category:`Lifestyle`},{id:`firstaid`,name:`First Aid Kiosk`,icon:`bandage`,color:`#e74c3c`,baseCost:2500,baseRevenue:1250,baseTime:5,costMultiplier:1.14,managerCost:91e3,unlockCost:2500,employeeMax:9,category:`Health`},{id:`tailor`,name:`Tailor Shop`,icon:`thread`,color:`#9b59b6`,baseCost:3e3,baseRevenue:1500,baseTime:6,costMultiplier:1.14,managerCost:1e5,unlockCost:3e3,employeeMax:10,category:`Lifestyle`},{id:`pizza`,name:`Pizza Delivery`,icon:`pizza`,color:`#e74c3c`,baseCost:8640,baseRevenue:4320,baseTime:8,costMultiplier:1.13,managerCost:22e4,unlockCost:8640,employeeMax:18,category:`Food`},{id:`checkcash`,name:`Check Cashing`,icon:`cash`,color:`#27ae60`,baseCost:7e4,baseRevenue:35e3,baseTime:10,costMultiplier:1.125,managerCost:93e4,unlockCost:7e4,employeeMax:15,category:`Finance`},{id:`arcade`,name:`Arcade`,icon:`joystick`,color:`#8e44ad`,baseCost:9e4,baseRevenue:45e3,baseTime:14,costMultiplier:1.125,managerCost:11e5,unlockCost:9e4,employeeMax:16,category:`Entertainment`},{id:`taxi`,name:`Taxi Service`,icon:`taxi`,color:`#f39c12`,baseCost:18e4,baseRevenue:9e4,baseTime:18,costMultiplier:1.12,managerCost:18e5,unlockCost:18e4,employeeMax:17,category:`Travel`},{id:`appstudio`,name:`App Studio`,icon:`phone`,color:`#3498db`,baseCost:3e5,baseRevenue:15e4,baseTime:22,costMultiplier:1.118,managerCost:26e5,unlockCost:3e5,employeeMax:18,category:`Tech`},{id:`farm`,name:`Organic Farm`,icon:`wheat`,color:`#a4c639`,baseCost:35e4,baseRevenue:175e3,baseTime:28,costMultiplier:1.115,managerCost:29e5,unlockCost:35e4,employeeMax:25,category:`Agriculture`},{id:`dental`,name:`Dental Clinic`,icon:`tooth`,color:`#d6eaf8`,baseCost:85e4,baseRevenue:425e3,baseTime:36,costMultiplier:1.115,managerCost:54e5,unlockCost:85e4,employeeMax:21,category:`Health`},{id:`shrimp`,name:`Shrimp Boat`,icon:`shrimp`,color:`#ff7f50`,baseCost:1244160,baseRevenue:622080,baseTime:46,costMultiplier:1.11,managerCost:7e6,unlockCost:1244160,employeeMax:30,category:`Food`},{id:`houseflip`,name:`House Flipper`,icon:`hammer`,color:`#a04020`,baseCost:15e5,baseRevenue:75e4,baseTime:60,costMultiplier:1.112,managerCost:8e6,unlockCost:15e5,employeeMax:22,category:`Real Estate`},{id:`gasstation`,name:`Gas Station`,icon:`fuel`,color:`#c0392b`,baseCost:18e5,baseRevenue:9e5,baseTime:80,costMultiplier:1.113,managerCost:91e5,unlockCost:18e5,employeeMax:23,category:`Energy`},{id:`nightclub`,name:`Nightclub`,icon:`disco`,color:`#7d3c98`,baseCost:6e6,baseRevenue:3e6,baseTime:110,costMultiplier:1.11,managerCost:24e6,unlockCost:6e6,employeeMax:27,category:`Entertainment`},{id:`cattle`,name:`Cattle Ranch`,icon:`cow`,color:`#7d6f43`,baseCost:8e6,baseRevenue:4e6,baseTime:140,costMultiplier:1.108,managerCost:32e6,unlockCost:8e6,employeeMax:28,category:`Agriculture`},{id:`urgent`,name:`Urgent Care`,icon:`ambulance`,color:`#cd5c5c`,baseCost:13e6,baseRevenue:65e5,baseTime:180,costMultiplier:1.107,managerCost:52e6,unlockCost:13e6,employeeMax:32,category:`Health`},{id:`realestate`,name:`Real Estate Agency`,icon:`house`,color:`#5d8a66`,baseCost:5e7,baseRevenue:25e6,baseTime:240,costMultiplier:1.095,managerCost:2e8,unlockCost:5e7,employeeMax:50,category:`Real Estate`},{id:`movie`,name:`Movie Studio`,icon:`movie`,color:`#9b59b6`,baseCost:179159040,baseRevenue:89579520,baseTime:320,costMultiplier:1.09,managerCost:72e7,unlockCost:179159040,employeeMax:60,category:`Entertainment`},{id:`hedgefund`,name:`Hedge Fund`,icon:`chart`,color:`#117a65`,baseCost:35e7,baseRevenue:175e6,baseTime:440,costMultiplier:1.09,managerCost:14e8,unlockCost:35e7,employeeMax:58,category:`Finance`},{id:`tech`,name:`Tech Startup`,icon:`laptop`,color:`#1abc9c`,baseCost:6e8,baseRevenue:3e8,baseTime:600,costMultiplier:1.085,managerCost:24e8,unlockCost:6e8,employeeMax:70,category:`Tech`},{id:`cruise`,name:`Cruise Line`,icon:`ship`,color:`#1f618d`,baseCost:8e8,baseRevenue:4e8,baseTime:800,costMultiplier:1.082,managerCost:32e8,unlockCost:8e8,employeeMax:75,category:`Travel`},{id:`reit`,name:`REIT`,icon:`buildings`,color:`#196f3d`,baseCost:25e8,baseRevenue:125e7,baseTime:1080,costMultiplier:1.078,managerCost:1e10,unlockCost:25e8,employeeMax:85,category:`Real Estate`},{id:`oil`,name:`Oil Company`,icon:`oilBarrel`,color:`#34495e`,baseCost:25798901760,baseRevenue:12899450880,baseTime:1450,costMultiplier:1.07,managerCost:1e11,unlockCost:25798901760,employeeMax:120,category:`Energy`},{id:`insurance`,name:`Insurance Giant`,icon:`shield`,color:`#2874a6`,baseCost:3e10,baseRevenue:15e9,baseTime:1950,costMultiplier:1.07,managerCost:12e10,unlockCost:3e10,employeeMax:130,category:`Finance`},{id:`chipfab`,name:`Chip Fab`,icon:`chip`,color:`#566573`,baseCost:55e9,baseRevenue:275e8,baseTime:2600,costMultiplier:1.068,managerCost:22e10,unlockCost:55e9,employeeMax:140,category:`Tech`},{id:`spacetourism`,name:`Space Tourism`,icon:`ufo`,color:`#a569bd`,baseCost:7e10,baseRevenue:35e9,baseTime:3400,costMultiplier:1.067,managerCost:28e10,unlockCost:7e10,employeeMax:145,category:`Travel`},{id:`fusion`,name:`Fusion Reactor`,icon:`atom`,color:`#1abc9c`,baseCost:6e11,baseRevenue:3e11,baseTime:4500,costMultiplier:1.06,managerCost:24e11,unlockCost:6e11,employeeMax:200,category:`Energy`}],t=[{id:`global_a`,name:`Coffee for Workers`,industryId:`global`,category:`Company`,kind:`revenue`,cost:1e9,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_b`,name:`Motivational Posters`,industryId:`global`,category:`Company`,kind:`revenue`,cost:1e11,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_c`,name:`Corporate Yoga`,industryId:`global`,category:`Company`,kind:`revenue`,cost:0x9184e72a000,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_d`,name:`Coworking Spaces`,industryId:`global`,category:`Company`,kind:`revenue`,cost:5e6,multiplier:1.5,desc:`All industries ×1.5 revenue`},{id:`global_e`,name:`Productivity Suite`,industryId:`global`,category:`Company`,kind:`revenue`,cost:5e10,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_f`,name:`Industry 4.0`,industryId:`global`,category:`Company`,kind:`revenue`,cost:0xe8d4a51000,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_g`,name:`AI Copilot Fleet`,industryId:`global`,category:`Company`,kind:`revenue`,cost:5e14,multiplier:3,desc:`All industries ×3 revenue`},{id:`global_h`,name:`Megacorp Synergy`,industryId:`global`,category:`Company`,kind:`revenue`,cost:0x16345785d8a0000,multiplier:5,desc:`All industries ×5 revenue`},{id:`ind_lemonade`,name:`Secret Lemonade Recipe`,industryId:`lemonade`,kind:`revenue`,cost:1e6,multiplier:3,requires:100,desc:`Lemonade Stand ×3 revenue (req 100)`},{id:`ind_arcade`,name:`Arcade Tournament Circuit`,industryId:`arcade`,kind:`revenue`,cost:2e8,multiplier:3,requires:75,desc:`Arcade ×3 revenue (req 75)`},{id:`ind_fusion`,name:`Plasma Containment Breakthrough`,industryId:`fusion`,kind:`revenue`,cost:5e12,multiplier:3,requires:25,desc:`Fusion Reactor ×3 revenue (req 25)`},{id:`cust_doorman`,name:`Doorman`,industryId:`customer`,category:`Customers`,kind:`spawn_rate`,cost:25e4,value:1.35,desc:`+35% customer foot traffic`},{id:`cust_express`,name:`Express Lane`,industryId:`customer`,category:`Customers`,kind:`walk_speed`,cost:5e5,value:1.6,desc:`Customers walk 60% faster`},{id:`cust_coffee_bar`,name:`Coffee Bar`,industryId:`customer`,category:`Customers`,kind:`shop_dwell`,cost:15e5,value:.5,desc:`Customers shop in half the time`},{id:`cust_loyalty`,name:`Loyalty Cards`,industryId:`customer`,category:`Reputation`,kind:`rep_gain_mult`,cost:8e6,value:2,desc:`×2 reputation gained per sale`},{id:`cust_apology`,name:`Apology Coupons`,industryId:`customer`,category:`Reputation`,kind:`rep_loss_mult`,cost:25e6,value:.5,desc:`Half rep loss + half $ penalty on empty store`},{id:`cust_window_display`,name:`Window Display`,industryId:`customer`,category:`Customers`,kind:`wealthy_rate`,cost:6e7,value:.15,desc:`+15% wealthy customer chance`},{id:`cust_premium_receipts`,name:`Premium Receipts`,industryId:`customer`,category:`Tips`,kind:`tip_mult`,cost:2e8,value:1.5,desc:`All tips ×1.5`},{id:`cust_velvet_rope`,name:`Velvet Rope`,industryId:`customer`,category:`Customers`,kind:`whale_rate`,cost:15e8,value:.06,desc:`+6% whale customer chance`},{id:`cust_smart_inventory`,name:`Smart Inventory`,industryId:`customer`,category:`Reputation`,kind:`partial_forgive`,cost:5e9,value:1,desc:`Partial orders no longer ding reputation`},{id:`cust_charity_drive`,name:`Charity Drive`,industryId:`customer`,category:`Reputation`,kind:`rep_regen`,cost:2e10,value:1,desc:`+1 reputation per second, passive`},{id:`cust_concierge`,name:`Concierge Service`,industryId:`customer`,category:`Tips`,kind:`whale_tip`,cost:1e11,value:2.5,desc:`Whale tips ×2.5`},{id:`cust_vip_lounge`,name:`VIP Lounge`,industryId:`customer`,category:`Customers`,kind:`whale_rate`,cost:2e12,value:.1,desc:`+10% whale chance`},{id:`shady_sweatshop`,name:`Sweatshop Hours`,industryId:`global`,category:`Shady`,kind:`revenue`,cost:5e9,multiplier:3,repDrain:.5,desc:`All industries ×3 revenue · -0.5 rep/s (worker exposé)`},{id:`shady_gouging`,name:`Price Gouging`,industryId:`customer`,category:`Shady`,kind:`tip_mult`,cost:12e9,value:3,repDrain:.8,desc:`All tips ×3 · -0.8 rep/s (customer outrage)`},{id:`shady_astroturf`,name:`Astroturf Reviews`,industryId:`customer`,category:`Shady`,kind:`spawn_rate`,cost:8e8,value:1.8,repDrain:.4,desc:`+80% foot traffic · -0.4 rep/s (fake review backlash)`},{id:`shady_fineprint`,name:`Fine-Print Contracts`,industryId:`customer`,category:`Shady`,kind:`wealthy_rate`,cost:4e10,value:.25,repDrain:.6,desc:`+25% wealthy chance · -0.6 rep/s (consumer complaints)`},{id:`shady_tabloid`,name:`Tabloid Smears`,industryId:`customer`,category:`Shady`,kind:`whale_rate`,cost:5e11,value:.12,repDrain:1.2,desc:`+12% whale chance · -1.2 rep/s (rival press leaks)`},{id:`shady_pollute`,name:`Skip Inspections`,industryId:`global`,category:`Shady`,kind:`revenue`,cost:2e11,multiplier:2.5,repDrain:1,desc:`All industries ×2.5 revenue · -1.0 rep/s (environmental fines)`},{id:`shady_layoffs`,name:`Mass Layoffs PR Spin`,industryId:`customer`,category:`Shady`,kind:`shop_dwell`,cost:3e10,value:.35,repDrain:.7,desc:`Customers shop 65% faster · -0.7 rep/s (union picket lines)`}],n=e,r=t,i=new Map(n.map(e=>[e.id,e])),a=new Map(r.map(e=>[e.id,e])),o=(()=>{let e=new Map;for(let t of n)e.set(t.id,[]);for(let t of r)if((t.kind??`revenue`)===`revenue`)if(t.industryId===`global`)for(let r of n)e.get(r.id).push(t);else{let n=e.get(t.industryId);n&&n.push(t)}return e})();function s(){return{spawnRate:1,walkSpeed:1,shopDwell:1,wealthyBonus:0,whaleBonus:0,tipMult:1,whaleTip:1,repGainMult:1,repLossMult:1,partialForgive:!1,repRegen:0,repDrain:0}}var c=null;function l(){c=null,ee.clear(),oe.clear()}function u(e){return c??=d(e)}function d(e){let t=s();for(let n of r){if(!e.upgrades[n.id])continue;n.repDrain&&(t.repDrain+=n.repDrain);let r=n.kind,i=n.value??0;switch(r){case`spawn_rate`:t.spawnRate*=i||1;break;case`walk_speed`:t.walkSpeed*=i||1;break;case`shop_dwell`:t.shopDwell*=i||1;break;case`wealthy_rate`:t.wealthyBonus+=i;break;case`whale_rate`:t.whaleBonus+=i;break;case`tip_mult`:t.tipMult*=i||1;break;case`whale_tip`:t.whaleTip*=i||1;break;case`rep_gain_mult`:t.repGainMult*=i||1;break;case`rep_loss_mult`:t.repLossMult*=i||1;break;case`partial_forgive`:i&&(t.partialForgive=!0);break;case`rep_regen`:t.repRegen+=i;break}}return t}function f(){let e={};for(let t of n)e[t.id]={count:0,unlocked:t.unlockCost===0,hasManager:!1,employees:0,hiringUntil:null,managerHiringUntil:null,progress:0,producing:!1,closed:!1,paused:!1,managerProductsServed:0,employeeProductsServed:0};let t=n[0];return t&&(e[t.id].count=1),{money:0,totalEarned:0,totalProduced:0,industries:e,upgrades:{},delivered:{},reputation:500,shopStats:{},lastTick:Date.now(),startedAt:Date.now()}}function p(){return{extraEarned:0,extraLost:0,repGained:0,repLost:0,sales:0,misses:0,unitsSold:0,feesPaid:0}}var m=[{units:50,mult:1.25,label:`Regulars`},{units:250,mult:1.5,label:`Word-of-mouth`},{units:1e3,mult:2,label:`Local favorite`},{units:5e3,mult:3,label:`Neighborhood icon`},{units:25e3,mult:5,label:`City landmark`},{units:1e5,mult:8,label:`Regional chain`},{units:5e5,mult:15,label:`National brand`},{units:2e6,mult:25,label:`Global empire`}];function h(e){let t=1;for(let n of m)if(e>=n.units)t=n.mult;else break;return t}var g=1e3,_=.05,v=.1,y=.05,b=.1;function x(e){let t=e*v,n=e*y,r=e*b;return{delivery:t,transaction:n,platform:r,total:t+n+r}}function S(e){return Math.max(1,Math.min(g,e))}function C(e){return .5+(S(e)-1)/999}function w(e){return 2-C(e)}var ee=new Map;function te(e,t){let n=ee.get(e.id);if(n!==void 0)return n;let r=1,i=o.get(e.id);if(i)for(let e of i)t.upgrades[e.id]&&(r*=e.multiplier??1);return ee.set(e.id,r),r}var T=[25,50,100,200,300,400,500,750,1e3,1500,2e3,3e3,4e3,5e3,7500,1e4];function ne(e){let t=1;for(let n of T)if(e>=n)t*=2;else break;return t}function re(e){for(let t of T)if(e<t)return{next:t,mult:ne(t)};return{next:null,mult:ne(e)}}var ie=.02,ae=.05,oe=new Map;function se(e,t){let r=oe.get(e.id);if(r!==void 0)return r;let i=0;for(let r of n){if(r.id===e.id)continue;let n=t.industries[r.id];!n||!n.unlocked||(i+=ie,n.count>=100&&(i+=ae))}let a=1+i;return oe.set(e.id,a),a}function ce(e,t){let n=e.shopStats[t];return h(n?.unitsSold??0)}function le(e,t){let n=t.industries[e.id];return e.baseRevenue*te(e,t)*(n?ne(n.count):1)*ce(t,e.id)*se(e,t)*(n?ke(n.employees):1)}function ue(e,t){return le(e,t)*C(t.reputation)}function de(e){let t=f();for(let r of n)e.industries[r.id]||(e.industries[r.id]=t.industries[r.id]);e.upgrades||={},e.delivered||={},typeof e.totalEarned!=`number`&&(e.totalEarned=e.money),typeof e.totalProduced!=`number`&&(e.totalProduced=0),typeof e.startedAt!=`number`&&(e.startedAt=Date.now()),typeof e.reputation!=`number`&&(e.reputation=500),e.reputation=S(e.reputation),e.shopStats||={};for(let t of Object.keys(e.shopStats)){let n=e.shopStats[t];typeof n.unitsSold!=`number`&&(n.unitsSold=0),typeof n.feesPaid!=`number`&&(n.feesPaid=0)}for(let t of n){let n=e.industries[t.id];typeof n.employees!=`number`&&(n.employees=0),n.hiringUntil===void 0&&(n.hiringUntil=null),n.managerHiringUntil===void 0&&(n.managerHiringUntil=null),typeof n.closed!=`boolean`&&(n.closed=!1),typeof n.paused!=`boolean`&&(n.paused=!1),typeof n.managerProductsServed!=`number`&&(n.managerProductsServed=0),typeof n.employeeProductsServed!=`number`&&(n.employeeProductsServed=0)}return e}var fe=.008,pe=.0015;function E(e){return e.managerCost*fe}function D(e,t){return e.managerCost*pe*t}function me(e,t){let n=t.industries[e.id];if(!n)return 0;let r=n.managerProductsServed*e.baseRevenue*4,i=E(e)*240;return Math.max(r,i)}function he(e,t){let n=t.industries[e.id];if(!n||n.employees<=0)return 0;let r=n.employeeProductsServed/n.employees*e.baseRevenue*4,i=D(e,1)*240;return Math.max(r,i)}function ge(e,t){let n=i.get(t);if(!n)return 0;let r=e.industries[n.id];if(!r||!r.hasManager)return 0;let a=me(n,e);return e.money=Math.max(0,e.money-a),r.hasManager=!1,r.managerProductsServed=0,a}function _e(e,t){let n=i.get(t);if(!n)return 0;let r=e.industries[n.id];if(!r||r.employees<=0)return 0;let a=he(n,e);e.money=Math.max(0,e.money-a);let o=Math.floor(r.employeeProductsServed/r.employees);return r.employeeProductsServed=Math.max(0,r.employeeProductsServed-o),--r.employees,r.employees===0&&(r.employeeProductsServed=0),a}function ve(e,t){let n=e.industries[t];return!n||!n.unlocked?!1:(n.closed=!n.closed,n.closed)}function ye(e,t){let n=e.industries[t];return!n||!n.unlocked?!1:(n.paused=!n.paused,n.paused&&(n.producing=!1),n.paused)}function be(e,t,n=1){if(e.costMultiplier===1)return e.baseCost*n;let r=e.costMultiplier;return e.baseCost*r**+t*(r**+n-1)/(r-1)}function xe(e,t,n){if(n<be(e,t,1))return 0;let r=e.costMultiplier,i=e.baseCost*r**+t;if(r===1)return Math.floor(n/e.baseCost);let a=n*(r-1)/i+1;return Math.floor(Math.log(a)/Math.log(r))}function Se(e,t){return ue(e,t)*t.industries[e.id].count}var Ce=.92,we=.15;function Te(e){return e.employeeMax??25}function Ee(e){return Math.max(we,Ce**+e)}var De=Math.ceil(Math.log(we)/Math.log(Ce)),Oe=.05;function ke(e){return 1+Oe*Math.max(0,e-De)}function Ae(e,t){return Math.ceil(e.managerCost*.3*1.45**t)}function je(e){return Math.min(90,12+e*4)}function Me(e,t){let n=i.get(t);if(!n)return!1;let r=e.industries[n.id];if(!r.unlocked||r.employees>=Te(n)||r.hiringUntil!==null)return!1;let a=Ae(n,r.employees);if(e.money<a)return!1;e.money-=a;let o=je(r.employees)*1e3;return r.hiringUntil=Date.now()+o,!0}function Ne(e,t=Date.now()){let r=[];for(let i of n){let n=e.industries[i.id];n&&(n.managerHiringUntil!==null&&t>=n.managerHiringUntil&&(n.hasManager=!0,n.managerHiringUntil=null,r.push({id:i.id,role:`manager`})),n.hiringUntil!==null&&t>=n.hiringUntil&&(n.employees+=1,n.hiringUntil=null,r.push({id:i.id,role:`employee`})))}return r}function Pe(e,t){let n=t.industries[e.id];return e.baseTime*Ee(n?n.employees:0)}function Fe(e,t,n){let r=i.get(t);if(!r)return 0;let a=e.industries[r.id];if(!a.unlocked)return e.money<r.unlockCost?0:(e.money-=r.unlockCost,a.unlocked=!0,a.count=1,a.closed=!0,l(),1);let o=n===`max`?xe(r,a.count,e.money):n;if(o<=0)return 0;let s=be(r,a.count,o);if(e.money<s)return 0;let c=a.count;return e.money-=s,a.count+=o,c<100&&a.count>=100&&l(),o}function Ie(e,t){let n=i.get(t);if(!n)return!1;let r=e.industries[n.id];return r.hasManager||r.managerHiringUntil!==null||e.money<n.managerCost?!1:(e.money-=n.managerCost,r.managerHiringUntil=Date.now()+45*1e3,!0)}function Le(e,t){let n=a.get(t);if(!n||e.upgrades[n.id])return!1;if(n.industryId!==`global`&&n.industryId!==`customer`){let t=e.industries[n.industryId];if(!t||n.requires&&t.count<n.requires)return!1}return e.money<n.cost?!1:(e.money-=n.cost,e.upgrades[n.id]=!0,l(),!0)}function Re(e,t){let n=i.get(t);if(!n)return!1;let r=e.industries[n.id];return r.count<=0||r.paused||r.producing?!1:(r.producing=!0,r.progress=0,!0)}function ze(e,t){let r=0,i=0,a={},o=u(e),s=(o.repRegen-o.repDrain)*t;s!==0&&(e.reputation=S(e.reputation+s));for(let o of n){let n=e.industries[o.id];if(n.hasManager&&(i+=E(o)*t),n.employees>0&&(i+=D(o,n.employees)*t),n.count<=0||n.paused||!n.producing&&!n.hasManager)continue;let s=Pe(o,e),c=Se(o,e);!n.producing&&n.hasManager&&(n.producing=!0,n.progress=0);let l=t;for(;l>0&&n.producing;){let t=(1-n.progress)*s;if(l>=t)if(l-=t,r+=c,a[o.id]=(a[o.id]??0)+1,e.totalProduced+=n.count,n.hasManager&&(n.managerProductsServed+=1),n.employees>0&&(n.employeeProductsServed+=1),n.progress=0,n.hasManager)n.producing=!0;else{n.producing=!1;break}else n.progress+=l/s,l=0}}return e.money+=r,e.totalEarned+=r,e.money=Math.max(0,e.money-i),{earned:r,completions:a}}function Be(e,t){let n=Math.max(0,(t-e.lastTick)/1e3),r=Math.min(n,8*3600);Ne(e,t);let{earned:i}=ze(e,r);return e.lastTick=t,i}var Ve=`tycoon-empire-save-v1`;function He(e){try{localStorage.setItem(Ve,JSON.stringify(e))}catch(e){console.warn(`Save failed`,e)}}function Ue(){try{let e=localStorage.getItem(Ve);return e?JSON.parse(e):null}catch(e){return console.warn(`Load failed`,e),null}}var We=!1;function Ge(){return We}function Ke(){We=!0,localStorage.removeItem(Ve)}var qe=`.K.M.B.T.Qa.Qi.Sx.Sp.Oc.No.Dc.UDc.DDc.TDc.QaDc.QiDc.SxDc.SpDc.OcDc.NDc.Vg.UVg.DVg.TVg.QaVg.QiVg.SxVg.SpVg.OcVg.NVg`.split(`.`),Je=qe.map((e,t)=>1e3**t);function O(e){if(!isFinite(e))return`∞`;if(e<0)return`-`+O(-e);if(e<1e3)return`$`+e.toFixed(e<10?2:0);let t=Math.floor(Math.log10(e)/3),n=Math.min(t,qe.length-1),r=e/Je[n];return`$`+r.toFixed(r<10?3:r<100?2:1)+qe[n]}function k(e){if(e<1)return e.toFixed(2)+`s`;if(e<60)return e.toFixed(1)+`s`;if(e<3600)return Math.floor(e/60)+`m `+Math.floor(e%60)+`s`;let t=Math.floor(e/3600),n=Math.floor(e%3600/60);return t+`h `+n+`m`}function A(e){return e<1e3?Math.floor(e).toString():O(e).substring(1)}var Ye={Food:`#ff6b6b`,Lifestyle:`#ff9ff3`,Agriculture:`#6ab04c`,Health:`#4bcffa`,Entertainment:`#f368e0`,"Real Estate":`#c4a373`,Tech:`#5dade2`,Finance:`#f5cd79`,Travel:`#74b9ff`,Energy:`#feca57`,Misc:`#9aa4b2`,Company:`#a29bfe`,Customers:`#55efc4`,Tips:`#ffeaa7`,Reputation:`#fdcb6e`,Shady:`#ff7675`};function j(e){if(e)return Ye[e]}var M=`#1a1a1a`,Xe={briefcase:`
    <rect x="3" y="7" width="18" height="13" rx="2" fill="#8b5a2b" stroke="${M}" stroke-width="1"/>
    <rect x="3" y="11" width="18" height="2" fill="#5c3a1a"/>
    <rect x="10" y="11" width="4" height="3" fill="#ffd166" stroke="${M}" stroke-width="0.5"/>
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" fill="none" stroke="${M}" stroke-width="1.5"/>`,factory:`
    <path d="M2 21V11l6 3V11l6 3V8h7v13z" fill="#6b7280" stroke="${M}" stroke-width="1"/>
    <rect x="16" y="4" width="2" height="6" fill="#9aa4b2"/>
    <circle cx="14" cy="4" r="1.5" fill="#d1d5db" opacity=".8"/>
    <circle cx="11" cy="3" r="1" fill="#d1d5db" opacity=".7"/>
    <rect x="5" y="17" width="2" height="3" fill="#facc15"/>
    <rect x="11" y="17" width="2" height="3" fill="#facc15"/>
    <rect x="17" y="17" width="2" height="3" fill="#facc15"/>`,bolt:`
    <path d="M13 2 4 14h6l-1 8 10-13h-6l1-7z" fill="#facc15" stroke="${M}" stroke-width="1" stroke-linejoin="round"/>
    <path d="M13 2 4 14h6l-1 8" fill="none" stroke="#fef08a" stroke-width="0.6"/>`,coin:`
    <circle cx="12" cy="12" r="9" fill="#ffd166" stroke="${M}" stroke-width="1"/>
    <circle cx="12" cy="12" r="7" fill="none" stroke="#b88c1a" stroke-width="0.7"/>
    <text x="12" y="16.5" font-size="11" font-weight="800" text-anchor="middle" fill="#7a5c0a" font-family="Georgia,serif">$</text>`,manager:`
    <circle cx="12" cy="6" r="3.5" fill="#f4c89a" stroke="${M}" stroke-width="0.8"/>
    <path d="M5 21v-3a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v3z" fill="#1f2937" stroke="${M}" stroke-width="0.8"/>
    <path d="M10 13h4l-2 4z" fill="#fff"/>
    <path d="M11 14l1 4 1-4z" fill="#dc2626"/>`,worker:`
    <circle cx="12" cy="13" r="3" fill="#f4c89a" stroke="${M}" stroke-width="0.6"/>
    <path d="M5 12a7 7 0 0 1 14 0v1H5z" fill="#fbbf24" stroke="${M}" stroke-width="0.8"/>
    <rect x="11" y="6" width="2" height="3" fill="#dc2626"/>
    <path d="M3 13h18v1H3z" fill="#1a1a1a"/>
    <path d="M7 20l1-3h8l1 3z" fill="#2563eb" stroke="${M}" stroke-width="0.6"/>`,salary:`
    <rect x="2" y="6" width="20" height="12" rx="1.5" fill="#22c55e" stroke="${M}" stroke-width="0.8"/>
    <rect x="3" y="7" width="18" height="10" fill="none" stroke="#15803d" stroke-width="0.6"/>
    <circle cx="12" cy="12" r="3" fill="#dcfce7" stroke="#15803d" stroke-width="0.6"/>
    <text x="12" y="14.5" font-size="5" font-weight="800" text-anchor="middle" fill="#15803d">$</text>`,fire:`
    <path d="M12 2c1 3 4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3-1-5 0-8z" fill="#ef4444" stroke="${M}" stroke-width="0.8"/>
    <path d="M12 9c1 1 2 3 2 5a2 2 0 1 1-4 0c0-2 1-3 2-5z" fill="#fbbf24"/>`,warning:`
    <path d="M12 3 22 21H2z" fill="#facc15" stroke="${M}" stroke-width="1" stroke-linejoin="round"/>
    <rect x="11" y="10" width="2" height="6" fill="${M}"/>
    <circle cx="12" cy="18" r="1" fill="${M}"/>`,package:`
    <path d="m3 7 9-4 9 4-9 4z" fill="#d97706" stroke="${M}" stroke-width="0.8"/>
    <path d="M3 7v10l9 4V11z" fill="#b45309" stroke="${M}" stroke-width="0.8"/>
    <path d="M21 7v10l-9 4V11z" fill="#92400e" stroke="${M}" stroke-width="0.8"/>
    <path d="M3 7 12 11 21 7" fill="none" stroke="${M}" stroke-width="0.6"/>
    <rect x="11" y="3.5" width="2" height="18" fill="#fde68a" opacity=".7"/>`,lock:`
    <rect x="5" y="11" width="14" height="10" rx="1.5" fill="#facc15" stroke="${M}" stroke-width="0.8"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="#78350f" stroke-width="1.6"/>
    <circle cx="12" cy="16" r="1.5" fill="#78350f"/>`,unlock:`
    <rect x="5" y="11" width="14" height="10" rx="1.5" fill="#22c55e" stroke="${M}" stroke-width="0.8"/>
    <path d="M8 11V7a4 4 0 0 1 7.5-2" fill="none" stroke="#14532d" stroke-width="1.6"/>
    <circle cx="12" cy="16" r="1.5" fill="#14532d"/>`,star:`
    <path d="m12 2 3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z" fill="#facc15" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="m12 2 3 6.5 7 1-5 4.8" fill="#fde68a"/>`,starOff:`
    <path d="m12 2 3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z" fill="#6b7280" stroke="${M}" stroke-width="0.8" stroke-linejoin="round" opacity=".6"/>`,gem:`
    <path d="M6 3h12l3 6-9 12L3 9z" fill="#38bdf8" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M3 9h18" stroke="${M}" stroke-width="0.6"/>
    <path d="M9 3 6 9l6 12" fill="#0ea5e9" opacity=".6"/>
    <path d="M15 3l3 6-6 12" fill="#7dd3fc" opacity=".5"/>
    <path d="M6 3h12l-1.5 3h-9z" fill="#bae6fd"/>`,crown:`
    <path d="M2 7l4 4 4-6 4 6 4-4 1.5 12H3.5z" fill="#ffd166" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <circle cx="6" cy="11" r="1" fill="#dc2626"/>
    <circle cx="12" cy="9" r="1" fill="#22c55e"/>
    <circle cx="18" cy="11" r="1" fill="#3b82f6"/>
    <rect x="3.5" y="17" width="17" height="2" fill="#b88c1a"/>`,trophy:`
    <path d="M8 4h8v6a4 4 0 1 1-8 0z" fill="#ffd166" stroke="${M}" stroke-width="0.8"/>
    <path d="M8 6H4v2a3 3 0 0 0 3 3" fill="none" stroke="${M}" stroke-width="1"/>
    <path d="M16 6h4v2a3 3 0 0 1-3 3" fill="none" stroke="${M}" stroke-width="1"/>
    <rect x="10" y="17" width="4" height="3" fill="#b88c1a" stroke="${M}" stroke-width="0.6"/>
    <rect x="8" y="20" width="8" height="2" fill="#78350f" stroke="${M}" stroke-width="0.6"/>`,refresh:`
    <path d="M21 12a9 9 0 1 1-3-6.7" fill="none" stroke="#3b82f6" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M21 3v6h-6" fill="none" stroke="#3b82f6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,x:`<path d="M6 6l12 12M6 18 18 6" stroke="#ef4444" stroke-width="2.4" stroke-linecap="round"/>`,pause:`
    <rect x="6" y="5" width="4" height="14" rx="1" fill="#94a3b8" stroke="${M}" stroke-width="0.6"/>
    <rect x="14" y="5" width="4" height="14" rx="1" fill="#94a3b8" stroke="${M}" stroke-width="0.6"/>`,play:`<path d="m6 4 14 8-14 8z" fill="#22c55e" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>`,check:`<path d="m4 12 5 5L20 6" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,scroll:`
    <path d="M4 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4z" fill="#fef3c7" stroke="${M}" stroke-width="0.8"/>
    <path d="M8 8h8M8 12h8M8 16h5" stroke="#78350f" stroke-width="1" stroke-linecap="round"/>`,globe:`
    <circle cx="12" cy="12" r="9" fill="#3b82f6" stroke="${M}" stroke-width="0.8"/>
    <path d="M5 9c2-1 4-1 7-1s5 0 7 1M5 15c2 1 4 1 7 1s5 0 7-1" stroke="#1d4ed8" stroke-width="0.6" fill="none"/>
    <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="#1d4ed8" stroke-width="0.6"/>
    <path d="M7 7c1-1 3-1 5 1s4 1 5-1c0 4-2 5-5 5s-4-1-5-5z" fill="#22c55e" opacity=".8"/>
    <path d="M9 15c1 1 2 2 4 2s3-1 3-2c-1 2-3 2-4 2s-2 0-3-2z" fill="#22c55e" opacity=".8"/>`,people:`
    <circle cx="8" cy="7" r="3" fill="#f4c89a" stroke="${M}" stroke-width="0.6"/>
    <circle cx="16" cy="8" r="2.5" fill="#f4c89a" stroke="${M}" stroke-width="0.6"/>
    <path d="M2 20a6 6 0 0 1 12 0z" fill="#3b82f6" stroke="${M}" stroke-width="0.6"/>
    <path d="M11 20a5 5 0 0 1 10 0z" fill="#a855f7" stroke="${M}" stroke-width="0.6"/>`,dot:`<circle cx="12" cy="12" r="3" fill="#6b7280"/>`,cart:`
    <path d="M3 4h3l2.5 10h9l2-7H7.5" fill="none" stroke="#e6edf3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8.5 14h9l2-7H7.5z" fill="#facc15" opacity=".85"/>
    <circle cx="10" cy="19" r="1.7" fill="#e6edf3"/>
    <circle cx="17" cy="19" r="1.7" fill="#e6edf3"/>`,hourglass:`
    <path d="M6 3h12v3l-4.5 6L18 18v3H6v-3l4.5-6L6 6z" fill="#fde68a" stroke="${M}" stroke-width="1" stroke-linejoin="round"/>
    <path d="M8.5 6.5h7l-3.5 4.5z" fill="#f59e0b"/>
    <path d="M9 19h6l-3-3.5z" fill="#f59e0b"/>
    <rect x="5" y="2" width="14" height="2" rx="1" fill="#8b5a2b"/>
    <rect x="5" y="20" width="14" height="2" rx="1" fill="#8b5a2b"/>`,info:`
    <circle cx="12" cy="12" r="9" fill="#3b82f6" stroke="${M}" stroke-width="1"/>
    <circle cx="12" cy="7.5" r="1.4" fill="#fff"/>
    <rect x="10.6" y="10.5" width="2.8" height="7" rx="1" fill="#fff"/>`,burger:`
    <path d="M3 11a9 5 0 1 1 18 0z" fill="#d4a574" stroke="${M}" stroke-width="0.8"/>
    <circle cx="8" cy="7" r=".5" fill="#fff"/>
    <circle cx="12" cy="6" r=".5" fill="#fff"/>
    <circle cx="16" cy="7" r=".5" fill="#fff"/>
    <path d="M3 12h18l-1 2H4z" fill="#22c55e"/>
    <path d="M3 14h18v2H3z" fill="#7c2d12"/>
    <path d="M3 16h18v1H3z" fill="#facc15"/>
    <path d="M3 17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" fill="#d4a574" stroke="${M}" stroke-width="0.8"/>`,bag:`
    <path d="M5 8h14l-1 13H6z" fill="#dc2626" stroke="${M}" stroke-width="0.8"/>
    <path d="M8 8V6a4 4 0 0 1 8 0v2" fill="none" stroke="#7f1d1d" stroke-width="1.4"/>
    <path d="M9 12h6v2H9z" fill="#fff" opacity=".4"/>`,theater:`
    <circle cx="12" cy="12" r="9" fill="#fde68a" stroke="${M}" stroke-width="0.8"/>
    <circle cx="9" cy="10" r="1" fill="${M}"/>
    <circle cx="15" cy="10" r="1" fill="${M}"/>
    <path d="M8 14c1 2 2 3 4 3s3-1 4-3" fill="none" stroke="${M}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M9 6c0-1 1-2 3-2s3 1 3 2z" fill="#dc2626"/>`,hospitalCross:`
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#fff" stroke="${M}" stroke-width="0.8"/>
    <rect x="10" y="6" width="4" height="12" fill="#dc2626"/>
    <rect x="6" y="10" width="12" height="4" fill="#dc2626"/>`,lemon:`
    <ellipse cx="12" cy="13" rx="7" ry="5" transform="rotate(-20 12 13)" fill="#facc15" stroke="${M}" stroke-width="0.8"/>
    <ellipse cx="10" cy="11" rx="3" ry="1.5" transform="rotate(-20 10 11)" fill="#fef08a"/>
    <path d="M16 5l-1 3M18 6l-2 2" stroke="#15803d" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M15 7c1-1 3-1 3 0s-2 1-3 0z" fill="#22c55e"/>`,shoe:`
    <path d="M3 17l1-7 5-2 4 4 7 1v5z" fill="#78350f" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M3 19h18v1H3z" fill="#1a1a1a"/>
    <path d="M9 8l3 3" stroke="#fde68a" stroke-width="0.8"/>
    <circle cx="6" cy="14" r=".5" fill="#fde68a"/>
    <circle cx="9" cy="14" r=".5" fill="#fde68a"/>`,carrot:`
    <path d="M5 19l8-8 2 2-8 8z" fill="#ea580c" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M7 17l5-5" stroke="#9a3412" stroke-width="0.6"/>
    <path d="M13 11l3-3 4 4-3 3z" fill="#22c55e" stroke="${M}" stroke-width="0.8"/>
    <path d="M14 6l3-3M17 5l3-3M19 9l3-3" stroke="#15803d" stroke-width="1.2" stroke-linecap="round"/>`,scissors:`
    <circle cx="6" cy="6" r="3" fill="none" stroke="#dc2626" stroke-width="1.8"/>
    <circle cx="6" cy="18" r="3" fill="none" stroke="#dc2626" stroke-width="1.8"/>
    <path d="M8.5 8.5 20 20M8.5 15.5 20 4" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>`,bandage:`
    <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-30 12 12)" fill="#f4c89a" stroke="${M}" stroke-width="0.8"/>
    <rect x="9" y="9" width="6" height="6" transform="rotate(-30 12 12)" fill="#fde68a"/>
    <circle cx="10" cy="11" r=".5" fill="#7c2d12"/>
    <circle cx="13" cy="13" r=".5" fill="#7c2d12"/>
    <circle cx="12" cy="12" r=".5" fill="#7c2d12"/>`,thread:`
    <rect x="9" y="3" width="6" height="14" rx="1" fill="#a78bfa" stroke="${M}" stroke-width="0.8"/>
    <ellipse cx="12" cy="3" rx="3" ry="1" fill="#7c3aed"/>
    <ellipse cx="12" cy="17" rx="3" ry="1" fill="#7c3aed"/>
    <path d="M10 5h4M10 8h4M10 11h4M10 14h4" stroke="#fff" stroke-width="0.5"/>
    <path d="M15 12c3 2 4 5 2 7" stroke="#a78bfa" stroke-width="1" fill="none"/>`,pizza:`
    <path d="M3 21l9-18 9 18z" fill="#fde68a" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M5 19l7-13 7 13z" fill="#dc2626"/>
    <circle cx="9" cy="14" r="1" fill="#a16207"/>
    <circle cx="14" cy="13" r="1" fill="#a16207"/>
    <circle cx="12" cy="17" r="1" fill="#a16207"/>
    <circle cx="11" cy="11" r=".6" fill="#fff"/>
    <circle cx="15" cy="17" r=".6" fill="#fff"/>`,cash:`
    <rect x="3" y="6" width="18" height="12" rx="1" fill="#22c55e" stroke="${M}" stroke-width="0.8"/>
    <rect x="4" y="7" width="16" height="10" fill="none" stroke="#15803d" stroke-width="0.6"/>
    <circle cx="12" cy="12" r="3" fill="#dcfce7" stroke="#15803d" stroke-width="0.6"/>
    <text x="12" y="14.5" font-size="5" font-weight="800" text-anchor="middle" fill="#15803d">$</text>
    <circle cx="6" cy="9" r=".5" fill="#15803d"/>
    <circle cx="18" cy="15" r=".5" fill="#15803d"/>`,joystick:`
    <rect x="3" y="14" width="18" height="6" rx="1" fill="#1f2937" stroke="${M}" stroke-width="0.8"/>
    <rect x="11" y="8" width="2" height="6" fill="#6b7280"/>
    <circle cx="12" cy="7" r="2.5" fill="#dc2626" stroke="${M}" stroke-width="0.8"/>
    <circle cx="7" cy="17" r="1" fill="#facc15"/>
    <circle cx="10" cy="17" r="1" fill="#22c55e"/>
    <circle cx="13" cy="17" r="1" fill="#3b82f6"/>
    <circle cx="16" cy="17" r="1" fill="#dc2626"/>`,taxi:`
    <rect x="9" y="5" width="6" height="2" fill="${M}"/>
    <rect x="10" y="3" width="4" height="2" fill="#facc15" stroke="${M}" stroke-width="0.6"/>
    <path d="M3 16l2-6h14l2 6v3H3z" fill="#facc15" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M6 10h12l1 3H5z" fill="#bae6fd"/>
    <path d="M5 13h14v1H5z" fill="${M}"/>
    <rect x="11" y="10" width="2" height="3" fill="${M}"/>
    <circle cx="7" cy="19" r="1.8" fill="${M}"/>
    <circle cx="17" cy="19" r="1.8" fill="${M}"/>`,phone:`
    <rect x="6" y="2" width="12" height="20" rx="2" fill="#1f2937" stroke="${M}" stroke-width="0.8"/>
    <rect x="7.5" y="5" width="9" height="13" fill="#38bdf8"/>
    <path d="M7.5 5h9v3h-9z" fill="#0ea5e9"/>
    <rect x="9" y="10" width="2" height="2" fill="#fff"/>
    <rect x="12" y="10" width="2" height="2" fill="#fff"/>
    <rect x="9" y="13" width="2" height="2" fill="#fff"/>
    <rect x="12" y="13" width="2" height="2" fill="#fff"/>
    <circle cx="12" cy="20" r=".8" fill="#6b7280"/>`,wheat:`
    <path d="M12 22V8" stroke="#a16207" stroke-width="1.4"/>
    <ellipse cx="9" cy="10" rx="1.5" ry="2" fill="#facc15" stroke="${M}" stroke-width="0.4"/>
    <ellipse cx="15" cy="10" rx="1.5" ry="2" fill="#facc15" stroke="${M}" stroke-width="0.4"/>
    <ellipse cx="9" cy="14" rx="1.5" ry="2" fill="#facc15" stroke="${M}" stroke-width="0.4"/>
    <ellipse cx="15" cy="14" rx="1.5" ry="2" fill="#facc15" stroke="${M}" stroke-width="0.4"/>
    <ellipse cx="9" cy="18" rx="1.5" ry="2" fill="#facc15" stroke="${M}" stroke-width="0.4"/>
    <ellipse cx="15" cy="18" rx="1.5" ry="2" fill="#facc15" stroke="${M}" stroke-width="0.4"/>
    <ellipse cx="12" cy="6" rx="2" ry="3" fill="#fbbf24" stroke="${M}" stroke-width="0.4"/>`,tooth:`
    <path d="M7 3c2 0 3 2 5 2s3-2 5-2c2 0 4 2 3 5l-2 8c-1 4-3 6-4 6s-1-4-2-7c-1 3-1 7-2 7s-3-2-4-6L4 8c-1-3 1-5 3-5z" fill="#fff" stroke="${M}" stroke-width="0.8"/>
    <path d="M9 6c2-1 4-1 6 0" stroke="#bae6fd" stroke-width="0.6" fill="none"/>`,shrimp:`
    <path d="M4 12c0-5 4-8 9-8s8 3 8 7-3 7-7 7l-2 3-1-3a8 8 0 0 1-7-6z" fill="#fb7185" stroke="${M}" stroke-width="0.8"/>
    <path d="M6 12c0-4 3-6 7-6" fill="none" stroke="#be123c" stroke-width="0.8"/>
    <circle cx="17" cy="9" r=".6" fill="${M}"/>
    <path d="M19 7l3-2M20 9l3-1" stroke="${M}" stroke-width="0.8"/>`,hammer:`
    <path d="M14 2l8 8-3 3-2-2-9 9-3-3 9-9-2-2z" fill="#9aa4b2" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="m8 11 5 5" stroke="${M}" stroke-width="0.6"/>
    <path d="M5 17l-3 3 3 3 3-3" fill="#78350f" stroke="${M}" stroke-width="0.8"/>`,fuel:`
    <rect x="3" y="3" width="12" height="18" rx="1" fill="#dc2626" stroke="${M}" stroke-width="0.8"/>
    <rect x="4" y="5" width="10" height="4" fill="#fef3c7"/>
    <path d="M5 6h8M5 8h8" stroke="${M}" stroke-width="0.5"/>
    <path d="M15 8l3 3v8a2 2 0 0 1-4 0v-5" fill="none" stroke="${M}" stroke-width="1.4"/>
    <circle cx="9" cy="16" r=".6" fill="${M}"/>`,disco:`
    <circle cx="12" cy="13" r="7" fill="#94a3b8" stroke="${M}" stroke-width="0.8"/>
    <path d="M5 13h14M12 6v14M7 8l10 10M17 8 7 18" stroke="${M}" stroke-width="0.5"/>
    <circle cx="9" cy="10" r="1" fill="#fde68a"/>
    <circle cx="15" cy="11" r="1" fill="#fda4af"/>
    <circle cx="10" cy="15" r="1" fill="#bae6fd"/>
    <path d="M12 3v3" stroke="${M}" stroke-width="0.8"/>`,cow:`
    <ellipse cx="12" cy="14" rx="7" ry="5" fill="#fff" stroke="${M}" stroke-width="0.8"/>
    <path d="M8 12a2 2 0 0 0 0 4z" fill="${M}"/>
    <path d="M15 15a2 2 0 0 1 3 1l-3 .5z" fill="${M}"/>
    <path d="M5 9l2 2M19 9l-2 2" stroke="${M}" stroke-width="1.4"/>
    <ellipse cx="6" cy="8" rx="1.5" ry="1" fill="#fda4af"/>
    <ellipse cx="18" cy="8" rx="1.5" ry="1" fill="#fda4af"/>
    <circle cx="10" cy="14" r=".5" fill="${M}"/>
    <circle cx="14" cy="14" r=".5" fill="${M}"/>
    <ellipse cx="12" cy="17" rx="2" ry="1" fill="#fda4af"/>`,ambulance:`
    <path d="M3 16V8h12v8z" fill="#fff" stroke="${M}" stroke-width="0.8"/>
    <path d="M15 11h4l2 3v2h-6z" fill="#fff" stroke="${M}" stroke-width="0.8"/>
    <rect x="3" y="14" width="18" height="2" fill="#dc2626"/>
    <rect x="7" y="10" width="2" height="3" fill="#dc2626"/>
    <rect x="6" y="11" width="4" height="1" fill="#dc2626"/>
    <rect x="4" y="6" width="2" height="2" fill="#3b82f6"/>
    <circle cx="7" cy="18" r="1.8" fill="${M}"/>
    <circle cx="7" cy="18" r=".7" fill="#9aa4b2"/>
    <circle cx="17" cy="18" r="1.8" fill="${M}"/>
    <circle cx="17" cy="18" r=".7" fill="#9aa4b2"/>`,house:`
    <path d="M3 11l9-8 9 8v10H3z" fill="#fde68a" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M2 12l10-9 10 9-1 1-9-8-9 8z" fill="#dc2626" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <rect x="10" y="14" width="4" height="7" fill="#7c2d12"/>
    <circle cx="13" cy="17.5" r=".3" fill="#fde68a"/>
    <rect x="5" y="13" width="3" height="3" fill="#bae6fd"/>
    <rect x="16" y="13" width="3" height="3" fill="#bae6fd"/>`,movie:`
    <rect x="3" y="9" width="18" height="12" fill="#1f2937" stroke="${M}" stroke-width="0.8"/>
    <path d="m3 9 3-4h2l-2 4M9 9l3-4h2l-3 4M15 9l3-4h2l-3 4" fill="#1f2937" stroke="${M}" stroke-width="0.8"/>
    <rect x="3" y="5" width="3" height="4" fill="#fff" transform="skewX(-25) translate(2 0)"/>
    <rect x="3" y="14" width="18" height="2" fill="#9aa4b2"/>
    <rect x="3" y="18" width="18" height="1" fill="#6b7280"/>`,chart:`
    <rect x="3" y="3" width="18" height="18" fill="#fff" stroke="${M}" stroke-width="0.8"/>
    <path d="M3 17l6-6 4 4 8-8" fill="none" stroke="#22c55e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 7h7v7" fill="none" stroke="#22c55e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="9" cy="11" r="1" fill="#15803d"/>
    <circle cx="13" cy="15" r="1" fill="#15803d"/>`,laptop:`
    <rect x="4" y="5" width="16" height="11" rx="1" fill="#1f2937" stroke="${M}" stroke-width="0.8"/>
    <rect x="5" y="6" width="14" height="9" fill="#38bdf8"/>
    <path d="M5 6h14v2H5z" fill="#0284c7"/>
    <path d="M2 19h20l-1-3H3z" fill="#9aa4b2" stroke="${M}" stroke-width="0.8"/>
    <rect x="10" y="17" width="4" height="1" fill="#6b7280"/>`,ship:`
    <path d="M5 17V9l7-3 7 3v8z" fill="#fff" stroke="${M}" stroke-width="0.8"/>
    <path d="M5 9l7-3 7 3" fill="#dc2626"/>
    <rect x="8" y="11" width="2" height="2" fill="#0ea5e9"/>
    <rect x="11" y="11" width="2" height="2" fill="#0ea5e9"/>
    <rect x="14" y="11" width="2" height="2" fill="#0ea5e9"/>
    <path d="M12 6V3l4 2" fill="#dc2626" stroke="${M}" stroke-width="0.4"/>
    <path d="M3 17l1 3a2 2 0 0 0 2 1h12a2 2 0 0 0 2-1l1-3z" fill="#1d4ed8" stroke="${M}" stroke-width="0.8"/>
    <path d="M3 19c2 1 4-1 6 0s4 1 6 0 4 1 6 0" fill="none" stroke="#bae6fd" stroke-width="0.6"/>`,bank:`
    <path d="M12 3 3 8h18z" fill="#fef3c7" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <rect x="3" y="8" width="18" height="2" fill="#9aa4b2"/>
    <rect x="5" y="10" width="2" height="8" fill="#fff" stroke="${M}" stroke-width="0.5"/>
    <rect x="11" y="10" width="2" height="8" fill="#fff" stroke="${M}" stroke-width="0.5"/>
    <rect x="17" y="10" width="2" height="8" fill="#fff" stroke="${M}" stroke-width="0.5"/>
    <rect x="3" y="18" width="18" height="2" fill="#9aa4b2"/>
    <rect x="3" y="20" width="18" height="1" fill="${M}"/>
    <circle cx="12" cy="6" r=".8" fill="#dc2626"/>`,buildings:`
    <rect x="3" y="9" width="8" height="12" fill="#6b7280" stroke="${M}" stroke-width="0.8"/>
    <rect x="13" y="3" width="8" height="18" fill="#9ca3af" stroke="${M}" stroke-width="0.8"/>
    <rect x="5" y="11" width="1.5" height="2" fill="#fde68a"/>
    <rect x="7.5" y="11" width="1.5" height="2" fill="#fde68a"/>
    <rect x="5" y="15" width="1.5" height="2" fill="#bae6fd"/>
    <rect x="7.5" y="15" width="1.5" height="2" fill="#fde68a"/>
    <rect x="15" y="5" width="1.5" height="2" fill="#fde68a"/>
    <rect x="17.5" y="5" width="1.5" height="2" fill="#bae6fd"/>
    <rect x="15" y="9" width="1.5" height="2" fill="#bae6fd"/>
    <rect x="17.5" y="9" width="1.5" height="2" fill="#fde68a"/>
    <rect x="15" y="13" width="1.5" height="2" fill="#fde68a"/>
    <rect x="17.5" y="13" width="1.5" height="2" fill="#bae6fd"/>
    <rect x="15" y="17" width="1.5" height="2" fill="#fde68a"/>`,plane:`
    <path d="m21 16-9 3v-5L4 11l1-2 7 1V5l2-1v6l7-1 1 2-7 3v5z" fill="#fff" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M12 5V4l1 1" fill="#dc2626"/>
    <circle cx="12" cy="9" r=".6" fill="#bae6fd"/>
    <circle cx="14" cy="9" r=".6" fill="#bae6fd"/>`,oilBarrel:`
    <ellipse cx="12" cy="4" rx="7" ry="2" fill="#374151" stroke="${M}" stroke-width="0.8"/>
    <path d="M5 4v16c0 1 3 2 7 2s7-1 7-2V4z" fill="#1f2937" stroke="${M}" stroke-width="0.8"/>
    <path d="M5 10c0 1 3 2 7 2s7-1 7-2" stroke="${M}" stroke-width="0.6" fill="none"/>
    <path d="M5 16c0 1 3 2 7 2s7-1 7-2" stroke="${M}" stroke-width="0.6" fill="none"/>
    <rect x="9" y="8" width="6" height="6" fill="#dc2626" opacity=".7"/>
    <text x="12" y="13" font-size="4" font-weight="800" text-anchor="middle" fill="#fff">OIL</text>`,shield:`
    <path d="m12 2 8 3v7c0 5-4 9-8 10-4-1-8-5-8-10V5z" fill="#3b82f6" stroke="${M}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="m12 2 8 3v7c0 5-4 9-8 10z" fill="#1d4ed8" opacity=".6"/>
    <path d="M8 11l3 3 5-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,chip:`
    <rect x="6" y="6" width="12" height="12" rx="1" fill="#15803d" stroke="${M}" stroke-width="0.8"/>
    <rect x="9" y="9" width="6" height="6" fill="#22c55e" stroke="${M}" stroke-width="0.6"/>
    <rect x="10.5" y="10.5" width="3" height="3" fill="#0e1116"/>
    <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" stroke="#6b7280" stroke-width="1.4" stroke-linecap="round"/>`,ufo:`
    <ellipse cx="12" cy="14" rx="9" ry="3" fill="#9aa4b2" stroke="${M}" stroke-width="0.8"/>
    <path d="M7 13a5 4 0 0 1 10 0z" fill="#bae6fd" stroke="${M}" stroke-width="0.8"/>
    <circle cx="9" cy="11" r=".6" fill="#374151"/>
    <circle cx="15" cy="11" r=".6" fill="#374151"/>
    <circle cx="6" cy="15" r=".6" fill="#facc15"/>
    <circle cx="12" cy="16" r=".6" fill="#22c55e"/>
    <circle cx="18" cy="15" r=".6" fill="#dc2626"/>
    <path d="M9 17l-2 4M15 17l2 4M12 17v5" stroke="#22c55e" stroke-width="1" opacity=".6"/>`,atom:`
    <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="#3b82f6" stroke-width="1.2"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="#22c55e" stroke-width="1.2" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="#ef4444" stroke-width="1.2" transform="rotate(120 12 12)"/>
    <circle cx="12" cy="12" r="2" fill="#facc15" stroke="${M}" stroke-width="0.6"/>`};function N(e,t={}){let n=Xe[e]??Xe.dot,r=t.size??16;return`<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="${r}" height="${r}" viewBox="0 0 24 24" aria-hidden="true">${n}</svg>`}var Ze=140,Qe=450,$e=8;function P(e,t=[]){return`<b class="tt">${e}</b>${t.filter(e=>Array.isArray(e)?e[1]!==``:e!==``).map(e=>Array.isArray(e)?`<span class="tr"><span>${e[0]}</span><b>${e[1]}</b></span>`:`<span class="tl">${e}</span>`).join(``)}`.replace(/"/g,`&quot;`)}function et(){let e=document.createElement(`div`);e.className=`tip`,e.setAttribute(`role`,`tooltip`),document.body.appendChild(e);let t=null,n=0,r=0,i=0,a=0,o=()=>{clearTimeout(n),t=null,e.classList.remove(`on`)},s=()=>{if(!t)return;let n=t.getBoundingClientRect(),r=e.offsetWidth,i=e.offsetHeight,a=window.innerWidth,o=window.innerHeight,s=n.top-$e-i>=4||n.bottom+$e+i>o,c=s?n.top-$e-i:n.bottom+$e,l=Math.max(4,Math.min(a-r-4,n.left+n.width/2-r/2));e.style.transform=`translate(${Math.round(l)}px, ${Math.round(c)}px)`,e.style.setProperty(`--ax`,`${Math.round(n.left+n.width/2-l)}px`),e.classList.toggle(`below`,!s)},c=n=>{t=n,e.innerHTML=n.dataset.tip??``,s(),e.classList.add(`on`)},l=()=>{r=0;let l=document.elementFromPoint(i,a)?.closest(`[data-tip]`)??null;if(l===t){t&&s();return}if(clearTimeout(n),!l||!l.dataset.tip){o();return}t=l,e.classList.contains(`on`)?c(l):n=window.setTimeout(()=>{t===l&&c(l)},Ze)};document.addEventListener(`pointermove`,e=>{e.pointerType===`mouse`&&(i=e.clientX,a=e.clientY,r||=requestAnimationFrame(l))},{passive:!0}),document.addEventListener(`mousedown`,o,!0),document.addEventListener(`mouseleave`,o),window.addEventListener(`scroll`,o,{passive:!0,capture:!0}),window.addEventListener(`blur`,o);let u=0,d=!1,f=0,p=0;document.addEventListener(`touchstart`,e=>{o(),d=!1;let t=e.target.closest(`[data-tip]`);if(!t||!t.dataset.tip)return;let n=e.touches[0];f=n.clientX,p=n.clientY,u=window.setTimeout(()=>{d=!0,c(t)},Qe)},{passive:!0}),document.addEventListener(`touchmove`,e=>{let t=e.touches[0];Math.hypot(t.clientX-f,t.clientY-p)>10&&clearTimeout(u)},{passive:!0}),document.addEventListener(`touchend`,e=>{clearTimeout(u),d&&e.cancelable&&e.preventDefault()},{passive:!1}),document.addEventListener(`touchcancel`,()=>clearTimeout(u),{passive:!0})}var tt={Food:`burger`,Lifestyle:`bag`,Agriculture:`wheat`,Health:`hospitalCross`,Entertainment:`theater`,"Real Estate":`house`,Tech:`laptop`,Finance:`bank`,Travel:`plane`,Energy:`bolt`,Company:`globe`,Customers:`people`,Tips:`salary`,Reputation:`star`,Shady:`warning`};function nt(e,t,n){return t.unlocked?t.count===0&&n>=e.baseCost:n>=e.unlockCost}function rt(e,t){let r=t.money,i={open:0,mgr:0,emp:0};for(let a of n){if((a.category??`Misc`)!==e)continue;let n=t.industries[a.id];nt(a,n,r)&&i.open++,n.count!==0&&(!n.hasManager&&n.managerHiringUntil===null&&r>=a.managerCost&&i.mgr++,n.employees<Te(a)&&n.hiringUntil===null&&r>=Ae(a,n.employees)&&i.emp++)}return i}var it=[[`open`,`ct-ready`,``],[`mgr`,`ct-ready mgr`,N(`manager`,{size:9})],[`emp`,`ct-ready emp`,N(`worker`,{size:9})]];function at(e){return`<span class="ct-badges">${it.map(([t,n,r])=>`<span class="${n} ${e[t]>0?`on`:``}" data-badge="${t}" data-last="${e[t]}">${r}${e[t]}</span>`).join(``)}</span>`}function ot(e){return[...new Set(e.map(e=>e.category??`Misc`))]}var st=()=>ot(n),ct=e=>e.industryId!==`global`&&e.industryId!==`customer`,lt=r.filter(e=>!ct(e)),ut=()=>ot(lt),dt=(e,t)=>lt.filter(n=>n.category===e&&!t.upgrades[n.id]&&t.money>=n.cost).length;function ft(e,t){let n={state:e,buyQty:1,tab:`industries`,industryCategory:st()[0]??`Food`,upgradeCategory:ut()[0]??`Company`,notify:t},r=document.getElementById(`app`);r.innerHTML=_t(),pt=null,vt(n,r),Yt(n,r);let i=()=>yt(n,r);return i(),{render:i,tick:()=>Tt(n,r),ui:n}}function F(e,t){e.textContent!==t&&(e.textContent=t)}var pt=null;function mt(e){if(pt)return pt;let t=t=>e.querySelector(t);return pt={money:t(`#money`),rate:t(`#rate`),salMgr:t(`#sal-mgr`),salEmp:t(`#sal-emp`),salTotal:t(`#sal-total`),rep:t(`#rep`),repFill:t(`#rep-fill`),repVal:t(`#rep-val`),repBuff:t(`#rep-buff`),footer:t(`#footer`)}}var ht=new WeakMap;function gt(e){let t=ht.get(e);return t||(t={fill:e.querySelector(`.card-fill`),time:e.querySelector(`.status-time`),rate:e.querySelector(`.status-rev`),buy:e.querySelector(`button[data-buy]`),unlockFill:e.querySelector(`.unlock-fill`),produce:e.querySelector(`button[data-start]`),costBtns:Array.from(e.querySelectorAll(`button[data-cost]`)),hiring:Array.from(e.querySelectorAll(`.staff.hiring`)).map(e=>({until:Number(e.dataset.until),dur:Number(e.dataset.dur),left:e.querySelector(`.hire-left`),fill:e.querySelector(`.hire-fill`)}))},ht.set(e,t),t)}function _t(){return`
    <header class="topbar">
      <div class="brand">
        <span class="logo">${N(`briefcase`,{size:26})}</span>
        <div class="brand-text">
          <span class="title">Entrepreneur Tycoon</span>
          <div class="footer" id="footer"></div>
        </div>
      </div>
      <div class="money">
        <div class="money-amount" id="money">$0</div>
        <div class="money-rate" id="rate">$0/s</div>
        <div class="money-salary" id="salary" data-tip="${P(`Payroll`,[`Salary outflow per second`,`Managers + employees across all industries`])}">
          <span class="sal-line"><span class="sal-icon">${N(`manager`,{size:14})}</span><span class="sal-val" id="sal-mgr">-$0/s</span></span>
          <span class="sal-op">+</span>
          <span class="sal-line"><span class="sal-icon">${N(`worker`,{size:14})}</span><span class="sal-val" id="sal-emp">-$0/s</span></span>
          <span class="sal-op">=</span>
          <span class="sal-line sal-total"><span class="sal-icon">${N(`salary`,{size:14})}</span><span class="sal-val" id="sal-total">-$0/s</span></span>
        </div>
        <div class="rep" id="rep" data-tip="${P(`Reputation`,[[`Range`,`1 – 1000`],[`Revenue`,`×0.5 – ×1.5`],`Also scales customer flow & penalties`])}">
          <span class="rep-label">${N(`star`,{size:12})} REPUTATION</span>
          <div class="rep-bar"><div class="rep-fill" id="rep-fill"></div></div>
          <span class="rep-val" id="rep-val">500</span>
          <span class="rep-buff" id="rep-buff"></span>
        </div>
      </div>
      <div class="controls">
        <button id="btn-reset" class="danger" data-tip="${P(`Reset`,[`Wipe save and start over`])}">${N(`refresh`,{size:14})}</button>
      </div>
    </header>
    <nav class="tabs">
      <button class="tab active" data-tab="industries">${N(`factory`,{size:14})} Industries</button>
      <button class="tab" data-tab="upgrades">${N(`bolt`,{size:14})} Upgrades</button>
    </nav>
    <div class="body-grid">
      <aside id="left-sidebar" class="left-sidebar"></aside>
      <main id="main"></main>
      <aside id="sidebar" class="sidebar"></aside>
    </div>
  `}function vt(e,t){t.querySelectorAll(`.tab`).forEach(n=>{n.addEventListener(`click`,()=>{e.tab=n.dataset.tab,t.querySelectorAll(`.tab`).forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`),yt(e,t)})}),t.querySelector(`#btn-reset`).addEventListener(`click`,()=>{confirm(`Wipe save and start over?`)&&(Ke(),location.reload())})}function yt(e,t){Ct(e,t);let n=t.querySelector(`#main`),r=t.querySelector(`#sidebar`);e.tab===`industries`?n.innerHTML=Ft(e):n.innerHTML=Wt(e),r.innerHTML=xt(e),St(e,t),wt(e,t)}function bt(e){return`<div class="qty-group" id="qty-group">
    ${[{v:1,label:`x1`},{v:`max`,label:`MAX`}].map(t=>`<button data-qty="${t.v}" class="qty ${e.buyQty===t.v?`active`:``}">${t.label}</button>`).join(``)}
  </div>`}function xt(e){if(e.tab===`industries`){let t=st(),r=t.includes(e.industryCategory)?e.industryCategory:t[0]??``;return`
      ${bt(e)}
      <nav class="cat-grid">
        ${t.map(t=>{let i=n.filter(e=>(e.category??`Misc`)===t).length,a=n.filter(n=>(n.category??`Misc`)===t&&e.state.industries[n.id]?.unlocked).length;return`<button class="cat-tile ${r===t?`active`:``}" data-subtab="${t}" data-tip="${t}" style="--cat-color: ${j(t)??`#9aa4b2`}">
            <span class="ct-icon">${N(tt[t]??`package`,{size:22})}</span>
            <span class="ct-count">${a}/${i}</span>
            ${at(rt(t,e.state))}
          </button>`}).join(``)}
      </nav>`}return`
    <nav class="cat-grid">
      ${ut().map(t=>{let n=lt.filter(e=>e.category===t),r=n.filter(t=>e.state.upgrades[t.id]).length,i=dt(t,e.state);return`<button class="cat-tile ${e.upgradeCategory===t?`active`:``}" data-subtab="${t}" data-tip="${t}" style="--cat-color: ${j(t)??`#9aa4b2`}">
          <span class="ct-icon">${N(tt[t]??`bolt`,{size:22})}</span>
          <span class="ct-count">${r}/${n.length}</span>
          <span class="ct-ready ${i>0?`on`:``}" data-upgrade-ready="${t}" data-last="${i}">${i}</span>
        </button>`}).join(``)}
    </nav>`}function St(e,t){let n=t.querySelector(`#sidebar`);n.querySelectorAll(`#qty-group .qty`).forEach(n=>{n.addEventListener(`click`,()=>{e.buyQty=n.dataset.qty===`max`?`max`:1,yt(e,t)})}),n.querySelectorAll(`[data-subtab]`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.subtab;e.tab===`upgrades`?e.upgradeCategory=r:e.industryCategory=r,yt(e,t)})})}function Ct(e,t){let n=mt(t);F(n.money,O(e.state.money));let r=Pt(e.state),i=r<0?`-`:`+`;F(n.rate,i+O(Math.abs(r))+`/s`),n.rate.classList.toggle(`neg`,r<0),n.rate.classList.toggle(`pos`,r>0);let a=Nt(e.state);F(n.salMgr,`-`+O(a.manager)+`/s`),F(n.salEmp,`-`+O(a.employee)+`/s`),F(n.salTotal,`-`+O(a.manager+a.employee)+`/s`);let o=Math.round(e.state.reputation);n.repFill.style.width=(o/10).toFixed(1)+`%`,F(n.repVal,String(o));let s=C(e.state.reputation),c=w(e.state.reputation);F(n.repBuff,`${s>=1?`+`:``}${Math.round((s-1)*100)}% rev · ${c.toFixed(2)}× loss`),n.repBuff.classList.toggle(`buff`,s>1),n.repBuff.classList.toggle(`nerf`,s<1),n.rep.classList.toggle(`rep-low`,o<300),n.rep.classList.toggle(`rep-high`,o>700)}function wt(e,t){F(mt(t).footer,`Total earned: ${O(e.state.totalEarned)} · Playing: ${k((Date.now()-e.state.startedAt)/1e3)}`)}function Tt(e,t){if(Ct(e,t),wt(e,t),e.tab===`upgrades`){Gt(e,t);return}let n=performance.now();e.state.money!==jt&&n-Mt>250&&(jt=e.state.money,Mt=n,t.querySelectorAll(`.cat-tile[data-subtab]`).forEach(t=>{let n=rt(t.dataset.subtab,e.state);for(let e of t.querySelectorAll(`[data-badge]`)){let t=n[e.dataset.badge];Number(e.dataset.last)!==t&&(e.dataset.last=String(t),e.lastChild.textContent=String(t),e.classList.toggle(`on`,t>0))}}));let r=Date.now();for(let n of t.querySelectorAll(`[data-card]`)){let t=i.get(n.dataset.card);if(!t)continue;let a=e.state.industries[t.id],o=gt(n),s=Pe(t,e.state),c=!a.paused&&(a.producing||a.hasManager),l=Math.max(0,Math.min(100,a.progress*100));if(o.fill&&(o.fill.style.transform=`scaleX(${(l/100).toFixed(3)})`),o.time){let e=a.paused?`paused`:c?`run`:a.count>0?`idle`:`none`;e===`run`?F(o.time,k((1-a.progress)*s)+` left`):o.time.dataset.mode!==e&&(o.time.innerHTML=At(e)),o.time.dataset.mode=e}if(o.rate&&a.count>0){let n=Se(t,e.state);F(o.rate,O(n/Math.max(1e-4,s))+`/s`)}let u=o.buy;if(u&&a.unlocked&&a.count>0){let n=e.buyQty===`max`?xe(t,a.count,e.state.money):e.buyQty,r=be(t,a.count,Math.max(1,n)),i=n>0&&e.state.money>=r;u.disabled===i&&(u.disabled=!i),F(u,Et(n,r))}else if(u&&!a.unlocked){let r=e.state.money>=t.unlockCost;u.disabled===r&&(u.disabled=!r),n.classList.toggle(`affordable`,r),o.unlockFill&&(o.unlockFill.style.width=Math.min(100,e.state.money/t.unlockCost*100).toFixed(1)+`%`)}let d=o.produce;if(d){let e=Dt(a);d.dataset.mode!==e&&(d.innerHTML=kt(e)),d.dataset.mode=e;let t=e!==`idle`;d.disabled!==t&&(d.disabled=t)}for(let t of o.costBtns){let n=e.state.money<Number(t.dataset.cost);t.disabled!==n&&(t.disabled=n)}for(let e of o.hiring){let t=Math.max(0,(e.until-r)/1e3);F(e.left,k(t)),e.fill.style.width=Math.min(100,(1-t/e.dur)*100).toFixed(1)+`%`}}}function Et(e,t){return`Expand +${e<=0?1:e} · ${O(t)}`}function Dt(e){return e.paused?`paused`:e.hasManager?`auto`:e.producing?`run`:`idle`}var Ot=`<svg class="ants" aria-hidden="true"><rect/></svg>`;function kt(e){return e===`idle`?`${N(`play`,{size:11})} Produce`:e===`auto`?`${Ot}${N(`manager`,{size:11})}`:e===`run`?`${N(`hourglass`,{size:11})} Producing`:`${Ot}${N(`pause`,{size:11})}`}function At(e){return e===`paused`?`${N(`pause`,{size:11})} Paused`:e===`idle`?`Idle`:e===`none`?`Open shop first`:``}var jt=NaN,Mt=0;function Nt(e){let t=0,r=0;for(let i of n){let n=e.industries[i.id];n&&(n.hasManager&&(t+=E(i)),n.employees>0&&(r+=D(i,n.employees)))}return{manager:t,employee:r}}function Pt(e){let t=0;for(let r of n){let n=e.industries[r.id];if(n.count<=0||n.paused||!n.hasManager&&!n.producing)continue;let i=Se(r,e),a=Pe(r,e);a>0&&(t+=i/a)}let r=Nt(e);return t-r.manager-r.employee}function Ft(e){let t=st(),r=t.includes(e.industryCategory)?e.industryCategory:t[0]??``;return e.industryCategory=r,`
    <div class="grid">
      ${n.filter(e=>(e.category??`Misc`)===r).map(t=>It(e,t)).join(``)}
    </div>
  `}function It(e,t){let r=e.state.industries[t.id];if(!r.unlocked){let n=e.state.money>=t.unlockCost,r=Math.min(100,e.state.money/t.unlockCost*100);return`
      <div class="card locked ${n?`affordable`:``}" data-card="${t.id}">
        <div class="card-content">
          <div class="card-head">
            <div class="icon big">${N(t.icon,{size:32})}</div>
            <div class="card-title">
              <div class="name">${t.name}</div>
              <div class="sub">${N(`lock`,{size:12})} Locked <span class="sub-dot">·</span> <span>${t.category??`Misc`}</span></div>
            </div>
          </div>
          <div class="preview">
            <div class="preview-row"><span>Base revenue</span><b>${O(t.baseRevenue)} / cycle</b></div>
            <div class="preview-row"><span>Cycle time</span><b>${k(t.baseTime)}</b></div>
            <div class="preview-row"><span>Manager</span><b>${O(t.managerCost)}</b></div>
          </div>
          <div class="card-actions">
            <div class="unlock-progress" data-tip="${P(`Unlock progress`,[`Cash on hand toward unlock cost`])}"><div class="unlock-fill" style="width:${r.toFixed(1)}%"></div></div>
            <button class="buy buy-big" data-buy="${t.id}" ${n?``:`disabled`}>
              ${N(`unlock`,{size:12})} Unlock ${O(t.unlockCost)}
            </button>
          </div>
        </div>
      </div>`}let i=e.buyQty===`max`?xe(t,r.count,e.state.money):e.buyQty,a=r.count===0?t.baseCost:be(t,r.count,Math.max(1,i)),o=r.count===0?`${N(`unlock`,{size:12})} Open shop · ${O(t.baseCost)}`:Et(i,a),s=r.count===0?e.state.money>=t.baseCost:i>0&&e.state.money>=a,c=Se(t,e.state),l=Pe(t,e.state),u=(r.hasManager?E(t):0)+D(t,r.employees),d=Math.max(0,Math.min(100,r.progress*100)),f=!r.paused&&(r.producing||r.hasManager),p=ne(r.count),g=re(r.count),_=se(t,e.state),v=Math.round((_-1)*100),y=e.state.shopStats[t.id]?.unitsSold??0,b=h(y),x=Math.round((ke(r.employees)-1)*100),S=p>1?`×${p} units`:``,C=v>0?`+${v}% synergy`:``,w=n.filter(n=>n.id!==t.id&&e.state.industries[n.id]?.unlocked),ee=w.filter(t=>(e.state.industries[t.id]?.count??0)>=100).length,te=P(`Synergy`,[`Other unlocked industries boost this one`,[`${w.length} unlocked × +${ie*100}%`,`+${Math.round(w.length*ie*100)}%`],[`${ee} with 100+ units × +${ae*100}%`,`+${Math.round(ee*ae*100)}%`],[`Total revenue`,`×${_.toFixed(2)}`]]),oe=T.filter(e=>e<=r.count).length,ce=P(`Unit milestones`,[`Revenue per unit doubles at each threshold`,[`${oe} of ${T.length} reached`,`×${A(p)}`],g.next===null?`All milestones reached`:[`Next`,`${A(g.next)} units → ×${A(g.mult)}`]]),le=m.filter(e=>e.units<=y).pop(),ue=m.find(e=>e.units>y),de=P(`Sales milestones`,[`Units sold to customers multiply revenue + tips`,[le?.label??`No tier`,`×${b}`],ue?[`Next`,`${ue.label} @ ${A(ue.units)} sold`]:`Top tier reached`]),fe=P(`Overtime`,[`Employees past ${De} no longer speed cycles — they add revenue instead`,[`${Math.max(0,r.employees-De)} extra × +${Oe*100}%`,`+${x}%`]]),pe=b>1?`×${b} sales`:``,me=x>0?`+${x}% overtime`:``,he=T.filter(e=>e<=r.count).pop()??0,ge=g.next===null?100:(r.count-he)/(g.next-he)*100,_e=[S?`<span class="bonus-tag milestone" data-tip="${ce}">${S}</span>`:``,pe?`<span class="bonus-tag sales" data-tip="${de}">${pe}</span>`:``,C?`<span class="bonus-tag synergy" data-tip="${te}">${C}</span>`:``,me?`<span class="bonus-tag overtime" data-tip="${fe}">${me}</span>`:``].join(``),ve=r.paused?`paused`:f?`run`:r.count>0?`idle`:`none`;return`
    <div class="card ${r.count>0?`owned`:``} ${r.hasManager?`auto`:``}" data-card="${t.id}">
      <div class="card-content">
        <div class="name">${N(t.icon,{size:18})}<span>${t.name}</span>${N(t.icon,{size:18})}</div>
        <div class="status-line">
          <span class="status-rev">${O(c/Math.max(1e-4,l))}/s</span>
          ${u>0?`<span class="status-upkeep" data-tip="${P(`Upkeep`,[`Salaries, paid even while paused`,r.hasManager?[`Manager`,`${O(E(t))}/s`]:`No manager`,[`${r.employees} employees`,`${O(D(t,r.employees))}/s`]])}">−${O(u)}/s</span>`:``}
        </div>
        <div class="prod-badge" data-tip="${P(`Production`,[[`Revenue`,`${O(c)} / cycle`],[`Cycle`,k(l)]])}">
          <div class="card-fill" style="transform:scaleX(${(d/100).toFixed(3)})"></div>
          <span class="pb-rev">+${O(c)}</span>
          <span class="pb-label">per cycle</span>
          <span class="status-time" data-mode="${ve}">${ve===`run`?k((1-r.progress)*l)+` left`:At(ve)}</span>
        </div>
        ${r.count>0?`
          <div class="bonus-badge" data-tip="${P(`Bonuses`,[`Revenue multipliers on this shop`,`Unit milestones double revenue`])}">
            <div class="sb-head">${_e||`<span class="sb-label">No bonuses yet</span>`}</div>
            <div class="sb-bar"><div class="sb-fill" style="width:${ge.toFixed(1)}%"></div></div>
            <div class="sb-foot">
              <span class="sb-next">${g.next===null?`All milestones reached`:`→ ×${A(g.mult)} @ ${A(g.next)} units`}</span>
              <span class="sb-remain">${g.next===null?`MAX TIER`:`${A(g.next-r.count)} to go`}</span>
            </div>
          </div>`:``}
        ${y>0||r.count>0?Bt(y):``}
        <div class="card-foot">
          <div class="card-actions">
            ${r.count===0?``:`<button class="buy produce" data-start="${t.id}" data-mode="${Dt(r)}" data-count="×${A(r.count)}" ${Dt(r)===`idle`?``:`disabled`}>${kt(Dt(r))}</button>`}
            <button class="buy" data-buy="${t.id}" ${s?``:`disabled`}>${o}</button>
            <button class="staff pause ${r.paused?`on`:``}" data-pause="${t.id}" data-tip="${r.paused?P(`Resume production`):P(`Pause production`,[`Salaries still paid while paused`])}">${N(r.paused?`play`:`pause`,{size:11})}</button>
          </div>
          ${Lt(e,t,r)}
          ${zt(e,t,r)}
        </div>
      </div>
    </div>`}function Lt(e,t,n){let r=e.state.money,i=Te(t),a=Ae(t,n.employees),o=je(n.employees),s=Math.round((1-Ee(n.employees))*100);return`<div class="staff-row">${n.hasManager?`<span class="staff chip on mgr" data-tip="${P(`Manager`,[`Auto-restarts production`,[`Salary`,`${O(E(t))}/s`],[`Served`,A(n.managerProductsServed)]])}">${N(`manager`,{size:12})} Auto</span>
       <button class="staff fire" data-fire-manager="${t.id}" data-tip="${P(`Fire manager`,[[`Severance`,O(me(t,e.state))]])}">×</button>`:n.managerHiringUntil===null?`<button class="staff hire mgr" data-manager="${t.id}" data-cost="${t.managerCost}" ${r>=t.managerCost?``:`disabled`} data-tip="${P(`Hire manager`,[`Auto-restarts production`,[`Cost`,O(t.managerCost)],[`Recruit`,k(45)],[`Salary`,`${O(E(t))}/s`]])}">${N(`manager`,{size:12})} Manager · ${O(t.managerCost)}</button>`:Rt(`mgr`,n.managerHiringUntil,45,`${N(`manager`,{size:12})} Manager`)}${n.employees>=i?`<span class="staff chip on emp" data-tip="${P(`Employees`,[`Max staff reached`,[`Cycle time`,`−${s}%`],[`Salary`,`${O(D(t,n.employees))}/s`]])}">${N(`worker`,{size:12})} ${n.employees}/${i}</span>`:n.hiringUntil===null?`<button class="staff hire emp" data-employee="${t.id}" data-cost="${a}" ${r>=a?``:`disabled`} data-tip="${P(`Hire employee`,[[`Cycle time`,`−8% each · now −${s}%`],[`Cost`,O(a)],[`Recruit`,k(o)],[`Salary`,`${O(D(t,1))}/s each`]])}">${N(`worker`,{size:12})} ${n.employees}/${i} · +1 ${O(a)}</button>`:Rt(`emp`,n.hiringUntil,o,`${N(`worker`,{size:12})} ${n.employees}/${i}`)}${n.employees>0?`<button class="staff fire" data-fire-employee="${t.id}" data-tip="${P(`Fire one employee`,[[`Severance`,O(he(t,e.state))]])}">−</button>`:``}</div>`}function Rt(e,t,n,r){let i=Math.max(0,(t-Date.now())/1e3);return`<button class="staff hire hiring ${e}" disabled data-until="${t}" data-dur="${n}"><span class="hire-fill" style="width:${Math.min(100,(1-i/n)*100).toFixed(1)}%"></span><span class="hire-txt">${N(`hourglass`,{size:12})} ${r} · <span class="hire-left">${k(i)}</span></span></button>`}function zt(e,t,n){let i=r.find(n=>n.industryId===t.id&&!e.state.upgrades[n.id]);return i?i.requires&&n.count<i.requires?`<div class="upg-locked">${N(`bolt`,{size:11})} ${i.name} ×${i.multiplier??1} · unlocks @ ${A(i.requires)} units</div>`:`<button class="buy upg" data-upgrade="${i.id}" data-cost="${i.cost}" ${e.state.money>=i.cost?``:`disabled`} data-tip="${P(i.name,[i.desc??``,[`Revenue`,`×${i.multiplier??1}`],[`Cost`,O(i.cost)]])}">${N(`bolt`,{size:12})} ${i.name} · ×${i.multiplier??1} revenue · ${O(i.cost)}</button>`:``}function Bt(e){let t=m.findIndex(t=>e<t.units),n=m[(t===-1?m.length:t)-1],r=t===-1?void 0:m[t],i=n?n.units:0,a=n?n.label:`New shop`,o=n?n.mult:1,s=100,c=`MAX TIER`,l=``;return r&&(s=Math.max(0,Math.min(100,(e-i)/(r.units-i)*100)),c=`${A(r.units-e)} to go`,l=`→ ×${r.mult} "${r.label}"`),`
    <div class="sold-badge ${n?`tiered`:``}" data-tip="${P(`Units sold`,[`Cumulative across all customers`,`Milestones multiply revenue`])}">
      <div class="sb-head">
        <span class="sb-icon">${N(`package`,{size:12})}</span>
        <span class="sb-count">${A(e)}</span>
        <span class="sb-label">sold</span>
        ${n?`<span class="sb-tier">×${o} · ${a}</span>`:``}
      </div>
      <div class="sb-bar"><div class="sb-fill" style="width:${s.toFixed(1)}%"></div></div>
      <div class="sb-foot">
        <span class="sb-next">${l||`Top tier reached`}</span>
        <span class="sb-remain">${c}</span>
      </div>
    </div>
  `}function Vt(e){if(e.desc)return e.desc;let t=e.kind??`revenue`,n=e.value??0;switch(t){case`revenue`:return`×${e.multiplier??1} revenue`;case`spawn_rate`:return`×${n} customer flow`;case`walk_speed`:return`×${n} walk speed`;case`shop_dwell`:return`×${n} dwell time`;case`wealthy_rate`:return`+${Math.round(n*100)}% wealthy chance`;case`whale_rate`:return`+${Math.round(n*100)}% whale chance`;case`tip_mult`:return`×${n} all tips`;case`whale_tip`:return`×${n} whale tips`;case`rep_gain_mult`:return`×${n} rep gained`;case`rep_loss_mult`:return`×${n} rep / $ loss`;case`partial_forgive`:return`Partial orders forgiven`;case`rep_regen`:return`+${n} rep / sec`}return``}var Ht={revenue:`coin`,spawn_rate:`people`,walk_speed:`bolt`,shop_dwell:`package`,wealthy_rate:`gem`,whale_rate:`crown`,tip_mult:`salary`,whale_tip:`crown`,rep_gain_mult:`star`,rep_loss_mult:`shield`,partial_forgive:`check`,rep_regen:`star`};function Ut(e,t,n){let r=!n&&e.state.money>=t.cost,i=t.industryId===`global`?`globe`:Ht[t.kind??`revenue`],a=Vt(t);return`
    <div class="upgrade-row ${n?`owned`:r?`affordable`:``} ${t.repDrain?`shady`:``}" data-cost="${t.cost}" data-tip="${P(t.name,[a,[`Cost`,O(t.cost)],t.repDrain?[`Reputation`,`−${t.repDrain}/s`]:``])}">
      <span class="ur-icon">${N(i,{size:18})}</span>
      <div class="ur-name">${t.repDrain?N(`warning`,{size:12})+` `:``}${t.name}</div>
      <div class="ur-sub">${a}</div>
      ${n?`<span class="ur-owned" data-tip="${P(`Owned`)}">${N(`check`,{size:14})}</span>`:`<button class="ur-buy" data-upgrade="${t.id}" ${r?``:`disabled`}>${O(t.cost)}</button>`}
    </div>`}function Wt(e){let t=ut();t.includes(e.upgradeCategory)||(e.upgradeCategory=t[0]??``);let n=lt.filter(t=>t.category===e.upgradeCategory),r=n.filter(t=>!e.state.upgrades[t.id]).sort((e,t)=>e.cost-t.cost),i=n.filter(t=>e.state.upgrades[t.id]).sort((e,t)=>e.cost-t.cost),a=r.filter(t=>e.state.money>=t.cost).length;return`
    <h3 class="section">${e.upgradeCategory} · Available (${r.length}) <span class="section-note" id="up-afford">${a} affordable</span></h3>
    ${r.length?`<div class="upgrade-grid">${r.map(t=>Ut(e,t,!1)).join(``)}</div>`:`<div class="empty-placeholder">Everything bought.</div>`}
    <h3 class="section">Owned (${i.length})</h3>
    ${i.length?`<div class="upgrade-grid">${i.map(t=>Ut(e,t,!0)).join(``)}</div>`:`<div class="empty-placeholder">None yet.</div>`}
  `}function Gt(e,t){let n=performance.now();if(n-Mt<250)return;Mt=n;let r=0;t.querySelectorAll(`.upgrade-row:not(.owned)`).forEach(t=>{let n=e.state.money>=Number(t.dataset.cost);t.classList.toggle(`affordable`,n);let i=t.querySelector(`.ur-buy`);i&&i.disabled===n&&(i.disabled=!n),n&&r++});let i=t.querySelector(`#up-afford`);i&&F(i,`${r} affordable`),t.querySelectorAll(`[data-upgrade-ready]`).forEach(t=>{let n=t,r=dt(n.dataset.upgradeReady,e.state);Number(n.dataset.last)!==r&&(n.dataset.last=String(r),n.textContent=String(r),n.classList.toggle(`on`,r>0))})}function Kt(e,t,n){let r=i.get(n);if(!r)return;let a=t.querySelector(`[data-card="${n}"]`);if(!a)return;let o=document.createElement(`template`);o.innerHTML=It(e,r).trim();let s=o.content.firstElementChild;s&&a.replaceWith(s)}function qt(e,t){let n=e.state.industries[t],r=!!n?.unlocked,i=(n?.count??0)===0,a=Fe(e.state,t,e.buyQty),o=!!e.state.industries[t]?.unlocked,s=(e.state.industries[t]?.count??0)>0;return{bought:a,unlockChanged:r!==o||i&&s}}function Jt(e,t,n){let r=n.dataset,a=r.manager??r.employee??r.pause??r.fireManager??r.fireEmployee,o=i.get(a);if(!o)return;let s=j(o.category),c=()=>{He(e.state),Kt(e,t,a)};if(r.manager!==void 0){Ie(e.state,a)&&c();return}if(r.employee!==void 0){Me(e.state,a)&&c();return}if(r.pause!==void 0){let t=ye(e.state,a);e.notify(`${o.name} ${t?`paused`:`resumed`}`,{color:s}),c();return}let l=r.fireManager!==void 0;if(!n.classList.contains(`confirm`)){let r=l?me(o,e.state):he(o,e.state);n.classList.add(`confirm`),n.innerHTML=`${N(`fire`,{size:11})} Pay ${O(r)}?`,setTimeout(()=>{n.isConnected&&Kt(e,t,a)},3500);return}let u=l?ge(e.state,a):_e(e.state,a);e.notify(`${N(`fire`,{size:12})} ${l?`Manager`:`Employee`} fired at ${o.name} · severance ${O(u)}`,{color:s}),c()}function Yt(e,t){t.querySelector(`#main`).addEventListener(`click`,n=>{let r=n.target,o=r.closest(`[data-buy]`);if(o){n.stopPropagation();let r=o.dataset.buy,i=qt(e,r);i.bought>0&&(He(e.state),i.unlockChanged?yt(e,t):Kt(e,t,r),t.querySelector(`[data-card="${r}"]`)?.classList.add(`flash`));return}let s=r.closest(`[data-manager],[data-employee],[data-pause],[data-fire-manager],[data-fire-employee]`);if(s){n.stopPropagation(),Jt(e,t,s);return}let c=r.closest(`[data-upgrade]`);if(c){let n=c.dataset.upgrade;if(Le(e.state,n)){let r=a.get(n),o=r&&ct(r)?i.get(r.industryId):void 0;e.notify(`${N(`bolt`,{size:12})} ${r?.name??`Upgrade`} purchased`,{color:j(o?.category??r?.category)}),He(e.state),yt(e,t)}return}let l=r.closest(`[data-start]`);if(l){n.stopPropagation();let r=l.dataset.start;Re(e.state,r)&&Kt(e,t,r);return}})}var Xt=[];function Zt(e,t){let n={ts:Date.now(),msg:e,color:t?.color};for(let e of Xt)e(n)}function Qt(e){Xt.push(e)}var $t=10,en=7,I=`#1a1108`,L=`#5a3a26`,R=`#3a2516`,z=`#9aa4b2`,B=`#5d6570`,V=`#0c1015`,tn=e=>e.startsWith(`#`)||e.startsWith(`rgb`)?`fill="${e}"`:`class="${e}"`,H=(e,t,n,r,i=`b-wall-side`)=>`<path d="M${e+n} ${t} l${$t} ${-en} v${r} l${-$t} ${en} Z" ${tn(i)} stroke="${I}" stroke-width=".6"/>`,nn=(e,t,n,r)=>`<path d="M${e} ${t} h${n} l${$t} ${-en} h${-n} Z" ${tn(r)} stroke="${I}" stroke-width=".6"/>`,rn=(e,t,n,r,i=`b-wall`,a=``)=>`<rect x="${e}" y="${t}" width="${n}" height="${r}" ${tn(i)} stroke="${I}" stroke-width="1" ${a}/>`,U=(e,t,n,r,i=`b-wall`,a=`b-wall-side`,o=`b-trim`)=>nn(e,t,n,o)+H(e,t,n,r,a)+rn(e,t,n,r,i),W=(e,t,n,r,i=!0)=>`<rect x="${e}" y="${t}" width="${n}" height="${r}" rx="1.5" fill="${V}" stroke="${I}" stroke-width="1"/>
   <rect class="b-glass lit" x="${e+1}" y="${t+1}" width="${n-2}" height="${r-2}" rx="1"/>
   ${i?`<path d="M${e+n/2} ${t+1} v${r-2} M${e+1} ${t+r/2} h${n-2}" stroke="rgba(0,0,0,.35)" stroke-width="1"/>`:``}
   <path d="M${e+1} ${t+1} h${n*.45} L${e+1} ${t+r*.55} Z" fill="rgba(255,255,255,.35)"/>`,G=(e,t,n,r,i=!0)=>`<rect x="${e}" y="${t}" width="${n}" height="${r}" fill="#0a0c10"/>
   <g class="door-leaf">
     <rect x="${e}" y="${t}" width="${n}" height="${r}" rx="1.5" fill="${L}" stroke="${I}" stroke-width="1"/>
     <rect x="${e+1.5}" y="${t+1.5}" width="${n-3}" height="${r-3}" fill="none" stroke="${R}" stroke-width="1"/>
     ${i?`<rect class="b-glass lit" x="${e+n/2-5}" y="${t+4}" width="10" height="10" rx="1.5" stroke="${I}" stroke-width=".8"/>`:``}
     <circle cx="${e+3}" cy="${t+r-9}" r="1.5" fill="#ffd166"/>
   </g>`,K=(e,t,n,r=9,i=``,a=!1)=>`<text class="b-sign${a?` lit`:``}" x="${e}" y="${t}" font-size="${r}"${i?` style="fill:${i}"`:``}>${n}</text>`,an=(e,t,n,r)=>{let i=``;for(let a=0,o=e;o<e+n;a++,o+=10)i+=`<rect x="${o}" y="${t}" width="${Math.min(10,e+n-o)}" height="${r}" class="${a%2?`b-awning-b`:`b-awning-a`}"/>`;let a=`M${e} ${t+r}`;for(let t=e;t<e+n;t+=8)a+=` q4 6 8 0`;return`${H(e,t,n,r,`b-trim`)}${i}
   <path d="${a}" class="b-awning-a" stroke="${I}" stroke-width=".6"/>
   <rect x="${e}" y="${t}" width="${n}" height="${r}" fill="none" stroke="${I}" stroke-width="1"/>`},on=(e,t,n=11,r=18)=>`<g class="shop-chimney">
     ${H(e,t,n,r,`#1d120b`)}
     <rect x="${e}" y="${t}" width="${n}" height="${r}" fill="#4a3324" stroke="${I}" stroke-width="1"/>
     <path d="M${e} ${t+4} h${n} M${e} ${t+8} h${n} M${e} ${t+12} h${n}" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
     <rect x="${e-2}" y="${t-3}" width="${n+4}" height="4" fill="${I}"/>
   </g>`,q=(e,t,n,r=6)=>`${H(e,t,n,r,`#1c2027`)}<rect x="${e}" y="${t}" width="${n}" height="${r}" fill="#3a4250" stroke="${I}" stroke-width=".8"/>
   <rect x="${e}" y="${t}" width="${n}" height="2" fill="#5a6472"/>`,J=(e,t,n,r)=>`<rect class="glow-flash" x="${e}" y="${t}" width="${n}" height="${r}" rx="2"/>`,Y=(e,t,n)=>`<svg class="shop-svg" width="${e}" height="${t}" viewBox="0 0 ${e} ${t}" aria-hidden="true">${n}</svg>`,sn={w:96,h:118,display:{x:32,y:76,size:28},svg:Y(96,118,`
    ${on(22,2)}
    ${nn(0,14,86,`#b87862`)}${H(0,14,86,14,`#3e2018`)}
    <rect x="0" y="14" width="86" height="14" fill="#6a3828" stroke="${I}" stroke-width="1"/>
    ${U(4,50,78,62)}
    ${an(1,30,84,16)}
    ${K(43,42,`SHOP`)}
    <g class="shop-window">${W(10,56,44,40)}${J(10,56,44,40)}</g>
    <g class="shop-door">${G(58,72,20,40)}</g>
    ${q(2,112,84)}
  `)},cn={lemonade:{w:72,h:80,display:{x:31,y:37,size:18},signY:20,svg:Y(72,80,`
      <g class="shop-chimney"><circle cx="31" cy="5" r="2.5" fill="#ffd166" stroke="${I}" stroke-width=".8"/></g>
      <rect x="30" y="6" width="2" height="44" fill="${B}"/>
      <path d="M2 20 Q31 -4 60 20 Z" class="b-awning-a" stroke="${I}" stroke-width="1"/>
      <path d="M9 17 Q31 2 53 17 Z" class="b-awning-b"/>
      <path d="M2 20 q5 6 10 0 q5 6 10 0 q5 6 10 0 q4 6 9 0 q5 6 10 0 q4 6 9 0" class="b-awning-a" stroke="${I}" stroke-width=".8"/>
      <rect x="10" y="53" width="3" height="27" fill="${R}"/><rect x="49" y="53" width="3" height="27" fill="${R}"/>
      ${nn(6,48,50,`#e9d9b8`)}${H(6,48,50,5,`#8a6a44`)}
      <rect x="6" y="48" width="50" height="5" fill="#c9a874" stroke="${I}" stroke-width="1"/>
      <rect x="7" y="53" width="48" height="20" class="b-awning-a" stroke="${I}" stroke-width="1"/>
      <path d="M15 53 v20 M23 53 v20 M31 53 v20 M39 53 v20 M47 53 v20" class="b-awning-b" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
      <rect x="9" y="58" width="44" height="11" rx="1" fill="#f6ecd2" stroke="${I}" stroke-width=".8"/>
      ${K(31,66.5,`LEMONADE`,7.5,`#3a2516`)}
      <g class="shop-window">
        <path d="M13 36 h11 l-1 12 h-9 Z" fill="#fff6c7" stroke="${I}" stroke-width=".9"/>
        <path d="M14 40 h9 l-.7 7.5 h-7.6 Z" class="b-glass lit"/>
        <path d="M24 38 q5 1 4 6 q0 2 -3 2" fill="none" stroke="${I}" stroke-width="1"/>
        <circle cx="18" cy="42" r="2" fill="#ffe36b" stroke="${I}" stroke-width=".5"/>
        ${J(12,35,14,14)}
      </g>
      <rect x="39" y="41" width="5" height="7" fill="#fff1b0" stroke="${I}" stroke-width=".7"/>
      <rect x="46" y="41" width="5" height="7" fill="#fff1b0" stroke="${I}" stroke-width=".7"/>
      <g class="shop-door"><rect x="6" y="47" width="50" height="7" fill="none"/></g>
      <rect x="0" y="74" width="10" height="6" fill="${L}" stroke="${I}" stroke-width=".8"/>
      <circle cx="3" cy="77" r="1.2" fill="#ffe36b"/><circle cx="7" cy="77" r="1.2" fill="#ffe36b"/>
    `)},pizza:{w:96,h:112,display:{x:29,y:73,size:26},svg:Y(96,112,`
      ${on(60,0,12,20)}
      ${U(0,18,86,12,`#7a3b2e`,`#4a2018`,`#a0503e`)}
      ${U(4,30,78,76)}
      <rect x="8" y="33" width="70" height="13" rx="1.5" fill="#1a1108" stroke="${I}" stroke-width="1"/>
      ${K(43,43.5,`PIZZA`,10,`#ff7b6b`,!0)}
      ${H(2,48,82,12,`#8a2820`)}
      ${Array.from({length:16},(e,t)=>`<rect x="${2+t%8*10.25}" y="${48+Math.floor(t/8)*6}" width="10.25" height="6" fill="${(t+Math.floor(t/8))%2?`#f4f1ea`:`#e74c3c`}"/>`).join(``)}
      <path d="M2 60 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q6 5 12 0" fill="#e74c3c" stroke="${I}" stroke-width=".7"/>
      <rect x="2" y="48" width="82" height="12" fill="none" stroke="${I}" stroke-width="1"/>
      <g class="shop-window">${W(8,66,42,30,!1)}${J(8,66,42,30)}</g>
      <g class="shop-door">${G(58,66,20,40)}</g>
      <path d="M8 96 h42" stroke="#c9a874" stroke-width="2"/>
      ${q(2,106,84)}
      <circle cx="12" cy="107" r="4" fill="#222" stroke="${I}" stroke-width="1"/><circle cx="12" cy="107" r="1.5" fill="#888"/>
      <circle cx="28" cy="107" r="4" fill="#222" stroke="${I}" stroke-width="1"/><circle cx="28" cy="107" r="1.5" fill="#888"/>
      <path d="M12 103 l4 -6 h8 l2 3 h4 v4 M14 97 l3 -5 h4" fill="#e74c3c" stroke="${I}" stroke-width="1" stroke-linejoin="round"/>
      <rect x="18" y="90" width="7" height="6" rx="1" fill="#e74c3c" stroke="${I}" stroke-width=".8"/>
    `)},shrimp:{w:128,h:96,display:{x:74,y:40,size:22},signY:40,svg:Y(128,96,`
      <rect x="0" y="82" width="128" height="14" fill="#1f4e79"/>
      <path d="M0 86 q6 -3 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 M0 91 q6 -3 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
      <rect x="6" y="80" width="4" height="16" fill="${R}"/><rect x="26" y="80" width="4" height="16" fill="${R}"/><rect x="46" y="80" width="4" height="16" fill="${R}"/>
      ${H(0,76,52,6,R)}<rect x="0" y="76" width="52" height="6" fill="${L}" stroke="${I}" stroke-width="1"/>
      <path d="M8 76 v6 M16 76 v6 M24 76 v6 M32 76 v6 M40 76 v6 M48 76 v6" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
      <circle cx="8" cy="72" r="3" fill="#e74c3c" stroke="${I}" stroke-width=".8"/><rect x="7" y="66" width="2" height="4" fill="${R}"/>
      <rect x="69" y="8" width="3" height="60" fill="${R}"/>
      <path d="M72 12 L104 24" stroke="${R}" stroke-width="2.5"/>
      <path d="M72 14 L98 58 M78 12 L104 50 M84 14 L106 46 M90 16 L108 44 M96 18 L108 40 M72 24 L88 22 M74 34 L96 30 M76 44 L102 38 M80 54 L104 46" stroke="rgba(230,230,230,.55)" stroke-width=".7"/>
      <path d="M72 14 L108 44 L98 58 Z" fill="rgba(200,220,235,.12)" stroke="rgba(230,230,230,.5)" stroke-width=".8"/>
      <g class="shop-chimney"><rect x="98" y="28" width="9" height="16" fill="#3a3f47" stroke="${I}" stroke-width="1"/><rect x="97" y="27" width="11" height="3" fill="${I}"/><rect x="98" y="34" width="9" height="3" fill="#e74c3c"/></g>
      ${U(88,44,24,22,`b-wall`,`b-wall-side`,`#dfe6ee`)}
      <g class="shop-window">${W(92,48,16,12,!1)}${J(92,48,16,12)}</g>
      <path d="M54 66 L118 66 L112 88 L60 88 Z" class="b-trim" stroke="${I}" stroke-width="1"/>
      <path d="M118 66 l10 -7 v10 l-4 5 Z" class="b-wall-side" stroke="${I}" stroke-width=".8"/>
      <path d="M55 70 L117 70 L116 74 L56 74 Z" class="b-awning-a"/>
      <rect x="82" y="60" width="30" height="6" fill="#dfe6ee" stroke="${I}" stroke-width=".8"/>
      <path d="M58 88 L112 88 L110 92 L62 92 Z" fill="#0d2233"/>
      ${K(86,83,`SHRIMP`,8)}
      <g class="shop-door"><path d="M48 78 L66 70 L68 74 L50 82 Z" fill="${L}" stroke="${I}" stroke-width="1"/><path d="M52 78 l3 -1.5 M56 76 l3 -1.5 M60 74 l3 -1.5" stroke="rgba(0,0,0,.4)" stroke-width="1"/></g>
      <circle cx="62" cy="78" r="2.5" fill="#ffd166" stroke="${I}" stroke-width=".6"/>
    `)},shoeshine:{w:76,h:84,display:{x:18,y:36,size:20},signY:22,svg:Y(76,84,`
      <g class="shop-chimney"><circle cx="61" cy="4" r="3" fill="#ffd166" stroke="${I}" stroke-width=".8"/></g>
      <rect x="59" y="6" width="4" height="58" fill="${B}" stroke="${I}" stroke-width=".8"/>
      <g class="shop-window">
        ${H(34,8,30,16,`b-wall-side`)}<rect x="34" y="8" width="30" height="16" rx="1" class="b-trim" stroke="${I}" stroke-width="1"/>
        <rect x="36" y="10" width="26" height="12" fill="none" stroke="#ffd166" stroke-width=".8"/>
        ${K(49,19.5,`SHINE`,8,`#ffd166`)}
        ${J(34,8,30,16)}
      </g>
      ${U(4,64,58,20,L,R,`#8a6a44`)}
      <path d="M4 70 h58 M4 76 h58" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
      <rect x="46" y="16" width="8" height="26" rx="2" fill="#3a2a2a" stroke="${I}" stroke-width="1"/>
      <rect x="28" y="40" width="26" height="7" rx="2" fill="#4a3535" stroke="${I}" stroke-width="1"/>
      <path d="M31 47 v17 M51 47 v17" stroke="${B}" stroke-width="3"/>
      <rect x="26" y="34" width="6" height="8" rx="1.5" fill="#3a2a2a" stroke="${I}" stroke-width=".8"/>
      <rect x="12" y="54" width="12" height="4" rx="1" fill="#ffd166" stroke="${I}" stroke-width=".8"/>
      <rect x="14" y="58" width="8" height="6" fill="${B}"/>
      <rect x="4" y="52" width="14" height="12" fill="${L}" stroke="${I}" stroke-width="1"/>
      <rect x="6" y="46" width="3" height="7" fill="#8a2820"/><rect x="11" y="45" width="3" height="8" fill="#2a4a8a"/>
      <rect x="4" y="52" width="14" height="2" fill="${R}"/>
      <g class="shop-door">${q(4,76,24,8)}</g>
    `)},barbershop:{w:96,h:112,display:{x:41,y:72,size:24},svg:Y(96,112,`
      ${on(64,0)}
      ${U(0,14,86,12,`#5a4a60`,`#2e2432`,`#8a7a90`)}
      ${U(4,26,78,80)}
      ${an(1,28,84,14)}
      ${K(43,39,`BARBER`)}
      <rect x="20" y="52" width="42" height="40" rx="1.5" fill="${V}" stroke="${I}" stroke-width="1"/>
      <g class="shop-window"><rect class="b-glass lit" x="21" y="53" width="40" height="38"/>
        <path d="M30 78 h14 v6 h-14 Z M40 62 h6 v16 h-6 Z M33 84 v6 M41 84 v6" fill="rgba(0,0,0,.35)" stroke="rgba(0,0,0,.4)" stroke-width="1"/>
        <path d="M21 53 h18 L21 74 Z" fill="rgba(255,255,255,.3)"/>
        ${J(20,52,42,40)}
      </g>
      <rect x="6" y="50" width="10" height="4" rx="1" fill="#ffd166" stroke="${I}" stroke-width=".8"/>
      <rect x="6" y="88" width="10" height="4" rx="1" fill="#ffd166" stroke="${I}" stroke-width=".8"/>
      <rect x="7" y="54" width="8" height="34" fill="#f4f1ea" stroke="${I}" stroke-width="1"/>
      <path d="M7 58 l8 -4 M7 66 l8 -4 M7 74 l8 -4 M7 82 l8 -4" stroke="#e74c3c" stroke-width="2.5"/>
      <path d="M7 62 l8 -4 M7 70 l8 -4 M7 78 l8 -4 M7 86 l8 -4" stroke="#2a4a8a" stroke-width="2.5"/>
      <rect x="7" y="54" width="8" height="34" fill="none" stroke="${I}" stroke-width="1"/>
      <g class="shop-door">${G(64,66,16,40)}</g>
      ${q(2,106,84)}
    `)},tailor:{w:92,h:112,display:{x:29,y:70,size:22},svg:Y(92,112,`
      ${on(58,0)}
      ${U(0,14,82,12,`#3a2c44`,`#20182a`,`#6a5a78`)}
      ${U(4,26,74,80)}
      ${H(2,28,78,14,`b-trim`)}<rect x="2" y="28" width="78" height="14" class="b-trim" stroke="${I}" stroke-width="1"/>
      <rect x="4" y="30" width="74" height="10" fill="none" stroke="#e8d8a8" stroke-width=".8"/>
      ${K(41,38.5,`TAILOR`,9,`#f2e6c8`)}
      ${nn(6,50,46,`b-trim`)}${H(6,50,46,44)}
      <rect x="6" y="50" width="46" height="4" class="b-trim" stroke="${I}" stroke-width="1"/>
      <rect x="6" y="54" width="46" height="40" rx="1" fill="${V}" stroke="${I}" stroke-width="1"/>
      <g class="shop-window"><rect class="b-glass lit" x="7" y="55" width="44" height="38"/>
        <path d="M38 62 q6 0 6 8 l-2 10 h-8 l-2 -10 q0 -8 6 -8 Z" fill="#4a2e5a" stroke="${I}" stroke-width=".8"/>
        <rect x="40" y="58" width="2" height="4" fill="${I}"/><rect x="37" y="80" width="4" height="10" fill="${I}"/><rect x="33" y="90" width="12" height="2" fill="${I}"/>
        <path d="M7 55 h16 L7 74 Z" fill="rgba(255,255,255,.3)"/>
        ${J(6,54,46,40)}
      </g>
      <rect x="6" y="94" width="46" height="4" class="b-trim" stroke="${I}" stroke-width=".8"/>
      <rect x="10" y="98" width="5" height="5" fill="#e74c3c"/><rect x="18" y="98" width="5" height="5" fill="#3498db"/><rect x="26" y="98" width="5" height="5" fill="#f1c40f"/>
      <g class="shop-door">${G(58,66,18,40)}</g>
      ${q(2,106,80)}
    `)},garden:{w:110,h:74,display:{x:60,y:28,size:20},signY:18,svg:Y(110,74,`
      <path d="M0 40 h72 M0 50 h72" stroke="${L}" stroke-width="3"/>
      ${Array.from({length:10},(e,t)=>`<path d="M${2+t*7.5} 56 v-20 l2 -3 l2 3 v20 Z" fill="#c9a874" stroke="${I}" stroke-width=".7"/>`).join(``)}
      <rect x="0" y="52" width="72" height="22" fill="#5a3a1f" stroke="${I}" stroke-width="1"/>
      <path d="M0 59 h72 M0 66 h72" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
      ${[56,63,70].map(e=>Array.from({length:6},(t,n)=>`<path d="M${6+n*11} ${e} l-2 -5 m2 5 l0 -6 m0 6 l2 -5" stroke="#6ab04c" stroke-width="1.6" stroke-linecap="round"/><circle cx="${6+n*11}" cy="${e}" r="1.4" fill="#e67e22"/>`).join(``)).join(``)}
      <rect x="8" y="42" width="44" height="11" fill="${L}" stroke="${I}" stroke-width="1"/>
      ${K(30,50.5,`GARDEN`,8,`#f2e6c8`)}
      <rect x="59" y="34" width="2" height="18" fill="${R}"/>
      <path d="M58 46 h12 v10 h-12 Z M60 46 l2 -4 h8 M70 50 l6 -6" fill="${z}" stroke="${I}" stroke-width=".9"/>
      <g class="shop-chimney"><rect x="84" y="8" width="4" height="8" fill="${B}" stroke="${I}" stroke-width=".7"/><path d="M80 10 h12" stroke="${B}" stroke-width="1.5"/></g>
      ${U(72,26,28,44)}
      <path d="M70 26 h32 l-16 -12 Z" class="b-trim" stroke="${I}" stroke-width="1"/>
      <path d="M102 26 l10 -7 l-16 -12 l-10 7 Z" class="b-wall-side" stroke="${I}" stroke-width=".8"/>
      <g class="shop-window">${W(74,34,8,8,!1)}${J(74,34,8,8)}</g>
      <g class="shop-door">${G(80,44,12,26)}</g>
      <rect x="70" y="70" width="34" height="4" fill="#3a4250" stroke="${I}" stroke-width=".8"/>
    `)},farm:{w:120,h:112,display:{x:14,y:78,size:22},svg:Y(120,112,`
      <g class="shop-chimney"><path d="M86 16 q10 -12 20 0 Z" fill="#c8ced6" stroke="${I}" stroke-width="1"/><rect x="94" y="4" width="4" height="8" fill="${B}"/></g>
      <rect x="86" y="16" width="20" height="90" fill="${z}" stroke="${I}" stroke-width="1"/>
      <path d="M106 16 l10 -7 v90 l-10 7 Z" fill="${B}" stroke="${I}" stroke-width=".8"/>
      <path d="M86 34 h20 M86 52 h20 M86 70 h20 M86 88 h20" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/>
      <rect x="86" y="42" width="20" height="5" class="b-awning-a"/>
      <path d="M80 30 l10 -7 v78 l-10 5 Z" fill="#6a1f16" stroke="${I}" stroke-width=".8"/>
      <rect x="0" y="30" width="80" height="76" fill="#b03a2e" stroke="${I}" stroke-width="1"/>
      <path d="M0 30 L10 16 L40 6 L70 16 L80 30 Z" fill="#6a3828" stroke="${I}" stroke-width="1"/>
      <path d="M80 30 l10 -7 l-10 -14 l-30 -10 l-10 7 l30 10 Z" fill="#3e2018" stroke="${I}" stroke-width=".8"/>
      <path d="M0 30 h80 M10 16 h60" stroke="#f4f1ea" stroke-width="2"/>
      <rect x="32" y="17" width="16" height="13" fill="#3a1f12" stroke="#f4f1ea" stroke-width="1.5"/>
      <path d="M32 17 l16 13 M48 17 l-16 13" stroke="#f4f1ea" stroke-width="1.2"/>
      <rect x="18" y="46" width="44" height="11" fill="#f4f1ea" stroke="${I}" stroke-width="1"/>
      ${K(40,54.5,`FARM`,8,`#b03a2e`)}
      <g class="shop-window">${W(6,34,12,12)}${J(6,34,12,12)}</g>
      <rect x="22" y="60" width="36" height="46" fill="#3a1f12"/>
      <g class="shop-door"><g class="door-leaf">
        <rect x="22" y="60" width="36" height="46" fill="#8a2820" stroke="#f4f1ea" stroke-width="2"/>
        <path d="M22 60 l36 46 M58 60 l-36 46" stroke="#f4f1ea" stroke-width="2"/>
        <rect x="22" y="82" width="36" height="2" fill="#f4f1ea"/>
      </g></g>
      <rect x="60" y="90" width="18" height="16" rx="2" fill="#e3c060" stroke="${I}" stroke-width="1"/>
      <path d="M60 95 h18 M60 100 h18 M69 90 v16" stroke="rgba(0,0,0,.3)" stroke-width="1"/>
      ${q(0,106,80)}
    `)},cattle:{w:128,h:92,display:{x:62,y:48,size:20},signY:34,svg:Y(128,92,`
      <g class="shop-chimney"><circle cx="20" cy="12" r="10" fill="none" stroke="#c8ced6" stroke-width="1.5"/><path d="M20 2 v20 M10 12 h20 M13 5 l14 14 M27 5 l-14 14" stroke="#c8ced6" stroke-width="2"/><circle cx="20" cy="12" r="2" fill="${I}"/></g>
      <path d="M14 60 L20 14 L26 60 Z M12 60 h16" fill="none" stroke="${B}" stroke-width="2"/>
      <path d="M16 46 h8 M15 34 h10 M18 24 h4" stroke="${B}" stroke-width="1.5"/>
      ${[0,80].map(e=>`<rect x="${e+2}" y="56" width="4" height="36" fill="${R}"/><rect x="${e+22}" y="56" width="4" height="36" fill="${R}"/><rect x="${e+40}" y="56" width="4" height="36" fill="${R}"/><rect x="${e}" y="62" width="44" height="4" fill="${L}" stroke="${I}" stroke-width=".8"/><rect x="${e}" y="76" width="44" height="4" fill="${L}" stroke="${I}" stroke-width=".8"/>`).join(``)}
      <path d="M96 66 h20 v-2 h4 l-2 -8 h-24 Z" fill="#c8a06a" stroke="${I}" stroke-width=".8"/>
      <ellipse cx="102" cy="52" rx="14" ry="8" fill="#f4f1ea" stroke="${I}" stroke-width="1"/>
      <path d="M92 50 q4 -4 8 0 q-2 5 -8 3 Z M106 54 q5 -3 8 1 q-3 4 -8 2 Z" fill="#1a1a1a"/>
      <rect x="92" y="58" width="3" height="8" fill="#f4f1ea" stroke="${I}" stroke-width=".7"/><rect x="108" y="58" width="3" height="8" fill="#f4f1ea" stroke="${I}" stroke-width=".7"/>
      <path d="M114 50 h7 v7 h-7 Z" fill="#f4f1ea" stroke="${I}" stroke-width="1"/><circle cx="119" cy="53" r=".9" fill="${I}"/><path d="M114 50 l-2 -3 M121 50 l2 -3" stroke="${I}" stroke-width="1.2"/>
      <rect x="44" y="30" width="6" height="62" fill="${L}" stroke="${I}" stroke-width="1"/><rect x="74" y="30" width="6" height="62" fill="${L}" stroke="${I}" stroke-width="1"/>
      <g class="shop-window">${H(40,22,44,12,R)}<rect x="40" y="22" width="44" height="12" fill="${L}" stroke="${I}" stroke-width="1"/>${K(62,31.5,`RANCH`,9,`#f2e6c8`)}${J(40,22,44,12)}</g>
      <path d="M52 20 l10 -6 l10 6" fill="none" stroke="${L}" stroke-width="3"/>
      <g class="shop-door"><rect x="50" y="34" width="24" height="58" fill="none"/><g class="door-leaf"><rect x="50" y="70" width="24" height="3" fill="${L}" stroke="${I}" stroke-width=".7"/><rect x="50" y="80" width="24" height="3" fill="${L}" stroke="${I}" stroke-width=".7"/><path d="M52 70 l20 13" stroke="${L}" stroke-width="2"/><rect x="72" y="66" width="3" height="20" fill="${R}"/></g></g>
      <rect x="0" y="88" width="128" height="4" fill="#5a3a1f"/>
    `)},firstaid:{w:70,h:90,display:{x:30,y:50,size:18},signY:30,svg:Y(70,90,`
      <g class="shop-chimney"><path d="M26 4 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6 Z" fill="#e63946" stroke="${I}" stroke-width="1"/></g>
      ${U(4,24,52,6,`#e63946`,`#8a1c22`,`#ff7078`)}
      ${U(4,30,52,54,`#eef2f5`,`#b8c0c8`,`#f6f8fa`)}
      <g class="shop-window">${W(10,36,40,26,!1)}${J(10,36,40,26)}</g>
      <g class="shop-door"><rect x="8" y="62" width="44" height="4" fill="${z}" stroke="${I}" stroke-width=".8"/></g>
      <rect x="4" y="68" width="52" height="12" fill="#e63946" stroke="${I}" stroke-width="1"/>
      ${K(30,76.5,`FIRST AID`,6)}
      <path d="M8 74 h4 M10 72 v4" stroke="#fff" stroke-width="1.5"/><path d="M48 74 h4 M50 72 v4" stroke="#fff" stroke-width="1.5"/>
      ${q(2,84,56)}
    `)},dental:{w:96,h:108,display:{x:28,y:70,size:24},svg:Y(96,108,`
      <g class="shop-chimney"><rect x="62" y="6" width="12" height="8" fill="${z}" stroke="${I}" stroke-width=".8"/><path d="M64 6 v-3 M68 6 v-3 M72 6 v-3" stroke="${B}" stroke-width="1.2"/></g>
      ${U(0,14,86,8,`#bfe6dd`,`#7fa8a0`,`#dff4ef`)}
      ${U(4,22,78,80,`#e8f4f2`,`#b5cdc9`,`#f4faf8`)}
      ${H(8,26,70,18,`b-trim`)}<rect x="8" y="26" width="70" height="18" rx="2" class="b-trim" stroke="${I}" stroke-width="1"/>
      <path d="M16 31 q2 -3 4 0 q2 -3 4 0 v5 l-2 4 l-2 -3 l-2 3 l-2 -4 Z" fill="#fff" stroke="${I}" stroke-width=".6"/>
      ${K(50,39,`DENTAL`,9)}
      <g class="shop-window">${W(8,50,40,40,!1)}<path d="M9 56 h38 M9 62 h38 M9 68 h38 M9 74 h38 M9 80 h38" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>${J(8,50,40,40)}</g>
      <g class="shop-door"><rect x="56" y="62" width="20" height="40" fill="#0a0c10"/><g class="door-leaf">
        <rect x="56" y="62" width="20" height="40" fill="${B}" stroke="${I}" stroke-width="1"/>
        <rect class="b-glass lit" x="58" y="64" width="16" height="36"/>
        <rect x="59" y="78" width="2" height="8" rx="1" fill="${z}"/>
      </g></g>
      <rect x="0" y="90" width="9" height="12" rx="1" fill="#8a6a44" stroke="${I}" stroke-width=".8"/>
      <path d="M2 90 q2 -8 4 -2 q1 -8 3 0" fill="none" stroke="#3aa860" stroke-width="2" stroke-linecap="round"/>
      ${q(2,102,80)}
    `)},urgent:{w:104,h:110,display:{x:27,y:86,size:26},svg:Y(104,110,`
      <g class="shop-chimney"><rect x="42" y="18" width="10" height="4" fill="${B}"/><path d="M44 4 h6 v4 h4 v6 h-4 v4 h-6 v-4 h-4 v-6 h4 Z" fill="#e63946" stroke="${I}" stroke-width="1"/></g>
      ${U(0,22,94,82,`#dfe6ee`,`#98a4b0`,`#f2f6fa`)}
      <rect x="0" y="28" width="94" height="14" class="b-awning-a" stroke="${I}" stroke-width="1"/>
      ${K(47,38.5,`URGENT CARE`,8)}
      <rect x="4" y="60" width="46" height="4" class="b-trim" stroke="${I}" stroke-width=".8"/>
      <rect x="6" y="64" width="42" height="40" fill="#0d1218" stroke="${I}" stroke-width="1"/>
      <path d="M6 64 h42 l-3 4 h-36 Z" fill="rgba(255,255,255,.06)"/>
      <g class="shop-window">${W(56,46,32,12,!1)}${J(56,46,32,12)}</g>
      <g class="shop-door"><rect x="56" y="64" width="32" height="40" fill="#0a0c10"/>
        <rect class="b-glass lit" x="73" y="66" width="13" height="36"/>
        <g class="door-leaf"><rect x="56" y="64" width="17" height="40" fill="${B}" stroke="${I}" stroke-width="1"/><rect class="b-glass lit" x="58" y="66" width="13" height="36"/></g>
        <rect x="56" y="64" width="32" height="40" fill="none" stroke="${I}" stroke-width="1"/>
      </g>
      <rect x="54" y="60" width="36" height="4" class="b-trim" stroke="${I}" stroke-width=".8"/>
      ${q(2,104,92)}
    `)},checkcash:{w:90,h:108,display:{x:48,y:91,size:18},svg:Y(90,108,`
      <g class="shop-chimney"><rect x="56" y="8" width="8" height="10" fill="${B}" stroke="${I}" stroke-width=".8"/><rect x="54" y="6" width="12" height="3" fill="${z}"/></g>
      ${U(0,18,80,10,`#1f4d3a`,`#0f2a1f`,`#2e6b52`)}
      ${U(4,28,72,74)}
      ${H(2,30,76,14,`b-trim`)}<rect x="2" y="30" width="76" height="14" class="b-trim" stroke="${I}" stroke-width="1"/>
      ${K(40,40.5,`$ CHECKS $`,8,`#ffd166`,!0)}
      <g class="shop-window">${W(6,52,24,28,!1)}${J(6,52,24,28)}</g>
      ${W(36,52,24,28,!1)}
      <path d="M11 52 v28 M16 52 v28 M21 52 v28 M26 52 v28 M41 52 v28 M46 52 v28 M51 52 v28 M56 52 v28" stroke="${B}" stroke-width="1.5"/>
      <rect x="5" y="50" width="26" height="14" fill="${z}" stroke="${I}" stroke-width="1"/>
      <path d="M5 53 h26 M5 56 h26 M5 59 h26 M5 62 h26" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
      <g class="shop-door">${G(64,64,14,38)}</g>
      <path d="M67 68 v10 M71 68 v10 M75 68 v10" stroke="${B}" stroke-width="1.2"/>
      ${q(2,102,76)}
    `)},hedgefund:{w:80,h:120,display:{x:36,y:79,size:18},svg:Y(80,120,`
      <g class="shop-chimney"><rect x="35" y="2" width="2" height="12" fill="${z}"/><circle cx="36" cy="2" r="1.5" fill="#ff4d4d"/></g>
      ${U(2,14,68,100,`b-wall`,`b-wall-side`,`#dfe6ee`)}
      <rect x="2" y="14" width="68" height="4" fill="${B}"/>
      ${[22,38,54].map(e=>[6,22,38,54].map((t,n)=>`<rect x="${t}" y="${e}" width="12" height="12" fill="${V}" stroke="${I}" stroke-width=".8"/><rect class="b-glass${(n+e)%3?` lit`:``}" x="${t+1}" y="${e+1}" width="10" height="10"/>`).join(``)).join(``)}
      <rect x="6" y="70" width="60" height="18" rx="1" class="b-trim" stroke="${I}" stroke-width="1"/>
      <g class="shop-window"><rect x="6" y="90" width="60" height="8" fill="#06090c" stroke="${I}" stroke-width=".8"/>
        ${K(36,96.5,`▲ +12.4%   ▲ +3.8%`,6,`#55efc4`,!0)}
        ${J(6,90,60,8)}
      </g>
      <g class="shop-door"><rect x="24" y="100" width="24" height="14" fill="#0a0c10"/><g class="door-leaf"><rect class="b-glass lit" x="25" y="101" width="22" height="12"/><path d="M36 101 v12" stroke="${z}" stroke-width="1.5"/></g>
        <rect x="24" y="100" width="24" height="14" rx="1" fill="none" stroke="${z}" stroke-width="1.5"/></g>
      ${q(0,114,72)}
    `)},insurance:{w:88,h:118,display:{x:39,y:52,size:20},svg:Y(88,118,`
      <g class="shop-chimney"><path d="M35 4 h8 v6 q0 4 -4 5 q-4 -1 -4 -5 Z" fill="#ffd166" stroke="${I}" stroke-width=".8"/></g>
      ${U(4,34,70,74)}
      <path d="M0 26 L39 10 L78 26 Z" fill="#d8d2c4" stroke="${I}" stroke-width="1"/>
      <path d="M78 26 l10 -7 L49 3 l-10 7 Z" fill="#a49c8c" stroke="${I}" stroke-width=".8"/>
      <path d="M6 24 L39 13 L72 24 Z" fill="#e8e2d4"/>
      ${U(0,26,78,8,`#c8c0b0`,`#8a8272`,`#e0dace`)}
      ${K(39,32.5,`INSURANCE`,7,`#3a3226`)}
      ${[6,24,48,66].map(e=>`<rect x="${e}" y="34" width="6" height="74" fill="#e8e2d4" stroke="${I}" stroke-width=".8"/><rect x="${e+4}" y="34" width="2" height="74" fill="rgba(0,0,0,.18)"/><rect x="${e-1}" y="34" width="8" height="3" fill="#c8c0b0" stroke="${I}" stroke-width=".6"/><rect x="${e-1}" y="104" width="8" height="4" fill="#c8c0b0" stroke="${I}" stroke-width=".6"/>`).join(``)}
      <g class="shop-window">${W(14,44,8,18,!1)}${J(14,44,8,18)}</g>
      ${W(56,44,8,18,!1)}
      <g class="shop-door"><rect x="32" y="70" width="20" height="38" fill="#0a0c10"/>
        <rect x="42" y="70" width="10" height="38" fill="#3a2516" stroke="${I}" stroke-width="1"/><circle cx="44" cy="90" r="1.2" fill="#ffd166"/>
        <g class="door-leaf"><rect x="32" y="70" width="10" height="38" fill="#3a2516" stroke="${I}" stroke-width="1"/><circle cx="40" cy="90" r="1.2" fill="#ffd166"/></g>
        <rect x="30" y="66" width="24" height="4" fill="#c8c0b0" stroke="${I}" stroke-width=".8"/>
      </g>
      <rect x="6" y="108" width="66" height="4" fill="#d8d2c4" stroke="${I}" stroke-width=".8"/>
      <rect x="2" y="112" width="74" height="3" fill="#c8c0b0" stroke="${I}" stroke-width=".8"/>
      <rect x="0" y="115" width="78" height="3" fill="#b0a898" stroke="${I}" stroke-width=".8"/>
    `)},arcade:{w:100,h:116,display:{x:77,y:54,size:20},svg:Y(100,116,`
      <g class="shop-chimney"><rect x="40" y="0" width="10" height="10" fill="${B}" stroke="${I}" stroke-width=".8"/></g>
      ${U(4,34,82,76)}
      ${H(0,10,90,24,`#0c0814`)}<rect x="0" y="10" width="90" height="24" fill="#14101c" stroke="${I}" stroke-width="1"/>
      ${Array.from({length:11},(e,t)=>`<circle class="lit" cx="${4+t*8.2}" cy="13" r="1.6" fill="#ffe36b"/><circle class="lit" cx="${4+t*8.2}" cy="31" r="1.6" fill="#ffe36b"/>`).join(``)}
      ${K(45,26.5,`ARCADE`,12,`#ff4fd8`,!0)}
      <rect x="6" y="42" width="56" height="54" rx="1.5" fill="${V}" stroke="${I}" stroke-width="1"/>
      <g class="shop-window"><rect x="7" y="43" width="54" height="52" fill="#1a1428"/>
        ${[10,28,46].map((e,t)=>`<path d="M${e} 90 v-30 l3 -6 h8 l3 6 v30 Z" fill="#2a2038" stroke="${I}" stroke-width=".8"/><rect class="lit" x="${e+2}" y="60" width="10" height="10" fill="${[`#55efc4`,`#ff7675`,`#74b9ff`][t]}"/><rect x="${e+2}" y="74" width="10" height="4" fill="#111"/>`).join(``)}
        <path d="M7 43 h20 L7 66 Z" fill="rgba(255,255,255,.12)"/>
        ${J(6,42,56,54)}
      </g>
      <g class="shop-door"><rect x="68" y="70" width="18" height="40" fill="#0a0c10"/>
        <rect x="77" y="70" width="9" height="40" fill="#2a2038" stroke="${I}" stroke-width="1"/><rect class="lit" x="79" y="74" width="5" height="14" fill="#ff4fd8" opacity=".8"/>
        <g class="door-leaf"><rect x="68" y="70" width="9" height="40" fill="#2a2038" stroke="${I}" stroke-width="1"/><rect class="lit" x="70" y="74" width="5" height="14" fill="#ff4fd8" opacity=".8"/></g>
      </g>
      ${q(2,110,86)}
    `)},nightclub:{w:100,h:116,display:{x:68,y:50,size:22},svg:Y(100,116,`
      <g class="shop-chimney"><rect x="40" y="0" width="10" height="10" fill="${B}" stroke="${I}" stroke-width=".8"/></g>
      ${U(4,30,82,80,`#141018`,`#0a080c`,`#2a2232`)}
      ${H(0,10,90,20,`#0c0814`)}<rect x="0" y="10" width="90" height="20" fill="#14101c" stroke="${I}" stroke-width="1"/>
      <rect class="lit" x="3" y="13" width="84" height="14" rx="3" fill="none" stroke="#c05cff" stroke-width="1.5"/>
      ${K(45,24.5,`CLUB`,12,`#ff6bd6`,!0)}
      <path d="M0 110 L4 60 L24 110 Z M86 110 L82 60 L62 110 Z" class="lit" fill="rgba(200,100,255,.18)"/>
      <path d="M22 30 v8" stroke="${z}" stroke-width="1"/>
      <circle cx="22" cy="44" r="6" fill="#d0d8e0" stroke="${I}" stroke-width=".8"/>
      <path d="M16 44 h12 M22 38 v12 M18 40 l8 8 M26 40 l-8 8" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>
      <g class="shop-window">${W(10,60,22,18,!1)}${J(10,60,22,18)}</g>
      <g class="shop-door"><rect x="56" y="66" width="24" height="44" fill="#0a0c10"/>
        <rect x="68" y="66" width="12" height="44" fill="#1c1622" stroke="${I}" stroke-width="1"/><rect class="lit" x="72" y="70" width="4" height="20" fill="#c05cff"/>
        <g class="door-leaf"><rect x="56" y="66" width="12" height="44" fill="#1c1622" stroke="${I}" stroke-width="1"/><rect class="lit" x="60" y="70" width="4" height="20" fill="#c05cff"/></g>
      </g>
      <rect x="10" y="94" width="3" height="16" fill="#ffd166" stroke="${I}" stroke-width=".7"/><rect x="34" y="94" width="3" height="16" fill="#ffd166" stroke="${I}" stroke-width=".7"/>
      <circle cx="11.5" cy="93" r="2" fill="#ffd166" stroke="${I}" stroke-width=".7"/><circle cx="35.5" cy="93" r="2" fill="#ffd166" stroke="${I}" stroke-width=".7"/>
      <path d="M13 96 q10.5 8 21 0" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      ${q(2,110,86)}
    `)},movie:{w:120,h:116,display:{x:19,y:94,size:22},svg:Y(120,116,`
      <g class="shop-chimney"><rect x="82" y="16" width="8" height="6" fill="${B}"/><path d="M78 8 l14 -4 v12 l-14 -2 Z" fill="${z}" stroke="${I}" stroke-width=".8"/><path d="M92 4 l4 -1 v14 l-4 -1 Z" class="lit" fill="#fff6c7"/></g>
      <path d="M10 33 Q65 -17 120 33 L110 40 Q55 -10 0 40 Z" fill="#20181a" stroke="${I}" stroke-width=".8"/>
      <path d="M0 40 Q55 -10 110 40 Z" fill="#3a2c30" stroke="${I}" stroke-width="1"/>
      <path d="M6 40 Q55 -2 104 40" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="2"/>
      ${U(0,40,110,70)}
      <rect x="28" y="44" width="54" height="14" rx="1" class="b-trim" stroke="${I}" stroke-width="1"/>
      ${K(55,54.5,`STAGE 5`,9)}
      <rect x="8" y="62" width="22" height="18" fill="#111" stroke="${I}" stroke-width="1"/>
      <path d="M8 62 h22 v5 h-22 Z" fill="#f4f1ea"/><path d="M11 62 l-3 5 M17 62 l-3 5 M23 62 l-3 5 M29 62 l-3 5" stroke="#111" stroke-width="1.6"/>
      <path d="M9 72 h20 M9 76 h20" stroke="rgba(255,255,255,.25)" stroke-width="1"/>
      <g class="shop-window">${W(84,64,16,16)}${J(84,64,16,16)}</g>
      <g class="shop-door"><rect x="40" y="70" width="30" height="40" fill="#0a0c10"/><g class="door-leaf">
        <rect x="40" y="70" width="30" height="40" fill="${B}" stroke="${I}" stroke-width="1"/>
        <path d="M42 72 h26 v36 h-26 Z" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="1"/>
        <text class="b-sign" x="55" y="94" font-size="12" style="fill:#ffd166">5</text>
      </g></g>
      <path d="M40 110 h30 l6 6 h-42 Z" fill="#b0202a" stroke="${I}" stroke-width=".8"/>
      <rect x="0" y="110" width="40" height="6" fill="#3a4250" stroke="${I}" stroke-width=".8"/><rect x="70" y="110" width="40" height="6" fill="#3a4250" stroke="${I}" stroke-width=".8"/>
    `)},taxi:{w:118,h:92,display:{x:88,y:78,size:18},signY:34,svg:Y(118,92,`
      <g class="shop-chimney">${H(34,4,40,16,`#8a6a10`)}<rect x="34" y="4" width="40" height="16" rx="2" fill="#f3c623" stroke="${I}" stroke-width="1"/>
        ${K(54,16.5,`TAXI`,10,`#1a1108`)}
        ${Array.from({length:10},(e,t)=>`<rect x="${34+t*4}" y="${t%2?4:17}" width="4" height="3" fill="#1a1108"/>`).join(``)}
      </g>
      <rect x="6" y="28" width="5" height="60" fill="${B}" stroke="${I}" stroke-width=".8"/>
      <rect x="99" y="28" width="5" height="60" fill="${B}" stroke="${I}" stroke-width=".8"/>
      ${U(0,20,108,8,`#3a4250`,`#1c2027`,`#5a6472`)}
      ${Array.from({length:27},(e,t)=>`<rect x="${t*4}" y="${t%2?28:31}" width="4" height="3" fill="${t%2?`#f3c623`:`#1a1108`}"/><rect x="${t*4}" y="${t%2?31:28}" width="4" height="3" fill="${t%2?`#1a1108`:`#f3c623`}"/>`).join(``)}
      ${U(72,40,32,48)}
      <g class="shop-window">${W(76,46,24,18,!1)}${J(76,46,24,18)}</g>
      <g class="shop-door"><rect x="74" y="64" width="28" height="4" fill="${z}" stroke="${I}" stroke-width=".8"/></g>
      <path d="M8 84 v-12 q0 -4 4 -6 l8 -10 q2 -2 5 -2 h22 q3 0 5 2 l8 10 q4 2 4 6 v12 Z" fill="#f3c623" stroke="${I}" stroke-width="1"/>
      <path d="M22 68 l6 -9 h18 l6 9 Z" fill="${V}" stroke="${I}" stroke-width=".8"/>
      <rect class="b-glass lit" x="24" y="61" width="9" height="6"/><rect class="b-glass lit" x="36" y="61" width="12" height="6"/>
      <rect x="30" y="52" width="14" height="5" rx="1" fill="#f4f1ea" stroke="${I}" stroke-width=".8"/>
      ${Array.from({length:14},(e,t)=>`<rect x="${10+t*4}" y="${t%2?72:75}" width="4" height="3" fill="#1a1108"/>`).join(``)}
      <rect x="8" y="80" width="56" height="2" fill="rgba(0,0,0,.25)"/>
      <circle cx="20" cy="84" r="6" fill="#222" stroke="${I}" stroke-width="1"/><circle cx="20" cy="84" r="2.5" fill="#999"/>
      <circle cx="52" cy="84" r="6" fill="#222" stroke="${I}" stroke-width="1"/><circle cx="52" cy="84" r="2.5" fill="#999"/>
      <rect x="9" y="76" width="4" height="3" fill="#fff6c7"/><rect x="59" y="76" width="4" height="3" fill="#e63946"/>
      <rect x="0" y="88" width="108" height="4" fill="#3a4250" stroke="${I}" stroke-width=".8"/>
    `)},cruise:{w:132,h:108,display:{x:17,y:48,size:18},signY:30,svg:Y(132,108,`
      <rect x="0" y="94" width="132" height="14" fill="#1f4e79"/>
      <path d="M0 98 q6 -3 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 M0 103 q6 -3 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
      <path d="M38 72 L122 72 L130 84 L118 96 L44 96 Z" fill="#eef2f5" stroke="${I}" stroke-width="1"/>
      <path d="M40 86 L124 86 L118 96 L44 96 Z" fill="#1f3a5a"/>
      <path d="M40 84 h84" class="b-awning-a" stroke-width="2" stroke="var(--shop-color)"/>
      ${[48,58,68,78,88,98,108].map(e=>`<circle cx="${e}" cy="79" r="2.2" fill="${V}" stroke="${I}" stroke-width=".7"/><circle class="b-glass lit" cx="${e}" cy="79" r="1.5"/>`).join(``)}
      <rect x="46" y="58" width="70" height="14" fill="#f6f8fa" stroke="${I}" stroke-width="1"/>
      ${[50,58,66,92,100,108].map(e=>`<rect x="${e}" y="62" width="5" height="5" fill="${V}" stroke="${I}" stroke-width=".6"/><rect class="b-glass lit" x="${e+.8}" y="62.8" width="3.4" height="3.4"/>`).join(``)}
      ${K(80,68.5,`CRUISE`,7,`#1f3a5a`)}
      <rect x="54" y="46" width="54" height="12" fill="#eef2f5" stroke="${I}" stroke-width="1"/>
      ${[58,66,74,82,90,98].map(e=>`<rect x="${e}" y="49" width="5" height="5" fill="${V}" stroke="${I}" stroke-width=".6"/><rect class="b-glass lit" x="${e+.8}" y="49.8" width="3.4" height="3.4"/>`).join(``)}
      <rect x="62" y="36" width="28" height="10" rx="2" fill="#f6f8fa" stroke="${I}" stroke-width="1"/>
      <rect x="65" y="39" width="22" height="4" fill="${V}" stroke="${I}" stroke-width=".6"/><rect class="b-glass lit" x="65.8" y="39.8" width="20.4" height="2.4"/>
      <g class="shop-chimney"><path d="M96 40 L108 40 L106 22 L98 22 Z" fill="#e74c3c" stroke="${I}" stroke-width="1"/><rect x="97" y="21" width="10" height="4" fill="#1a1a1a"/></g>
      <rect x="70" y="20" width="1.5" height="16" fill="${B}"/><path d="M71.5 21 l8 3 l-8 3 Z" fill="#e74c3c"/>
      ${U(4,60,26,28)}
      <g class="shop-window">${W(8,66,18,12,!1)}${J(8,66,18,12)}</g>
      <rect x="16" y="56" width="2" height="4" fill="${B}"/>
      <rect x="6" y="92" width="4" height="16" fill="${R}"/><rect x="24" y="92" width="4" height="16" fill="${R}"/>
      ${H(0,88,40,6,R)}<rect x="0" y="88" width="40" height="6" fill="${L}" stroke="${I}" stroke-width="1"/>
      <g class="shop-door"><path d="M34 90 L46 74 L50 76 L38 92 Z" fill="${z}" stroke="${I}" stroke-width="1"/><path d="M37 87 l3 1 M40 83 l3 1 M43 79 l3 1" stroke="rgba(0,0,0,.4)" stroke-width="1"/></g>
    `)},spacetourism:{w:108,h:120,display:{x:50,y:66,size:16},signY:46,svg:Y(108,120,`
      ${U(0,100,98,14,`#6b7280`,`#3a4250`,`#8a94a2`)}
      <path d="M0 106 h98" stroke="#f3c623" stroke-width="1.5" stroke-dasharray="4 4"/>
      <rect x="6" y="12" width="20" height="88" fill="none" stroke="${B}" stroke-width="2.5"/>
      ${[12,27,42,57,72,87].map(e=>`<path d="M6 ${e} l20 13 M26 ${e} l-20 13" stroke="${B}" stroke-width="1.2"/><path d="M6 ${e} h20" stroke="${B}" stroke-width="1.5"/>`).join(``)}
      <rect x="4" y="8" width="24" height="4" fill="${z}" stroke="${I}" stroke-width=".8"/>
      <circle class="lit" cx="16" cy="6" r="2" fill="#ff4d4d"/>
      <rect x="26" y="38" width="14" height="4" fill="${z}" stroke="${I}" stroke-width=".8"/>
      <rect x="26" y="72" width="14" height="4" fill="${z}" stroke="${I}" stroke-width=".8"/>
      <path d="M40 78 L30 100 h10 Z" class="b-trim" stroke="${I}" stroke-width="1"/>
      <path d="M60 78 L70 100 h-10 Z" class="b-trim" stroke="${I}" stroke-width="1"/>
      <rect x="40" y="30" width="20" height="68" fill="#eef2f5" stroke="${I}" stroke-width="1"/>
      <rect x="56" y="30" width="4" height="68" fill="rgba(0,0,0,.15)"/>
      <rect x="40" y="34" width="20" height="4" class="b-awning-a"/><rect x="40" y="84" width="20" height="4" class="b-awning-a"/>
      <g class="shop-chimney"><path d="M40 30 Q50 6 60 30 Z" class="b-trim" stroke="${I}" stroke-width="1"/><circle cx="50" cy="12" r="1.5" fill="#ffd166"/></g>
      <circle cx="50" cy="46" r="3.5" fill="${V}" stroke="${I}" stroke-width=".8"/><circle class="b-glass lit" cx="50" cy="46" r="2.5"/>
      <path d="M44 98 h12 l2 6 h-16 Z" fill="#3a4250" stroke="${I}" stroke-width="1"/>
      <path d="M45 104 q5 8 10 0" class="lit" fill="#ff9f43"/>
      ${U(70,70,28,30)}
      <g class="shop-window">${W(74,73,20,6,!1)}${J(74,73,20,6)}</g>
      <g class="shop-door">${G(78,82,14,18)}</g>
      ${K(84,68,`SPACE`,6,``,!0)}
    `)},appstudio:{w:88,h:112,display:{x:40,y:62,size:26},svg:Y(88,112,`
      <g class="shop-chimney"><rect x="50" y="6" width="16" height="8" fill="${z}" stroke="${I}" stroke-width=".8"/><circle cx="58" cy="10" r="2.5" fill="none" stroke="${B}" stroke-width="1"/><path d="M52 6 v-2 M64 6 v-2" stroke="${B}" stroke-width="1"/></g>
      ${U(2,14,76,92,`b-wall`,`b-wall-side`,`#dfe6ee`)}
      <rect x="6" y="20" width="68" height="14" rx="2" class="b-trim" stroke="${I}" stroke-width="1"/>
      ${K(40,30.5,`APP STUDIO`,8)}
      ${[38,58,78].map(e=>[6,30,54].map((t,n)=>e===78&&n===1?``:`<rect x="${t}" y="${e}" width="20" height="16" fill="${V}" stroke="${I}" stroke-width=".8"/><rect class="b-glass${(n+e)%2?` lit`:``}" x="${t+1}" y="${e+1}" width="18" height="14"/>`).join(``)).join(``)}
      <g class="shop-window">${W(6,38,20,16,!1)}${J(6,38,20,16)}</g>
      <g class="shop-door"><rect x="30" y="88" width="20" height="18" fill="#0a0c10"/><g class="door-leaf"><rect class="b-glass lit" x="31" y="89" width="18" height="16"/><path d="M40 89 v16 M31 97 h18" stroke="${z}" stroke-width="1.5"/></g>
        <rect x="30" y="88" width="20" height="18" rx="1" fill="none" stroke="${z}" stroke-width="1.5"/></g>
      ${q(0,106,80)}
    `)},tech:{w:104,h:108,display:{x:24,y:50,size:26},svg:Y(104,108,`
      <g class="shop-chimney">${[8,34,60].map(e=>`<path d="M${e} 28 L${e+22} 14 L${e+26} 16 L${e+4} 30 Z" fill="#1f3a5a" stroke="${I}" stroke-width=".8"/><path d="M${e+7} 24 L${e+26} 12 M${e+13} 20 L${e+30} 9" stroke="rgba(255,255,255,.2)" stroke-width="1"/><rect x="${e+10}" y="24" width="2" height="6" fill="${B}"/>`).join(``)}</g>
      ${U(0,30,94,74,`b-wall`,`b-wall-side`,`#dfe6ee`)}
      ${K(66,57,`TECH`,13,``,!0)}
      <rect x="6" y="64" width="54" height="34" fill="${V}" stroke="${I}" stroke-width="1"/>
      <g class="shop-window">${[0,1,2,3].map(e=>[0,1].map(t=>`<rect class="b-glass${(e+t)%2?``:` lit`}" x="${7+e*13.25}" y="${65+t*16.5}" width="12.25" height="15.5"/>`).join(``)).join(``)}
        <path d="M7 65 h20 L7 82 Z" fill="rgba(255,255,255,.2)"/>${J(6,64,54,34)}</g>
      <g class="shop-door"><rect x="66" y="70" width="18" height="34" fill="#0a0c10"/><g class="door-leaf"><rect x="66" y="70" width="18" height="34" fill="${B}" stroke="${I}" stroke-width="1"/><rect class="b-glass lit" x="68" y="72" width="14" height="30"/><rect x="69" y="84" width="2" height="8" rx="1" fill="${z}"/></g></g>
      ${q(0,104,94,4)}
      ${[10,20,30].map(e=>`<path d="M${e} 104 v-6 q0 -4 4 -4 q4 0 4 4 v6" fill="none" stroke="${z}" stroke-width="1.5"/>`).join(``)}
    `)},chipfab:{w:120,h:110,display:{x:28,y:94,size:20},svg:Y(120,110,`
      <g class="shop-chimney"><rect x="84" y="6" width="6" height="34" fill="${z}" stroke="${I}" stroke-width=".8"/><rect x="96" y="10" width="6" height="30" fill="${z}" stroke="${I}" stroke-width=".8"/><rect x="83" y="4" width="8" height="3" fill="${B}"/><rect x="95" y="8" width="8" height="3" fill="${B}"/><path d="M84 20 h6 M96 22 h6" stroke="#e74c3c" stroke-width="2"/></g>
      <path d="M108 40 l10 -7 v-15 l-6 -6 l-10 7 l6 6 Z" class="b-wall-side" stroke="${I}" stroke-width=".8"/>
      ${[0,36,72].map(e=>`<path d="M${e} 40 L${e+30} 18 L${e+36} 40 Z" class="b-wall" stroke="${I}" stroke-width="1"/><path d="M${e+30} 18 L${e+36} 40" class="b-glass lit" stroke="var(--shop-color)" stroke-width="3"/>`).join(``)}
      <path d="M0 40 h108" stroke="${I}" stroke-width="1"/>
      ${U(0,40,108,64)}
      <rect x="0" y="46" width="108" height="5" fill="${z}" stroke="${I}" stroke-width=".8"/>
      <rect x="20" y="44" width="4" height="9" fill="${B}"/><rect x="60" y="44" width="4" height="9" fill="${B}"/><rect x="100" y="44" width="4" height="9" fill="${B}"/>
      ${K(28,62,`CHIP FAB`,8)}
      <g class="shop-window">${W(6,68,44,14,!1)}<path d="M17 68 v14 M28 68 v14 M39 68 v14" stroke="rgba(0,0,0,.3)" stroke-width="1"/>${J(6,68,44,14)}</g>
      <g class="shop-door"><rect x="64" y="66" width="36" height="38" fill="#0a0c10"/><g class="door-leaf">
        <rect x="64" y="66" width="36" height="38" fill="${z}" stroke="${I}" stroke-width="1"/>
        <path d="M64 72 h36 M64 78 h36 M64 84 h36 M64 90 h36 M64 96 h36" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
      </g><rect x="62" y="62" width="40" height="4" class="b-trim" stroke="${I}" stroke-width=".8"/></g>
      <rect x="60" y="100" width="4" height="4" fill="#1a1108"/><rect x="100" y="100" width="4" height="4" fill="#1a1108"/>
      ${q(0,104,108)}
    `)},houseflip:{w:110,h:112,display:{x:28,y:94,size:20},svg:Y(110,112,`
      ${on(60,22,9,16)}
      ${U(10,50,70,56)}
      <path d="M10 56 h70 M10 62 h70 M10 68 h70 M10 86 h70 M10 92 h70 M10 98 h70" stroke="rgba(0,0,0,.18)" stroke-width="1"/>
      <path d="M86 52 l10 -7 L55 11 l-10 7 Z" fill="#2a1a12" stroke="${I}" stroke-width=".8"/>
      <path d="M4 52 L45 18 L86 52 Z" fill="#4a2c22" stroke="${I}" stroke-width="1"/>
      <path d="M12 50 L45 22 L78 50" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="2"/>
      <g class="shop-window">${W(18,60,20,18)}${J(18,60,20,18)}</g>
      <rect x="13" y="60" width="4" height="18" fill="#2a3a2a" stroke="${I}" stroke-width=".7"/><rect x="39" y="60" width="4" height="18" fill="#2a3a2a" stroke="${I}" stroke-width=".7"/>
      <g class="shop-door">${G(52,74,14,32)}</g>
      <rect x="82" y="30" width="2.5" height="76" fill="${B}"/><rect x="97" y="30" width="2.5" height="76" fill="${B}"/>
      ${[50,72,94].map(e=>`<rect x="80" y="${e}" width="22" height="3" fill="#c9a874" stroke="${I}" stroke-width=".6"/><path d="M83 ${e+3} l14 19 M97 ${e+3} l-14 19" stroke="${B}" stroke-width="1"/>`).join(``)}
      <path d="M2 106 L14 60 M8 106 L20 60" stroke="#c9a874" stroke-width="2"/>
      ${[66,74,82,90,98].map(e=>`<path d="M${(106-e)/46*12+2-2.5} ${e} h8" stroke="#c9a874" stroke-width="1.5"/>`).join(``)}
      <rect x="86" y="98" width="7" height="8" rx="1" fill="#e74c3c" stroke="${I}" stroke-width=".7"/><rect x="94" y="98" width="7" height="8" rx="1" fill="#3498db" stroke="${I}" stroke-width=".7"/>
      <rect x="24" y="88" width="2" height="18" fill="${R}"/>
      <rect x="16" y="80" width="18" height="10" fill="#f4f1ea" stroke="${I}" stroke-width=".8"/>
      ${K(25,87.5,`SOLD`,6,`#c0392b`)}
      ${q(6,106,96)}
    `)},realestate:{w:92,h:108,display:{x:28,y:72,size:22},svg:Y(92,108,`
      ${on(56,0)}
      ${U(0,14,82,10,`#6a3828`,`#3e2018`,`#9a5a44`)}
      ${U(4,24,74,78)}
      <path d="M4 34 h74 M4 44 h74 M4 54 h74 M4 64 h74 M4 74 h74 M4 84 h74 M4 94 h74" stroke="rgba(0,0,0,.14)" stroke-width="1"/>
      ${an(1,26,80,12)}
      ${K(41,35.5,`REALTY`,9)}
      <rect x="6" y="46" width="44" height="44" rx="1.5" fill="${V}" stroke="${I}" stroke-width="1"/>
      <g class="shop-window"><rect class="b-glass lit" x="7" y="47" width="42" height="42"/>
        ${[[9,49],[21,49],[33,49],[9,77],[21,77],[33,77]].map(([e,t])=>`<rect x="${e}" y="${t}" width="10" height="11" fill="#fff" stroke="${I}" stroke-width=".5"/><path d="M${e+2} ${t+3} h6 M${e+2} ${t+5.5} h6 M${e+2} ${t+8} h4" stroke="#999" stroke-width=".8"/><rect x="${e+1}" y="${t+1}" width="8" height="1.5" fill="#e74c3c"/>`).join(``)}
        <path d="M7 47 h18 L7 66 Z" fill="rgba(255,255,255,.25)"/>
        ${J(6,46,44,44)}
      </g>
      <g class="shop-door">${G(58,64,18,38)}</g>
      ${q(2,102,80)}
    `)},reit:{w:84,h:120,display:{x:19,y:100,size:18},svg:Y(84,120,`
      <g class="shop-chimney"><rect x="55" y="2" width="2" height="12" fill="${z}"/><path d="M52 6 h8" stroke="${z}" stroke-width="1.2"/><circle cx="56" cy="2" r="1.4" fill="#ff4d4d"/></g>
      ${U(38,14,36,100,`b-wall`,`b-wall-side`,`#dfe6ee`)}
      ${K(56,26,`REIT`,7)}
      ${[32,46,60,74].map(e=>[42,58].map((t,n)=>`<rect x="${t}" y="${e}" width="12" height="10" fill="${V}" stroke="${I}" stroke-width=".7"/><rect class="b-glass${(n+e/14)%2?` lit`:``}" x="${t+1}" y="${e+1}" width="10" height="8"/>`).join(``)).join(``)}
      ${U(2,34,34,80,`b-wall`,`b-wall-side`,`#dfe6ee`)}
      ${[40,54,68].map(e=>[6,20].map((t,n)=>`<rect x="${t}" y="${e}" width="12" height="10" fill="${V}" stroke="${I}" stroke-width=".7"/><rect class="b-glass${(n+e/14)%2?``:` lit`}" x="${t+1}" y="${e+1}" width="10" height="8"/>`).join(``)).join(``)}
      <g class="shop-window">${W(6,40,12,10,!1)}${J(6,40,12,10)}</g>
      <rect x="4" y="88" width="30" height="16" rx="1" class="b-trim" stroke="${I}" stroke-width=".8"/>
      <g class="shop-door"><rect x="44" y="98" width="24" height="16" fill="#0a0c10"/><g class="door-leaf"><rect class="b-glass lit" x="45" y="99" width="22" height="14"/><path d="M56 99 v14" stroke="${z}" stroke-width="1.5"/></g>
        <rect x="44" y="98" width="24" height="16" rx="1" fill="none" stroke="${z}" stroke-width="1.5"/></g>
      ${q(0,114,76)}
      <rect x="0" y="108" width="6" height="6" fill="#8a6a44" stroke="${I}" stroke-width=".6"/><circle cx="3" cy="106" r="3" fill="#3aa860"/>
      <rect x="70" y="108" width="6" height="6" fill="#8a6a44" stroke="${I}" stroke-width=".6"/><circle cx="73" cy="106" r="3" fill="#3aa860"/>
    `)},gasstation:{w:124,h:100,display:{x:40,y:46,size:18},signY:36,svg:Y(124,100,`
      <rect x="98" y="4" width="3" height="20" fill="${B}"/>
      <g class="shop-chimney">${H(86,4,28,16,`b-trim`)}<rect x="86" y="4" width="28" height="16" rx="1" class="b-trim" stroke="${I}" stroke-width="1"/>
        ${K(100,11,`GAS`,6)}${K(100,18,`3.49`,6,`#ffd166`,!0)}</g>
      <rect x="14" y="34" width="5" height="60" fill="${B}" stroke="${I}" stroke-width=".8"/>
      <rect x="72" y="34" width="5" height="60" fill="${B}" stroke="${I}" stroke-width=".8"/>
      ${U(0,24,114,10,`#eef2f5`,`#98a4b0`,`#f6f8fa`)}
      <rect x="0" y="29" width="114" height="4" class="b-awning-a"/>
      <path d="M40 34 v4" stroke="${B}" stroke-width="1.5"/>
      ${[22,44].map(e=>`<rect x="${e}" y="90" width="18" height="4" fill="#3a4250" stroke="${I}" stroke-width=".8"/><rect x="${e+2}" y="60" width="14" height="30" rx="1" fill="${z}" stroke="${I}" stroke-width="1"/><rect x="${e+4}" y="63" width="10" height="7" fill="${V}"/><rect class="lit" x="${e+5}" y="64" width="8" height="5" fill="#55efc4"/><rect x="${e+4}" y="73" width="10" height="4" fill="#1a1108"/><path d="M${e+16} 66 h2 v14 h-2" fill="none" stroke="#1a1108" stroke-width="1.5"/><rect x="${e+15}" y="78" width="3" height="6" fill="#1a1108"/>`).join(``)}
      ${U(76,44,38,50)}
      <g class="shop-window">${W(80,50,30,16,!1)}${J(80,50,30,16)}</g>
      <g class="shop-door">${G(92,70,14,24)}</g>
      ${q(0,94,114)}
    `)},oil:{w:116,h:118,display:{x:91,y:92,size:18},signY:40,svg:Y(116,118,`
      <path d="M14 8 h14 L40 112 h-38 Z" fill="none" stroke="${B}" stroke-width="2.5"/>
      ${[8,24,40,56,72,88].map((e,t)=>{let n=t/6.5,r=14-12*n,i=28+12*n,a=(t+1)/6.5,o=14-12*a;return`<path d="M${r} ${e} L${28+12*a} ${e+16} M${i} ${e} L${o} ${e+16} M${r} ${e} h${i-r}" stroke="${B}" stroke-width="1.2"/>`}).join(``)}
      <rect x="10" y="4" width="22" height="5" fill="${z}" stroke="${I}" stroke-width=".8"/>
      <rect x="20" y="9" width="2" height="60" fill="#1a1108"/>
      <rect x="64" y="30" width="6" height="54" fill="${z}" stroke="${I}" stroke-width=".8"/>
      <g class="shop-chimney"><rect x="63" y="28" width="8" height="3" fill="${B}"/><path class="lit" d="M67 10 q-6 8 -3 14 q3 4 6 0 q4 -6 -3 -14 Z" fill="#ff9f43"/><path class="lit" d="M67 16 q-2 4 -1 7 q1 2 2 0 q2 -3 -1 -7 Z" fill="#ffe36b"/></g>
      <path d="M100 68 l10 -7 v44 l-10 7 Z" fill="${B}" stroke="${I}" stroke-width=".8"/>
      <rect x="72" y="68" width="28" height="44" fill="${z}" stroke="${I}" stroke-width="1"/>
      <path d="M72 68 q14 -8 28 0" fill="#c8ced6" stroke="${I}" stroke-width="1"/>
      <path d="M72 80 h28 M72 96 h28" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
      <rect x="72" y="72" width="28" height="6" class="b-awning-a"/>
      ${K(86,77.5,`OIL CO.`,6,`#1a1108`)}
      <path d="M70 56 h8 v12" fill="none" stroke="${B}" stroke-width="2.5"/>
      ${U(42,84,32,28)}
      <g class="shop-window">${W(45,88,10,8,!1)}${J(45,88,10,8)}</g>
      <g class="shop-door">${G(58,94,12,18)}</g>
      ${q(0,112,106)}
    `)},fusion:{w:118,h:114,display:{x:22,y:96,size:20},svg:Y(118,114,`
      <path d="M76 108 C 86 80, 84 60, 84 34 L 102 34 C 102 60, 100 80, 110 108 Z" fill="#8a94a2" stroke="${I}" stroke-width="1"/>
      <path d="M86 40 C 86 60, 88 80, 80 106 M96 40 C 96 60, 96 80, 102 106" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1"/>
      <g class="shop-chimney"><rect x="84" y="30" width="18" height="4" fill="${B}" stroke="${I}" stroke-width=".8"/><circle class="lit" cx="90" cy="24" r="5" fill="rgba(255,255,255,.28)"/><circle class="lit" cx="98" cy="18" r="6" fill="rgba(255,255,255,.22)"/><circle class="lit" cx="92" cy="12" r="4" fill="rgba(255,255,255,.16)"/></g>
      <path d="M70 60 l10 -7 v55 l-10 7 Z" class="b-wall-side" stroke="${I}" stroke-width=".8"/>
      <rect x="10" y="60" width="60" height="48" class="b-wall" stroke="${I}" stroke-width="1"/>
      <path d="M70 60 l10 -7 Q80 20 50 23 L40 30 Q70 30 70 60 Z" fill="#7a8492" stroke="${I}" stroke-width=".8"/>
      <path d="M10 60 Q10 30 40 30 Q70 30 70 60 Z" fill="#b8c4d0" stroke="${I}" stroke-width="1"/>
      <path d="M40 30 v30 M18 42 Q40 36 62 42 M12 52 Q40 44 68 52" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1"/>
      ${K(40,72,`FUSION`,8,``,!0)}
      <g class="shop-window"><circle cx="40" cy="88" r="11" fill="${V}" stroke="${I}" stroke-width="1"/><circle class="b-glass lit" cx="40" cy="88" r="9"/><circle class="lit" cx="40" cy="88" r="5" fill="#fff" opacity=".7"/><path d="M29 88 h22 M40 77 v22" stroke="rgba(0,0,0,.3)" stroke-width="1"/>${J(28,76,24,24)}</g>
      ${U(48,88,28,20)}
      <g class="shop-door">${G(58,92,12,16)}</g>
      ${q(0,108,108)}
    `)}},ln=e=>cn[e]??sn,un=[`#f5d0a9`,`#e8b88c`,`#c98a63`,`#9c6747`,`#704a30`],dn=[`#1a1208`,`#4a2e1a`,`#7a4b25`,`#b07a3a`,`#d8a85a`,`#e8e2d4`,`#a3a3a3`,`#2c1810`],fn=[`#e74c3c`,`#3498db`,`#27ae60`,`#9b59b6`,`#f39c12`,`#16a085`,`#e67e22`,`#ecf0f1`,`#1abc9c`,`#d35400`,`#8e44ad`,`#c0392b`],pn=[`#2c3e50`,`#34495e`,`#1a2530`,`#5a3a1f`,`#4a4a4a`,`#243447`,`#2d1810`],mn=[`#1b1f2a`,`#2b2438`,`#1f2d3a`,`#3a2a1e`];function hn(e){return e[Math.floor(Math.random()*e.length)]}var gn=`viewBox="0 0 24 40" preserveAspectRatio="xMidYMax meet"`;function X(e,t,n,r){return`<svg class="${e}" ${gn} width="${t}" height="${n}">${r}</svg>`}function _n(e){let t=hn(un),n=hn(dn),r=e===`whale`,i=hn(r?mn:fn),a=r?i:hn(pn),o=Math.random()<.5?`#1a1a1a`:`#3a2418`,s=Math.random(),c=r?`tophat`:e===`broke`?s<.6?`beanie`:`short`:s<.1?`bald`:s<.35?`long`:s<.5?`cap`:`short`,l=c===`long`?`<path d="M6 7 Q12 -1 18 7 L18.5 18 Q12 16 5.5 18 Z" fill="${n}"/>`:c===`bald`?``:`<ellipse cx="12" cy="6.5" rx="5.6" ry="5" fill="${n}"/>`,u=c===`bald`?``:`<path d="M7 7 Q12 3 17 7 Q17 9 12 7 Q9 8 7 9 Z" fill="${n}"/>`,d=c===`tophat`?`<rect x="7" y="-3.5" width="10" height="8.5" fill="#15151a" stroke="#000" stroke-width=".4"/><rect x="7" y="2.6" width="10" height="1.6" fill="#c9a227"/><rect x="4.8" y="4.4" width="14.4" height="1.6" rx=".8" fill="#15151a"/>`:c===`cap`?`<path d="M6.6 6.8 Q12 1 17.4 6.8 Z" fill="${hn(fn)}"/><rect x="11" y="6.2" width="9" height="1.6" rx=".8" fill="rgba(0,0,0,.35)"/>`:c===`beanie`?`<path d="M6.4 8.2 Q12 1.2 17.6 8.2 Z" fill="#6b5b45"/><rect x="6.2" y="7" width="11.6" height="2.2" rx="1.1" fill="#5a4a36"/>`:``,f=e===`wealthy`?`<rect x="8" y="7.4" width="3.4" height="2.3" rx=".7" fill="#111"/><rect x="12.6" y="7.4" width="3.4" height="2.3" rx=".7" fill="#111"/><path d="M11.4 8.5h1.2" stroke="#111" stroke-width=".6"/>`:`<circle cx="10" cy="8.5" r=".7" fill="#111"/><circle cx="14" cy="8.5" r=".7" fill="#111"/>`,p=r?`<path d="M9.5 15 L12 21.5 L14.5 15 Z" fill="#f4f4f4"/><path d="M11.2 15.2h1.6l-.8 1.6z" fill="#c0392b"/><path d="M11.6 16.6l.4 5.4.4-5.4z" fill="#c0392b" stroke="#c0392b" stroke-width=".9" stroke-linejoin="round"/>`:``,m=`<rect x="6.5" y="27" width="4.5" height="9.5" rx=".5" fill="${a}"/><ellipse cx="8.7" cy="37.5" rx="2.6" ry="1.4" fill="${o}"/>`,h=`<rect x="13" y="27" width="4.5" height="9.5" rx=".5" fill="${a}"/><ellipse cx="15.3" cy="37.5" rx="2.6" ry="1.4" fill="${o}"/>`,g=`<rect x="2" y="15" width="3" height="11" rx="1.2" fill="${i}"/><circle cx="3.5" cy="26.5" r="1.5" fill="${t}"/>`,_=`<rect x="19" y="15" width="3" height="11" rx="1.2" fill="${i}"/><circle cx="20.5" cy="26.5" r="1.5" fill="${t}"/>`,v=`
    <rect x="11" y="12.5" width="2" height="1.5" fill="${t}"/>
    <path d="M5 15 L19 15 L20 27 L4 27 Z" fill="${i}"/>
    <path d="M5 15 L19 15 L19 16.5 L5 16.5 Z" fill="rgba(0,0,0,.15)"/>
    ${p}
    <g class="p-head">
      ${l}
      <circle cx="12" cy="8" r="5" fill="${t}"/>
      ${u}
      ${f}
      <path d="M10.5 11 Q12 12 13.5 11" stroke="#7a3a2a" stroke-width=".5" fill="none" stroke-linecap="round"/>
      ${d}
    </g>`;return`<span class="c-rig">${X(`p-leg p-leg-l`,22,36,m)}${X(`p-leg p-leg-r`,22,36,h)}${X(`p-arm p-arm-l`,22,36,g)}${X(`p-torso`,22,36,v)}${X(`p-arm p-arm-r`,22,36,_)}</span>`}function vn(){let e=`#e0b48c`,t=`#2b1d12`,n=`#2b3a55`,r=`#15151a`,i=`#c9a227`,a=`
    <rect x="6.5" y="27" width="4.5" height="9.5" rx=".5" fill="${n}"/><ellipse cx="8.7" cy="37.5" rx="2.6" ry="1.4" fill="${r}"/>
    <rect x="13" y="27" width="4.5" height="9.5" rx=".5" fill="${n}"/><ellipse cx="15.3" cy="37.5" rx="2.6" ry="1.4" fill="${r}"/>
    <rect x="2" y="15" width="3" height="11" rx="1.2" fill="${n}"/><circle cx="3.5" cy="26.5" r="1.5" fill="${e}"/>
    <rect x="11" y="12.5" width="2" height="1.5" fill="${e}"/>
    <path d="M5 15 L19 15 L20 27 L4 27 Z" fill="${n}"/>
    <path d="M5 15 L19 15 L19 16.5 L5 16.5 Z" fill="rgba(0,0,0,.15)"/>
    <path d="M9.5 15 L12 21.5 L14.5 15 Z" fill="#f4f4f4"/><path d="M11.2 15.2h1.6l-.8 1.6z" fill="${i}"/><path d="M11.6 16.6l.4 5.4.4-5.4z" fill="${i}" stroke="${i}" stroke-width=".9" stroke-linejoin="round"/>`,o=`<rect x="19" y="15" width="3" height="8" rx="1.2" fill="${n}"/><rect x="17.2" y="20.5" width="6.4" height="8" rx=".8" fill="#c9a874" stroke="#6b5533" stroke-width=".5"/><rect x="18.9" y="19.6" width="3" height="1.8" rx=".5" fill="#555"/><path d="M18.6 23.5h3.6M18.6 25.5h2.6" stroke="#6b5533" stroke-width=".5"/>`,s=`
      <ellipse cx="12" cy="6.5" rx="5.6" ry="5" fill="${t}"/>
      <circle cx="12" cy="8" r="5" fill="${e}"/>
      <path d="M7 7 Q12 3 17 7 Q17 9 12 7 Q9 8 7 9 Z" fill="${t}"/>
      <rect x="8" y="7.4" width="3.4" height="2.3" rx=".7" fill="#111" opacity=".85"/><rect x="12.6" y="7.4" width="3.4" height="2.3" rx=".7" fill="#111" opacity=".85"/><path d="M11.4 8.5h1.2" stroke="#111" stroke-width=".6"/>
      <path d="M10.5 11 Q12 12 13.5 11" stroke="#7a3a2a" stroke-width=".5" fill="none" stroke-linecap="round"/>`;return`<span class="m-rig">${X(`m-body`,20,33,a)}${X(`m-arm`,20,33,o)}${X(`m-head`,20,33,s)}</span>`}var Z=130,yn=90,Q=20,bn=40,xn=[10,8,6,6];function Sn(e){return xn[e]??xn[xn.length-1]}function Cn(e){let t=e,n=0;for(;;){let e=Sn(n);if(t<e)return{floor:n,idxInFloor:t};t-=e,n++}}function wn(e){if(e<=0)return 1;let t=0,n=0;for(;n<e;)n+=Sn(t),t++;return t}var Tn=40,En=110,Dn=new Map(n.map((e,t)=>[e.id,t]));function On(e,t,n){let r=n>0?t/n:0;switch(e){case`broke`:return(1-r)*(1-r)*.9+.1;case`normal`:return Math.max(.25,1-.7*Math.abs(r-.4));case`wealthy`:return .15+1.6*r;case`whale`:return .08+3*r*r}}function kn(e,t){let n=0;for(let e of t)n+=e;if(!(n>0))return Math.floor(Math.random()*e.length);let r=Math.random()*n;for(let e=0;e<t.length;e++)if(r-=t[e],r<=0)return e;return e.length-1}function An(e,t,n){let r=(e-1)/999,i=Math.max(0,.5-.45*r),a=Math.max(0,Math.min(.95,.1*r+n)),o=Math.max(0,Math.min(.95,.05+.3*r+t)),s=.1*r,c=.05+.3*r,l=Math.max(0,a-s+(o-c));if(i=Math.max(0,i-l),i+a+o>1){let e=(1-i)/(a+o);a*=e,o*=e}let u=Math.random();return u<i?{tier:`broke`,multiplier:.3,units:1,icon:`coin`}:u<i+a?{tier:`whale`,multiplier:8,units:3+Math.floor(Math.random()*3),icon:`crown`}:u<i+a+o?{tier:`wealthy`,multiplier:2.5,units:1+Math.floor(Math.random()*2),icon:`gem`}:{tier:`normal`,multiplier:1,units:1,icon:``}}var jn=e=>e?P(`<i class=st-off>PAUSED</i> click to resume`,[`Salaries still paid while paused`]):P(`<i class=st-on>RUNNING</i> click to pause`),Mn=class{onShopClick;onShopPause;root;street;shopsRow;peopleLayer;shops=new Map;openShops=[];customers=[];parcelQueue=new Map;spawnAcc=0;lastT=performance.now();state;width=0;zoom=1;panX=0;drag=null;dragged=!1;zoomEl;stairEl;stairElR;slabsEl;floors=1;stairXL=0;stairXR=0;stairXL_R=0;stairXR_R=0;stairInner(e){return e===`L`?this.stairXR:this.stairXL_R}stairOuter(e){return e===`L`?this.stairXL:this.stairXR_R}stairBottomX(e,t=`L`){return e%2==0?this.stairInner(t):this.stairOuter(t)}stairTopX(e,t=`L`){return e%2==0?this.stairOuter(t):this.stairInner(t)}climbX(e,t,n=`L`){let r=Math.max(0,Math.min(1,(t-e*Z)/Z));return this.stairBottomX(e,n)+(this.stairTopX(e,n)-this.stairBottomX(e,n))*r}floorScale(e){return Math.max(.55,.88**e)}constructor(e){this.state=e,this.root=document.createElement(`div`),this.root.className=`market`,this.root.innerHTML=`
      <div class="market-sky"></div>
      <div class="market-street">
        <div class="market-ground"></div>
        <div class="market-slabs"></div>
        <div class="market-stair"></div>
        <div class="market-stair market-stair-r"></div>
        <div class="market-shops"></div>
        <div class="market-people"></div>
      </div>
      <div class="market-zoom"></div>
    `,document.body.appendChild(this.root),this.street=this.root.querySelector(`.market-street`),this.shopsRow=this.root.querySelector(`.market-shops`),this.peopleLayer=this.root.querySelector(`.market-people`),this.stairEl=this.root.querySelector(`.market-stair:not(.market-stair-r)`),this.stairElR=this.root.querySelector(`.market-stair-r`),this.slabsEl=this.root.querySelector(`.market-slabs`),this.zoomEl=this.root.querySelector(`.market-zoom`),window.addEventListener(`wheel`,e=>this.onWheel(e),{passive:!1}),window.addEventListener(`pointerdown`,e=>this.onDragStart(e)),window.addEventListener(`pointermove`,e=>this.onDragMove(e)),window.addEventListener(`pointerup`,()=>this.onDragEnd()),window.addEventListener(`pointercancel`,()=>this.onDragEnd()),this.root.addEventListener(`click`,e=>{this.dragged&&(e.stopPropagation(),e.preventDefault())},!0),this.rebuildShops(),window.addEventListener(`resize`,()=>this.onResize()),this.onResize(),requestAnimationFrame(e=>{this.lastT=e,this.loop(e)})}onResize(){this.width=this.street.clientWidth,this.setZoom(1,0),this.layoutShops()}onWheel(e){let t=this.street.getBoundingClientRect();if(e.clientY<t.top||e.clientX<t.left||e.clientX>t.right||e.deltaY>0&&this.zoom===1)return;e.preventDefault();let n=Math.max(1,Math.min(3,this.zoom*(e.deltaY<0?1.15:1/1.15))),r=e.clientX-this.root.getBoundingClientRect().left,i=(r-this.panX)/this.zoom;this.setZoom(n,r-i*n)}onDragStart(e){if(this.zoom===1||e.button!==0)return;let t=this.street.getBoundingClientRect();e.clientY<t.top||e.clientX<t.left||e.clientX>t.right||(e.preventDefault(),this.drag={startX:e.clientX,startPan:this.panX,moved:!1})}onDragMove(e){if(!this.drag)return;let t=e.clientX-this.drag.startX;!this.drag.moved&&Math.abs(t)<4||(this.drag.moved=!0,document.body.style.cursor=`grabbing`,this.setZoom(this.zoom,this.drag.startPan+t))}onDragEnd(){this.drag&&(document.body.style.cursor=``,this.dragged=this.drag.moved,this.drag=null,this.dragged&&setTimeout(()=>{this.dragged=!1},0))}setZoom(e,t){this.zoom=e,this.panX=e===1?0:Math.max(this.width*(1-e),Math.min(0,t)),this.street.style.transform=e===1?``:`translateX(${this.panX.toFixed(1)}px) scale(${e.toFixed(3)})`,this.root.classList.toggle(`zoomed`,e>1),this.zoomEl.textContent=`${e.toFixed(1)}× · scroll down to zoom out`}syncOpenShops(){this.openShops.length=0;for(let e of this.shops.values()){let t=this.state.industries[e.defId];t&&!t.closed&&this.openShops.push(e)}}rebuildShops(){for(let e of this.shops.values())e.statsEl.remove();this.shopsRow.innerHTML=``,this.shops.clear();let e=new Map;for(let t=0;t<n.length;t++){let r=n[t].category??`Misc`;e.has(r)||e.set(r,t)}let t=n.map((e,t)=>({def:e,idx:t})).sort((t,n)=>{let r=e.get(t.def.category??`Misc`)??999,i=e.get(n.def.category??`Misc`)??999;return r===i?t.idx-n.idx:r-i}).map(e=>e.def);for(let e of t){let t=this.state.industries[e.id];if(!t||!t.unlocked)continue;let n=document.createElement(`div`);n.className=`shop`,n.style.setProperty(`--shop-color`,e.color);let r=this.state.delivered[e.id]??0,i=ln(e.id);n.style.setProperty(`--sign-y`,(i.signY??i.h*.32).toFixed(0)+`px`),n.innerHTML=`
        <div class="shop-badge" data-count="${r}">${N(`package`,{size:12})} <span class="shop-badge-n">${A(r)}</span></div>
        <button class="shop-toggle" type="button" data-tip="${P(`Open / close store`,[`Click badge or right-click store`])}">${t.closed?N(`lock`,{size:14}):N(`unlock`,{size:14})}</button>
        <button class="shop-toggle shop-pause" type="button" data-tip="${jn(t.paused)}"><span class="ic-pause">${N(`pause`,{size:12})}</span><span class="ic-play">${N(`play`,{size:12})}</span></button>
        <div class="shop-closed-sign">CLOSED</div>
        <div class="shop-soldout-sign"><span class="sos-top">SOLD</span><span class="sos-bot">OUT</span></div>
        ${i.svg}
        <div class="shop-display" style="left:${i.display.x-i.display.size/2}px;top:${i.display.y-i.display.size/2}px">${N(e.icon,{size:i.display.size})}</div>
        <div class="shop-spill lit"></div>
        <div class="shop-manager" data-tip="${P(`Manager on duty`,[`Auto-restarts production`])}">${vn()}</div>
        <div class="shop-stats">
          <div class="ss-title">${e.name}</div>
          <div class="ss-row sub"><span>Tip / unit (now)</span><span class="ss-tip">$0</span></div>
          <div class="ss-row sub"><span>Avg / sale</span><span class="ss-avg">$0</span></div>
          <div class="ss-divider"></div>
          <div class="ss-row gain"><span>Gross tips</span><span class="ss-gross">$0</span></div>
          <div class="ss-row loss"><span>− Fees <small>(delivery · txn · platform)</small></span><span class="ss-fees">$0</span></div>
          <div class="ss-row sum"><span>= Earned</span><span class="ss-earned">$0</span></div>
          <div class="ss-row loss"><span>− Lost <small>(missed customers)</small></span><span class="ss-lost">$0</span></div>
          <div class="ss-row net"><span>= Net</span><span class="ss-net">$0</span></div>
          <div class="ss-divider"></div>
          <div class="ss-row gain"><span>${N(`star`,{size:11})} Rep gained</span><span class="ss-rep-gain">0</span></div>
          <div class="ss-row loss"><span>${N(`starOff`,{size:11})} Rep lost</span><span class="ss-rep-loss">0</span></div>
          <div class="ss-row sub"><span>Sales / Misses</span><span class="ss-counts">0 / 0</span></div>
        </div>
      `,this.shopsRow.appendChild(n);let a=n.querySelector(`.shop-badge`),o=n.querySelector(`.shop-stats`);o.remove(),o.classList.add(`portal`),document.body.appendChild(o),r===0&&(a.classList.add(`zero`),n.classList.add(`empty-shop`)),t.closed&&n.classList.add(`closed`),t.paused&&n.classList.add(`paused`),t.hasManager&&n.classList.add(`managed`);let s={el:n,badgeEl:a,statsEl:o,x:0,floor:0,defId:e.id,w:i.w};this.shops.set(e.id,s),this.renderShopStats(s);let c=()=>{let e=n.getBoundingClientRect();o.style.left=e.left+e.width/2+`px`,o.style.top=e.top+`px`};n.addEventListener(`mouseenter`,()=>{this.renderShopStats(s),c(),o.classList.add(`visible`)}),n.addEventListener(`mouseleave`,()=>o.classList.remove(`visible`)),n.addEventListener(`click`,t=>{t.target.closest(`.shop-toggle`)||this.onShopClick?.(e.id)}),n.querySelectorAll(`.shop-toggle`).forEach(e=>{e.addEventListener(`mouseenter`,()=>o.classList.remove(`visible`)),e.addEventListener(`mouseleave`,()=>o.classList.add(`visible`))}),n.querySelector(`.shop-pause`)?.addEventListener(`click`,t=>{t.stopPropagation(),this.onShopPause?.(e.id)});let l=n.querySelector(`.shop-toggle`);if(l){let t=t=>{t.preventDefault(),t.stopPropagation();let r=ve(this.state,e.id);n.classList.toggle(`closed`,r),l.innerHTML=N(r?`lock`:`unlock`,{size:14}),this.syncOpenShops()};l.addEventListener(`click`,t),n.addEventListener(`contextmenu`,t)}}this.syncOpenShops(),this.rebindCustomerRefs(),this.layoutShops()}rebindCustomerRefs(){for(let e=this.customers.length-1;e>=0;e--){let t=this.customers[e],n=[];for(let e of t.route){let t=this.shops.get(e.defId);t&&n.push(t)}t.route=n,t.routeIdx>=t.route.length?t.target=null:t.target=t.route[t.routeIdx]??null,t.target||(t.state=t.floor>0?`climbing-down`:`walking-out`,t.el.classList.remove(`inside`))}}layoutShops(){let e=Array.from(this.shops.values());e.length===0||this.width===0||(this.shopsRow.style.transform=``,requestAnimationFrame(()=>{let t=matchMedia(`(max-width: 640px)`).matches?.8:1;this.floors=Math.max(1,wn(e.length)),this.stairXL=Q,this.stairXR=Q+yn,this.stairXL_R=this.width-Q-yn,this.stairXR_R=this.width-Q;let n=this.floors>1?yn+bn:0,r=this.street.getBoundingClientRect(),i=this.width-Q*2-n*2,a=0,o=1,s=0;for(let c=0;c<e.length;c++){let l=e[c],{floor:u,idxInFloor:d}=Cn(c),f=c-d,p=Math.min(Sn(u),e.length-f);if(d===0){o=this.floorScale(u)*t,s=bn*o*2**u;let r=(p-1)*s;for(let t=f;t<f+p;t++)r+=e[t].w*o;let c=Math.max(.45,Math.min(1,i/r));c<1&&(o*=c,s*=c,r*=c),a=Q+n+Math.max(0,(i-r)/2)}let m=a;a+=l.w*o+s,l.floor=u,l.el.style.left=m+`px`,l.el.style.bottom=u*Z+`px`;let h=this.width/2,g=Math.min(1,u*.12),_=(h-m)*g;l.el.style.transformOrigin=`bottom left`,l.el.style.transform=`translateX(${_.toFixed(1)}px) scale(${o})`,l.el.style.opacity=String(Math.max(.62,1-u*.09)),l.el.style.zIndex=String(50-u);let v=l.el.querySelector(`.shop-door`);if(v){let e=v.getBoundingClientRect();l.x=(e.left+e.width/2-r.left)/this.zoom}else l.x=m+l.w*o/2}let c=Tn+this.floors*Z+20;this.root.style.setProperty(`--market-h`,c+`px`),document.body.style.setProperty(`--market-h`,c+`px`),this.slabsEl.innerHTML=``;for(let e=1;e<this.floors;e++){let t=document.createElement(`div`);t.className=`market-floor-slab`,t.style.left=Q+`px`,t.style.right=Q+`px`,t.style.bottom=Tn+e*Z-12+`px`,t.style.height=`12px`,this.slabsEl.appendChild(t)}if(this.floors>1){let e=this.floors*Z,t=this.stairXR-this.stairXL;this.stairEl.style.display=`block`,this.stairEl.style.left=this.stairXL+`px`,this.stairEl.style.width=t+`px`,this.stairEl.style.bottom=Tn+`px`,this.stairEl.style.height=e+`px`,this.stairEl.innerHTML=this.renderStairSVG(t,e,`L`);let n=this.stairXR_R-this.stairXL_R;this.stairElR.style.display=`block`,this.stairElR.style.left=this.stairXL_R+`px`,this.stairElR.style.width=n+`px`,this.stairElR.style.bottom=Tn+`px`,this.stairElR.style.height=e+`px`,this.stairElR.innerHTML=this.renderStairSVG(n,e,`R`)}else this.stairEl.style.display=`none`,this.stairEl.innerHTML=``,this.stairElR.style.display=`none`,this.stairElR.innerHTML=``}))}renderStairSVG(e,t,n=`L`){let r=this.floors-1,i=``,a=n===`L`?e:0,o=n===`L`?0:e;for(let e=0;e<r;e++){let n=t-e*Z,r=t-(e+1)*Z,s=e%2==0?a:o,c=e%2==0?o:a,l=``,u=c-s,d=r-n,f=Math.hypot(u,d),p=-d/f,m=u/f;for(let e=1;e<12;e++){let t=e/12,r=s+u*t,i=n+d*t,a=r-p*7,o=i-m*7,c=r+p*7,f=i+m*7;l+=`<line x1="${a.toFixed(1)}" y1="${o.toFixed(1)}" x2="${c.toFixed(1)}" y2="${f.toFixed(1)}" stroke="#5a3a26" stroke-width="2" stroke-linecap="round"/>`}let h=e=>`M ${(s+p*e*9).toFixed(1)} ${(n+m*e*9).toFixed(1)} L ${(c+p*e*9).toFixed(1)} ${(r+m*e*9).toFixed(1)}`;i+=`
        <g class="stair-flight">
          <path d="${h(-1)}" stroke="#2a1d14" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="${h(1)}"  stroke="#2a1d14" stroke-width="3" stroke-linecap="round" fill="none"/>
          ${l}
          <line x1="${s}" y1="${n}" x2="${c}" y2="${r}" stroke="#4a3324" stroke-width="3" stroke-linecap="round" opacity=".55"/>
        </g>
      `;let g=c,_=r;i+=`<rect x="${(g-18/2).toFixed(1)}" y="${(_-4).toFixed(1)}" width="18" height="6" fill="#3a2820" stroke="#1a1108" stroke-width="1" rx="1"/>`}return`<svg viewBox="0 0 ${e} ${t}" width="${e}" height="${t}" preserveAspectRatio="none" style="overflow:visible">${i}</svg>`}advanceRoute(e){for(e.routeIdx++;e.routeIdx<e.route.length;){let t=e.route[e.routeIdx],n=this.state.industries[t.defId];if(n&&!n.closed)return e.target=t,!0;e.routeIdx++}return e.target=null,!1}spawnCustomer(){let e=this.openShops;if(e.length===0)return;let t=Math.random()<.5,n=u(this.state),r=An(this.state.reputation,n.wealthyBonus,n.whaleBonus),i=r.tier===`whale`?5:r.tier===`wealthy`?3:r.tier===`broke`?1:2,a=1+Math.floor(Math.random()*i),o=Math.min(a,e.length),s=0;for(let t of e){let e=Dn.get(t.defId)??0;e>s&&(s=e)}let c=e.slice(),l=[];for(let e=0;e<o;e++){let e=kn(c,c.map(e=>On(r.tier,Dn.get(e.defId)??0,s)));l.push(c.splice(e,1)[0])}let d=l[0],f=document.createElement(`div`);f.className=`customer`;let p=document.createElement(`span`);p.className=`c-shadow`;let m=document.createElement(`span`);m.className=`c-body`,m.innerHTML=_n(r.tier);let h=document.createElement(`span`);if(h.className=`c-product`,f.appendChild(p),f.appendChild(m),m.appendChild(h),f.classList.add(`wealth-`+r.tier),r.icon){let e=document.createElement(`span`);if(e.className=`c-wealth`,e.innerHTML=N(r.icon,{size:12}),r.units>1){let t=document.createElement(`span`);t.className=`c-wealth-qty`,t.textContent=`×`+r.units,e.appendChild(t)}f.appendChild(e)}if(l.length>1){let e=document.createElement(`span`);e.className=`c-trip`,e.innerHTML=l.length+N(`cart`,{size:10}),f.appendChild(e)}this.peopleLayer.appendChild(f);let g=t?-30:this.width+30,_=t?`L`:`R`,v=((r.tier===`whale`?30:r.tier===`wealthy`?40:50)+Math.random()*40)*n.walkSpeed,y=(d.floor>0?this.stairBottomX(0,_):d.x)>g?v:-v,b=y>=0?1:-1,x=Math.random(),S=(1-x*.18)*(.94+Math.random()*.12);f.style.transform=`translate3d(${g}px, 0, 0) scale(${S})`,m.style.transform=`scaleX(${b})`,this.customers.push({el:f,body:m,product:h,x:g,y:0,vx:y,target:d,route:l,routeIdx:0,state:`walking-in`,shopTimer:0,facing:b,wealth:r,floor:0,lane:x,baseScale:S,side:_,walkSpd:-1})}flyProduct(e,t=1){let n=this.state.industries[e];if(!n)return;let r=n.count*t;if(r<=0)return;this.state.delivered[e]=(this.state.delivered[e]??0)+r,this.updateBadge(e,r);let i=this.parcelQueue.get(e)??{pending:0,active:!1};i.pending+=r,this.parcelQueue.set(e,i),this.tryFlushParcels(e)}tryFlushParcels(e){let t=this.parcelQueue.get(e);if(!t||t.pending<=0||t.active)return;let n=t.pending;t.pending=0,t.active=!0,this.launchParcels(e,n)}launchParcels(e,t){let n=this.shops.get(e),r=i.get(e),a=document.querySelector(`[data-card="${e}"]`);if(!n||!r||!a){let t=this.parcelQueue.get(e);t&&(t.active=!1,this.tryFlushParcels(e));return}let o=a.getBoundingClientRect(),s=n.el.querySelector(`.shop-chimney`),c=(s??n.el).getBoundingClientRect(),l=o.left+o.width/2,u=o.top+o.height/2,d=c.left+c.width/2,f=s?c.top-2:c.bottom-16,p=d-l,m=f-u,h=Math.max(180,Math.abs(p)*.32),g=t<=3?t:t<=30?2:3,_=Math.floor(t/g),v=t-_*g,y=e=>Math.min(1.5,.75+Math.log10(Math.max(1,e))*.22),b=700+Math.min(220,Math.abs(p)*.18),x=0;for(let t=0;t<g;t++){let i=_+ +(t<v),a=y(i),o=document.createElement(`div`);o.className=`parcel`,o.style.setProperty(`--parcel-scale`,a.toFixed(2));let s=document.createElement(`span`);s.className=`parcel-icon`,s.innerHTML=N(r.icon,{size:18});let c=document.createElement(`span`);if(c.className=`parcel-tape`,o.appendChild(c),o.appendChild(s),i>1){let e=document.createElement(`span`);e.className=`parcel-qty`,e.textContent=`×`+A(i),o.appendChild(e)}o.style.left=l+`px`,o.style.top=u+`px`,document.body.appendChild(o);let S=[];for(let e=0;e<=24;e++){let t=e/24,n=p*(1-(1-t)**2),r=m*t-h*4*t*(1-t),i=Math.sin(t*Math.PI*3)*10*(1-t),o=e===0?a*.6:a,s=e===0?0:1;S.push({transform:`translate(calc(-50% + ${n}px), calc(-50% + ${r}px)) rotate(${i}deg) scale(${o})`,opacity:s})}let C=o.animate(S,{duration:b,delay:t*130,easing:`linear`,fill:`forwards`}),w=b+t*130;w>x&&(x=w);let ee=t===g-1,te=!1,T=()=>{if(!te&&(te=!0,ee)){let t=this.parcelQueue.get(e);t&&(t.active=!1,this.tryFlushParcels(e))}};C.addEventListener(`finish`,()=>{this.chimneyPuff(d,f,a),this.glowWindow(n.el),C.cancel(),o.classList.add(`parcel-land`),setTimeout(()=>o.remove(),320),T()},{once:!0}),setTimeout(()=>{C.cancel(),o.remove(),T()},b+t*130+1500)}}chimneyPuff(e,t,n=1){let r=n>1.3?4:3;for(let i=0;i<r;i++){let r=document.createElement(`div`);r.className=`smoke-puff`;let a=(Math.random()-.5)*8;r.style.left=e+a+`px`,r.style.top=t+`px`,r.style.animationDelay=i*70+`ms`,r.style.setProperty(`--puff-scale`,n.toFixed(2)),document.body.appendChild(r),setTimeout(()=>r.remove(),1500)}}swingDoor(e){e.el.classList.add(`door-open`),clearTimeout(e.doorTimer),e.doorTimer=window.setTimeout(()=>e.el.classList.remove(`door-open`),650)}glowWindow(e){let t=e.querySelector(`.shop-window`);t&&(t.classList.remove(`stock-glow`),requestAnimationFrame(()=>t.classList.add(`stock-glow`)),setTimeout(()=>t.classList.remove(`stock-glow`),650))}flyReputation(e,t,n){let r=e.el.querySelector(`.shop-chimney`),i=document.getElementById(`rep`);if(!i)return;let a=(r??e.el).getBoundingClientRect(),o=i.getBoundingClientRect(),s=a.left+a.width/2,c=a.top,l=o.left+o.width/2,u=o.top+o.height/2,d=l-s,f=u-c,p=-Math.min(220,Math.abs(d)*.3+80),m=n===`gain`?360:-25,h=document.createElement(`div`);h.className=`flying-rep `+n,h.innerHTML=N(n===`gain`?`star`:`starOff`,{size:12})+` `+t,h.style.left=s+`px`,h.style.top=c+`px`,document.body.appendChild(h);let g=[];for(let e=0;e<=36;e++){let t=e/36,n=t<.5?2*t*t:1-(-2*t+2)**3/2,r=d*n,i=f*n+p*4*n*(1-n),a=m*n,o;o=t<.12?.4+t/.12*.7000000000000001:t>.88?1.1+.25*((t-.88)/.12):1+.12*Math.sin((t-.12)/.76*Math.PI);let s;s=t<.08?t/.08:t>.94?1-(t-.94)/.06:1,g.push({transform:`translate(calc(-50% + ${r}px), calc(-50% + ${i}px)) scale(${o}) rotate(${a}deg)`,opacity:s})}h.animate(g,{duration:1100,easing:`linear`,fill:`forwards`}).addEventListener(`finish`,()=>{h.remove(),this.pulseRepBar(n)},{once:!0}),setTimeout(()=>h.remove(),2200)}pulseRepBar(e){let t=document.getElementById(`rep`);if(!t)return;let n=e===`gain`?`rep-pulse-gain`:`rep-pulse-loss`;t.classList.remove(n),requestAnimationFrame(()=>t.classList.add(n)),setTimeout(()=>t.classList.remove(n),750)}getStats(e){let t=this.state.shopStats[e];return t||(t=p(),this.state.shopStats[e]=t),t}renderShopStats(e){let t=this.getStats(e.defId),n=i.get(e.defId),r=e=>O(e),a=(t,n)=>{let r=e.statsEl.querySelector(t);r&&(r.textContent=n)};a(`.ss-tip`,r(n?ue(n,this.state)*_:0));let o=t.sales>0?t.extraEarned/t.sales:0;a(`.ss-avg`,t.sales>0?r(o):`—`),a(`.ss-gross`,`+`+r(t.extraEarned+t.feesPaid)),a(`.ss-fees`,`-`+r(t.feesPaid)),a(`.ss-earned`,`+`+r(t.extraEarned)),a(`.ss-lost`,`-`+r(t.extraLost)),a(`.ss-rep-gain`,`+`+A(t.repGained)),a(`.ss-rep-loss`,`-`+A(t.repLost)),a(`.ss-counts`,A(t.sales)+` / `+A(t.misses));let s=t.extraEarned-t.extraLost;a(`.ss-net`,(s>=0?`+`:`-`)+r(Math.abs(s)));let c=e.statsEl.querySelector(`.ss-net`);c&&(c.classList.toggle(`pos`,s>0),c.classList.toggle(`neg`,s<0))}floatMoney(e,t,n){let r=document.createElement(`div`);r.className=`badge-float money-float `+n,r.textContent=t,e.appendChild(r),setTimeout(()=>r.remove(),1e3)}updateBadge(e,t=0){let n=this.shops.get(e);if(!n)return;let r=this.state.delivered[e]??0,i=n.badgeEl.querySelector(`.shop-badge-n`);if(i&&(i.textContent=A(r)),n.badgeEl.classList.toggle(`zero`,r===0),n.el.classList.toggle(`empty-shop`,r===0),n.badgeEl.classList.remove(`pulse`),requestAnimationFrame(()=>n.badgeEl.classList.add(`pulse`)),t>0){let e=document.createElement(`div`);e.className=`badge-float`,e.textContent=`+`+A(t),n.el.appendChild(e),setTimeout(()=>e.remove(),900)}}loop(e){let t=Math.min(.1,(e-this.lastT)/1e3);this.lastT=e;let r=!1;for(let e of n){let t=this.state.industries[e.id],n=this.shops.has(e.id);if(t&&t.unlocked&&!n&&(r=!0),t&&n){let n=this.shops.get(e.id).el;if(n.classList.toggle(`managed`,t.hasManager),n.classList.contains(`paused`)!==t.paused){n.classList.toggle(`paused`,t.paused);let e=n.querySelector(`.shop-pause`);e&&(e.dataset.tip=jn(t.paused))}}}r&&this.rebuildShops();let a=u(this.state),o=this.shops.size,s=(o===0?0:Math.min(3,.4+o*.25))*C(this.state.reputation)*a.spawnRate;for(this.spawnAcc+=t*s;this.spawnAcc>=1&&this.customers.length<40;)--this.spawnAcc,this.spawnCustomer();for(let e=this.customers.length-1;e>=0;e--){let n=this.customers[e];if(n.floor>=this.floors){n.floor=0,n.y=0,n.state=`walking-out`,n.target=null,n.el.classList.remove(`inside`);let e=n.x<this.width/2?-1:1;n.vx=e*60,n.facing=e}else n.state===`climbing-up`&&n.floor+1>=this.floors&&(n.y=n.floor*Z,n.state=`walking-out`,n.target=null);let r=1;if(n.state===`walking-in`&&n.target){let e=this.state.industries[n.target.defId];if(e&&e.closed){if(!this.advanceRoute(n)){n.state=`walking-out`;let e=n.vx>=0,t=40+Math.random()*30;n.vx=(e?1:-1)*t,n.facing=n.vx>=0?1:-1}}else{let e;e=n.floor===n.target.floor?n.target.x:n.floor<n.target.floor?this.stairBottomX(n.floor,n.side):this.stairTopX(n.floor-1,n.side);let i=Math.abs(n.vx)||50;n.vx=(e>n.x?1:-1)*i,n.facing=n.vx>=0?1:-1,n.floor===n.target.floor&&(r=Math.max(.3,Math.min(1,Math.abs(e-n.x)/30))),n.x+=n.vx*r*t,(n.vx>0&&n.x>=e||n.vx<0&&n.x<=e)&&(n.x=e,n.floor===n.target.floor?(n.state=`shopping`,n.shopTimer=(.6+Math.random()*1.2)*a.shopDwell,n.el.classList.add(`inside`),this.swingDoor(n.target)):n.floor<n.target.floor?n.state=`climbing-up`:n.state=`climbing-down`)}}else if(n.state===`climbing-up`&&n.target)if(n.target.floor<=n.floor)n.y=n.floor*Z,n.state=`walking-in`;else{n.y+=En*t;let e=n.floor,r=(e+1)*Z;n.x=this.climbX(e,n.y,n.side),n.facing=this.stairTopX(e,n.side)>=this.stairBottomX(e,n.side)?1:-1,n.y>=r&&(n.y=r,n.floor+=1,n.x=this.stairTopX(e,n.side),n.state=`walking-in`)}else if(n.state===`climbing-down`){n.y-=En*t;let e=Math.max(0,n.floor-1),r=Math.max(0,e*Z);if(n.x=this.climbX(e,n.y,n.side),n.facing=this.stairBottomX(e,n.side)>=this.stairTopX(e,n.side)?1:-1,n.y<=r){if(n.y=r,n.floor=e,n.x=this.stairBottomX(e,n.side),n.target&&n.target.floor>=n.floor)n.state=`walking-in`;else if(n.floor<=0){n.floor=0,n.state=`walking-out`;let e=Math.random()<.5,t=50+Math.random()*40;n.vx=(e?1:-1)*t,n.facing=n.vx>=0?1:-1}}}else if(n.state===`shopping`){if(n.shopTimer-=t,n.shopTimer<=0){n.el.classList.remove(`inside`),this.swingDoor(n.target);let e=n.target.defId,t=this.state.delivered[e]??0,r,o=this.getStats(e);if(t>0){let s=n.wealth.units,c=Math.min(t,s);this.state.delivered[e]=t-c;let l=i.get(e);if(l){n.product.innerHTML=N(l.icon,{size:14});let e=n.wealth.tier===`whale`?a.whaleTip:1,t=ue(l,this.state)*_*n.wealth.multiplier*c*a.tipMult*e,r=x(t),i=Math.min(r.total,t),s=t-i;this.state.money+=s,this.state.totalEarned+=s,o.extraEarned+=s,o.feesPaid+=i;let u=n.target.el;this.floatMoney(u,`+`+O(s),`gain`),i>0&&setTimeout(()=>this.floatMoney(u,`−`+O(i)+` fees`,`loss`),220)}let u=Math.round(2*(n.wealth.tier===`whale`?3:n.wealth.tier===`wealthy`?2:1)*a.repGainMult);if(this.state.reputation=S(this.state.reputation+u),o.repGained+=u,this.flyReputation(n.target,`+`+u,`gain`),c<s&&!a.partialForgive){let e=Math.max(1,Math.floor(5/2*a.repLossMult));this.state.reputation=S(this.state.reputation-e),o.repLost+=e}o.sales+=1;let d=o.unitsSold;o.unitsSold+=c;for(let t of m)if(d<t.units&&o.unitsSold>=t.units){let n=i.get(e);n&&Zt(`${N(`trophy`,{size:12})} ${n.name}: ${t.label} · ×${t.mult} sales revenue`,{color:j(n.category)});break}n.el.classList.add(`carrying`),this.updateBadge(e),this.renderShopStats(n.target),r=50+Math.random()*40}else{let t=i.get(e);if(t){let e=le(t,this.state)*w(this.state.reputation)*_*n.wealth.multiplier*n.wealth.units*4*a.repLossMult,r=Math.min(this.state.money,e);this.state.money-=r,o.extraLost+=r,this.floatMoney(n.target.el,`-`+O(r),`loss`)}let s=Math.max(1,Math.round(5*(n.wealth.tier===`whale`?4:n.wealth.tier===`wealthy`?2:1)*a.repLossMult));this.state.reputation=S(this.state.reputation-s),o.repLost+=s,o.misses+=1,this.flyReputation(n.target,`-`+s,`loss`),this.renderShopStats(n.target),n.el.classList.add(`empty`);let c=n.target.el;c.classList.remove(`sold-out`),c.offsetWidth,c.classList.add(`sold-out`),setTimeout(()=>c.classList.remove(`sold-out`),700),r=25+Math.random()*15}this.advanceRoute(n)?(n.state=`walking-in`,n.vx=((n.floor===n.target.floor?n.target.x:this.stairBottomX(n.floor,n.side))>n.x?1:-1)*r,n.facing=n.vx>=0?1:-1):(n.state=`walking-out`,n.floor>0?n.vx=(this.stairTopX(n.floor-1,n.side)>n.x?1:-1)*r:n.vx=(Math.random()<.5?1:-1)*r,n.facing=n.vx>=0?1:-1)}}else if(n.state===`walking-out`){if(n.floor>0){let e=this.stairTopX(n.floor-1,n.side);n.vx=(e>n.x?1:-1)*(Math.abs(n.vx)||50),n.facing=n.vx>=0?1:-1,n.x+=n.vx*t,(n.vx>0&&n.x>=e||n.vx<0&&n.x<=e)&&(n.x=e,n.state=`climbing-down`)}else if(n.x+=n.vx*t,n.x<-50||n.x>this.width+50){n.el.remove(),this.customers.splice(e,1);continue}}let o=(1-n.lane)*10,s=Math.max(n.floor,n.y/Z),c=this.floorScale(s);n.el.style.transform=`translate3d(${n.x}px, ${(o-n.y).toFixed(1)}px, 0) scale(${n.baseScale*c})`,n.el.style.zIndex=String(1e3+n.floor*200-Math.round(n.lane*100)),n.body.style.transform=`scaleX(${n.facing})`,n.el.classList.toggle(`climbing`,n.state===`climbing-up`||n.state===`climbing-down`);let l=n.state===`shopping`?0:Math.abs(n.vx)*r;Math.abs(l-n.walkSpd)>4&&(n.walkSpd=l,n.el.style.setProperty(`--walk`,(26/Math.max(12,l)).toFixed(2)+`s`))}requestAnimationFrame(e=>this.loop(e))}},Nn=Ue(),$=Nn?de(Nn):f(),Pn=Nn?Be($,Date.now()):0,Fn=ft($,Zt);et();var In=Fn.tick,Ln=document.createElement(`section`);Ln.className=`log-panel`,Ln.innerHTML=`
  <header class="log-head">
    <span class="log-title">${N(`scroll`,{size:14})} LOG</span>
    <button class="log-clear" type="button" data-tip="${P(`Clear log`)}">${N(`x`,{size:14})}</button>
  </header>
  <div class="log-body" id="log-body"></div>
`,(document.getElementById(`left-sidebar`)??document.body).appendChild(Ln);var Rn=Ln.querySelector(`#log-body`),zn=100;function Bn(e){let t=document.createElement(`div`);for(t.className=`log-entry`+(e.color?` tinted`:``),e.color&&t.style.setProperty(`--log-color`,e.color),t.innerHTML=`<span class="log-ts">${new Date(e.ts).toTimeString().slice(0,8)}</span><span class="log-msg">${e.msg}</span>`,Rn.appendChild(t);Rn.childElementCount>zn;)Rn.firstElementChild?.remove();Rn.scrollTop=Rn.scrollHeight,requestAnimationFrame(()=>t.classList.add(`in`))}Qt(Bn),Ln.querySelector(`.log-clear`).addEventListener(`click`,()=>{Rn.innerHTML=``});var Vn=new Mn($);Vn.onShopClick=e=>{let t=i.get(e);t&&($.industries[e]?.hasManager||Re($,e),Fn.ui.tab=`industries`,Fn.ui.industryCategory=t.category??`Misc`,document.querySelectorAll(`.tab`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===`industries`)}),Fn.render(),requestAnimationFrame(()=>{let t=document.querySelector(`[data-card="${e}"]`);t&&(t.scrollIntoView({behavior:`smooth`,block:`center`}),t.classList.remove(`flash`),requestAnimationFrame(()=>t.classList.add(`flash`)),setTimeout(()=>t.classList.remove(`flash`),1400))}))},Vn.onShopPause=e=>{let t=i.get(e);if(!t)return;let n=ye($,e);Zt(`${t.name} ${n?`paused`:`resumed`}`,{color:j(t.category)}),Fn.render()},Pn>0&&Zt(`Welcome back! Earned ${O(Pn)} while away.`);var Hn=performance.now();function Un(e){let t=Math.min(1,(e-Hn)/1e3);Hn=e;let n=ze($,t),r=Ne($);if($.lastTick=Date.now(),In(),r.length>0){for(let e of r){let t=i.get(e.id);t&&Zt(e.role===`manager`?`${N(`manager`,{size:12})} Manager started at ${t.name}`:`${N(`worker`,{size:12})} New employee joined ${t.name}`,{color:j(t.category)})}Fn.render()}for(let e in n.completions)Vn.flyProduct(e,n.completions[e]);requestAnimationFrame(Un)}requestAnimationFrame(e=>{Hn=e,Un(e)}),document.addEventListener(`contextmenu`,e=>e.preventDefault()),document.addEventListener(`dragstart`,e=>e.preventDefault());var Wn=()=>{Ge()||He($)};setInterval(Wn,1e4),window.addEventListener(`beforeunload`,Wn),window.addEventListener(`pagehide`,Wn),document.addEventListener(`visibilitychange`,()=>{if(document.hidden){Wn();return}let e=Date.now()-$.lastTick,t=Be($,Date.now());Hn=performance.now(),e>6e4&&t>0&&Zt(`Earned ${O(t)} while tab was in background.`),Fn.render()});function Gn(){try{window.parent.postMessage({type:`GAME_OVER`,score:Math.floor($.totalEarned),subScore:Math.floor($.totalProduced)},`*`)}catch{}}setInterval(Gn,5e3),window.addEventListener(`beforeunload`,Gn),window.addEventListener(`pagehide`,Gn);
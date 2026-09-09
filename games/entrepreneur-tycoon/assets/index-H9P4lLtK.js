(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:`lemonade`,name:`Lemonade Stand`,icon:`🍋`,color:`#f4c430`,baseCost:4,baseRevenue:2,baseTime:1,costMultiplier:1.07,managerCost:1e3,unlockCost:0,employeeMax:5,category:`Food`},{id:`shoeshine`,name:`Shoeshine Stand`,icon:`👞`,color:`#5a3a1f`,baseCost:10,baseRevenue:5,baseTime:2,costMultiplier:1.08,managerCost:2e3,unlockCost:10,employeeMax:5,category:`Lifestyle`},{id:`garden`,name:`Garden Allotment`,icon:`🥕`,color:`#e67e22`,baseCost:150,baseRevenue:75,baseTime:3,costMultiplier:1.13,managerCost:8e3,unlockCost:150,employeeMax:7,category:`Agriculture`},{id:`barbershop`,name:`Barbershop`,icon:`💈`,color:`#c0392b`,baseCost:200,baseRevenue:100,baseTime:4,costMultiplier:1.14,managerCost:35e3,unlockCost:200,employeeMax:10,category:`Lifestyle`},{id:`firstaid`,name:`First Aid Kiosk`,icon:`🩹`,color:`#e74c3c`,baseCost:2500,baseRevenue:1250,baseTime:5,costMultiplier:1.14,managerCost:2e4,unlockCost:2500,employeeMax:9,category:`Health`},{id:`tailor`,name:`Tailor Shop`,icon:`🧵`,color:`#9b59b6`,baseCost:3e3,baseRevenue:1500,baseTime:6,costMultiplier:1.14,managerCost:25e3,unlockCost:3e3,employeeMax:10,category:`Lifestyle`},{id:`pizza`,name:`Pizza Delivery`,icon:`🍕`,color:`#e74c3c`,baseCost:8640,baseRevenue:4320,baseTime:8,costMultiplier:1.13,managerCost:5e5,unlockCost:8640,employeeMax:18,category:`Food`},{id:`checkcash`,name:`Check Cashing`,icon:`💵`,color:`#27ae60`,baseCost:7e4,baseRevenue:35e3,baseTime:10,costMultiplier:1.125,managerCost:5e5,unlockCost:7e4,employeeMax:15,category:`Finance`},{id:`arcade`,name:`Arcade`,icon:`🕹️`,color:`#8e44ad`,baseCost:9e4,baseRevenue:45e3,baseTime:14,costMultiplier:1.125,managerCost:6e5,unlockCost:9e4,employeeMax:16,category:`Entertainment`},{id:`taxi`,name:`Taxi Service`,icon:`🚕`,color:`#f39c12`,baseCost:18e4,baseRevenue:9e4,baseTime:18,costMultiplier:1.12,managerCost:9e5,unlockCost:18e4,employeeMax:17,category:`Travel`},{id:`appstudio`,name:`App Studio`,icon:`📱`,color:`#3498db`,baseCost:3e5,baseRevenue:15e4,baseTime:22,costMultiplier:1.118,managerCost:15e5,unlockCost:3e5,employeeMax:18,category:`Tech`},{id:`farm`,name:`Organic Farm`,icon:`🌾`,color:`#a4c639`,baseCost:35e4,baseRevenue:175e3,baseTime:28,costMultiplier:1.115,managerCost:4e6,unlockCost:35e4,employeeMax:25,category:`Agriculture`},{id:`dental`,name:`Dental Clinic`,icon:`🦷`,color:`#d6eaf8`,baseCost:85e4,baseRevenue:425e3,baseTime:36,costMultiplier:1.115,managerCost:35e5,unlockCost:85e4,employeeMax:21,category:`Health`},{id:`shrimp`,name:`Shrimp Boat`,icon:`🦐`,color:`#ff7f50`,baseCost:1244160,baseRevenue:622080,baseTime:46,costMultiplier:1.11,managerCost:1e7,unlockCost:1244160,employeeMax:30,category:`Food`},{id:`houseflip`,name:`House Flipper`,icon:`🔨`,color:`#a04020`,baseCost:15e5,baseRevenue:75e4,baseTime:60,costMultiplier:1.112,managerCost:7e6,unlockCost:15e5,employeeMax:22,category:`Real Estate`},{id:`gasstation`,name:`Gas Station`,icon:`⛽`,color:`#c0392b`,baseCost:18e5,baseRevenue:9e5,baseTime:80,costMultiplier:1.113,managerCost:8e6,unlockCost:18e5,employeeMax:23,category:`Energy`},{id:`nightclub`,name:`Nightclub`,icon:`🪩`,color:`#7d3c98`,baseCost:6e6,baseRevenue:3e6,baseTime:110,costMultiplier:1.11,managerCost:18e6,unlockCost:6e6,employeeMax:27,category:`Entertainment`},{id:`cattle`,name:`Cattle Ranch`,icon:`🐄`,color:`#7d6f43`,baseCost:8e6,baseRevenue:4e6,baseTime:140,costMultiplier:1.108,managerCost:22e6,unlockCost:8e6,employeeMax:28,category:`Agriculture`},{id:`urgent`,name:`Urgent Care`,icon:`🚑`,color:`#cd5c5c`,baseCost:13e6,baseRevenue:65e5,baseTime:180,costMultiplier:1.107,managerCost:32e6,unlockCost:13e6,employeeMax:32,category:`Health`},{id:`realestate`,name:`Real Estate Agency`,icon:`🏠`,color:`#5d8a66`,baseCost:5e7,baseRevenue:25e6,baseTime:240,costMultiplier:1.095,managerCost:4e8,unlockCost:5e7,employeeMax:50,category:`Real Estate`},{id:`movie`,name:`Movie Studio`,icon:`🎬`,color:`#9b59b6`,baseCost:179159040,baseRevenue:89579520,baseTime:320,costMultiplier:1.09,managerCost:555555555,unlockCost:179159040,employeeMax:60,category:`Entertainment`},{id:`hedgefund`,name:`Hedge Fund`,icon:`📈`,color:`#117a65`,baseCost:35e7,baseRevenue:175e6,baseTime:440,costMultiplier:1.09,managerCost:1e9,unlockCost:35e7,employeeMax:58,category:`Finance`},{id:`tech`,name:`Tech Startup`,icon:`💻`,color:`#1abc9c`,baseCost:6e8,baseRevenue:3e8,baseTime:600,costMultiplier:1.085,managerCost:2e9,unlockCost:6e8,employeeMax:70,category:`Tech`},{id:`cruise`,name:`Cruise Line`,icon:`🚢`,color:`#1f618d`,baseCost:8e8,baseRevenue:4e8,baseTime:800,costMultiplier:1.082,managerCost:25e8,unlockCost:8e8,employeeMax:75,category:`Travel`},{id:`reit`,name:`REIT`,icon:`🏘️`,color:`#196f3d`,baseCost:25e8,baseRevenue:125e7,baseTime:1080,costMultiplier:1.078,managerCost:12e9,unlockCost:25e8,employeeMax:85,category:`Real Estate`},{id:`oil`,name:`Oil Company`,icon:`🛢️`,color:`#34495e`,baseCost:25798901760,baseRevenue:12899450880,baseTime:1450,costMultiplier:1.07,managerCost:1e11,unlockCost:25798901760,employeeMax:120,category:`Energy`},{id:`insurance`,name:`Insurance Giant`,icon:`🛡️`,color:`#2874a6`,baseCost:3e10,baseRevenue:15e9,baseTime:1950,costMultiplier:1.07,managerCost:12e10,unlockCost:3e10,employeeMax:130,category:`Finance`},{id:`chipfab`,name:`Chip Fab`,icon:`💾`,color:`#566573`,baseCost:55e9,baseRevenue:275e8,baseTime:2600,costMultiplier:1.068,managerCost:25e10,unlockCost:55e9,employeeMax:140,category:`Tech`},{id:`spacetourism`,name:`Space Tourism`,icon:`🛸`,color:`#a569bd`,baseCost:7e10,baseRevenue:35e9,baseTime:3400,costMultiplier:1.067,managerCost:35e10,unlockCost:7e10,employeeMax:145,category:`Travel`},{id:`fusion`,name:`Fusion Reactor`,icon:`⚛️`,color:`#1abc9c`,baseCost:6e11,baseRevenue:3e11,baseTime:4500,costMultiplier:1.06,managerCost:3e12,unlockCost:6e11,employeeMax:200,category:`Energy`}],t=[{id:`global_a`,name:`Coffee for Workers`,industryId:`global`,kind:`revenue`,cost:1e9,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_b`,name:`Motivational Posters`,industryId:`global`,kind:`revenue`,cost:1e11,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_c`,name:`Corporate Yoga`,industryId:`global`,kind:`revenue`,cost:0x9184e72a000,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_d`,name:`Coworking Spaces`,industryId:`global`,kind:`revenue`,cost:5e6,multiplier:1.5,desc:`All industries ×1.5 revenue`},{id:`global_e`,name:`Productivity Suite`,industryId:`global`,kind:`revenue`,cost:5e10,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_f`,name:`Industry 4.0`,industryId:`global`,kind:`revenue`,cost:0xe8d4a51000,multiplier:2,desc:`All industries ×2 revenue`},{id:`global_g`,name:`AI Copilot Fleet`,industryId:`global`,kind:`revenue`,cost:5e14,multiplier:3,desc:`All industries ×3 revenue`},{id:`global_h`,name:`Megacorp Synergy`,industryId:`global`,kind:`revenue`,cost:0x16345785d8a0000,multiplier:5,desc:`All industries ×5 revenue`},{id:`ind_lemonade`,name:`Secret Lemonade Recipe`,industryId:`lemonade`,kind:`revenue`,cost:1e6,multiplier:3,requires:100,desc:`Lemonade Stand ×3 revenue (req 100)`},{id:`ind_arcade`,name:`Arcade Tournament Circuit`,industryId:`arcade`,kind:`revenue`,cost:2e8,multiplier:3,requires:75,desc:`Arcade ×3 revenue (req 75)`},{id:`ind_fusion`,name:`Plasma Containment Breakthrough`,industryId:`fusion`,kind:`revenue`,cost:5e12,multiplier:3,requires:25,desc:`Fusion Reactor ×3 revenue (req 25)`},{id:`cust_doorman`,name:`Doorman`,industryId:`customer`,kind:`spawn_rate`,cost:25e4,value:1.35,desc:`+35% customer foot traffic`},{id:`cust_express`,name:`Express Lane`,industryId:`customer`,kind:`walk_speed`,cost:5e5,value:1.6,desc:`Customers walk 60% faster`},{id:`cust_coffee_bar`,name:`Coffee Bar`,industryId:`customer`,kind:`shop_dwell`,cost:15e5,value:.5,desc:`Customers shop in half the time`},{id:`cust_loyalty`,name:`Loyalty Cards`,industryId:`customer`,kind:`rep_gain_mult`,cost:8e6,value:2,desc:`×2 reputation gained per sale`},{id:`cust_apology`,name:`Apology Coupons`,industryId:`customer`,kind:`rep_loss_mult`,cost:25e6,value:.5,desc:`Half rep loss + half $ penalty on empty store`},{id:`cust_window_display`,name:`Window Display`,industryId:`customer`,kind:`wealthy_rate`,cost:6e7,value:.15,desc:`+15% wealthy customer chance`},{id:`cust_premium_receipts`,name:`Premium Receipts`,industryId:`customer`,kind:`tip_mult`,cost:2e8,value:1.5,desc:`All tips ×1.5`},{id:`cust_velvet_rope`,name:`Velvet Rope`,industryId:`customer`,kind:`whale_rate`,cost:15e8,value:.06,desc:`+6% whale customer chance`},{id:`cust_smart_inventory`,name:`Smart Inventory`,industryId:`customer`,kind:`partial_forgive`,cost:5e9,value:1,desc:`Partial orders no longer ding reputation`},{id:`cust_charity_drive`,name:`Charity Drive`,industryId:`customer`,kind:`rep_regen`,cost:2e10,value:1,desc:`+1 reputation per second, passive`},{id:`cust_concierge`,name:`Concierge Service`,industryId:`customer`,kind:`whale_tip`,cost:1e11,value:2.5,desc:`Whale tips ×2.5`},{id:`cust_vip_lounge`,name:`VIP Lounge`,industryId:`customer`,kind:`whale_rate`,cost:2e12,value:.1,desc:`+10% whale chance`},{id:`shady_sweatshop`,name:`Sweatshop Hours`,industryId:`global`,kind:`revenue`,cost:5e9,multiplier:3,repDrain:.5,desc:`All industries ×3 revenue · -0.5 rep/s (worker exposé)`},{id:`shady_gouging`,name:`Price Gouging`,industryId:`customer`,kind:`tip_mult`,cost:12e9,value:3,repDrain:.8,desc:`All tips ×3 · -0.8 rep/s (customer outrage)`},{id:`shady_astroturf`,name:`Astroturf Reviews`,industryId:`customer`,kind:`spawn_rate`,cost:8e8,value:1.8,repDrain:.4,desc:`+80% foot traffic · -0.4 rep/s (fake review backlash)`},{id:`shady_fineprint`,name:`Fine-Print Contracts`,industryId:`customer`,kind:`wealthy_rate`,cost:4e10,value:.25,repDrain:.6,desc:`+25% wealthy chance · -0.6 rep/s (consumer complaints)`},{id:`shady_tabloid`,name:`Tabloid Smears`,industryId:`customer`,kind:`whale_rate`,cost:5e11,value:.12,repDrain:1.2,desc:`+12% whale chance · -1.2 rep/s (rival press leaks)`},{id:`shady_pollute`,name:`Skip Inspections`,industryId:`global`,kind:`revenue`,cost:2e11,multiplier:2.5,repDrain:1,desc:`All industries ×2.5 revenue · -1.0 rep/s (environmental fines)`},{id:`shady_layoffs`,name:`Mass Layoffs PR Spin`,industryId:`customer`,kind:`shop_dwell`,cost:3e10,value:.35,repDrain:.7,desc:`Customers shop 65% faster · -0.7 rep/s (union picket lines)`}],n=e,r=t,i=new Map(n.map(e=>[e.id,e])),a=new Map(r.map(e=>[e.id,e])),o=(()=>{let e=new Map;for(let t of n)e.set(t.id,[]);for(let t of r)if((t.kind??`revenue`)===`revenue`)if(t.industryId===`global`)for(let r of n)e.get(r.id).push(t);else{let n=e.get(t.industryId);n&&n.push(t)}return e})();function s(){return{spawnRate:1,walkSpeed:1,shopDwell:1,wealthyBonus:0,whaleBonus:0,tipMult:1,whaleTip:1,repGainMult:1,repLossMult:1,partialForgive:!1,repRegen:0,repDrain:0}}var c=null,l=null;function u(){c=null,l=null,re.clear(),le.clear()}function d(e){if(c&&l===e)return c;let t=f(e);return c=t,l=e,t}function f(e){let t=s();for(let n of r){if(!e.upgrades[n.id])continue;n.repDrain&&(t.repDrain+=n.repDrain);let r=n.kind,i=n.value??0;switch(r){case`spawn_rate`:t.spawnRate*=i||1;break;case`walk_speed`:t.walkSpeed*=i||1;break;case`shop_dwell`:t.shopDwell*=i||1;break;case`wealthy_rate`:t.wealthyBonus+=i;break;case`whale_rate`:t.whaleBonus+=i;break;case`tip_mult`:t.tipMult*=i||1;break;case`whale_tip`:t.whaleTip*=i||1;break;case`rep_gain_mult`:t.repGainMult*=i||1;break;case`rep_loss_mult`:t.repLossMult*=i||1;break;case`partial_forgive`:i&&(t.partialForgive=!0);break;case`rep_regen`:t.repRegen+=i;break}}return t}function p(){let e={};for(let t of n)e[t.id]={count:0,unlocked:t.unlockCost===0,hasManager:!1,employees:0,hiringUntil:null,progress:0,producing:!1,closed:!1,paused:!1,managerProductsServed:0,employeeProductsServed:0};let t=n[0];return t&&(e[t.id].count=1),{money:0,totalEarned:0,totalProduced:0,industries:e,upgrades:{},delivered:{},reputation:500,shopStats:{},lastTick:Date.now(),startedAt:Date.now()}}function m(){return{extraEarned:0,extraLost:0,repGained:0,repLost:0,sales:0,misses:0,unitsSold:0,feesPaid:0}}var h=[{units:50,mult:1.25,label:`Regulars`},{units:250,mult:1.5,label:`Word-of-mouth`},{units:1e3,mult:2,label:`Local favorite`},{units:5e3,mult:3,label:`Neighborhood icon`},{units:25e3,mult:5,label:`City landmark`},{units:1e5,mult:8,label:`Regional chain`},{units:5e5,mult:15,label:`National brand`},{units:2e6,mult:25,label:`Global empire`}];function g(e){let t=1;for(let n of h)if(e>=n.units)t=n.mult;else break;return t}function _(e){for(let t of h)if(e<t.units)return{next:t.units,mult:t.mult,label:t.label};return null}function v(e){let t=null;for(let n of h)if(e>=n.units)t=n;else break;return t}var y=1e3,b=.2,x=.06,S=.029,C=.04;function ee(e,t,n){let r=e.baseRevenue*x*n,i=t*S,a=e.baseRevenue*C;return{delivery:r,transaction:i,platform:a,total:r+i+a}}function w(e){return Math.max(1,Math.min(y,e))}function T(e){return .5+(w(e)-1)/999}function te(e){return 2-T(e)}function ne(e){return T(e)}var re=new Map;function ie(e,t){let n=re.get(e.id);if(n!==void 0)return n;let r=1,i=o.get(e.id);if(i)for(let e of i)t.upgrades[e.id]&&(r*=e.multiplier??1);return re.set(e.id,r),r}var ae=[25,50,100,200,300,400,500,750,1e3,1500,2e3,3e3,4e3,5e3,7500,1e4];function E(e){let t=1;for(let n of ae)if(e>=n)t*=2;else break;return t}function oe(e){for(let t of ae)if(e<t)return{next:t,mult:E(t)};return{next:null,mult:E(e)}}var se=.02,ce=.05,le=new Map;function D(e,t){let r=le.get(e.id);if(r!==void 0)return r;let i=0;for(let r of n){if(r.id===e.id)continue;let n=t.industries[r.id];!n||!n.unlocked||(i+=se,n.count>=100&&(i+=ce))}let a=1+i;return le.set(e.id,a),a}function ue(e,t){let n=e.shopStats[t];return g(n?.unitsSold??0)}function de(e,t){let n=t.industries[e.id],r=n?E(n.count):1,i=n?I(n.employees):1;return e.baseRevenue*ie(e,t)*r*ue(t,e.id)*D(e,t)*i*T(t.reputation)}function fe(e,t){let n=t.industries[e.id],r=n?E(n.count):1,i=n?I(n.employees):1;return e.baseRevenue*ie(e,t)*r*ue(t,e.id)*D(e,t)*i}function pe(e){let t=p();for(let r of n)e.industries[r.id]||(e.industries[r.id]=t.industries[r.id]);e.upgrades||={},e.delivered||={},typeof e.totalEarned!=`number`&&(e.totalEarned=e.money),typeof e.totalProduced!=`number`&&(e.totalProduced=0),typeof e.startedAt!=`number`&&(e.startedAt=Date.now()),typeof e.reputation!=`number`&&(e.reputation=500),e.reputation=w(e.reputation),e.shopStats||={};for(let t of Object.keys(e.shopStats)){let n=e.shopStats[t];typeof n.unitsSold!=`number`&&(n.unitsSold=0),typeof n.feesPaid!=`number`&&(n.feesPaid=0)}for(let t of n){let n=e.industries[t.id];typeof n.employees!=`number`&&(n.employees=0),n.hiringUntil===void 0&&(n.hiringUntil=null),typeof n.closed!=`boolean`&&(n.closed=!1),typeof n.paused!=`boolean`&&(n.paused=!1),typeof n.managerProductsServed!=`number`&&(n.managerProductsServed=0),typeof n.employeeProductsServed!=`number`&&(n.employeeProductsServed=0)}return e}var me=.008,he=.0015;function O(e){return e.managerCost*me}function k(e,t){return e.managerCost*he*t}function A(e,t){let n=t.industries[e.id];if(!n)return 0;let r=n.managerProductsServed*e.baseRevenue*4,i=O(e)*240;return Math.max(r,i)}function j(e,t){let n=t.industries[e.id];if(!n||n.employees<=0)return 0;let r=n.employeeProductsServed/n.employees*e.baseRevenue*4,i=k(e,1)*240;return Math.max(r,i)}function ge(e,t){let n=i.get(t);if(!n)return 0;let r=e.industries[n.id];if(!r||!r.hasManager)return 0;let a=A(n,e);return e.money=Math.max(0,e.money-a),r.hasManager=!1,r.managerProductsServed=0,a}function _e(e,t){let n=i.get(t);if(!n)return 0;let r=e.industries[n.id];if(!r||r.employees<=0)return 0;let a=j(n,e);e.money=Math.max(0,e.money-a);let o=Math.floor(r.employeeProductsServed/r.employees);return r.employeeProductsServed=Math.max(0,r.employeeProductsServed-o),--r.employees,r.employees===0&&(r.employeeProductsServed=0),a}function ve(e,t){let n=i.get(t);if(!n)return 0;let r=e.industries[n.id];if(!r)return 0;let a=0;if(r.hasManager&&(a+=A(n,e)),r.employees>0){let e=r.employeeProductsServed/r.employees*n.baseRevenue*4,t=k(n,1)*240;a+=Math.max(e,t)*r.employees}return e.money=Math.max(0,e.money-a),r.hasManager&&(r.hasManager=!1,r.managerProductsServed=0),r.employees=0,r.employeeProductsServed=0,r.hiringUntil=null,a}function ye(e,t){let n=e.industries[t];return!n||!n.unlocked?!1:(n.closed=!n.closed,n.closed)}function be(e,t){let n=e.industries[t];return!n||!n.unlocked?!1:(n.paused=!n.paused,n.paused&&(n.producing=!1),n.paused)}function M(e,t,n=1){if(e.costMultiplier===1)return e.baseCost*n;let r=e.costMultiplier;return e.baseCost*r**+t*(r**+n-1)/(r-1)}function N(e,t,n){if(n<M(e,t,1))return 0;let r=e.costMultiplier,i=e.baseCost*r**+t;if(r===1)return Math.floor(n/e.baseCost);let a=n*(r-1)/i+1;return Math.floor(Math.log(a)/Math.log(r))}function P(e,t){let n=t.industries[e.id],r=E(n.count);return e.baseRevenue*n.count*ie(e,t)*r*ue(t,e.id)*D(e,t)*I(n.employees)*T(t.reputation)}var xe=.92,Se=.15;function F(e){return e.employeeMax??25}function Ce(e){return Math.max(Se,xe**+e)}var we=Math.ceil(Math.log(Se)/Math.log(xe)),Te=.05;function I(e){return 1+Te*Math.max(0,e-we)}function Ee(e,t){return Math.ceil(e.managerCost*.3*1.45**t)}function De(e){return Math.min(60,5+e*2)}function Oe(e,t){let n=i.get(t);if(!n)return!1;let r=e.industries[n.id];if(!r.unlocked||r.employees>=F(n)||r.hiringUntil!==null)return!1;let a=Ee(n,r.employees);if(e.money<a)return!1;e.money-=a;let o=De(r.employees)*1e3;return r.hiringUntil=Date.now()+o,!0}function ke(e,t=Date.now()){let r=[];for(let i of n){let n=e.industries[i.id];!n||n.hiringUntil===null||t>=n.hiringUntil&&(n.employees+=1,n.hiringUntil=null,r.push(i.id))}return r}function Ae(e,t){let n=t.industries[e.id];return e.baseTime*Ce(n?n.employees:0)}function je(e,t,n){let r=i.get(t);if(!r)return{bought:0,cost:0};let a=e.industries[r.id];if(!a.unlocked)return e.money<r.unlockCost?{bought:0,cost:0}:(e.money-=r.unlockCost,a.unlocked=!0,a.count=1,a.closed=!0,u(),{bought:1,cost:r.unlockCost});let o=n===`max`?N(r,a.count,e.money):n;if(o<=0)return{bought:0,cost:0};let s=M(r,a.count,o);if(e.money<s)return{bought:0,cost:0};let c=a.count;return e.money-=s,a.count+=o,c<100&&a.count>=100&&u(),{bought:o,cost:s}}function Me(e,t){let n=i.get(t);if(!n)return!1;let r=e.industries[n.id];return r.hasManager||e.money<n.managerCost?!1:(e.money-=n.managerCost,r.hasManager=!0,!0)}function Ne(e,t){let n=a.get(t);if(!n||e.upgrades[n.id])return!1;if(n.industryId!==`global`&&n.industryId!==`customer`){let t=e.industries[n.industryId];if(!t||n.requires&&t.count<n.requires)return!1}return e.money<n.cost?!1:(e.money-=n.cost,e.upgrades[n.id]=!0,u(),!0)}function Pe(e,t){let n=i.get(t);if(!n)return!1;let r=e.industries[n.id];return r.count<=0||r.paused||r.producing?!1:(r.producing=!0,r.progress=0,!0)}function Fe(e,t){let r=0,i=0,a={},o=d(e),s=(o.repRegen-o.repDrain)*t;s!==0&&(e.reputation=w(e.reputation+s));for(let o of n){let n=e.industries[o.id];if(n.hasManager&&(i+=O(o)*t),n.employees>0&&(i+=k(o,n.employees)*t),n.count<=0||n.paused||!n.producing&&!n.hasManager)continue;let s=Ae(o,e),c=P(o,e);!n.producing&&n.hasManager&&(n.producing=!0,n.progress=0);let l=t;for(;l>0&&n.producing;){let t=(1-n.progress)*s;if(l>=t)if(l-=t,r+=c,a[o.id]=(a[o.id]??0)+1,e.totalProduced+=n.count,n.hasManager&&(n.managerProductsServed+=1),n.employees>0&&(n.employeeProductsServed+=1),n.progress=0,n.hasManager)n.producing=!0;else{n.producing=!1;break}else n.progress+=l/s,l=0}}return e.money+=r,e.totalEarned+=r,e.money=Math.max(0,e.money-i),{earned:r,completions:a}}function Ie(e,t){let n=Math.max(0,(t-e.lastTick)/1e3),r=Math.min(n,8*3600);ke(e,t);let{earned:i}=Fe(e,r);return e.lastTick=t,i}var Le=`tycoon-empire-save-v1`;function L(e){try{localStorage.setItem(Le,JSON.stringify(e))}catch(e){console.warn(`Save failed`,e)}}function Re(){try{let e=localStorage.getItem(Le);return e?JSON.parse(e):null}catch(e){return console.warn(`Load failed`,e),null}}var ze=!1;function Be(){return ze}function Ve(){ze=!0,localStorage.removeItem(Le)}var He=`.K.M.B.T.Qa.Qi.Sx.Sp.Oc.No.Dc.UDc.DDc.TDc.QaDc.QiDc.SxDc.SpDc.OcDc.NDc.Vg.UVg.DVg.TVg.QaVg.QiVg.SxVg.SpVg.OcVg.NVg`.split(`.`),Ue=He.map((e,t)=>1e3**t);function R(e){if(!isFinite(e))return`∞`;if(e<0)return`-`+R(-e);if(e<1e3)return`$`+e.toFixed(e<10?2:0);let t=Math.floor(Math.log10(e)/3),n=Math.min(t,He.length-1),r=e/Ue[n];return`$`+r.toFixed(r<10?3:r<100?2:1)+He[n]}function z(e){if(e<1)return e.toFixed(2)+`s`;if(e<60)return e.toFixed(1)+`s`;if(e<3600)return Math.floor(e/60)+`m `+Math.floor(e%60)+`s`;let t=Math.floor(e/3600),n=Math.floor(e%3600/60);return t+`h `+n+`m`}function B(e){return e<1e3?Math.floor(e).toString():R(e).substring(1)}var We={Food:`#ff6b6b`,Lifestyle:`#ff9ff3`,Agriculture:`#6ab04c`,Health:`#4bcffa`,Entertainment:`#f368e0`,"Real Estate":`#c4a373`,Tech:`#5dade2`,Finance:`#f5cd79`,Travel:`#74b9ff`,Energy:`#feca57`,Misc:`#9aa4b2`};function V(e){if(e)return We[e]}var H=`#1a1a1a`,Ge={briefcase:`
    <rect x="3" y="7" width="18" height="13" rx="2" fill="#8b5a2b" stroke="${H}" stroke-width="1"/>
    <rect x="3" y="11" width="18" height="2" fill="#5c3a1a"/>
    <rect x="10" y="11" width="4" height="3" fill="#ffd166" stroke="${H}" stroke-width="0.5"/>
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" fill="none" stroke="${H}" stroke-width="1.5"/>`,factory:`
    <path d="M2 21V11l6 3V11l6 3V8h7v13z" fill="#6b7280" stroke="${H}" stroke-width="1"/>
    <rect x="16" y="4" width="2" height="6" fill="#9aa4b2"/>
    <circle cx="14" cy="4" r="1.5" fill="#d1d5db" opacity=".8"/>
    <circle cx="11" cy="3" r="1" fill="#d1d5db" opacity=".7"/>
    <rect x="5" y="17" width="2" height="3" fill="#facc15"/>
    <rect x="11" y="17" width="2" height="3" fill="#facc15"/>
    <rect x="17" y="17" width="2" height="3" fill="#facc15"/>`,bolt:`
    <path d="M13 2 4 14h6l-1 8 10-13h-6l1-7z" fill="#facc15" stroke="${H}" stroke-width="1" stroke-linejoin="round"/>
    <path d="M13 2 4 14h6l-1 8" fill="none" stroke="#fef08a" stroke-width="0.6"/>`,coin:`
    <circle cx="12" cy="12" r="9" fill="#ffd166" stroke="${H}" stroke-width="1"/>
    <circle cx="12" cy="12" r="7" fill="none" stroke="#b88c1a" stroke-width="0.7"/>
    <text x="12" y="16.5" font-size="11" font-weight="800" text-anchor="middle" fill="#7a5c0a" font-family="Georgia,serif">$</text>`,manager:`
    <circle cx="12" cy="6" r="3.5" fill="#f4c89a" stroke="${H}" stroke-width="0.8"/>
    <path d="M5 21v-3a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v3z" fill="#1f2937" stroke="${H}" stroke-width="0.8"/>
    <path d="M10 13h4l-2 4z" fill="#fff"/>
    <path d="M11 14l1 4 1-4z" fill="#dc2626"/>`,worker:`
    <circle cx="12" cy="13" r="3" fill="#f4c89a" stroke="${H}" stroke-width="0.6"/>
    <path d="M5 12a7 7 0 0 1 14 0v1H5z" fill="#fbbf24" stroke="${H}" stroke-width="0.8"/>
    <rect x="11" y="6" width="2" height="3" fill="#dc2626"/>
    <path d="M3 13h18v1H3z" fill="#1a1a1a"/>
    <path d="M7 20l1-3h8l1 3z" fill="#2563eb" stroke="${H}" stroke-width="0.6"/>`,salary:`
    <rect x="2" y="6" width="20" height="12" rx="1.5" fill="#22c55e" stroke="${H}" stroke-width="0.8"/>
    <rect x="3" y="7" width="18" height="10" fill="none" stroke="#15803d" stroke-width="0.6"/>
    <circle cx="12" cy="12" r="3" fill="#dcfce7" stroke="#15803d" stroke-width="0.6"/>
    <text x="12" y="14.5" font-size="5" font-weight="800" text-anchor="middle" fill="#15803d">$</text>`,fire:`
    <path d="M12 2c1 3 4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3-1-5 0-8z" fill="#ef4444" stroke="${H}" stroke-width="0.8"/>
    <path d="M12 9c1 1 2 3 2 5a2 2 0 1 1-4 0c0-2 1-3 2-5z" fill="#fbbf24"/>`,warning:`
    <path d="M12 3 22 21H2z" fill="#facc15" stroke="${H}" stroke-width="1" stroke-linejoin="round"/>
    <rect x="11" y="10" width="2" height="6" fill="${H}"/>
    <circle cx="12" cy="18" r="1" fill="${H}"/>`,package:`
    <path d="m3 7 9-4 9 4-9 4z" fill="#d97706" stroke="${H}" stroke-width="0.8"/>
    <path d="M3 7v10l9 4V11z" fill="#b45309" stroke="${H}" stroke-width="0.8"/>
    <path d="M21 7v10l-9 4V11z" fill="#92400e" stroke="${H}" stroke-width="0.8"/>
    <path d="M3 7 12 11 21 7" fill="none" stroke="${H}" stroke-width="0.6"/>
    <rect x="11" y="3.5" width="2" height="18" fill="#fde68a" opacity=".7"/>`,lock:`
    <rect x="5" y="11" width="14" height="10" rx="1.5" fill="#facc15" stroke="${H}" stroke-width="0.8"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="#78350f" stroke-width="1.6"/>
    <circle cx="12" cy="16" r="1.5" fill="#78350f"/>`,unlock:`
    <rect x="5" y="11" width="14" height="10" rx="1.5" fill="#22c55e" stroke="${H}" stroke-width="0.8"/>
    <path d="M8 11V7a4 4 0 0 1 7.5-2" fill="none" stroke="#14532d" stroke-width="1.6"/>
    <circle cx="12" cy="16" r="1.5" fill="#14532d"/>`,star:`
    <path d="m12 2 3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z" fill="#facc15" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="m12 2 3 6.5 7 1-5 4.8" fill="#fde68a"/>`,starOff:`
    <path d="m12 2 3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z" fill="#6b7280" stroke="${H}" stroke-width="0.8" stroke-linejoin="round" opacity=".6"/>`,gem:`
    <path d="M6 3h12l3 6-9 12L3 9z" fill="#38bdf8" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M3 9h18" stroke="${H}" stroke-width="0.6"/>
    <path d="M9 3 6 9l6 12" fill="#0ea5e9" opacity=".6"/>
    <path d="M15 3l3 6-6 12" fill="#7dd3fc" opacity=".5"/>
    <path d="M6 3h12l-1.5 3h-9z" fill="#bae6fd"/>`,crown:`
    <path d="M2 7l4 4 4-6 4 6 4-4 1.5 12H3.5z" fill="#ffd166" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <circle cx="6" cy="11" r="1" fill="#dc2626"/>
    <circle cx="12" cy="9" r="1" fill="#22c55e"/>
    <circle cx="18" cy="11" r="1" fill="#3b82f6"/>
    <rect x="3.5" y="17" width="17" height="2" fill="#b88c1a"/>`,trophy:`
    <path d="M8 4h8v6a4 4 0 1 1-8 0z" fill="#ffd166" stroke="${H}" stroke-width="0.8"/>
    <path d="M8 6H4v2a3 3 0 0 0 3 3" fill="none" stroke="${H}" stroke-width="1"/>
    <path d="M16 6h4v2a3 3 0 0 1-3 3" fill="none" stroke="${H}" stroke-width="1"/>
    <rect x="10" y="17" width="4" height="3" fill="#b88c1a" stroke="${H}" stroke-width="0.6"/>
    <rect x="8" y="20" width="8" height="2" fill="#78350f" stroke="${H}" stroke-width="0.6"/>`,refresh:`
    <path d="M21 12a9 9 0 1 1-3-6.7" fill="none" stroke="#3b82f6" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M21 3v6h-6" fill="none" stroke="#3b82f6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,x:`<path d="M6 6l12 12M6 18 18 6" stroke="#ef4444" stroke-width="2.4" stroke-linecap="round"/>`,pause:`
    <rect x="6" y="5" width="4" height="14" rx="1" fill="#94a3b8" stroke="${H}" stroke-width="0.6"/>
    <rect x="14" y="5" width="4" height="14" rx="1" fill="#94a3b8" stroke="${H}" stroke-width="0.6"/>`,play:`<path d="m6 4 14 8-14 8z" fill="#22c55e" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>`,check:`<path d="m4 12 5 5L20 6" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,scroll:`
    <path d="M4 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4z" fill="#fef3c7" stroke="${H}" stroke-width="0.8"/>
    <path d="M8 8h8M8 12h8M8 16h5" stroke="#78350f" stroke-width="1" stroke-linecap="round"/>`,globe:`
    <circle cx="12" cy="12" r="9" fill="#3b82f6" stroke="${H}" stroke-width="0.8"/>
    <path d="M5 9c2-1 4-1 7-1s5 0 7 1M5 15c2 1 4 1 7 1s5 0 7-1" stroke="#1d4ed8" stroke-width="0.6" fill="none"/>
    <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="#1d4ed8" stroke-width="0.6"/>
    <path d="M7 7c1-1 3-1 5 1s4 1 5-1c0 4-2 5-5 5s-4-1-5-5z" fill="#22c55e" opacity=".8"/>
    <path d="M9 15c1 1 2 2 4 2s3-1 3-2c-1 2-3 2-4 2s-2 0-3-2z" fill="#22c55e" opacity=".8"/>`,people:`
    <circle cx="8" cy="7" r="3" fill="#f4c89a" stroke="${H}" stroke-width="0.6"/>
    <circle cx="16" cy="8" r="2.5" fill="#f4c89a" stroke="${H}" stroke-width="0.6"/>
    <path d="M2 20a6 6 0 0 1 12 0z" fill="#3b82f6" stroke="${H}" stroke-width="0.6"/>
    <path d="M11 20a5 5 0 0 1 10 0z" fill="#a855f7" stroke="${H}" stroke-width="0.6"/>`,dot:`<circle cx="12" cy="12" r="3" fill="#6b7280"/>`,burger:`
    <path d="M3 11a9 5 0 1 1 18 0z" fill="#d4a574" stroke="${H}" stroke-width="0.8"/>
    <circle cx="8" cy="7" r=".5" fill="#fff"/>
    <circle cx="12" cy="6" r=".5" fill="#fff"/>
    <circle cx="16" cy="7" r=".5" fill="#fff"/>
    <path d="M3 12h18l-1 2H4z" fill="#22c55e"/>
    <path d="M3 14h18v2H3z" fill="#7c2d12"/>
    <path d="M3 16h18v1H3z" fill="#facc15"/>
    <path d="M3 17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" fill="#d4a574" stroke="${H}" stroke-width="0.8"/>`,bag:`
    <path d="M5 8h14l-1 13H6z" fill="#dc2626" stroke="${H}" stroke-width="0.8"/>
    <path d="M8 8V6a4 4 0 0 1 8 0v2" fill="none" stroke="#7f1d1d" stroke-width="1.4"/>
    <path d="M9 12h6v2H9z" fill="#fff" opacity=".4"/>`,theater:`
    <circle cx="12" cy="12" r="9" fill="#fde68a" stroke="${H}" stroke-width="0.8"/>
    <circle cx="9" cy="10" r="1" fill="${H}"/>
    <circle cx="15" cy="10" r="1" fill="${H}"/>
    <path d="M8 14c1 2 2 3 4 3s3-1 4-3" fill="none" stroke="${H}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M9 6c0-1 1-2 3-2s3 1 3 2z" fill="#dc2626"/>`,hospitalCross:`
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <rect x="10" y="6" width="4" height="12" fill="#dc2626"/>
    <rect x="6" y="10" width="12" height="4" fill="#dc2626"/>`,lemon:`
    <ellipse cx="12" cy="13" rx="7" ry="5" transform="rotate(-20 12 13)" fill="#facc15" stroke="${H}" stroke-width="0.8"/>
    <ellipse cx="10" cy="11" rx="3" ry="1.5" transform="rotate(-20 10 11)" fill="#fef08a"/>
    <path d="M16 5l-1 3M18 6l-2 2" stroke="#15803d" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M15 7c1-1 3-1 3 0s-2 1-3 0z" fill="#22c55e"/>`,shoe:`
    <path d="M3 17l1-7 5-2 4 4 7 1v5z" fill="#78350f" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M3 19h18v1H3z" fill="#1a1a1a"/>
    <path d="M9 8l3 3" stroke="#fde68a" stroke-width="0.8"/>
    <circle cx="6" cy="14" r=".5" fill="#fde68a"/>
    <circle cx="9" cy="14" r=".5" fill="#fde68a"/>`,coffee:`
    <path d="M3 9h14v6a5 5 0 0 1-10 0z" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <path d="M4 10h12v5a4 4 0 0 1-8 0z" fill="#78350f"/>
    <ellipse cx="10" cy="10" rx="6" ry="1" fill="#4a2511"/>
    <path d="M17 11h2a2 2 0 0 1 0 4h-2" fill="none" stroke="${H}" stroke-width="1.4"/>
    <path d="M7 4c-1 1 0 2 0 3M11 4c-1 1 0 2 0 3" stroke="#9aa4b2" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,newspaper:`
    <rect x="3" y="5" width="18" height="14" rx="1" fill="#f5f5dc" stroke="${H}" stroke-width="0.8"/>
    <rect x="5" y="7" width="14" height="2.5" fill="${H}"/>
    <path d="M5 11h8M5 13h8M5 15h8M5 17h6" stroke="${H}" stroke-width="0.7"/>
    <rect x="15" y="11" width="4" height="6" fill="#9aa4b2"/>`,carrot:`
    <path d="M5 19l8-8 2 2-8 8z" fill="#ea580c" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M7 17l5-5" stroke="#9a3412" stroke-width="0.6"/>
    <path d="M13 11l3-3 4 4-3 3z" fill="#22c55e" stroke="${H}" stroke-width="0.8"/>
    <path d="M14 6l3-3M17 5l3-3M19 9l3-3" stroke="#15803d" stroke-width="1.2" stroke-linecap="round"/>`,scissors:`
    <circle cx="6" cy="6" r="3" fill="none" stroke="#dc2626" stroke-width="1.8"/>
    <circle cx="6" cy="18" r="3" fill="none" stroke="#dc2626" stroke-width="1.8"/>
    <path d="M8.5 8.5 20 20M8.5 15.5 20 4" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>`,car:`
    <path d="M3 16l2-6h14l2 6v3H3z" fill="#dc2626" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M6 10h12l1 3H5z" fill="#bae6fd"/>
    <path d="M5 13h14v1H5z" fill="${H}"/>
    <circle cx="7" cy="19" r="1.8" fill="${H}"/>
    <circle cx="7" cy="19" r=".8" fill="#9aa4b2"/>
    <circle cx="17" cy="19" r="1.8" fill="${H}"/>
    <circle cx="17" cy="19" r=".8" fill="#9aa4b2"/>
    <rect x="4" y="15" width="1" height="1" fill="#fef08a"/>`,bandage:`
    <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-30 12 12)" fill="#f4c89a" stroke="${H}" stroke-width="0.8"/>
    <rect x="9" y="9" width="6" height="6" transform="rotate(-30 12 12)" fill="#fde68a"/>
    <circle cx="10" cy="11" r=".5" fill="#7c2d12"/>
    <circle cx="13" cy="13" r=".5" fill="#7c2d12"/>
    <circle cx="12" cy="12" r=".5" fill="#7c2d12"/>`,thread:`
    <rect x="9" y="3" width="6" height="14" rx="1" fill="#a78bfa" stroke="${H}" stroke-width="0.8"/>
    <ellipse cx="12" cy="3" rx="3" ry="1" fill="#7c3aed"/>
    <ellipse cx="12" cy="17" rx="3" ry="1" fill="#7c3aed"/>
    <path d="M10 5h4M10 8h4M10 11h4M10 14h4" stroke="#fff" stroke-width="0.5"/>
    <path d="M15 12c3 2 4 5 2 7" stroke="#a78bfa" stroke-width="1" fill="none"/>`,pizza:`
    <path d="M3 21l9-18 9 18z" fill="#fde68a" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M5 19l7-13 7 13z" fill="#dc2626"/>
    <circle cx="9" cy="14" r="1" fill="#a16207"/>
    <circle cx="14" cy="13" r="1" fill="#a16207"/>
    <circle cx="12" cy="17" r="1" fill="#a16207"/>
    <circle cx="11" cy="11" r=".6" fill="#fff"/>
    <circle cx="15" cy="17" r=".6" fill="#fff"/>`,bee:`
    <ellipse cx="12" cy="14" rx="5" ry="6" fill="#facc15" stroke="${H}" stroke-width="0.8"/>
    <path d="M7 11h10M7 14h10M7 17h10" stroke="${H}" stroke-width="1.4"/>
    <ellipse cx="6" cy="11" rx="3" ry="2" fill="#fff" opacity=".8" stroke="${H}" stroke-width="0.5"/>
    <ellipse cx="18" cy="11" rx="3" ry="2" fill="#fff" opacity=".8" stroke="${H}" stroke-width="0.5"/>
    <circle cx="10" cy="11" r=".5" fill="${H}"/>
    <circle cx="14" cy="11" r=".5" fill="${H}"/>`,pill:`
    <rect x="1" y="10" width="22" height="4" rx="2" transform="rotate(-30 12 12)" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <path d="M12 4l8 8" stroke="${H}" stroke-width="0.8"/>
    <path d="M14 6l-8 8a3 3 0 0 1-4-4l8-8a3 3 0 0 1 4 4z" fill="#dc2626" opacity=".9"/>`,cash:`
    <rect x="3" y="6" width="18" height="12" rx="1" fill="#22c55e" stroke="${H}" stroke-width="0.8"/>
    <rect x="4" y="7" width="16" height="10" fill="none" stroke="#15803d" stroke-width="0.6"/>
    <circle cx="12" cy="12" r="3" fill="#dcfce7" stroke="#15803d" stroke-width="0.6"/>
    <text x="12" y="14.5" font-size="5" font-weight="800" text-anchor="middle" fill="#15803d">$</text>
    <circle cx="6" cy="9" r=".5" fill="#15803d"/>
    <circle cx="18" cy="15" r=".5" fill="#15803d"/>`,joystick:`
    <rect x="3" y="14" width="18" height="6" rx="1" fill="#1f2937" stroke="${H}" stroke-width="0.8"/>
    <rect x="11" y="8" width="2" height="6" fill="#6b7280"/>
    <circle cx="12" cy="7" r="2.5" fill="#dc2626" stroke="${H}" stroke-width="0.8"/>
    <circle cx="7" cy="17" r="1" fill="#facc15"/>
    <circle cx="10" cy="17" r="1" fill="#22c55e"/>
    <circle cx="13" cy="17" r="1" fill="#3b82f6"/>
    <circle cx="16" cy="17" r="1" fill="#dc2626"/>`,donut:`
    <circle cx="12" cy="12" r="9" fill="#fbbf24" stroke="${H}" stroke-width="0.8"/>
    <path d="M12 3a9 9 0 0 1 9 9c0-1-1-2-2-3s-3-1-4 0-2 3-4 3-3-2-4-3-3-1-4-1c1-3 5-5 9-5z" fill="#fda4af"/>
    <circle cx="12" cy="12" r="3" fill="#0e1116" stroke="${H}" stroke-width="0.6"/>
    <rect x="7" y="6" width="1" height="2" fill="#22c55e" transform="rotate(20 7 6)"/>
    <rect x="14" y="5" width="1" height="2" fill="#3b82f6" transform="rotate(-20 14 5)"/>
    <rect x="9" y="8" width="1" height="2" fill="#dc2626" transform="rotate(60 9 8)"/>
    <rect x="16" y="9" width="1" height="2" fill="#facc15"/>`,taxi:`
    <rect x="9" y="5" width="6" height="2" fill="${H}"/>
    <rect x="10" y="3" width="4" height="2" fill="#facc15" stroke="${H}" stroke-width="0.6"/>
    <path d="M3 16l2-6h14l2 6v3H3z" fill="#facc15" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M6 10h12l1 3H5z" fill="#bae6fd"/>
    <path d="M5 13h14v1H5z" fill="${H}"/>
    <rect x="11" y="10" width="2" height="3" fill="${H}"/>
    <circle cx="7" cy="19" r="1.8" fill="${H}"/>
    <circle cx="17" cy="19" r="1.8" fill="${H}"/>`,phone:`
    <rect x="6" y="2" width="12" height="20" rx="2" fill="#1f2937" stroke="${H}" stroke-width="0.8"/>
    <rect x="7.5" y="5" width="9" height="13" fill="#38bdf8"/>
    <path d="M7.5 5h9v3h-9z" fill="#0ea5e9"/>
    <rect x="9" y="10" width="2" height="2" fill="#fff"/>
    <rect x="12" y="10" width="2" height="2" fill="#fff"/>
    <rect x="9" y="13" width="2" height="2" fill="#fff"/>
    <rect x="12" y="13" width="2" height="2" fill="#fff"/>
    <circle cx="12" cy="20" r=".8" fill="#6b7280"/>`,wheat:`
    <path d="M12 22V8" stroke="#a16207" stroke-width="1.4"/>
    <ellipse cx="9" cy="10" rx="1.5" ry="2" fill="#facc15" stroke="${H}" stroke-width="0.4"/>
    <ellipse cx="15" cy="10" rx="1.5" ry="2" fill="#facc15" stroke="${H}" stroke-width="0.4"/>
    <ellipse cx="9" cy="14" rx="1.5" ry="2" fill="#facc15" stroke="${H}" stroke-width="0.4"/>
    <ellipse cx="15" cy="14" rx="1.5" ry="2" fill="#facc15" stroke="${H}" stroke-width="0.4"/>
    <ellipse cx="9" cy="18" rx="1.5" ry="2" fill="#facc15" stroke="${H}" stroke-width="0.4"/>
    <ellipse cx="15" cy="18" rx="1.5" ry="2" fill="#facc15" stroke="${H}" stroke-width="0.4"/>
    <ellipse cx="12" cy="6" rx="2" ry="3" fill="#fbbf24" stroke="${H}" stroke-width="0.4"/>`,grape:`
    <path d="M12 5l2-3" stroke="#78350f" stroke-width="1" stroke-linecap="round"/>
    <path d="M14 4c1-1 3-1 4 0" fill="none" stroke="#22c55e" stroke-width="1.2"/>
    <circle cx="12" cy="8" r="2" fill="#7c3aed" stroke="${H}" stroke-width="0.4"/>
    <circle cx="9" cy="11" r="2" fill="#7c3aed" stroke="${H}" stroke-width="0.4"/>
    <circle cx="15" cy="11" r="2" fill="#7c3aed" stroke="${H}" stroke-width="0.4"/>
    <circle cx="7" cy="15" r="2" fill="#a855f7" stroke="${H}" stroke-width="0.4"/>
    <circle cx="12" cy="15" r="2" fill="#a855f7" stroke="${H}" stroke-width="0.4"/>
    <circle cx="17" cy="15" r="2" fill="#a855f7" stroke="${H}" stroke-width="0.4"/>
    <circle cx="10" cy="19" r="2" fill="#7c3aed" stroke="${H}" stroke-width="0.4"/>
    <circle cx="14" cy="19" r="2" fill="#7c3aed" stroke="${H}" stroke-width="0.4"/>`,tooth:`
    <path d="M7 3c2 0 3 2 5 2s3-2 5-2c2 0 4 2 3 5l-2 8c-1 4-3 6-4 6s-1-4-2-7c-1 3-1 7-2 7s-3-2-4-6L4 8c-1-3 1-5 3-5z" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <path d="M9 6c2-1 4-1 6 0" stroke="#bae6fd" stroke-width="0.6" fill="none"/>`,bowling:`
    <circle cx="12" cy="12" r="9" fill="#1f2937" stroke="${H}" stroke-width="0.8"/>
    <circle cx="9" cy="9" r=".8" fill="#fff"/>
    <circle cx="12" cy="8" r=".8" fill="#fff"/>
    <circle cx="8" cy="12" r=".8" fill="#fff"/>
    <ellipse cx="9" cy="8" rx="3" ry="1.5" fill="#fff" opacity=".15"/>`,shrimp:`
    <path d="M4 12c0-5 4-8 9-8s8 3 8 7-3 7-7 7l-2 3-1-3a8 8 0 0 1-7-6z" fill="#fb7185" stroke="${H}" stroke-width="0.8"/>
    <path d="M6 12c0-4 3-6 7-6" fill="none" stroke="#be123c" stroke-width="0.8"/>
    <circle cx="17" cy="9" r=".6" fill="${H}"/>
    <path d="M19 7l3-2M20 9l3-1" stroke="${H}" stroke-width="0.8"/>`,hammer:`
    <path d="M14 2l8 8-3 3-2-2-9 9-3-3 9-9-2-2z" fill="#9aa4b2" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="m8 11 5 5" stroke="${H}" stroke-width="0.6"/>
    <path d="M5 17l-3 3 3 3 3-3" fill="#78350f" stroke="${H}" stroke-width="0.8"/>`,fuel:`
    <rect x="3" y="3" width="12" height="18" rx="1" fill="#dc2626" stroke="${H}" stroke-width="0.8"/>
    <rect x="4" y="5" width="10" height="4" fill="#fef3c7"/>
    <path d="M5 6h8M5 8h8" stroke="${H}" stroke-width="0.5"/>
    <path d="M15 8l3 3v8a2 2 0 0 1-4 0v-5" fill="none" stroke="${H}" stroke-width="1.4"/>
    <circle cx="9" cy="16" r=".6" fill="${H}"/>`,ring:`
    <circle cx="12" cy="17" r="4" fill="none" stroke="#ffd166" stroke-width="2.4"/>
    <path d="M9 8l3-5 3 5z" fill="#bae6fd" stroke="${H}" stroke-width="0.6"/>
    <path d="M9 8l3 4 3-4" fill="#7dd3fc" stroke="${H}" stroke-width="0.4"/>`,hospitalBldg:`
    <rect x="3" y="6" width="18" height="15" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <rect x="10" y="10" width="4" height="6" fill="#dc2626"/>
    <rect x="8" y="12" width="8" height="2" fill="#dc2626"/>
    <path d="M3 10h18M3 16h18" stroke="#9aa4b2" stroke-width="0.4"/>
    <rect x="5" y="18" width="3" height="3" fill="#0ea5e9"/>
    <rect x="16" y="18" width="3" height="3" fill="#0ea5e9"/>`,disco:`
    <circle cx="12" cy="13" r="7" fill="#94a3b8" stroke="${H}" stroke-width="0.8"/>
    <path d="M5 13h14M12 6v14M7 8l10 10M17 8 7 18" stroke="${H}" stroke-width="0.5"/>
    <circle cx="9" cy="10" r="1" fill="#fde68a"/>
    <circle cx="15" cy="11" r="1" fill="#fda4af"/>
    <circle cx="10" cy="15" r="1" fill="#bae6fd"/>
    <path d="M12 3v3" stroke="${H}" stroke-width="0.8"/>`,cow:`
    <ellipse cx="12" cy="14" rx="7" ry="5" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <path d="M8 12a2 2 0 0 0 0 4z" fill="${H}"/>
    <path d="M15 15a2 2 0 0 1 3 1l-3 .5z" fill="${H}"/>
    <path d="M5 9l2 2M19 9l-2 2" stroke="${H}" stroke-width="1.4"/>
    <ellipse cx="6" cy="8" rx="1.5" ry="1" fill="#fda4af"/>
    <ellipse cx="18" cy="8" rx="1.5" ry="1" fill="#fda4af"/>
    <circle cx="10" cy="14" r=".5" fill="${H}"/>
    <circle cx="14" cy="14" r=".5" fill="${H}"/>
    <ellipse cx="12" cy="17" rx="2" ry="1" fill="#fda4af"/>`,hotel:`
    <rect x="3" y="6" width="18" height="15" fill="#d4a574" stroke="${H}" stroke-width="0.8"/>
    <rect x="3" y="6" width="18" height="2" fill="#92400e"/>
    <rect x="6" y="9" width="2" height="2" fill="#fde68a"/>
    <rect x="10" y="9" width="2" height="2" fill="#fde68a"/>
    <rect x="14" y="9" width="2" height="2" fill="#fde68a"/>
    <rect x="18" y="9" width="1.5" height="2" fill="#fde68a"/>
    <rect x="6" y="13" width="2" height="2" fill="#fde68a"/>
    <rect x="10" y="13" width="2" height="2" fill="#fde68a"/>
    <rect x="14" y="13" width="2" height="2" fill="#fde68a"/>
    <rect x="18" y="13" width="1.5" height="2" fill="#fde68a"/>
    <rect x="10" y="17" width="4" height="4" fill="#7c2d12"/>
    <circle cx="13" cy="19" r=".4" fill="#facc15"/>`,ambulance:`
    <path d="M3 16V8h12v8z" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <path d="M15 11h4l2 3v2h-6z" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <rect x="3" y="14" width="18" height="2" fill="#dc2626"/>
    <rect x="7" y="10" width="2" height="3" fill="#dc2626"/>
    <rect x="6" y="11" width="4" height="1" fill="#dc2626"/>
    <rect x="4" y="6" width="2" height="2" fill="#3b82f6"/>
    <circle cx="7" cy="18" r="1.8" fill="${H}"/>
    <circle cx="7" cy="18" r=".7" fill="#9aa4b2"/>
    <circle cx="17" cy="18" r="1.8" fill="${H}"/>
    <circle cx="17" cy="18" r=".7" fill="#9aa4b2"/>`,hockey:`
    <path d="M4 20 18 6l3 3-14 14z" fill="#92400e" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M18 6l3 3" stroke="#fde68a" stroke-width="0.4"/>
    <ellipse cx="6" cy="21" rx="2.5" ry="1" fill="${H}" stroke="${H}" stroke-width="0.4"/>`,apartments:`
    <rect x="4" y="3" width="16" height="18" fill="#9ca3af" stroke="${H}" stroke-width="0.8"/>
    <rect x="4" y="3" width="16" height="2" fill="#6b7280"/>
    <rect x="6" y="6" width="2" height="2" fill="#bae6fd"/>
    <rect x="10" y="6" width="2" height="2" fill="#bae6fd"/>
    <rect x="14" y="6" width="2" height="2" fill="#fde68a"/>
    <rect x="6" y="10" width="2" height="2" fill="#fde68a"/>
    <rect x="10" y="10" width="2" height="2" fill="#bae6fd"/>
    <rect x="14" y="10" width="2" height="2" fill="#bae6fd"/>
    <rect x="6" y="14" width="2" height="2" fill="#bae6fd"/>
    <rect x="10" y="14" width="2" height="2" fill="#fde68a"/>
    <rect x="14" y="14" width="2" height="2" fill="#bae6fd"/>
    <rect x="10" y="18" width="4" height="3" fill="#7c2d12"/>`,cloud:`
    <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1 4 4 0 0 1 .5 8z" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <path d="M7 14c1-2 3-3 5-2" fill="none" stroke="#bae6fd" stroke-width="0.6"/>`,house:`
    <path d="M3 11l9-8 9 8v10H3z" fill="#fde68a" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M2 12l10-9 10 9-1 1-9-8-9 8z" fill="#dc2626" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <rect x="10" y="14" width="4" height="7" fill="#7c2d12"/>
    <circle cx="13" cy="17.5" r=".3" fill="#fde68a"/>
    <rect x="5" y="13" width="3" height="3" fill="#bae6fd"/>
    <rect x="16" y="13" width="3" height="3" fill="#bae6fd"/>`,movie:`
    <rect x="3" y="9" width="18" height="12" fill="#1f2937" stroke="${H}" stroke-width="0.8"/>
    <path d="m3 9 3-4h2l-2 4M9 9l3-4h2l-3 4M15 9l3-4h2l-3 4" fill="#1f2937" stroke="${H}" stroke-width="0.8"/>
    <rect x="3" y="5" width="3" height="4" fill="#fff" transform="skewX(-25) translate(2 0)"/>
    <rect x="3" y="14" width="18" height="2" fill="#9aa4b2"/>
    <rect x="3" y="18" width="18" height="1" fill="#6b7280"/>`,shop:`
    <path d="M3 9l2-4h14l2 4v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" fill="#dc2626" stroke="${H}" stroke-width="0.8"/>
    <path d="M5 11v10h14V11" fill="#fde68a" stroke="${H}" stroke-width="0.8"/>
    <rect x="10" y="14" width="4" height="7" fill="#7c2d12"/>
    <circle cx="13" cy="17.5" r=".3" fill="#facc15"/>
    <rect x="6" y="13" width="3" height="4" fill="#bae6fd"/>
    <rect x="15" y="13" width="3" height="4" fill="#bae6fd"/>`,chart:`
    <rect x="3" y="3" width="18" height="18" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <path d="M3 17l6-6 4 4 8-8" fill="none" stroke="#22c55e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 7h7v7" fill="none" stroke="#22c55e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="9" cy="11" r="1" fill="#15803d"/>
    <circle cx="13" cy="15" r="1" fill="#15803d"/>`,sun:`
    <circle cx="12" cy="12" r="5" fill="#facc15" stroke="${H}" stroke-width="0.8"/>
    <circle cx="12" cy="12" r="3" fill="#fef08a"/>
    <path d="M12 1v4M12 19v4M1 12h4M19 12h4M4 4l3 3M17 17l3 3M4 20l3-3M17 7l3-3" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>`,laptop:`
    <rect x="4" y="5" width="16" height="11" rx="1" fill="#1f2937" stroke="${H}" stroke-width="0.8"/>
    <rect x="5" y="6" width="14" height="9" fill="#38bdf8"/>
    <path d="M5 6h14v2H5z" fill="#0284c7"/>
    <path d="M2 19h20l-1-3H3z" fill="#9aa4b2" stroke="${H}" stroke-width="0.8"/>
    <rect x="10" y="17" width="4" height="1" fill="#6b7280"/>`,ship:`
    <path d="M5 17V9l7-3 7 3v8z" fill="#fff" stroke="${H}" stroke-width="0.8"/>
    <path d="M5 9l7-3 7 3" fill="#dc2626"/>
    <rect x="8" y="11" width="2" height="2" fill="#0ea5e9"/>
    <rect x="11" y="11" width="2" height="2" fill="#0ea5e9"/>
    <rect x="14" y="11" width="2" height="2" fill="#0ea5e9"/>
    <path d="M12 6V3l4 2" fill="#dc2626" stroke="${H}" stroke-width="0.4"/>
    <path d="M3 17l1 3a2 2 0 0 0 2 1h12a2 2 0 0 0 2-1l1-3z" fill="#1d4ed8" stroke="${H}" stroke-width="0.8"/>
    <path d="M3 19c2 1 4-1 6 0s4 1 6 0 4 1 6 0" fill="none" stroke="#bae6fd" stroke-width="0.6"/>`,bank:`
    <path d="M12 3 3 8h18z" fill="#fef3c7" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <rect x="3" y="8" width="18" height="2" fill="#9aa4b2"/>
    <rect x="5" y="10" width="2" height="8" fill="#fff" stroke="${H}" stroke-width="0.5"/>
    <rect x="11" y="10" width="2" height="8" fill="#fff" stroke="${H}" stroke-width="0.5"/>
    <rect x="17" y="10" width="2" height="8" fill="#fff" stroke="${H}" stroke-width="0.5"/>
    <rect x="3" y="18" width="18" height="2" fill="#9aa4b2"/>
    <rect x="3" y="20" width="18" height="1" fill="${H}"/>
    <circle cx="12" cy="6" r=".8" fill="#dc2626"/>`,buildings:`
    <rect x="3" y="9" width="8" height="12" fill="#6b7280" stroke="${H}" stroke-width="0.8"/>
    <rect x="13" y="3" width="8" height="18" fill="#9ca3af" stroke="${H}" stroke-width="0.8"/>
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
    <rect x="15" y="17" width="1.5" height="2" fill="#fde68a"/>`,robot:`
    <rect x="5" y="7" width="14" height="12" rx="2" fill="#9aa4b2" stroke="${H}" stroke-width="0.8"/>
    <rect x="7" y="9" width="10" height="5" rx="1" fill="#1f2937"/>
    <circle cx="10" cy="11.5" r="1" fill="#22c55e"/>
    <circle cx="14" cy="11.5" r="1" fill="#22c55e"/>
    <rect x="9" y="16" width="6" height="1.5" fill="${H}"/>
    <rect x="11" y="3" width="2" height="3" fill="#6b7280"/>
    <circle cx="12" cy="3" r=".8" fill="#dc2626"/>
    <rect x="3" y="11" width="2" height="4" fill="#6b7280"/>
    <rect x="19" y="11" width="2" height="4" fill="#6b7280"/>`,plane:`
    <path d="m21 16-9 3v-5L4 11l1-2 7 1V5l2-1v6l7-1 1 2-7 3v5z" fill="#fff" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M12 5V4l1 1" fill="#dc2626"/>
    <circle cx="12" cy="9" r=".6" fill="#bae6fd"/>
    <circle cx="14" cy="9" r=".6" fill="#bae6fd"/>`,oilBarrel:`
    <ellipse cx="12" cy="4" rx="7" ry="2" fill="#374151" stroke="${H}" stroke-width="0.8"/>
    <path d="M5 4v16c0 1 3 2 7 2s7-1 7-2V4z" fill="#1f2937" stroke="${H}" stroke-width="0.8"/>
    <path d="M5 10c0 1 3 2 7 2s7-1 7-2" stroke="${H}" stroke-width="0.6" fill="none"/>
    <path d="M5 16c0 1 3 2 7 2s7-1 7-2" stroke="${H}" stroke-width="0.6" fill="none"/>
    <rect x="9" y="8" width="6" height="6" fill="#dc2626" opacity=".7"/>
    <text x="12" y="13" font-size="4" font-weight="800" text-anchor="middle" fill="#fff">OIL</text>`,shield:`
    <path d="m12 2 8 3v7c0 5-4 9-8 10-4-1-8-5-8-10V5z" fill="#3b82f6" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="m12 2 8 3v7c0 5-4 9-8 10z" fill="#1d4ed8" opacity=".6"/>
    <path d="M8 11l3 3 5-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,chip:`
    <rect x="6" y="6" width="12" height="12" rx="1" fill="#15803d" stroke="${H}" stroke-width="0.8"/>
    <rect x="9" y="9" width="6" height="6" fill="#22c55e" stroke="${H}" stroke-width="0.6"/>
    <rect x="10.5" y="10.5" width="3" height="3" fill="#0e1116"/>
    <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" stroke="#6b7280" stroke-width="1.4" stroke-linecap="round"/>`,ufo:`
    <ellipse cx="12" cy="14" rx="9" ry="3" fill="#9aa4b2" stroke="${H}" stroke-width="0.8"/>
    <path d="M7 13a5 4 0 0 1 10 0z" fill="#bae6fd" stroke="${H}" stroke-width="0.8"/>
    <circle cx="9" cy="11" r=".6" fill="#374151"/>
    <circle cx="15" cy="11" r=".6" fill="#374151"/>
    <circle cx="6" cy="15" r=".6" fill="#facc15"/>
    <circle cx="12" cy="16" r=".6" fill="#22c55e"/>
    <circle cx="18" cy="15" r=".6" fill="#dc2626"/>
    <path d="M9 17l-2 4M15 17l2 4M12 17v5" stroke="#22c55e" stroke-width="1" opacity=".6"/>`,rocket:`
    <path d="M12 2c3 3 5 7 5 11l-2 2v4l-3-2-3 2v-4l-2-2c0-4 2-8 5-11z" fill="#fff" stroke="${H}" stroke-width="0.8" stroke-linejoin="round"/>
    <circle cx="12" cy="10" r="1.5" fill="#38bdf8" stroke="${H}" stroke-width="0.6"/>
    <path d="M7 15l-2 4 4-1M17 15l2 4-4-1" fill="#ef4444" stroke="${H}" stroke-width="0.6"/>
    <path d="M10 19h4l-2 4z" fill="#facc15"/>`,atom:`
    <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="#3b82f6" stroke-width="1.2"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="#22c55e" stroke-width="1.2" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.5" fill="none" stroke="#ef4444" stroke-width="1.2" transform="rotate(120 12 12)"/>
    <circle cx="12" cy="12" r="2" fill="#facc15" stroke="${H}" stroke-width="0.6"/>`},Ke={"💼":`briefcase`,"🏭":`factory`,"⚡":`bolt`,"💰":`coin`,"👔":`manager`,"👷":`worker`,"💸":`salary`,"🔥":`fire`,"⚠":`warning`,"⚠️":`warning`,"📦":`package`,"🔒":`lock`,"🔓":`unlock`,"★":`star`,"☆":`starOff`,"💎":`gem`,"👑":`crown`,"🏆":`trophy`,"⟲":`refresh`,"✕":`x`,"×":`x`,"⏸":`pause`,"▶":`play`,"✓":`check`,"📜":`scroll`,"🌐":`globe`,"🧑‍🤝‍🧑":`people`,"📂":`package`,"🪙":`coin`,"⚛":`atom`,"⚛️":`atom`,"🍔":`burger`,"🛍":`bag`,"🛍️":`bag`,"🌾":`wheat`,"🏥":`hospitalCross`,"🎭":`theater`,"🏠":`house`,"💻":`laptop`,"🏦":`bank`,"✈":`plane`,"✈️":`plane`,"🍋":`lemon`,"👞":`shoe`,"☕":`coffee`,"📰":`newspaper`,"🥕":`carrot`,"💈":`scissors`,"🚗":`car`,"🩹":`bandage`,"🧵":`thread`,"🍕":`pizza`,"🐝":`bee`,"💊":`pill`,"💵":`cash`,"🕹":`joystick`,"🕹️":`joystick`,"🍩":`donut`,"🚕":`taxi`,"📱":`phone`,"🍇":`grape`,"🦷":`tooth`,"🎳":`bowling`,"🦐":`shrimp`,"🔨":`hammer`,"⛽":`fuel`,"💍":`ring`,"🪩":`disco`,"🐄":`cow`,"🏨":`hotel`,"🚑":`ambulance`,"🏒":`hockey`,"🏢":`apartments`,"☁":`cloud`,"☁️":`cloud`,"🎬":`movie`,"🏬":`shop`,"📈":`chart`,"☀":`sun`,"☀️":`sun`,"🚢":`ship`,"🏘":`buildings`,"🏘️":`buildings`,"🤖":`robot`,"🛢":`oilBarrel`,"🛢️":`oilBarrel`,"🛡":`shield`,"🛡️":`shield`,"💾":`chip`,"🛸":`ufo`,"🚀":`rocket`},qe=e=>e.replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);function U(e,t={}){let n=Ge[e]??Ge.dot,r=t.size??16,i=`icon${t.cls?` `+t.cls:``}`,a=t.title?`<title>${qe(t.title)}</title>`:``;return`<svg class="${i}" xmlns="http://www.w3.org/2000/svg" width="${r}" height="${r}" viewBox="0 0 24 24" ${t.title?`role="img" aria-label="${qe(t.title)}"`:`aria-hidden="true"`}>${a}${n}</svg>`}function W(e,t={}){return U(Ke[e.trim()]??`dot`,t)}var Je={Food:`burger`,Lifestyle:`bag`,Agriculture:`wheat`,Health:`hospitalCross`,Entertainment:`theater`,"Real Estate":`house`,Tech:`laptop`,Finance:`bank`,Travel:`plane`,Energy:`bolt`};function Ye(e,t,n){if(!t.unlocked)return{mgr:!1,emp:!1};let r=!t.hasManager&&n>=e.managerCost,i=F(e),a=t.hiringUntil!==null;return{mgr:r,emp:t.employees<i&&!a&&n>=Ee(e,t.employees)}}function Xe(e,t,n,r){if(!t.unlocked)return n>=e.unlockCost;if(t.count===0)return n>=e.baseCost;let i=r===`max`?N(e,t.count,n):r;return i<=0?!1:n>=M(e,t.count,Math.max(1,i))}function Ze(e,t,r){let i=0;for(let a of n){if((a.category??`Misc`)!==e)continue;let n=t.industries[a.id];Xe(a,n,t.money,r)&&i++}return i}function Qe(){let e=new Set,t=[];for(let r of n){let n=r.category??`Misc`;e.has(n)||(e.add(n),t.push(n))}return t}function $e(e,t){let n={state:e,buyQty:1,tab:`industries`,industryCategory:Qe()[0]??`Food`,upgradeGroup:`customer`,notify:t},r=document.getElementById(`app`);r.innerHTML=et(),tt(n,r);let i=()=>G(n,r);return i(),{render:i,tick:()=>st(n,r),ui:n}}function et(){return`
    <header class="topbar">
      <div class="brand">
        <span class="logo">${U(`briefcase`,{size:26})}</span>
        <span class="title">Entrepreneur Tycoon</span>
      </div>
      <div class="money">
        <div class="money-amount" id="money">$0</div>
        <div class="money-rate" id="rate">$0/s</div>
        <div class="money-salary" id="salary" title="Payroll outflow per second">
          <span class="sal-line"><span class="sal-icon">${U(`manager`,{size:14})}</span><span class="sal-val" id="sal-mgr">-$0/s</span></span>
          <span class="sal-op">+</span>
          <span class="sal-line"><span class="sal-icon">${U(`worker`,{size:14})}</span><span class="sal-val" id="sal-emp">-$0/s</span></span>
          <span class="sal-op">=</span>
          <span class="sal-line sal-total"><span class="sal-icon">${U(`salary`,{size:14})}</span><span class="sal-val" id="sal-total">-$0/s</span></span>
        </div>
        <div class="rep" id="rep" title="Reputation 1–1000 · buffs revenue & customer flow">
          <span class="rep-label">${U(`star`,{size:12})} REPUTATION</span>
          <div class="rep-bar"><div class="rep-fill" id="rep-fill"></div></div>
          <span class="rep-val" id="rep-val">500</span>
          <span class="rep-buff" id="rep-buff"></span>
        </div>
      </div>
      <div class="controls">
        <button id="btn-reset" class="danger" title="Wipe save">${U(`refresh`,{size:14})}</button>
      </div>
    </header>
    <nav class="tabs">
      <button class="tab active" data-tab="industries">${U(`factory`,{size:14})} Industries</button>
      <button class="tab" data-tab="upgrades">${U(`bolt`,{size:14})} Upgrades</button>
    </nav>
    <div class="body-grid">
      <aside id="left-sidebar" class="left-sidebar"></aside>
      <main id="main"></main>
      <aside id="sidebar" class="sidebar"></aside>
    </div>
    <footer class="footer" id="footer"></footer>
  `}function tt(e,t){t.querySelectorAll(`.tab`).forEach(n=>{n.addEventListener(`click`,()=>{e.tab=n.dataset.tab,t.querySelectorAll(`.tab`).forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`),G(e,t)})}),t.querySelector(`#btn-reset`).addEventListener(`click`,()=>{confirm(`Wipe save and start over?`)&&(Ve(),location.reload())})}function G(e,t){at(e,t);let n=t.querySelector(`#main`),r=t.querySelector(`#sidebar`);e.tab===`industries`?n.innerHTML=ht(e):n.innerHTML=Tt(e),r.innerHTML=rt(e),At(e,t),it(e,t),ot(e,t)}function nt(e){return`<div class="qty-group" id="qty-group">
    ${[{v:1,label:`x1`},{v:10,label:`x10`},{v:100,label:`x100`},{v:`max`,label:`MAX`}].map(t=>`<button data-qty="${t.v}" class="qty ${e.buyQty===t.v?`active`:``}">${t.label}</button>`).join(``)}
  </div>`}function rt(e){if(e.tab===`industries`){let t=Qe(),r=t.includes(e.industryCategory)?e.industryCategory:t[0]??``;return`
      ${nt(e)}
      <div class="sidebar-heading">Categories</div>
      <nav class="subtabs">
        ${t.map(t=>{let i=n.filter(e=>(e.category??`Misc`)===t).length,a=n.filter(n=>(n.category??`Misc`)===t&&e.state.industries[n.id]?.unlocked).length,o=Je[t]??`package`,s=Ze(t,e.state,e.buyQty),c=V(t)??`#9aa4b2`;return`<button class="subtab ${r===t?`active`:``}" data-subtab="${t}" style="--cat-color: ${c}">
            <span class="st-icon">${U(o,{size:16})}</span>
            <span class="st-label">${t}</span>
            <span class="st-ready ${s>0?`on`:``}" data-subtab-ready="${t}" data-last="${s}" title="Cards you can afford to build/unlock">${U(`coin`,{size:12})} <span class="st-ready-n">${s}</span></span>
            <span class="st-count">${a}/${i}</span>
          </button>`}).join(``)}
      </nav>`}return`
    <div class="sidebar-heading">Upgrade Groups</div>
    <nav class="subtabs">
      ${[{id:`customer`,label:`Customers`,icon:`people`},{id:`global`,label:`Global`,icon:`globe`},{id:`industry`,label:`Industries`,icon:`factory`}].map(t=>`<button class="subtab ${e.upgradeGroup===t.id?`active`:``}" data-upgrade-group="${t.id}" style="--cat-color: #9aa4b2">
          <span class="st-icon">${U(t.icon,{size:16})}</span>
          <span class="st-label">${t.label}</span>
        </button>`).join(``)}
    </nav>`}function it(e,t){let n=t.querySelector(`#sidebar`);n.querySelectorAll(`#qty-group .qty`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.qty;e.buyQty=r===`max`?`max`:Number(r),G(e,t)})}),n.querySelectorAll(`[data-subtab]`).forEach(n=>{n.addEventListener(`click`,()=>{e.industryCategory=n.dataset.subtab,G(e,t)})}),n.querySelectorAll(`[data-upgrade-group]`).forEach(n=>{n.addEventListener(`click`,()=>{e.upgradeGroup=n.dataset.upgradeGroup,G(e,t)})})}function at(e,t){let n=t.querySelector(`#money`),r=t.querySelector(`#rate`);n.textContent=R(e.state.money);let i=mt(e.state);r.textContent=(i<0?`-`:`+`)+R(Math.abs(i))+`/s`,r.classList.toggle(`neg`,i<0),r.classList.toggle(`pos`,i>0);let a=pt(e.state),o=t.querySelector(`#sal-mgr`),s=t.querySelector(`#sal-emp`),c=t.querySelector(`#sal-total`);o&&(o.textContent=`-`+R(a.manager)+`/s`),s&&(s.textContent=`-`+R(a.employee)+`/s`),c&&(c.textContent=`-`+R(a.manager+a.employee)+`/s`);let l=Math.round(e.state.reputation),u=t.querySelector(`#rep-fill`),d=t.querySelector(`#rep-val`),f=t.querySelector(`#rep`),p=t.querySelector(`#rep-buff`);u&&(u.style.width=(l/10).toFixed(1)+`%`),d&&(d.textContent=String(l));let m=T(e.state.reputation),h=te(e.state.reputation);p&&(p.textContent=`${m>=1?`+`:``}${Math.round((m-1)*100)}% rev · ${h.toFixed(2)}× loss`,p.classList.toggle(`buff`,m>1),p.classList.toggle(`nerf`,m<1)),f&&(f.classList.toggle(`rep-low`,l<300),f.classList.toggle(`rep-high`,l>700))}function ot(e,t){let n=t.querySelector(`#footer`);n.textContent=`Total earned: ${R(e.state.totalEarned)} · Playing: ${z((Date.now()-e.state.startedAt)/1e3)}`}function st(e,t){if(at(e,t),ot(e,t),dt(e),e.tab===`industries`){(e.state.money!==lt||e.buyQty!==ut)&&(lt=e.state.money,ut=e.buyQty,t.querySelectorAll(`[data-subtab-ready]`).forEach(t=>{let n=t,r=n.dataset.subtabReady,i=Ze(r,e.state,e.buyQty);if(Number(n.dataset.last)===i)return;n.dataset.last=String(i);let a=n.querySelector(`.st-ready-n`);a&&(a.textContent=String(i)),n.classList.toggle(`on`,i>0)}));for(let r of n){let n=e.state.industries[r.id],i=t.querySelector(`[data-card="${r.id}"]`);if(!i)continue;let a=i.querySelector(`.card-fill`),o=i.querySelector(`.status-time`);if(!a)continue;let s=Ae(r,e.state),c=!n.paused&&(n.producing||n.hasManager),l=Math.max(0,Math.min(100,n.progress*100));a.style.width=l+`%`,o&&(o.textContent=n.paused?`⏸ Paused`:c?z((1-n.progress)*s)+` left`:n.count>0?``:`Buy units first`);let u=i.querySelector(`.sub-rate`);u&&n.count>0&&(u.textContent=R(P(r,e.state)/Math.max(1e-4,s))+`/s`);let d=i.querySelector(`button.buy`);if(d&&n.unlocked&&n.count>0){let t=e.buyQty===`max`?N(r,n.count,e.state.money):e.buyQty,i=M(r,n.count,Math.max(1,t));d.disabled=!(t>0&&e.state.money>=i),d.textContent=`Buy ${t<=0?1:t} · ${R(i)}`}else d&&!n.unlocked&&(d.disabled=!(e.state.money>=r.unlockCost));let f=i.querySelector(`[data-hire-pips="${r.id}"]`);if(f){let t=Ye(r,n,e.state.money),i=f.querySelector(`.pip.mgr`),a=f.querySelector(`.pip.emp`);i&&i.classList.toggle(`on`,t.mgr),a&&a.classList.toggle(`on`,t.emp)}}}}var K=null,ct=null,q=!1,lt=NaN,ut=null;function dt(e){if(!K)return;let t=document.querySelector(`.modal-overlay.staff-overlay`);if(!t){K=null,ct=null,q=!1;return}let n=i.get(K),r=n?e.state.industries[n.id]:null;if(!n||!r)return;let a=r.hiringUntil!==null;if(q&&!a){q=!1,ct?.();return}if(q=a,a){let e=De(r.employees),n=Math.max(0,(r.hiringUntil-Date.now())/1e3),i=t.querySelector(`[data-employee]`);i&&(i.textContent=`⏳ Hiring · ${z(n)}`);let a=t.querySelector(`[data-hire-fill]`);a&&(a.style.width=Math.min(100,(1-n/e)*100).toFixed(1)+`%`)}}function ft(e){return new Promise(t=>{let n=e.cash-e.severance,r=n<0,i=r?`$0`:R(n),a=document.createElement(`div`);a.className=`modal-overlay`,a.innerHTML=`
      <div class="modal fire-modal" role="dialog" aria-modal="true">
        <header class="fire-modal-head">
          <div class="fire-modal-icon">${U(`warning`,{size:24})}</div>
          <div class="fire-modal-title">
            <div class="fm-eyebrow">Termination Notice</div>
            <div class="fm-title">${e.title.replace(/^Fire\s+/,``)}</div>
          </div>
        </header>
        <div class="fire-modal-body">
          <div class="fm-section">
            <div class="fm-row"><span class="fm-key">Role</span><span class="fm-val">${e.role}</span></div>
            <div class="fm-row"><span class="fm-key">Service</span><span class="fm-val">${B(e.served)} <span class="fm-dim">${e.unitLabel}</span></span></div>
            <div class="fm-row"><span class="fm-key">Salary stop</span><span class="fm-val pos">−${R(e.salaryStopped)}/s saved</span></div>
          </div>
          <div class="fm-section fm-money">
            <div class="fm-money-line">
              <span class="fm-money-label">Severance</span>
              <span class="fm-money-val neg">−${R(e.severance)}</span>
            </div>
            <div class="fm-money-line sub">
              <span class="fm-money-label">Cash now</span>
              <span class="fm-money-val">${R(e.cash)}</span>
            </div>
            <div class="fm-money-line total ${r?`broke`:``}">
              <span class="fm-money-label">Cash after</span>
              <span class="fm-money-val">${i}${r?` <span class="fm-warn-tag">capped</span>`:``}</span>
            </div>
          </div>
          <div class="fm-impact">
            <span class="fm-impact-icon">ℹ</span>
            <span>${e.consequence}</span>
          </div>
        </div>
        <footer class="fire-modal-foot">
          <button class="modal-btn cancel" data-cancel>Cancel</button>
          <button class="modal-btn confirm danger" data-confirm>${U(`fire`,{size:12})} Fire — Pay ${R(e.severance)}</button>
        </footer>
      </div>
    `,document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add(`open`));let o=e=>{document.removeEventListener(`keydown`,s),a.classList.remove(`open`),setTimeout(()=>a.remove(),180),t(e)},s=e=>{e.key===`Escape`?o(!1):e.key===`Enter`&&o(!0)};a.querySelector(`[data-cancel]`).addEventListener(`click`,()=>o(!1)),a.querySelector(`[data-confirm]`).addEventListener(`click`,()=>o(!0)),a.addEventListener(`click`,e=>{e.target===a&&o(!1)}),document.addEventListener(`keydown`,s),a.querySelector(`[data-confirm]`).focus()})}function pt(e){let t=0,r=0;for(let i of n){let n=e.industries[i.id];n&&(n.hasManager&&(t+=O(i)),n.employees>0&&(r+=k(i,n.employees)))}return{manager:t,employee:r}}function mt(e){let t=0;for(let r of n){let n=e.industries[r.id];if(n.count<=0||n.paused||!n.hasManager&&!n.producing)continue;let i=P(r,e),a=Ae(r,e);a>0&&(t+=i/a)}let r=pt(e);return t-r.manager-r.employee}function ht(e){let t=Qe(),r=t.includes(e.industryCategory)?e.industryCategory:t[0]??``;return e.industryCategory=r,`
    <div class="grid">
      ${n.filter(e=>(e.category??`Misc`)===r).map(t=>gt(e,t)).join(``)}
    </div>
  `}function gt(e,t){let n=e.state.industries[t.id];if(!n.unlocked){let n=e.state.money>=t.unlockCost;return`
      <div class="card locked ${n?`affordable`:``}" data-card="${t.id}">
        <div class="card-bg"><div class="card-fill" style="width:0%"></div></div>
        <div class="card-content">
          <div class="card-head">
            <div class="icon big">${W(t.icon,{size:32})}</div>
            <div class="card-title">
              <div class="name">${t.name}</div>
              <div class="sub">${U(`lock`,{size:12})} Locked</div>
            </div>
          </div>
          <button class="buy buy-big" data-buy="${t.id}" ${n?``:`disabled`}>
            ${U(`unlock`,{size:12})} Unlock ${R(t.unlockCost)}
          </button>
        </div>
      </div>`}let r=e.buyQty===`max`?N(t,n.count,e.state.money):e.buyQty,i=n.count===0?t.baseCost:M(t,n.count,Math.max(1,r)),a=n.count===0?`Buy ${R(t.baseCost)}`:`Buy ${r<=0?1:r} · ${R(i)}`,o=n.count===0?e.state.money>=t.baseCost:r>0&&e.state.money>=i,s=P(t,e.state),c=Ae(t,e.state),l=Math.max(0,Math.min(100,n.progress*100)),u=!n.paused&&(n.producing||n.hasManager),d=n.count>0&&!n.hasManager&&!n.paused,f=E(n.count),p=oe(n.count),m=D(t,e.state),h=Math.round((m-1)*100),_=e.state.shopStats[t.id]?.unitsSold??0,v=g(_),y=Math.round((I(n.employees)-1)*100),b=f>1?`×${f} units`:``,x=h>0?`+${h}% synergy`:``,S=v>1?`×${v} sales`:``,C=y>0?`+${y}% overtime`:``,ee=p.next===null?`max units milestone`:`next ×2 @ ${B(p.next)} units (${B(p.next-n.count)} to go)`;return`
    <div class="card ${n.count>0?`owned`:``} ${n.hasManager?`auto`:``} ${d?`clickable`:``}"
         data-card="${t.id}" ${d?`data-start="${t.id}"`:``}>
      <div class="card-bg"><div class="card-fill" style="width:${l}%"></div></div>
      <div class="card-content">
        <div class="card-head">
          <div class="icon big">${W(t.icon,{size:32})}</div>
          <div class="card-title">
            <div class="name">${t.name} <span class="count">×${B(n.count)}</span></div>
            <div class="sub">
              <span class="sub-rate">${R(s/Math.max(1e-4,c))}/s</span>
              <span class="sub-dot">·</span>
              <span>${R(s)} / cycle</span>
              <span class="sub-dot">·</span>
              <span>${z(c)}</span>
            </div>
            ${b||x||S||C||n.count>0?`
              <div class="sub bonuses">
                ${b?`<span class="bonus-tag milestone">${b}</span>`:``}
                ${S?`<span class="bonus-tag sales">${S}</span>`:``}
                ${x?`<span class="bonus-tag synergy">${x}</span>`:``}
                ${C?`<span class="bonus-tag overtime">${C}</span>`:``}
                ${n.count>0?`<span class="bonus-next">${ee}</span>`:``}
              </div>
            `:``}
          </div>
          <div class="status">
            <div class="status-rev">+${R(s)}</div>
            <div class="status-time">${n.paused?`${U(`pause`,{size:11})} Paused`:u?z((1-n.progress)*c)+` left`:n.count>0?``:`Buy units first`}</div>
          </div>
        </div>
        ${_>0||n.count>0?vt(_):``}
        <div class="card-actions">
          <button class="buy" data-buy="${t.id}" ${o?``:`disabled`}>
            ${a}
          </button>
          <button class="buy staff-btn" data-staff="${t.id}" title="Manage staff, salaries, pause">
            <span class="staff-btn-icons">${U(`manager`,{size:14})}${U(`worker`,{size:14})}</span> STAFF
            ${_t(t,n,e.state.money)}
          </button>
        </div>
      </div>
    </div>`}function _t(e,t,n){let r=Ye(e,t,n),i=t.hasManager?`owned`:r.mgr?`on`:``,a=t.employees>=F(e)?`owned`:r.emp?`on`:``,o=t.hasManager?`Manager hired — auto-producing`:`Manager hire available`,s=t.employees>=F(e)?`Max staff hired`:`Employee hire available`;return`<span class="hire-pips" data-hire-pips="${e.id}">
    <span class="pip mgr ${i}" title="${o}">${t.hasManager?U(`check`,{size:10}):U(`manager`,{size:10})}</span>
    <span class="pip emp ${a}" title="${s}">${t.employees>=F(e)?U(`check`,{size:10}):U(`worker`,{size:10})}${t.employees>0?`<span class="pip-num">${t.employees}</span>`:``}</span>
  </span>`}function vt(e){let t=v(e),n=_(e),r=t?t.units:0,i=t?t.label:`New shop`,a=t?t.mult:1,o=100,s=`MAX TIER`,c=``;if(n&&n.next!==null){let t=n.next-r;o=Math.max(0,Math.min(100,(e-r)/t*100)),s=`${B(n.next-e)} to go`,c=`→ ×${n.mult} "${n.label}"`}else o=100;return`
    <div class="sold-badge ${t?`tiered`:``}" title="Cumulative units sold across all customers">
      <div class="sb-head">
        <span class="sb-icon">${U(`package`,{size:12})}</span>
        <span class="sb-count">${B(e)}</span>
        <span class="sb-label">sold</span>
        ${t?`<span class="sb-tier">×${a} · ${i}</span>`:``}
      </div>
      <div class="sb-bar"><div class="sb-fill" style="width:${o.toFixed(1)}%"></div></div>
      <div class="sb-foot">
        <span class="sb-next">${c||`Top tier reached`}</span>
        <span class="sb-remain">${s}</span>
      </div>
    </div>
  `}function yt(e,t){let n=e.state.industries[t.id],r=n.hasManager,i=e.state.money>=t.managerCost,a=n.employees,o=F(t),s=a>=o,c=Ee(t,a),l=n.hiringUntil!==null,u=!s&&!l&&e.state.money>=c,d=Math.round((1-Ce(a))*100),f=a>we,p=Math.round((I(a)-1)*100),m=De(a),h=l?Math.max(0,(n.hiringUntil-Date.now())/1e3):0,g=s?`${U(`check`,{size:12})} Max staff`:l?`⏳ Hiring · ${z(h)}`:`${U(`worker`,{size:12})}+1 · ${R(c)} · ${z(m)}`,_=O(t),v=k(t,a),y=(r?_:0)+v,b=A(t,e.state),x=j(t,e.state);return`
    <div class="staff-panel" data-staff-row="${t.id}">
      <div class="row-sub">
        <span class="staff-tag">${U(`manager`,{size:12})} ${r?`Manager hired`:`No manager`}</span>
        <span class="staff-tag">${U(`worker`,{size:12})} ${a}/${o} · −${d}% time</span>
        ${f?`<span class="staff-tag overtime-tag" title="Past speed floor — extra crew now adds revenue instead of speed">${U(`bolt`,{size:12})} +${p}% overtime rev</span>`:``}
        ${l?`<span class="staff-tag hiring-tag">⏳ Recruiting…</span>`:``}
        ${n.paused?`<span class="staff-tag paused-tag">${U(`pause`,{size:11})} Paused</span>`:``}
      </div>
      <div class="row-sub salary-row">
        <span class="staff-tag salary-tag" title="Total payroll per second">
          ${U(`salary`,{size:12})} SALARY ${R(y)}/s
        </span>
        ${r?`<span class="staff-tag salary-sub">${U(`manager`,{size:12})} ${R(_)}/s · ${B(n.managerProductsServed)} served</span>`:``}
        ${a>0?`<span class="staff-tag salary-sub">${U(`worker`,{size:12})} ${R(v)}/s · ${B(n.employeeProductsServed)} served</span>`:``}
      </div>
      ${l?`<div class="hire-bar"><div class="hire-fill" data-hire-fill="${t.id}" style="width:${Math.min(100,(1-h/m)*100).toFixed(1)}%"></div></div>`:``}
      <div class="staff-actions modal-staff-actions">
        <button class="buy" data-manager="${t.id}" ${r||!i?`disabled`:``}>
          ${r?`${U(`check`,{size:12})} Manager`:`${U(`manager`,{size:12})} Hire Manager · ${R(t.managerCost)}`}
        </button>
        <button class="buy" data-employee="${t.id}" ${s||!u?`disabled`:``}>
          ${g}
        </button>
        <button class="buy pause" data-pause="${t.id}" title="${n.paused?`Resume production`:`Pause production (salaries still paid)`}">
          ${n.paused?`${U(`play`,{size:12})} RESUME PRODUCTION`:`${U(`pause`,{size:12})} PAUSE PRODUCTION`}
        </button>
        ${r?`<button class="buy danger" data-fire-manager="${t.id}" title="Fire manager · severance ${R(b)}">
          ${U(`fire`,{size:12})} FIRE ${U(`manager`,{size:12})} · ${R(b)}
        </button>`:``}
        ${a>0?`<button class="buy danger" data-fire-employee="${t.id}" title="Fire one employee · severance ${R(x)}">
          ${U(`fire`,{size:12})} FIRE ${U(`worker`,{size:12})} · ${R(x)}
        </button>`:``}
        ${r||a>0?`<button class="buy danger fire-all" data-fire-all="${t.id}" title="Fire manager + all employees · severance ${R((r?b:0)+x*a)}">
          ${U(`fire`,{size:12})}${U(`fire`,{size:12})} FIRE ALL · ${R((r?b:0)+x*a)}
        </button>`:``}
      </div>
    </div>
  `}function bt(e,t,n){let r=i.get(n);if(!r)return;document.querySelectorAll(`.modal-overlay.staff-overlay`).forEach(e=>e.remove());let a=document.createElement(`div`);a.className=`modal-overlay staff-overlay`,a.innerHTML=`
    <div class="modal staff-modal" role="dialog" aria-modal="true">
      <header class="fire-modal-head staff-modal-head">
        <div class="fire-modal-icon staff-modal-icon">${W(r.icon,{size:24})}</div>
        <div class="fire-modal-title">
          <div class="fm-eyebrow">Manage Staff</div>
          <div class="fm-title">${r.name}</div>
        </div>
        <button class="modal-close" data-close aria-label="Close">×</button>
      </header>
      <div class="fire-modal-body staff-modal-body">${yt(e,r)}</div>
    </div>`,document.body.appendChild(a),K=n,q=e.state.industries[n]?.hiringUntil!=null,requestAnimationFrame(()=>a.classList.add(`open`));let o=()=>{let n=a.querySelector(`.staff-modal-body`);n&&(n.innerHTML=yt(e,r)),xt(e,t,a,r,o)};ct=o;let s=()=>{K=null,ct=null,q=!1,a.classList.remove(`open`),setTimeout(()=>a.remove(),180),document.removeEventListener(`keydown`,c)},c=e=>{e.key===`Escape`&&s()};document.addEventListener(`keydown`,c),a.addEventListener(`click`,e=>{e.target===a&&s()}),a.querySelector(`[data-close]`).addEventListener(`click`,s),xt(e,t,a,r,o)}function xt(e,t,n,r,i){let a=e=>n.querySelector(e),o=a(`[data-manager]`);o&&o.addEventListener(`click`,()=>{Me(e.state,r.id)&&(e.notify(`Hired manager for ${r.name}`,{color:V(r.category)}),L(e.state),G(e,t),i())});let s=a(`[data-employee]`);s&&s.addEventListener(`click`,()=>{Oe(e.state,r.id)&&(L(e.state),G(e,t),i())});let c=a(`[data-pause]`);c&&c.addEventListener(`click`,()=>{let n=be(e.state,r.id);e.notify(`${r.name} ${n?`${U(`pause`,{size:11})} paused`:`${U(`play`,{size:11})} resumed`}`,{color:V(r.category)}),L(e.state),G(e,t),i()});let l=a(`[data-fire-manager]`);l&&l.addEventListener(`click`,async()=>{let n=e.state.industries[r.id],a=A(r,e.state);if(!await ft({title:`Fire Manager — ${r.name}`,role:`${U(`manager`,{size:12})} Manager`,served:n.managerProductsServed,unitLabel:`products produced under their watch`,salaryStopped:O(r),severance:a,cash:e.state.money,consequence:`Production stops — you must click each cycle manually until rehired.`}))return;let o=ge(e.state,r.id);e.notify(`${U(`manager`,{size:12})} Manager fired at ${r.name} · severance ${R(o)}`,{color:V(r.category)}),L(e.state),G(e,t),i()});let u=a(`[data-fire-employee]`);u&&u.addEventListener(`click`,async()=>{let n=e.state.industries[r.id],a=j(r,e.state),o=n.employees,s=o>0?n.employeeProductsServed/o:0,c=Math.round((1-Ce(o-1))*100),l=Math.round((1-Ce(o))*100);if(!await ft({title:`Fire Employee — ${r.name}`,role:`${U(`worker`,{size:12})} Employee (1 of ${o})`,served:Math.floor(s),unitLabel:`avg products attributable to their share`,salaryStopped:k(r,1),severance:a,cash:e.state.money,consequence:`Cycle speedup drops from −${l}% → −${c}%.`}))return;let u=_e(e.state,r.id);e.notify(`${U(`worker`,{size:12})} Employee fired at ${r.name} · severance ${R(u)}`,{color:V(r.category)}),L(e.state),G(e,t),i()});let d=a(`[data-fire-all]`);d&&d.addEventListener(`click`,async()=>{let n=e.state.industries[r.id],a=(n.hasManager?A(r,e.state):0)+(n.employees>0?j(r,e.state)*n.employees:0),o=(n.hasManager?O(r):0)+k(r,n.employees),s=n.managerProductsServed+n.employeeProductsServed,c=[];if(n.hasManager&&c.push(`${U(`manager`,{size:12})} Manager`),n.employees>0&&c.push(`${U(`worker`,{size:12})} ${n.employees} Employee${n.employees>1?`s`:``}`),!await ft({title:`Fire ALL Staff — ${r.name}`,role:c.join(` + `),served:s,unitLabel:`total products produced under entire staff`,salaryStopped:o,severance:a,cash:e.state.money,consequence:`Production halts entirely. You will need to re-hire and wait through recruiting timers.`}))return;let l=ve(e.state,r.id);e.notify(`${U(`fire`,{size:12})}${U(`fire`,{size:12})} All staff fired at ${r.name} · severance ${R(l)}`,{color:V(r.category)}),L(e.state),G(e,t),i()})}function St(e,t=18){if(e===`global`)return U(`globe`,{size:t});if(e===`customer`)return U(`people`,{size:t});let n=i.get(e);return n?W(n.icon,{size:t}):U(`bolt`,{size:t})}function Ct(e){if(e===`global`)return`All industries`;if(e===`customer`)return`Customers`;let t=i.get(e);return t?t.name:`—`}function wt(e){if(e.desc)return e.desc;let t=e.kind??`revenue`,n=e.value??0;switch(t){case`revenue`:return`×${e.multiplier??1} revenue`;case`spawn_rate`:return`×${n} customer flow`;case`walk_speed`:return`×${n} walk speed`;case`shop_dwell`:return`×${n} dwell time`;case`wealthy_rate`:return`+${Math.round(n*100)}% wealthy chance`;case`whale_rate`:return`+${Math.round(n*100)}% whale chance`;case`tip_mult`:return`×${n} all tips`;case`whale_tip`:return`×${n} whale tips`;case`rep_gain_mult`:return`×${n} rep gained`;case`rep_loss_mult`:return`×${n} rep / $ loss`;case`partial_forgive`:return`Partial orders forgiven`;case`rep_regen`:return`+${n} rep / sec`}return``}function Tt(e){let t=r.filter(t=>{if(e.state.upgrades[t.id])return!1;if(t.industryId===`global`||t.industryId===`customer`)return!0;let n=e.state.industries[t.industryId];return!(!n||!n.unlocked||t.requires&&n.count<t.requires)}),n=r.filter(t=>e.state.upgrades[t.id]),i=(e,t,n,r,i,a,o)=>`
    <div class="upgrade-row ${a?`owned`:``}" title="${r.replace(/"/g,`&quot;`)}">
      <div class="ur-name">${t}</div>
      <div class="ur-sub">${r}</div>
      ${a?`<span class="ur-owned" title="Owned">${U(`check`,{size:14})}</span>`:`<button class="ur-buy" data-upgrade="${e}" ${o?``:`disabled`}>${R(i)}</button>`}
    </div>`,a=[e.upgradeGroup],o={customer:`${U(`people`,{size:14})} Customers`,global:`${U(`globe`,{size:14})} Global`,industry:`${U(`factory`,{size:14})} Industries`},s=e=>e.industryId===`customer`?`customer`:e.industryId===`global`?`global`:`industry`,c=(t,n,r)=>n.length===0?``:`<h4 class="section-sub">${t}</h4><div class="upgrade-grid">${n.map(t=>{let n=St(t.industryId,18),a=`${Ct(t.industryId)} · ${wt(t)}`,o=e.state.money>=t.cost;return i(t.id,t.name,n,a,r?null:t.cost,r,o)}).join(``)}</div>`,l=(e,t)=>e.length===0?``:a.map(n=>{let r=e.filter(e=>s(e)===n);return c(o[n],r,t)}).join(``);return`
    <h3 class="section">Available (${t.length})</h3>
    ${t.length?l(t,!1):`<div class="empty-placeholder">No upgrades available. Buy more units to unlock.</div>`}
    <h3 class="section">Owned (${n.length})</h3>
    ${n.length?l(n,!0):`<div class="empty-placeholder">None yet.</div>`}
  `}function Et(e,t,n){let r=i.get(n);if(!r)return;let a=t.querySelector(`[data-card="${n}"]`);if(!a)return;let o=document.createElement(`template`);o.innerHTML=gt(e,r).trim();let s=o.content.firstElementChild;s&&a.replaceWith(s)}function Dt(e,t){let n=e.state.industries[t],r=!!n?.unlocked,i=(n?.count??0)===0,a=je(e.state,t,e.buyQty),o=!!e.state.industries[t]?.unlocked,s=(e.state.industries[t]?.count??0)>0,c=r!==o||i&&s;return{bought:a.bought,unlockChanged:c}}function Ot(e,t){t.querySelector(`#main`).addEventListener(`click`,n=>{let r=n.target,o=r.closest(`[data-subtab]`);if(o){e.industryCategory=o.dataset.subtab,G(e,t);return}let s=r.closest(`[data-buy]`);if(s){n.stopPropagation();let r=s.dataset.buy,i=Dt(e,r);i.bought>0&&(L(e.state),i.unlockChanged?G(e,t):Et(e,t,r));return}let c=r.closest(`[data-staff]`);if(c){n.stopPropagation();let a=c.dataset.staff,o=r.closest(`.pip`);if(o&&o.classList.contains(`on`)){let n=i.get(a),r=V(n?.category);o.classList.contains(`mgr`)?Me(e.state,a)&&(e.notify(`Hired manager${n?` for `+n.name:``}`,{color:r}),L(e.state),Et(e,t,a)):o.classList.contains(`emp`)&&Oe(e.state,a)&&(L(e.state),Et(e,t,a));return}bt(e,t,a);return}let l=r.closest(`[data-upgrade]`);if(l){let n=l.dataset.upgrade;if(Ne(e.state,n)){let r=a.get(n),o=r&&r.industryId!==`global`&&r.industryId!==`customer`?i.get(r.industryId):void 0;e.notify(`${U(`bolt`,{size:12})} ${r?.name??`Upgrade`} purchased`,{color:V(o?.category)}),L(e.state),G(e,t)}return}let u=r.closest(`[data-start]`);if(u){n.stopPropagation();let r=u.dataset.start;Pe(e.state,r)&&Et(e,t,r);return}})}var kt=null;function At(e,t){let n=t.querySelector(`#main`);kt!==n&&(kt=n,Ot(e,t))}var jt=[];function Mt(e,t){let n={ts:Date.now(),msg:e,color:t?.color};for(let e of jt)e(n)}function Nt(e){jt.push(e)}var Pt=[`#f5d0a9`,`#e8b88c`,`#c98a63`,`#9c6747`,`#704a30`],Ft=[`#1a1208`,`#4a2e1a`,`#7a4b25`,`#b07a3a`,`#d8a85a`,`#e8e2d4`,`#a3a3a3`,`#2c1810`],It=[`#e74c3c`,`#3498db`,`#27ae60`,`#9b59b6`,`#f39c12`,`#16a085`,`#e67e22`,`#ecf0f1`,`#1abc9c`,`#d35400`,`#8e44ad`,`#c0392b`],Lt=[`#2c3e50`,`#34495e`,`#1a2530`,`#5a3a1f`,`#4a4a4a`,`#243447`,`#2d1810`];function Rt(e){return e[Math.floor(Math.random()*e.length)]}function zt(){let e=Rt(Pt),t=Rt(Ft),n=Rt(It),r=Rt(Lt),i=Math.random()<.5?`#1a1a1a`:`#3a2418`,a=Math.random()<.1;return`<svg viewBox="0 0 24 40" width="22" height="36" preserveAspectRatio="xMidYMax meet">
    ${a?``:`<ellipse cx="12" cy="6.5" rx="5.6" ry="5" fill="${t}"/>`}
    <circle cx="12" cy="8" r="5" fill="${e}"/>
    ${a?``:`<path d="M7 7 Q12 3 17 7 Q17 9 12 7 Q9 8 7 9 Z" fill="${t}"/>`}
    <circle cx="10" cy="8.5" r=".7" fill="#111"/>
    <circle cx="14" cy="8.5" r=".7" fill="#111"/>
    <path d="M10.5 11 Q12 12 13.5 11" stroke="#7a3a2a" stroke-width=".5" fill="none" stroke-linecap="round"/>
    <rect x="11" y="12.5" width="2" height="1.5" fill="${e}"/>
    <path d="M5 15 L19 15 L20 27 L4 27 Z" fill="${n}"/>
    <path d="M5 15 L19 15 L19 16.5 L5 16.5 Z" fill="rgba(0,0,0,.15)"/>
    <rect x="2" y="15" width="3" height="11" rx="1.2" fill="${n}"/>
    <rect x="19" y="15" width="3" height="11" rx="1.2" fill="${n}"/>
    <circle cx="3.5" cy="26.5" r="1.5" fill="${e}"/>
    <circle cx="20.5" cy="26.5" r="1.5" fill="${e}"/>
    <rect x="6.5" y="27" width="4.5" height="9.5" rx=".5" fill="${r}"/>
    <rect x="13" y="27" width="4.5" height="9.5" rx=".5" fill="${r}"/>
    <ellipse cx="8.7" cy="37.5" rx="2.6" ry="1.4" fill="${i}"/>
    <ellipse cx="15.3" cy="37.5" rx="2.6" ry="1.4" fill="${i}"/>
  </svg>`}var J=130,Bt=90,Y=20,Vt=40,Ht=[10,8,6,6];function Ut(e){return Ht[e]??Ht[Ht.length-1]}function Wt(e){let t=e,n=0;for(;;){let e=Ut(n);if(t<e)return{floor:n,idxInFloor:t};t-=e,n++}}function Gt(e){if(e<=0)return 1;let t=0,n=0;for(;n<e;)n+=Ut(t),t++;return t}var Kt=40,qt=110,Jt=new Map(n.map((e,t)=>[e.id,t]));function Yt(e,t,n){let r=n>0?t/n:0;switch(e){case`broke`:return(1-r)*(1-r)*.9+.1;case`normal`:return Math.max(.25,1-.7*Math.abs(r-.4));case`wealthy`:return .15+1.6*r;case`whale`:return .08+3*r*r}}function Xt(e,t){let n=0;for(let e of t)n+=e;if(!(n>0))return Math.floor(Math.random()*e.length);let r=Math.random()*n;for(let e=0;e<t.length;e++)if(r-=t[e],r<=0)return e;return e.length-1}function Zt(e,t,n){let r=(e-1)/999,i=Math.max(0,.5-.45*r),a=Math.max(0,Math.min(.95,.1*r+n)),o=Math.max(0,Math.min(.95,.05+.3*r+t)),s=.1*r,c=.05+.3*r,l=Math.max(0,a-s+(o-c));if(i=Math.max(0,i-l),i+a+o>1){let e=(1-i)/(a+o);a*=e,o*=e}let u=Math.random();return u<i?{tier:`broke`,multiplier:.3,units:1,icon:`coin`}:u<i+a?{tier:`whale`,multiplier:8,units:3+Math.floor(Math.random()*3),icon:`crown`}:u<i+a+o?{tier:`wealthy`,multiplier:2.5,units:1+Math.floor(Math.random()*2),icon:`gem`}:{tier:`normal`,multiplier:1,units:1,icon:``}}var Qt=class{onShopClick;root;street;shopsRow;peopleLayer;shops=new Map;openShops=[];customers=[];parcelQueue=new Map;spawnAcc=0;lastT=performance.now();state;width=0;rafId=0;alive=!0;resizeHandler;stairEl;stairElR;slabsEl;floors=1;stairXL=0;stairXR=0;stairXL_R=0;stairXR_R=0;stairInner(e){return e===`L`?this.stairXR:this.stairXL_R}stairOuter(e){return e===`L`?this.stairXL:this.stairXR_R}stairBottomX(e,t=`L`){return e%2==0?this.stairInner(t):this.stairOuter(t)}stairTopX(e,t=`L`){return e%2==0?this.stairOuter(t):this.stairInner(t)}climbX(e,t,n=`L`){let r=Math.max(0,Math.min(1,(t-e*J)/J));return this.stairBottomX(e,n)+(this.stairTopX(e,n)-this.stairBottomX(e,n))*r}floorScale(e){return Math.max(.55,.88**e)}floorHaze(e){let t=Math.min(1,e/4);return{brightness:1-.22*t,saturate:1-.5*t,blur:1.2*t,tint:.35*t}}constructor(e){this.state=e,this.root=document.createElement(`div`),this.root.className=`market`,this.root.innerHTML=`
      <div class="market-sky"></div>
      <div class="market-street">
        <div class="market-ground"></div>
        <div class="market-slabs"></div>
        <div class="market-stair"></div>
        <div class="market-stair market-stair-r"></div>
        <div class="market-shops"></div>
        <div class="market-people"></div>
      </div>
    `,document.body.appendChild(this.root),this.street=this.root.querySelector(`.market-street`),this.shopsRow=this.root.querySelector(`.market-shops`),this.peopleLayer=this.root.querySelector(`.market-people`),this.stairEl=this.root.querySelector(`.market-stair:not(.market-stair-r)`),this.stairElR=this.root.querySelector(`.market-stair-r`),this.slabsEl=this.root.querySelector(`.market-slabs`),this.rebuildShops(),this.resizeHandler=()=>this.onResize(),window.addEventListener(`resize`,this.resizeHandler),this.onResize(),this.rafId=requestAnimationFrame(e=>{this.lastT=e,this.loop(e)})}destroy(){this.alive=!1,cancelAnimationFrame(this.rafId),window.removeEventListener(`resize`,this.resizeHandler);for(let e of this.customers)e.el.remove();this.customers.length=0;for(let e of this.shops.values())e.statsEl.remove();this.root.remove()}onResize(){this.width=this.street.clientWidth,this.layoutShops()}syncOpenShops(){this.openShops.length=0;for(let e of this.shops.values()){let t=this.state.industries[e.defId];t&&!t.closed&&this.openShops.push(e)}}rebuildShops(){for(let e of this.shops.values())e.statsEl.remove();this.shopsRow.innerHTML=``,this.shops.clear();let e=new Map;for(let t=0;t<n.length;t++){let r=n[t].category??`Misc`;e.has(r)||e.set(r,t)}let t=n.map((e,t)=>({def:e,idx:t})).sort((t,n)=>{let r=e.get(t.def.category??`Misc`)??999,i=e.get(n.def.category??`Misc`)??999;return r===i?t.idx-n.idx:r-i}).map(e=>e.def);for(let e of t){let t=this.state.industries[e.id];if(!t||!t.unlocked)continue;let n=document.createElement(`div`);n.className=`shop`,n.style.setProperty(`--shop-color`,e.color);let r=this.state.delivered[e.id]??0,i=e.name.split(` `)[0].toUpperCase();n.innerHTML=`
        <div class="shop-badge" data-count="${r}">${U(`package`,{size:12})} <span class="shop-badge-n">${B(r)}</span></div>
        <button class="shop-toggle" type="button" title="Open / close store">${t.closed?U(`lock`,{size:14}):U(`unlock`,{size:14})}</button>
        <div class="shop-closed-sign">CLOSED</div>
        <div class="shop-chimney"></div>
        <div class="shop-roof"></div>
        <div class="shop-awning">
          <div class="shop-sign">${i}</div>
        </div>
        <div class="shop-body">
          <div class="shop-window">
            <div class="shop-display">${W(e.icon,{size:28})}</div>
            <div class="shop-glare"></div>
          </div>
          <div class="shop-door">
            <div class="shop-door-window"></div>
            <div class="shop-knob"></div>
          </div>
        </div>
        <div class="shop-step"></div>
        <div class="shop-stats">
          <div class="ss-title">${e.name}</div>
          <div class="ss-row sub"><span>Tip / unit (now)</span><span class="ss-tip">$0</span></div>
          <div class="ss-row sub"><span>Avg / sale</span><span class="ss-avg">$0</span></div>
          <div class="ss-divider"></div>
          <div class="ss-row gain"><span>+ Earned (net)</span><span class="ss-earned">$0</span></div>
          <div class="ss-row loss"><span>− Lost</span><span class="ss-lost">$0</span></div>
          <div class="ss-row loss" title="Delivery + transaction + platform fees deducted from sales"><span>− Fees</span><span class="ss-fees">$0</span></div>
          <div class="ss-row gain"><span>${U(`star`,{size:11})} Rep gained</span><span class="ss-rep-gain">0</span></div>
          <div class="ss-row loss"><span>${U(`starOff`,{size:11})} Rep lost</span><span class="ss-rep-loss">0</span></div>
          <div class="ss-row sub"><span>Sales / Misses</span><span class="ss-counts">0 / 0</span></div>
          <div class="ss-row sub"><span>Net</span><span class="ss-net">$0</span></div>
        </div>
      `,this.shopsRow.appendChild(n);let a=n.querySelector(`.shop-badge`),o=n.querySelector(`.shop-stats`);o.remove(),o.classList.add(`portal`),document.body.appendChild(o),r===0&&(a.classList.add(`zero`),n.classList.add(`empty-shop`)),t.closed&&n.classList.add(`closed`);let s={el:n,badgeEl:a,statsEl:o,x:0,floor:0,defId:e.id};this.shops.set(e.id,s),this.renderShopStats(s);let c=()=>{let e=n.getBoundingClientRect();o.style.left=e.left+e.width/2+`px`,o.style.top=e.top+`px`};n.addEventListener(`mouseenter`,()=>{this.renderShopStats(s),c(),o.classList.add(`visible`)}),n.addEventListener(`mouseleave`,()=>o.classList.remove(`visible`)),n.addEventListener(`click`,t=>{t.target.closest(`.shop-toggle`)||this.onShopClick?.(e.id)});let l=n.querySelector(`.shop-toggle`);l&&l.addEventListener(`click`,t=>{t.stopPropagation();let r=ye(this.state,e.id);n.classList.toggle(`closed`,r),l.innerHTML=U(r?`lock`:`unlock`,{size:14}),this.syncOpenShops()})}this.syncOpenShops(),this.rebindCustomerRefs(),this.layoutShops()}rebindCustomerRefs(){for(let e=this.customers.length-1;e>=0;e--){let t=this.customers[e],n=[];for(let e of t.route){let t=this.shops.get(e.defId);t&&n.push(t)}t.route=n,t.routeIdx>=t.route.length?t.target=null:t.target=t.route[t.routeIdx]??null,t.target||(t.state=t.floor>0?`climbing-down`:`walking-out`,t.el.classList.remove(`inside`))}}layoutShops(){let e=Array.from(this.shops.values());e.length===0||this.width===0||(this.shopsRow.style.transform=``,requestAnimationFrame(()=>{let t=e[0].el.offsetWidth||96;this.floors=Math.max(1,Gt(e.length)),this.stairXL=Y,this.stairXR=Y+Bt,this.stairXL_R=this.width-Y-Bt,this.stairXR_R=this.width-Y;let n=this.floors>1?Bt+Vt:0,r=this.street.getBoundingClientRect();for(let i=0;i<e.length;i++){let a=e[i],{floor:o,idxInFloor:s}=Wt(i),c=Ut(o),l=e.length-(i-s),u=Math.min(c,l),d=this.floorScale(o),f=t*d,p=2**o,m=Vt*d*p,h=u*f+(u-1)*m,g=this.width-Y*2-n*2,_=Y+n+Math.max(0,(g-h)/2)+s*(f+m);a.floor=o,a.el.style.left=_+`px`,a.el.style.bottom=o*J+`px`;let v=this.width/2,y=Math.min(1,o*.12),b=(v-_)*y;a.el.style.transformOrigin=`bottom left`,a.el.style.transform=`translateX(${b.toFixed(1)}px) scale(${d})`;let x=this.floorHaze(o);a.el.style.filter=`drop-shadow(0 4px 8px rgba(0,0,0,.5)) brightness(${x.brightness.toFixed(3)}) saturate(${x.saturate.toFixed(3)})`+(x.blur>.05?` blur(${x.blur.toFixed(2)}px)`:``),a.el.style.setProperty(`--shop-haze`,x.tint.toFixed(3)),a.el.style.opacity=String(Math.max(.62,1-o*.09)),a.el.style.zIndex=String(50-o);let S=a.el.querySelector(`.shop-door`);if(S){let e=S.getBoundingClientRect();a.x=e.left+e.width/2-r.left}else a.x=_+t*d/2}let i=Kt+this.floors*J+20;this.root.style.setProperty(`--market-h`,i+`px`),document.body.style.setProperty(`--market-h`,i+`px`),this.slabsEl.innerHTML=``;for(let e=1;e<this.floors;e++){let t=document.createElement(`div`);t.className=`market-floor-slab`,t.style.left=Y+`px`,t.style.right=Y+`px`,t.style.bottom=Kt+e*J-12+`px`,t.style.height=`12px`,this.slabsEl.appendChild(t)}if(this.floors>1){let e=this.floors*J,t=this.stairXR-this.stairXL;this.stairEl.style.display=`block`,this.stairEl.style.left=this.stairXL+`px`,this.stairEl.style.width=t+`px`,this.stairEl.style.bottom=Kt+`px`,this.stairEl.style.height=e+`px`,this.stairEl.innerHTML=this.renderStairSVG(t,e,`L`);let n=this.stairXR_R-this.stairXL_R;this.stairElR.style.display=`block`,this.stairElR.style.left=this.stairXL_R+`px`,this.stairElR.style.width=n+`px`,this.stairElR.style.bottom=Kt+`px`,this.stairElR.style.height=e+`px`,this.stairElR.innerHTML=this.renderStairSVG(n,e,`R`)}else this.stairEl.style.display=`none`,this.stairEl.innerHTML=``,this.stairElR.style.display=`none`,this.stairElR.innerHTML=``}))}renderStairSVG(e,t,n=`L`){let r=this.floors-1,i=``,a=n===`L`?e:0,o=n===`L`?0:e;for(let e=0;e<r;e++){let n=t-e*J,r=t-(e+1)*J,s=e%2==0?a:o,c=e%2==0?o:a,l=``,u=c-s,d=r-n,f=Math.hypot(u,d),p=-d/f,m=u/f;for(let e=1;e<12;e++){let t=e/12,r=s+u*t,i=n+d*t,a=r-p*7,o=i-m*7,c=r+p*7,f=i+m*7;l+=`<line x1="${a.toFixed(1)}" y1="${o.toFixed(1)}" x2="${c.toFixed(1)}" y2="${f.toFixed(1)}" stroke="#5a3a26" stroke-width="2" stroke-linecap="round"/>`}let h=e=>`M ${(s+p*e*9).toFixed(1)} ${(n+m*e*9).toFixed(1)} L ${(c+p*e*9).toFixed(1)} ${(r+m*e*9).toFixed(1)}`;i+=`
        <g class="stair-flight">
          <path d="${h(-1)}" stroke="#2a1d14" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="${h(1)}"  stroke="#2a1d14" stroke-width="3" stroke-linecap="round" fill="none"/>
          ${l}
          <line x1="${s}" y1="${n}" x2="${c}" y2="${r}" stroke="#4a3324" stroke-width="3" stroke-linecap="round" opacity=".55"/>
        </g>
      `;let g=c,_=r;i+=`<rect x="${(g-18/2).toFixed(1)}" y="${(_-4).toFixed(1)}" width="18" height="6" fill="#3a2820" stroke="#1a1108" stroke-width="1" rx="1"/>`}return`<svg viewBox="0 0 ${e} ${t}" width="${e}" height="${t}" preserveAspectRatio="none" style="overflow:visible">${i}</svg>`}advanceRoute(e){for(e.routeIdx++;e.routeIdx<e.route.length;){let t=e.route[e.routeIdx],n=this.state.industries[t.defId];if(n&&!n.closed)return e.target=t,!0;e.routeIdx++}return e.target=null,!1}spawnCustomer(){let e=this.openShops;if(e.length===0)return;let t=Math.random()<.5,n=d(this.state),r=Zt(this.state.reputation,n.wealthyBonus,n.whaleBonus),i=r.tier===`whale`?5:r.tier===`wealthy`?3:r.tier===`broke`?1:2,a=1+Math.floor(Math.random()*i),o=Math.min(a,e.length),s=0;for(let t of e){let e=Jt.get(t.defId)??0;e>s&&(s=e)}let c=e.slice(),l=[];for(let e=0;e<o;e++){let e=Xt(c,c.map(e=>Yt(r.tier,Jt.get(e.defId)??0,s)));l.push(c.splice(e,1)[0])}let u=l[0],f=document.createElement(`div`);f.className=`customer`;let p=document.createElement(`span`);p.className=`c-body`,p.innerHTML=zt();let m=document.createElement(`span`);if(m.className=`c-product`,f.appendChild(p),f.appendChild(m),f.classList.add(`wealth-`+r.tier),r.icon){let e=document.createElement(`span`);if(e.className=`c-wealth`,e.innerHTML=U(r.icon,{size:12}),r.units>1){let t=document.createElement(`span`);t.className=`c-wealth-qty`,t.textContent=`×`+r.units,e.appendChild(t)}f.appendChild(e)}if(l.length>1){let e=document.createElement(`span`);e.className=`c-trip`,e.textContent=l.length+`🛒`,f.appendChild(e)}this.peopleLayer.appendChild(f);let h=t?-30:this.width+30,g=t?`L`:`R`,_=((r.tier===`whale`?30:r.tier===`wealthy`?40:50)+Math.random()*40)*n.walkSpeed,v=(u.floor>0?this.stairBottomX(0,g):u.x)>h?_:-_,y=v>=0?1:-1,b=Math.random(),x=1-b*.18;f.style.transform=`translate3d(${h}px, 0, 0) scale(${x})`,p.style.transform=`scaleX(${y})`,this.customers.push({el:f,body:p,product:m,x:h,y:0,vx:v,target:u,route:l,routeIdx:0,state:`walking-in`,shopTimer:0,facing:y,wealth:r,floor:0,lane:b,baseScale:x,side:g})}flyProduct(e,t=1){let n=this.state.industries[e];if(!n)return;let r=n.count*t;if(r<=0)return;this.state.delivered[e]=(this.state.delivered[e]??0)+r,this.updateBadge(e,r);let i=this.parcelQueue.get(e)??{pending:0,active:!1};i.pending+=r,this.parcelQueue.set(e,i),this.tryFlushParcels(e)}tryFlushParcels(e){let t=this.parcelQueue.get(e);if(!t||t.pending<=0||t.active)return;let n=t.pending;t.pending=0,t.active=!0,this.launchParcels(e,n)}launchParcels(e,t){let n=this.shops.get(e),r=i.get(e),a=document.querySelector(`[data-card="${e}"]`);if(!n||!r||!a){let t=this.parcelQueue.get(e);t&&(t.active=!1,this.tryFlushParcels(e));return}let o=a.getBoundingClientRect(),s=n.el.querySelector(`.shop-chimney`),c=(s??n.el).getBoundingClientRect(),l=o.left+o.width/2,u=o.top+o.height/2,d=c.left+c.width/2,f=s?c.top-2:c.bottom-16,p=d-l,m=f-u,h=Math.max(180,Math.abs(p)*.32),g=t<=3?t:t<=30?2:3,_=Math.floor(t/g),v=t-_*g,y=e=>Math.min(1.5,.75+Math.log10(Math.max(1,e))*.22),b=700+Math.min(220,Math.abs(p)*.18),x=0;for(let t=0;t<g;t++){let i=_+ +(t<v),a=y(i),o=document.createElement(`div`);o.className=`parcel`,o.style.setProperty(`--parcel-scale`,a.toFixed(2));let s=document.createElement(`span`);s.className=`parcel-icon`,s.innerHTML=W(r.icon,{size:18});let c=document.createElement(`span`);if(c.className=`parcel-tape`,o.appendChild(c),o.appendChild(s),i>1){let e=document.createElement(`span`);e.className=`parcel-qty`,e.textContent=`×`+B(i),o.appendChild(e)}o.style.left=l+`px`,o.style.top=u+`px`,document.body.appendChild(o);let S=[];for(let e=0;e<=24;e++){let t=e/24,n=p*(1-(1-t)**2),r=m*t-h*4*t*(1-t),i=Math.sin(t*Math.PI*3)*10*(1-t),o=e===0?a*.6:a,s=e===0?0:1;S.push({transform:`translate(calc(-50% + ${n}px), calc(-50% + ${r}px)) rotate(${i}deg) scale(${o})`,opacity:s})}let C=o.animate(S,{duration:b,delay:t*130,easing:`linear`,fill:`forwards`}),ee=b+t*130;ee>x&&(x=ee);let w=t===g-1,T=!1,te=()=>{if(!T&&(T=!0,w)){let t=this.parcelQueue.get(e);t&&(t.active=!1,this.tryFlushParcels(e))}};C.addEventListener(`finish`,()=>{this.chimneyPuff(d,f,a),this.glowWindow(n.el),C.cancel(),o.classList.add(`parcel-land`),setTimeout(()=>o.remove(),320),te()},{once:!0}),setTimeout(()=>{C.cancel(),o.remove(),te()},b+t*130+1500)}}chimneyPuff(e,t,n=1){let r=n>1.3?4:3;for(let i=0;i<r;i++){let r=document.createElement(`div`);r.className=`smoke-puff`;let a=(Math.random()-.5)*8;r.style.left=e+a+`px`,r.style.top=t+`px`,r.style.animationDelay=i*70+`ms`,r.style.setProperty(`--puff-scale`,n.toFixed(2)),document.body.appendChild(r),setTimeout(()=>r.remove(),1500)}}glowWindow(e){let t=e.querySelector(`.shop-window`);t&&(t.classList.remove(`stock-glow`),requestAnimationFrame(()=>t.classList.add(`stock-glow`)),setTimeout(()=>t.classList.remove(`stock-glow`),650))}salesMilestoneToast(e,t,n,r){let a=i.get(e.defId);Mt(`${U(`trophy`,{size:12})} ${t}: ${n} · ×${r} sales revenue`,{color:V(a?.category)})}flyReputation(e,t,n){let r=e.el.querySelector(`.shop-chimney`),i=document.getElementById(`rep`);if(!i)return;let a=(r??e.el).getBoundingClientRect(),o=i.getBoundingClientRect(),s=a.left+a.width/2,c=a.top,l=o.left+o.width/2,u=o.top+o.height/2,d=l-s,f=u-c,p=-Math.min(220,Math.abs(d)*.3+80),m=n===`gain`?360:-25,h=document.createElement(`div`);h.className=`flying-rep `+n,h.innerHTML=U(n===`gain`?`star`:`starOff`,{size:12})+` `+t,h.style.left=s+`px`,h.style.top=c+`px`,document.body.appendChild(h);let g=[];for(let e=0;e<=36;e++){let t=e/36,n=t<.5?2*t*t:1-(-2*t+2)**3/2,r=d*n,i=f*n+p*4*n*(1-n),a=m*n,o;o=t<.12?.4+t/.12*.7000000000000001:t>.88?1.1+.25*((t-.88)/.12):1+.12*Math.sin((t-.12)/.76*Math.PI);let s;s=t<.08?t/.08:t>.94?1-(t-.94)/.06:1,g.push({transform:`translate(calc(-50% + ${r}px), calc(-50% + ${i}px)) scale(${o}) rotate(${a}deg)`,opacity:s})}h.animate(g,{duration:1100,easing:`linear`,fill:`forwards`}).addEventListener(`finish`,()=>{h.remove(),this.pulseRepBar(n)},{once:!0}),setTimeout(()=>h.remove(),2200)}pulseRepBar(e){let t=document.getElementById(`rep`);if(!t)return;let n=e===`gain`?`rep-pulse-gain`:`rep-pulse-loss`;t.classList.remove(n),requestAnimationFrame(()=>t.classList.add(n)),setTimeout(()=>t.classList.remove(n),750)}getStats(e){let t=this.state.shopStats[e];return t||(t=m(),this.state.shopStats[e]=t),t}renderShopStats(e){let t=this.getStats(e.defId),n=i.get(e.defId),r=e=>R(e),a=(t,n)=>{let r=e.statsEl.querySelector(t);r&&(r.textContent=n)};a(`.ss-tip`,r(n?de(n,this.state)*b:0));let o=t.sales>0?t.extraEarned/t.sales:0;a(`.ss-avg`,t.sales>0?r(o):`—`),a(`.ss-earned`,`+`+r(t.extraEarned)),a(`.ss-lost`,`-`+r(t.extraLost)),a(`.ss-fees`,`-`+r(t.feesPaid)),a(`.ss-rep-gain`,`+`+B(t.repGained)),a(`.ss-rep-loss`,`-`+B(t.repLost)),a(`.ss-counts`,B(t.sales)+` / `+B(t.misses));let s=t.extraEarned-t.extraLost;a(`.ss-net`,(s>=0?`+`:`-`)+r(Math.abs(s)));let c=e.statsEl.querySelector(`.ss-net`);c&&(c.classList.toggle(`pos`,s>0),c.classList.toggle(`neg`,s<0))}floatMoney(e,t,n){let r=document.createElement(`div`);r.className=`badge-float money-float `+n,r.textContent=t,e.appendChild(r),setTimeout(()=>r.remove(),1e3)}updateBadge(e,t=0){let n=this.shops.get(e);if(!n)return;let r=this.state.delivered[e]??0,i=n.badgeEl.querySelector(`.shop-badge-n`);if(i&&(i.textContent=B(r)),n.badgeEl.classList.toggle(`zero`,r===0),n.el.classList.toggle(`empty-shop`,r===0),n.badgeEl.classList.remove(`pulse`),requestAnimationFrame(()=>n.badgeEl.classList.add(`pulse`)),t>0){let e=document.createElement(`div`);e.className=`badge-float`,e.textContent=`+`+B(t),n.el.appendChild(e),setTimeout(()=>e.remove(),900)}}loop(e){let t=Math.min(.1,(e-this.lastT)/1e3);this.lastT=e;let r=!1;for(let e of n){let t=this.state.industries[e.id],n=this.shops.has(e.id);t&&t.unlocked&&!n&&(r=!0)}r&&this.rebuildShops();let a=d(this.state),o=this.shops.size,s=(o===0?0:Math.min(3,.4+o*.25))*ne(this.state.reputation)*a.spawnRate;for(this.spawnAcc+=t*s;this.spawnAcc>=1&&this.customers.length<40;)--this.spawnAcc,this.spawnCustomer();for(let e=this.customers.length-1;e>=0;e--){let n=this.customers[e];if(n.floor>=this.floors){n.floor=0,n.y=0,n.state=`walking-out`,n.target=null,n.el.classList.remove(`inside`);let e=n.x<this.width/2?-1:1;n.vx=e*60,n.facing=e}else (n.state===`climbing-up`||n.state===`climbing-down`)&&n.floor+1>=this.floors&&n.state===`climbing-up`&&(n.y=n.floor*J,n.state=`walking-out`,n.target=null);if(n.state===`walking-in`&&n.target){let e=this.state.industries[n.target.defId];if(e&&e.closed){if(!this.advanceRoute(n)){n.state=`walking-out`;let e=n.vx>=0,t=40+Math.random()*30;n.vx=(e?1:-1)*t,n.facing=n.vx>=0?1:-1}}else{let e;e=n.floor===n.target.floor?n.target.x:n.floor<n.target.floor?this.stairBottomX(n.floor,n.side):this.stairTopX(n.floor-1,n.side);let r=Math.abs(n.vx)||50;n.vx=(e>n.x?1:-1)*r,n.facing=n.vx>=0?1:-1,n.x+=n.vx*t,(n.vx>0&&n.x>=e||n.vx<0&&n.x<=e)&&(n.x=e,n.floor===n.target.floor?(n.state=`shopping`,n.shopTimer=(.6+Math.random()*1.2)*a.shopDwell,n.el.classList.add(`inside`)):n.floor<n.target.floor?n.state=`climbing-up`:n.state=`climbing-down`)}}else if(n.state===`climbing-up`&&n.target)if(n.target.floor<=n.floor)n.y=n.floor*J,n.state=`walking-in`;else{n.y+=qt*t;let e=n.floor,r=(e+1)*J;n.x=this.climbX(e,n.y,n.side),n.facing=this.stairTopX(e,n.side)>=this.stairBottomX(e,n.side)?1:-1,n.y>=r&&(n.y=r,n.floor+=1,n.x=this.stairTopX(e,n.side),n.state=`walking-in`)}else if(n.state===`climbing-down`){n.y-=qt*t;let e=Math.max(0,n.floor-1),r=Math.max(0,e*J);if(n.x=this.climbX(e,n.y,n.side),n.facing=this.stairBottomX(e,n.side)>=this.stairTopX(e,n.side)?1:-1,n.y<=r){if(n.y=r,n.floor=e,n.x=this.stairBottomX(e,n.side),n.target&&n.target.floor>=n.floor)n.state=`walking-in`;else if(n.floor<=0){n.floor=0,n.state=`walking-out`;let e=Math.random()<.5,t=50+Math.random()*40;n.vx=(e?1:-1)*t,n.facing=n.vx>=0?1:-1}}}else if(n.state===`shopping`){if(n.shopTimer-=t,n.shopTimer<=0){n.el.classList.remove(`inside`);let e=n.target.defId,t=this.state.delivered[e]??0,r,o=this.getStats(e);if(t>0){let s=n.wealth.units,c=Math.min(t,s);this.state.delivered[e]=t-c;let l=i.get(e);if(l){n.product.innerHTML=W(l.icon,{size:14});let e=n.wealth.tier===`whale`?a.whaleTip:1,t=de(l,this.state)*b*n.wealth.multiplier*c*a.tipMult*e,r=ee(l,t,c),i=Math.min(r.total,t),s=t-i;this.state.money+=s,this.state.totalEarned+=s,o.extraEarned+=s,o.feesPaid+=i;let u=n.target.el;this.floatMoney(u,`+`+R(s),`gain`),i>0&&setTimeout(()=>this.floatMoney(u,`−`+R(i)+` fees`,`loss`),220)}let u=Math.round(2*(n.wealth.tier===`whale`?3:n.wealth.tier===`wealthy`?2:1)*a.repGainMult);if(this.state.reputation=w(this.state.reputation+u),o.repGained+=u,this.flyReputation(n.target,`+`+u,`gain`),c<s&&!a.partialForgive){let e=Math.max(1,Math.floor(5/2*a.repLossMult));this.state.reputation=w(this.state.reputation-e),o.repLost+=e}o.sales+=1;let d=o.unitsSold;o.unitsSold+=c;for(let t of h)if(d<t.units&&o.unitsSold>=t.units){let r=i.get(e);r&&this.salesMilestoneToast(n.target,r.name,t.label,t.mult);break}n.el.classList.add(`carrying`),this.updateBadge(e),this.renderShopStats(n.target),r=50+Math.random()*40}else{let t=i.get(e);if(t){let e=fe(t,this.state)*te(this.state.reputation)*n.wealth.multiplier*a.repLossMult,r=Math.min(this.state.money,e);this.state.money-=r,o.extraLost+=r,this.floatMoney(n.target.el,`-`+R(r),`loss`)}let s=Math.max(1,Math.round(5*(n.wealth.tier===`whale`?4:n.wealth.tier===`wealthy`?2:1)*a.repLossMult));this.state.reputation=w(this.state.reputation-s),o.repLost+=s,o.misses+=1,this.flyReputation(n.target,`-`+s,`loss`),this.renderShopStats(n.target),n.el.classList.add(`empty`),n.target.el.classList.add(`sold-out`),setTimeout(()=>n.target?.el.classList.remove(`sold-out`),1500),r=25+Math.random()*15}this.advanceRoute(n)?(n.state=`walking-in`,n.vx=((n.floor===n.target.floor?n.target.x:this.stairBottomX(n.floor,n.side))>n.x?1:-1)*r,n.facing=n.vx>=0?1:-1):(n.state=`walking-out`,n.floor>0?n.vx=(this.stairTopX(n.floor-1,n.side)>n.x?1:-1)*r:n.vx=(Math.random()<.5?1:-1)*r,n.facing=n.vx>=0?1:-1)}}else if(n.state===`walking-out`){if(n.floor>0){let e=this.stairTopX(n.floor-1,n.side);n.vx=(e>n.x?1:-1)*(Math.abs(n.vx)||50),n.facing=n.vx>=0?1:-1,n.x+=n.vx*t,(n.vx>0&&n.x>=e||n.vx<0&&n.x<=e)&&(n.x=e,n.state=`climbing-down`)}else if(n.x+=n.vx*t,n.x<-50||n.x>this.width+50){n.el.remove(),this.customers.splice(e,1);continue}}let r=n.lane*10,o=Math.max(n.floor,n.y/J),s=this.floorScale(o);n.el.style.transform=`translate3d(${n.x}px, ${-(n.y+r)}px, 0) scale(${n.baseScale*s})`,n.el.style.zIndex=String(1e3+n.floor*200-Math.round(n.lane*100)),n.body.style.transform=`scaleX(${n.facing})`,n.el.classList.toggle(`climbing`,n.state===`climbing-up`||n.state===`climbing-down`)}this.alive&&(this.rafId=requestAnimationFrame(e=>this.loop(e)))}},$t=Re(),X=$t?pe($t):p(),en=$t?Ie(X,Date.now()):0,Z=$e(X,Mt),tn=Z.tick,Q=document.createElement(`section`);Q.className=`log-panel`,Q.innerHTML=`
  <header class="log-head">
    <span class="log-title">${U(`scroll`,{size:14})} LOG</span>
    <button class="log-clear" type="button" title="Clear log">${U(`x`,{size:14})}</button>
  </header>
  <div class="log-body" id="log-body"></div>
`,(document.getElementById(`left-sidebar`)??document.body).appendChild(Q);var $=Q.querySelector(`#log-body`),nn=100;function rn(e){return e<10?`0`+e:String(e)}function an(e){let t=new Date(e);return rn(t.getHours())+`:`+rn(t.getMinutes())+`:`+rn(t.getSeconds())}function on(e){let t=document.createElement(`div`);for(t.className=`log-entry`+(e.color?` tinted`:``),e.color&&t.style.setProperty(`--log-color`,e.color),t.innerHTML=`<span class="log-ts">${an(e.ts)}</span><span class="log-msg">${e.msg}</span>`,$.appendChild(t);$.childElementCount>nn;)$.firstElementChild?.remove();$.scrollTop=$.scrollHeight,requestAnimationFrame(()=>t.classList.add(`in`))}Nt(on),Q.querySelector(`.log-clear`).addEventListener(`click`,()=>{$.innerHTML=``});var sn=new Qt(X);sn.onShopClick=e=>{let t=i.get(e);t&&(Z.ui.tab=`industries`,Z.ui.industryCategory=t.category??`Misc`,document.querySelectorAll(`.tab`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===`industries`)}),Z.render(),requestAnimationFrame(()=>{let t=document.querySelector(`[data-card="${e}"]`);t&&(t.scrollIntoView({behavior:`smooth`,block:`center`}),t.classList.remove(`flash`),requestAnimationFrame(()=>t.classList.add(`flash`)),setTimeout(()=>t.classList.remove(`flash`),1400))}))},en>0&&Mt(`Welcome back! Earned ${R(en)} while away.`);var cn=performance.now();function ln(e){let t=Math.min(1,(e-cn)/1e3);cn=e;let n=Fe(X,t),r=ke(X);if(X.lastTick=Date.now(),tn(),r.length>0){for(let e of r){let t=i.get(e);t&&Mt(`${U(`worker`,{size:12})} New employee joined ${t.name}`,{color:V(t.category)})}Z.render()}for(let e in n.completions)sn.flyProduct(e,n.completions[e]);requestAnimationFrame(ln)}requestAnimationFrame(e=>{cn=e,ln(e)}),setInterval(()=>{Be()||L(X)},1e4),window.addEventListener(`beforeunload`,()=>{Be()||L(X)});function un(){try{window.parent.postMessage({type:`GAME_OVER`,score:Math.floor(X.totalEarned),subScore:Math.floor(X.totalProduced)},`*`)}catch{}}setInterval(un,5e3),window.addEventListener(`beforeunload`,un),window.addEventListener(`pagehide`,un);try{localStorage.removeItem(`scene-kind`)}catch{}
//# sourceMappingURL=index-H9P4lLtK.js.map
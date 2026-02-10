import{r as c}from"./index-BGy26H0q.js";var w={cm:!0,mm:!0,in:!0,px:!0,pt:!0,pc:!0,em:!0,ex:!0,ch:!0,rem:!0,vw:!0,vh:!0,vmin:!0,vmax:!0,"%":!0};function P(e){if(typeof e=="number")return{value:e,unit:"px"};var r,n=(e.match(/^[0-9.]*/)||"").toString();n.includes(".")?r=parseFloat(n):r=parseInt(n,10);var t=(e.match(/[^0-9]*$/)||"").toString();return w[t]?{value:r,unit:t}:(console.warn("React Spinners: ".concat(e," is not a valid css value. Defaulting to ").concat(r,"px.")),{value:r,unit:"px"})}var l=function(e,r,n){var t="react-spinners-".concat(e,"-").concat(n);if(typeof window>"u"||!window.document)return t;var o=document.createElement("style");document.head.appendChild(o);var i=o.sheet,u=`
    @keyframes `.concat(t,` {
      `).concat(r,`
    }
  `);return i&&i.insertRule(u,0),t},m=function(){return m=Object.assign||function(e){for(var r,n=1,t=arguments.length;n<t;n++){r=arguments[n];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o])}return e},m.apply(this,arguments)},E=function(e,r){var n={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&r.indexOf(t)<0&&(n[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,t=Object.getOwnPropertySymbols(e);o<t.length;o++)r.indexOf(t[o])<0&&Object.prototype.propertyIsEnumerable.call(e,t[o])&&(n[t[o]]=e[t[o]]);return n},a=[1,3,5],x=[l("PropagateLoader","25% {transform: translateX(-".concat(a[0],`rem) scale(0.75)}
    50% {transform: translateX(-`).concat(a[1],`rem) scale(0.6)}
    75% {transform: translateX(-`).concat(a[2],`rem) scale(0.5)}
    95% {transform: translateX(0rem) scale(1)}`),"propogate-0"),l("PropagateLoader","25% {transform: translateX(-".concat(a[0],`rem) scale(0.75)}
    50% {transform: translateX(-`).concat(a[1],`rem) scale(0.6)}
    75% {transform: translateX(-`).concat(a[1],`rem) scale(0.6)}
    95% {transform: translateX(0rem) scale(1)}`),"propogate-1"),l("PropagateLoader","25% {transform: translateX(-".concat(a[0],`rem) scale(0.75)}
    75% {transform: translateX(-`).concat(a[0],`rem) scale(0.75)}
    95% {transform: translateX(0rem) scale(1)}`),"propogate-2"),l("PropagateLoader","25% {transform: translateX(".concat(a[0],`rem) scale(0.75)}
    75% {transform: translateX(`).concat(a[0],`rem) scale(0.75)}
    95% {transform: translateX(0rem) scale(1)}`),"propogate-3"),l("PropagateLoader","25% {transform: translateX(".concat(a[0],`rem) scale(0.75)}
    50% {transform: translateX(`).concat(a[1],`rem) scale(0.6)}
    75% {transform: translateX(`).concat(a[1],`rem) scale(0.6)}
    95% {transform: translateX(0rem) scale(1)}`),"propogate-4"),l("PropagateLoader","25% {transform: translateX(".concat(a[0],`rem) scale(0.75)}
    50% {transform: translateX(`).concat(a[1],`rem) scale(0.6)}
    75% {transform: translateX(`).concat(a[2],`rem) scale(0.5)}
    95% {transform: translateX(0rem) scale(1)}`),"propogate-5")];function L(e){var r=e.loading,n=r===void 0?!0:r,t=e.color,o=t===void 0?"#000000":t,i=e.speedMultiplier,u=i===void 0?1:i,d=e.cssOverride,y=d===void 0?{}:d,v=e.size,X=v===void 0?15:v,h=E(e,["loading","color","speedMultiplier","cssOverride","size"]),g=P(X),p=g.value,f=g.unit,O=m({display:"inherit",position:"relative"},y),s=function(b){return{position:"absolute",fontSize:"".concat(p/3).concat(f),width:"".concat(p).concat(f),height:"".concat(p).concat(f),background:o,borderRadius:"50%",animation:"".concat(x[b]," ").concat(1.5/u,"s infinite"),animationFillMode:"forwards"}};return n?c.createElement("span",m({style:O},h),c.createElement("span",{style:s(0)}),c.createElement("span",{style:s(1)}),c.createElement("span",{style:s(2)}),c.createElement("span",{style:s(3)}),c.createElement("span",{style:s(4)}),c.createElement("span",{style:s(5)})):null}export{L as P};

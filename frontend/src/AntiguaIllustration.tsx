export default function AntiguaIllustration() {
  return (
    <svg viewBox="0 0 920 650" className="antigua-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#d9e3d9"/><stop offset=".68" stopColor="#f1d5b4"/><stop offset="1" stopColor="#d39169"/></linearGradient>
        <linearGradient id="mountain" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#667365"/><stop offset="1" stopColor="#273d36"/></linearGradient>
        <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#f6e8cf"/><stop offset="1" stopColor="#d8b88e"/></linearGradient>
      </defs>
      <rect width="920" height="650" fill="url(#sky)"/>
      <circle cx="700" cy="151" r="51" fill="#f4d2a4" opacity=".94"/>
      <path d="M0 357 150 291l96 44 146-192 131 174 98-83 91 99 114-55 94 71v301H0Z" fill="#7b8372" opacity=".48"/>
      <path d="m78 381 110-70 49 20 155-191 128 169 46-28 103 113v256H78Z" fill="url(#mountain)"/>
      <path d="m315 242 77-102 73 96-41-17-24 23-26-14-28 18Z" fill="#e7e4d3" opacity=".9"/>
      <path d="M0 415h920v235H0Z" fill="#a67154"/>
      <path d="M0 438h920v40H0Z" fill="#d9b88e"/>
      <path d="m135 478 33-73 41 73h-21v172h-31V478Zm69 0 29-73 45 73h-21v172h-31V478Zm501 0 32-73 44 73h-21v172h-31V478Zm65 0 30-73 44 73h-22v172h-30V478Z" fill="#31443a"/>
      <g fill="url(#wall)">
        <path d="M278 350h166v300H278z"/><path d="M464 300h193v350H464z"/><path d="M676 366h129v284H676z"/>
      </g>
      <g fill="#ba7959">
        <path d="M262 350h197v24H262z"/><path d="M449 300h223v25H449z"/><path d="M663 366h154v24H663z"/>
        <path d="m248 350 29-40 29 40Zm177 0 29-40 29 40Zm5-50 29-41 30 41Zm209 0 29-41 30 41Zm7 66 30-40 31 40Z"/>
      </g>
      <g fill="#536356">
        <path d="M306 403h43v75h-43zM374 403h43v75h-43zM495 352h43v75h-43zM568 352h43v75h-43zM706 411h38v68h-38z"/>
        <path d="M306 520h111v130H306zM495 468h116v182H495zM706 505h38v145h-38z"/>
      </g>
      <g fill="#e5c9a4"><path d="M362 650V538a40 40 0 0 1 80 0v112z"/><path d="M622 650V530a42 42 0 0 1 84 0v120z"/></g>
      <path d="M0 582c141-37 253-21 352 14s211 46 310 6 180-53 258-28v76H0z" fill="#8d624d" opacity=".62"/>
      <g fill="#f2debb"><circle cx="75" cy="136" r="2"/><circle cx="122" cy="174" r="2"/><circle cx="788" cy="264" r="2"/><circle cx="854" cy="217" r="2"/><circle cx="572" cy="109" r="2"/></g>
      <path d="M690 612v-43m-13 13h27m-20-19 6 7m14 0 6-7" stroke="#334a3d" strokeWidth="5" strokeLinecap="round"/>
      <path d="M719 612v-31m-10 11h20" stroke="#334a3d" strokeWidth="4" strokeLinecap="round"/>
      <rect x="0" y="0" width="920" height="650" fill="none" stroke="#f8f3e8" strokeWidth="22" opacity=".72"/>
    </svg>
  );
}

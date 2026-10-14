const backgrounds = ['#dce6d8', '#e9ddca', '#dce5e7', '#e8d8cf', '#e3dfeb', '#eadfae']
const skinTones = ['#f2c6a5', '#d99e76', '#9d6448', '#efb58a', '#be825d']
const clothes = ['#41634d', '#647a88', '#a4654d', '#8a7953', '#756787']

export default function Avatar({ seed = 0, className = '', label = '프로필 아바타' }) {
  const value = Number.isInteger(seed) && seed >= 0 ? seed : 0
  const bg = backgrounds[value % backgrounds.length]
  const skin = skinTones[Math.floor(value / 7) % skinTones.length]
  const shirt = clothes[Math.floor(value / 37) % clothes.length]
  const hair = Math.floor(value / 191) % 3
  const glasses = Math.floor(value / 577) % 2 === 1
  return <svg className={`profile-avatar ${className}`} viewBox="0 0 160 160" role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true} xmlns="http://www.w3.org/2000/svg">
    <circle cx="80" cy="80" r="80" fill={bg} />
    <circle cx="130" cy="31" r="22" fill="#fff" opacity=".28" />
    <path d="M22 160c2-35 23-51 58-51s56 16 58 51" fill={shirt} />
    <path d="M69 100h22v24c-6 9-16 9-22 0" fill={skin} />
    <ellipse cx="80" cy="68" rx="39" ry="45" fill="#3e322c" />
    <circle cx="44" cy="77" r="9" fill={skin} /><circle cx="116" cy="77" r="9" fill={skin} />
    <rect x="48" y="38" width="64" height="75" rx="30" fill={skin} />
    {hair === 0 && <path d="M45 65c-4-38 24-52 46-42 19-1 31 18 25 44-8-7-11-16-13-26-16 13-36 15-58 24" fill="#3e322c" />}
    {hair === 1 && <path d="M44 63c-7-13-4-22 4-26-2-15 17-23 27-16 12-13 29-4 30 5 16-3 24 14 15 24l-7 13-10-19c-15 8-29 7-44 3l-9 17" fill="#49392f" />}
    {hair === 2 && <><path d="M43 55c0-28 19-39 37-39s38 11 38 39" fill={shirt} /><path d="M39 56c23-8 57-8 82 0" stroke={shirt} strokeWidth="12" strokeLinecap="round" /></>}
    <g fill="#342c29"><circle cx="66" cy="75" r="3" /><circle cx="94" cy="75" r="3" /></g>
    <path d="m80 80-3 8h5" fill="none" stroke="#8c5844" strokeWidth="2" strokeLinecap="round" />
    <path d="M69 96q11 10 22 0" fill="none" stroke="#704638" strokeWidth="3" strokeLinecap="round" />
    {glasses && <g fill="none" stroke="#3e4238" strokeWidth="3"><rect x="53" y="65" width="25" height="20" rx="8" /><rect x="82" y="65" width="25" height="20" rx="8" /><path d="M78 73h4M48 70h5m54 0h5" /></g>}
    <path d="M68 131 80 143l12-12" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
  </svg>
}

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/IKMSurveyModal-BM_CplEO.js","assets/app-CVKqru8l.js","assets/vendor-inertia-Cs8_e6qJ.js","assets/vendor-axios-C44AX5GR.js","assets/app-C_ciEu6r.css","assets/vendor-lucide-DaP2mXD-.js"])))=>i.map(i=>d[i]);
import{j as e,_ as H}from"./app-CVKqru8l.js";import{r as d,L as m}from"./vendor-inertia-Cs8_e6qJ.js";import{a8 as P,a9 as K,aa as z,ab as M,ac as C,ad as I,ae as L,af as T,E as $,ag as R,ah as O,X as j,ai as _,aj as J,ak as F,al as G,Y as U,a as W,am as V,O as X,J as Y,x as q,g as Q}from"./vendor-lucide-DaP2mXD-.js";const E="jdih_a11y_settings",w={ttsEnabled:!1,fontSize:0,highContrast:!1,darkMode:!1,textSpacing:!1,underlineLinks:!1,hideImages:!1,readingGuide:!1};function Z(){try{const a=localStorage.getItem(E);if(a)return{...w,...JSON.parse(a)}}catch{}return{...w}}function D(a){try{localStorage.setItem(E,JSON.stringify(a))}catch{}}function ee(a){let n=document.getElementById("a11y-global-styles");n||(n=document.createElement("style"),n.id="a11y-global-styles",document.head.appendChild(n));const s=a.fontSize===0?"100%":a.fontSize===1?"110%":a.fontSize===2?"125%":a.fontSize===-1?"90%":"80%",o=a.textSpacing?"2.2":"1.6",i=a.textSpacing?"0.08em":"normal",l=a.textSpacing?"0.18em":"normal";let r=`
        /* Font size */
        #a11y-overlay { font-size: ${s} !important; }

        /* Text spacing */
        #a11y-overlay {
            line-height: ${o} !important;
            letter-spacing: ${i} !important;
            word-spacing: ${l} !important;
        }
        #a11y-overlay p,
        #a11y-overlay li,
        #a11y-overlay td,
        #a11y-overlay th,
        #a11y-overlay span,
        #a11y-overlay div,
        #a11y-overlay a,
        #a11y-overlay h1, #a11y-overlay h2, #a11y-overlay h3,
        #a11y-overlay h4, #a11y-overlay h5, #a11y-overlay h6 {
            line-height: ${o} !important;
            letter-spacing: ${i} !important;
            word-spacing: ${l} !important;
        }

        /* Underline links */
        ${a.underlineLinks?`
        #a11y-overlay a {
            text-decoration: underline !important;
            text-underline-offset: 3px !important;
            font-weight: 700 !important;
        }`:""}

        /* Hide images */
        ${a.hideImages?`
        #a11y-overlay img,
        #a11y-overlay svg,
        #a11y-overlay picture,
        #a11y-overlay .banner,
        #a11y-overlay [class*="banner"] {
            visibility: hidden !important;
            opacity: 0 !important;
        }`:""}

        /* High contrast */
        ${a.highContrast?`
        #a11y-overlay {
            background: #000 !important;
            color: #fff !important;
        }
        #a11y-overlay *,
        #a11y-overlay p, #a11y-overlay span, #a11y-overlay div,
        #a11y-overlay h1, #a11y-overlay h2, #a11y-overlay h3,
        #a11y-overlay h4, #a11y-overlay h5, #a11y-overlay h6,
        #a11y-overlay li, #a11y-overlay td, #a11y-overlay th {
            color: #fff !important;
        }
        #a11y-overlay a {
            color: #88ccff !important;
            text-decoration: underline !important;
        }
        #a11y-overlay [class*="bg-white"],
        #a11y-overlay .bg-white {
            background: #000 !important;
        }
        #a11y-overlay [class*="bg-slate"],
        #a11y-overlay .bg-slate {
            background: #111 !important;
        }
        #a11y-overlay [class*="text-slate-"],
        #a11y-overlay .text-slate {
            color: #fff !important;
        }
        #a11y-overlay [class*="border-slate"],
        #a11y-overlay .border-slate {
            border-color: #555 !important;
        }
        #a11y-overlay table {
            border-collapse: collapse !important;
        }
        #a11y-overlay th, #a11y-overlay td {
            border: 1px solid #fff !important;
            padding: 8px !important;
        }
        #a11y-overlay th {
            background: #333 !important;
        }`:""}

        /* Dark mode (content only) */
        ${a.darkMode?`
        #a11y-overlay {
            background: #0f172a !important;
            color: #e2e8f0 !important;
        }
        #a11y-overlay .bg-white {
            background: #1e293b !important;
        }
        #a11y-overlay p, #a11y-overlay span, #a11y-overlay div,
        #a11y-overlay h1, #a11y-overlay h2, #a11y-overlay h3,
        #a11y-overlay h4, #a11y-overlay h5, #a11y-overlay h6,
        #a11y-overlay li {
            color: #cbd5e1 !important;
        }
        #a11y-overlay a {
            color: #93c5fd !important;
        }
        #a11y-overlay [class*="border-slate-100"],
        #a11y-overlay .border-slate-100 {
            border-color: #334155 !important;
        }
        #a11y-overlay input, #a11y-overlay textarea, #a11y-overlay select {
            background: #334155 !important;
            color: #e2e8f0 !important;
            border-color: #475569 !important;
        }
        #a11y-overlay table {
            border-color: #334155 !important;
        }
        #a11y-overlay th {
            background: #334155 !important;
            color: #f1f5f9 !important;
        }
        #a11y-overlay td {
            border-color: #334155 !important;
            color: #cbd5e1 !important;
        }`:""}

        /* Reading guide - highlight current paragraph */
        ${a.readingGuide?`
        #a11y-overlay p,
        #a11y-overlay li {
            transition: background 0.2s ease;
        }
        #a11y-overlay p:hover,
        #a11y-overlay li:hover {
            background: rgba(255, 255, 0, 0.1) !important;
            outline: 2px solid rgba(255, 255, 0, 0.3) !important;
        }`:""}

        /* Skip to content link */
        #a11y-skip-link {
            position: absolute;
            top: -100%;
            left: 50%;
            transform: translateX(-50%);
            background: #2563eb;
            color: #fff;
            padding: 12px 24px;
            border-radius: 0 0 8px 8px;
            z-index: 10000;
            font-weight: 600;
            text-decoration: none;
            transition: top 0.2s;
        }
        #a11y-skip-link:focus {
            top: 0;
        }
    `;n.textContent=r}function ae(){const[a,n]=d.useState(Z),[s,o]=d.useState(!1),[i,l]=d.useState(a.ttsEnabled);d.useEffect(()=>{ee(a)},[a]),d.useEffect(()=>{D(a)},[a]);const[r,u]=d.useState(!1);let b;d.useEffect(()=>{u(i)},[i]),d.useEffect(()=>{const t=document.getElementById("a11y-overlay");if(!t||!r){window.speechSynthesis.cancel();return}const p=h=>{const c=typeof h.className=="string"?h.className:"",x=h.tagName.toLowerCase();return!!(x==="button"||x==="input"||x==="select"||x==="a"||c.includes("fixed")||c.includes("a11y")||c.includes("z-[9"))},f=h=>{const c=window.getSelection();if(c&&c.toString().trim().length>0)return;const x=h.textContent?.trim()||"";if(x&&x.length>1&&!p(h)){window.speechSynthesis.cancel();const k=new SpeechSynthesisUtterance(x.substring(0,500));k.lang="id-ID",k.rate=.9,window.speechSynthesis.speak(k)}},y=h=>{const c=h.target;t.contains(c)&&(p(c)||(clearTimeout(b),b=setTimeout(()=>f(c),400)))},S=h=>{const c=h.relatedTarget;t.contains(c)||(window.speechSynthesis.cancel(),clearTimeout(b))};return t.addEventListener("mouseover",y),t.addEventListener("mouseout",S),()=>{t.removeEventListener("mouseover",y),t.removeEventListener("mouseout",S),window.speechSynthesis.cancel(),clearTimeout(b),b=void 0}},[r]),d.useEffect(()=>{const t=()=>l(p=>(n(f=>({...f,ttsEnabled:!p})),!p));return window.addEventListener("toggle-accessibility",t),()=>window.removeEventListener("toggle-accessibility",t)},[]);const v=d.useCallback((t,p)=>{n(f=>{const y={...f,[t]:p};return t==="ttsEnabled"&&l(p),y})},[]),B=d.useCallback(()=>{const t={...w};n(t),l(!1),D(t)},[]),N=[{id:"ttsEnabled",label:"Pembaca Suara (Hover)",icon:i?e.jsx(P,{className:"h-4 w-4"}):e.jsx(K,{className:"h-4 w-4"}),toggle:!0},{id:"fontSize",label:"Ukuran Font",icon:e.jsx(z,{className:"h-4 w-4"}),control:!0},{id:"highContrast",label:"Kontras Tinggi",icon:e.jsx(M,{className:"h-4 w-4"}),toggle:!0},{id:"darkMode",label:"Mode Gelap",icon:e.jsx(C,{className:"h-4 w-4"}),toggle:!0},{id:"textSpacing",label:"Jarak Teks",icon:e.jsx(I,{className:"h-4 w-4"}),toggle:!0},{id:"underlineLinks",label:"Garis Bawah Link",icon:e.jsx(L,{className:"h-4 w-4"}),toggle:!0},{id:"hideImages",label:"Sembunyikan Gambar",icon:a.hideImages?e.jsx(T,{className:"h-4 w-4"}):e.jsx($,{className:"h-4 w-4"}),toggle:!0},{id:"readingGuide",label:"Panduan Membaca",icon:e.jsx(R,{className:"h-4 w-4"}),toggle:!0}],g=N.filter(t=>a[t.id]).length;return e.jsxs(e.Fragment,{children:[e.jsx("a",{href:"#main-content",id:"a11y-skip-link",className:"fixed top-0 left-1/2 -translate-x-1/2 z-[10001] bg-blue-600 text-white px-6 py-3 rounded-b-xl font-semibold shadow-lg hover:bg-blue-700 focus:z-[10001] transition-colors",onClick:t=>{t.preventDefault(),document.getElementById("main-content")?.focus()},children:"Lewati ke Konten Utama"}),e.jsxs("div",{className:"fixed bottom-6 left-6 z-[9999] flex flex-col items-center gap-2",children:[s&&e.jsxs("div",{className:"mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 w-72 overflow-hidden animate-in fade-in slide-in-from-bottom-2",children:[e.jsxs("div",{className:"bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(O,{className:"h-5 w-5 text-yellow-300"}),e.jsx("span",{className:"text-white font-bold text-sm",children:"Panel Aksesibilitas"}),g>0&&e.jsxs("span",{className:"ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold",children:[g," aktif"]})]}),e.jsx("button",{onClick:()=>o(!1),className:"text-white/70 hover:text-white transition-colors","aria-label":"Tutup panel",children:e.jsx(j,{className:"h-4 w-4"})})]}),e.jsx("div",{className:"p-3 space-y-1 max-h-80 overflow-y-auto",children:N.map(t=>e.jsxs("div",{className:"flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`p-2 rounded-lg ${a[t.id]?"bg-blue-100 text-blue-600":"bg-slate-100 text-slate-500"}`,children:t.icon}),e.jsx("span",{className:"text-sm font-medium text-slate-700",children:t.label})]}),t.toggle&&e.jsx("button",{onClick:()=>v(t.id,!a[t.id]),className:`relative w-11 h-6 rounded-full transition-colors duration-200 ${a[t.id]?"bg-blue-600":"bg-slate-300"}`,"aria-label":`${t.label} ${a[t.id]?"aktif":"nonaktif"}`,children:e.jsx("span",{className:`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${a[t.id]?"translate-x-5":"translate-x-0"}`})}),t.control&&e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("button",{onClick:()=>v("fontSize",Math.max(-2,a.fontSize-1)),className:"p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors","aria-label":"Perkecil font",children:e.jsx(_,{className:"h-3.5 w-3.5"})}),e.jsxs("span",{className:"text-xs font-bold text-slate-600 w-8 text-center",children:[a.fontSize===0?"100":a.fontSize===1?"110":a.fontSize===2?"125":a.fontSize===-1?"90":"80","%"]}),e.jsx("button",{onClick:()=>v("fontSize",Math.min(2,a.fontSize+1)),className:"p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors","aria-label":"Perbesar font",children:e.jsx(J,{className:"h-3.5 w-3.5"})})]})]},t.id))}),e.jsx("div",{className:"px-3 py-3 border-t border-slate-100",children:e.jsxs("button",{onClick:B,className:"w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors",children:[e.jsx(F,{className:"h-4 w-4"}),"Reset Semua Pengaturan"]})})]}),e.jsxs("button",{onClick:()=>o(!s),className:`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 relative group ${s?"bg-blue-600 text-white":"bg-slate-800 text-slate-300"}`,title:s?"Tutup Panel Aksesibilitas":"Buka Panel Aksesibilitas","aria-label":s?"Tutup panel aksesibilitas":"Buka panel aksesibilitas",children:[s?e.jsx(j,{className:"h-7 w-7"}):e.jsx(G,{className:"h-7 w-7"}),g>0&&!s&&e.jsxs("span",{className:"absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center",children:[e.jsx("span",{className:"absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"}),e.jsx("span",{className:"relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-2 border-white items-center justify-center",children:e.jsx("span",{className:"text-[10px] font-bold text-white",children:g})})]}),e.jsx("span",{className:"absolute left-full ml-4 bg-white px-4 py-2 rounded-xl text-slate-900 text-xs font-black shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[10000]",children:s?"Tutup Panel Aksesibilitas":"Panel Aksesibilitas Lengkap"})]})]}),s&&i&&e.jsxs("div",{className:"fixed bottom-28 left-6 z-[999] bg-blue-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-pulse",children:[e.jsx(P,{className:"h-4 w-4"}),e.jsx("span",{className:"text-xs font-semibold",children:"Pembaca Suara Aktif — Hover teks untuk mendengar"})]}),e.jsx("div",{className:"fixed bottom-24 left-6 z-[999]",children:e.jsxs("a",{href:"https://wa.me/6281234567890",target:"_blank",rel:"noreferrer","aria-label":"Chat Admin WhatsApp",className:"flex flex-col items-center justify-center h-16 w-16 bg-[#25D366] text-white rounded-2xl shadow-2xl hover:scale-110 hover:shadow-green-400/40 active:scale-95 transition-all duration-200 group relative",children:[e.jsx("svg",{viewBox:"0 0 24 24",fill:"currentColor",className:"h-8 w-8",xmlns:"http://www.w3.org/2000/svg","aria-hidden":"true",children:e.jsx("path",{d:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"})}),e.jsx("span",{className:"text-[9px] font-bold leading-none mt-0.5 tracking-wide",children:"WA"}),e.jsx("span",{className:"absolute left-full ml-4 bg-white px-4 py-2 rounded-xl text-slate-900 text-xs font-black shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap border border-slate-100 z-[10000]",children:"Chat Admin WhatsApp"})]})})]})}const te=d.lazy(()=>H(()=>import("./IKMSurveyModal-BM_CplEO.js"),__vite__mapDeps([0,1,2,3,4,5]))),A=[{label:"Profil Kami",children:[{label:"Visi Misi",href:"/visi-misi"},{label:"Dasar Hukum",href:"/dasar-hukum"},{label:"Struktur Organisasi",href:"/struktur-organisasi"},{label:"Tupoksi Bagian Hukum",href:"/tupoksi-bag-hukum"},{label:"Anggota KAB Banjarnegara",href:"/anggota-jdih"},{label:"Kedudukan dan Alamat",href:"/kedudukan-dan-alamat"},{label:"SOP",href:"/sop"},{label:"Sarana & Prasarana",href:"/sarana-prasarana"}]},{label:"Peraturan",children:[{label:"Peraturan Daerah",href:"/peraturan-daerah"},{label:"Peraturan Bupati",href:"/peraturan-bupati"},{label:"Dokumen Hukum Terjemahan",href:"/dokumen-hukum-terjemahan"},{label:"Keputusan Bupati",href:"/keputusan-bupati"},{label:"Surat Edaran",href:"/instruksi-bupati"},{label:"Keputusan Sekretaris Daerah",href:"/keputusan-sekretaris-daerah"},{label:"Peraturan/Keputusan Kepala OPD",href:"#",children:[{label:"Peraturan Kepala OPD",href:"/peraturan-kepala-opd"},{label:"Keputusan Kepala OPD",href:"/keputusan-kepala-opd"}]},{label:"Dokumen Kerjasama",href:"#",children:[{label:"Nota Kesepakatan",href:"/nota-kesepakatan"},{label:"Kesepakatan Bersama",href:"/kesepakatan-bersama"},{label:"Memorandum of Understanding",href:"/mou"},{label:"Letter of Intent",href:"/loi"}]},{label:"Dokumen Hukum Langka",href:"/dokumen-hukum-langka"},{label:"Produk Hukum Desa",href:"/produk-hukum-desa"},{label:"Katalog",href:"/katalog"},{label:"Peraturan Pusat ↗",href:"https://jdihn.go.id/"}]},{label:"Pembentukan Hukum",children:[{label:"Propem",href:"#",children:[{label:"Propemperbup",href:"/propemperbup"}]},{label:"Naskah Akademik",href:"/naskah-akademik"},{label:"Raperda",href:"/raperda"},{label:"Raperbup",href:"/raperbup"},{label:"Hasil Harmonisasi",href:"/hasil-harmonisasi"},{label:"Hasil Fasilitasi",href:"#",children:[{label:"Fasilitasi Provinsi",href:"/fasilitasi-provinsi"},{label:"Fasilitasi Pusat",href:"/fasilitasi-pusat"}]},{label:"Analisis Dan Evaluasi Hukum",href:"/analisis-evaluasi-hukum"},{label:"Hasil Kajian Hukum",href:"/hasil-kajian-hukum"},{label:"Risalah Rapat",href:"/risalah-rapat"}]},{label:"Monografi Hukum",children:[{label:"Naskah Akademik",href:"/naskah-akademik"},{label:"Raperda",href:"/raperda"},{label:"Analisis Dan Evaluasi Hukum",href:"/analisis-evaluasi-hukum"},{label:"Hasil Fasilitasi",href:"#",children:[{label:"Hasil Fasilitasi Raperda Provinsi",href:"/fasilitasi-provinsi"},{label:"Hasil Fasilitasi Raperda Kabupaten/Kota",href:"/fasilitasi-kabupaten-kota"}]},{label:"Surat Edaran",href:"#",children:[{label:"Bupati/Wakil Bupati",href:"/surat-edaran-bupati"},{label:"Sekretaris Daerah",href:"/surat-edaran-sekda"},{label:"Kepala OPD",href:"/surat-edaran-opd"}]},{label:"RANHAM",href:"/ranham"},{label:"Risalah Rapat",href:"/risalah-rapat"}]},{label:"Artikel Hukum",href:"/artikel-bidang-hukum"},{label:"Putusan",href:"/putusan"},{label:"Informasi",children:[{label:"Berita",href:"/berita"},{label:"Statistik",href:"/statistik"},{label:"Download",href:"/unduh"},{label:"Galeri",href:"/galeri"},{label:"Video",href:"/video"}]},{label:"Layanan Hukum",children:[{label:"Dialog Publik",href:"/dialog-publik"},{label:"Bantuan Hukum",href:"/bantuan-hukum"},{label:"Konsultasi Hukum",href:"/konsultasi-hukum"},{label:"Jaringan Kerja Sama",href:"/kerja-sama-daerah"}]}];function se({user:a,variant:n="classic"}){const[s,o]=d.useState(!1),i=n==="modern";return e.jsxs("nav",{className:`fixed top-0 w-full z-50 transition-colors duration-300 ${i?"bg-white border-b border-slate-200 shadow-lg":"bg-[#0f172a]"}`,style:i?{}:{borderBottom:"1px solid #0f172a"},children:[e.jsx("div",{className:`${i?"bg-[#003399]":"bg-[#0d9488]"} text-white text-[10px] font-medium py-1.5 px-6 leading-none`,children:e.jsxs("div",{className:"max-w-7xl mx-auto flex justify-between items-center",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("span",{className:"hidden sm:block",children:"Bagian Hukum Sekretariat Daerah Kabupaten Banjarnegara"}),e.jsx("span",{className:"opacity-40",children:"•"}),e.jsx("span",{children:"Senin – Jumat, 08.00 – 11.00 WIB"})]}),e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsx("span",{className:"hidden md:block",children:"jdihbanjarnegara@gmail.com"}),e.jsx("div",{className:"flex items-center gap-4",children:e.jsxs("button",{onClick:()=>window.dispatchEvent(new CustomEvent("toggle-accessibility")),className:"hover:text-teal-200 transition-colors flex items-center gap-1 cursor-pointer","aria-label":"Aktifkan Fitur Aksesibilitas (Pembaca Suara)",children:[e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",className:"h-3 w-3","aria-hidden":"true",children:[e.jsx("path",{d:"M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"}),e.jsx("path",{d:"M19 9a7 7 0 1 1-14 0"}),e.jsx("path",{d:"M12 16v6"}),e.jsx("path",{d:"M8 21h8"})]}),"Aksesibilitas"]})})]})]})}),e.jsxs("div",{className:"max-w-7xl xl:max-w-[1366px] 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-x-4 xl:gap-x-6",children:[e.jsx(m,{href:"/",className:"flex items-center gap-3 shrink-0 group","aria-label":"Beranda JDIH Banjarnegara",children:e.jsx("img",{src:"/logo_jdih.webp",alt:"Logo JDIH Banjarnegara",width:180,height:48,className:"h-10 sm:h-11 xl:h-12 w-auto object-contain group-hover:scale-105 transition-transform"})}),e.jsx("div",{className:"hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs xl:text-sm font-medium",children:A.map(l=>e.jsxs("div",{className:"relative group/nav",children:[l.children?e.jsxs("button",{"aria-haspopup":"true","aria-expanded":"false",className:`flex items-center gap-1 xl:gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full transition-all whitespace-nowrap ${i?"text-slate-600 hover:text-[#003399] hover:bg-slate-50":"text-slate-200 hover:text-white hover:bg-white/10"}`,children:[l.label," ",e.jsx(U,{className:`h-3 w-3 xl:h-3.5 xl:w-3.5 transition-transform group-hover/nav:rotate-180 ${i?"text-slate-400":"text-slate-500"}`})]}):e.jsx(m,{href:l.href,className:`flex items-center px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full transition-all whitespace-nowrap ${i?"text-slate-600 hover:text-[#003399] hover:bg-slate-50":"text-slate-200 hover:text-white hover:bg-white/10"}`,children:l.label}),l.children&&e.jsx("div",{className:"absolute top-full left-0 pt-2 w-64 opacity-0 group-hover/nav:opacity-100 pointer-events-none group-hover/nav:pointer-events-auto transition-all translate-y-2 group-hover/nav:translate-y-0 z-50",children:e.jsx("div",{className:"bg-white border border-slate-100 shadow-2xl rounded-xl",children:e.jsx("div",{className:"p-2 grid grid-cols-1",children:l.children.map(r=>e.jsxs("div",{className:"relative group/sub",children:[e.jsxs(m,{href:r.href,className:"flex items-center justify-between px-4 py-2.5 text-slate-600 hover:text-[#003399] hover:bg-slate-50 rounded-lg transition-colors font-semibold",children:[r.label,r.children&&e.jsx(W,{className:"h-3 w-3"})]}),r.children&&e.jsx("div",{className:"absolute left-full top-0 pl-1 w-56 opacity-0 group-hover/sub:opacity-100 pointer-events-none group-hover/sub:pointer-events-auto transition-all translate-x-1 group-hover/sub:translate-x-0",children:e.jsx("div",{className:"bg-white border border-slate-100 shadow-xl rounded-xl p-2",children:r.children.map(u=>e.jsx(m,{href:u.href,className:"block px-4 py-2 text-xs text-slate-500 hover:text-[#003399] hover:bg-slate-50 rounded-lg transition-colors font-bold",children:u.label},u.label))})})]},r.label))})})})]},l.label))}),e.jsx("button",{onClick:()=>o(!s),"aria-label":s?"Tutup Menu":"Buka Menu","aria-expanded":s,className:`lg:hidden p-2 rounded-lg ${i?"text-slate-600 hover:bg-slate-50":"text-slate-200 hover:bg-white/10"}`,children:s?e.jsx(j,{className:"h-6 w-6"}):e.jsx(V,{className:"h-6 w-6"})})]}),s&&e.jsx("div",{className:"lg:hidden bg-white border-t border-slate-100 p-6 space-y-6 max-h-[80vh] overflow-y-auto shadow-inner",children:A.map(l=>e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2",children:l.label}),l.children?e.jsx("div",{className:"grid grid-cols-1 gap-1 pl-2",children:l.children.map(r=>e.jsxs("div",{className:"space-y-1",children:[r.href==="#"?e.jsx("div",{className:"px-4 py-2 text-slate-800 font-black text-sm",children:r.label}):e.jsx(m,{href:r.href,onClick:()=>o(!1),className:"block px-4 py-2 text-slate-700 font-bold text-sm hover:text-[#0d9488] active:bg-slate-50 rounded-lg transition-colors",children:r.label}),r.children&&e.jsx("div",{className:"pl-4 border-l-2 border-slate-100 ml-4 space-y-1 mt-1",children:r.children.map(u=>e.jsx(m,{href:u.href,onClick:()=>o(!1),className:"block px-4 py-2 text-xs text-slate-500 font-bold hover:text-[#0d9488] active:bg-slate-50 rounded-lg transition-colors",children:u.label},u.label))})]},r.label))}):e.jsx(m,{href:l.href,onClick:()=>o(!1),className:"block px-4 py-2 text-slate-800 font-black text-sm hover:text-[#0d9488] active:bg-slate-50 rounded-lg transition-colors",children:l.label})]},l.label))})]})}function le(){const a=[["Peraturan Daerah","/peraturan-daerah"],["Peraturan Bupati","/peraturan-bupati"],["Keputusan Bupati","/keputusan-bupati"],["Surat Edaran","/surat-edaran"],["Instruksi Bupati","/instruksi-bupati"],["Naskah Akademik","/naskah-akademik"],["Putusan","/putusan"],["Katalog","/katalog"]],n=[["JDIH Prov. Jawa Tengah","https://jdih.jatengprov.go.id/"],["Sekretariat Daerah","https://setda.banjarnegarakab.go.id"],["DPRD","https://dprd.banjarnegarakab.go.id"],["Inspektorat","https://inspektorat.banjarnegarakab.go.id"],["BKD","https://bkd.banjarnegarakab.go.id"],["BAPERLITBANG","https://baperlitbang.banjarnegarakab.go.id"],["BPPKAD","https://bppkad.banjarnegarakab.go.id"],["Dinas Kesehatan","https://dinkes.banjarnegarakab.go.id"],["DPUPR","https://dpupr.banjarnegarakab.go.id"],["DINKOMINFO","https://dinkominfo.banjarnegarakab.go.id"],["DISPARBUD","https://wisata.banjarnegarakab.go.id"]];return e.jsx("footer",{className:"bg-[#1e293b] text-slate-400 pt-12 pb-6",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 pb-10 border-b border-slate-700",children:[e.jsxs("div",{className:"md:col-span-2",children:[e.jsx(m,{href:"/",className:"inline-block mb-4","aria-label":"Beranda JDIH",children:e.jsx("img",{src:"/logo_jdih.webp",alt:"Logo JDIH Banjarnegara",width:200,height:56,className:"h-14 w-auto object-contain"})}),e.jsx("p",{className:"text-sm leading-relaxed mb-5 max-w-sm",children:"Jaringan Dokumentasi dan Informasi Hukum Kabupaten Banjarnegara – wadah pendayagunaan bersama atas dokumen hukum secara tertib, terpadu dan berkesinambungan."}),e.jsxs("div",{className:"space-y-2 text-sm",children:[e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(X,{className:"h-4 w-4 text-[#0d9488] shrink-0 mt-0.5"}),e.jsx("span",{children:"Jl. Ahmad Yani No. 16, Krandegan, Banjarnegara"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Y,{className:"h-4 w-4 text-[#0d9488] shrink-0"}),e.jsx("span",{children:"Telp. (0286) 591218"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(q,{className:"h-4 w-4 text-[#0d9488] shrink-0"}),e.jsx("span",{children:"jdihbanjarnegara@gmail.com"})]})]}),e.jsx("div",{className:"mt-6 max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-2xl group transition-all hover:border-[#0d9488]/50",children:e.jsx("iframe",{src:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.624220178036!2d109.69379512548414!3d-7.395934914095323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7aa91649242607%3A0x7cf16e25160c9389!2sSekretariat%20Daerah%20Kabupaten%20Banjarnegara!5e0!3m2!1sid!2sid!4v1777905689780!5m2!1sid!2sid",width:"100%",height:"150",style:{border:0},allowFullScreen:!1,loading:"lazy",referrerPolicy:"no-referrer-when-downgrade",className:"filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"})})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-white font-bold text-sm uppercase tracking-widest mb-4",children:"Produk Hukum"}),e.jsx("ul",{className:"space-y-2 text-sm",children:a.map(([s,o])=>e.jsx("li",{children:e.jsx(m,{href:o,className:"hover:text-[#0d9488] transition-colors",children:s})},s))})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-white font-bold text-sm uppercase tracking-widest mb-4",children:"Website OPD"}),e.jsx("ul",{className:"space-y-2 text-sm",children:n.map(([s,o])=>e.jsx("li",{children:e.jsxs("a",{href:o,target:"_blank",rel:"noreferrer",className:"hover:text-[#0d9488] transition-colors flex items-center gap-1",children:[s," ",e.jsx(Q,{className:"h-3 w-3 opacity-40"})]})},s))})]})]}),e.jsx("div",{className:"border-t border-slate-700 pt-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs",children:e.jsx("p",{children:"© 2025 Sekretariat Daerah Kabupaten Banjarnegara. Hak cipta dilindungi."})})]})})}function oe({children:a,user:n}){return e.jsxs("div",{className:"min-h-screen flex flex-col transition-colors duration-300 bg-[#1e293b]",children:[e.jsx(se,{user:n,variant:"classic"}),e.jsx("div",{className:"fixed top-0 w-full h-[95px] bg-[#0f172a] z-40"}),e.jsx("div",{id:"a11y-overlay",className:"pt-[92px] pb-8 flex-1 relative z-10",children:e.jsxs("div",{className:"bg-white",children:[e.jsx("div",{id:"main-content",tabIndex:-1,className:"sr-only focus:not-sr-only focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"}),a]})}),e.jsx(le,{}),e.jsx(d.Suspense,{fallback:null,children:e.jsx(te,{})}),e.jsx(ae,{})]})}export{oe as P};

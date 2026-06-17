const fs = require('fs');

let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Replace the props and declaration
headerCode = headerCode.replace(
  /export const Header: React\.FC<\{[\s\S]*?\}\> = \(\{ activeTab, setActiveTab \}\) => \{/,
  `export const Header: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
`
);

// Replace onClick
headerCode = headerCode.replace(
  /onClick=\{\(\) => setActiveTab\(item\.id as any\)\}/g,
  `onClick={() => scrollToSection(item.id)}`
);

// Replace the activeTab styling condition
headerCode = headerCode.replace(
  /className=\{`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all duration-300 border-2 \$\{[\s\S]*?\}`\}/,
  `className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all duration-300 border-2 bg-transparent border-stone-600 text-stone-400 hover:border-[#C4A484] hover:text-white"`
);

fs.writeFileSync('src/components/Header.tsx', headerCode);
console.log("Header fixed!");

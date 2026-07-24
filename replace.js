const fs = require('fs');

const replaceMap = {
  'bg-[#111110]': 'bg-surface-base',
  'bg-[#1A1A18]': 'bg-surface-elevated',
  'bg-[#242422]': 'bg-surface-highlight',
  'text-[#E8E8E6]': 'text-text-primary',
  'text-[#F2F2F0]': 'text-text-primary',
  'text-[#A0A09B]': 'text-text-secondary',
  'text-[#73736F]': 'text-text-tertiary',
  'border-[#2A2A28]': 'border-border-subtle',
  'border-[#40403C]': 'border-border-strong',
  'border-[#E8E8E6]': 'border-text-primary',
  'decoration-[#40403C]': 'decoration-border-strong',
  'hover:text-white': 'hover:text-text-primary',
  'group-hover:text-white': 'group-hover:text-text-primary'
};

const files = [
  'src/components/Home.tsx',
  'src/components/TopicPage.tsx',
  'src/components/ArticlePage.tsx',
  'src/components/SearchPage.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(replaceMap)) {
    content = content.split(key).join(value);
  }
  // Special fix for SearchPage active tab
  content = content.replace(/bg-\[#E8E8E6\] text-\[#111110\]/g, 'bg-text-primary text-surface-base');
  fs.writeFileSync(file, content);
});

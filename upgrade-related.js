const fs = require('fs');
const path = require('path');

const dir = 'd:/CODING/coding 2/coding 2/Xfile';
const files = fs.readdirSync(dir);

let count = 0;

// Clean HTML for related links block per file
const cleanRelatedLinks = `  <section class="related-links-section">
    <div style="max-width: var(--maxw); margin: 0 auto;">
      <h3>संबंधित जानकारियाँ (Related Links)</h3>
      <div class="rl-cards">
        <a href="panchayat-sahayak-salary-calculator.html" class="rl-card"><span class="rl-card-icon">💰</span> सैलरी कैलकुलेटर</a>
        <a href="panchayat-list-builder.html" class="rl-card"><span class="rl-card-icon">⚡</span> Quick List Builder</a>
        <a href="gram-panchayat-yojana-list.html" class="rl-card"><span class="rl-card-icon">🏘️</span> ग्राम पंचायत योजनाएं</a>
        <a href="panchayat-sahayak-forms-pdfs.html" class="rl-card"><span class="rl-card-icon">📄</span> PDF Forms</a>
        <a href="panchayat-sahayak-work-register.html" class="rl-card"><span class="rl-card-icon">📋</span> Work Register</a>
        <a href="panchayat-sahayak-salary-status.html" class="rl-card"><span class="rl-card-icon">✅</span> Salary Status</a>
        <a href="panchayat-sahayak-image-tools.html" class="rl-card"><span class="rl-card-icon">🖼️</span> Image Tools</a>
        <a href="panchayat-sahayak-all-portals.html" class="rl-card"><span class="rl-card-icon">🌐</span> सभी Portals</a>
        <a href="blog.html" class="rl-card"><span class="rl-card-icon">📰</span> Blog</a>
        <a href="index.html" class="rl-card rl-card-home"><span class="rl-card-icon">🏠</span> Home Page</a>
      </div>
    </div>
  </section>`;

// Match the old section block using a broad regex
const oldSectionRegex = /<section style="padding:40px 16px 20px 16px; margin-top:20px; border-top: 1px solid var\(--border\);">[\s\S]*?<\/section>/g;

for (let file of files) {
  if (file.endsWith('.html') && !file.includes('admin')) {
    let filePath = path.join(dir, file);
    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;

    if (oldSectionRegex.test(content)) {
      content = content.replace(oldSectionRegex, cleanRelatedLinks);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Upgraded related links in:', file);
      count++;
    }
  }
}
console.log('Total:', count);

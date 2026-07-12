const fs = require('fs');
let content = fs.readFileSync('src/templates.js', 'utf8');

// 1. Add pagination container
content = content.replace(
  '        <tbody id="proxyip-tbody" class="divide-y divide-white/5 text-sm">\n            <tr><td colspan="9" class="py-10 text-center text-on-surface-variant/50">در حال بارگذاری لیست پروکسی‌ها...</td></tr>\n          </tbody>\n        </table>\n      </div>\n    </div>',
  '        <tbody id="proxyip-tbody" class="divide-y divide-white/5 text-sm">\n            <tr><td colspan="9" class="py-10 text-center text-on-surface-variant/50">در حال بارگذاری لیست پروکسی‌ها...</td></tr>\n          </tbody>\n        </table>\n        <div id="proxyip-pagination"></div>\n      </div>\n    </div>'
);

// 2. Add pagination state and modify renderProxyIPTable
const oldRenderFn = `
    let proxyTableRenderId = 0;

    function renderProxyIPTable() {
      const tbody = document.getElementById('proxyip-tbody');
      const countryFilter = document.getElementById('proxyip-filter-country')?.value || '';
      const statusFilter = document.getElementById('proxyip-filter-status')?.value || '';

      let filtered = proxyIPData;
      if (countryFilter) filtered = filtered.filter(p => p.country === countryFilter);
      if (statusFilter) filtered = filtered.filter(p => p.status === statusFilter);

      proxyTableRenderId++;
      const currentRenderId = proxyTableRenderId;

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="py-10 text-center text-on-surface-variant/40"><div class="text-3xl mb-2">☁️</div>هیچ پروکسی آی‌پی‌ای یافت نشد</td></tr>';
        updateSelectionToolbar();
        return;
      }

      tbody.innerHTML = '';
      
      const CHUNK_SIZE = 50;
      let currentIndex = 0;

      function renderChunk() {
        if (currentRenderId !== proxyTableRenderId) return;

        const chunk = filtered.slice(currentIndex, currentIndex + CHUNK_SIZE);
        if (chunk.length === 0) {
          updateSelectionToolbar();
          return;
        }

        const html = chunk.map((p, offset) => {
          const idx = currentIndex + offset;
          const st = p.status === 'active' ? 'on' : (p.status === 'slow' ? 'slow' : (p.status === 'unknown' ? 'unk' : 'off'));
          const stText = p.status === 'active' ? 'فعال' : (p.status === 'slow' ? 'کند' : (p.status === 'unknown' ? 'نامشخص' : 'مرده'));
          const pingTxt = p.status === 'active' || p.status === 'slow' ? (p.ping || 0) + 'ms' : '--';
          const pingCls = (p.ping || 0) > 1500 ? 'error' : ((p.ping || 0) > 500 ? 'mid' : 'good');
          
          let flag = countryName(p.country);
          let loc = p.city ? \`\${p.city}\` : (p.country || 'نامشخص');
          const isSel = proxyIPSelectedRows.has(\`\${p.ip}:\${p.port}\`);
          const key = \`\${p.ip}:\${p.port}\`;

          return \`
          <tr class="group hover:bg-white/5 transition-all \${isSel ? 'bg-primary/5' : ''}">
            <td class="py-4 px-6 text-center">
              <input type="checkbox" class="pip-check proxyip-checkbox rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30" value="\${key}" \${isSel ? 'checked' : ''} onchange="toggleProxyIPSelection(this)">
            </td>
            <td class="py-4 px-6 text-center text-on-surface-variant/60 font-semibold text-xs">\${idx + 1}</td>
            <td class="py-4 px-6 font-mono text-sm tracking-wide text-white">\${p.ip}</td>
            <td class="py-4 px-6 font-mono text-xs text-on-surface-variant/70"><span class="bg-white/5 px-2 py-1 rounded">\${p.port}</span></td>
            <td class="py-4 px-6 text-sm text-on-surface-variant"><span class="mr-2">\${flag}</span> \${loc}</td>
            <td class="py-4 px-6 text-xs text-on-surface-variant/80 max-w-[150px] truncate" title="\${p.isp || ''}">\${p.isp || '-'}</td>
            <td class="py-4 px-6 font-mono font-bold text-xs"><span class="\${pingCls === 'good' ? 'text-tertiary' : (pingCls === 'mid' ? 'text-secondary' : 'text-error')}">\${pingTxt}</span></td>
            <td class="py-4 px-6">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold \${st === 'on' ? 'bg-tertiary/10 text-tertiary' : (st === 'slow' ? 'bg-secondary/10 text-secondary' : (st === 'unk' ? 'bg-white/5 text-on-surface-variant/60' : 'bg-error/10 text-error'))}">
                <span class="w-1.5 h-1.5 rounded-full \${st === 'on' ? 'bg-tertiary' : (st === 'slow' ? 'bg-secondary' : (st === 'unk' ? 'bg-on-surface-variant/60' : 'bg-error'))}"></span>
                \${stText}
              </span>
            </td>
            <td class="py-4 px-6 text-left">
              <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" onclick="testProxyIP('\${p.ip}', \${p.port}, event)" title="تست اتصال">
                  <span class="material-symbols-outlined text-sm">bolt</span>
                </button>
                <button class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors" onclick="deleteProxyIP('\${p.ip}', \${p.port})" title="حذف">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </td>
          </tr>\`;
        }).join('');
        
        tbody.insertAdjacentHTML('beforeend', html);
        currentIndex += CHUNK_SIZE;
        
        // Schedule next chunk
        setTimeout(renderChunk, 5);
      }

      // Start rendering chunks
      renderChunk();
    }
`;

const newRenderFn = `
    let proxyIPSearchVal = '';
    let currentProxyIPPage = 1;
    const PROXY_IP_PER_PAGE = 100;

    function renderProxyIPTable() {
      const tbody = document.getElementById('proxyip-tbody');
      const countryFilter = document.getElementById('proxyip-filter-country')?.value || '';
      const statusFilter = document.getElementById('proxyip-filter-status')?.value || '';

      let filtered = proxyIPData;
      if (countryFilter) filtered = filtered.filter(p => p.country === countryFilter);
      if (statusFilter) filtered = filtered.filter(p => p.status === statusFilter);
      if (proxyIPSearchVal) {
        filtered = filtered.filter(p => {
          const txt = \`\${p.ip} \${p.port} \${p.country || ''} \${p.city || ''} \${p.isp || ''}\`.toLowerCase();
          return txt.includes(proxyIPSearchVal);
        });
      }

      const totalPages = Math.ceil(filtered.length / PROXY_IP_PER_PAGE) || 1;
      if (currentProxyIPPage > totalPages) currentProxyIPPage = totalPages;
      if (currentProxyIPPage < 1) currentProxyIPPage = 1;

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="py-10 text-center text-on-surface-variant/40"><div class="text-3xl mb-2">☁️</div>هیچ پروکسی آی‌پی‌ای یافت نشد</td></tr>';
        document.getElementById('proxyip-pagination').innerHTML = '';
        updateSelectionToolbar();
        return;
      }

      const startIdx = (currentProxyIPPage - 1) * PROXY_IP_PER_PAGE;
      const pageData = filtered.slice(startIdx, startIdx + PROXY_IP_PER_PAGE);

      const html = pageData.map((p, offset) => {
        const idx = startIdx + offset;
        const st = p.status === 'active' ? 'on' : (p.status === 'slow' ? 'slow' : (p.status === 'unknown' ? 'unk' : 'off'));
        const stText = p.status === 'active' ? 'فعال' : (p.status === 'slow' ? 'کند' : (p.status === 'unknown' ? 'نامشخص' : 'مرده'));
        const pingTxt = p.status === 'active' || p.status === 'slow' ? (p.ping || 0) + 'ms' : '--';
        const pingCls = (p.ping || 0) > 1500 ? 'error' : ((p.ping || 0) > 500 ? 'mid' : 'good');
        
        let flag = countryName(p.country);
        let loc = p.city ? \`\${p.city}\` : (p.country || 'نامشخص');
        const isSel = proxyIPSelectedRows.has(\`\${p.ip}:\${p.port}\`);
        const key = \`\${p.ip}:\${p.port}\`;

        return \`
        <tr class="group hover:bg-white/5 transition-all \${isSel ? 'bg-primary/5' : ''}">
          <td class="py-4 px-6 text-center">
            <input type="checkbox" class="pip-check proxyip-checkbox rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30" value="\${key}" \${isSel ? 'checked' : ''} onchange="toggleProxyIPSelection(this)">
          </td>
          <td class="py-4 px-6 text-center text-on-surface-variant/60 font-semibold text-xs">\${idx + 1}</td>
          <td class="py-4 px-6 font-mono text-sm tracking-wide text-white">\${p.ip}</td>
          <td class="py-4 px-6 font-mono text-xs text-on-surface-variant/70"><span class="bg-white/5 px-2 py-1 rounded">\${p.port}</span></td>
          <td class="py-4 px-6 text-sm text-on-surface-variant"><span class="mr-2">\${flag}</span> \${loc}</td>
          <td class="py-4 px-6 text-xs text-on-surface-variant/80 max-w-[150px] truncate" title="\${p.isp || ''}">\${p.isp || '-'}</td>
          <td class="py-4 px-6 font-mono font-bold text-xs"><span class="\${pingCls === 'good' ? 'text-tertiary' : (pingCls === 'mid' ? 'text-secondary' : 'text-error')}">\${pingTxt}</span></td>
          <td class="py-4 px-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold \${st === 'on' ? 'bg-tertiary/10 text-tertiary' : (st === 'slow' ? 'bg-secondary/10 text-secondary' : (st === 'unk' ? 'bg-white/5 text-on-surface-variant/60' : 'bg-error/10 text-error'))}">
              <span class="w-1.5 h-1.5 rounded-full \${st === 'on' ? 'bg-tertiary' : (st === 'slow' ? 'bg-secondary' : (st === 'unk' ? 'bg-on-surface-variant/60' : 'bg-error'))}"></span>
              \${stText}
            </span>
          </td>
          <td class="py-4 px-6 text-left">
            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" onclick="testProxyIP('\${p.ip}', \${p.port}, event)" title="تست اتصال">
                <span class="material-symbols-outlined text-sm">bolt</span>
              </button>
              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors" onclick="deleteProxyIP('\${p.ip}', \${p.port})" title="حذف">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>\`;
      }).join('');
      
      tbody.innerHTML = html;
      updateSelectionToolbar();

      // Update Pagination UI
      const paginationHtml = \`
        <div class="flex items-center justify-between w-full p-4 bg-white/5 border-t border-white/5 text-sm text-on-surface-variant">
          <div>نمایش \${startIdx + 1} تا \${Math.min(startIdx + PROXY_IP_PER_PAGE, filtered.length)} از \${filtered.length} آی‌پی</div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onclick="changeProxyIPPage(-1)" \${currentProxyIPPage === 1 ? 'disabled' : ''}>قبلی</button>
            <span class="px-3">صفحه \${currentProxyIPPage} از \${totalPages}</span>
            <button class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onclick="changeProxyIPPage(1)" \${currentProxyIPPage === totalPages ? 'disabled' : ''}>بعدی</button>
          </div>
        </div>
      \`;
      document.getElementById('proxyip-pagination').innerHTML = paginationHtml;
    }

    function changeProxyIPPage(delta) {
      currentProxyIPPage += delta;
      renderProxyIPTable();
    }
`;

// Replace render fn
content = content.replace(oldRenderFn, newRenderFn);

// 3. Update searchFilter function to support pagination properly
const oldSearchFilter = `
    let searchVal = '';
    function searchFilter(val) {
      searchVal = val.toLowerCase();
      // Apply filters for active page
      const activePage = document.querySelector('.page.active');
      if (activePage.id === 'page-users') {
        const rows = document.querySelectorAll('#users-tbody tr');
        rows.forEach(row => {
          const txt = row.textContent.toLowerCase();
          if (txt.includes(searchVal)) row.style.display = '';
          else row.style.display = 'none';
        });
      } else if (activePage.id === 'page-proxyip') {
        const rows = document.querySelectorAll('#proxyip-tbody tr');
        rows.forEach(row => {
          const txt = row.textContent.toLowerCase();
          if (txt.includes(searchVal)) row.style.display = '';
          else row.style.display = 'none';
        });
      }
    }
`;

const newSearchFilter = `
    let searchVal = '';
    function searchFilter(val) {
      searchVal = val.toLowerCase();
      const activePage = document.querySelector('.page.active');
      if (activePage.id === 'page-users') {
        const rows = document.querySelectorAll('#users-tbody tr');
        rows.forEach(row => {
          const txt = row.textContent.toLowerCase();
          if (txt.includes(searchVal)) row.style.display = '';
          else row.style.display = 'none';
        });
      } else if (activePage.id === 'page-proxyip') {
        proxyIPSearchVal = searchVal;
        currentProxyIPPage = 1;
        renderProxyIPTable();
      }
    }
`;
content = content.replace(oldSearchFilter, newSearchFilter);

fs.writeFileSync('src/templates.js', content);
console.log("Pagination patch applied.");

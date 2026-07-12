const fs = require('fs');
let lines = fs.readFileSync('src/templates.js', 'utf8').split('\n');

const newCode = `    let proxyTableRenderId = 0;

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
        tbody.innerHTML = '<tr><td colspan="9" class="py-10 text-center text-on-surface-variant/40"><div class="text-3xl mb-2">🌍</div>هیچ آی‌پی پروکسیی یافت نشد</td></tr>';
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
          const flag = countryToFlag(p.country);
          const cname = countryName(p.country);
          const loc = p.city ? cname + ' · ' + p.city : cname;
          const key = p.ip + ':' + p.port;
          const isSel = proxyIPSelectedRows.has(key);
          const pingCls = p.ping == null ? '' : (p.ping < 300 ? 'good' : (p.ping < 800 ? 'mid' : 'bad'));
          const pingTxt = p.ping != null ? p.ping + ' ms' : '—';

          return \\\`
        <tr class="group hover:bg-white/5 transition-all \\\${isSel ? 'bg-primary/5' : ''}">
          <td class="py-4 px-6 text-center">
            <input type="checkbox" class="pip-check proxyip-checkbox rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30" value="\\\${key}" \\\${isSel ? 'checked' : ''} onchange="toggleProxyIPSelection(this)">
          </td>
          <td class="py-4 px-6 text-center text-on-surface-variant/60 font-semibold text-xs">\\\${idx + 1}</td>
          <td class="py-4 px-6 font-mono text-sm tracking-wide text-white">\\\${p.ip}</td>
          <td class="py-4 px-6 font-mono text-xs text-on-surface-variant/70"><span class="bg-white/5 px-2 py-1 rounded">\\\${p.port}</span></td>
          <td class="py-4 px-6 text-sm text-on-surface-variant"><span class="mr-2">\\\${flag}</span> \\\${loc}</td>
          <td class="py-4 px-6 text-xs text-on-surface-variant/80 max-w-[150px] truncate" title="\\\${p.isp || ''}">\\\${p.isp || '—'}</td>
          <td class="py-4 px-6 font-mono font-bold text-xs"><span class="\\\${pingCls === 'good' ? 'text-tertiary' : (pingCls === 'mid' ? 'text-secondary' : 'text-error')}">\\\${pingTxt}</span></td>
          <td class="py-4 px-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold \\\${st === 'on' ? 'bg-tertiary/10 text-tertiary' : (st === 'slow' ? 'bg-secondary/10 text-secondary' : (st === 'unk' ? 'bg-white/5 text-on-surface-variant/60' : 'bg-error/10 text-error'))}">
              <span class="w-1.5 h-1.5 rounded-full \\\${st === 'on' ? 'bg-tertiary' : (st === 'slow' ? 'bg-secondary' : (st === 'unk' ? 'bg-on-surface-variant/60' : 'bg-error'))}"></span>
              \\\${stText}
            </span>
          </td>

          <td class="py-4 px-6">
            <div class="flex items-center justify-end gap-2">
              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" onclick="testProxyIP('\\\${p.ip}', \\\${p.port}, event)" title="تست اتصال">
                <span class="material-symbols-outlined text-sm">bolt</span>
              </button>
              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors" onclick="deleteProxyIP('\\\${p.ip}', \\\${p.port})" title="حذف">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>\\\`;
        }).join('');
        
        tbody.insertAdjacentHTML('beforeend', html);
        currentIndex += CHUNK_SIZE;
        
        if (currentIndex < filtered.length) {
          setTimeout(renderChunk, 10);
        } else {
          updateSelectionToolbar();
        }
      }
      
      renderChunk();
    }`;

lines.splice(2514, 2572 - 2514 + 1, newCode);
fs.writeFileSync('src/templates.js', lines.join('\n'));

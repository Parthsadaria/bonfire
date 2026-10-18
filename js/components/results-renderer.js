/**
 * VIRGIL - RESULTS RENDERER
 * Renders search results with richSnippet.cseImage support
 */

export class ResultsRendererComponent {
  constructor({ containerId, metaBarId, countTextId, facetPillsId, onImageClick, onFacetChange }) {
    this.container = document.getElementById(containerId);
    this.metaBar = document.getElementById(metaBarId);
    this.countText = document.getElementById(countTextId);
    this.facetPills = document.getElementById(facetPillsId);
    this.onImageClick = onImageClick;
    this.onFacetChange = onFacetChange;

    this.currentData = null;
    this.activeFacet = 'all';
  }

  render(data, activeFacet = 'all') {
    this.currentData = data;
    this.activeFacet = activeFacet;

    if (!this.container) return;

    if (!data || !data.results || data.results.length === 0) {
      this.renderEmpty();
      return;
    }

    this.renderMeta(data);

    let items = data.results;
    if (activeFacet !== 'all') {
      const filtered = data.results.filter(item => {
        const labels = item.perResultLabels || [];
        return labels.some(l => l.label === activeFacet);
      });
      if (filtered.length > 0) {
        items = filtered;
      }
    }

    this.container.innerHTML = '';
    items.forEach(item => {
      this.container.appendChild(this.buildCard(item));
    });
  }

  renderMeta(data) {
    if (!this.metaBar) return;
    this.metaBar.style.display = 'flex';

    const count = data.cursor?.estimatedResultCount || data.context?.total_results || data.results.length;
    const time = data.cursor?.searchResultTime || '0.09';

    if (this.countText) {
      this.countText.textContent = `${Number(count).toLocaleString()} results (${time}s)`;
    }

    if (this.facetPills) {
      this.facetPills.innerHTML = '';

      const allBtn = document.createElement('button');
      allBtn.className = `facet-btn ${this.activeFacet === 'all' ? 'active' : ''}`;
      allBtn.textContent = 'All';
      allBtn.onclick = () => {
        this.activeFacet = 'all';
        this.onFacetChange?.('all');
      };
      this.facetPills.appendChild(allBtn);

      (data.context?.facets || []).forEach(facet => {
        const btn = document.createElement('button');
        btn.className = `facet-btn ${this.activeFacet === facet.label ? 'active' : ''}`;
        btn.textContent = `${facet.anchor || facet.label} (${facet.count || ''})`;
        btn.onclick = () => {
          this.activeFacet = facet.label;
          this.onFacetChange?.(facet.label);
        };
        this.facetPills.appendChild(btn);
      });
    }
  }

  buildCard(item) {
    const card = document.createElement('article');
    card.className = 'result-card';

    const imageSrc = item.richSnippet?.cseImage?.src || item.richSnippet?.metatags?.ogImage || null;
    const crumbs = (item.breadcrumbUrl?.crumbs || []).join(' › ');

    const labels = item.perResultLabels || [];
    const isDirect = labels.some(l => l.label === 'direct') || (item.contentNoFormatting || '').toLowerCase().includes('direct');
    const isTorrent = labels.some(l => l.label === 'torrent') || (item.contentNoFormatting || '').toLowerCase().includes('torrent');

    let thumbHtml = '';
    if (imageSrc) {
      thumbHtml = `
        <div class="thumb-box" data-src="${this.escape(imageSrc)}">
          <img src="${this.escape(imageSrc)}" alt="" loading="lazy" />
        </div>
      `;
    } else {
      thumbHtml = `
        <div class="thumb-box">
          <span class="thumb-empty">No preview</span>
        </div>
      `;
    }

    let typeTag = '<span class="type-tag generic">Link</span>';
    if (isDirect) typeTag = '<span class="type-tag direct">Direct</span>';
    else if (isTorrent) typeTag = '<span class="type-tag torrent">Torrent</span>';

    const rawUrl = item.unescapedUrl || item.url || item.clicktrackUrl || '';
    const targetUrl = this.unwrapUrl(rawUrl);
    const domain = this.getHostname(targetUrl) || item.visibleUrl || 'link';

    card.innerHTML = `
      ${thumbHtml}
      <div class="result-content">
        <a href="${this.escape(targetUrl)}" class="result-title-link" target="_blank" rel="noopener noreferrer">
          ${item.title || item.titleNoFormatting}
        </a>
        <div class="result-meta">
          <span class="domain-tag">${this.escape(domain)}</span>
          ${crumbs ? `<span>${this.escape(crumbs)}</span>` : ''}
        </div>
        <div class="result-snippet">
          ${item.content || item.contentNoFormatting}
        </div>
        <div class="card-bottom">
          ${typeTag}
          <div class="card-actions">
            <button type="button" class="action-btn copy-btn" data-url="${this.escape(targetUrl)}">Copy link</button>
            <a href="${this.escape(targetUrl)}" class="action-btn" target="_blank" rel="noopener noreferrer">Open ↗</a>
          </div>
        </div>
      </div>
    `;

    const thumb = card.querySelector('.thumb-box[data-src]');
    if (thumb) {
      thumb.onclick = (e) => {
        e.stopPropagation();
        this.onImageClick?.(imageSrc, item.titleNoFormatting);
      };
    }

    const copyBtn = card.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        const url = copyBtn.getAttribute('data-url');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            copyBtn.textContent = 'Copied';
            setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 1500);
          });
        }
      };
    }

    return card;
  }

  renderEmpty() {
    if (this.metaBar) this.metaBar.style.display = 'none';
    if (this.container) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-dim);">
          No results found. Try other keywords or clear active filters.
        </div>
      `;
    }
  }

  unwrapUrl(rawUrl) {
    if (!rawUrl) return '';
    try {
      const parsed = new URL(rawUrl);
      if ((parsed.hostname === 'www.google.com' || parsed.hostname === 'google.com') && parsed.pathname.startsWith('/url')) {
        const target = parsed.searchParams.get('q') || parsed.searchParams.get('url');
        if (target && /^https?:\/\//i.test(target)) {
          return target;
        }
      }
    } catch {}
    return rawUrl;
  }

  getHostname(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

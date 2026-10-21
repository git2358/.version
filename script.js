async function getVersion() {
  const files = [
    new URL(location.pathname, location.origin).href,
    ...Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
      .map(link => new URL(link.getAttribute('href'), location.href).href)
      .filter(url => new URL(url).origin === location.origin),
    ...Array.from(document.querySelectorAll('script[src]'))
      .map(script => new URL(script.getAttribute('src'), location.href).href)
      .filter(url => new URL(url).origin === location.origin)
  ];
  const uniqueFiles = [...new Set(files)];
  const contents = await Promise.all(uniqueFiles.map(async url => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to read ' + url);
    return url.replace(location.origin, '') + '\n' + await response.text();
  }));
  const source = contents.join('\n\n');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const version = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 16);
  document.querySelectorAll('.version, .version-left, .version-right').forEach(el => {
    el.textContent = version;
  });
}

getVersion().catch(error => console.error('Could not generate version hash:', error));
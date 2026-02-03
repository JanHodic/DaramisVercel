const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all IE browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)',
  }

  const adminCanonicalRedirect = {
    source: '/admin/:path*',
    has: [
      {
        type: 'host',
        value: '(?!daramis-vercel\\.vercel\\.app$).*',
      },
    ],
    destination: 'https://daramis-vercel.vercel.app/admin/:path*',
    permanent: false,
  }

  return [internetExplorerRedirect, adminCanonicalRedirect]
}

export default redirects
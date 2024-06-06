import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk&amp;display=swap" rel="stylesheet" data-optimized-fonts="true" />
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&amp;family=Chakra+Petch:wght@600&amp;display=swap" rel="stylesheet" data-optimized-fonts="true" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

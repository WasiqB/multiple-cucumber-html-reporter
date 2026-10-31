import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  PageLastUpdate,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { createMetadata, getPageImageUrl } from '@/lib/metadata';
import { baseUrl, gitConfig } from '@/lib/shared';
import { getPageMarkdownUrl, source } from '@/lib/source';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const { body: MDX, lastModified } = page.data;
  const markdownUrl = getPageMarkdownUrl(page).url;

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl.toString(),
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Documentation',
      item: new URL('/docs', baseUrl).toString(),
    },
    ...(page.slugs.length > 0
      ? [
          {
            '@type': 'ListItem',
            position: 3,
            name: page.data.title,
            item: new URL(page.url, baseUrl).toString(),
          },
        ]
      : []),
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className='mb-0'>{page.data.description}</DocsDescription>
      <div className='flex flex-row gap-2 items-center border-b pb-6'>
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      {lastModified && <PageLastUpdate date={lastModified} />}
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const { slug = [] } = await props.params;
  const page = source.getPage(slug);
  if (!page) {
    return createMetadata({
      title: 'Not Found',
    });
  }

  const canonicalUrl = new URL(page.url, baseUrl).toString();
  const image = {
    url: getPageImageUrl(page).url,
    width: 1200,
    height: 630,
  };

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${page.data.title} | Multiple Cucumber HTML Reporter`,
      description: page.data.description,
      url: canonicalUrl,
      images: [image],
    },
    twitter: {
      images: [image],
    },
  };
}

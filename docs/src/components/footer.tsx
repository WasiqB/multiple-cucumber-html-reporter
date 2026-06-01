import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-10 px-6', className)}>
      <div className='container mx-auto flex flex-col md:flex-row justify-between items-center gap-8'>
        <div className='flex flex-col gap-2 text-center md:text-left'>
          <div className='flex flex-col items-center justify-center leading-[0.8] py-1 select-none group cursor-default'>
            <span className='text-[10px] font-black uppercase tracking-[0.45em] text-emerald-600/80 dark:text-emerald-400/80 group-hover:text-emerald-500 transition-colors duration-300'>
              multiple
            </span>
            <span className='text-xl font-black tracking-tighter text-slate-900 dark:text-slate-100'>
              Cucumber<span className='text-emerald-500'>HTML</span>
            </span>
            <span className='text-[10px] font-black uppercase tracking-[0.62em] text-emerald-600/80 dark:text-emerald-400/80 group-hover:text-emerald-500 transition-colors duration-300'>
              reporter
            </span>
          </div>
          <p className='text-sm text-zinc-500'>
            © {new Date().getFullYear()} Wasiq Bhamla. Open source under MIT License.
          </p>
        </div>
        <div className='flex flex-wrap justify-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400'>
          <Link href='/docs' className='hover:text-emerald-500 transition-colors'>
            Documentation
          </Link>
          <Link
            href='https://github.com/WasiqB/multiple-cucumber-html-reporter/releases'
            className='hover:text-emerald-500 transition-colors'
          >
            Changelog
          </Link>
          <Link href='/sponsors' className='hover:text-emerald-500 transition-colors'>
            Sponsor
          </Link>
          <Link
            href='https://github.com/WasiqB/multiple-cucumber-html-reporter/tree/main/.github/CONTRIBUTING.md'
            className='hover:text-emerald-500 transition-colors'
          >
            Contributing
          </Link>
        </div>
      </div>
    </footer>
  );
}

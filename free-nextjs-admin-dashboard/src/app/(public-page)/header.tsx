import UserDropdown from '@/app/(public-page)/components/UserDropdown';
import Link from 'next/link';
const menuItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Flashcard',
    href: '/flashcard',
  },
  {
    label: 'Trắc nghiệm',
    href: '/quiz',
  },
  {
    label: 'Dịch câu',
    href: '/translate-sentence',
  },
  {
    label: 'Ôn tập',
    href: '/practice',
  },
];

function Header() { 
  return (
    <div className='flex relative justify-center gap-2 items-center px-6 py-4 sticky top-0 z-50 bg-white border-gray-200 dark:border-gray-800 dark:bg-gray-900 lg:border-b'>
         {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className='hover:text-brand-500 mx-4'>
                {item.label}
            </Link>
         ))}
         <div className='absolute right-0 top-[50%] translate-y-[-50%]'>
          <UserDropdown />
         </div>
    </div>
  )
}

export default Header;



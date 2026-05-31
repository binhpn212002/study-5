import Image from 'next/image';

const Advertisement = () => {
  return (
    <div className='box-advertisement rounded-lg border border-gray-200 dark:border-gray-800'>
      <a
        href='https://example.com'
        target='_blank'
        rel='noopener noreferrer'
        className='block cursor-pointer'
      >
        <Image src='/images/advertisement.png' alt='Advertisement' width={100} height={100} />
      </a>
      <p className='text-sm text-gray-500 dark:text-gray-400'>Advertisement</p>
    </div>
  );
};

export default Advertisement;
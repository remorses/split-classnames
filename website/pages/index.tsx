import Head from 'next/head'
import gradientBg from '../public/bg_gradient.svg'
console.log(gradientBg.src)
export default function Home() {
    return (
        <div className='flex flex-col text-gray-200 items-center  min-h-screen py-2 w-full'>
            <div
                className='absolute mx-auto h-[800px] top-[700px] w-[100vw] left-0 right-0 2xl:scale-x-150'
                style={{
                    backgroundImage: `url("${gradientBg.src}")`,
                    backgroundSize: 'auto',
                    backgroundPosition: 'center top',
                }}
            />
            <div className='max-w-screen-2xl mx-auto w-full px-8'>
                <Header
                    navs={[
                        { content: 'home', url: '#' },
                        { content: 'Buy', url: '#' },
                    ]}
                />
                <Hero />
            </div>
        </div>
    )
}

function Logo({}) {
    return (
        <div className='flex items-center space-x-4'>
            <svg
                width={95}
                height={94}
                viewBox='0 0 95 94'
                className='w-6 h-auto text-indigo-400'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
            >
                <path d='M96 0V47L48 94H0V47L48 0H96Z' />
            </svg>
            <div className=''>Flowrift</div>
        </div>
    )
}

function Header({ navs }) {
    return (
        <header className='relative flex space-x-6 justify-start items-center py-4 md:py-8 mb-8 md:mb-12 xl:mb-16'>
            {/* logo - start */}
            <a
                href='/'
                className='inline-flex items-center text-2xl md:text-3xl font-bold gap-2.5'
                aria-label='logo'
            >
                <Logo />
            </a>
            <div className='flex-auto' />
            <nav className='hidden lg:flex gap-12'>
                {navs.map((nav, i) => (
                    <a
                        key={'nav' + i}
                        href={nav.url}
                        className='hover:text-indigo-400 active:text-indigo-300 text-lg font-semibold transition duration-100'
                    >
                        {nav.content}
                    </a>
                ))}
            </nav>
            {/* nav - end */}
            {/* buttons - start */}
            <a
                href='#'
                className='hidden !ml-12 text-gray-700 lg:inline-block bg-gray-200 hover:bg-gray-300 focus-visible:ring ring-indigo-300 -sm md:text-base font-semibold text-center rounded-lg outline-none transition duration-100 px-4 py-2'
            >
                Contact Sales
            </a>
            <button
                type='button'
                className='inline-flex text-gray-700 items-center lg:hidden bg-gray-200 hover:bg-gray-300 focus-visible:ring ring-indigo-300  text-sm md:text-base font-semibold rounded-lg gap-2 px-2.5 py-2'
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                >
                    <path
                        fillRule='evenodd'
                        d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                        clipRule='evenodd'
                    />
                </svg>
                Menu
            </button>
            {/* buttons - end */}
        </header>
    )
}

function Hero({}) {
    return (
        <section className='relative flex flex-col lg:flex-row justify-between gap-6 sm:gap-10 md:gap-16'>
            {/* content - start */}
            <div className='xl:w-5/12 flex flex-col justify-center sm:text-center lg:text-left lg:py-12 xl:py-24'>
                <p className='text-indigo-400 md:text-lg xl:text-xl font-semibold mb-4 md:mb-6'>
                    Very proud to introduce
                </p>
                <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold mb-8 md:mb-12'>
                    Revolutionary way to build the web
                </h1>
                <p className='lg:w-4/ xl:text-lg mx-auto lg:mx-0 max-w-xl leading-relaxed mb-8 md:mb-12'>
                    This is a section of some simple filler text, also known as
                    placeholder text. It shares some characteristics of a real
                    written text but is random.
                </p>
                <div className='flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-2.5'>
                    <a
                        href='#'
                        className='inline-block bg-indigo-700 hover:bg-indigo-900 active:bg-indigo-900 focus-visible:ring ring-indigo-300 text-white text-sm md:text-base font-semibold text-center rounded-lg outline-none transition duration-100 px-8 py-3'
                    >
                        Start now
                    </a>
                    <a
                        href='#'
                        className='inline-block text-gray-800 bg-gray-200 hover:bg-gray-300 focus-visible:ring ring-indigo-300 opacity-50 active:opacity-70 text-sm md:text-base font-semibold text-center rounded-lg outline-none transition duration-100 px-8 py-3'
                    >
                        Take tour
                    </a>
                </div>
            </div>
            {/* content - end */}
            {/* image - start */}
            {/* <div className='xl:w-5/12 h-48 lg:h-auto bg-gray-100 overflow-hidden shadow-lg rounded-lg'>
                <img
                    src=''
                    loading='lazy'
                    alt='Photo by Fakurian Design'
                    className='w-full h-full object-cover object-center'
                />
            </div> */}
            {/* image - end */}
        </section>
    )
}

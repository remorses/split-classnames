import Head from 'next/head'
import throttle from 'lodash/throttle'
import { transformSource as ssrTransformSource } from 'codemod-split-classnames/src'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Script from 'next/script'
import gradientBg from '../public/bg_gradient.svg'
import { Link } from '@app/components/Link'
import NextLink from 'next/link'
import clsx from 'classnames'
import { Footer } from '@app/components/Footer'
import { CodeEditor } from '@app/components/CodeEditor'
import { GetStaticProps } from 'next'
console.log(gradientBg.src)

export default function Home({ transformedCode }) {
    return (
        <div className='flex space-y-8 flex-col text-gray-200 items-center  py-2 w-full'>
            <Script src='https://gumroad.com/js/gumroad.js'></Script>

            <WavesBg />
            <div className='max-w-screen-2xl flex flex-col mx-auto w-full px-8 min-h-screen'>
                <Header
                    navs={[
                        { content: 'home', url: '#' },
                        { content: 'Buy', url: '#' },
                    ]}
                />
                <Hero />
                <CodeComparison transformedCode={transformedCode} />
                <div className='flex-1' />
                <Footer
                    justifyAround
                    className='!mt-24'
                    businessName='Notaku'
                />
            </div>
        </div>
    )
}

export const getStaticProps: GetStaticProps = async function getStaticProps() {
    try {
        const transformedCode = ssrTransformSource(CODE_BEFORE, {})
        return {
            props: {
                transformedCode,
            },
        }
    } catch (e) {
        return {
            props: {
                transformedCode: '',
            },
        }
    }
}

export function WavesBg({ top = 700, className = '' }) {
    return (
        <div
            className={clsx(
                className,
                'absolute mx-auto h-[500px] w-[100vw] left-0 right-0 2xl:scale-x-150',
            )}
            style={{
                backgroundImage: `url("${gradientBg.src}")`,
                backgroundSize: 'auto',
                top,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center top',
            }}
        />
    )
}

function GumroadCheckout() {
    return (
        <div className='relative flex flex-col items-center mt-20 z-50'>
            <div className=' gumroad-product-embed'>
                <a href='https://gumroad.com/l/nNrvI'>Loading...</a>
            </div>
        </div>
    )
}

function GumroadButton({ className = '' }) {
    return (
        <div className={clsx('relative flex flex-col', className)}>
            <a className='gumroad-button' href='https://gumroad.com/l/nNrvI'>
                Buy License Key
            </a>
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

            {/* <GumroadButton className='!ml-12 scale-90' /> */}
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

function Hero() {
    return (
        <section className='relative flex flex-col items-center'>
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
            <div className=''>
                <GumroadButton />
            </div>
        </section>
    )
}

function CodeComparison({ transformedCode }) {
    const [code, setCode] = useState(CODE_BEFORE)
    const [codeAfter, setCodeAfter] = useState(transformedCode)

    const transformSource = useRef<Function>()

    useEffect(() => {
        try {
            import('codemod-split-classnames/src').then(
                (m) => (transformSource.current = m.transformSource),
            )
        } catch (e) {
            console.error('error importing transform', e)
        }
    }, [])
    function safeTransformSource(code = '') {
        try {
            if (!transformSource.current) {
                return code
            }
            const res = transformSource.current(code)
            return res
        } catch (e) {
            console.error('error transforming', e)
            return code
        }
    }
    const throttledEffect = throttle(() => {
        const res = safeTransformSource(code)
        // console.log({ res })
        setCodeAfter(res)
    }, 400)
    useEffect(throttledEffect, [code])

    return (
        <div className='relative flex flex-col items-center mt-12'>
            <div className='relative'>
                <CodeEditor onChange={(x) => setCode(x)} code={code} />
                <Arrow
                    style={{ transform: 'scaleX(-1) rotate(70deg)' }}
                    className='text-gray-300 fill-current absolute h-24 z-10 right-0 -bottom-10'
                />
            </div>
            <CodeEditor readOnly code={codeAfter} />
        </div>
    )
}

const CODE_BEFORE = `

function Hero() {
  return (
      <section className='relative flex flex-col items-center'>
          <p className='text-indigo-400 md:text-lg xl:text-xl font-semibold mb-4 md:mb-6 relative flex flex-col items-center relative flex flex-col items-center relative flex flex-col items-center'>
              Very proud to introduce
          </p>
      </section>
  )
}
`

function Arrow({ className = '', ...rest }) {
    return (
        <svg
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            xmlnsXlink='http://www.w3.org/1999/xlink'
            x='0px'
            y='0px'
            width='415.262px'
            height='415.261px'
            viewBox='0 0 415.262 415.261'
            xmlSpace='preserve'
            className={className}
            {...rest}
        >
            <g>
                <path
                    d='M414.937,374.984c-7.956-24.479-20.196-47.736-30.601-70.992c-1.224-3.06-6.12-3.06-7.956-1.224
		c-10.403,11.016-22.031,22.032-28.764,35.496h-0.612c-74.664,5.508-146.88-58.141-198.288-104.652
		c-59.364-53.244-113.22-118.116-134.64-195.84c-1.224-9.792-2.448-20.196-2.448-30.6c0-4.896-6.732-4.896-7.344,0
		c0,1.836,0,3.672,0,5.508C1.836,12.68,0,14.516,0,17.576c0.612,6.732,2.448,13.464,3.672,20.196
		C8.568,203.624,173.808,363.356,335.376,373.76c-5.508,9.792-10.403,20.195-16.523,29.988c-3.061,4.283,1.836,8.567,6.12,7.955
		c30.6-4.283,58.14-18.972,86.292-29.987C413.712,381.104,416.16,378.656,414.937,374.984z M332.928,399.464
		c3.673-7.956,6.12-15.912,10.404-23.868c1.225-3.061-0.612-5.508-2.448-6.12c0-1.836-1.224-3.061-3.06-3.672
		c-146.268-24.48-264.996-124.236-309.06-259.489c28.764,53.244,72.828,99.756,116.28,138.924
		c31.824,28.765,65.484,54.468,102.204,75.888c28.764,16.524,64.872,31.824,97.92,21.421l0,0c-1.836,4.896,5.508,7.344,7.956,3.672
		c7.956-10.404,15.912-20.196,24.48-29.376c8.567,18.972,17.748,37.943,24.479,57.527
		C379.44,382.94,356.796,393.956,332.928,399.464z'
                />
            </g>
        </svg>
    )
}

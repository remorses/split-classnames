import clsx from 'classnames'
import React, { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from './Link'
import NextLink from 'next/link'

export type FooterProps = {
    columns?: { [k: string]: ReactNode[] }
    businessName?: string
    justifyAround?: boolean
} & ComponentPropsWithoutRef<'div'>

export function Footer({
    className = '',
    columns = {
        Resources: [
            <NextLink passHref href='/docs'>
                <Link>Quick start</Link>
            </NextLink>,
        ],
        Company: [
            <Link target='_blank' href='https://twitter.com/__morse'>
                Twitter
            </Link>,
        ],
        'Who made this?': [
            <Link href='https://twitter.com/__morse'>Twitter</Link>,
            <Link href='https://github.com/remorses/split-classnames'>Github</Link>,
        ],
    },
    justifyAround = false,
    businessName = 'Notaku',
    ...rest
}: FooterProps) {
    return (
        <div
            className={clsx(
                'opacity-90 font-medium text-sm py-10 min-h-[40px] max-w-[var(--pageWidth)] mx-auto w-full',
                className,
            )}
            {...rest}
        >
            <div
                className={clsx(
                    'flex flex-col items-stretch space-y-10 lg:flex-row lg:space-x-10 lg:space-y-0',
                    justifyAround ? 'justify-around' : 'justify-between',
                )}
            >
                {Object.keys(columns).map((k, i) => {
                    return (
                        <div
                            className='min-w-full space-y-6 lg:min-w-0'
                            key={i}
                        >
                            <div className='block w-auto font-medium text-left'>
                                {k}
                            </div>
                            {columns[k].map((x, i) => (
                                <div className='opacity-60' key={i}>
                                    {x}
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

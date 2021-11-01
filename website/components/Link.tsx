import NextLink from 'next/link'
import cs from 'classnames'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/dist/client/router'

export const Link = ({
    href,
    className,
    ...props
}: React.ComponentPropsWithoutRef<'a'>) => {
    const isExternal = href.startsWith('http')
    const { activeClass, eventHandlers } = useActiveClass({
        className: '!opacity-40',
        time: 400,
        removeOnRouteComplete: !isExternal,
    })

    if (isExternal) {
        return (
            <a
                target='_blank'
                href={href}
                className={cs('', activeClass, className)}
                {...eventHandlers}
                {...props}
            />
        )
    }

    return (
        <NextLink href={(href || '') as string} passHref>
            <a
                className={cs('transition-opacity', activeClass, className)}
                {...eventHandlers}
                {...props}
            />
        </NextLink>
    )
}

export function useActiveClass({
    className = '!opacity-100',
    time = 400,
    removeOnRouteComplete = false,
}) {
    const [activeClass, setActiveClass] = useState('')
    function onActive() {
        if (!className) {
            return
        }
        setActiveClass(className)
        if (!removeOnRouteComplete) {
            setTimeout(() => {
                setActiveClass('')
            }, time)
        }
    }
    const router = useRouter()
    useEffect(() => {
        if (!removeOnRouteComplete) {
            return
        }
        function onComplete() {
            setActiveClass('')
        }
        router.events.on('routeChangeComplete', onComplete)
        return () => {
            router.events.off('routeChangeComplete', onComplete)
        }
    }, [])
    return {
        activeClass,
        eventHandlers: { onPointerDown: onActive, onTouchStart: onActive },
    }
}

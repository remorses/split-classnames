import { Footer } from '@app/components/Footer'
import { Link } from '@app/components/Link'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/dist/client/router'
import React from 'react'
import { WavesBg } from '.'
import fetch from 'node-fetch'
import { CodeEditor } from '@app/components/CodeEditor'

export default function Success({ licenseKey }) {
    const router = useRouter()
    return (
        <div className='flex flex-col items-center w-full py-2 text-gray-200'>
            <WavesBg top={400} />
            <div className='!pt-24 max-w-screen-2xl flex flex-col mx-auto w-full px-8 min-h-screen'>
                <section className='relative flex flex-col items-center space-y-6'>
                    <h1 className='mb-8 text-4xl font-bold sm:text-5xl md:text-6xl md:mb-12'>
                        Thank you for purchasing!
                    </h1>
                    <p className='max-w-xl mx-auto leading-relaxed'>
                        You can now download the vscode extension{' '}
                        <Link className='underline' href=''>
                            here
                        </Link>
                    </p>
                    <p className='max-w-xl mx-auto leading-relaxed'>
                        Your license key is:{' '}
                        <span className='px-2 py-2 ml-3 font-mono text-sm font-bold text-gray-800 bg-gray-300 rounded-sm'>
                            {licenseKey}
                        </span>
                    </p>
                    <p className='max-w-xl mx-auto text-sm font-medium leading-relaxed opacity-60'>
                        A copy of your license key has also been sent to the
                        email you used on Gumroad
                    </p>
                </section>
                <div className='flex-auto' />
                <Footer justifyAround />
            </div>
        </div>
    )
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
    const saleId = (query?.sale_id || '') as string
    const licenseKey = await getLicenseKey(saleId)

    return {
        props: {
            licenseKey,
        },
    }
}

async function getLicenseKey(saleId: string) {
    const accessToken = process.env.GUMROAD_ACCESS_TOKEN
    if (!accessToken) {
        throw new Error('Gumroad access token is not set')
    }

    const response = await fetch(`https://api.gumroad.com/v2/sales/${saleId}`, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        // body: JSON.stringify({
        //     access_token: accessToken,
        // }),
        method: 'GET',
    })

    const data: any = await response.json()
    if (data?.success) {
        return data?.sale?.license_key || ''
    } else {
        console.error(data)
        return ''
    }
}
